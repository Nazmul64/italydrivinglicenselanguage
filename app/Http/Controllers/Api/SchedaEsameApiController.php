<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSheet;
use Illuminate\Http\Request;

class SchedaEsameApiController extends Controller
{
    public function index()
    {
        $sheets = ExamSheet::where('is_active', true)->get();
        return response()->json([
            'status' => 'success',
            'data' => $sheets
        ]);
    }
}
