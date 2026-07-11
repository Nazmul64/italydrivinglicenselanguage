<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use App\Models\SavedMcq;
use App\Models\Note;
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
    public function getChapters()
    {
        $chapters = Chapter::where('status', true)->orderBy('id', 'asc')->get();
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
            ->where('status', true)
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
        $page = Page::with(['questions' => function ($q) {
            $q->orderBy('id', 'asc');
        }])->findOrFail($pageId);
        
        return response()->json($page);
    }

    /**
     * Get list of saved MCQs for user/session.
     */
    public function getSavedMcqs(Request $request)
    {
        $sessionId = $request->query('session_id') ?: session()->getId();
        $userId = $request->query('user_id');

        $query = SavedMcq::with('question');

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $saved = $query->orderBy('created_at', 'desc')->get();
        return response()->json($saved);
    }

    /**
     * Toggle MCQ bookmark status (Save/Unsave).
     */
    public function toggleSavedMcq(Request $request)
    {
        $request->validate([
            'question_id' => 'required|integer',
        ]);

        $sessionId = $request->input('session_id') ?: session()->getId();
        $userId = $request->input('user_id');
        $questionId = $request->input('question_id');

        // Check if already saved
        $query = SavedMcq::where('question_id', $questionId);
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['saved' => false, 'message' => 'Question removed from bookmarks.']);
        } else {
            SavedMcq::create([
                'session_id' => $userId ? null : $sessionId,
                'user_id' => $userId,
                'question_id' => $questionId
            ]);
            return response()->json(['saved' => true, 'message' => 'Question added to bookmarks.']);
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
        $noteText = $request->input('note_text');

        // Find existing note for this page/question and user
        $query = Note::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        if ($questionId) {
            $query->where('question_id', $questionId);
        } elseif ($pageId) {
            $query->where('page_id', $pageId);
        } else {
            return response()->json(['error' => 'Either page_id or question_id must be provided'], 400);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->update(['note_text' => $noteText]);
            return response()->json($existing);
        } else {
            $note = Note::create([
                'session_id' => $userId ? null : $sessionId,
                'user_id' => $userId,
                'page_id' => $pageId,
                'question_id' => $questionId,
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
        $perPage = $request->query('per_page', 10);

        $query = Chapter::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bn_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
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
            'name'           => 'required|string|max:255',
            'bn_name'        => 'nullable|string|max:255',
            'chapter_number' => 'nullable|integer',
            'description'    => 'nullable|string',
            'sort_order'     => 'nullable|integer',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'cover_image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $data = [
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'chapter_number' => $request->chapter_number ?? 0,
            'description'    => $request->description,
            'sort_order'     => $request->sort_order ?? 0,
            'status'         => $request->status ?? true,
        ];

        if ($request->hasFile('image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/chapters', 'chapter_thumb', 600, 80);
            $data['image'] = $uploadedPath ?: '';
        }

        if ($request->hasFile('cover_image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('cover_image'), 'uploads/chapters', 'chapter_cover', 1200, 80);
            $data['cover_image'] = $uploadedPath ?: '';
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
            'name'           => 'required|string|max:255',
            'bn_name'        => 'nullable|string|max:255',
            'chapter_number' => 'nullable|integer',
            'description'    => 'nullable|string',
            'sort_order'     => 'nullable|integer',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'cover_image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $updateData = [
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'chapter_number' => $request->chapter_number ?? $chapter->chapter_number,
            'description'    => $request->description,
            'sort_order'     => $request->sort_order ?? $chapter->sort_order,
        ];

        if ($request->hasFile('image')) {
            if ($chapter->image && file_exists(public_path($chapter->image))) {
                @unlink(public_path($chapter->image));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/chapters', 'chapter_thumb', 600, 80);
            $updateData['image'] = $uploadedPath ?: '';
        }

        if ($request->hasFile('cover_image')) {
            if ($chapter->cover_image && file_exists(public_path($chapter->cover_image))) {
                @unlink(public_path($chapter->cover_image));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('cover_image'), 'uploads/chapters', 'chapter_cover', 1200, 80);
            $updateData['cover_image'] = $uploadedPath ?: '';
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

        $query = Page::withCount('questions')->where('chapter_id', $chapterId);

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
            'chapter_id' => 'required|integer|exists:chapters,id',
            'title'      => 'required|string|max:255',
            'bn_title'   => 'nullable|string|max:255',
            'content'    => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'image'      => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'audio'      => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'      => 'nullable',
            'pdf_file'   => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $data = [
            'chapter_id' => $request->chapter_id,
            'title'      => $request->title,
            'bn_title'   => $request->bn_title ?: $request->title,
            'content'    => $request->content,
            'sort_order' => $request->sort_order ?? 0,
            'status'     => $request->status ?? true,
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
            'title'      => 'required|string|max:255',
            'bn_title'   => 'nullable|string|max:255',
            'content'    => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'image'      => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'audio'      => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'      => 'nullable',
            'pdf_file'   => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $page->title = $request->title;
        $page->bn_title = $request->bn_title ?: $request->title;
        $page->content = $request->content;
        $page->sort_order = $request->sort_order ?? $page->sort_order;

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

        $page->delete();
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
}
