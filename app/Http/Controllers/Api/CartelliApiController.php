<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartelloCategory;
use App\Models\CartelloChapter;
use App\Models\CartelloPage;
use App\Models\CartelloMcq;
use App\Models\UserMcqResult;
use App\Models\SavedMcq;
use App\Models\Note;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class CartelliApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get all active Cartelli categories.
     */
    public function getCategories()
    {
        $categories = CartelloCategory::where('status', true)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Get chapters by category ID or all chapters.
     */
    public function getChapters($categoryId = null)
    {
        $query = CartelloChapter::where('status', true);
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        $chapters = $query->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    /**
     * Get pages for a Cartelli chapter.
     */
    public function getPages($chapterId)
    {
        $pages = CartelloPage::where('chapter_id', $chapterId)->where('status', true)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get MCQs for a Cartelli page with user statistics.
     */
    public function getPageMcqs(Request $request, $pageId)
    {
        $mcqs = CartelloMcq::where('page_id', $pageId)->where('status', true)->orderBy('sort_order', 'asc')->get();
        $this->attachUserStatsToMcqs($request, $mcqs, 'cartelli');

        return response()->json([
            'status' => 'success',
            'data' => $mcqs
        ]);
    }

    /**
     * Get MCQs for an entire Cartelli chapter with user statistics.
     */
    public function getChapterMcqs(Request $request, $chapterId)
    {
        $pageIds = CartelloPage::where('chapter_id', $chapterId)->where('status', true)->pluck('id');
        $mcqs = CartelloMcq::whereIn('page_id', $pageIds)->where('status', true)->orderBy('sort_order', 'asc')->get();
        $this->attachUserStatsToMcqs($request, $mcqs, 'cartelli');

        return response()->json([
            'status' => 'success',
            'data' => $mcqs
        ]);
    }

    /**
     * Helper to attach user statistics to a collection of MCQs.
     */
    protected function attachUserStatsToMcqs(Request $request, &$mcqs, $type = 'cartelli')
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];
        $hasUser = !empty($userIds) || !empty($sessionIds);

        $userResults = collect();
        $savedIds = [];
        $notes = collect();

        if ($hasUser && $mcqs->isNotEmpty()) {
            $qIds = $mcqs->pluck('id')->toArray();

            $userResults = UserMcqResult::whereIn('question_id', $qIds)
                ->where(function($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->orderBy('id', 'desc')
                ->get()
                ->groupBy('question_id');

            $savedIds = SavedMcq::whereIn('question_id', $qIds)
                ->where(function($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->pluck('question_id')
                ->toArray();

            $notes = Note::whereIn('question_id', $qIds)
                ->where(function($q) use ($userIds, $sessionIds) {
                    if (!empty($userIds)) $q->whereIn('user_id', $userIds);
                    if (!empty($sessionIds)) {
                        if (!empty($userIds)) $q->orWhereIn('session_id', $sessionIds);
                        else $q->whereIn('session_id', $sessionIds);
                    }
                })
                ->get()
                ->keyBy('question_id');
        }

        foreach ($mcqs as $mcq) {
            $attempts = $userResults->get($mcq->id);
            if ($attempts && $attempts->isNotEmpty()) {
                $latest = $attempts->first();
                $cCount = $latest->correct_count !== null ? (int)$latest->correct_count : $attempts->where('is_correct', 1)->count();
                $wCount = $latest->wrong_count !== null ? (int)$latest->wrong_count : $attempts->where('is_correct', 0)->count();

                $mcq->user_answer = $latest->user_answer;
                $mcq->is_correct = (bool)$latest->is_correct;
                $mcq->correct_count = $cCount;
                $mcq->wrong_count = $wCount;
                $mcq->has_answered = true;
            } else {
                $mcq->user_answer = null;
                $mcq->is_correct = null;
                $mcq->correct_count = 0;
                $mcq->wrong_count = 0;
                $mcq->has_answered = false;
            }
            $mcq->is_saved = in_array($mcq->id, $savedIds);
            $mcq->user_note = $notes->has($mcq->id) ? $notes->get($mcq->id)->note_text : null;
        }
    }
}
