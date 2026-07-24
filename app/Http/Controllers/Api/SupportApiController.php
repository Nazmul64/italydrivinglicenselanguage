<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class SupportApiController extends Controller
{
    public function index()
    {
        $userId = auth()->id() ?? 1;
        $messages = Message::where('user_id', $userId)
            ->orWhere('sender_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|string'
        ]);

        $userId = auth()->id() ?? 1;

        $msg = Message::create([
            'user_id' => $userId,
            'sender_id' => $userId,
            'message' => $validated['message'],
            'attachment' => $request->get('attachment')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => $msg
        ]);
    }
}
