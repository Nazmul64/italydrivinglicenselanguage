<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    /**
     * Get chat support messages.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? 1;
        $messages = Message::where('user_id', $userId)
            ->orWhere('sender_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send a support chat message.
     */
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
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $msg
        ]);
    }
}
