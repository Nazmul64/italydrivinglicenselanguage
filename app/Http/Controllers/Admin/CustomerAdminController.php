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

    public function assignLicense(Request $request, $uuid)
    {
        $customer = User::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'license_key' => 'nullable|string|max:100',
        ]);

        $key = $request->input('license_key') ?: strtoupper('LIC-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));

        // Create or update license for this customer UUID
        $license = License::create([
            'user_id'     => $customer->uuid,
            'license_key' => $key,
            'status'      => 'pending',
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
            'message'         => "🔑 License Key Available\nYour license is ready to activate key: {$key}",
            'license_key'     => $key,
            'is_license_card' => true,
        ]);

        return redirect()->back()->with('success', "License Key {$key} assigned successfully!");
    }

    public function updateLicenseStatus(Request $request, $licenseId)
    {
        $request->validate([
            'status' => 'required|in:inactive,pending,active,expired,revoked',
        ]);

        $license = License::findOrFail($licenseId);
        $data = ['status' => $request->input('status')];
        if ($request->input('status') === 'active' && !$license->activated_at) {
            $data['activated_at'] = now();
        }

        $license->update($data);

        return redirect()->back()->with('success', "License status updated to {$request->input('status')}.");
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
