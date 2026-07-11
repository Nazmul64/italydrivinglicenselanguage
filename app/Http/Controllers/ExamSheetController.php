<?php

namespace App\Http\Controllers;

use App\Models\ExamSheet;
use App\Models\Question;
use Illuminate\Http\Request;

class ExamSheetController extends Controller
{
    /**
     * Get list of exam sheets.
     */
    public function getExams(Request $request)
    {
        $search = $request->query('search');
        $query = ExamSheet::query();

        if ($search) {
            $query->where('student_name', 'like', "%{$search}%")
                  ->orWhere('motorizzazione', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
        }

        $exams = $query->orderBy('id', 'desc')->get();
        return response()->json($exams);
    }

    /**
     * Get single exam details (Initializes questions if new).
     */
    public function getExamDetails($id)
    {
        $exam = ExamSheet::findOrFail($id);

        // If it's a new exam and questions are not yet populated in the JSON
        if ($exam->status === 'new' && (empty($exam->answers) || count($exam->answers) === 0)) {
            // Fetch 30 random questions
            $questions = Question::inRandomOrder()->limit(30)->get();
            
            $questionsArray = [];
            foreach ($questions as $q) {
                $questionsArray[] = [
                    'id' => $q->id,
                    'italian' => $q->italian,
                    'bangla' => $q->bangla,
                    'is_vero' => ($q->is_vero == 1 || $q->is_vero == '1' || $q->is_vero === true),
                    'user_answer' => null
                ];
            }

            $exam->update([
                'answers' => $questionsArray
            ]);
        }

        return response()->json($exam);
    }

    /**
     * Submit completed exam answers.
     */
    public function submitExam(Request $request, $id)
    {
        $exam = ExamSheet::findOrFail($id);

        if ($exam->status === 'completed') {
            return response()->json(['error' => 'Questo esame è già stato completato.'], 400);
        }

        $request->validate([
            'answers' => 'required|array'
        ]);

        $userAnswersInput = $request->input('answers'); // Expects array of user choices, key as question_id, val as true/false/null
        
        $currentQuestions = $exam->answers;
        if (empty($currentQuestions)) {
            return response()->json(['error' => 'Nessuna domanda trovata per questo esame.'], 400);
        }

        $correct = 0;
        $wrong = 0;
        $unanswered = 0;

        // Grade each question
        $updatedQuestions = [];
        foreach ($currentQuestions as $q) {
            $qId = $q['id'];
            $userAns = isset($userAnswersInput[$qId]) ? $userAnswersInput[$qId] : null;

            if ($userAns === null) {
                $unanswered++;
            } elseif ($userAns === $q['is_vero']) {
                $correct++;
            } else {
                $wrong++;
            }

            $q['user_answer'] = $userAns;
            $updatedQuestions[] = $q;
        }

        $exam->update([
            'status' => 'completed',
            'correct_count' => $correct,
            'wrong_count' => $wrong,
            'unanswered_count' => $unanswered,
            'total_count' => count($updatedQuestions),
            'answers' => $updatedQuestions
        ]);

        return response()->json([
            'success' => true,
            'correct' => $correct,
            'wrong' => $wrong,
            'unanswered' => $unanswered,
            'total' => count($updatedQuestions)
        ]);
    }

    // ==========================================
    // Admin CRUD Operations
    // ==========================================

    /**
     * Store a new scheduled exam.
     */
    public function storeExam(Request $request)
    {
        $request->validate([
            'student_name' => 'required|string|max:255',
            'motorizzazione' => 'required|string|max:255',
            'exam_date' => 'required|string|max:255',
        ]);

        $exam = ExamSheet::create([
            'student_name' => $request->student_name,
            'motorizzazione' => $request->motorizzazione,
            'exam_date' => $request->exam_date,
            'status' => 'new',
            'correct_count' => 0,
            'wrong_count' => 0,
            'unanswered_count' => 30,
            'total_count' => 30,
            'answers' => null
        ]);

        return response()->json($exam);
    }

    /**
     * Delete an exam.
     */
    public function deleteExam($id)
    {
        $exam = ExamSheet::findOrFail($id);
        $exam->delete();
        return response()->json(['success' => true]);
    }
}
