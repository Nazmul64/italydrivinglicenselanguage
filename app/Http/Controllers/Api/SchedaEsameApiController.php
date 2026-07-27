<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\UserMcqResult;
use Illuminate\Http\Request;

class SchedaEsameApiController extends Controller
{
    /**
     * Generate an official 30-question Scheda Esame simulation paper.
     */
    public function generateSheet()
    {
        $argomentiQuestions = Question::inRandomOrder()->limit(20)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'type' => 'argomenti',
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'is_vero' => $q->is_vero === 1 || $q->is_vero === true || $q->is_vero === '1' || strtolower((string)$q->correct_answer) === 'vero',
                'image' => $q->image,
                'audio' => $q->audio,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $cartelliQuestions = CartelloMcq::where('status', true)->inRandomOrder()->limit(10)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'type' => 'cartelli',
                'italian' => $q->question,
                'bangla' => $q->bn_question,
                'is_vero' => strtolower((string)$q->correct_answer) === 'vero' || $q->correct_answer === '1' || $q->correct_answer === 1,
                'image' => $q->image,
                'audio' => $q->voice,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $combined = $argomentiQuestions->concat($cartelliQuestions)->shuffle()->take(30)->values();

        return response()->json([
            'status' => 'success',
            'duration_minutes' => 20,
            'max_allowed_errors' => 3,
            'total_questions' => 30,
            'data' => $combined
        ]);
    }

    /**
     * Submit completed Scheda Esame exam paper.
     */
    public function submitExam(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'session_id' => 'nullable|string',
            'total_questions' => 'required|integer',
            'correct_count' => 'required|integer',
            'wrong_count' => 'required|integer',
            'answers' => 'nullable|array'
        ]);

        $sessionId = $validated['session_id'] ?? session()->getId();
        $isPassed = $validated['wrong_count'] <= 3;

        $result = UserMcqResult::create([
            'user_id' => auth()->id() ?? ($validated['user_id'] ?? null),
            'session_id' => $sessionId,
            'test_type' => 'scheda_esame',
            'total_questions' => $validated['total_questions'],
            'correct_count' => $validated['correct_count'],
            'wrong_count' => $validated['wrong_count'],
            'answers' => json_encode($request->get('answers', [])),
            'is_passed' => $isPassed
        ]);

        return response()->json([
            'status' => 'success',
            'is_passed' => $isPassed,
            'result_status' => $isPassed ? 'PROMOSSO (PASSED)' : 'BOCCIATO (FAILED)',
            'message' => $isPassed ? 'Congratulations! You passed the Scheda Esame.' : 'You failed. Maximum 3 errors allowed.',
            'data' => $result
        ]);
    }
}
