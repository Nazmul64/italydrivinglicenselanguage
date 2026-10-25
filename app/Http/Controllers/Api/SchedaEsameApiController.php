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

class SchedaEsameApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Generate an official 30-question Scheda Esame simulation paper.
     * Smart Question Exclusion: Excludes questions previously answered correctly by this user.
     * Prioritizes unseen questions and previously incorrect questions.
     * When all questions have been correctly answered or the candidate pool is exhausted (<30),
     * automatically cycles/resets so all questions become available again!
     */
    public function generateSheet(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userId = $context['user_id'];
        $userIds = $context['user_ids'];
        $sessionId = $context['session_id'];
        $sessionIds = $context['session_ids'];

        // Get IDs of questions that this user has answered correctly
        $correctQuestionIds = [];
        $correctCartelliIds = [];

        if (!empty($userIds) || !empty($sessionIds) || $sessionId) {
            $userResultsQuery = UserMcqResult::where('is_correct', 1);
            $userResultsQuery->where(function($q) use ($userIds, $sessionIds, $sessionId) {
                if (!empty($userIds)) {
                    $q->whereIn('user_id', $userIds);
                }
                $effectiveSessions = !empty($sessionIds) ? $sessionIds : ($sessionId ? [$sessionId] : []);
                if (!empty($effectiveSessions)) {
                    if (!empty($userIds)) {
                        $q->orWhereIn('session_id', $effectiveSessions);
                    } else {
                        $q->whereIn('session_id', $effectiveSessions);
                    }
                }
            });

            $userResults = $userResultsQuery->get(['question_id', 'question_type']);
            foreach ($userResults as $res) {
                if ($res->question_type === 'cartelli') {
                    $correctCartelliIds[] = (int)$res->question_id;
                } else {
                    $correctQuestionIds[] = (int)$res->question_id;
                }
            }
        }

        // Available candidate questions in Argomenti (excluding correctly answered ones)
        $argomentiQuery = Question::query();
        if (!empty($correctQuestionIds)) {
            $argomentiQuery->whereNotIn('id', $correctQuestionIds);
        }
        $argomentiCount = (clone $argomentiQuery)->count();

        // Available candidate questions in Cartelli (excluding correctly answered ones)
        $cartelliQuery = CartelloMcq::where('status', true);
        if (!empty($correctCartelliIds)) {
            $cartelliQuery->whereNotIn('id', $correctCartelliIds);
        }
        $cartelliCount = (clone $cartelliQuery)->count();

        // If remaining questions in pool is less than 30 (user answered all questions correctly or pool exhausted),
        // automatically cycle/reset so all questions become available again!
        $totalRemaining = $argomentiCount + $cartelliCount;
        $poolReset = false;
        if ($totalRemaining < 30) {
            $poolReset = true;
            $argomentiQuery = Question::query();
            $cartelliQuery = CartelloMcq::where('status', true);
        }

        $argomentiQuestions = $argomentiQuery->inRandomOrder()->limit(30)->get()->map(function ($q) {
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

        $cartelliQuestions = $cartelliQuery->inRandomOrder()->limit(30)->get()->map(function ($q) {
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
            'total_questions' => min(30, $combined->count()),
            'pool_reset' => $poolReset,
            'data' => $combined
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
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
        // User Rule: 27+ correct (out of 30) is Promosso (Passed). 26 or less is Bocciato (Failed).
        $isPassed = $finalCorrect >= 27;

        // If passed, record this student's exam sheet into ExamSheet so it shows on the Passed List!
        if ($isPassed) {
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

                // Format answers for ExamSheet questions list
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
                    'correct_count' => $finalCorrect,
                    'wrong_count' => $finalWrong,
                    'unanswered_count' => max(0, $totalQuestions - ($finalCorrect + $finalWrong)),
                    'total_count' => $totalQuestions,
                    'answers' => $formattedSheetAnswers,
                    'user_id' => $userId,
                    'session_id' => $sessionId,
                ]);
            } catch (\Throwable $e) {
                \Log::error("Failed to store passed ExamSheet: " . $e->getMessage());
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
            'message' => $isPassed ? 'Complimenti! Hai superato la Scheda Esame.' : 'Esame non superato. Minimo 27 risposte corrette richieste.'
        ]);
    }

    /**
     * Get list of passed exams for display in mobile app and web.
     */
    public function getPassedExams(Request $request)
    {
        $search = $request->query('search') ?: $request->query('query');
        $query = ExamSheet::where(function($q) {
            $q->where('is_passed', true)
              ->orWhere('status', 'completed');
        });

        if ($search) {
            $query->where(function($sq) use ($search) {
                $sq->where('student_name', 'like', "%{$search}%")
                   ->orWhere('motorizzazione', 'like', "%{$search}%")
                   ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $exams = $query->orderBy('id', 'desc')->get()->map(function($ex) {
            return [
                'id' => $ex->id,
                'student_name' => $ex->student_name,
                'avatar' => !empty($ex->avatar) ? \App\Helpers\ImageHelper::formatImageUrl($ex->avatar) : null,
                'motorizzazione' => $ex->motorizzazione,
                'exam_date' => $ex->exam_date,
                'status' => $ex->status,
                'is_passed' => (bool)$ex->is_passed,
                'correct_count' => $ex->correct_count,
                'wrong_count' => $ex->wrong_count,
                'unanswered_count' => $ex->unanswered_count,
                'total_count' => $ex->total_count ?: 30,
                'created_at' => $ex->created_at ? $ex->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $exams->count(),
            'data' => $exams
        ]);
    }

    /**
     * Get detailed questions of a single passed exam sheet.
     */
    public function getExamSheetDetails($id)
    {
        $exam = ExamSheet::find($id);
        if (!$exam) {
            return response()->json(['status' => 'error', 'message' => 'Scheda non trovata'], 404);
        }

        $answers = $exam->answers;
        // If answers are empty, populate from random questions if needed
        if (empty($answers) || !is_array($answers) || count($answers) === 0) {
            $questions = Question::inRandomOrder()->limit(30)->get();
            $answers = [];
            foreach ($questions as $q) {
                $answers[] = [
                    'id' => $q->id,
                    'type' => 'argomenti',
                    'italian' => $q->italian,
                    'bangla' => $q->bangla,
                    'is_vero' => ($q->is_vero == 1 || $q->is_vero === true || $q->is_vero == '1' || strtolower((string)$q->correct_answer) === 'vero'),
                    'user_answer' => null,
                    'image' => !empty($q->image) ? \App\Helpers\ImageHelper::formatImageUrl($q->image) : null,
                    'audio' => $q->audio,
                    'video' => $q->video,
                    'vocabulary' => $q->vocabulary ?? []
                ];
            }
            $exam->update(['answers' => $answers]);
        } else {
            // Ensure image URLs are formatted
            foreach ($answers as &$a) {
                if (!empty($a['image'])) {
                    $a['image'] = \App\Helpers\ImageHelper::formatImageUrl($a['image']);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'id' => $exam->id,
            'student_name' => $exam->student_name,
            'avatar' => !empty($exam->avatar) ? \App\Helpers\ImageHelper::formatImageUrl($exam->avatar) : null,
            'motorizzazione' => $exam->motorizzazione,
            'exam_date' => $exam->exam_date,
            'correct_count' => $exam->correct_count,
            'wrong_count' => $exam->wrong_count,
            'unanswered_count' => $exam->unanswered_count,
            'total_count' => $exam->total_count ?: count($answers),
            'questions' => $answers
        ]);
    }
}
