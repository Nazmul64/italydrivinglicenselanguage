<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedMcq;
use App\Models\Question;
use Illuminate\Http\Request;

class SavedMcqsApiController extends Controller
{
    public function index()
    {
        $userId = auth()->id() ?? 1;
        $savedIds = SavedMcq::where('user_id', $userId)->pluck('question_id');
        $questions = Question::whereIn('id', $savedIds)->get();

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'question_id' => 'required|integer'
        ]);

        $userId = auth()->id() ?? 1;
        $questionId = $request->input('question_id');

        $existing = SavedMcq::where('user_id', $userId)
            ->where('question_id', $questionId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'status' => 'success',
                'saved' => false,
                'message' => 'Bookmark removed'
            ]);
        } else {
            SavedMcq::create([
                'user_id' => $userId,
                'question_id' => $questionId
            ]);
            return response()->json([
                'status' => 'success',
                'saved' => true,
                'message' => 'Question bookmarked'
            ]);
        }
    }
}
