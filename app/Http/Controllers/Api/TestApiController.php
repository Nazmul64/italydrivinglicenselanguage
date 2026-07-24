<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class TestApiController extends Controller
{
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 30);
        $questions = Question::inRandomOrder()->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }

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
            'status' => 'success',
            'message' => 'Practice test result submitted successfully',
            'data' => $result
        ]);
    }
}
