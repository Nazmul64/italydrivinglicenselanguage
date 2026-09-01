<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\License;

class LicenseApiController extends Controller
{
    public function getStatus(Request $request)
    {
        $setting = \App\Models\Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        if (!$isProtectionEnabled) {
            return response()->json([
                'success' => true,
                'status'  => 'active',
                'protection_disabled' => true,
                'license' => [
                    'license_key'  => 'FREE_ACCESS',
                    'status'       => 'active',
                    'activated_at' => now(),
                    'expires_at'   => now()->addDays(365),
                ],
            ]);
        }

        $user = $request->user();
        $phone = $request->query('phone') ?: $request->input('phone') ?: $request->header('X-Client-Phone') ?: ($user ? $user->phone : null);
        $userId = $request->query('user_id') ?: $request->query('session_id') ?: $request->query('uuid') ?: ($user ? $user->uuid : null);

        if (!$user && $phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $user = \App\Models\User::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->first();
        }
        if (!$user && $userId) {
            $user = \App\Models\User::where('uuid', $userId)->orWhere('id', $userId)->first();
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

        $status = 'inactive';

        if ($license) {
            if ($license->status === 'active') {
                if ($license->expires_at && $license->expires_at->isPast()) {
                    $status = 'expired';
                } else {
                    $status = 'active';
                }
            } else {
                $status = $license->status;
            }
        }

        $appClient = null;
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $appClient = \App\Models\AppClient::where(function ($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->orderBy('is_active', 'desc')->first();

            if ($appClient && $appClient->is_active) {
                if (!$appClient->expires_at || $appClient->expires_at->isFuture()) {
                    $status = 'active';
                }
            }
        }

        // If registered user or app client exists, ensure active 1-year license
        if ($status !== 'active' && ($user || $appClient)) {
            $status = 'active';
            $uuidKey = $user ? $user->uuid : ($appClient ? $appClient->session_id : ($userId ?: (string)\Illuminate\Support\Str::uuid()));
            $license = License::updateOrCreate(
                ['user_id' => $uuidKey],
                [
                    'license_key'  => rand(100000, 999999),
                    'status'       => 'active',
                    'activated_at' => now(),
                    'expires_at'   => now()->addDays(365),
                ]
            );
            if ($appClient) {
                $appClient->update([
                    'is_active' => true,
                    'expires_at' => now()->addDays(365),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'status'  => $status,
            'license_status' => $status,
            'license' => [
                'license_key'  => $license ? $license->license_key : 'VIP_ACTIVE',
                'status'       => $status,
                'activated_at' => $license ? $license->activated_at : now(),
                'expires_at'   => $license ? $license->expires_at : now()->addDays(365),
            ],
            'user' => $user ? [
                'id' => $user->uuid,
                'name' => $user->name,
                'phone' => $user->phone
            ] : null
        ]);
    }

    public function activate(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $phone = $request->input('phone') ?: $request->header('X-Client-Phone');
            if ($phone) {
                $user = \App\Models\User::where('phone', $phone)->first();
            }
        }
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'License key is required.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $licenseKey = trim($request->input('license_key'));

        $license = License::where('license_key', $licenseKey)->first();

        if ($license && $license->user_id && $license->user_id !== $user->uuid && $license->user_id !== (string)$user->id && $license->user_id !== $user->phone) {
            return response()->json([
                'success' => false,
                'message' => 'This license does not belong to this account.',
            ], 403);
        }

        if (!$license) {
            $license = License::create([
                'user_id'      => $user->uuid,
                'license_key'  => $licenseKey,
                'status'       => 'active',
                'activated_at' => now(),
                'expires_at'   => now()->addDays(365),
            ]);
        } else {
            $license->update([
                'user_id'      => $user->uuid,
                'status'       => 'active',
                'activated_at' => now(),
                'expires_at'   => now()->addDays(365),
            ]);
        }

        // Also update AppClient
        if ($user->phone) {
            \App\Models\AppClient::where('phone', $user->phone)->update([
                'is_active'  => true,
                'expires_at' => now()->addDays(365),
            ]);
        }
        \App\Models\AppClient::where('session_id', $user->uuid)->update([
            'is_active'  => true,
            'expires_at' => now()->addDays(365),
        ]);

        return response()->json([
            'success'        => true,
            'message'        => 'License activated successfully.',
            'license_status' => 'active',
            'license'        => [
                'license_key'  => $license->license_key,
                'status'       => 'active',
                'activated_at' => $license->activated_at,
                'expires_at'   => $license->expires_at,
            ]
        ]);
    }
}
