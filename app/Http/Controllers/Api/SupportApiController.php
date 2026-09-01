<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\License;

class SupportApiController extends Controller
{
    private function fetchAllUserMessages($user, $extraSessionId = null, $phoneParam = null)
    {
        $phone = $user ? $user->phone : $phoneParam;
        $sessionId = $extraSessionId ?: ($user ? $user->uuid : null);

        $identifiers = collect([$sessionId])->filter();
        $cleanPhone = $phone ? preg_replace('/\D/', '', $phone) : null;

        $last10 = ($cleanPhone && strlen($cleanPhone) >= 10) ? substr($cleanPhone, -10) : $cleanPhone;

        $cQuery = \App\Models\AppClient::query();
        if ($sessionId) {
            $cQuery->where('session_id', $sessionId)->orWhere('id', $sessionId);
        }
        if ($phone) {
            $cQuery->orWhere('phone', $phone);
            if (!empty($cleanPhone)) {
                $cQuery->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                if (!empty($last10)) {
                    $cQuery->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                }
            }
        }
        $clients = $cQuery->get();

        $uQuery = \App\Models\User::query();
        if ($sessionId) {
            $uQuery->where('uuid', $sessionId)->orWhere('id', $sessionId);
        }
        if ($phone) {
            $uQuery->orWhere('phone', $phone);
            if (!empty($cleanPhone)) {
                $uQuery->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                if (!empty($last10)) {
                    $uQuery->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                }
            }
        }
        $users = $uQuery->get();

        if (empty($phone)) {
            foreach ($clients as $c) {
                if ($c->phone) { $phone = $c->phone; break; }
            }
            if (empty($phone)) {
                foreach ($users as $u) {
                    if ($u->phone) { $phone = $u->phone; break; }
                }
            }
            if ($phone) {
                $cleanPhone = preg_replace('/\D/', '', $phone);
                $last10 = ($cleanPhone && strlen($cleanPhone) >= 10) ? substr($cleanPhone, -10) : $cleanPhone;
                $extraClients = \App\Models\AppClient::where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $extraClients->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $extraClients->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
                $clients = $clients->concat($extraClients->get())->unique('id');

                $extraUsers = \App\Models\User::where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $extraUsers->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $extraUsers->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
                $users = $users->concat($extraUsers->get())->unique('id');
            }
        }

        $allIdentifiers = $identifiers
            ->concat($clients->pluck('session_id'))
            ->concat($clients->pluck('id'))
            ->concat($users->pluck('uuid'))
            ->concat($users->pluck('id'))
            ->filter()
            ->map(function($v) { return (string)$v; })
            ->unique()
            ->values()
            ->all();

        $convos = \App\Models\Conversation::whereIn('user_id', $allIdentifiers)->pluck('id')->all();

        $messages = Message::where(function($query) use ($allIdentifiers, $convos) {
            $query->whereIn('session_id', $allIdentifiers)
                  ->orWhereIn('sender_id', $allIdentifiers);
            if (\Illuminate\Support\Facades\Schema::hasColumn('messages', 'user_id')) {
                $query->orWhereIn('user_id', $allIdentifiers);
            }
            if (!empty($convos)) {
                $query->orWhereIn('conversation_id', $convos);
            }
        })
        ->orderBy('id', 'asc')
        ->get();

        return $messages;
    }

    public function getConversation(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $conversation = Conversation::firstOrCreate([
            'user_id' => $user->uuid,
        ]);

        $license = License::where('user_id', $user->uuid)->latest()->first();
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

        if ($licenseStatus !== 'active' && $user->phone) {
            $cleanPhone = preg_replace('/\D/', '', $user->phone);
            $last10 = ($cleanPhone && strlen($cleanPhone) >= 10) ? substr($cleanPhone, -10) : $cleanPhone;
            $appClient = \App\Models\AppClient::where(function ($q) use ($user, $cleanPhone, $last10) {
                $q->where('phone', $user->phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->first();

            if ($appClient && $appClient->is_active) {
                if (!$appClient->expires_at || $appClient->expires_at->isFuture()) {
                    $licenseStatus = 'active';
                }
            }
        }

        $messages = $this->fetchAllUserMessages($user);

        return response()->json([
            'success'        => true,
            'conversation_id'=> $conversation->id,
            'user_id'        => $user->uuid,
            'user'           => [
                'id'         => $user->uuid,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone,
            ],
            'license_status' => $licenseStatus,
            'assigned_license' => ($license && ($licenseStatus === 'inactive' || $licenseStatus === 'pending')) ? [
                'license_key' => $license->license_key,
                'status'      => $license->status,
            ] : null,
            'messages'       => $messages,
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $sessionId = $request->query('session_id') ?: session()->getId();
        $phone = $request->query('phone');

        $messages = $this->fetchAllUserMessages($user, $sessionId, $phone);

        return response()->json([
            'success' => true,
            'data'    => $messages
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $conversation = Conversation::firstOrCreate(['user_id' => $user->uuid]);

        $msg = Message::create([
            'conversation_id' => $conversation->id,
            'session_id'      => $user->uuid,
            'sender'          => 'user',
            'sender_type'     => 'user',
            'sender_id'       => $user->uuid,
            'sender_name'     => trim(($user->first_name ?: $user->name) . ' ' . ($user->last_name ?: '')),
            'message'         => trim($request->input('message')),
            'attachment_path' => $request->input('attachment_path'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
            'data'    => $msg
        ]);
    }
}
