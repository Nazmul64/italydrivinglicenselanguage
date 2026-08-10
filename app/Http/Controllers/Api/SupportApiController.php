<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\License;

class SupportApiController extends Controller
{
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
        $licenseStatus = $license ? $license->status : 'inactive';

        $messages = Message::where('conversation_id', $conversation->id)
            ->orWhere('session_id', $user->uuid)
            ->orderBy('created_at', 'asc')
            ->get();

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
        if (!$user) {
            // Fallback for public demo / website session
            $sessionId = $request->query('session_id') ?: session()->getId();
            $messages = Message::where('session_id', $sessionId)
                ->orderBy('created_at', 'asc')
                ->get();
            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        }

        $conversation = Conversation::firstOrCreate(['user_id' => $user->uuid]);
        $messages = Message::where('conversation_id', $conversation->id)
            ->orWhere('session_id', $user->uuid)
            ->orderBy('created_at', 'asc')
            ->get();


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
            'sender_name'     => $user->first_name . ' ' . $user->last_name,
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
