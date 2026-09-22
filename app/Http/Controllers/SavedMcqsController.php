<?php

namespace App\Http\Controllers;

use App\Models\SavedMcq;
use App\Models\Question;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class SavedMcqsController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get bookmarked / saved MCQs list.
     */
    public function index(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];

        $query = SavedMcq::with(["question.page.chapter", "cartelloQuestion.page.chapter"]);

        if (!empty($userIds) || !empty($sessionIds)) {
            $query->where(function ($q) use ($userIds, $sessionIds) {
                if (!empty($userIds)) {
                    $q->whereIn("user_id", $userIds);
                }
                if (!empty($sessionIds)) {
                    if (!empty($userIds)) {
                        $q->orWhereIn("session_id", $sessionIds);
                    } else {
                        $q->whereIn("session_id", $sessionIds);
                    }
                }
            });
        }

        $savedList = $query->orderBy("created_at", "desc")->get();

        if ($savedList->isEmpty()) {
            $savedList = SavedMcq::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
                ->orderBy("created_at", "desc")
                ->get();
        }

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'status' => 'success',
                'success' => true,
                'data' => $savedList
            ]);
        }

        return view('frontend.screens.saved_mcqs', compact('savedList'));
    }

    /**
     * Toggle saving / bookmarking a question.
     */
    public function toggle(Request $request)
    {
        return app(\App\Http\Controllers\Api\SavedMcqsApiController::class)->toggle($request);
    }
}
