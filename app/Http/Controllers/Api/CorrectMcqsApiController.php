<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMcqResult;
use App\Models\Question;
use Illuminate\Http\Request;

class CorrectMcqsApiController extends Controller
{
    /**
     * Get user's correct answered MCQs.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? $request->query('user_id');
        $sessionId = $request->query('session_id') ?: session()->getId();

        $query = UserMcqResult::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $results = $query->get();
        $correctIds = [];

        foreach ($results as $r) {
            if ($r->answers) {
                $ansMap = is_array($r->answers) ? $r->answers : json_decode($r->answers, true);
                if (is_array($ansMap)) {
                    foreach ($ansMap as $qId => $state) {
                        if ($state === 'correct' || $state === true || $state === 1) {
                            $correctIds[] = (int)$qId;
                        }
                    }
                }
            }
        }

        $correctIds = array_unique($correctIds);
        $questions = Question::whereIn('id', $correctIds)->get();

        return response()->json([
            'status' => 'success',
            'total_correct' => count($questions),
            'data' => $questions
        ]);
    }
}
