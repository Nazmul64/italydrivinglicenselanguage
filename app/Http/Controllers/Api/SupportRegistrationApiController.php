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

        if (!$user) {
            // Create new user with UUID
            $user = User::create([
                'uuid'       => (string) Str::uuid(),
                'name'       => trim($firstName . ' ' . $lastName),
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $phone,
                'email'      => 'user_' . Str::random(8) . '@mbanglapatenteb.com',
                'password'   => bcrypt(Str::random(16)),
                'role'       => 'user',
            ]);
        } else {
            // Update names if changed
            $user->update([
                'first_name' => $firstName ?: $user->first_name,
                'last_name'  => $lastName ?: $user->last_name,
                'name'       => trim(($firstName ?: $user->first_name) . ' ' . ($lastName ?: $user->last_name)),
            ]);
        }

        // Check existing license or create initial inactive license
        $license = License::where('user_id', $user->uuid)->latest()->first();
        if (!$license) {
            $license = License::create([
                'user_id'     => $user->uuid,
                'license_key' => rand(100000, 999999),
                'status'      => 'inactive',
            ]);
        }
        $licenseStatus = $license->status;

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
                'session_id' => $user->uuid,
                'first_name' => $firstName ?: $clientRecord->first_name,
                'last_name'  => $lastName ?: $clientRecord->last_name,
                'phone'      => $phone,
                'is_active'  => $licenseStatus === 'active' || $clientRecord->is_active,
                'expires_at' => $license->expires_at ?: $clientRecord->expires_at,
            ]);
        } else {
            $clientRecord = \App\Models\AppClient::create([
                'session_id' => $user->uuid,
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $phone,
                'is_active'  => $licenseStatus === 'active',
                'expires_at' => $license->expires_at,
                'stars'      => 5,
                'progress'   => 50,
            ]);
        }

        // Ensure Conversation exists
        $convo = \App\Models\Conversation::firstOrCreate(['user_id' => $user->uuid]);

        // If no message exists yet, create an initial customer message so it appears immediately in Admin Chat Room
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
                'message'         => '🎉 কাস্টমার নিবন্ধিত হয়েছে (' . $firstName . ' ' . $lastName . ' - ' . $phone . ')',
            ]);
        }

        // Issue Sanctum Token
        $token = $user->createToken('mobile_app_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'client'  => $clientRecord,
            'user' => [
                'id'         => $user->uuid,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone,
            ],
            'license_status' => $licenseStatus,
            'token'          => $token
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

        if ($license) {
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

        if ($licenseStatus !== 'active') {
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

            if ($appClient && $appClient->is_active) {
                if (!$appClient->expires_at || $appClient->expires_at->isFuture()) {
                    $licenseStatus = 'active';
                }
            } else {
                $hasAnyActive = \App\Models\AppClient::where('is_active', true)->where(function($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })->exists();
                if ($hasAnyActive) {
                    $licenseStatus = 'active';
                }
            }
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
        ]);
    }
}
