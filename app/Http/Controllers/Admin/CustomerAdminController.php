<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\License;
use App\Models\Conversation;
use App\Models\Message;

class CustomerAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = User::whereNotNull('uuid');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('uuid', 'like', "%{$search}%")
                  ->orWhereHas('licenses', function ($lq) use ($search) {
                      $lq->where('license_key', 'like', "%{$search}%");
                  });
            });
        }

        $customers = $query->with(['license', 'conversation.latestMessage'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.customers.index', compact('customers'));
    }

    public function show($uuid)
    {
        $customer = User::where('uuid', $uuid)->with(['licenses', 'conversation.messages'])->firstOrFail();
        $conversation = Conversation::firstOrCreate(['user_id' => $customer->uuid]);
        $messages = Message::where('conversation_id', $conversation->id)->orderBy('created_at', 'asc')->get();

        return view('admin.customers.show', compact('customer', 'conversation', 'messages'));
    }

    protected function parseDurationSeconds(Request $request, int $defaultSeconds = 31536000): int
    {
        $preset = $request->input('duration_preset');
        if ($preset === 'custom') {
            $val = max(1, (int)$request->input('custom_duration_value', 1));
            $unit = $request->input('custom_duration_unit', 'minutes');
            return match ($unit) {
                'seconds' => $val,
                'minutes' => $val * 60,
                'hours'   => $val * 3600,
                'days'    => $val * 86400,
                default   => $val * 60,
            };
        }

        if (is_numeric($preset) && (int)$preset > 0) {
            return (int)$preset;
        }

        return $defaultSeconds;
    }

    protected function formatDurationLabel(int $seconds): string
    {
        if ($seconds < 60) {
            return "{$seconds} Seconds";
        }
        if ($seconds < 3600) {
            $mins = round($seconds / 60);
            return "{$mins} Minute" . ($mins > 1 ? 's' : '');
        }
        if ($seconds < 86400) {
            $hrs = round($seconds / 3600);
            return "{$hrs} Hour" . ($hrs > 1 ? 's' : '');
        }
        $days = round($seconds / 86400);
        return "{$days} Day" . ($days > 1 ? 's' : '');
    }

    public function assignLicense(Request $request, $uuid)
    {
        $customer = User::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'license_key' => 'nullable|string|max:100',
            'status'      => 'nullable|in:pending,active,inactive',
        ]);

        $key = $request->input('license_key') ?: strtoupper('LIC-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));
        $status = $request->input('status', 'pending');
        $durationSeconds = $this->parseDurationSeconds($request, 31536000);
        $durationLabel = $this->formatDurationLabel($durationSeconds);

        $activatedAt = ($status === 'active') ? now() : null;
        $expiresAt   = ($status === 'active') ? now()->addSeconds($durationSeconds) : null;

        // Create or update license for this customer UUID
        $license = License::create([
            'user_id'          => $customer->uuid,
            'license_key'      => $key,
            'status'           => $status,
            'duration_seconds' => $durationSeconds,
            'activated_at'     => $activatedAt,
            'expires_at'       => $expiresAt,
        ]);

        // Keep AppClient in sync with license status
        $appClientQuery = \App\Models\AppClient::where('session_id', $customer->uuid);
        if ($customer->phone) {
            $appClientQuery->orWhere('phone', $customer->phone);
        }
        $appClientQuery->update([
            'is_active'  => ($status === 'active'),
            'expires_at' => $expiresAt,
        ]);

        // Send activation card into user's support chat
        $conversation = Conversation::firstOrCreate(['user_id' => $customer->uuid]);

        Message::create([
            'conversation_id' => $conversation->id,
            'session_id'      => $customer->uuid,
            'sender'          => 'admin',
            'sender_type'     => 'admin',
            'sender_id'       => 'admin',
            'sender_name'     => 'System Admin',
            'message'         => "🔑 License Key Assigned ({$durationLabel})\nKey: {$key}\nDuration: {$durationLabel}\nStatus: " . ucfirst($status),
            'license_key'     => $key,
            'is_license_card' => true,
        ]);

        return redirect()->back()->with('success', "License Key {$key} ({$durationLabel}, Status: {$status}) assigned successfully!");
    }

    public function updateLicenseStatus(Request $request, $licenseId)
    {
        $request->validate([
            'status' => 'required|in:inactive,pending,active,expired,revoked',
        ]);

        $license = License::findOrFail($licenseId);
        $status = $request->input('status');
        $data = ['status' => $status];

        $customer = User::where('uuid', $license->user_id)->orWhere('phone', $license->user_id)->first();
        $durationSeconds = $this->parseDurationSeconds($request, $license->duration_seconds ?: 31536000);
        $data['duration_seconds'] = $durationSeconds;

        if ($status === 'active') {
            $activatedAt = now();
            $expiresAt   = now()->addSeconds($durationSeconds);
            $data['activated_at'] = $activatedAt;
            $data['expires_at']   = $expiresAt;

            $appClientQuery = \App\Models\AppClient::where('session_id', $license->user_id);
            if ($customer && $customer->phone) {
                $appClientQuery->orWhere('phone', $customer->phone);
            }
            $appClientQuery->update([
                'is_active'      => true,
                'is_uninstalled' => false,
                'expires_at'     => $expiresAt,
            ]);
            if ($customer) {
                $customer->update(['is_uninstalled' => false]);
            }
        } elseif (in_array($status, ['expired', 'inactive', 'revoked'])) {
            if ($status === 'expired') {
                $data['expires_at'] = now()->subSecond();
            }
            $appClientQuery = \App\Models\AppClient::where('session_id', $license->user_id);
            if ($customer && $customer->phone) {
                $appClientQuery->orWhere('phone', $customer->phone);
            }
            $appClientQuery->update([
                'is_active'  => false,
                'expires_at' => $data['expires_at'] ?? $license->expires_at,
            ]);
        } elseif ($status === 'pending') {
            $data['activated_at'] = null;
            $data['expires_at']   = null;
            $appClientQuery = \App\Models\AppClient::where('session_id', $license->user_id);
            if ($customer && $customer->phone) {
                $appClientQuery->orWhere('phone', $customer->phone);
            }
            $appClientQuery->update([
                'is_active' => false,
            ]);
        }

        $license->update($data);
        $durationLabel = $this->formatDurationLabel($durationSeconds);

        return redirect()->back()->with('success', "License status updated to {$status} ({$durationLabel}).");
    }

    public function quickActivate(Request $request, $uuid)
    {
        $customer = User::where('uuid', $uuid)->firstOrFail();
        $durationSeconds = $this->parseDurationSeconds($request, 31536000);
        $activatedAt = now();
        $expiresAt   = now()->addSeconds($durationSeconds);
        $durationLabel = $this->formatDurationLabel($durationSeconds);

        $license = License::where('user_id', $customer->uuid)->latest()->first();
        $key = $license ? $license->license_key : (string) rand(100000, 999999);

        if (!$license) {
            $license = License::create([
                'user_id'          => $customer->uuid,
                'license_key'      => $key,
                'status'           => 'active',
                'duration_seconds' => $durationSeconds,
                'activated_at'     => $activatedAt,
                'expires_at'       => $expiresAt,
            ]);
        } else {
            $license->update([
                'status'           => 'active',
                'duration_seconds' => $durationSeconds,
                'activated_at'     => $activatedAt,
                'expires_at'       => $expiresAt,
            ]);
        }

        $customer->update(['is_uninstalled' => false]);

        // Sync AppClient
        $appClientQuery = \App\Models\AppClient::where('session_id', $customer->uuid);
        if ($customer->phone) {
            $appClientQuery->orWhere('phone', $customer->phone);
        }
        $appClientQuery->update([
            'is_active'      => true,
            'is_uninstalled' => false,
            'expires_at'     => $expiresAt,
        ]);

        // Send activation card into user's support chat
        $conversation = Conversation::firstOrCreate(['user_id' => $customer->uuid]);
        Message::create([
            'conversation_id' => $conversation->id,
            'session_id'      => $customer->uuid,
            'sender'          => 'admin',
            'sender_type'     => 'admin',
            'sender_id'       => 'admin',
            'sender_name'     => 'System Admin',
            'message'         => "[LICENSE_CARD:key={$key}|days=365|seconds={$durationSeconds}]\n🔑 আপনার অ্যাকাউন্টটি সক্রিয় করা হয়েছে!\nলাইসেন্স কি: {$key} ({$durationLabel})\nনিচে 'Attiva Licenza (অ্যাক্টিভ করুন)' বাটনে ক্লিক করে অ্যাপের সম্পূর্ণ সুবিধা উপভোগ করুন।",
            'license_key'     => $key,
            'is_license_card' => true,
        ]);

        return redirect()->back()->with('success', "গ্রাহক {$customer->name} ({$customer->phone}) সফলভাবে সক্রিয় করা হয়েছে! চ্যাটে অ্যাক্টিভেশন কার্ড পাঠানো হয়েছে।");
    }

    public function deactivate(Request $request, $uuid)
    {
        $customer = User::where('uuid', $uuid)->firstOrFail();
        $license = License::where('user_id', $customer->uuid)->latest()->first();
        if ($license) {
            $license->update(['status' => 'inactive']);
        }
        $customer->update(['is_uninstalled' => true]);

        $appClientQuery = \App\Models\AppClient::where('session_id', $customer->uuid);
        if ($customer->phone) {
            $appClientQuery->orWhere('phone', $customer->phone);
        }
        $appClientQuery->update([
            'is_active'      => false,
            'is_uninstalled' => true,
        ]);

        return redirect()->back()->with('success', "গ্রাহক {$customer->name} সফলভাবে নিষ্ক্রিয় করা হয়েছে।");
    }

    public function sendMessage(Request $request, $uuid)
    {
        $request->validate(['message' => 'required|string']);
        $customer = User::where('uuid', $uuid)->firstOrFail();
        $conversation = Conversation::firstOrCreate(['user_id' => $customer->uuid]);

        Message::create([
            'conversation_id' => $conversation->id,
            'session_id'      => $customer->uuid,
            'sender'          => 'admin',
            'sender_type'     => 'admin',
            'sender_id'       => 'admin',
            'sender_name'     => 'Admin Support',
            'message'         => trim($request->input('message')),
        ]);

        return redirect()->back()->with('success', 'Message sent successfully.');
    }
}
