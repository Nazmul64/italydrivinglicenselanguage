<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMcqResult;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class CorrectMcqsApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get user's correct answered MCQs.
     */
    public function index(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];

        $query = UserMcqResult::query();

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

        // Strict user scoping (do not leak other users' correct MCQs)

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
                    'image' => $c->image ?: null,
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