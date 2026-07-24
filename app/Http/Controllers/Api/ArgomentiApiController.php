<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;
use Illuminate\Http\Request;

class ArgomentiApiController extends Controller
{
    public function getChapters()
    {
        $chapters = Chapter::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }

    public function getChapterPages($id)
    {
        $pages = Page::where('chapter_id', $id)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    public function getPageDetails($id)
    {
        $page = Page::with('chapter')->findOrFail($id);
        $questions = Question::where('page_id', $id)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'page' => $page,
                'questions' => $questions
            ]
        ]);
    }
}
