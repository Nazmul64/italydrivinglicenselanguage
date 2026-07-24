<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartelloCategory;
use App\Models\CartelloChapter;
use App\Models\CartelloMcq;
use Illuminate\Http\Request;

class CartelliApiController extends Controller
{
    public function getCategories()
    {
        $categories = CartelloCategory::where('status', true)->get();
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function getChapters($categoryId)
    {
        $chapters = CartelloChapter::where('category_id', $categoryId)->get();
        return response()->json([
            'status' => 'success',
            'data' => $chapters
        ]);
    }
}
