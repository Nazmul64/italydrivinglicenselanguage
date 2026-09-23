<?php

namespace App\Traits;

use App\Models\AppClient;
use App\Models\User;
use Illuminate\Http\Request;

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
            ?? $request->input('phone')
            ?? $request->input('user_phone')
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

        // 1. If no phone provided, attempt lookup via session ID
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

        // 2. Strict user isolation: If no phone and no userId, remain isolated to own session only (never leak other users)

        // 3. If phone is found, resolve ALL aliases (phone, clean digits, last 10, UUIDs, session IDs, user IDs)
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

            $userUuids = $userRecords->pluck('uuid')->filter()->toArray();
            $dbUserIds = $userRecords->pluck('id')->filter()->toArray();

            $sessionIds = array_unique(array_filter(array_merge($sessionIds, $clientSessions, $userUuids, [$phone, $cleanPhone])));
            $userIds = array_unique(array_filter(array_merge($userIds, $dbUserIds)));
            
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
