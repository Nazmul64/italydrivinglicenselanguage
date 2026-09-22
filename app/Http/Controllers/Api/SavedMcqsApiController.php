<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedMcq;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\AppClient;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class SavedMcqsApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get user's bookmarked saved MCQs.
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

        // Fallback: If empty, load all available saved records
        if ($savedList->isEmpty()) {
            $savedList = SavedMcq::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
                ->orderBy("created_at", "desc")
                ->get();
        }

        // Deduplicate records by question_id and type to prevent duplicate cards
        $savedList = $savedList->unique(function ($item) {
            return ($item->type ?? 'argomenti') . '_' . $item->question_id;
        })->values();

        $result = $savedList->map(function ($item) {
            if ($item->type === "cartelli" || (!$item->question && $item->cartelloQuestion)) {
                $c = $item->cartelloQuestion;
                if ($c) {
                    $page = $c->page;
                    $chapter = $page ? $page->chapter : null;

                    $questionData = [
                        "id"             => $c->id,
                        "chapter_id"     => $chapter ? $chapter->id : 1,
                        "chapter_name"   => $chapter ? ($chapter->name ?? ($chapter->title ?? "Cartelli")) : "Cartelli",
                        "italian"        => $c->question ?? "",
                        "bangla"         => $c->bn_question ?? "",
                        "is_vero"        => $c->correct_answer === "vero" || $c->correct_answer === "1" || $c->correct_answer === 1,
                        "image"          => $c->image ?: null,
                        "audio"          => $c->voice,
                        "video"          => $c->video,
                        "vocabulary"     => $c->vocabulary ?? [],
                        "type"           => "cartelli",
                        "page"           => $page ? [
                            "id" => $page->id,
                            "title" => $page->title,
                            "chapter" => $chapter ? [
                                "id" => $chapter->id,
                                "chapter_number" => $chapter->chapter_number,
                                "name" => $chapter->name ?? ($chapter->title ?? "Cartelli")
                            ] : null
                        ] : null
                    ];

                    return [
                        "id" => $item->id,
                        "session_id" => $item->session_id,
                        "user_id" => $item->user_id,
                        "question_id" => $item->question_id,
                        "type" => "cartelli",
                        "created_at" => $item->created_at,
                        "updated_at" => $item->updated_at,
                        "question" => $questionData
                    ];
                }
            }
            return $item;
        });

        return response()->json([
            "status" => "success",
            "data" => $result
        ]);
    }

    /**
     * Toggle bookmark state for a question.
     */
    public function toggle(Request $request)
    {
        $questionId = $request->input("question_id") 
            ?? $request->input("id") 
            ?? $request->input("questionId") 
            ?? $request->input("mcq_id");

        if (!$questionId) {
            return response()->json([
                "status" => "error",
                "message" => "Question ID is required"
            ], 422);
        }

        $context = $this->resolveUserContext($request);
        $userId = $context['user_id'];
        $userIds = $context['user_ids'];
        $phone = $context['phone'];
        $sessionId = $context['session_id'];
        $sessionIds = $context['session_ids'];

        $type = $request->input("type", "argomenti");

        if ($phone && $sessionId) {
            $client = AppClient::where("session_id", $sessionId)->orWhere("phone", $phone)->first();
            if (!$client) {
                AppClient::create([
                    "session_id" => $sessionId,
                    "phone" => $phone,
                    "first_name" => $request->input("first_name", "App"),
                    "last_name" => $request->input("last_name", "User"),
                    "is_active" => true,
                ]);
            } else {
                $client->session_id = $sessionId;
                $client->phone = $phone;
                if ($request->filled("first_name")) $client->first_name = $request->input("first_name");
                if ($request->filled("last_name")) $client->last_name = $request->input("last_name");
                $client->save();
            }
        }

        if (!$request->has("type")) {
            if (CartelloMcq::where("id", $questionId)->exists() && !Question::where("id", $questionId)->exists()) {
                $type = "cartelli";
            }
        }

        $query = SavedMcq::where("question_id", $questionId)->where("type", $type);

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

        $existing = $query->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                "status" => "success",
                "saved" => false,
                "message" => "Question removed from bookmarks"
            ]);
        } else {
            $created = SavedMcq::create([
                "session_id" => $sessionId,
                "user_id" => $userId,
                "question_id" => $questionId,
                "type" => $type
            ]);
            return response()->json([
                "status" => "success",
                "saved" => true,
                "message" => "Question added to bookmarks",
                "data" => $created
            ]);
        }
    }
}