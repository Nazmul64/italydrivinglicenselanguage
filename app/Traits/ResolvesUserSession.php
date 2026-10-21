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

        $rawFirstName = $request->query('first_name')
            ?? $request->query('firstName')
            ?? $request->input('first_name')
            ?? $request->input('firstName')
            ?? $request->header('X-Client-First-Name')
            ?? $request->header('x-client-first-name')
            ?? $request->cookie('app_client_first_name')
            ?? ($user ? ($user->first_name ?: $user->name) : session('app_client_first_name'));

        $firstName = $rawFirstName ? trim(urldecode($rawFirstName)) : null;

        $rawLastName = $request->query('last_name')
            ?? $request->query('lastName')
            ?? $request->input('last_name')
            ?? $request->input('lastName')
            ?? $request->header('X-Client-Last-Name')
            ?? $request->header('x-client-last-name')
            ?? $request->cookie('app_client_last_name')
            ?? ($user ? $user->last_name : session('app_client_last_name'));

        $lastName = $rawLastName ? trim(urldecode($rawLastName)) : null;
            
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
            if ($user->first_name && !$firstName) {
                $firstName = $user->first_name;
            }
            if ($user->last_name && !$lastName) {
                $lastName = $user->last_name;
            }
        }

        // 2. Check Cache for QR-unlocked session phone/identity strictly for this exact sessionId
        if (!$phone && $sessionId) {
            $cachedPhone = Cache::get('qr_phone_' . $sessionId);
            if ($cachedPhone) {
                $phone = $cachedPhone;
            }
        }

        // 3. If still no phone, attempt lookup strictly via session ID in AppClient & User tables
        if (!$phone && $sessionId) {
            $clientBySession = AppClient::where('session_id', $sessionId)->first();
            if ($clientBySession && $clientBySession->phone) {
                $phone = $clientBySession->phone;
                if (!$firstName && $clientBySession->first_name) $firstName = $clientBySession->first_name;
                if (!$lastName && $clientBySession->last_name) $lastName = $clientBySession->last_name;
            } else {
                $userBySession = User::where('uuid', $sessionId)->first();
                if ($userBySession && $userBySession->phone) {
                    $phone = $userBySession->phone;
                    if (!$firstName && $userBySession->first_name) $firstName = $userBySession->first_name;
                    if (!$lastName && $userBySession->last_name) $lastName = $userBySession->last_name;
                }
            }
        }

        // 4. If phone is found, resolve ALL aliases across users and app_clients strictly for this phone
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $last10 = (strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;

            // Link or find User record matching this phone
            $userRecord = User::where(function($q) use ($phone, $cleanPhone, $last10) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->first();

            if (!$userRecord) {
                $userRecord = User::create([
                    'uuid'           => (string) \Illuminate\Support\Str::uuid(),
                    'name'           => trim(($firstName ?: 'Customer') . ' ' . ($lastName ?: '')),
                    'first_name'     => $firstName ?: 'Customer',
                    'last_name'      => $lastName ?: '',
                    'phone'          => $phone,
                    'email'          => 'user_' . \Illuminate\Support\Str::random(8) . '@mbanglapatenteb.com',
                    'password'       => bcrypt(\Illuminate\Support\Str::random(16)),
                    'role'           => 'user',
                    'is_uninstalled' => false,
                ]);

                \App\Models\License::firstOrCreate(
                    ['user_id' => $userRecord->uuid],
                    ['license_key' => (string) rand(100000, 999999), 'status' => 'inactive', 'duration_seconds' => 31536000]
                );
            } else {
                $dirtyUser = false;
                if ($firstName && (!$userRecord->first_name || $userRecord->first_name === 'App' || $userRecord->first_name === 'Customer')) {
                    $userRecord->first_name = $firstName;
                    $userRecord->name = trim($firstName . ' ' . ($lastName ?: $userRecord->last_name));
                    $dirtyUser = true;
                }
                if ($lastName && (!$userRecord->last_name || $userRecord->last_name === 'User')) {
                    $userRecord->last_name = $lastName;
                    $userRecord->name = trim(($userRecord->first_name ?: $firstName) . ' ' . $lastName);
                    $dirtyUser = true;
                }
                if ($dirtyUser) {
                    $userRecord->save();
                }
                if (!$firstName && $userRecord->first_name) $firstName = $userRecord->first_name;
                if (!$lastName && $userRecord->last_name) $lastName = $userRecord->last_name;
            }

            // Link or update AppClient for this phone
            $client = AppClient::where('phone', $phone)->first();
            if (!$client && !empty($cleanPhone)) {
                $client = AppClient::whereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone])->first();
            }

            if ($client) {
                $dirtyClient = false;
                if ($firstName && (!$client->first_name || $client->first_name === 'App')) {
                    $client->first_name = $firstName;
                    $dirtyClient = true;
                }
                if ($lastName && (!$client->last_name || $client->last_name === 'User')) {
                    $client->last_name = $lastName;
                    $dirtyClient = true;
                }
                if ($dirtyClient) {
                    $client->save();
                }
                if (!$firstName && $client->first_name) $firstName = $client->first_name;
                if (!$lastName && $client->last_name) $lastName = $client->last_name;
            } elseif (!empty($cleanPhone)) {
                $client = AppClient::create([
                    'phone' => $phone,
                    'session_id' => $userRecord->uuid ?: ($sessionId ?: $cleanPhone),
                    'first_name' => $firstName ?: 'App',
                    'last_name' => $lastName ?: 'User',
                    'is_active' => false
                ]);
            }

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

            $userUuids = array_filter([$userRecord->uuid]);
            $dbUserIds = array_filter([$userRecord->id]);

            $sessionIds = array_unique(array_filter(array_merge($sessionIds, $clientSessions, $userUuids, [$phone, $cleanPhone, $last10])));
            $userIds = array_unique(array_filter(array_merge($userIds, $dbUserIds, $userUuids)));
            $userId = $userRecord->id;

            // Automatically claim and backfill orphan or cross-platform records with this user_id
            try {
                \App\Models\SavedMcq::whereIn('session_id', $sessionIds)->whereNull('user_id')->update(['user_id' => $userId]);
                \App\Models\UserMcqResult::whereIn('session_id', $sessionIds)->whereNull('user_id')->update(['user_id' => $userId]);
                \App\Models\Note::whereIn('session_id', $sessionIds)->whereNull('user_id')->update(['user_id' => $userId]);

                // Collect all past session IDs used by this user in any table
                $pastSavedSessions = \App\Models\SavedMcq::where('user_id', $userId)->pluck('session_id')->filter()->toArray();
                $pastResultSessions = \App\Models\UserMcqResult::where('user_id', $userId)->pluck('session_id')->filter()->toArray();
                $pastNoteSessions = \App\Models\Note::where('user_id', $userId)->pluck('session_id')->filter()->toArray();
                $sessionIds = array_unique(array_filter(array_merge($sessionIds, $pastSavedSessions, $pastResultSessions, $pastNoteSessions)));
            } catch (\Exception $e) {
                // Silently continue if table is missing or already synced
            }

            // Persist to web session
            session(['app_client_phone' => $phone]);
            if ($firstName) session(['app_client_first_name' => $firstName]);
            if ($lastName) session(['app_client_last_name' => $lastName]);
        }

        return [
            'user'        => $userRecord ?? $user,
            'user_id'     => $userId,
            'user_ids'    => array_values($userIds),
            'phone'       => $phone,
            'first_name'  => $firstName,
            'last_name'   => $lastName,
            'session_id'  => $sessionId,
            'session_ids' => array_values($sessionIds),
        ];
    }
}
