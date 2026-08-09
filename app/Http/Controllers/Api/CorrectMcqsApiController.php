<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMcqResult;
use App\Models\Question;
use Illuminate\Http\Request;

class CorrectMcqsApiController extends Controller
{
    /**
     * Get user's correct answered MCQs.
     */
    public function index(Request $request)
    {
        $userId = auth()->id() ?? $request->query('user_id');
        $sessionId = $request->query('session_id') ?: session()->getId();

        $query = UserMcqResult::query();

        if ($userId) {
            $query->where(function($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId);
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } else {
            $query->where(function($q) use ($sessionId) {
                $q->where('session_id', $sessionId)
                  ->orWhereNull('user_id');
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

        return response()->json([
            'status' => 'success',
            'total_correct' => count($questions),
            'data' => $questions
        ]);
    }
}
