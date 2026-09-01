<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\AppClient;
use App\Models\User;
use Illuminate\Http\Request;

class NotedMcqsApiController extends Controller
{
    /**
     * Get user's noted MCQs (both Argomenti and Cartelli).
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

        $query = Note::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
            ->whereNotNull('question_id')
            ->where('note_text', '!=', '');

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

        $notesList = $query->orderBy("updated_at", "desc")->get();

        // If no items for this specific session, fallback to all notes
        if ($notesList->isEmpty()) {
            $notesList = Note::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
                ->whereNotNull('question_id')
                ->where('note_text', '!=', '')
                ->orderBy("updated_at", "desc")
                ->get();
        }

        $result = $notesList->map(function ($item) {
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
                        "note_id"        => $item->id,
                        "note_text"      => $item->note_text,
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
                        "id"          => $item->id,
                        "session_id"  => $item->session_id,
                        "user_id"     => $item->user_id,
                        "question_id" => $item->question_id,
                        "type"        => "cartelli",
                        "note_text"   => $item->note_text,
                        "created_at"  => $item->created_at,
                        "updated_at"  => $item->updated_at,
                        "question"    => $questionData
                    ];
                }
            } else {
                $q = $item->question;
                if ($q) {
                    $page = $q->page;
                    $chapter = $page ? $page->chapter : null;

                    $questionData = [
                        "id"             => $q->id,
                        "chapter_id"     => $chapter ? $chapter->id : ($q->chapter_id ?: 1),
                        "chapter_name"   => $chapter ? ($chapter->name ?? ($chapter->title ?? "Argomenti")) : ($q->chapter_name ?? "Argomenti"),
                        "italian"        => $q->italian ?? "",
                        "bangla"         => $q->bangla ?? "",
                        "is_vero"        => $q->is_vero === 1 || $q->is_vero === true || $q->is_vero === "1",
                        "image"          => $q->image ?: ($page ? $page->image : null),
                        "audio"          => $q->audio,
                        "video"          => $q->video,
                        "vocabulary"     => $q->vocabulary ?? [],
                        "type"           => "argomenti",
                        "note_id"        => $item->id,
                        "note_text"      => $item->note_text,
                        "page"           => $page ? [
                            "id" => $page->id,
                            "title" => $page->title,
                            "chapter" => $chapter ? [
                                "id" => $chapter->id,
                                "chapter_number" => $chapter->chapter_number,
                                "name" => $chapter->name ?? ($chapter->title ?? "Argomenti")
                            ] : null
                        ] : null
                    ];

                    return [
                        "id"          => $item->id,
                        "session_id"  => $item->session_id,
                        "user_id"     => $item->user_id,
                        "question_id" => $item->question_id,
                        "type"        => "argomenti",
                        "note_text"   => $item->note_text,
                        "created_at"  => $item->created_at,
                        "updated_at"  => $item->updated_at,
                        "question"    => $questionData
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
     * Save or update a note on a question.
     */
    public function save(Request $request)
    {
        $request->validate([
            'note_text' => 'required|string',
        ]);

        $user = auth()->user() ?: $request->user();
        $userId = $user ? $user->id : $request->input("user_id");
        $phone = $request->input("phone") ?? $request->header("X-Client-Phone") ?? ($user ? $user->phone : session("app_client_phone"));
        $sessionId = $request->input("session_id") ?: $request->header("X-Session-ID") ?: session()->getId();
        $questionId = $request->input("question_id");
        $pageId = $request->input("page_id");
        $type = $request->input("type", "argomenti");
        $noteText = trim($request->input("note_text"));

        if (!$type || $type === 'argomenti') {
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

        $query = Note::query();
        if ($questionId) {
            $query->where("question_id", $questionId)->where("type", $type);
        } elseif ($pageId) {
            $query->where("page_id", $pageId);
        } else {
            return response()->json(['error' => 'Either question_id or page_id must be provided'], 400);
        }

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
            $existing->update([
                'note_text' => $noteText,
                'type' => $type
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'নোট সফলভাবে আপডেট করা হয়েছে',
                'data' => $existing
            ]);
        } else {
            $created = Note::create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'page_id' => $pageId,
                'question_id' => $questionId,
                'type' => $type,
                'note_text' => $noteText
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'নোট সফলভাবে সংরক্ষণ করা হয়েছে',
                'data' => $created
            ]);
        }
    }

    /**
     * Delete a note.
     */
    public function delete($id)
    {
        $note = Note::findOrFail($id);
        $note->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'নোটটি মুছে ফেলা হয়েছে'
        ]);
    }
}
