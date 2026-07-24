<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LectureClass;
use Illuminate\Http\Request;

class LezioniApiController extends Controller
{
    public function index(Request $request)
    {
        $lectures = LectureClass::where('is_published', true)
            ->orderBy('order_index', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $lectures
        ]);
    }

    public function show($id)
    {
        $lecture = LectureClass::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $lecture
        ]);
    }
}
