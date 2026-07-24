<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class WrongMcqsApiController extends Controller
{
    public function index()
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

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }
}
