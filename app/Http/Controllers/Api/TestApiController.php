<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class TestApiController extends Controller
{
    /**
     * Get random practice questions or chapter questions.
     */
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 30);
        $chapter = $request->get('chapter');

        $query = Question::query();
        if ($chapter) {
            $query->where('chapter', $chapter)->orWhere('chapter_id', $chapter);
        } else {
            $query->inRandomOrder();
        }

        $questions = $query->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }

    /**
     * Submit user test practice result log.
     */
    public function submitResult(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'session_id' => 'nullable|string',
            'total_questions' => 'required|integer',
            'correct_count' => 'required|integer',
            'wrong_count' => 'required|integer',
            'answers' => 'nullable|array'
        ]);

        $sessionId = $validated['session_id'] ?? session()->getId();

        $result = UserMcqResult::create([
            'user_id' => auth()->id() ?? ($validated['user_id'] ?? null),
            'session_id' => $sessionId,
            'test_type' => 'practice_test',
            'total_questions' => $validated['total_questions'],
            'correct_count' => $validated['correct_count'],
            'wrong_count' => $validated['wrong_count'],
            'answers' => json_encode($request->get('answers', [])),
            'is_passed' => $validated['wrong_count'] <= 3
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Practice test result submitted successfully',
            'data' => $result
        ]);
    }
}
