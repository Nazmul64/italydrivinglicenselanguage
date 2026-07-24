<?php

namespace App\Http\Controllers;

use App\Models\SavedMcq;
use App\Models\Question;
use Illuminate\Http\Request;

class SavedMcqsController extends Controller
{
    /**
     * Get bookmarked / saved MCQs list.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? 1;
        $savedIds = SavedMcq::where('user_id', $userId)->pluck('question_id');
        $questions = Question::whereIn('id', $savedIds)->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $questions
            ]);
        }

        return view('frontend.screens.saved_mcqs', compact('questions'));
    }

    /**
     * Toggle saving / bookmarking a question.
     */
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
                'success' => true,
                'saved' => false,
                'message' => 'Bookmark removed'
            ]);
        } else {
            SavedMcq::create([
                'user_id' => $userId,
                'question_id' => $questionId
            ]);
            return response()->json([
                'success' => true,
                'saved' => true,
                'message' => 'Question bookmarked'
            ]);
        }
    }
}
