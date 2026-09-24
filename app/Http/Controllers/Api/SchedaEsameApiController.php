<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\Chapter;
use App\Models\UserMcqResult;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class SchedaEsameApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Generate an official 30-question Scheda Esame simulation paper.
     */
    public function generateSheet()
    {
        $argomentiQuestions = Question::inRandomOrder()->limit(20)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'type' => 'argomenti',
                'chapter_id' => $q->chapter ?: ($q->page ? $q->page->chapter_id : 1),
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'is_vero' => $q->is_vero === 1 || $q->is_vero === true || $q->is_vero === '1' || strtolower((string)$q->correct_answer) === 'vero',
                'image' => !empty($q->image) ? \App\Helpers\ImageHelper::formatImageUrl($q->image) : null,
                'audio' => $q->audio,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $cartelliQuestions = CartelloMcq::where('status', true)->inRandomOrder()->limit(10)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'type' => 'cartelli',
                'chapter_id' => $q->page ? $q->page->chapter_id : 1,
                'italian' => $q->question,
                'bangla' => $q->bn_question,
                'is_vero' => strtolower((string)$q->correct_answer) === 'vero' || $q->correct_answer === '1' || $q->correct_answer === 1,
                'image' => !empty($q->image) ? \App\Helpers\ImageHelper::formatImageUrl($q->image) : null,
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
     * Submit completed Scheda Esame exam paper and log individual question results.
     */
    public function submitExam(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userId = $context['user_id'];
        $userIds = $context['user_ids'];
        $sessionId = $context['session_id'];
        $sessionIds = $context['session_ids'];

        $totalQuestions = (int)($request->input('total_questions') ?: $request->input('total') ?: 30);
        $rawCorrectCount = $request->input('correct_count');
        $rawWrongCount = $request->input('wrong_count');
        
        $answers = $request->input('answers') 
            ?? $request->input('results') 
            ?? $request->input('data') 
            ?? [];

        if (is_string($answers)) {
            $decoded = json_decode($answers, true);
            if (is_array($decoded)) {
                $answers = $decoded;
            }
        }

        $logged = [];
        $calculatedCorrect = 0;
        $calculatedWrong = 0;

        if (is_array($answers)) {
            foreach ($answers as $key => $item) {
                $qIdRaw = null;
                $userAns = null;
                $isCorrectRaw = null;
                $qType = 'argomenti';

                if (is_array($item)) {
                    $qIdRaw = $item['question_id'] ?? ($item['id'] ?? ($item['mcq_id'] ?? null));
                    $qType = $item['question_type'] ?? ($item['type'] ?? 'argomenti');
                    $userAns = $item['user_answer'] ?? ($item['userAnswer'] ?? ($item['answer'] ?? null));
                    $isCorrectRaw = $item['is_correct'] ?? ($item['isCorrect'] ?? ($item['correct'] ?? null));
                } else {
                    $qIdRaw = is_numeric($key) ? $key : null;
                    if (is_bool($item)) {
                        $isCorrectRaw = $item;
                    } elseif (is_string($item) && (strtoupper($item) === 'V' || strtoupper($item) === 'F')) {
                        $userAns = strtoupper($item);
                    } else {
                        $isCorrectRaw = (bool)$item;
                    }
                }

                if (!$qIdRaw) continue;

                if (is_string($qIdRaw) && str_starts_with($qIdRaw, 'cartelli_')) {
                    $qType = 'cartelli';
                }
                $qIdNum = (int)str_replace('cartelli_', '', (string)$qIdRaw);
                if (!$qIdNum) continue;

                if (is_bool($userAns)) {
                    $userAns = $userAns ? 'V' : 'F';
                }

                $pageId = null;
                $chapterId = null;
                $categoryId = null;
                $correctDatabaseAnswer = null;

                if ($qType === 'cartelli') {
                    $cartelloQ = CartelloMcq::find($qIdNum);
                    if ($cartelloQ) {
                        $pageId = $cartelloQ->page_id;
                        $chapterId = $cartelloQ->page ? $cartelloQ->page->chapter_id : null;
                        $correctDatabaseAnswer = (strtolower((string)$cartelloQ->correct_answer) === 'vero' || $cartelloQ->correct_answer === '1' || $cartelloQ->correct_answer === 1) ? 'V' : 'F';
                    }
                } else {
                    $question = Question::find($qIdNum);
                    if ($question) {
                        $pageId = $question->page_id;
                        $chapterId = $question->chapter;
                        if ($chapterId) {
                            $chapter = Chapter::find($chapterId);
                            if ($chapter) $categoryId = $chapter->category_id;
                        }
                        $correctDatabaseAnswer = ($question->is_vero === 1 || $question->is_vero === true || $question->is_vero === '1' || strtolower((string)$question->correct_answer) === 'vero') ? 'V' : 'F';
                    } else {
                        $cartelloQ = CartelloMcq::find($qIdNum);
                        if ($cartelloQ) {
                            $qType = 'cartelli';
                            $pageId = $cartelloQ->page_id;
                            $chapterId = $cartelloQ->page ? $cartelloQ->page->chapter_id : null;
                            $correctDatabaseAnswer = (strtolower((string)$cartelloQ->correct_answer) === 'vero' || $cartelloQ->correct_answer === '1' || $cartelloQ->correct_answer === 1) ? 'V' : 'F';
                        }
                    }
                }

                if ($isCorrectRaw !== null) {
                    $isCorrect = ($isCorrectRaw === true || $isCorrectRaw === 1 || $isCorrectRaw === '1' || $isCorrectRaw === 'true' || strtolower((string)$isCorrectRaw) === 'vero');
                } elseif ($userAns && $correctDatabaseAnswer) {
                    $isCorrect = (strtoupper($userAns) === strtoupper($correctDatabaseAnswer));
                } else {
                    $isCorrect = false;
                }

                if ($isCorrect) {
                    $calculatedCorrect++;
                } else {
                    $calculatedWrong++;
                }

                $query = UserMcqResult::where('question_id', $qIdNum);
                if ($qType === 'cartelli') {
                    $query->where('question_type', 'cartelli');
                } else {
                    $query->where(function($sq) {
                        $sq->where('question_type', 'argomenti')->orWhereNull('question_type');
                    });
                }

                if (!empty($userIds) || !empty($sessionIds)) {
                    $query->where(function($q) use ($userIds, $sessionIds) {
                        if (!empty($userIds)) {
                            $q->whereIn('user_id', $userIds);
                        }
                        if (!empty($sessionIds)) {
                            if (!empty($userIds)) {
                                $q->orWhereIn('session_id', $sessionIds);
                            } else {
                                $q->whereIn('session_id', $sessionIds);
                            }
                        }
                    });
                }

                $existing = $query->first();

                $data = [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'question_id' => $qIdNum,
                    'question_type' => $qType,
                    'user_answer' => $userAns,
                    'is_correct' => $isCorrect ? 1 : 0,
                    'category_id' => $categoryId,
                    'chapter_id' => $chapterId,
                    'page_id' => $pageId,
                ];

                if ($existing) {
                    if ($isCorrect) {
                        $data['correct_count'] = ($existing->correct_count ?: 0) + 1;
                        $data['wrong_count'] = ($existing->wrong_count ?: 0);
                    } else {
                        $data['correct_count'] = ($existing->correct_count ?: 0);
                        $data['wrong_count'] = ($existing->wrong_count ?: 0) + 1;
                    }
                    $existing->update($data);
                    $logged[] = $existing;
                } else {
                    $data['correct_count'] = $isCorrect ? 1 : 0;
                    $data['wrong_count'] = $isCorrect ? 0 : 1;
                    $logged[] = UserMcqResult::create($data);
                }
            }
        }

        $finalCorrect = $rawCorrectCount !== null ? (int)$rawCorrectCount : $calculatedCorrect;
        $finalWrong = $rawWrongCount !== null ? (int)$rawWrongCount : $calculatedWrong;
        $isPassed = $finalWrong <= 3;

        return response()->json([
            'status' => 'success',
            'success' => true,
            'is_passed' => $isPassed,
            'result_status' => $isPassed ? 'PROMOSSO (PASSED)' : 'BOCCIATO (FAILED)',
            'total_questions' => $totalQuestions,
            'correct_count' => $finalCorrect,
            'wrong_count' => $finalWrong,
            'processed_answers' => count($logged),
            'message' => $isPassed ? 'Complimenti! Hai superato la Scheda Esame.' : 'Esame non superato. Massimo 3 errori consentiti.'
        ]);
    }
}
