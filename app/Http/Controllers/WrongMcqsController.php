<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class WrongMcqsController extends Controller
{
    /**
     * Get incorrectly answered MCQs list.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? 1;
        $results = UserMcqResult::where('user_id', $userId)
            ->where('wrong_count', '>', 0)
            ->get();

        $wrongIds = [];
        foreach ($results as $res) {
            $answers = json_decode($res->answers, true) ?? [];
            foreach ($answers as $qId => $isCorrect) {
                if (!$isCorrect) {
                    $wrongIds[] = $qId;
                }
            }
        }

        $wrongIds = array_unique($wrongIds);
        $questions = Question::whereIn('id', $wrongIds)->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $questions
            ]);
        }

        return view('frontend.screens.wrong_mcqs', compact('questions'));
    }
}
