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

        // Pre-fetch all pages and questions in 2 queries instead of 75 queries
        $pages = Page::where('status', true)->select('id', 'chapter_id')->get();
        $pagesByChapter = $pages->groupBy('chapter_id');

        $allQuestions = Question::select('id', 'chapter', 'page_id')->get();
        $questionsByPage = $allQuestions->whereNotNull('page_id')->groupBy('page_id');
        $questionsByChapter = $allQuestions->whereNotNull('chapter')->groupBy('chapter');

        $latestResultsByQ = collect();
        if ($hasUser) {
            $latestResultsByQ = UserMcqResult::where(function ($q) use ($userIds, $sessionIds) {
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
            ->unique('question_id')
            ->keyBy('question_id');
        }

        $chapters->transform(function ($ch) use ($pagesByChapter, $questionsByPage, $questionsByChapter, $latestResultsByQ, $hasUser) {
            $chPageIds = isset($pagesByChapter[$ch->id]) ? $pagesByChapter[$ch->id]->pluck('id')->toArray() : [];
            
            $qIds = [];
            foreach ($chPageIds as $pId) {
                if (isset($questionsByPage[$pId])) {
                    foreach ($questionsByPage[$pId] as $q) {
                        $qIds[$q->id] = true;
                    }
                }
            }
            if (isset($questionsByChapter[$ch->id])) {
                foreach ($questionsByChapter[$ch->id] as $q) {
                    $qIds[$q->id] = true;
                }
            }
            if (!empty($ch->chapter_number) && isset($questionsByChapter[$ch->chapter_number])) {
                foreach ($questionsByChapter[$ch->chapter_number] as $q) {
                    $qIds[$q->id] = true;
                }
            }

            $questionIds = array_keys($qIds);
            $total = count($questionIds);
            $correct = 0;
            $wrong = 0;

            if ($hasUser && $total > 0) {
                foreach ($questionIds as $qid) {
                    if (isset($latestResultsByQ[$qid])) {
                        if ($latestResultsByQ[$qid]->is_correct) {
                            $correct++;
                        } else {
                            $wrong++;
                        }
                    }
                }
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
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
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

        $pageIds = $pages->pluck('id')->toArray();
        $questionsByPage = Question::whereIn('page_id', $pageIds)->select('id', 'page_id')->get()->groupBy('page_id');
        $allPageQIds = $questionsByPage->flatten(1)->pluck('id')->toArray();

        $latestResultsByQ = collect();
        if ($hasUser && !empty($allPageQIds)) {
            $latestResultsByQ = UserMcqResult::whereIn('question_id', $allPageQIds)
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
                ->unique('question_id')
                ->keyBy('question_id');
        }

        $pages->transform(function ($p) use ($questionsByPage, $latestResultsByQ, $hasUser) {
            $pageQuestions = isset($questionsByPage[$p->id]) ? $questionsByPage[$p->id] : collect();
            $total = $pageQuestions->count();
            $correct = 0;
            $wrong = 0;

            if ($hasUser && $total > 0) {
                foreach ($pageQuestions as $q) {
                    if (isset($latestResultsByQ[$q->id])) {
                        if ($latestResultsByQ[$q->id]->is_correct) {
                            $correct++;
                        } else {
                            $wrong++;
                        }
                    }
                }
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
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
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
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
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

        $userResults = collect();
        $savedIds = [];
        $notes = collect();

        if ($hasUser && $page->questions && $page->questions->isNotEmpty()) {
            $qIds = $page->questions->pluck('id')->toArray();
            
            $userResults = UserMcqResult::whereIn('question_id', $qIds)
                ->where(function ($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->orderBy('id', 'desc')
                ->get()
                ->groupBy('question_id');

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
        }

        if ($page->questions) {
            foreach ($page->questions as $question) {
                $attempts = $userResults->get($question->id);
                if ($attempts && $attempts->isNotEmpty()) {
                    $latest = $attempts->first();
                    $cCount = $latest->correct_count !== null ? (int)$latest->correct_count : $attempts->where('is_correct', 1)->count();
                    $wCount = $latest->wrong_count !== null ? (int)$latest->wrong_count : $attempts->where('is_correct', 0)->count();

                    $question->user_answer = $latest->user_answer;
                    $question->is_correct = (bool)$latest->is_correct;
                    $question->correct_count = $cCount;
                    $question->wrong_count = $wCount;
                    $question->has_answered = true;
                } else {
                    $question->user_answer = null;
                    $question->is_correct = null;
                    $question->correct_count = 0;
                    $question->wrong_count = 0;
                    $question->has_answered = false;
                }
                $question->is_saved = in_array($question->id, $savedIds);
                $question->user_note = $notes->has($question->id) ? $notes->get($question->id)->note_text : null;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $page
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
    }
}
