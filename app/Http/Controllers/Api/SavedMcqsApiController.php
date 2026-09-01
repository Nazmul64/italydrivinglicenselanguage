<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedMcq;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\AppClient;
use App\Models\User;
use Illuminate\Http\Request;

class SavedMcqsApiController extends Controller
{
    /**
     * Get user's bookmarked saved MCQs.
     */
    public function index(Request $request)
    {
        $user = auth()->user() ?: $request->user();
        $userId = $user ? $user->id : $request->query("user_id");
        $phone = $request->query("phone") ?? $request->header("X-Client-Phone") ?? ($user ? $user->phone : session("app_client_phone"));
        $sessionId = $request->query("session_id") ?: $request->header("X-Session-ID") ?: session()->getId();

        $sessionIds = array_filter([$sessionId]);

        if (!$phone && $sessionId) {
            $clientBySession = AppClient::where("session_id", $sessionId)->first();
            if ($clientBySession && $clientBySession->phone) {
                $phone = $clientBySession->phone;
            } else {
                $userBySession = User::where("uuid", $sessionId)->first();
                if ($userBySession && $userBySession->phone) {
                    $phone = $userBySession->phone;
                }
            }
        }

        if ($phone) {
            $cleanPhone = preg_replace("/\D/", "", $phone);
            $clientSessions = AppClient::where(function($q) use ($phone, $cleanPhone) {
                $q->where("phone", $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck("session_id")->filter()->toArray();

            $userSessions = User::where(function($q) use ($phone, $cleanPhone) {
                $q->where("phone", $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck("uuid")->filter()->toArray();

            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = User::where("phone", $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $query = SavedMcq::with(["question.page.chapter", "cartelloQuestion.page.chapter"]);

        if ($userId || !empty($sessionIds)) {
            $query->where(function ($q) use ($userId, $sessionIds) {
                if ($userId) {
                    $q->where("user_id", $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) {
                        $q->orWhereIn("session_id", $sessionIds);
                    } else {
                        $q->whereIn("session_id", $sessionIds);
                    }
                }
            });
        }

        $savedList = $query->orderBy("created_at", "desc")->get();

        // If no saved items for this specific session, fallback to all saved items
        if ($savedList->isEmpty()) {
            $savedList = SavedMcq::with(["question.page.chapter", "cartelloQuestion.page.chapter"])->orderBy("created_at", "desc")->get();
        }

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
                        "image"          => $c->image ?: ($page ? $page->image : null),
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
        $request->validate([
            "question_id" => "required",
        ]);

        $user = auth()->user() ?: $request->user();
        $userId = $user ? $user->id : $request->input("user_id");
        $phone = $request->input("phone") ?? $request->input("user_phone") ?? $request->header("X-Client-Phone") ?? ($user ? $user->phone : session("app_client_phone"));
        $sessionId = $request->input("session_id") ?: $request->header("X-Session-ID") ?: session()->getId();
        $questionId = $request->input("question_id");
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

        $sessionIds = array_filter([$sessionId]);

        if ($phone) {
            $cleanPhone = preg_replace("/\D/", "", $phone);
            $clientSessions = AppClient::where(function($q) use ($phone, $cleanPhone) {
                $q->where("phone", $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck("session_id")->filter()->toArray();

            $userSessions = User::where(function($q) use ($phone, $cleanPhone) {
                $q->where("phone", $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck("uuid")->filter()->toArray();

            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = User::where("phone", $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $query = SavedMcq::where("question_id", $questionId)->where("type", $type);

        if ($userId || !empty($sessionIds)) {
            $query->where(function ($q) use ($userId, $sessionIds) {
                if ($userId) {
                    $q->where("user_id", $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) {
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