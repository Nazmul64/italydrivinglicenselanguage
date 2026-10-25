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
        } elseif ($userId) {
            $license = License::where('user_id', $userId)->latest()->first();
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

        $cleanPhone = $phone ? preg_replace('/\D/', '', $phone) : null;
        $isExplicitlyDeleted = ($phone && \Illuminate\Support\Facades\Cache::get('user_deleted_phone_' . $phone))
            || ($cleanPhone && \Illuminate\Support\Facades\Cache::get('user_deleted_phone_' . $cleanPhone))
            || ($userId && \Illuminate\Support\Facades\Cache::get('user_deleted_' . $userId));

        // Check if user was deleted from admin panel
        if ($isExplicitlyDeleted) {
            return response()->json([
                'success'            => true,
                'status'             => 'deleted',
                'is_active'          => false,
                'is_deleted'         => true,
                'is_expired'         => false,
                'license_status'     => 'deleted',
                'message'            => 'Already deleted your account. Please contact admin.',
                'protection_enabled' => $isProtectionEnabled,
                'license'            => null,
                'client'             => null,
            ]);
        }

        $status = 'inactive';

        if ($license && $license->status === 'active') {
            if ($license->expires_at && now()->gt($license->expires_at)) {
                $license->update(['status' => 'expired']);
                $status = 'expired';
                if ($appClient) {
                    $appClient->update(['is_active' => false, 'expires_at' => $license->expires_at]);
                }
            } else {
                $status = 'active';
            }
        } elseif ($appClient && $appClient->is_active && (!$appClient->expires_at || $appClient->expires_at->isFuture())) {
            $status = 'active';
        } elseif ($license) {
            $status = $license->status;
        }

        $isUninstalled = ($user && $user->is_uninstalled) || ($appClient && $appClient->is_uninstalled);
        if ($isUninstalled) {
            $status = 'inactive';
        }

        $isActive = ($status === 'active') && !$isUninstalled;

        return response()->json([
            'success'            => true,
            'status'             => $status,
            'is_active'          => $isActive,
            'is_deleted'         => false,
            'is_expired'         => ($status === 'expired'),
            'license_status'     => $status,
            'expires_at'         => $license ? ($license->expires_at ? $license->expires_at->toIso8601String() : null) : ($appClient && $appClient->expires_at ? $appClient->expires_at->toIso8601String() : null),
            'message'            => ($status === 'expired')
                ? 'Please renew your license key. Support admin.'
                : (($isActive) ? 'লাইসেন্স সক্রিয় রয়েছে।' : 'লাইসেন্স আবশ্যক।'),
            'is_uninstalled'     => (bool)$isUninstalled,
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
        $phone = $request->input('phone') ?: $request->header('X-Client-Phone');
        $sessionId = $request->input('session_id') ?: $request->input('sessionId') ?: $request->header('X-Session-ID');
        $licenseKey = trim($request->input('license_key') ?: $request->input('key') ?: '');

        $user = null;
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $last10 = (strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;
            $user = User::where(function($q) use ($phone, $cleanPhone, $last10) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->first();
        }
        if (!$user && $sessionId) {
            $user = User::where('uuid', $sessionId)->first();
        }
        $authUser = $request->user() ?: auth('sanctum')->user();
        if (!$user && $authUser && $authUser->role !== 'admin' && $authUser->role !== 'super_admin') {
            $user = $authUser;
        }
        if ($user && empty($user->uuid)) {
            $user->uuid = (string) \Illuminate\Support\Str::uuid();
            $user->save();
        }

        $license = null;
        if (!empty($licenseKey)) {
            $license = License::where('license_key', $licenseKey)->first();
            if ($license) {
                if ($user && $license->user_id) {
                    $licenseUserMatches = in_array((string)$license->user_id, [
                        (string)$user->uuid,
                        (string)$user->id,
                        (string)$user->phone,
                    ]);
                    if (!$licenseUserMatches) {
                        return response()->json([
                            'success' => false,
                            'message' => 'This license does not belong to this account.',
                        ], 403);
                    }
                }
                if (!$user && $license->user_id) {
                    $user = User::where('uuid', $license->user_id)->orWhere('id', $license->user_id)->orWhere('phone', $license->user_id)->first();
                    if ($user && empty($user->uuid)) {
                        $user->uuid = (string) \Illuminate\Support\Str::uuid();
                        $user->save();
                    }
                }
            }
        }

        // If not found by key, search by user, phone or session
        if (!$license && $user && !empty($user->uuid)) {
            $license = License::where('user_id', $user->uuid)
                ->orWhere('user_id', (string)$user->id)
                ->orWhere('user_id', $user->phone)
                ->latest()
                ->first();
        }
        if (!$license && $phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $license = License::where('user_id', $phone)
                ->orWhere('user_id', $cleanPhone)
                ->latest()
                ->first();
        }
        if (!$license && $sessionId) {
            $license = License::where('user_id', $sessionId)->latest()->first();
        }

        if ($license && $license->status === 'revoked') {
            return response()->json([
                'success' => false,
                'status'  => 'revoked',
                'message' => 'এই লাইসেন্স কিটি বাতিল করা হয়েছে।',
            ], 403);
        }

        // Determine duration in seconds: preset or requested or default (1 year)
        $durationSeconds = ($license && $license->duration_seconds) ? $license->duration_seconds : (
            $request->input('seconds') ?: ($request->input('days') ? ((int)$request->input('days') * 86400) : 31536000)
        );

        $activatedAt = now();
        $expiresAt   = now()->addSeconds($durationSeconds);

        $userIdentifier = ($user && !empty($user->uuid))
            ? $user->uuid
            : ($sessionId ?: ($phone ?: (string) \Illuminate\Support\Str::uuid()));

        if (!$license) {
            $license = License::create([
                'user_id'          => $userIdentifier,
                'license_key'      => !empty($licenseKey) ? $licenseKey : (string) rand(100000, 999999),
                'status'           => 'active',
                'duration_seconds' => $durationSeconds,
                'activated_at'     => $activatedAt,
                'expires_at'       => $expiresAt,
            ]);
        } else {
            $userIdentifier = ($user && !empty($user->uuid)) ? $user->uuid : ($license->user_id ?: $userIdentifier);
            $license->update([
                'user_id'          => $userIdentifier,
                'status'           => 'active',
                'duration_seconds' => $durationSeconds,
                'activated_at'     => $activatedAt,
                'expires_at'       => $expiresAt,
            ]);
        }

        if ($user) {
            $user->update(['is_uninstalled' => false]);
            if ($phone && !$user->phone) {
                $user->update(['phone' => $phone]);
            }
        } elseif ($userIdentifier) {
            User::where('uuid', $userIdentifier)->orWhere('phone', $userIdentifier)->update(['is_uninstalled' => false]);
        }

        // Synchronize AppClient state
        $appClientQuery = AppClient::query();
        $hasClientFilter = false;
        if ($user && $user->phone) {
            $cleanP = preg_replace('/\D/', '', $user->phone);
            $appClientQuery->orWhere('phone', $user->phone);
            if ($cleanP) {
                $appClientQuery->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanP]);
            }
            $hasClientFilter = true;
        }
        if ($phone) {
            $cleanP = preg_replace('/\D/', '', $phone);
            $appClientQuery->orWhere('phone', $phone);
            if ($cleanP) {
                $appClientQuery->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanP]);
            }
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
                'is_active'      => true,
                'is_uninstalled' => false,
                'expires_at'     => $expiresAt,
            ]);
        }

        // Only create or link an AppClient record if a valid registered customer identity exists (valid phone or user).
        // NEVER create a dummy "Guest User" with phone 'N/A'.
        $validPhone = $phone ?: ($user ? $user->phone : null);
        $cleanPhoneDigits = preg_replace('/\D/', '', $validPhone ?: '');

        if ($validPhone && $validPhone !== 'N/A' && strlen($cleanPhoneDigits) >= 7) {
            $existingClient = AppClient::where('phone', $validPhone);
            if ($cleanPhoneDigits) {
                $existingClient->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhoneDigits]);
            }
            if ($sessionId) {
                $existingClient->orWhere('session_id', $sessionId);
            }
            $targetClient = $existingClient->first();

            if ($targetClient) {
                $targetClient->update([
                    'is_active'      => true,
                    'is_uninstalled' => false,
                    'expires_at'     => $expiresAt,
                    'session_id'     => $sessionId ?: $targetClient->session_id,
                ]);
            } else {
                AppClient::create([
                    'session_id'     => $sessionId ?: ($user ? $user->uuid : (string) \Illuminate\Support\Str::uuid()),
                    'first_name'     => $user ? ($user->first_name ?: $user->name) : 'User',
                    'last_name'      => $user ? $user->last_name : '',
                    'phone'          => $validPhone,
                    'is_active'      => true,
                    'is_uninstalled' => false,
                    'expires_at'     => $expiresAt,
                    'stars'          => 4,
                    'progress'       => 55,
                ]);
            }
        }

        // Mark session & cache as unlocked for web and mobile
        session(['qr_unlocked' => true]);
        if ($phone) session(['app_client_phone' => $phone]);
        session()->save();

        if ($userIdentifier) {
            \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $userIdentifier, true, $durationSeconds);
            \Illuminate\Support\Facades\Cache::forget('user_deleted_' . $userIdentifier);
        }

        if ($sessionId) {
            \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $sessionId, true, $durationSeconds);
            \Illuminate\Support\Facades\Cache::forget('user_deleted_' . $sessionId);
        }
        if ($phone) {
            \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $phone, true, $durationSeconds);
            \Illuminate\Support\Facades\Cache::forget('user_deleted_phone_' . $phone);
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if ($cleanPhone) {
                \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $cleanPhone, true, $durationSeconds);
                \Illuminate\Support\Facades\Cache::forget('user_deleted_phone_' . $cleanPhone);
            }
        }

        // Only post welcome message if there is a real registered customer (has user or valid phone)
        if (($user || ($validPhone && strlen($cleanPhoneDigits) >= 7)) && $sessionId) {
            $chatIds = array_filter([$sessionId, $userIdentifier, $user ? $user->uuid : null]);
            $hasWelcome = \App\Models\Message::whereIn('session_id', $chatIds)->get()->contains(function ($msg) {
                return str_contains($msg->message, 'ধন্যবাদ') || str_contains($msg->message, 'Package Activate');
            });

            if (!$hasWelcome) {
                $welcomeText = "🎉 ধন্যবাদ! আমাদের Package Activate করার জন্য আপনাকে আন্তরিক শুভেচ্ছা。\n"
                             . "এখন থেকে আপনি সকল Premium Feature ব্যবহার করতে পারবেন。\n"
                             . "নিয়মিত পড়াশোনা করুন, মনোযোগ দিয়ে পরীক্ষা দিন。\n"
                             . "আশা করি আপনার সফলতার যাত্রায় আমাদের এই Platform গুরুত্বপূর্ণ ভূমিকা রাখবে。\n"
                             . "আপনার জন্য রইল অনেক শুভকামনা。";

                \App\Models\Message::create([
                    'session_id'  => $sessionId ?: $userIdentifier,
                    'sender'      => 'admin',
                    'sender_name' => 'Admin',
                    'message'     => $welcomeText
                ]);
            }
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
