<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Get random practice test questions.
     */
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 30);
        $questions = Question::inRandomOrder()->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    /**
     * Submit practice test results.
     */
    public function submitResult(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'total_questions' => 'required|integer',
            'correct_count' => 'required|integer',
            'wrong_count' => 'required|integer',
            'answers' => 'nullable|array'
        ]);

        $result = UserMcqResult::create([
            'user_id' => auth()->id() ?? $request->get('user_id'),
            'test_type' => 'practice_test',
            'total_questions' => $validated['total_questions'],
            'correct_count' => $validated['correct_count'],
            'wrong_count' => $validated['wrong_count'],
            'answers' => json_encode($request->get('answers', [])),
            'is_passed' => $validated['wrong_count'] <= 3
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Practice test submitted successfully',
            'data' => $result
        ]);
    }
}
