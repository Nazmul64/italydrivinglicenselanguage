<?php

namespace App\Traits;

use App\Models\AppClient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait ResolvesUserSession
{
    /**
     * Resolve unified user ID, phone, and all associated session/UUID identifiers.
     * Guarantees 100% cross-platform synchronization between Flutter Mobile App and Web PWA.
     *
     * @param Request $request
     * @return array
     */
    protected function resolveUserContext(Request $request): array
    {
        $user = auth()->user() ?: ($request->user() ?: auth('sanctum')->user());
        
        $userId = $user ? $user->id : ($request->query('user_id') ?: $request->input('user_id'));
        
        $phone = $request->query('phone')
            ?? $request->query('user_phone')
            ?? $request->query('phoneNumber')
            ?? $request->query('phone_number')
            ?? $request->input('phone')
            ?? $request->input('user_phone')
            ?? $request->input('phoneNumber')
            ?? $request->input('phone_number')
            ?? $request->header('X-Client-Phone')
            ?? $request->header('x-client-phone')
            ?? $request->cookie('app_client_phone')
            ?? ($user ? $user->phone : session('app_client_phone'));
            
        $sessionId = $request->query('session_id')
            ?? $request->query('sessionId')
            ?? $request->input('session_id')
            ?? $request->input('sessionId')
            ?? $request->header('X-Session-ID')
            ?? $request->header('X-Client-Session-ID')
            ?? $request->header('x-session-id')
            ?? $request->header('x-client-session-id')
            ?? $request->cookie('app_client_session_id')
            ?? $request->cookie('qr_session_id')
            ?? session()->getId();

        $sessionIds = array_filter([$sessionId]);
        $userIds = array_filter([$userId]);

        // 1. If user is authenticated via Bearer token, also extract their details
        if ($user) {
            $userIds[] = $user->id;
            if ($user->uuid) {
                $sessionIds[] = $user->uuid;
            }
            if ($user->phone && !$phone) {
                $phone = $user->phone;
            }
        }

        // 2. Check Cache for QR-unlocked session phone/identity
        if (!$phone && $sessionId) {
            $cachedPhone = Cache::get('qr_phone_' . $sessionId);
            if ($cachedPhone) {
                $phone = $cachedPhone;
            } else {
                $lastUnlockedSession = Cache::get('qr_last_unlocked_session');
                if ($lastUnlockedSession) {
                    $phone = Cache::get('qr_phone_' . $lastUnlockedSession);
                }
            }
        }

        // 3. If still no phone, attempt lookup via session ID in AppClient & User tables
        if (!$phone && $sessionId) {
            $clientBySession = AppClient::where('session_id', $sessionId)->first();
            if ($clientBySession && $clientBySession->phone) {
                $phone = $clientBySession->phone;
            } else {
                $userBySession = User::where('uuid', $sessionId)->first();
                if ($userBySession && $userBySession->phone) {
                    $phone = $userBySession->phone;
                }
            }
        }

        // 4. If phone is found, resolve ALL aliases across users and app_clients
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $last10 = (strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;

            // Collect all AppClient sessions matching this phone
            $clientSessions = AppClient::where(function($q) use ($phone, $cleanPhone, $last10) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->pluck('session_id')->filter()->toArray();

            // Collect all User records matching this phone
            $userRecords = User::where(function($q) use ($phone, $cleanPhone, $last10) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->get();

            if ($userRecords->isEmpty() && !empty($cleanPhone)) {
                // Auto-create or fetch AppClient so session is persistently linked
                $client = AppClient::firstOrCreate(
                    ['phone' => $phone],
                    ['session_id' => $sessionId ?: $cleanPhone, 'first_name' => 'App', 'last_name' => 'User', 'is_active' => true]
                );
                $clientSessions[] = $client->session_id;
            }

            $userUuids = $userRecords->pluck('uuid')->filter()->toArray();
            $dbUserIds = $userRecords->pluck('id')->filter()->toArray();

            $sessionIds = array_unique(array_filter(array_merge($sessionIds, $clientSessions, $userUuids, [$phone, $cleanPhone, $last10])));
            $userIds = array_unique(array_filter(array_merge($userIds, $dbUserIds, $userUuids)));
            
            if (!$userId && !empty($dbUserIds)) {
                $userId = reset($dbUserIds);
            }

            // Persist to web session
            session(['app_client_phone' => $phone]);
        }

        return [
            'user'        => $user,
            'user_id'     => $userId,
            'user_ids'    => array_values($userIds),
            'phone'       => $phone,
            'session_id'  => $sessionId,
            'session_ids' => array_values($sessionIds),
        ];
    }
}
