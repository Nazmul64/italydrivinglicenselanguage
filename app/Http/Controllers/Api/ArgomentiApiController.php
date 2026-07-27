<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use Illuminate\Http\Request;

class ArgomentiApiController extends Controller
{
    /**
     * Get all theory chapters.
     */
    public function getChapters()
    {
        $chapters = Chapter::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    /**
     * Get pages for a specific chapter.
     */
    public function getChapterPages($id)
    {
        $pages = Page::where('chapter_id', $id)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get all pages across all chapters.
     */
    public function getAllPages()
    {
        $pages = Page::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get details and MCQs of a specific page.
     */
    public function getPageDetails($id)
    {
        $page = Page::with(['chapter', 'questions' => function ($q) {
            $q->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
        }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $page
        ]);
    }
}
