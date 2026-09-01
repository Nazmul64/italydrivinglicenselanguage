<?php

namespace App\Http\Controllers;

use App\Models\CartelloCategory;
use App\Models\CartelloChapter;
use App\Models\CartelloPage;
use App\Models\CartelloMcq;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class CartelloController extends Controller
{
    // =================================================
    // 1. CARTELLO CATEGORIES CRUD
    // =================================================

    public function getCategories(Request $request)
    {
        $search = $request->query('search');
        $query = CartelloCategory::withCount('chapters');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bn_name', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('sort_order', 'asc')->get();
        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'description'    => 'nullable|string',
            'bn_description' => 'nullable|string',
            'sort_order'     => 'nullable|integer',
        ]);

        $category = CartelloCategory::create([
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'sort_order'     => $request->sort_order ?? 0,
            'status'         => true,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'category' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = CartelloCategory::findOrFail($id);
        $request->validate([
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'description'    => 'nullable|string',
            'bn_description' => 'nullable|string',
            'sort_order'     => 'nullable|integer',
        ]);

        $category->update([
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'sort_order'     => $request->sort_order ?? $category->sort_order,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'category' => $category]);
    }

    public function deleteCategory($id)
    {
        $category = CartelloCategory::findOrFail($id);

        // Check if related chapters exist before deleting
        if ($category->chapters()->count() > 0) {
            Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json([
                'success' => false,
                'message' => 'এই ক্যাটাগরির অধীনে চ্যাপ্টার রয়েছে, তাই এটি সরাসরি ডিলিট করা যাবে না। প্রথমে চ্যাপ্টারগুলো ডিলিট করুন।'
            ], 422);
        }

        $category->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    // =================================================
    // 2. CARTELLO CHAPTERS CRUD
    // =================================================

    public function getChapters(Request $request)
    {
        $categoryId = $request->query('category_id');
        $search = $request->query('search');
        $query = CartelloChapter::with('category')->withCount('pages');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bn_name', 'like', "%{$search}%");
            });
        }

        $chapters = $query->orderBy('sort_order', 'asc')->get();
        return response()->json($chapters);
    }

    public function storeChapter(Request $request)
    {
        $request->validate([
            'category_id'    => 'nullable',
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'chapter_number' => 'required|integer',
            'sort_order'     => 'nullable|integer',
            'image'          => 'nullable|max:20480',
        ]);

        $categoryId = $request->category_id;
        if ($categoryId && !CartelloCategory::where('id', $categoryId)->exists()) {
            $categoryId = null;
        }

        if (!$categoryId) {
            $defaultCat = CartelloCategory::first();
            if (!$defaultCat) {
                $defaultCat = CartelloCategory::create([
                    'name'        => 'Generale',
                    'bn_name'     => 'সাধারণ ক্যাটাগরি',
                    'sort_order'  => 1,
                    'status'      => true
                ]);
            }
            $categoryId = $defaultCat->id;
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/cartelli/chapters', 'cartello_chap_' . time(), 800, 80);
        }

        $chapter = CartelloChapter::create([
            'category_id'    => $categoryId,
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'chapter_number' => $request->chapter_number,
            'sort_order'     => $request->sort_order ?? 0,
            'image'          => $imagePath,
            'status'         => true,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'chapter' => $chapter]);
    }

    public function updateChapter(Request $request, $id)
    {
        $chapter = CartelloChapter::findOrFail($id);
        $request->validate([
            'category_id'    => 'nullable',
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'chapter_number' => 'required|integer',
            'sort_order'     => 'nullable|integer',
            'image'          => 'nullable|max:20480',
        ]);

        $categoryId = $request->category_id ?: $chapter->category_id;
        if ($categoryId && !CartelloCategory::where('id', $categoryId)->exists()) {
            $categoryId = null;
        }

        if (!$categoryId) {
            $defaultCat = CartelloCategory::first();
            if (!$defaultCat) {
                $defaultCat = CartelloCategory::create([
                    'name'        => 'Generale',
                    'bn_name'     => 'সাধারণ ক্যাটাগরি',
                    'sort_order'  => 1,
                    'status'      => true
                ]);
            }
            $categoryId = $defaultCat->id;
        }

        $chapter->name = $request->name;
        $chapter->bn_name = $request->bn_name;
        $chapter->chapter_number = $request->chapter_number;
        $chapter->category_id = $categoryId;
        if ($request->has('sort_order')) {
            $chapter->sort_order = $request->sort_order ?? 0;
        }

        if ($request->hasFile('image')) {
            $chapter->image = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/cartelli/chapters', 'cartello_chap_' . time(), 800, 80);
        }

        $chapter->save();

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'chapter' => $chapter]);
    }

    public function deleteChapter($id)
    {
        $chapter = CartelloChapter::findOrFail($id);

        // Check if related pages exist
        if ($chapter->pages()->count() > 0) {
            Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json([
                'success' => false,
                'message' => 'এই চ্যাপ্টারের অধীনে পেজ রয়েছে, তাই এটি সরাসরি ডিলিট করা যাবে না। প্রথমে পেজগুলো ডিলিট করুন।'
            ], 422);
        }

        $chapter->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    // =================================================
    // 3. CARTELLO PAGES CRUD
    // =================================================

    public function getPages(Request $request)
    {
        $chapterId = $request->query('chapter_id');
        $search = $request->query('search');
        $query = CartelloPage::with('chapter.category');

        if ($chapterId) {
            $query->where('chapter_id', $chapterId);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('bn_title', 'like', "%{$search}%");
            });
        }

        $pages = $query->orderBy('sort_order', 'asc')->get();
        return response()->json($pages);
    }

    public function storePage(Request $request)
    {
        $request->validate([
            'chapter_id'     => 'required|exists:cartello_chapters,id',
            'page_number'    => 'required|integer',
            'title'          => 'required|string|max:255',
            'bn_title'       => 'required|string|max:255',
            'description'    => 'nullable|string',
            'bn_description' => 'nullable|string',
            'image'          => 'nullable|max:20480',
            'video'          => 'nullable|max:51200',
            'voice'          => 'nullable|max:25600',
            'translation'    => 'nullable|string',
            'is_vero'        => 'nullable|boolean',
            'sort_order'     => 'nullable|integer',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_pages/images',
                'page'
            );
        }

        $videoPath = null;
        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'page_vid_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_pages/videos'), $fileName);
            $videoPath = 'uploads/cartello_pages/videos/' . $fileName;
        }

        $voicePath = null;
        if ($request->hasFile('voice')) {
            $file = $request->file('voice');
            $fileName = 'page_voice_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_pages/voices'), $fileName);
            $voicePath = '/uploads/cartello_pages/voices/' . $fileName;
        }

        $page = CartelloPage::create([
            'chapter_id'     => $request->chapter_id,
            'page_number'    => $request->page_number,
            'title'          => $request->title,
            'bn_title'       => $request->bn_title,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'image'          => $imagePath,
            'video'          => $videoPath,
            'voice'          => $voicePath,
            'translation'    => $request->translation,
            'is_vero'        => $request->has('is_vero') ? (bool)$request->is_vero : true,
            'sort_order'     => $request->sort_order ?? 0,
            'status'         => true,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'page' => $page]);
    }

    public function updatePage(Request $request, $id)
    {
        $page = CartelloPage::findOrFail($id);
        $request->validate([
            'chapter_id'     => 'required|exists:cartello_chapters,id',
            'page_number'    => 'required|integer',
            'title'          => 'required|string|max:255',
            'bn_title'       => 'required|string|max:255',
            'description'    => 'nullable|string',
            'bn_description' => 'nullable|string',
            'image'          => 'nullable|max:20480',
            'video'          => 'nullable|max:51200',
            'voice'          => 'nullable|max:25600',
            'translation'    => 'nullable|string',
            'is_vero'        => 'nullable|boolean',
            'sort_order'     => 'nullable|integer',
        ]);

        $imagePath = $page->image;
        if ($request->hasFile('image')) {
            if ($page->image && file_exists(public_path($page->image))) {
                @unlink(public_path($page->image));
            }
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_pages/images',
                'page'
            );
        }

        $videoPath = $page->video;
        if ($request->hasFile('video')) {
            if ($page->video && file_exists(public_path($page->video))) {
                @unlink(public_path($page->video));
            }
            $file = $request->file('video');
            $fileName = 'page_vid_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_pages/videos'), $fileName);
            $videoPath = 'uploads/cartello_pages/videos/' . $fileName;
        }

        $voicePath = $page->voice;
        if ($request->hasFile('voice')) {
            if ($page->voice && file_exists(public_path($page->voice))) {
                @unlink(public_path($page->voice));
            }
            $file = $request->file('voice');
            $fileName = 'page_voice_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_pages/voices'), $fileName);
            $voicePath = '/uploads/cartello_pages/voices/' . $fileName;
        }

        $page->update([
            'chapter_id'     => $request->chapter_id,
            'page_number'    => $request->page_number,
            'title'          => $request->title,
            'bn_title'       => $request->bn_title,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'image'          => $imagePath,
            'video'          => $videoPath,
            'voice'          => $voicePath,
            'translation'    => $request->translation,
            'is_vero'        => $request->is_vero,
            'sort_order'     => $request->sort_order ?? $page->sort_order,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'page' => $page]);
    }

    public function deletePage($id)
    {
        $page = CartelloPage::findOrFail($id);

        // Delete associated files
        if ($page->image && file_exists(public_path($page->image))) {
            @unlink(public_path($page->image));
        }
        if ($page->video && file_exists(public_path($page->video))) {
            @unlink(public_path($page->video));
        }
        if ($page->voice && file_exists(public_path($page->voice))) {
            @unlink(public_path($page->voice));
        }

        $page->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    /**
     * Delete multiple categories.
     */
    public function bulkDeleteCategory(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cartello_categories,id',
        ]);

        $hasChapters = CartelloChapter::whereIn('category_id', $request->ids)->exists();
        if ($hasChapters) {
            Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json([
                'success' => false,
                'message' => 'নির্বাচিত কোনো কোনো ক্যাটাগরির অধীনে চ্যাপ্টার রয়েছে, তাই ডিলিট করা সম্ভব নয়। প্রথমে চ্যাপ্টারগুলো ডিলিট করুন।'
            ], 422);
        }

        CartelloCategory::whereIn('id', $request->ids)->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    /**
     * Delete multiple chapters.
     */
    public function bulkDeleteChapter(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cartello_chapters,id',
        ]);

        $hasPages = CartelloPage::whereIn('chapter_id', $request->ids)->exists();
        if ($hasPages) {
            Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json([
                'success' => false,
                'message' => 'নির্বাচিত কোনো কোনো চ্যাপ্টারের অধীনে পেজ রয়েছে, তাই ডিলিট করা সম্ভব নয়। প্রথমে পেজগুলো ডিলিট করুন।'
            ], 422);
        }

        CartelloChapter::whereIn('id', $request->ids)->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    /**
     * Delete multiple pages and their assets.
     */
    public function bulkDeletePage(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cartello_pages,id',
        ]);

        $pages = CartelloPage::whereIn('id', $request->ids)->get();
        foreach ($pages as $page) {
            if ($page->image && file_exists(public_path($page->image))) {
                @unlink(public_path($page->image));
            }
            if ($page->video && file_exists(public_path($page->video))) {
                @unlink(public_path($page->video));
            }
            if ($page->voice && file_exists(public_path($page->voice))) {
                @unlink(public_path($page->voice));
            }
            $page->delete();
        }

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    // =================================================
    // PUBLIC API METHODS FOR FRONTEND
    // =================================================

    public function publicGetCategories()
    {
        $categories = CartelloCategory::where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($categories);
    }

    public function publicGetChapters($categoryId)
    {
        $chapters = CartelloChapter::where('category_id', $categoryId)
            ->where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($chapters);
    }

    public function publicGetAllChapters()
    {
        $chapters = CartelloChapter::with('category')
            ->where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($chapters);
    }

    public function publicGetPages(Request $request, $chapterId = null)
    {
        $query = CartelloPage::with(['chapter.category', 'mcqs'])->where('status', true);

        if ($chapterId && $chapterId !== 'all') {
            $query->where('chapter_id', $chapterId);
        }

        if ($request->query('category_id')) {
            $catId = $request->query('category_id');
            $query->whereHas('chapter', function($q) use ($catId) {
                $q->where('category_id', $catId);
            });
        }

        $pages = $query->orderBy('sort_order', 'asc')->get();
        return response()->json($pages);
    }

    public function publicGetPageMcqs($pageId)
    {
        $page = CartelloPage::where('id', $pageId)->where('status', true)->firstOrFail();
        
        $mcqs = CartelloMcq::where('page_id', $pageId)->where('status', true)->orderBy('sort_order', 'asc')->get();

        return response()->json($mcqs);
    }

    // =================================================
    // MCQ ADMIN API METHODS (ALL FIELDS NULLABLE)
    // =================================================

    public function getMcqs(Request $request)
    {
        $query = CartelloMcq::with(['page.chapter.category']);

        if ($request->filled('page_id')) {
            $query->where('page_id', $request->page_id);
        } elseif ($request->filled('chapter_id')) {
            $chapId = $request->chapter_id;
            $query->whereHas('page', function($q) use ($chapId) {
                $q->where('chapter_id', $chapId);
            });
        } elseif ($request->filled('category_id')) {
            $catId = $request->category_id;
            $query->whereHas('page.chapter', function($q) use ($catId) {
                $q->where('category_id', $catId);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('bn_question', 'like', "%{$search}%");
            });
        }

        $mcqs = $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($mcqs);
    }

    public function storeMcq(Request $request)
    {
        $request->validate([
            'page_id'        => 'nullable|integer',
            'sort_order'     => 'nullable|integer',
            'question'       => 'nullable|string',
            'bn_question'    => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'explanation'    => 'nullable|string',
            'bn_explanation' => 'nullable|string',
            'image'          => 'nullable|max:20480',
            'voice'          => 'nullable|max:25600',
            'video'          => 'nullable|max:51200',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_mcqs/images',
                'mcq'
            );
        }

        $voicePath = null;
        $voiceFile = $request->file('voice') ?: $request->file('audio');
        if ($voiceFile) {
            $fileName = 'mcq_voice_' . uniqid() . '_' . time() . '.' . $voiceFile->getClientOriginalExtension();
            $voiceFile->move(public_path('uploads/cartello_mcqs/voices'), $fileName);
            $voicePath = '/uploads/cartello_mcqs/voices/' . $fileName;
        }

        $videoPath = $request->input('video_url', $request->input('youtube_url', null));
        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'mcq_vid_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_mcqs/videos'), $fileName);
            $videoPath = '/uploads/cartello_mcqs/videos/' . $fileName;
        } elseif ($request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $fileName = 'mcq_vid_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_mcqs/videos'), $fileName);
            $videoPath = '/uploads/cartello_mcqs/videos/' . $fileName;
        }

        $vocabData = [];
        if ($request->has('vocab_italian') && is_array($request->vocab_italian)) {
            foreach ($request->vocab_italian as $idx => $itWord) {
                if (empty(trim($itWord))) continue;
                $bnWord = $request->vocab_bangla[$idx] ?? '';
                $itemImage = null;
                if ($request->hasFile("vocab_image.{$idx}")) {
                    $itemImage = ImageHelper::uploadAndOptimize(
                        $request->file("vocab_image.{$idx}"),
                        'uploads/cartello_mcqs/vocab',
                        'vocab'
                    );
                }
                $vocabData[] = [
                    'italian' => trim($itWord),
                    'bangla'  => trim($bnWord),
                    'image'   => $itemImage,
                ];
            }
        }

        $mcq = CartelloMcq::create([
            'page_id'        => $request->page_id,
            'sort_order'     => $request->sort_order ?? 0,
            'question'       => $request->question ?? '',
            'bn_question'    => $request->bn_question ?? '',
            'correct_answer' => strtolower($request->correct_answer ?? 'vero'),
            'explanation'    => $request->explanation,
            'bn_explanation' => $request->bn_explanation,
            'image'          => $imagePath,
            'image_position' => $request->image_position ?? 'left',
            'voice'          => $voicePath,
            'video'          => $videoPath,
            'vocabulary'     => $vocabData,
            'status'         => true,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'mcq' => $mcq]);
    }

    public function updateMcq(Request $request, $id)
    {
        $mcq = CartelloMcq::findOrFail($id);
        $request->validate([
            'page_id'        => 'nullable|integer',
            'sort_order'     => 'nullable|integer',
            'question'       => 'nullable|string',
            'bn_question'    => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'explanation'    => 'nullable|string',
            'bn_explanation' => 'nullable|string',
            'image'          => 'nullable|max:20480',
            'voice'          => 'nullable|max:25600',
            'audio'          => 'nullable|max:25600',
            'video'          => 'nullable|max:51200',
        ]);

        $imagePath = $mcq->image;
        if ($request->hasFile('image')) {
            if ($mcq->image && file_exists(public_path($mcq->image))) {
                @unlink(public_path($mcq->image));
            }
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_mcqs/images',
                'mcq'
            );
        }

        $voicePath = $mcq->voice;
        $voiceFile = $request->file('voice') ?: $request->file('audio');
        if ($voiceFile) {
            if ($mcq->voice && file_exists(public_path($mcq->voice))) {
                @unlink(public_path($mcq->voice));
            }
            $fileName = 'mcq_voice_' . uniqid() . '_' . time() . '.' . $voiceFile->getClientOriginalExtension();
            $voiceFile->move(public_path('uploads/cartello_mcqs/voices'), $fileName);
            $voicePath = '/uploads/cartello_mcqs/voices/' . $fileName;
        }

        $videoPath = $mcq->video;
        if ($request->filled('youtube_url')) {
            $videoPath = $request->youtube_url;
        } elseif ($request->hasFile('video')) {
            if ($mcq->video && !str_contains($mcq->video, 'youtube') && file_exists(public_path($mcq->video))) {
                @unlink(public_path($mcq->video));
            }
            $file = $request->file('video');
            $fileName = 'mcq_vid_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/cartello_mcqs/videos'), $fileName);
            $videoPath = '/uploads/cartello_mcqs/videos/' . $fileName;
        }

        if ($request->filled('clear_video')) {
            $videoPath = null;
        }

        $vocabData = $mcq->vocabulary ?? [];
        if ($request->has('vocab_italian') && is_array($request->vocab_italian)) {
            $vocabData = [];
            foreach ($request->vocab_italian as $idx => $itWord) {
                if (empty(trim($itWord))) continue;
                $bnWord = $request->vocab_bangla[$idx] ?? '';
                $itemImage = null;
                if ($request->hasFile("vocab_image.{$idx}")) {
                    $itemImage = ImageHelper::uploadAndOptimize(
                        $request->file("vocab_image.{$idx}"),
                        'uploads/cartello_mcqs/vocab',
                        'vocab'
                    );
                }
                $vocabData[] = [
                    'italian' => trim($itWord),
                    'bangla'  => trim($bnWord),
                    'image'   => $itemImage,
                ];
            }
        }

        $mcq->update([
            'page_id'        => $request->page_id ?? $mcq->page_id,
            'sort_order'     => $request->has('sort_order') ? $request->sort_order : $mcq->sort_order,
            'question'       => $request->has('question') ? $request->question : $mcq->question,
            'bn_question'    => $request->has('bn_question') ? $request->bn_question : $mcq->bn_question,
            'correct_answer' => $request->has('correct_answer') ? strtolower($request->correct_answer) : $mcq->correct_answer,
            'explanation'    => $request->has('explanation') ? $request->explanation : $mcq->explanation,
            'bn_explanation' => $request->has('bn_explanation') ? $request->bn_explanation : $mcq->bn_explanation,
            'image'          => $imagePath,
            'image_position' => $request->image_position ?? $mcq->image_position ?? 'left',
            'voice'          => $voicePath,
            'video'          => $videoPath,
            'vocabulary'     => $vocabData,
        ]);

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true, 'mcq' => $mcq]);
    }

    public function deleteMcq($id)
    {
        $mcq = CartelloMcq::findOrFail($id);
        if ($mcq->image && file_exists(public_path($mcq->image))) {
            @unlink(public_path($mcq->image));
        }
        if ($mcq->voice && file_exists(public_path($mcq->voice))) {
            @unlink(public_path($mcq->voice));
        }
        $mcq->delete();
        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }

    public function bulkDeleteMcq(Request $request)
    {
        $request->validate([
            'ids'   => 'nullable|array',
            'ids.*' => 'nullable|integer',
        ]);

        if (!empty($request->ids)) {
            $mcqs = CartelloMcq::whereIn('id', $request->ids)->get();
            foreach ($mcqs as $mcq) {
                if ($mcq->image && file_exists(public_path($mcq->image))) {
                    @unlink(public_path($mcq->image));
                }
                if ($mcq->voice && file_exists(public_path($mcq->voice))) {
                    @unlink(public_path($mcq->voice));
                }
                $mcq->delete();
            }
        }

        Cache::forget('frontend_cached_view_data'); Cache::forget('public_cartelli_categories'); Cache::forget('public_cartelli_all_chapters'); return response()->json(['success' => true]);
    }
}
