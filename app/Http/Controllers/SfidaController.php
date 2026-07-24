<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class SfidaController extends Controller
{
    /**
     * Get rapid-fire speed challenge questions.
     */
    public function getQuestions(Request $request)
    {
        $limit = $request->get('limit', 20);
        $questions = Question::inRandomOrder()->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }
}
