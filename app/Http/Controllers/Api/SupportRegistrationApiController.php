<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Conversation;
use App\Models\License;

class SupportRegistrationApiController extends Controller
{
    public function register(Request $request)
    {
        $firstName = trim($request->input('first_name') ?: $request->input('firstName') ?: '');
        $lastName  = trim($request->input('last_name') ?: $request->input('lastName') ?: '');
        $phone     = trim($request->input('phone') ?: $request->input('phoneNumber') ?: $request->input('phone_number') ?: $request->input('mobile') ?: '');
        
        if (empty($firstName) && empty($lastName) && $request->filled('name')) {
            $nameParts = explode(' ', trim($request->input('name')), 2);
            $firstName = $nameParts[0] ?? '';
            $lastName  = $nameParts[1] ?? '';
        }

        if (empty($firstName) || empty($phone)) {
            return response()->json([
                'success' => false,
                'message' => 'First name and phone number are required.',
                'errors'  => [
                    'first_name' => empty($firstName) ? ['The first name field is required.'] : [],
                    'phone'      => empty($phone) ? ['The phone number field is required.'] : [],
                ]
            ], 422);
        }

        $cleanPhone = preg_replace('/\D/', '', $phone);
        $last10 = (strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;
        $incomingInstallUuid = $request->input('install_uuid') ?: $request->input('deviceId') ?: $request->input('device_id') ?: $request->header('X-Install-UUID');
        $isFreshInstall = $request->boolean('is_fresh_install') || $request->input('is_fresh_install') === '1' || $request->input('is_reinstall') === '1';

        // Check if existing user exists by phone
        $user = User::where(function($q) use ($phone, $cleanPhone, $last10) {
            $q->where('phone', $phone);
            if (!empty($cleanPhone)) {
                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                if (!empty($last10)) {
                    $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                }
            }
        })->first();

        $isUninstalledDetected = false;

        if (!$user) {
            // 1. BRAND NEW USER: Starts strictly INACTIVE until Admin grants license key
            $user = User::create([
                'uuid'           => (string) Str::uuid(),
                'name'           => trim($firstName . ' ' . $lastName),
                'first_name'     => $firstName,
                'last_name'      => $lastName,
                'phone'          => $phone,
                'email'          => 'user_' . Str::random(8) . '@mbanglapatenteb.com',
                'password'       => bcrypt(Str::random(16)),
                'role'           => 'user',
                'is_uninstalled' => false,
                'install_uuid'   => $incomingInstallUuid,
            ]);

            $license = License::create([
                'user_id'          => $user->uuid,
                'license_key'      => (string) rand(100000, 999999),
                'status'           => 'inactive',
                'duration_seconds' => 31536000,
            ]);

            $licenseStatus = 'inactive';
            $isCurrentlyActive = false;
        } else {
            // 2. EXISTING USER: Check if app was uninstalled and reinstalled
            // If install_uuid changed, or flag is_fresh_install sent, or already marked uninstalled:
            $previousInstallUuid = $user->install_uuid;
            if ($isFreshInstall || ($previousInstallUuid && $incomingInstallUuid && $previousInstallUuid !== $incomingInstallUuid) || $user->is_uninstalled) {
                $isUninstalledDetected = true;
                $user->update([
                    'is_uninstalled' => true,
                    'install_uuid'   => $incomingInstallUuid ?: $previousInstallUuid,
                    'first_name'     => $firstName ?: $user->first_name,
                    'last_name'      => $lastName ?: $user->last_name,
                    'name'           => trim(($firstName ?: $user->first_name) . ' ' . ($lastName ?: $user->last_name)),
                ]);

                // Immediately lock/inactivate license upon uninstall/reinstall until Admin reactivates
                $license = License::where('user_id', $user->uuid)->latest()->first();
                if ($license) {
                    $license->update(['status' => 'inactive']);
                } else {
                    $license = License::create([
                        'user_id'          => $user->uuid,
                        'license_key'      => (string) rand(100000, 999999),
                        'status'           => 'inactive',
                        'duration_seconds' => 31536000,
                    ]);
                }
                $licenseStatus = 'inactive';
                $isCurrentlyActive = false;
            } else {
                // User normal update
                $user->update([
                    'first_name'   => $firstName ?: $user->first_name,
                    'last_name'    => $lastName ?: $user->last_name,
                    'name'         => trim(($firstName ?: $user->first_name) . ' ' . ($lastName ?: $user->last_name)),
                    'install_uuid' => $incomingInstallUuid ?: $user->install_uuid,
                ]);

                $license = License::where('user_id', $user->uuid)->latest()->first();
                if (!$license) {
                    $license = License::create([
                        'user_id'          => $user->uuid,
                        'license_key'      => (string) rand(100000, 999999),
                        'status'           => 'inactive',
                        'duration_seconds' => 31536000,
                    ]);
                    $licenseStatus = 'inactive';
                    $isCurrentlyActive = false;
                } else {
                    if ($license->status === 'active' && $license->expires_at && now()->gt($license->expires_at)) {
                        $license->update(['status' => 'expired']);
                        $licenseStatus = 'expired';
                        $isCurrentlyActive = false;
                    } else {
                        $licenseStatus = $license->status;
                        $isCurrentlyActive = ($license->status === 'active');
                    }
                }
            }
        }

        $incomingSessionId = $request->input('session_id') ?: $request->input('sessionId') ?: $request->header('X-Session-ID');

        // Clean up or merge any previous guest AppClient records for this session
        if ($incomingSessionId && $incomingSessionId !== $user->uuid) {
            \App\Models\Message::where('session_id', $incomingSessionId)->update([
                'session_id'  => $user->uuid,
                'sender_id'   => $user->uuid,
                'sender_name' => trim($firstName . ' ' . $lastName),
            ]);
        }

        // Keep AppClient synchronized for admin chat compatibility
        $appClient = \App\Models\AppClient::where('phone', $phone);
        if (!empty($cleanPhone)) {
            $appClient->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
        }
        $clientRecord = $appClient->first();

        if ($clientRecord) {
            $clientRecord->update([
                'session_id'     => $user->uuid,
                'first_name'     => $firstName ?: $clientRecord->first_name,
                'last_name'      => $lastName ?: $clientRecord->last_name,
                'phone'          => $phone,
                'is_active'      => $isCurrentlyActive,
                'is_uninstalled' => $isUninstalledDetected,
                'install_uuid'   => $incomingInstallUuid ?: $clientRecord->install_uuid,
                'expires_at'     => $isCurrentlyActive ? $license->expires_at : null,
            ]);
        } else {
            $clientRecord = \App\Models\AppClient::create([
                'session_id'     => $user->uuid,
                'first_name'     => $firstName,
                'last_name'      => $lastName,
                'phone'          => $phone,
                'is_active'      => $isCurrentlyActive,
                'is_uninstalled' => $isUninstalledDetected,
                'install_uuid'   => $incomingInstallUuid,
                'expires_at'     => $isCurrentlyActive ? $license->expires_at : null,
                'stars'          => 5,
                'progress'       => 50,
            ]);
        }

        // Ensure Conversation exists
        $convo = \App\Models\Conversation::firstOrCreate(['user_id' => $user->uuid]);

        // Post relevant system notification to Admin Chat Room
        if ($isUninstalledDetected) {
            $hasExistingAlert = \App\Models\Message::where(function($q) use ($user, $convo) {
                    $q->where('session_id', $user->uuid)->orWhere('conversation_id', $convo->id);
                })
                ->where('message', 'like', '%⚠️ অ্যাপ আনইনস্টল বা পুনরায় ইনস্টল করা হয়েছে%')
                ->exists();

            if (!$hasExistingAlert) {
                \App\Models\Message::create([
                    'conversation_id' => $convo->id,
                    'session_id'      => $user->uuid,
                    'sender'          => 'system',
                    'sender_type'     => 'admin',
                    'sender_id'       => 'system',
                    'sender_name'     => 'Security Alert',
                    'message'         => "⚠️ অ্যাপ আনইনস্টল বা পুনরায় ইনস্টল করা হয়েছে ({$firstName} {$lastName} - {$phone})। অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অ্যাডমিন প্যানেল থেকে সক্রিয় করা আবশ্যক।",
                ]);
            }
        } else {
            $hasExistingMsg = \App\Models\Message::where('session_id', $user->uuid)
                ->orWhere('conversation_id', $convo->id)
                ->exists();

            if (!$hasExistingMsg) {
                \App\Models\Message::create([
                    'conversation_id' => $convo->id,
                    'session_id'      => $user->uuid,
                    'sender'          => 'user',
                    'sender_type'     => 'user',
                    'sender_id'       => $user->uuid,
                    'sender_name'     => trim($firstName . ' ' . $lastName),
                    'message'         => '🎉 কাস্টমার নিবন্ধিত হয়েছে (' . $firstName . ' ' . $lastName . ' - ' . $phone . ')। লাইসেন্স অ্যাক্টিভেশনের অপেক্ষায়।',
                ]);
            }
        }

        // Issue Sanctum Token
        $token = $user->createToken('mobile_app_token')->plainTextToken;

        $responseMessage = $isUninstalledDetected
            ? 'অ্যাপ আনইনস্টল করার কারণে অ্যাকাউন্টটি ইনঅ্যাক্টিভ করা হয়েছে। অনুগ্রহ করে অ্যাডমিন সাপোর্টে যোগাযোগ করে সক্রিয় করে নিন।'
            : ($isCurrentlyActive
                ? 'You already have an active license key. If you want to update or renew your license, please contact Admin via Support Chat.'
                : 'আপনার তথ্য সফলভাবে পাঠানো হয়েছে। অ্যাডমিন কর্তৃক লাইসেন্স কি বরাদ্দের পর সক্রিয় করতে পারবেন।');

        return response()->json([
            'success'                     => true,
            'client'                      => $clientRecord,
            'already_has_license'         => $isCurrentlyActive,
            'user' => [
                'id'             => $user->uuid,
                'first_name'     => $user->first_name,
                'last_name'      => $user->last_name,
                'phone'          => $user->phone,
                'is_uninstalled' => (bool)$user->is_uninstalled,
            ],
            'license_status'              => $licenseStatus,
            'is_active'                   => $isCurrentlyActive,
            'is_uninstalled'              => $isUninstalledDetected,
            'requires_admin_reactivation' => $isUninstalledDetected,
            'message'                     => $responseMessage,
            'token'                       => $token
        ]);
    }

    public function getUser(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $phone = $request->query('phone') ?: $request->input('phone') ?: $request->header('X-Client-Phone');
            if ($phone) {
                $cleanPhone = preg_replace('/\D/', '', $phone);
                $user = User::where(function($q) use ($phone, $cleanPhone) {
                    $q->where('phone', $phone);
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    }
                })->first();
            }
        }
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $license = License::where('user_id', $user->uuid)
            ->orWhere('user_id', (string)$user->id)
            ->orWhere('user_id', $user->phone)
            ->latest()
            ->first();
        $licenseStatus = 'inactive';

