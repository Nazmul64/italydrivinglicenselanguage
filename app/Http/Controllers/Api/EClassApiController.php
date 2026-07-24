<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveClass;
use Illuminate\Http\Request;

class EClassApiController extends Controller
{
    public function index()
    {
        $classes = LiveClass::where('is_active', true)
            ->orderBy('scheduled_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $classes
        ]);
    }
}
