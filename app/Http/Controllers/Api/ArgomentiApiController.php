<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use App\Models\SavedMcq;
use App\Models\Note;
use Illuminate\Http\Request;

class ArgomentiApiController extends Controller
{
    /**
     * Get all theory chapters with questions count and progress data.
     */
    public function getChapters(Request $request)
    {
        $chapters = Chapter::where('status', true)
            ->withCount(['pages', 'questions'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $chapters->transform(function ($ch) {
            $total = $ch->questions_count;
            $ch->corrette = 0;
            $ch->errori = 0;
            $ch->non_risposte = $total;
            $ch->totale = $total;
            return $ch;
        });

        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    /**
     * Get pages for a specific chapter.
     */
    public function getChapterPages(Request $request, $id)
    {
        $pages = Page::where('status', true)
            ->where(function ($query) use ($id) {
                $query->where('chapter_id', $id)
                    ->orWhereHas('chapter', function ($q) use ($id) {
                        $q->where('chapter_number', $id);
                    });
            })
            ->withCount('questions')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $pages->transform(function ($p) {
            $total = $p->questions_count;
            $p->corrette = 0;
            $p->errori = 0;
            $p->non_risposte = $total;
            $p->totale = $total;
            return $p;
        });

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
        $pages = Page::where('status', true)
            ->withCount('questions')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    /**
     * Get details and MCQs of a specific page.
     */
    public function getPageDetails(Request $request, $id)
    {
        $page = Page::with(['chapter', 'questions' => function ($q) {
            $q->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
        }])->find($id);

        if (!$page) {
            return response()->json([
                'status' => 'error',
                'message' => 'Page not found',
                'data' => null
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $page
        ]);
    }
}
