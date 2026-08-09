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
        $userId = auth()->id() ?? $request->query('user_id');
        $sessionId = $request->query('session_id') ?: session()->getId();

        $query = UserMcqResult::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where(function($q) use ($sessionId) {
                $q->where('session_id', $sessionId)->orWhereNull('user_id');
            });
        }
        $results = $query->get();

        $correctIds = [];
        foreach ($results as $res) {
            if (!empty($res->question_id) && ($res->is_correct == 1 || $res->is_correct === true || $res->is_correct === '1')) {
                $correctIds[] = (int)$res->question_id;
            }
            if (!empty($res->answers)) {
                $answers = is_string($res->answers) ? json_decode($res->answers, true) : $res->answers;
                if (is_array($answers)) {
                    foreach ($answers as $qId => $item) {
                        if (is_array($item)) {
                            $qIdVal = $item['question_id'] ?? ($item['id'] ?? null);
                            $isCorr = $item['is_correct'] ?? ($item['correct'] ?? null);
                            if ($qIdVal && ($isCorr === true || $isCorr == 1 || $isCorr === '1')) {
                                $correctIds[] = (int)$qIdVal;
                            }
                        } else if ($item) {
                            $correctIds[] = (int)$qId;
                        }
                    }
                }
            }
        }

        $correctIds = array_values(array_unique(array_filter($correctIds)));
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
