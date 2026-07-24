<?php

namespace App\Http\Controllers;

use App\Models\LectureClass;
use Illuminate\Http\Request;

class LezioniController extends Controller
{
    /**
     * Display a listing of video lectures and classes.
     */
    public function index(Request $request)
    {
        $lectures = LectureClass::where('is_published', true)
            ->orderBy('order_index', 'asc')
            ->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $lectures
            ]);
        }

        return view('frontend.screens.lezioni', compact('lectures'));
    }

    /**
     * Get specific lecture video details.
     */
    public function show($id)
    {
        $lecture = LectureClass::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $lecture
        ]);
    }
}
