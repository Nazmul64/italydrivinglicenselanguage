<?php

namespace App\Http\Controllers;

use App\Models\LivePassedExam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LivePassedExamController extends Controller
{
    /**
     * List all live passed exams for admin table.
     */
    public function adminIndex(Request $request)
    {
        $search = trim($request->get('search', ''));
        $query = LivePassedExam::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('motorizzazione', 'like', "%{$search}%")
                  ->orWhere('exam_date', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $exams = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $exams,
        ]);
    }

    /**
     * Store new passed exam sheet with PDF file upload.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'motorizzazione' => 'nullable|string|max:255',
            'exam_date' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:nuove,completato',
            'corrette' => 'nullable|integer|min:0|max:30',
            'errori' => 'nullable|integer|min:0|max:30',
            'non_risposte' => 'nullable|integer|min:0|max:30',
            'totale' => 'nullable|integer|min:1|max:50',
            'pdf_file' => 'nullable|file|mimes:pdf|max:20480', // max 20MB
        ]);

        $pdfPath = null;

        if ($request->hasFile('pdf_file') && $request->file('pdf_file')->isValid()) {
            $file = $request->file('pdf_file');
            $uploadDir = public_path('uploads/live_exams');
            if (!File::exists($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true);
            }
            $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower($request->nome));
            $filename = 'scheda_' . $cleanName . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $pdfPath = '/uploads/live_exams/' . $filename;
        }

        $corrette = $request->filled('corrette') ? (int)$request->corrette : 28;
        $errori = $request->filled('errori') ? (int)$request->errori : (30 - $corrette);
        $nonRisposte = $request->filled('non_risposte') ? (int)$request->non_risposte : 0;
        $totale = $request->filled('totale') ? (int)$request->totale : 30;

        $exam = LivePassedExam::create([
            'nome' => $request->nome,
            'motorizzazione' => $request->motorizzazione ?: 'MODENA',
            'exam_date' => $request->exam_date ?: now()->format('d/m/Y'),
            'status' => $request->status ?: 'completato',
            'corrette' => $corrette,
            'errori' => $errori,
            'non_risposte' => $nonRisposte,
            'totale' => $totale,
            'pdf_path' => $pdfPath ?: '/uploads/live_exams/sample_scheda_esame.pdf',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Esame superato salvato con successo',
            'data' => $exam,
        ]);
    }

    /**
     * Update an existing passed exam record.
     */
    public function update(Request $request, $id)
    {
        $exam = LivePassedExam::findOrFail($id);

        $request->validate([
            'nome' => 'required|string|max:255',
            'motorizzazione' => 'nullable|string|max:255',
            'exam_date' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:nuove,completato',
            'corrette' => 'nullable|integer|min:0|max:30',
            'errori' => 'nullable|integer|min:0|max:30',
            'non_risposte' => 'nullable|integer|min:0|max:30',
            'totale' => 'nullable|integer|min:1|max:50',
            'pdf_file' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $pdfPath = $exam->pdf_path;

        if ($request->hasFile('pdf_file') && $request->file('pdf_file')->isValid()) {
            $file = $request->file('pdf_file');
            $uploadDir = public_path('uploads/live_exams');
            if (!File::exists($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true);
            }
            $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower($request->nome));
            $filename = 'scheda_' . $cleanName . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $pdfPath = '/uploads/live_exams/' . $filename;
        }

        $exam->update([
            'nome' => $request->nome,
            'motorizzazione' => $request->motorizzazione ?: $exam->motorizzazione,
            'exam_date' => $request->exam_date ?: $exam->exam_date,
            'status' => $request->status ?: $exam->status,
            'corrette' => $request->filled('corrette') ? (int)$request->corrette : $exam->corrette,
            'errori' => $request->filled('errori') ? (int)$request->errori : $exam->errori,
            'non_risposte' => $request->filled('non_risposte') ? (int)$request->non_risposte : $exam->non_risposte,
            'totale' => $request->filled('totale') ? (int)$request->totale : $exam->totale,
            'pdf_path' => $pdfPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Esame aggiornato con successo',
            'data' => $exam,
        ]);
    }

    /**
     * Delete a passed exam record.
     */
    public function destroy($id)
    {
        $exam = LivePassedExam::findOrFail($id);

        if (!empty($exam->pdf_path) && !str_contains($exam->pdf_path, 'sample_scheda_esame.pdf')) {
            $fullPath = public_path(ltrim($exam->pdf_path, '/'));
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }
        }

        $exam->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Esame eliminato con successo',
        ]);
    }
}
