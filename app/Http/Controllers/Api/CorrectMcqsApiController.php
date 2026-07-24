<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class CorrectMcqsApiController extends Controller
{
    public function index()
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

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }
}
