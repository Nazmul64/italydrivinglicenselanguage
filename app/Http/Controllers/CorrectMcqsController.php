<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class CorrectMcqsController extends Controller
{
    /**
     * Get correctly answered MCQs list.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? 1;
        $results = UserMcqResult::where('user_id', $userId)
            ->where('correct_count', '>', 0)
            ->get();

        $correctIds = [];
        foreach ($results as $res) {
            $answers = json_decode($res->answers, true) ?? [];
            foreach ($answers as $qId => $isCorrect) {
                if ($isCorrect) {
                    $correctIds[] = $qId;
                }
            }
        }

        $correctIds = array_unique($correctIds);
        $questions = Question::whereIn('id', $correctIds)->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $questions
            ]);
        }

        return view('frontend.screens.correct_mcqs', compact('questions'));
    }
}
