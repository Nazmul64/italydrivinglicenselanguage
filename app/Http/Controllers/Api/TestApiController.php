<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\Chapter;
use App\Models\UserMcqResult;
use App\Models\ExamSheet;
use App\Models\User;
use App\Models\AppClient;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class TestApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get random practice questions or chapter questions.
     * Excludes correctly answered questions for the user; auto-resets when pool has < limit remaining.
     */
    public function getQuestions(Request $request)
    {
        $limit = (int)($request->get('limit', 30));
        $chapter = $request->get('chapter') ?: $request->get('chapter_id');

        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];

        $query = Question::query();
        if ($chapter) {
            $query->where(function($q) use ($chapter) {
                $q->where('chapter', $chapter)->orWhere('chapter_id', $chapter);
            });
        }

        // Exclude correctly answered questions for this user/session
        if (!empty($userIds) || !empty($sessionIds)) {
            $correctQuery = UserMcqResult::where('is_correct', 1)
                ->where(function($q) {
                    $q->where('question_type', 'argomenti')->orWhereNull('question_type');
                });

            $correctQuery->where(function($sq) use ($userIds, $sessionIds) {
                if (!empty($userIds)) {
                    $sq->whereIn('user_id', $userIds);
                }
                if (!empty($sessionIds)) {
                    $sq->orWhereIn('session_id', $sessionIds);
                }
            });

            $correctIds = $correctQuery->pluck('question_id')->toArray();

            // Check remaining pool count
            $countQuery = clone $query;
            $remaining = $countQuery->whereNotIn('id', $correctIds)->count();

            // Only exclude if at least $limit questions remain, otherwise auto-cycle/reset
            if ($remaining >= $limit) {
                $query->whereNotIn('id', $correctIds);
            }
        }

        $query->inRandomOrder();
        $questions = $query->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $questions
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
    }

    /**
     * Submit user test practice result log and individual MCQ outcomes.
     */
    public function submitResult(Request $request)
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

                $userContextSessionIds = $sessionIds;
                if (empty($userIds) && empty($userContextSessionIds)) {
                    if ($sessionId) $userContextSessionIds = [$sessionId];
                }

                if (!empty($userIds) || !empty($userContextSessionIds)) {
                    $query->where(function($q) use ($userIds, $userContextSessionIds) {
                        if (!empty($userIds)) {
                            $q->whereIn('user_id', $userIds);
                        }
                        if (!empty($userContextSessionIds)) {
                            if (!empty($userIds)) {
                                $q->orWhereIn('session_id', $userContextSessionIds);
                            } else {
                                $q->whereIn('session_id', $userContextSessionIds);
                            }
                        }
                    });
                    $existing = $query->first();
                } else {
                    $existing = null;
                }

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
                    $recentlyUpdated = $existing->updated_at && $existing->updated_at->diffInSeconds(now()) < 10;
                    if ($recentlyUpdated && (int)$existing->is_correct === ($isCorrect ? 1 : 0) && (string)$existing->user_answer === (string)$userAns) {
                        // Duplicate/concurrent submission protection: do not double-increment
                        $data['correct_count'] = $existing->correct_count ?: ($isCorrect ? 1 : 0);
                        $data['wrong_count'] = $existing->wrong_count ?: ($isCorrect ? 0 : 1);
                    } else {
                        if ($isCorrect) {
                            $data['correct_count'] = ($existing->correct_count ?: 0) + 1;
                            $data['wrong_count'] = ($existing->wrong_count ?: 0);
                        } else {
                            $data['correct_count'] = ($existing->correct_count ?: 0);
                            $data['wrong_count'] = ($existing->wrong_count ?: 0) + 1;
                        }
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
        // User Rule: 27, 28, 29, 30 correct = Pass (Promosso/Idoneo). 26 or less = Fail (Bocciato).
        $isPassed = ($totalQuestions >= 30) ? ($finalCorrect >= 27) : ($finalCorrect >= ceil($totalQuestions * 0.9));

        if ($isPassed && $totalQuestions >= 30) {
            try {
                $studentName = $request->input('student_name') ?: $request->input('name');
                $avatar = $request->input('avatar');
                $motorizzazione = $request->input('motorizzazione') ?: 'Motorizzazione Civile';

                if (!$studentName || $studentName === 'Candidato Patente B') {
                    if ($userId) {
                        $u = User::find($userId);
                        if ($u) {
                            $studentName = trim($u->name ?: ($u->first_name . ' ' . $u->last_name));
                            if (!$avatar) $avatar = $u->avatar;
                        }
                    }
                    if (!$studentName || $studentName === 'Candidato Patente B') {
                        $appClient = AppClient::where('session_id', $sessionId)->orWhere('phone', $request->input('phone'))->first();
                        if ($appClient) {
                            $studentName = trim($appClient->name ?: $studentName);
                            if (!$avatar) $avatar = $appClient->avatar;
                            if (!empty($appClient->city)) $motorizzazione = 'Motorizzazione di ' . $appClient->city;
                        }
                    }
                }

                if (!$studentName) {
                    $studentName = 'Candidato #' . rand(1000, 9999);
                }

                $formattedSheetAnswers = [];
                if (is_array($answers)) {
                    foreach ($answers as $idx => $ans) {
                        if (is_array($ans)) {
                            $formattedSheetAnswers[] = [
                                'id' => $ans['question_id'] ?? ($ans['id'] ?? ($idx + 1)),
                                'type' => $ans['question_type'] ?? ($ans['type'] ?? 'argomenti'),
                                'italian' => $ans['italian'] ?? ($ans['statement'] ?? ''),
                                'bangla' => $ans['bangla'] ?? ($ans['translation'] ?? ''),
                                'is_vero' => isset($ans['is_vero']) ? ($ans['is_vero'] === true || $ans['is_vero'] === 1 || $ans['is_vero'] === '1') : true,
                                'user_answer' => $ans['user_answer'] ?? null,
                                'is_correct' => $ans['is_correct'] ?? false,
                                'image' => $ans['image'] ?? null,
                                'audio' => $ans['audio'] ?? null,
                                'vocabulary' => $ans['vocabulary'] ?? [],
                            ];
                        }
                    }
                }

                ExamSheet::create([
                    'student_name' => $studentName,
                    'avatar' => $avatar,
                    'motorizzazione' => $motorizzazione,
                    'exam_date' => now()->format('d/m/Y'),
                    'status' => 'completed',
                    'is_passed' => true,
                    'user_id' => $userId,
                    'session_id' => $sessionId,
                    'correct_count' => $finalCorrect,
                    'wrong_count' => $finalWrong,
                    'unanswered_count' => max(0, $totalQuestions - $finalCorrect - $finalWrong),
                    'total_count' => $totalQuestions,
                    'answers' => $formattedSheetAnswers
                ]);
            } catch (\Exception $e) {
                \Log::warning("Could not auto-record passed exam in submitResult: " . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'success' => true,
            'is_passed' => $isPassed,
            'result_status' => $isPassed ? 'PROMOSSO (PASSED)' : 'BOCCIATO (FAILED)',
            'total_questions' => $totalQuestions,
            'correct_count' => $finalCorrect,
            'wrong_count' => $finalWrong,
            'processed_answers' => count($logged),
            'message' => 'Practice test result submitted and synchronized successfully'
        ]);
    }
}
