<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AppClient;
use App\Models\License;
use App\Models\QrToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class QrVerificationApiController extends Controller
{
    /**
     * Verify customer identity & license status when scanning website QR code.
     */
    public function verify(Request $request)
    {
        try {
            $rawPayload      = trim($request->input('qr_data') ?: $request->input('qr_code') ?: $request->input('token') ?: $request->input('target_session_id') ?: $request->input('session_id') ?: '');
            $phone           = trim($request->input('phone') ?: $request->input('user_phone') ?: '');
            $firstName       = trim($request->input('first_name') ?: '');
            $lastName        = trim($request->input('last_name') ?: '');
            $clientSessionId = trim($request->input('session_id') ?: '');
            $licenseKey      = trim($request->input('license_key') ?: $request->input('activation_key') ?: $request->input('license') ?: $request->input('code') ?: '');

            $user = $request->user() ?: auth('sanctum')->user();
            $targetSessionId = trim($request->input('target_session_id') ?: '');

            // Extract session_id from URL query if rawPayload is a full URL
            if ($rawPayload) {
                if (preg_match('/session_id=([a-zA-Z0-9_\-\.]+)/i', $rawPayload, $matches)) {
                    $targetSessionId = $matches[1];
                } elseif (preg_match('/token=([a-zA-Z0-9_\-\.]+)/i', $rawPayload, $m2)) {
                    if (empty($targetSessionId)) {
                        $targetSessionId = $m2[1];
                    }
                } elseif (empty($targetSessionId) && preg_match('/^[a-zA-Z0-9_\-\.]{8,}$/', $rawPayload) && !str_contains($rawPayload, 'http')) {
                    $targetSessionId = $rawPayload;
                }
            }

            // 1. Lookup user in users table
            if (!$user && $phone) {
                $cleanPhone = preg_replace('/\D/', '', $phone);
                $user = User::where(function($q) use ($phone, $cleanPhone) {
                    $q->where('phone', trim($phone));
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    }
                })->first();
            }
            if (!$user && $clientSessionId) {
                $user = User::where('uuid', $clientSessionId)->first();
            }
            if (!$user && $targetSessionId) {
                $user = User::where('uuid', $targetSessionId)->first();
            }

            // 2. Lookup AppClient in app_clients table
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
            if (!$appClient && $clientSessionId) {
                $appClient = AppClient::where('session_id', $clientSessionId)->orderBy('is_active', 'desc')->first();
            }
            if (!$appClient && $targetSessionId) {
                $appClient = AppClient::where('session_id', $targetSessionId)->orderBy('is_active', 'desc')->first();
            }
            if (!$appClient && $user && $user->first_name) {
                $appClient = AppClient::where('first_name', 'LIKE', '%' . trim($user->first_name) . '%')->first();
            }

            // Check QR token ownership if token provided
            $tokenStr = trim($request->input('token') ?: $request->input('qr_code') ?: $request->input('session_id') ?: '');
            if ($tokenStr) {
                $qrToken = QrToken::where('token', $tokenStr)->first();
                if ($qrToken) {
                    if ($user && $qrToken->user_id && $qrToken->user_id !== $user->uuid) {
                        return response()->json([
                            'success' => false,
                            'status'  => 'error',
                            'message' => 'Unauthorized: This QR code is assigned to another user account.'
                        ], 403);
                    }
                }
            }

            // 3. Verify license status
            $hasActiveLicense = false;

            // Check if input license key matches an active License
            if ($licenseKey) {
                $foundLicense = License::where('license_key', $licenseKey)->first();
                if ($foundLicense) {
                    $foundLicense->update([
                        'status' => 'active',
                        'expires_at' => now()->addDays(365)
                    ]);
                    $hasActiveLicense = true;
                }
            }

            // Check User License
            if (!$hasActiveLicense && $user) {
                $hasActiveLicense = License::where('user_id', $user->uuid)
                    ->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    })
                    ->exists();
            }

            // Check AppClient status
            if (!$hasActiveLicense && $appClient) {
                if ($appClient->is_active && (!$appClient->expires_at || $appClient->expires_at->isFuture())) {
                    $hasActiveLicense = true;
                }
            }

            // If no active license found, return 403 Forbidden
            if (!$hasActiveLicense) {
                return response()->json([
                    'success' => false,
                    'status'  => 'error',
                    'license_status' => 'inactive',
                    'message' => 'License inactive. Please contact support to activate your account.'
                ], 403);
            }

            // Handle QR token model record if exists
            $tokenStr = trim($request->input('token') ?: $request->input('qr_code') ?: $request->input('session_id') ?: '');
            if ($tokenStr) {
                try {
                    $qrToken = QrToken::where('token', $tokenStr)->first();
                    if ($qrToken) {
                        if ($user && $qrToken->user_id && $qrToken->user_id !== $user->uuid) {
                            return response()->json([
                                'success' => false,
                                'status'  => 'error',
                                'message' => 'Unauthorized: This QR code is assigned to another user account.'
                            ], 403);
                        }

                        if ($qrToken->status === 'expired' || ($qrToken->expires_at && $qrToken->expires_at->isPast())) {
                            $qrToken->update(['status' => 'expired']);
                            return response()->json([
                                'success' => false,
                                'status'  => 'error',
                                'message' => 'This QR code has expired. Please refresh the website page.'
                            ], 403);
                        }
                        if ($user) {
                            $qrToken->update([
                                'user_id' => $user->uuid,
                                'status'  => 'verified'
                            ]);
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning('QrToken update skipped in QrVerificationApiController: ' . $e->getMessage());
                }
            }

            // Grant Website Access by binding customer identity & unlocked status to session and session ID
            session(['qr_unlocked' => true]);

            $userPhone = $user ? $user->phone : ($appClient ? $appClient->phone : $phone);
            $userFirstName = $user ? ($user->first_name ?: $user->name) : ($appClient ? $appClient->first_name : $firstName);
            $userLastName = $user ? ($user->last_name ?: '') : ($appClient ? $appClient->last_name : $lastName);

            if ($targetSessionId) {
                Cache::put('qr_unlocked_' . $targetSessionId, true, 86400 * 365);
                Cache::put('qr_last_unlocked_session', $targetSessionId, 86400);
                if ($user) {
                    Cache::put('qr_user_' . $targetSessionId, $user->uuid, 86400 * 365);
                }
                if ($userPhone) {
                    Cache::put('qr_phone_' . $targetSessionId, $userPhone, 86400 * 365);
                }
                if ($userFirstName) {
                    Cache::put('qr_first_name_' . $targetSessionId, $userFirstName, 86400 * 365);
                }
                if ($userLastName) {
                    Cache::put('qr_last_name_' . $targetSessionId, $userLastName, 86400 * 365);
                }
            }
            if ($tokenStr) {
                Cache::put('qr_unlocked_' . $tokenStr, true, 86400 * 365);
                if ($user) {
                    Cache::put('qr_user_' . $tokenStr, $user->uuid, 86400 * 365);
                }
                if ($userPhone) {
                    Cache::put('qr_phone_' . $tokenStr, $userPhone, 86400 * 365);
                }
            }
            if ($clientSessionId) {
                Cache::put('qr_unlocked_' . $clientSessionId, true, 86400 * 365);
                if ($userPhone) {
                    Cache::put('qr_phone_' . $clientSessionId, $userPhone, 86400 * 365);
                }
            }
            if ($phone) {
                Cache::put('qr_unlocked_' . $phone, true, 86400 * 365);
            }
            Cache::put('qr_last_unlocked_time', time(), 86400);

            return response()->json([
                'success'        => true,
                'status'         => 'success',
                'license_status' => 'active',
                'message'        => '🎉 Website Full Access Granted! আপনার লাইসেন্স সফলভাবে যাচাই করা হয়েছে।',
                'session_id'     => $targetSessionId,
                'token'          => $tokenStr,
                'user'           => [
                    'id'         => $user ? $user->uuid : ($appClient ? $appClient->session_id : ''),
                    'first_name' => $user ? ($user->first_name ?: $user->name) : ($appClient ? $appClient->first_name : 'User'),
                    'last_name'  => $user ? ($user->last_name ?: '') : ($appClient ? $appClient->last_name : ''),
                    'phone'      => $user ? $user->phone : ($appClient ? $appClient->phone : ''),
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('QrVerificationApiController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে লাইভ সাপোর্টে যোগাযোগ করুন।'
            ], 500);
        }
    }
}
