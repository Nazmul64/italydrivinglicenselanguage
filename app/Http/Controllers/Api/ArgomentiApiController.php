<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use App\Models\SavedMcq;
use App\Models\Note;
use App\Models\UserMcqResult;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class ArgomentiApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get all theory chapters with questions count and progress data.
     */
    public function getChapters(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];
        $hasUser = !empty($userIds) || !empty($sessionIds);

        $chapters = Chapter::where('status', true)
            ->withCount(['pages'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $chapters->transform(function ($ch) use ($userIds, $sessionIds, $hasUser) {
            $pageIds = Page::where('chapter_id', $ch->id)->pluck('id');
            $questionIds = Question::where(function ($q) use ($ch, $pageIds) {
                $q->where('chapter', $ch->id)
                  ->orWhere('chapter', $ch->chapter_number)
                  ->orWhereIn('page_id', $pageIds);
            })->pluck('id')->toArray();

            $total = count($questionIds);
            $correct = 0;
            $wrong = 0;

            if ($hasUser && $total > 0) {
                $latestResults = UserMcqResult::whereIn('question_id', $questionIds)
                    ->where(function ($q) use ($userIds, $sessionIds) {
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
                    })
                    ->orderBy('updated_at', 'desc')
                    ->get()
                    ->unique('question_id');

                $correct = $latestResults->where('is_correct', 1)->count();
                $wrong = $latestResults->where('is_correct', 0)->count();
            }

            $unanswered = max(0, $total - $correct - $wrong);

            $ch->questions_count = $total;
            $ch->question_count = $total;
            $ch->corrette = $correct;
            $ch->errori = $wrong;
            $ch->non_risposte = $unanswered;
            $ch->totale = $total;
            $ch->total = $total;

            return $ch;
        });

        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    /**
     * Get pages for a specific chapter.
     */
    public function getChapterPages(Request $request, $id)
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];
        $hasUser = !empty($userIds) || !empty($sessionIds);

        $pages = Page::where('status', true)
            ->where(function ($query) use ($id) {
                $query->where('chapter_id', $id)
                    ->orWhereHas('chapter', function ($q) use ($id) {
                        $q->where('chapter_number', $id);
                    });
            })
            ->withCount('questions')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $pages->transform(function ($p) use ($userIds, $sessionIds, $hasUser) {
            $questionIds = Question::where('page_id', $p->id)->pluck('id')->toArray();
            $total = count($questionIds);
            $correct = 0;
            $wrong = 0;

            if ($hasUser && $total > 0) {
                $latestResults = UserMcqResult::whereIn('question_id', $questionIds)
                    ->where(function ($q) use ($userIds, $sessionIds) {
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
                    })
                    ->orderBy('updated_at', 'desc')
                    ->get()
                    ->unique('question_id');

                $correct = $latestResults->where('is_correct', 1)->count();
                $wrong = $latestResults->where('is_correct', 0)->count();
            }

            $unanswered = max(0, $total - $correct - $wrong);

            $p->questions_count = $total;
            $p->question_count = $total;
            $p->corrette = $correct;
            $p->errori = $wrong;
            $p->non_risposte = $unanswered;
            $p->totale = $total;
            $p->total = $total;

            return $p;
        });

        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get all pages across all chapters.
     */
    public function getAllPages()
    {
        $pages = Page::where('status', true)
            ->withCount('questions')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get details and MCQs of a specific page.
     */
    public function getPageDetails(Request $request, $id)
    {
        $page = Page::with(['chapter', 'questions' => function ($q) {
            $q->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
        }])->find($id);

        if (!$page) {
            return response()->json([
                'status' => 'error',
                'message' => 'Page not found',
                'data' => null
            ], 404);
        }

        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];
        $hasUser = !empty($userIds) || !empty($sessionIds);

        if ($hasUser && $page->questions) {
            $qIds = $page->questions->pluck('id')->toArray();
            
            $userResults = UserMcqResult::whereIn('question_id', $qIds)
                ->where(function ($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->get()
                ->keyBy('question_id');

            $savedIds = \App\Models\SavedMcq::whereIn('question_id', $qIds)
                ->where(function ($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->pluck('question_id')
                ->toArray();

            $notes = \App\Models\Note::whereIn('question_id', $qIds)
                ->where(function ($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->get()
                ->keyBy('question_id');

            foreach ($page->questions as $question) {
                $res = $userResults->get($question->id);
                $question->user_answer = $res ? $res->user_answer : null;
                $question->is_correct = $res ? (bool)$res->is_correct : null;
                $question->correct_count = $res ? (int)$res->correct_count : 0;
                $question->wrong_count = $res ? (int)$res->wrong_count : 0;
                $question->is_saved = in_array($question->id, $savedIds);
                $question->user_note = $notes->has($question->id) ? $notes->get($question->id)->note_text : null;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $page
        ]);
    }
}
