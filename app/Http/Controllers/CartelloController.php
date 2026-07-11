<?php

namespace App\Http\Controllers;

use App\Models\CartelloCategory;
use App\Models\CartelloChapter;
use App\Models\CartelloPage;
use App\Models\CartelloMcq;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
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

        return response()->json(['success' => true, 'category' => $category]);
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

        return response()->json(['success' => true, 'category' => $category]);
    }

    public function deleteCategory($id)
    {
        $category = CartelloCategory::findOrFail($id);

        // Check if related chapters exist before deleting
        if ($category->chapters()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'এই ক্যাটাগরির অধীনে চ্যাপ্টার রয়েছে, তাই এটি সরাসরি ডিলিট করা যাবে না। প্রথমে চ্যাপ্টারগুলো ডিলিট করুন।'
            ], 422);
        }

        $category->delete();
        return response()->json(['success' => true]);
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
            'category_id'    => 'required|exists:cartello_categories,id',
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'chapter_number' => 'required|integer',
            'sort_order'     => 'nullable|integer',
        ]);

        // Max 25 chapters check
        $category = CartelloCategory::findOrFail($request->category_id);
        if ($category->chapters()->count() >= 25) {
            return response()->json([
                'success' => false,
                'message' => 'একটি ক্যাটাগরির অধীনে সর্বোচ্চ ২৫টি চ্যাপ্টার তৈরি করা সম্ভব।'
            ], 422);
        }

        $chapter = CartelloChapter::create([
            'category_id'    => $request->category_id,
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'chapter_number' => $request->chapter_number,
            'sort_order'     => $request->sort_order ?? 0,
            'status'         => true,
        ]);

        return response()->json(['success' => true, 'chapter' => $chapter]);
    }

    public function updateChapter(Request $request, $id)
    {
        $chapter = CartelloChapter::findOrFail($id);
        $request->validate([
            'category_id'    => 'required|exists:cartello_categories,id',
            'name'           => 'required|string|max:255',
            'bn_name'        => 'required|string|max:255',
            'chapter_number' => 'required|integer',
            'sort_order'     => 'nullable|integer',
        ]);

        // Max 25 chapters check if changing category
        if ($chapter->category_id != $request->category_id) {
            $newCategory = CartelloCategory::findOrFail($request->category_id);
            if ($newCategory->chapters()->count() >= 25) {
                return response()->json([
                    'success' => false,
                    'message' => 'উদ্দিষ্ট ক্যাটাগরির অধীনে ইতিমধ্যেই ২৫টি চ্যাপ্টার রয়েছে।'
                ], 422);
            }
        }

        $chapter->update([
            'category_id'    => $request->category_id,
            'name'           => $request->name,
            'bn_name'        => $request->bn_name,
            'chapter_number' => $request->chapter_number,
            'sort_order'     => $request->sort_order ?? $chapter->sort_order,
        ]);

        return response()->json(['success' => true, 'chapter' => $chapter]);
    }

    public function deleteChapter($id)
    {
        $chapter = CartelloChapter::findOrFail($id);

        // Check if related pages exist
        if ($chapter->pages()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'এই চ্যাপ্টারের অধীনে পেজ রয়েছে, তাই এটি সরাসরি ডিলিট করা যাবে না। প্রথমে পেজগুলো ডিলিট করুন।'
            ], 422);
        }

        $chapter->delete();
        return response()->json(['success' => true]);
    }

    // =================================================
    // 3. CARTELLO PAGES CRUD
    // =================================================

    public function getPages(Request $request)
    {
        $chapterId = $request->query('chapter_id');
        $search = $request->query('search');
        $query = CartelloPage::with('chapter.category')->withCount('mcqs');

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
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'video'          => 'nullable|file|mimes:mp4,mov,avi,qt,webm|max:25600', // max 25MB video
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

        $page = CartelloPage::create([
            'chapter_id'     => $request->chapter_id,
            'page_number'    => $request->page_number,
            'title'          => $request->title,
            'bn_title'       => $request->bn_title,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'image'          => $imagePath,
            'video'          => $videoPath,
            'sort_order'     => $request->sort_order ?? 0,
            'status'         => true,
        ]);

        return response()->json(['success' => true, 'page' => $page]);
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
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'video'          => 'nullable|file|mimes:mp4,mov,avi,qt,webm|max:25600',
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

        $page->update([
            'chapter_id'     => $request->chapter_id,
            'page_number'    => $request->page_number,
            'title'          => $request->title,
            'bn_title'       => $request->bn_title,
            'description'    => $request->description,
            'bn_description' => $request->bn_description,
            'image'          => $imagePath,
            'video'          => $videoPath,
            'sort_order'     => $request->sort_order ?? $page->sort_order,
        ]);

        return response()->json(['success' => true, 'page' => $page]);
    }

    public function deletePage($id)
    {
        $page = CartelloPage::findOrFail($id);

        // Check if related MCQs exist
        if ($page->mcqs()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'এই পেজের অধীনে MCQ প্রশ্ন রয়েছে, তাই এটি সরাসরি ডিলিট করা যাবে না। প্রথমে প্রশ্নগুলো ডিলিট করুন।'
            ], 422);
        }

        // Delete associated files
        if ($page->image && file_exists(public_path($page->image))) {
            @unlink(public_path($page->image));
        }
        if ($page->video && file_exists(public_path($page->video))) {
            @unlink(public_path($page->video));
        }

        $page->delete();
        return response()->json(['success' => true]);
    }

    // =================================================
    // 4. CARTELLO MCQ QUESTIONS CRUD
    // =================================================

    public function getMcqs(Request $request)
    {
        $pageId = $request->query('page_id');
        $chapterId = $request->query('chapter_id');
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $query = CartelloMcq::with('page.chapter.category');

        if ($pageId) {
            $query->where('page_id', $pageId);
        } elseif ($chapterId) {
            $query->whereHas('page', function ($q) use ($chapterId) {
                $q->where('chapter_id', $chapterId);
            });
        } elseif ($categoryId) {
            $query->whereHas('page.chapter', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('bn_question', 'like', "%{$search}%");
            });
        }

        $mcqs = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 20));
        return response()->json($mcqs);
    }

    public function storeMcq(Request $request)
    {
        $request->validate([
            'page_id'        => 'required|exists:cartello_pages,id',
            'question'       => 'required|string',
            'bn_question'    => 'required|string',
            'option_a'       => 'nullable|string',
            'bn_option_a'    => 'nullable|string',
            'option_b'       => 'nullable|string',
            'bn_option_b'    => 'nullable|string',
            'option_c'       => 'nullable|string',
            'bn_option_c'    => 'nullable|string',
            'option_d'       => 'nullable|string',
            'bn_option_d'    => 'nullable|string',
            'correct_answer' => 'required|string|max:50',
            'explanation'    => 'nullable|string',
            'bn_explanation' => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_mcqs',
                'mcq'
            );
        }

        $mcq = CartelloMcq::create([
            'page_id'        => $request->page_id,
            'question'       => $request->question,
            'bn_question'    => $request->bn_question,
            'option_a'       => $request->option_a,
            'bn_option_a'    => $request->bn_option_a,
            'option_b'       => $request->option_b,
            'bn_option_b'    => $request->bn_option_b,
            'option_c'       => $request->option_c,
            'bn_option_c'    => $request->bn_option_c,
            'option_d'       => $request->option_d,
            'bn_option_d'    => $request->bn_option_d,
            'correct_answer' => $request->correct_answer,
            'explanation'    => $request->explanation,
            'bn_explanation' => $request->bn_explanation,
            'image'          => $imagePath,
            'status'         => true,
        ]);

        return response()->json(['success' => true, 'mcq' => $mcq]);
    }

    public function updateMcq(Request $request, $id)
    {
        $mcq = CartelloMcq::findOrFail($id);
        $request->validate([
            'page_id'        => 'required|exists:cartello_pages,id',
            'question'       => 'required|string',
            'bn_question'    => 'required|string',
            'option_a'       => 'nullable|string',
            'bn_option_a'    => 'nullable|string',
            'option_b'       => 'nullable|string',
            'bn_option_b'    => 'nullable|string',
            'option_c'       => 'nullable|string',
            'bn_option_c'    => 'nullable|string',
            'option_d'       => 'nullable|string',
            'bn_option_d'    => 'nullable|string',
            'correct_answer' => 'required|string|max:50',
            'explanation'    => 'nullable|string',
            'bn_explanation' => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $imagePath = $mcq->image;
        if ($request->hasFile('image')) {
            if ($mcq->image && file_exists(public_path($mcq->image))) {
                @unlink(public_path($mcq->image));
            }
            $imagePath = ImageHelper::uploadAndOptimize(
                $request->file('image'),
                'uploads/cartello_mcqs',
                'mcq'
            );
        }

        $mcq->update([
            'page_id'        => $request->page_id,
            'question'       => $request->question,
            'bn_question'    => $request->bn_question,
            'option_a'       => $request->option_a,
            'bn_option_a'    => $request->bn_option_a,
            'option_b'       => $request->option_b,
            'bn_option_b'    => $request->bn_option_b,
            'option_c'       => $request->option_c,
            'bn_option_c'    => $request->bn_option_c,
            'option_d'       => $request->option_d,
            'bn_option_d'    => $request->bn_option_d,
            'correct_answer' => $request->correct_answer,
            'explanation'    => $request->explanation,
            'bn_explanation' => $request->bn_explanation,
            'image'          => $imagePath,
        ]);

        return response()->json(['success' => true, 'mcq' => $mcq]);
    }

    public function deleteMcq($id)
    {
        $mcq = CartelloMcq::findOrFail($id);

        if ($mcq->image && file_exists(public_path($mcq->image))) {
            @unlink(public_path($mcq->image));
        }

        $mcq->delete();
        return response()->json(['success' => true]);
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

    public function publicGetPages($chapterId)
    {
        $pages = CartelloPage::where('chapter_id', $chapterId)
            ->where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($pages);
    }

    public function publicGetPageMcqs($pageId)
    {
        $mcqs = CartelloMcq::where('page_id', $pageId)
            ->where('status', true)
            ->orderBy('id', 'asc')
            ->get();
        return response()->json($mcqs);
    }
}
