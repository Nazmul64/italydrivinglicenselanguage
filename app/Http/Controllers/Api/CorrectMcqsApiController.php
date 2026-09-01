<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMcqResult;
use App\Models\Question;
use App\Models\CartelloMcq;
use Illuminate\Http\Request;

class CorrectMcqsApiController extends Controller
{
    /**
     * Get user's correct answered MCQs.
     */
    public function index(Request $request)
    {
        $user = auth()->user() ?: $request->user();
        $userId = $user ? $user->id : $request->query('user_id');
        $phone = $request->query('phone') ?? $request->header('X-Client-Phone') ?? ($user ? $user->phone : session('app_client_phone'));
        $sessionId = $request->query('session_id') ?: $request->header('X-Session-ID') ?: session()->getId();

        $sessionIds = array_filter([$sessionId]);

        if (!$phone && $sessionId) {
            $clientBySession = \App\Models\AppClient::where("session_id", $sessionId)->first();
            if ($clientBySession && $clientBySession->phone) {
                $phone = $clientBySession->phone;
            } else {
                $userBySession = \App\Models\User::where("uuid", $sessionId)->first();
                if ($userBySession && $userBySession->phone) {
                    $phone = $userBySession->phone;
                }
            }
        }

        if (!$phone && !$userId) {
            $activeClient = \App\Models\AppClient::where("is_active", true)->latest()->first();
            if ($activeClient && $activeClient->phone) {
                $phone = $activeClient->phone;
            } else {
                $latestUser = \App\Models\User::whereNotNull("phone")->latest()->first();
                if ($latestUser) {
                    $phone = $latestUser->phone;
                }
            }
        }

        if (!$phone && $sessionId) {
            $clientBySession = \App\Models\AppClient::where('session_id', $sessionId)->first();
            if ($clientBySession && $clientBySession->phone) {
                $phone = $clientBySession->phone;
            } else {
                $userBySession = \App\Models\User::where('uuid', $sessionId)->first();
                if ($userBySession && $userBySession->phone) {
                    $phone = $userBySession->phone;
                }
            }
        }

        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $clientSessions = \App\Models\AppClient::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck('session_id')->filter()->toArray();

            $userSessions = \App\Models\User::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck('uuid')->filter()->toArray();

            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = \App\Models\User::where('phone', $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $query = UserMcqResult::query();

        if ($userId || !empty($sessionIds)) {
            $query->where(function($q) use ($userId, $sessionIds) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) {
                        $q->orWhereIn('session_id', $sessionIds);
                    } else {
                        $q->whereIn('session_id', $sessionIds);
                    }
                }
            });
        }

        if ($request->filled('chapter_id') || $request->filled('chapter')) {
            $chapId = $request->query('chapter_id') ?: $request->query('chapter');
            $query->where(function($q) use ($chapId) {
                $q->where('chapter_id', $chapId)
                  ->orWhereHas('question', function($q2) use ($chapId) {
                      $q2->where('chapter', $chapId)
                         ->orWhereHas('page', function($q3) use ($chapId) {
                             $q3->where('chapter_id', $chapId);
                         });
                  });
            });
        }

        if ($request->filled('page_id') || $request->filled('page')) {
            $pageId = $request->query('page_id') ?: $request->query('page');
            $query->where(function($q) use ($pageId) {
                $q->where('page_id', $pageId)
                  ->orWhereHas('question', function($q2) use ($pageId) {
                      $q2->where('page_id', $pageId);
                  });
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->query('date'));
        }

        $allResults = $query->orderBy('updated_at', 'desc')->get();

        $correctQuestionIds = [];

        foreach ($allResults as $res) {
            // Direct single question record
            if (!empty($res->question_id)) {
                if ($res->is_correct == 1 || $res->is_correct === true || $res->is_correct === '1') {
                    $correctQuestionIds[] = (int)$res->question_id;
                }
            }

            // Exam summary record with answers JSON
            if (!empty($res->answers)) {
                $ansArr = is_string($res->answers) ? json_decode($res->answers, true) : $res->answers;
                if (is_array($ansArr)) {
                    foreach ($ansArr as $key => $item) {
                        if (is_array($item)) {
                            $qId = $item['question_id'] ?? ($item['id'] ?? null);
                            $isCorr = $item['is_correct'] ?? ($item['correct'] ?? null);
                            if ($qId && ($isCorr === true || $isCorr == 1 || $isCorr === '1')) {
                                $correctQuestionIds[] = (int)$qId;
                            }
                        } else if (is_numeric($key)) {
                            if ($item === true || $item == 1 || $item === '1') {
                                $correctQuestionIds[] = (int)$key;
                            }
                        }
                    }
                }
            }
        }

        $correctQuestionIds = array_values(array_unique(array_filter($correctQuestionIds)));

        if (empty($correctQuestionIds)) {
            return response()->json([
                'status' => 'success',
                'total_correct' => 0,
                'data' => []
            ]);
        }

        $questionsQuery = Question::whereIn('id', $correctQuestionIds)
            ->with(['page.chapter.category']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $questionsQuery->where(function($q) use ($search) {
                $q->where('italian', 'like', "%{$search}%")
                  ->orWhere('bangla', 'like', "%{$search}%");
            });
        }

        $questions = $questionsQuery->get();
        $foundIds = $questions->pluck('id')->toArray();
        $missingIds = array_diff($correctQuestionIds, $foundIds);
        if (!empty($missingIds)) {
            $cartelliQuestions = CartelloMcq::whereIn('id', $missingIds)->with(['page.chapter'])->get();
            $mappedCartelli = $cartelliQuestions->map(function($c) {
                $page = $c->page;
                $chapter = $page ? $page->chapter : null;
                return (object)[
                    'id' => $c->id,
                    'chapter' => $chapter ? $chapter->id : 1,
                    'chapter_id' => $chapter ? $chapter->id : 1,
                    'chapter_name' => $chapter ? ($chapter->name ?? 'Cartelli') : 'Cartelli',
                    'italian' => $c->question ?? '',
                    'bangla' => $c->bn_question ?? '',
                    'is_vero' => $c->correct_answer === 'vero' || $c->correct_answer === '1' || $c->correct_answer === 1,
                    'image' => $c->image ?: ($page ? $page->image : null),
                    'audio' => $c->voice,
                    'video' => $c->video,
                    'vocabulary' => $c->vocabulary ?? [],
                    'type' => 'cartelli',
                ];
            });
            $questions = $questions->concat($mappedCartelli);
        }

        return response()->json([
            'status' => 'success',
            'total_correct' => count($questions),
            'data' => $questions
        ]);
    }
}