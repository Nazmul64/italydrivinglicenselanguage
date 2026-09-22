<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class NotedMcqsApiController extends Controller
{
    use ResolvesUserSession;

    /**
     * Get user's noted MCQs (both Argomenti and Cartelli).
     */
    public function index(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userIds = $context['user_ids'];
        $sessionIds = $context['session_ids'];

        $query = Note::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
            ->whereNotNull('note_text')
            ->where('note_text', '!=', '');

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

        $notesList = $query->orderBy("updated_at", "desc")->get();

        // Fallback: If empty, load all available active notes
        if ($notesList->isEmpty()) {
            $notesList = Note::with(["question.page.chapter", "cartelloQuestion.page.chapter"])
                ->whereNotNull('note_text')
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
                        "image"          => $c->image ?: null,
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
                        "page_id"     => $item->page_id,
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
                        "image"          => $q->image ?: null,
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
                        "page_id"     => $item->page_id,
                        "type"        => "argomenti",
                        "note_text"   => $item->note_text,
                        "created_at"  => $item->created_at,
                        "updated_at"  => $item->updated_at,
                        "question"    => $questionData
                    ];
                }
            }

            return [
                "id"          => $item->id,
                "session_id"  => $item->session_id,
                "user_id"     => $item->user_id,
                "question_id" => $item->question_id,
                "page_id"     => $item->page_id,
                "type"        => $item->type ?: "argomenti",
                "note_text"   => $item->note_text,
                "created_at"  => $item->created_at,
                "updated_at"  => $item->updated_at,
                "question"    => null
            ];
        });

        return response()->json([
            "status" => "success",
            "total" => $result->count(),
            "data" => $result
        ]);
    }

    /**
     * Save or update a note on a question or page.
     */
    public function save(Request $request)
    {
        $context = $this->resolveUserContext($request);
        $userId = $context['user_id'];
        $userIds = $context['user_ids'];
        $sessionId = $context['session_id'];
        $sessionIds = $context['session_ids'];

        $questionId = $request->input("question_id") ?? $request->input("questionId") ?? $request->input("id");
        $pageId = $request->input("page_id") ?? $request->input("pageId");
        $type = $request->input("type");
        
        $noteText = trim((string)(
            $request->input("note_text") 
            ?? $request->input("note") 
            ?? $request->input("text") 
            ?? $request->input("content") 
            ?? $request->input("body") 
            ?? ''
        ));

        // Auto detect question type if not provided
        if ($questionId && (!$type || $type === 'argomenti')) {
            if (CartelloMcq::where("id", $questionId)->exists() && !Question::where("id", $questionId)->exists()) {
                $type = "cartelli";
            } else {
                $type = $type ?: "argomenti";
            }
        }
        $type = $type ?: "argomenti";

        if (!$questionId && !$pageId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Either question_id or page_id must be provided'
            ], 422);
        }

        $query = Note::query();
        if ($questionId) {
            $query->where("question_id", $questionId)->where("type", $type);
        } elseif ($pageId) {
            $query->where("page_id", $pageId);
        }

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

        // If noteText is empty and existing note found, delete it
        if ($noteText === '' && $existing) {
            $existing->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'নোটটি মুছে ফেলা হয়েছে',
                'data' => null
            ]);
        }

        if ($noteText === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'নোটের বিবরণ লিখুন'
            ], 422);
        }

        if ($existing) {
            $existing->update([
                'note_text' => $noteText,
                'type' => $type,
                'user_id' => $userId ?: $existing->user_id,
                'session_id' => $sessionId ?: $existing->session_id,
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
    public function delete(Request $request, $id = null)
    {
        $noteId = $id ?: ($request->input('id') ?: $request->input('note_id'));
        if (!$noteId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Note ID is required'
            ], 422);
        }

        $note = Note::find($noteId);
        if ($note) {
            $note->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'নোটটি মুছে ফেলা হয়েছে'
        ]);
    }
}
