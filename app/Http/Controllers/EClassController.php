<?php

namespace App\Http\Controllers;

use App\Models\LiveClass;
use Illuminate\Http\Request;

class EClassController extends Controller
{
    /**
     * Get list of live online E-Classes.
     */
    public function index(Request $request)
    {
        $classes = LiveClass::where('is_active', true)
            ->orderBy('scheduled_at', 'asc')
            ->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $classes
            ]);
        }

        return view('frontend.screens.eclass', compact('classes'));
    }
}
