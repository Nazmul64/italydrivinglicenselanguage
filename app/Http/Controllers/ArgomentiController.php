<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use App\Models\SavedMcq;
use App\Models\Note;
use App\Models\UserMcqResult;
use App\Models\Category;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArgomentiController extends Controller
{
    /**
     * Check if user has permission to manage a module.
     */
    protected function checkPermission($module)
    {
        $user = auth()->user();
        if (!$user) return; // Allow if auth is not set up yet
        if ($user->role === 'super_admin') return;

        if ($user->role === 'staff') {
            $permissions = json_decode($user->permissions, true) ?: [];
            if (in_array($module, $permissions)) {
                return;
            }
        }

        abort(403, 'Unauthorized access: You do not have permission to manage ' . $module);
    }

    // ==========================================
    // Public API Endpoints (For User Interface)
    // ==========================================

    /**
     * Get all active chapters list.
     */
    public function getChapters(Request $request)
    {
        $categoryId = $request->query('category_id');
        $query = Chapter::withCount('pages')->where('status', true);
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        $chapters = $query->orderBy('id', 'asc')->get();
        foreach ($chapters as $ch) {
            $ch->question_count = Question::where('chapter', $ch->id)->count();
        }
        return response()->json($chapters);
    }

    /**
     * Get active pages list for a specific chapter.
     */
    public function getChapterPages($chapterId)
    {
        $pages = Page::withCount('questions')
            ->where('chapter_id', $chapterId)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
        return response()->json($pages);
    }

    /**
     * Get page details with its MCQs.
     */
    public function getPageDetails($pageId)
    {
        $page = Page::with(['chapter', 'questions' => function ($q) {
            $q->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
        }])->findOrFail($pageId);
        
        return response()->json($page);
    }

    /**
     * Get all pages for dropdown filters.
     */
    public function getAllPages()
    {
        $pages = Page::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json($pages);
    }

    /**
     * Get list of saved MCQs for user/session.
     */
    public function getSavedMcqs(Request $request)
    {
        $user = auth()->user();
        $userId = $request->query('user_id') ?: ($user ? $user->id : null);
        $phone = $request->query('phone') ?? $request->input('phone') ?? $request->header('X-Client-Phone') ?? $request->cookie('app_client_phone') ?? session('app_client_phone');
        $sessionId = $request->query('session_id') ?: session()->getId();

        $sessionIds = array_filter([$sessionId]);
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $clientSessions = \App\Models\AppClient::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck('session_id')->filter()->toArray();

            $userSessions = \App\Models\User::where(function($q) use ($phone, $cleanPhone) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })->pluck('uuid')->filter()->toArray();
            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = \App\Models\User::where('phone', $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $query = SavedMcq::with(['question.page.chapter', 'cartelloQuestion.page.chapter']);

        if ($userId || !empty($sessionIds)) {
            $query->where(function ($q) use ($userId, $sessionIds) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) {
                        $q->orWhereIn('session_id', $sessionIds);
                    } else {
                        $q->whereIn('session_id', $sessionIds);
                    }
                }
            });
        }

        $savedList = $query->orderBy('created_at', 'desc')->get();

        $result = $savedList->map(function ($item) {
            if ($item->type === 'cartelli' || (!$item->question && $item->cartelloQuestion)) {
                $c = $item->cartelloQuestion;
                if ($c) {
                    $page = $c->page;
                    $chapter = $page ? $page->chapter : null;

                    $questionData = [
                        'id'             => $c->id,
                        'italian'        => $c->question ?? '',
                        'bangla'         => $c->bn_question ?? '',
                        'is_vero'        => $c->correct_answer === 'vero' || $c->correct_answer === '1' || $c->correct_answer === 1,
                        'image'          => $c->image ?: ($page ? $page->image : null),
                        'audio'          => $c->voice,
                        'video'          => $c->video,
                        'vocabulary'     => $c->vocabulary ?? [],
                        'type'           => 'cartelli',
                        'page'           => $page ? [
                            'id'         => $page->id,
                            'title'      => $page->title,
                            'chapter_id' => $page->chapter_id,
                            'chapter'    => $chapter ? [
                                'id'             => $chapter->id,
                                'chapter_number' => $chapter->chapter_number,
                                'title'          => $chapter->title,
                            ] : null
                        ] : null
                    ];

                    return [
                        'id'          => $item->id,
                        'type'        => 'cartelli',
                        'question_id' => $item->question_id,
                        'created_at'  => $item->created_at,
                        'question'    => $questionData
                    ];
                }
            }

            return $item;
        });

        return response()->json($result);
    }

    /**
     * Toggle MCQ bookmark status (Save/Unsave).
     */
    public function toggleSavedMcq(Request $request)
    {
        try {
            $request->validate([
                'question_id' => 'required',
            ]);

            $user = auth()->user();
            $userId = $user ? $user->id : $request->input('user_id');
            $phone = $request->input('phone') ?? $request->header('X-Client-Phone');
            $sessionId = $request->input('session_id') ?: session()->getId();
            $questionId = $request->input('question_id');
            $type = $request->input('type', 'argomenti');

            if (!$request->has('type')) {
                if (\App\Models\CartelloMcq::where('id', $questionId)->exists() && !\App\Models\Question::where('id', $questionId)->exists()) {
                    $type = 'cartelli';
                }
            }

            $sessionIds = array_filter([$sessionId]);
            if ($phone) {
                $clientSessions = \App\Models\AppClient::where('phone', $phone)->pluck('session_id')->filter()->toArray();
                $userSessions = \App\Models\User::where('phone', $phone)->pluck('uuid')->filter()->toArray();
                $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
                if (!$userId) {
                    $userObj = \App\Models\User::where('phone', $phone)->first();
                    if ($userObj) $userId = $userObj->id;
                }
            }

            // Check if already saved
            $query = SavedMcq::where('question_id', $questionId)->where('type', $type);
            if ($userId || !empty($sessionIds)) {
                $query->where(function ($q) use ($userId, $sessionIds) {
                    if ($userId) {
                        $q->where('user_id', $userId);
                    }
                    if (!empty($sessionIds)) {
                        if ($userId) {
                            $q->orWhereIn('session_id', $sessionIds);
                        } else {
                            $q->whereIn('session_id', $sessionIds);
                        }
                    }
                });
            }

            $existing = $query->first();

            if ($existing) {
                $existing->delete();
                return response()->json(['saved' => false, 'message' => 'Question removed from bookmarks.']);
            } else {
                SavedMcq::create([
                    'session_id'  => $sessionId,
                    'user_id'     => $userId,
                    'question_id' => $questionId,
                    'type'        => $type
                ]);
                return response()->json(['saved' => true, 'message' => 'Question added to bookmarks.']);
            }
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get notes list.
     */
    public function getNotes(Request $request)
    {
        $sessionId = $request->query('session_id') ?: session()->getId();
        $userId = $request->query('user_id');
        $pageId = $request->query('page_id');
        $questionId = $request->query('question_id');
        $type = $request->query('type');

        $query = Note::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        if ($pageId) {
            $query->where('page_id', $pageId);
        }
        if ($questionId) {
            $query->where('question_id', $questionId);
            if ($type) {
                $query->where('type', $type);
            }
        }

        $notes = $query->orderBy('updated_at', 'desc')->get();
        return response()->json($notes);
    }

    /**
     * Save/Create/Update a note.
     */
    public function saveNote(Request $request)
    {
        $request->validate([
            'note_text' => 'required|string',
        ]);

        $sessionId = $request->input('session_id') ?: session()->getId();
        $userId = $request->input('user_id');
        $pageId = $request->input('page_id');
        $questionId = $request->input('question_id');
        $type = $request->input('type', 'argomenti');
        $noteText = $request->input('note_text');

        if ($questionId && (!$type || $type === 'argomenti')) {
            if (\App\Models\CartelloMcq::where("id", $questionId)->exists() && !\App\Models\Question::where("id", $questionId)->exists()) {
                $type = "cartelli";
            }
        }

        // Find existing note for this page/question and user
        $query = Note::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        if ($questionId) {
            $query->where('question_id', $questionId)->where('type', $type);
        } elseif ($pageId) {
            $query->where('page_id', $pageId);
        } else {
            return response()->json(['error' => 'Either page_id or question_id must be provided'], 400);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->update([
                'note_text' => $noteText,
                'type' => $type
            ]);
            return response()->json($existing);
        } else {
            $note = Note::create([
                'session_id' => $userId ? null : $sessionId,
                'user_id' => $userId,
                'page_id' => $pageId,
                'question_id' => $questionId,
                'type' => $type,
                'note_text' => $noteText
            ]);
            return response()->json($note);
        }
    }

    /**
     * Delete a note.
     */
    public function deleteNote($id)
    {
        $note = Note::findOrFail($id);
        $note->delete();
        return response()->json(['success' => true]);
    }

    // ==========================================
    // Admin API Endpoints (For Administrative Interface)
    // ==========================================

    /**
     * Get chapters for admin dashboard.
     */
    public function getChaptersAdmin(Request $request)
    {
        $search = $request->query('search');
        $categoryId = $request->query('category_id');
        $perPage = $request->query('per_page', 10);

        $query = Chapter::with('category')->withCount('pages');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bn_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $chapters = $query->orderBy('chapter_number', 'asc')
                          ->orderBy('id', 'asc')
                          ->paginate($perPage);

        // Append question counts dynamically
        foreach ($chapters->items() as $ch) {
            $ch->question_count = Question::where('chapter', $ch->id)->count();
        }

        return response()->json($chapters);
    }

    /**
     * Create a new chapter.
     */
    public function createChapter(Request $request)
    {
        $this->checkPermission('chapters');

        $request->validate([
            'category_id'       => 'nullable',
            'name'              => 'required|string|max:255',
            'bn_name'           => 'nullable|string|max:255',
            'chapter_number'    => 'nullable',
            'description'       => 'nullable|string',
            'video_url'         => 'nullable|string|max:1000',
            'video_status'      => 'nullable',
            'estimated_minutes' => 'nullable',
            'sort_order'        => 'nullable',
            'image'             => 'nullable|max:20480',
            'cover_image'       => 'nullable|max:20480',
        ]);

        $catIdInput = $request->input('category_id');
        $categoryId = (is_numeric($catIdInput) && \App\Models\Category::where('id', (int)$catIdInput)->exists()) ? (int)$catIdInput : null;
        if (!$categoryId) {
            $firstCat = \App\Models\Category::first();
            if (!$firstCat) {
                $firstCat = \App\Models\Category::create([
                    'name' => 'Patente B',
                    'description' => 'Patente di Guida Categoria B'
                ]);
            }
            $categoryId = $firstCat->id;
        }

        $chapterNum = is_numeric($request->input('chapter_number')) ? (int)$request->input('chapter_number') : 0;
        $estMinutes = is_numeric($request->input('estimated_minutes')) ? (int)$request->input('estimated_minutes') : 30;
        $sortOrder  = is_numeric($request->input('sort_order')) ? (int)$request->input('sort_order') : 0;

        $data = [
            'category_id'       => $categoryId,
            'name'              => $request->name,
            'bn_name'           => $request->bn_name,
            'chapter_number'    => $chapterNum,
            'description'       => $request->description,
            'video_url'         => $request->video_url,
            'video_status'      => $request->has('video_status') ? filter_var($request->video_status, FILTER_VALIDATE_BOOLEAN) : true,
            'estimated_minutes' => $estMinutes,
            'sort_order'        => $sortOrder,
            'status'            => $request->has('status') ? filter_var($request->status, FILTER_VALIDATE_BOOLEAN) : true,
        ];

        $uploadedCover = null;
        $uploadedThumb = null;

        if ($request->hasFile('cover_image')) {
            $uploadedCover = ImageHelper::uploadAndOptimize($request->file('cover_image'), 'uploads/chapters', 'chapter_cover', 1200, 80);
            $data['cover_image'] = $uploadedCover ?: '';
        }

        if ($request->hasFile('image') && $request->file('image') !== $request->file('cover_image')) {
            $uploadedThumb = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/chapters', 'chapter_thumb', 600, 80);
            $data['image'] = $uploadedThumb ?: '';
        } elseif ($uploadedCover) {
            $data['image'] = $uploadedCover;
        }

        $chapter = Chapter::create($data);
        return response()->json($chapter);
    }

    /**
     * Update chapter details.
     */
    public function updateChapter(Request $request, $id)
    {
        $this->checkPermission('chapters');
        $chapter = Chapter::findOrFail($id);

        $request->validate([
            'category_id'       => 'nullable',
            'name'              => 'required|string|max:255',
            'bn_name'           => 'nullable|string|max:255',
            'chapter_number'    => 'nullable',
            'description'       => 'nullable|string',
            'video_url'         => 'nullable|string|max:1000',
            'video_status'      => 'nullable',
            'estimated_minutes' => 'nullable',
            'sort_order'        => 'nullable',
            'image'             => 'nullable|max:20480',
            'cover_image'       => 'nullable|max:20480',
        ]);

        $catIdInput = $request->input('category_id');
        if (is_numeric($catIdInput) && \App\Models\Category::where('id', (int)$catIdInput)->exists()) {
            $categoryId = (int)$catIdInput;
        } elseif ($chapter->category_id && \App\Models\Category::where('id', $chapter->category_id)->exists()) {
            $categoryId = $chapter->category_id;
        } else {
            $firstCat = \App\Models\Category::first();
            if (!$firstCat) {
                $firstCat = \App\Models\Category::create([
                    'name' => 'Patente B',
                    'description' => 'Patente di Guida Categoria B'
                ]);
            }
            $categoryId = $firstCat->id;
        }

        $chapterNum = is_numeric($request->input('chapter_number')) ? (int)$request->input('chapter_number') : $chapter->chapter_number;
        $estMinutes = is_numeric($request->input('estimated_minutes')) ? (int)$request->input('estimated_minutes') : $chapter->estimated_minutes;
        $sortOrder  = is_numeric($request->input('sort_order')) ? (int)$request->input('sort_order') : $chapter->sort_order;

        $updateData = [
            'category_id'       => $categoryId,
            'name'              => $request->name,
            'bn_name'           => $request->bn_name,
            'chapter_number'    => $chapterNum,
            'description'       => $request->has('description') ? $request->description : $chapter->description,
            'video_url'         => $request->has('video_url') ? $request->video_url : $chapter->video_url,
            'video_status'      => $request->has('video_status') ? filter_var($request->video_status, FILTER_VALIDATE_BOOLEAN) : $chapter->video_status,
            'estimated_minutes' => $estMinutes,
            'sort_order'        => $sortOrder,
        ];

        $uploadedCover = null;
        $uploadedThumb = null;

        if ($request->hasFile('cover_image')) {
            if ($chapter->cover_image && file_exists(public_path($chapter->cover_image))) {
                @unlink(public_path($chapter->cover_image));
            }
            $uploadedCover = ImageHelper::uploadAndOptimize($request->file('cover_image'), 'uploads/chapters', 'chapter_cover', 1200, 80);
            $updateData['cover_image'] = $uploadedCover ?: '';
        }

        if ($request->hasFile('image') && $request->file('image') !== $request->file('cover_image')) {
            if ($chapter->image && file_exists(public_path($chapter->image))) {
                @unlink(public_path($chapter->image));
            }
            $uploadedThumb = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/chapters', 'chapter_thumb', 600, 80);
            $updateData['image'] = $uploadedThumb ?: '';
        } elseif ($uploadedCover && empty($chapter->image)) {
            $updateData['image'] = $uploadedCover;
        }

        $chapter->update($updateData);
        return response()->json($chapter);
    }

    /**
     * Toggle chapter active status.
     */
    public function toggleChapterStatus($id)
    {
        $this->checkPermission('chapters');
        $chapter = Chapter::findOrFail($id);
        $chapter->update(['status' => !$chapter->status]);
        return response()->json($chapter);
    }

    /**
     * Delete a chapter and its pages.
     */
    public function deleteChapter($id)
    {
        $this->checkPermission('chapters');
        $chapter = Chapter::findOrFail($id);
        // Delete chapter images
        if ($chapter->image && file_exists(public_path($chapter->image))) {
            @unlink(public_path($chapter->image));
        }
        if ($chapter->cover_image && file_exists(public_path($chapter->cover_image))) {
            @unlink(public_path($chapter->cover_image));
        }
        $chapter->delete(); // cascade deletes pages
        return response()->json(['success' => true]);
    }

    /**
     * Get pages for admin listing.
     */
    public function getChapterPagesAdmin(Request $request, $chapterId)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);
 
        $query = Page::with('questions')->withCount('questions')->where('chapter_id', $chapterId);
 
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('bn_title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
 
        $pages = $query->orderBy('sort_order', 'asc')
                       ->orderBy('id', 'asc')
                       ->paginate($perPage);
 
        return response()->json($pages);
    }

    /**
     * Store new page under a chapter.
     */
    public function storePage(Request $request)
    {
        $this->checkPermission('pages');

        $request->validate([
            'chapter_id'        => 'required|integer|exists:chapters,id',
            'title'             => 'required|string|max:255',
            'bn_title'          => 'nullable|string|max:255',
            'content'           => 'nullable|string',
            'video_status'      => 'nullable',
            'estimated_minutes' => 'nullable|integer',
            'sort_order'        => 'nullable|integer',
            'image'             => 'nullable|max:20480',
            'audio'             => 'nullable|max:25600',
            'video'             => 'nullable',
            'pdf_file'          => 'nullable|max:20480',
            'vocabulary'        => 'nullable|string',
            'mcqs'              => 'nullable|string',
        ]);

        $vocabulary = $request->vocabulary ? json_decode($request->vocabulary, true) : null;
        if (is_array($vocabulary)) {
            foreach ($vocabulary as $index => &$item) {
                $fileKey = "vocab_image_{$index}";
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/vocabulary');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $item['image'] = '/uploads/vocabulary/' . $filename;
                }
                unset($item['image_index']);
            }
        }

        $data = [
            'chapter_id'        => $request->chapter_id,
            'title'             => $request->title,
            'bn_title'          => $request->bn_title ?: $request->title,
            'content'           => $request->content,
            'video_status'      => $request->has('video_status') ? filter_var($request->video_status, FILTER_VALIDATE_BOOLEAN) : true,
            'estimated_minutes' => $request->estimated_minutes ?? 10,
            'sort_order'        => $request->sort_order ?? 0,
            'status'            => $request->status ?? true,
            'vocabulary'        => $vocabulary,
        ];

        $page = Page::create($data);

        if ($request->hasFile('image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/pages/images', 'page_img_' . $page->id, 800, 80);
            $page->image = $uploadedPath;
        }

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $fileName = 'page_aud_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/audios'), $fileName);
            $page->audio = '/uploads/pages/audios/' . $fileName;
        }

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'page_vid_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/videos'), $fileName);
            $page->video = '/uploads/pages/videos/' . $fileName;
        } elseif ($request->filled('video')) {
            $page->video = $request->video;
        }

        if ($request->hasFile('pdf_file')) {
            $file = $request->file('pdf_file');
            $fileName = 'page_pdf_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/pdfs'), $fileName);
            $page->pdf_path = '/uploads/pages/pdfs/' . $fileName;
        }

        $page->save();

        $mcqs = $request->mcqs ? json_decode($request->mcqs, true) : null;
        if (is_array($mcqs)) {
            $chapter = Chapter::find($page->chapter_id);
            foreach ($mcqs as $index => $mcq) {
                // Handle MCQ Vocabulary Word Images
                $vocab = isset($mcq['vocabulary']) ? $mcq['vocabulary'] : null;
                if (is_array($vocab)) {
                    foreach ($vocab as $vocabIndex => &$vItem) {
                        $vocabFileKey = "mcq_{$index}_vocab_image_{$vocabIndex}";
                        if ($request->hasFile($vocabFileKey)) {
                            $file = $request->file($vocabFileKey);
                            $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                            $destinationPath = public_path('uploads/vocabulary');
                            if (!file_exists($destinationPath)) {
                                mkdir($destinationPath, 0777, true);
                            }
                            $file->move($destinationPath, $filename);
                            $vItem['image'] = '/uploads/vocabulary/' . $filename;
                        }
                        unset($vItem['image_index']);
                    }
                }

                // Handle MCQ Image Upload
                $imgKey = "mcq_image_{$index}";
                $mcqImage = $mcq['image'] ?? null;
                if ($request->hasFile($imgKey)) {
                    $file = $request->file($imgKey);
                    $filename = 'mcq_img_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/images');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqImage = '/uploads/questions/images/' . $filename;
                }

                // Handle MCQ Audio Upload
                $audioKey = "mcq_audio_{$index}";
                $mcqAudio = $mcq['audio'] ?? null;
                if ($request->hasFile($audioKey)) {
                    $file = $request->file($audioKey);
                    $filename = 'mcq_aud_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/audios');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqAudio = '/uploads/questions/audios/' . $filename;
                }

                // Handle MCQ Video Upload
                $videoKey = "mcq_video_{$index}";
                $mcqVideo = $mcq['video'] ?? null;
                if ($request->hasFile($videoKey)) {
                    $file = $request->file($videoKey);
                    $filename = 'mcq_vid_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/videos');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqVideo = '/uploads/questions/videos/' . $filename;
                }

                Question::create([
                    'chapter'       => $chapter ? $chapter->id : 1,
                    'chapter_name'  => $chapter ? $chapter->name : 'N/D',
                    'question_type' => 'vero_falso',
                    'page_id'       => $page->id,
                    'sort_order'    => isset($mcq['sort_order']) ? (int)$mcq['sort_order'] : 0,
                    'italian'       => $mcq['italian'] ?? '',
                    'bangla'        => $mcq['bangla'] ?? '',
                    'is_vero'       => filter_var($mcq['is_vero'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0,
                    'image'         => $mcqImage,
                    'audio'         => $mcqAudio,
                    'video'         => $mcqVideo,
                    'vocabulary'    => $vocab,
                ]);
            }
        }

        return response()->json($page);
    }

    /**
     * Update page details.
     */
    public function updatePage(Request $request, $id)
    {
        $this->checkPermission('pages');
        $page = Page::findOrFail($id);

        $request->validate([
            'chapter_id'        => 'required|integer|exists:chapters,id',
            'title'             => 'required|string|max:255',
            'bn_title'          => 'nullable|string|max:255',
            'content'           => 'nullable|string',
            'video_status'      => 'nullable',
            'estimated_minutes' => 'nullable|integer',
            'sort_order'        => 'nullable|integer',
            'image'             => 'nullable|max:20480',
            'audio'             => 'nullable|max:25600',
            'video'             => 'nullable',
            'pdf_file'          => 'nullable|max:20480',
            'vocabulary'        => 'nullable|string',
            'mcqs'              => 'nullable|string',
        ]);

        $vocabulary = $request->vocabulary ? json_decode($request->vocabulary, true) : null;
        if (is_array($vocabulary)) {
            foreach ($vocabulary as $index => &$item) {
                $fileKey = "vocab_image_{$index}";
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/vocabulary');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $item['image'] = '/uploads/vocabulary/' . $filename;
                }
                unset($item['image_index']);
            }
        }

        $page->chapter_id = $request->chapter_id;
        $page->title = $request->title;
        $page->bn_title = $request->bn_title ?: $request->title;
        $page->content = $request->has('content') ? $request->content : $page->content;
        $page->video_status = $request->has('video_status') ? filter_var($request->video_status, FILTER_VALIDATE_BOOLEAN) : $page->video_status;
        $page->estimated_minutes = $request->estimated_minutes ?? $page->estimated_minutes;
        $page->sort_order = $request->sort_order ?? $page->sort_order;
        $page->vocabulary = $vocabulary;

        if ($request->hasFile('image')) {
            if ($page->image && file_exists(public_path($page->image))) {
                @unlink(public_path($page->image));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/pages/images', 'page_img_' . $page->id, 800, 80);
            $page->image = $uploadedPath;
        }

        if ($request->hasFile('audio')) {
            if ($page->audio && file_exists(public_path($page->audio))) {
                @unlink(public_path($page->audio));
            }
            $file = $request->file('audio');
            $fileName = 'page_aud_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/audios'), $fileName);
            $page->audio = '/uploads/pages/audios/' . $fileName;
        }

        if ($request->hasFile('video')) {
            if ($page->video && file_exists(public_path($page->video))) {
                @unlink(public_path($page->video));
            }
            $file = $request->file('video');
            $fileName = 'page_vid_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/videos'), $fileName);
            $page->video = '/uploads/pages/videos/' . $fileName;
        } elseif ($request->filled('video')) {
            $page->video = $request->video;
        }

        if ($request->hasFile('pdf_file')) {
            if ($page->pdf_path && file_exists(public_path($page->pdf_path))) {
                @unlink(public_path($page->pdf_path));
            }
            $file = $request->file('pdf_file');
            $fileName = 'page_pdf_' . $page->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pages/pdfs'), $fileName);
            $page->pdf_path = '/uploads/pages/pdfs/' . $fileName;
        }

        $page->save();

        $mcqs = $request->mcqs ? json_decode($request->mcqs, true) : null;
        if (is_array($mcqs)) {
            $chapter = Chapter::find($page->chapter_id);
            $submittedIds = [];
            foreach ($mcqs as $index => $mcq) {
                // Handle MCQ Vocabulary Word Images
                $vocab = isset($mcq['vocabulary']) ? $mcq['vocabulary'] : null;
                if (is_array($vocab)) {
                    foreach ($vocab as $vocabIndex => &$vItem) {
                        $vocabFileKey = "mcq_{$index}_vocab_image_{$vocabIndex}";
                        if ($request->hasFile($vocabFileKey)) {
                            $file = $request->file($vocabFileKey);
                            $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                            $destinationPath = public_path('uploads/vocabulary');
                            if (!file_exists($destinationPath)) {
                                mkdir($destinationPath, 0777, true);
                            }
                            $file->move($destinationPath, $filename);
                            $vItem['image'] = '/uploads/vocabulary/' . $filename;
                        }
                        unset($vItem['image_index']);
                    }
                }

                // Handle MCQ Image Upload
                $imgKey = "mcq_image_{$index}";
                $mcqImage = $mcq['image'] ?? null;
                if ($request->hasFile($imgKey)) {
                    $file = $request->file($imgKey);
                    $filename = 'mcq_img_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/images');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqImage = '/uploads/questions/images/' . $filename;
                }

                // Handle MCQ Audio Upload
                $audioKey = "mcq_audio_{$index}";
                $mcqAudio = $mcq['audio'] ?? null;
                if ($request->hasFile($audioKey)) {
                    $file = $request->file($audioKey);
                    $filename = 'mcq_aud_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/audios');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqAudio = '/uploads/questions/audios/' . $filename;
                }

                // Handle MCQ Video Upload
                $videoKey = "mcq_video_{$index}";
                $mcqVideo = $mcq['video'] ?? null;
                if ($request->hasFile($videoKey)) {
                    $file = $request->file($videoKey);
                    $filename = 'mcq_vid_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/questions/videos');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $mcqVideo = '/uploads/questions/videos/' . $filename;
                }

                $qData = [
                    'chapter'       => $chapter ? $chapter->id : 1,
                    'chapter_name'  => $chapter ? $chapter->name : 'N/D',
                    'question_type' => 'vero_falso',
                    'page_id'       => $page->id,
                    'sort_order'    => isset($mcq['sort_order']) ? (int)$mcq['sort_order'] : 0,
                    'italian'       => $mcq['italian'] ?? '',
                    'bangla'        => $mcq['bangla'] ?? '',
                    'is_vero'       => filter_var($mcq['is_vero'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0,
                    'image'         => $mcqImage,
                    'audio'         => $mcqAudio,
                    'video'         => $mcqVideo,
                    'vocabulary'    => $vocab,
                ];

                if (isset($mcq['id']) && $mcq['id']) {
                    $question = Question::find($mcq['id']);
                    if ($question) {
                        $question->update($qData);
                        $submittedIds[] = $question->id;
                    }
                } else {
                    $newQuestion = Question::create($qData);
                    $submittedIds[] = $newQuestion->id;
                }
            }
            // Delete questions not present in the submitted list
            Question::where('page_id', $page->id)->whereNotIn('id', $submittedIds)->delete();
        } else {
            if ($request->has('mcqs')) {
                Question::where('page_id', $page->id)->delete();
            }
        }

        return response()->json($page);
    }

    /**
     * Toggle page active status.
     */
    public function togglePageStatus($id)
    {
        $this->checkPermission('pages');
        $page = Page::findOrFail($id);
        $page->update(['status' => !$page->status]);
        return response()->json($page);
    }

    /**
     * Delete page and its files.
     */
    public function deletePage($id)
    {
        $this->checkPermission('pages');
        $page = Page::findOrFail($id);

        if ($page->image && file_exists(public_path($page->image))) {
            @unlink(public_path($page->image));
        }

        if ($page->audio && file_exists(public_path($page->audio))) {
            @unlink(public_path($page->audio));
        }

        if ($page->pdf_path && file_exists(public_path($page->pdf_path))) {
            @unlink(public_path($page->pdf_path));
        }

        Question::where('page_id', $page->id)->delete();
        $page->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Delete multiple chapters and their assets.
     */
    public function bulkDeleteChapter(Request $request)
    {
        $this->checkPermission('chapters');

        if ($request->input('all') === true) {
            $query = Chapter::query();
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('bn_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            $chapters = $query->get();
            foreach ($chapters as $chapter) {
                if ($chapter->image && file_exists(public_path($chapter->image))) {
                    @unlink(public_path($chapter->image));
                }
                if ($chapter->cover_image && file_exists(public_path($chapter->cover_image))) {
                    @unlink(public_path($chapter->cover_image));
                }
                $chapter->delete(); // cascade deletes pages
            }
            return response()->json(['success' => true]);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:chapters,id',
        ]);

        $chapters = Chapter::whereIn('id', $request->ids)->get();
        foreach ($chapters as $chapter) {
            if ($chapter->image && file_exists(public_path($chapter->image))) {
                @unlink(public_path($chapter->image));
            }
            if ($chapter->cover_image && file_exists(public_path($chapter->cover_image))) {
                @unlink(public_path($chapter->cover_image));
            }
            $chapter->delete(); // cascade deletes pages
        }

        return response()->json(['success' => true]);
    }

    /**
     * Delete multiple pages and their assets.
     */
    public function bulkDeletePage(Request $request)
    {
        $this->checkPermission('pages');

        if ($request->input('all') === true) {
            $chapterId = $request->input('chapter_id');
            if (!$chapterId) {
                return response()->json(['success' => false, 'message' => 'Chapter ID required for bulk deletion.'], 422);
            }
            $query = Page::where('chapter_id', $chapterId);
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('bn_title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }
            $pages = $query->get();
            foreach ($pages as $page) {
                if ($page->image && file_exists(public_path($page->image))) {
                    @unlink(public_path($page->image));
                }

                if ($page->audio && file_exists(public_path($page->audio))) {
                    @unlink(public_path($page->audio));
                }

                if ($page->pdf_path && file_exists(public_path($page->pdf_path))) {
                    @unlink(public_path($page->pdf_path));
                }

                Question::where('page_id', $page->id)->delete();
                $page->delete();
            }
            return response()->json(['success' => true]);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pages,id',
        ]);

        $pages = Page::whereIn('id', $request->ids)->get();
        foreach ($pages as $page) {
            if ($page->image && file_exists(public_path($page->image))) {
                @unlink(public_path($page->image));
            }

            if ($page->audio && file_exists(public_path($page->audio))) {
                @unlink(public_path($page->audio));
            }

            if ($page->pdf_path && file_exists(public_path($page->pdf_path))) {
                @unlink(public_path($page->pdf_path));
            }

            Question::where('page_id', $page->id)->delete();
            $page->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Assign questions to a page.
     */
    public function assignQuestionsToPage(Request $request, $pageId)
    {
        $request->validate([
            'question_ids' => 'required|array',
            'question_ids.*' => 'integer|exists:questions,id'
        ]);

        $page = Page::findOrFail($pageId);

        // Assign questions
        Question::whereIn('id', $request->question_ids)
            ->update(['page_id' => $page->id]);

        return response()->json(['success' => true]);
    }

    /**
     * Log user MCQ answers results (saves to user_mcq_results table).
     */
    public function logUserMcqResults(Request $request)
    {
        $request->validate([
            'results' => 'required|array',
            'results.*.question_id' => 'required|integer',
            'results.*.user_answer' => 'nullable|string',
            'results.*.is_correct' => 'required|boolean'
        ]);

        $user = auth()->user() ?: $request->user();
        $sessionId = $request->input('session_id') ?: session()->getId();
        $userId = $user ? $user->id : $request->input('user_id');
        $phone = $request->input('phone') ?? $request->header('X-Client-Phone') ?? ($user ? $user->phone : session('app_client_phone'));

        $sessionIds = array_filter([$sessionId]);
        if ($phone) {
            $clientSessions = \App\Models\AppClient::where('phone', $phone)->pluck('session_id')->filter()->toArray();
            $userSessions = \App\Models\User::where('phone', $phone)->pluck('uuid')->filter()->toArray();
            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = \App\Models\User::where('phone', $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $logged = [];
        foreach ($request->input('results') as $res) {
            $qIdNum = (int)$res['question_id'];
            $question = Question::find($qIdNum);
            $pageId = null;
            $chapterId = null;
            $categoryId = null;

            if ($question) {
                $pageId = $question->page_id;
                $chapterId = $question->chapter;
                if ($chapterId) {
                    $chapter = Chapter::find($chapterId);
                    if ($chapter) {
                        $categoryId = $chapter->category_id;
                    }
                }
            } else {
                $cartelloQ = \App\Models\CartelloMcq::find($qIdNum);
                if ($cartelloQ) {
                    $pageId = $cartelloQ->page_id;
                    $chapterId = $cartelloQ->page ? $cartelloQ->page->chapter_id : null;
                } else {
                    continue;
                }
            }

            $query = UserMcqResult::where('question_id', $qIdNum);
            if ($userId || !empty($sessionIds)) {
                $query->where(function($q) use ($userId, $sessionIds) {
                    if ($userId) {
                        $q->where('user_id', $userId);
                    }
                    if (!empty($sessionIds)) {
                        if ($userId) {
                            $q->orWhereIn('session_id', $sessionIds);
                        } else {
                            $q->whereIn('session_id', $sessionIds);
                        }
                    }
                });
            }
            $existing = $query->first();

            $data = [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'question_id' => $qIdNum,
                'user_answer' => $res['user_answer'] ?? null,
                'is_correct' => $res['is_correct'],
                'category_id' => $categoryId,
                'chapter_id' => $chapterId,
                'page_id' => $pageId,
            ];

            if ($existing) {
                $existing->update($data);
                $logged[] = $existing;
            } else {
                $logged[] = UserMcqResult::create($data);
            }
        }

        return response()->json(['success' => true, 'count' => count($logged)]);
    }

    /**
     * Get logged MCQ results (Correct/Incorrect list with filters).
     */
    public function getUserMcqResults(Request $request)
    {
        $sessionId = $request->query('session_id') ?: session()->getId();
        $userId = $request->query('user_id') ?: auth()->id();
        $phone = $request->query('phone') ?? $request->header('X-Client-Phone');
        $isCorrect = $request->query('is_correct');
        $categoryId = $request->query('category_id');
        $chapterId = $request->query('chapter_id') ?: $request->query('chapter');
        $pageId = $request->query('page_id') ?: $request->query('page');
        $date = $request->query('date');
        $search = $request->query('search');

        $sessionIds = array_filter([$sessionId]);
        if ($phone) {
            $clientSessions = \App\Models\AppClient::where('phone', $phone)->pluck('session_id')->filter()->toArray();
            $userSessions = \App\Models\User::where('phone', $phone)->pluck('uuid')->filter()->toArray();
            $sessionIds = array_unique(array_merge($sessionIds, $clientSessions, $userSessions));
            if (!$userId) {
                $userObj = \App\Models\User::where('phone', $phone)->first();
                if ($userObj) $userId = $userObj->id;
            }
        }

        $query = UserMcqResult::with([
            'question.savedMcqs' => function($q) use ($sessionIds, $userId) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) $q->orWhereIn('session_id', $sessionIds);
                    else $q->whereIn('session_id', $sessionIds);
                }
            },
            'question.page.chapter.category',
            'page',
            'chapter',
            'category'
        ]);

        if ($userId || !empty($sessionIds)) {
            $query->where(function($q) use ($userId, $sessionIds) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if (!empty($sessionIds)) {
                    if ($userId) {
                        $q->orWhereIn('session_id', $sessionIds);
                    } else {
                        $q->whereIn('session_id', $sessionIds);
                    }
                }
            });
        }

        if ($isCorrect !== null && $isCorrect !== '') {
            $val = ($isCorrect === 'true' || $isCorrect === '1' || $isCorrect === 1);
            $query->where('is_correct', $val ? 1 : 0);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($chapterId) {
            $query->where('chapter_id', $chapterId);
        }

        if ($pageId) {
            $query->where('page_id', $pageId);
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        if ($search) {
            $query->whereHas('question', function ($q) use ($search) {
                $q->where('italian', 'like', "%{$search}%")
                  ->orWhere('bangla', 'like', "%{$search}%");
            });
        }

        $perPage = $request->query('per_page', 10);
        $results = $query->orderBy('updated_at', 'desc')->paginate($perPage);

        return response()->json($results);
    }
}
