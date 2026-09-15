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

        if (!$user && empty($sessionId) && empty($phone)) {
            return collect([]);
        }

        $identifiers = collect([$sessionId])->filter();
        $cleanPhone = $phone ? preg_replace('/\D/', '', $phone) : null;
        $last10 = ($cleanPhone && strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;

        $clients = collect([]);
        $users = collect([]);

        if ($sessionId || $phone) {
            $cQuery = \App\Models\AppClient::query();
            $cQuery->where(function($q) use ($sessionId, $phone, $cleanPhone, $last10) {
                if ($sessionId) {
                    $q->where('session_id', $sessionId);
                }
                if ($phone) {
                    $q->orWhere('phone', $phone);
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                        if (!empty($last10)) {
                            $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                        }
                    }
                }
            });
            $clients = $cQuery->get();

            $uQuery = \App\Models\User::query();
            $uQuery->where(function($q) use ($sessionId, $phone, $cleanPhone, $last10) {
                if ($sessionId) {
                    $q->where('uuid', $sessionId);
                }
                if ($phone) {
                    $q->orWhere('phone', $phone);
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                        if (!empty($last10)) {
                            $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                        }
                    }
                }
            });
            $users = $uQuery->get();
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

        if (empty($allIdentifiers)) {
            return collect([]);
        }

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

    public function uploadImage(Request $request)
    {
        $attachmentPath = \App\Helpers\ChatAttachmentHelper::processUpload($request);
        if (!$attachmentPath) {
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'No image file uploaded or invalid format. Please upload JPG, PNG, WEBP, or GIF image.'
            ], 422);
        }

        $fullUrl = url($attachmentPath);

        return response()->json([
            'status'          => 'success',
            'success'         => true,
            'message'         => 'Image uploaded successfully.',
            'image_url'       => $attachmentPath,
            'attachment_path' => $attachmentPath,
            'url'             => $fullUrl
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $sessionId = $request->input('session_id') ?: ($user ? $user->uuid : session()->getId());
        $phone = $request->input('phone') ?: ($user ? $user->phone : null);
        $messageText = trim($request->input('message') ?: $request->input('text') ?: '');
        
        $attachmentPath = \App\Helpers\ChatAttachmentHelper::processUpload($request);

        if (empty($messageText) && empty($attachmentPath)) {
            return response()->json([
                'status'  => 'error',
                'success' => false,
                'message' => 'Message text or image attachment is required.'
            ], 422);
        }

        if (empty($messageText) && !empty($attachmentPath)) {
            $messageText = 'ছবি পাঠানো হয়েছে';
        }

        $senderName = 'Guest User';
        if ($user) {
            $senderName = trim(($user->first_name ?: $user->name) . ' ' . ($user->last_name ?: ''));
        } elseif ($request->input('sender_name') || $request->input('first_name')) {
            $senderName = trim($request->input('sender_name') ?: ($request->input('first_name') . ' ' . $request->input('last_name')));
        }

        $conversationId = null;
        if ($user) {
            $conversation = Conversation::firstOrCreate(['user_id' => $user->uuid]);
            $conversationId = $conversation->id;
        }

        $msg = Message::create([
            'conversation_id' => $conversationId,
            'session_id'      => $sessionId,
            'sender'          => 'user',
            'sender_type'     => 'user',
            'sender_id'       => $user ? $user->uuid : $sessionId,
            'sender_name'     => $senderName,
            'message'         => $messageText,
            'attachment_path' => $attachmentPath,
        ]);

        return response()->json([
            'status'  => 'success',
            'success' => true,
            'message' => 'Message sent successfully.',
            'data'    => $msg
        ]);
    }
}
