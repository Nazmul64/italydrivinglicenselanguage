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
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'phone'      => 'required|string|max:25',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $phone = trim($request->input('phone'));
        $firstName = trim($request->input('first_name'));
        $lastName  = trim($request->input('last_name'));

        // Normalize phone format if needed
        if (!preg_match('/^\+?[0-9]{7,15}$/', str_replace([' ', '-'], '', $phone))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number format.'
            ], 422);
        }

        // Check if existing user exists by phone
        $user = User::where('phone', $phone)->first();

        if (!$user) {
            // Create new user with UUID
            $user = User::create([
                'uuid'       => (string) Str::uuid(),
                'name'       => $firstName . ' ' . $lastName,
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
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'name'       => $firstName . ' ' . $lastName,
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

        $incomingSessionId = $request->input('session_id') ?: $request->header('X-Session-ID');

        // Clean up or merge any previous guest AppClient records for this session
        if ($incomingSessionId && $incomingSessionId !== $user->uuid) {
            \App\Models\AppClient::where('session_id', $incomingSessionId)->delete();
            \App\Models\Message::where('session_id', $incomingSessionId)->update([
                'session_id'  => $user->uuid,
                'sender_id'   => $user->uuid,
                'sender_name' => trim($firstName . ' ' . $lastName),
            ]);
        }

        // Keep AppClient synchronized for admin chat compatibility
        \App\Models\AppClient::updateOrCreate(
            ['phone' => $phone],
            [
                'session_id' => $user->uuid,
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'is_active'  => $licenseStatus === 'active',
                'expires_at' => $license->expires_at,
            ]
        );

        // Remove any orphan Guest User entries with phone N/A
        \App\Models\AppClient::where('first_name', 'Guest')->where(function($q) {
            $q->whereNull('phone')->orWhere('phone', 'N/A')->orWhere('phone', '');
        })->delete();

        // Issue Sanctum Token
        $token = $user->createToken('mobile_app_token')->plainTextToken;

        return response()->json([
            'success' => true,
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