        if ($user->is_uninstalled) {
            $licenseStatus = 'inactive';
        } elseif ($license) {
            if ($license->status === 'active') {
                if ($license->expires_at && $license->expires_at->isPast()) {
                    $licenseStatus = 'expired';
                } else {
                    $licenseStatus = 'active';
                }
            } else {
                $licenseStatus = $license->status;
            }
        }

        if (!$user->is_uninstalled && $licenseStatus !== 'active') {
            $cleanPhone = $user->phone ? preg_replace('/\D/', '', $user->phone) : '';
            $appClient = \App\Models\AppClient::where(function ($q) use ($user, $cleanPhone) {
                if ($user->phone) {
                    $q->where('phone', $user->phone);
                }
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->first();

            if (!$appClient && $user->first_name) {
                $appClient = \App\Models\AppClient::where('first_name', 'LIKE', '%' . trim($user->first_name) . '%')->first();
            }

            if ($appClient) {
                if ($appClient->is_active) {
                    if ($appClient->expires_at && now()->gt($appClient->expires_at)) {
                        $appClient->update(['is_active' => false]);
                        $licenseStatus = 'expired';
                    } else {
                        $licenseStatus = 'active';
                    }
                } else {
                    $licenseStatus = $appClient->expires_at && now()->gt($appClient->expires_at) ? 'expired' : 'inactive';
                }
            }
        }

        $expiresAt = null;
        if ($license && $license->expires_at) {
            $expiresAt = $license->expires_at->toIso8601String();
        } elseif (isset($appClient) && $appClient && $appClient->expires_at) {
            $expiresAt = $appClient->expires_at->toIso8601String();
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id'         => $user->uuid,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone,
            ],
            'license_status' => $licenseStatus,
            'is_active'      => $licenseStatus === 'active',
            'expires_at'     => $expiresAt,
        ]);
    }
}
