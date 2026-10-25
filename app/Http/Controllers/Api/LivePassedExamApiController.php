<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LivePassedExam;
use Illuminate\Http\Request;

class LivePassedExamApiController extends Controller
{
    /**
     * Get list of live passed exams for mobile app and website.
     */
    public function index(Request $request)
    {
        $search = trim($request->get('search', ''));
        $status = strtolower(trim($request->get('status', '')));

        $query = LivePassedExam::query();

        if (!empty($status) && $status !== 'all') {
            $hasSpecific = LivePassedExam::where('status', $status)->exists();
            if ($hasSpecific) {
                $query->where('status', $status);
            }
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('motorizzazione', 'like', "%{$search}%")
                  ->orWhere('exam_date', 'like', "%{$search}%");
            });
        }

        $exams = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $exams->count(),
            'data' => $exams,
        ]);
    }

    /**
     * Get single passed exam details.
     */
    public function show($id)
    {
        $exam = LivePassedExam::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $exam,
        ]);
    }
}
