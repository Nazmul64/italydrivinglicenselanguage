<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class SfidaApiController extends Controller
{
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 20);
        $questions = Question::inRandomOrder()->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }
}
