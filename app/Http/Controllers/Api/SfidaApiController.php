<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class SfidaApiController extends Controller
{
    /**
     * Get random questions for Sfida (Speed Challenge) mode.
     */
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 15);
        $questions = Question::inRandomOrder()->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'mode' => 'sfida_challenge',
            'data' => $questions
        ]);
    }
}
