<?php

namespace App\Http\Controllers;

use App\Models\ExamSheet;
use App\Models\Question;
use App\Models\Chapter;
use App\Models\UserMcqResult;
use App\Traits\ResolvesUserSession;
use Illuminate\Http\Request;

class ExamSheetController extends Controller
{
    use ResolvesUserSession;

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
                'total_count' => count($questionsArray),
                'unanswered_count' => count($questionsArray),
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

        // Resolve user/session context for cross-device sync
        $context = $this->resolveUserContext($request);
        $userId = $context['user_id'];
        $userIds = $context['user_ids'];
        $sessionId = $context['session_id'];
        $sessionIds = $context['session_ids'];

        $correct = 0;
        $wrong = 0;
        $unanswered = 0;

        // Grade each question & record to UserMcqResult
        $updatedQuestions = [];
        foreach ($currentQuestions as $q) {
            $qId = $q['id'];
            $userAns = isset($userAnswersInput[$qId]) ? $userAnswersInput[$qId] : null;

            if ($userAns === null) {
                $unanswered++;
            } else {
                $isCorrect = ($userAns === $q['is_vero']);
                if ($isCorrect) {
                    $correct++;
                } else {
                    $wrong++;
                }

                // Log into UserMcqResult for website & mobile app sync
                try {
                    $qRecord = Question::find($qId);
                    $pageId = $qRecord ? $qRecord->page_id : null;
                    $chapterId = $qRecord ? $qRecord->chapter : null;
                    $categoryId = null;
                    if ($chapterId) {
                        $chap = Chapter::find($chapterId);
                        if ($chap) $categoryId = $chap->category_id;
                    }

                    $query = UserMcqResult::where('question_id', $qId);
                    $query->where(function($sq) {
                        $sq->where('question_type', 'argomenti')->orWhereNull('question_type');
                    });

                    $userContextSessionIds = $sessionIds;
                    if (empty($userIds) && empty($userContextSessionIds)) {
                        if ($sessionId) $userContextSessionIds = [$sessionId];
                    }

                    if (!empty($userIds) || !empty($userContextSessionIds)) {
                        $query->where(function($sq) use ($userIds, $userContextSessionIds) {
                            if (!empty($userIds)) {
                                $sq->whereIn('user_id', $userIds);
                            }
                            if (!empty($userContextSessionIds)) {
                                if (!empty($userIds)) {
                                    $sq->orWhereIn('session_id', $userContextSessionIds);
                                } else {
                                    $sq->whereIn('session_id', $userContextSessionIds);
                                }
                            }
                        });
                        $existing = $query->first();
                    } else {
                        $existing = null;
                    }
                    $data = [
                        'session_id' => $sessionId,
                        'user_id' => $userId,
                        'question_id' => $qId,
                        'question_type' => 'argomenti',
                        'user_answer' => $userAns ? 'V' : 'F',
                        'is_correct' => $isCorrect ? 1 : 0,
                        'category_id' => $categoryId,
                        'chapter_id' => $chapterId,
                        'page_id' => $pageId,
                    ];

                    if ($existing) {
                        $recentlyUpdated = $existing->updated_at && $existing->updated_at->diffInSeconds(now()) < 10;
                        if ($recentlyUpdated && (int)$existing->is_correct === ($isCorrect ? 1 : 0) && (string)$existing->user_answer === (string)$userAns) {
                            $data['correct_count'] = $existing->correct_count ?: ($isCorrect ? 1 : 0);
                            $data['wrong_count'] = $existing->wrong_count ?: ($isCorrect ? 0 : 1);
                        } else {
                            if ($isCorrect) {
                                $data['correct_count'] = ($existing->correct_count ?: 0) + 1;
                                $data['wrong_count'] = ($existing->wrong_count ?: 0);
                            } else {
                                $data['correct_count'] = ($existing->correct_count ?: 0);
                                $data['wrong_count'] = ($existing->wrong_count ?: 0) + 1;
                            }
                        }
                        $existing->update($data);
                    } else {
                        $data['correct_count'] = $isCorrect ? 1 : 0;
                        $data['wrong_count'] = $isCorrect ? 0 : 1;
                        UserMcqResult::create($data);
                    }
                } catch (\Throwable $e) {
                    \Log::error("Failed to log UserMcqResult from submitExam: " . $e->getMessage());
                }
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
    // ============= b=============================

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
