<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LivePassedExam;
use App\Models\ExamSheet;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;

class LivePassedExamApiController extends Controller
{
    /**
     * Get list of live passed exams for mobile app and website.
     * Merges passed/completed exams from ExamSheet and LivePassedExam so all student results appear!
     */
    public function index(Request $request)
    {
        $search = trim($request->get('search', ''));
        $status = strtolower(trim($request->get('status', '')));

        $query = LivePassedExam::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('motorizzazione', 'like', "%{$search}%")
                  ->orWhere('exam_date', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($status === 'nuove' || $status === 'new') {
            $query->where('status', 'nuove');
        } elseif ($status === 'completato' || $status === 'completed') {
            $query->where(function($q) {
                $q->where('status', 'completato')
                  ->orWhereNull('status');
            });
        }

        $liveExams = $query->orderBy('id', 'desc')->get()->map(function($lx) {
            return [
                'id' => $lx->id,
                'nome' => $lx->nome,
                'student_name' => $lx->nome,
                'avatar' => null,
                'motorizzazione' => $lx->motorizzazione ?: 'Motorizzazione Civile',
                'exam_date' => $lx->exam_date ?: ($lx->created_at ? $lx->created_at->format('d/m/Y') : date('d/m/Y')),
                'status' => $lx->status ?: 'completato',
                'corrette' => $lx->corrette ?? 28,
                'errori' => $lx->errori ?? 2,
                'non_risposte' => $lx->non_risposte ?? 0,
                'totale' => $lx->totale ?: 30,
                'pdf_url' => $lx->pdf_url,
                'pdf_path' => $lx->pdf_path,
                'has_quiz' => false,
                'created_at' => $lx->created_at ? $lx->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $liveExams->count(),
            'data' => $liveExams->values(),
        ]);
    }

    /**
     * Get single passed exam details.
     */
    public function show($id)
    {
        $realId = str_replace('pdf_', '', (string)$id);
        $exam = LivePassedExam::findOrFail($realId);
        return response()->json([
            'status' => 'success',
            'data' => $exam,
        ]);
    }
}
