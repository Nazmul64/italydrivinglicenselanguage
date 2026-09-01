<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartelloCategory;
use App\Models\CartelloChapter;
use App\Models\CartelloPage;
use App\Models\CartelloMcq;
use Illuminate\Http\Request;

class CartelliApiController extends Controller
{
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
     * Get MCQs for a Cartelli page.
     */
    public function getPageMcqs($pageId)
    {
        $mcqs = CartelloMcq::where('page_id', $pageId)->where('status', true)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $mcqs
        ]);
    }

    /**
     * Get MCQs for an entire Cartelli chapter.
     */
    public function getChapterMcqs($chapterId)
    {
        $pageIds = CartelloPage::where('chapter_id', $chapterId)->where('status', true)->pluck('id');
        $mcqs = CartelloMcq::whereIn('page_id', $pageIds)->where('status', true)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $mcqs
        ]);
    }
}
