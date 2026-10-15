<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\License;
use App\Models\User;
use App\Models\AppClient;

class LicenseApiController extends Controller
{
    public function getStatus(Request $request)
    {
        $setting = \App\Models\Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : true;

        $user = $request->user();
        $phone = $request->query('phone') ?: $request->input('phone') ?: $request->header('X-Client-Phone') ?: ($user ? $user->phone : null);
        $userId = $request->query('user_id') ?: $request->query('session_id') ?: $request->query('uuid') ?: ($user ? $user->uuid : null);

        if (!$user && $phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $user = User::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->first();
        }
        if (!$user && $userId) {
            $user = User::where('uuid', $userId)->orWhere('id', $userId)->first();
        }

        $license = null;
        if ($user) {
            $license = License::where('user_id', $user->uuid)
                ->orWhere('user_id', (string)$user->id)
                ->orWhere('user_id', $user->phone)
                ->latest()
                ->first();
        } elseif ($phone) {
            $license = License::where('user_id', $phone)->latest()->first();
        }

        $appClient = null;
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $appClient = AppClient::where(function ($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->orderBy('is_active', 'desc')->first();
        }
        if (!$appClient && $userId) {
            $appClient = AppClient::where('session_id', $userId)->first();
        }

        $status = 'inactive';

        if ($license) {
            if ($license->status === 'active') {
                if ($license->expires_at && now()->gt($license->expires_at)) {
                    $license->update(['status' => 'expired']);
                    $status = 'expired';
                    if ($appClient) {
                        $appClient->update(['is_active' => false, 'expires_at' => $license->expires_at]);
                    }
                } else {
                    $status = 'active';
                }
            } else {
                $status = $license->status;
            }
        } elseif ($appClient && $appClient->is_active) {
            if ($appClient->expires_at && now()->gt($appClient->expires_at)) {
                $status = 'expired';
                $appClient->update(['is_active' => false]);
            } else {
                $status = 'active';
            }
        }

        $isActive = ($status === 'active');

        return response()->json([
            'success'        => true,
            'status'         => $status,
            'is_active'      => $isActive,
            'license_status' => $status,
            'protection_enabled' => $isProtectionEnabled,
            'license' => $license ? [
                'license_key'      => $license->license_key,
                'status'           => $status,
                'duration_seconds' => $license->duration_seconds,
                'activated_at'     => $license->activated_at ? $license->activated_at->toIso8601String() : null,
                'expires_at'       => $license->expires_at ? $license->expires_at->toIso8601String() : null,
            ] : ($appClient && $appClient->expires_at ? [
                'license_key'      => 'CLIENT_SESSION',
                'status'           => $status,
                'duration_seconds' => null,
                'activated_at'     => $appClient->created_at ? $appClient->created_at->toIso8601String() : null,
                'expires_at'       => $appClient->expires_at ? $appClient->expires_at->toIso8601String() : null,
            ] : null),
            'user' => $user ? [
                'id'         => $user->uuid,
                'name'       => $user->name,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone
            ] : null
        ]);
    }

    public function activate(Request $request)
    {
        $user = $request->user();
        $phone = $request->input('phone') ?: $request->header('X-Client-Phone');
        $sessionId = $request->input('session_id') ?: $request->input('sessionId') ?: $request->header('X-Session-ID');

        if (!$user && $phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $user = User::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->first();
        }
        if (!$user && $sessionId) {
            $user = User::where('uuid', $sessionId)->first();
        }

        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'লাইসেন্স কি দেওয়া আবশ্যক।',
                'errors'  => $validator->errors()
            ], 422);
        }

        $licenseKey = trim($request->input('license_key'));
        $license = License::where('license_key', $licenseKey)->first();

        if (!$license) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'অকার্যকর লাইসেন্স কি! সঠিক লাইসেন্স কি দিয়ে পুনরায় চেষ্টা করুন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।',
            ], 404);
        }

        if ($license->status === 'revoked') {
            return response()->json([
                'success' => false,
                'status'  => 'revoked',
                'message' => 'এই লাইসেন্স কিটি বাতিল করা হয়েছে।',
            ], 403);
        }

        if ($license->user_id && $user && $license->user_id !== $user->uuid && $license->user_id !== (string)$user->id && $license->user_id !== $user->phone) {
            return response()->json([
                'success' => false,
                'status'  => 'forbidden',
                'message' => 'এই লাইসেন্স কি অন্য ব্যবহারকারীর জন্য সংরক্ষিত।',
            ], 403);
        }

        // Determine duration in seconds: preset or requested or default
        $durationSeconds = $license->duration_seconds ?: (
            $request->input('seconds') ?: ($request->input('days') ? ((int)$request->input('days') * 86400) : 31536000)
        );

        $activatedAt = now();
        $expiresAt   = now()->addSeconds($durationSeconds);

        $userIdentifier = $user ? $user->uuid : ($license->user_id ?: ($phone ?: $sessionId));

        $license->update([
            'user_id'          => $userIdentifier,
            'status'           => 'active',
            'duration_seconds' => $durationSeconds,
            'activated_at'     => $activatedAt,
            'expires_at'       => $expiresAt,
        ]);

        // Synchronize AppClient state
        $appClientQuery = AppClient::query();
        $hasClientFilter = false;
        if ($user && $user->phone) {
            $appClientQuery->orWhere('phone', $user->phone);
            $hasClientFilter = true;
        }
        if ($phone) {
            $appClientQuery->orWhere('phone', $phone);
            $hasClientFilter = true;
        }
        if ($user && $user->uuid) {
            $appClientQuery->orWhere('session_id', $user->uuid);
            $hasClientFilter = true;
        }
        if ($sessionId) {
            $appClientQuery->orWhere('session_id', $sessionId);
            $hasClientFilter = true;
        }

        if ($hasClientFilter) {
            $appClientQuery->update([
                'is_active'  => true,
                'expires_at' => $expiresAt,
            ]);
        }

        return response()->json([
            'success'        => true,
            'status'         => 'active',
            'is_active'      => true,
            'license_status' => 'active',
            'message'        => 'লাইসেন্স সফলভাবে সক্রিয় করা হয়েছে।',
            'expires_at'     => $expiresAt->toIso8601String(),
            'license'        => [
                'license_key'      => $license->license_key,
                'status'           => 'active',
                'duration_seconds' => $durationSeconds,
                'activated_at'     => $activatedAt->toIso8601String(),
                'expires_at'       => $expiresAt->toIso8601String(),
            ]
        ]);
    }
}
