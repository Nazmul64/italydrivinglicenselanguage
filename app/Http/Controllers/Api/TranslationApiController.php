<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dizionario;
use App\Models\Question;
use Illuminate\Http\Request;

class TranslationApiController extends Controller
{
    /**
     * Get dictionary translation popup details for a question or term.
     */
    public function getQuestionTranslation(Request $request)
    {
        $questionId = $request->get('question_id');
        $term = $request->get('term');

        if ($questionId) {
            $question = Question::find($questionId);
            if ($question) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'id' => $question->id,
                        'italian' => $question->italian,
                        'bangla' => $question->bangla,
                        'vocabulary' => $question->vocabulary ?? []
                    ]
                ]);
            }
        }

        if ($term) {
            $diz = Dizionario::where('italian', 'like', "%{$term}%")->first();
            return response()->json([
                'status' => 'success',
                'data' => [
                    'term' => $term,
                    'italian' => $diz ? $diz->italian : $term,
                    'bangla' => $diz ? $diz->bangla : 'অনুবাদ পাওয়া যায়নি',
                    'definition' => $diz ? $diz->definition : null
                ]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Please provide question_id or term parameter'
        ], 400);
    }
}
