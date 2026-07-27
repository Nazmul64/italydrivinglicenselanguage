<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Page;
use Illuminate\Http\Request;

class ManualeApiController extends Controller
{
    /**
     * Get Manuale theory chapters.
     */
    public function getChapters()
    {
        $chapters = Chapter::withCount('pages')->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    /**
     * Get Manuale pages for a specific chapter.
     */
    public function getPages($chapterId)
    {
        $pages = Page::where('chapter_id', $chapterId)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get Manuale page theory text and details.
     */
    public function getPageContent($id)
    {
        $page = Page::with('chapter')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $page
        ]);
    }
}
