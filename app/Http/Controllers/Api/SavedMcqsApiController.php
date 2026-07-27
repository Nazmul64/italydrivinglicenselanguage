<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedMcq;
use App\Models\Note;
use Illuminate\Http\Request;

class SavedMcqsApiController extends Controller
{
    /**
     * Get user's bookmarked saved MCQs.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? $request->query('user_id');
        $sessionId = $request->query('session_id') ?: session()->getId();

        $query = SavedMcq::with(['question.page.chapter']);

        if ($userId) {
            $query->where(function ($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId);
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } else {
            $query->where('session_id', $sessionId);
        }

        $saved = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $saved
        ]);
    }

    /**
     * Toggle bookmark state for a question.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'question_id' => 'required',
        ]);

        $userId = auth()->id() ?? $request->input('user_id');
        $sessionId = $request->input('session_id') ?: session()->getId();
        $questionId = $request->input('question_id');

        $query = SavedMcq::where('question_id', $questionId);
        if ($userId) {
            $query->where(function ($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId)->orWhere('session_id', $sessionId);
            });
        } else {
            $query->where('session_id', $sessionId);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'status' => 'success',
                'saved' => false,
                'message' => 'Question removed from bookmarks'
            ]);
        } else {
            $created = SavedMcq::create([
                'session_id' => $userId ? null : $sessionId,
                'user_id' => $userId,
                'question_id' => $questionId
            ]);
            return response()->json([
                'status' => 'success',
                'saved' => true,
                'message' => 'Question added to bookmarks',
                'data' => $created
            ]);
        }
    }
}
