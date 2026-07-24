<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DynamicContentController;
use App\Http\Controllers\ArgomentiController;
use App\Http\Controllers\DizionarioController;
use App\Http\Controllers\CartelloController;
use App\Http\Controllers\Api\LezioniApiController;
use App\Http\Controllers\Api\TestApiController;
use App\Http\Controllers\Api\ArgomentiApiController;
use App\Http\Controllers\Api\EClassApiController;
use App\Http\Controllers\Api\SfidaApiController;
use App\Http\Controllers\Api\SchedaEsameApiController;
use App\Http\Controllers\Api\DizionarioApiController;
use App\Http\Controllers\Api\CartelliApiController;
use App\Http\Controllers\Api\SavedMcqsApiController;
use App\Http\Controllers\Api\CorrectMcqsApiController;
use App\Http\Controllers\Api\WrongMcqsApiController;
use App\Http\Controllers\Api\SupportApiController;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\Category;

/*
|--------------------------------------------------------------------------
| Dedicated Mobile App & Web API Routes (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 1. Dashboard Cards & Sliders & Settings
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::get('/dashboard/cards', [DynamicContentController::class, 'getPublicHomeCards']);
    Route::get('/dashboard/banners', [DynamicContentController::class, 'getPublicSliders']);

    // 2. Lezioni (Video Classes API)
    Route::get('/lezioni', [LezioniApiController::class, 'index']);
    Route::get('/lezioni/{id}', [LezioniApiController::class, 'show']);

    // 3. Test (Practice Test API)
    Route::get('/test/questions', [TestApiController::class, 'getQuestions']);
    Route::post('/test/submit', [TestApiController::class, 'submitResult']);

    // 4. Argomenti (Theory Chapters & Pages API)
    Route::get('/chapters', [ArgomentiApiController::class, 'getChapters']);
    Route::get('/chapters/{id}/pages', [ArgomentiApiController::class, 'getChapterPages']);
    Route::get('/pages/{id}', [ArgomentiApiController::class, 'getPageDetails']);

    // 5. E-Class (Live Classes API)
    Route::get('/eclass', [EClassApiController::class, 'index']);

    // 6. Sfida (Speed Challenge API)
    Route::get('/sfida/questions', [SfidaApiController::class, 'getQuestions']);

    // 7. Scheda Esame (Exam Simulation API)
    Route::get('/scheda-esame/sheets', [SchedaEsameApiController::class, 'index']);

    // 8. Dizionario (Italian-Bangla Terms API)
    Route::get('/dizionario', [DizionarioApiController::class, 'getTerms']);

    // 9. Cartelli (Traffic Signs API)
    Route::get('/cartelli/categories', [CartelliApiController::class, 'getCategories']);
    Route::get('/cartelli/chapters/{categoryId}', [CartelliApiController::class, 'getChapters']);

    // 10. Saved MCQs API
    Route::get('/saved-mcqs', [SavedMcqsApiController::class, 'index']);
    Route::post('/saved-mcqs/toggle', [SavedMcqsApiController::class, 'toggle']);

    // 11. Correct & Wrong MCQs API
    Route::get('/correct-mcqs', [CorrectMcqsApiController::class, 'index']);
    Route::get('/wrong-mcqs', [WrongMcqsApiController::class, 'index']);

    // 12. Support (Tutor Live Chat API)
    Route::get('/support/messages', [SupportApiController::class, 'index']);
    Route::post('/support/messages', [SupportApiController::class, 'store']);

    // 2. Chapters & Pages (Argomenti)
    Route::get('/chapters', [ArgomentiController::class, 'getChapters']);
    Route::get('/chapters/{id}/pages', [ArgomentiController::class, 'getChapterPages']);
    Route::get('/pages/{id}', [ArgomentiController::class, 'getPageDetails']);

    // 3. Quiz & Exam APIs
    Route::get('/quiz/exam', function () {
        $argomentiQuestions = Question::inRandomOrder()->limit(30)->get()->map(function($q) {
            return [
                'id' => $q->id,
                'type' => 'argomenti',
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'is_vero' => $q->is_vero === 1 || $q->is_vero === true || $q->is_vero === '1' || strtolower((string)$q->correct_answer) === 'vero' || $q->correct_answer === '1' || $q->correct_answer === 1,
                'image' => $q->image,
                'audio' => $q->audio,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $cartelliQuestions = CartelloMcq::where('status', true)->inRandomOrder()->limit(30)->get()->map(function($q) {
            return [
                'id' => $q->id,
                'type' => 'cartelli',
                'italian' => $q->question,
                'bangla' => $q->bn_question,
                'is_vero' => strtolower((string)$q->correct_answer) === 'vero' || $q->correct_answer === '1' || $q->correct_answer === 1,
                'image' => $q->image,
                'audio' => $q->voice,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $combined = $argomentiQuestions->concat($cartelliQuestions)->shuffle()->take(30)->values();
        return response()->json([
            'status' => 'success',
            'data' => $combined
        ]);
    });

    Route::get('/quiz/chapter/{chapter}', function ($chapter) {
        $questions = Question::where('chapter', $chapter)->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    });

    // Saved MCQs & Notes
    Route::get('/saved-mcqs', [ArgomentiController::class, 'getSavedMcqs']);
    Route::post('/saved-mcqs/toggle', [ArgomentiController::class, 'toggleSavedMcq']);
    Route::get('/notes', [ArgomentiController::class, 'getNotes']);
    Route::post('/notes', [ArgomentiController::class, 'saveNote']);
    Route::delete('/notes/{id}', [ArgomentiController::class, 'deleteNote']);

    // 4. Cartelli APIs
    Route::get('/cartelli/categories', [CartelloController::class, 'publicGetCategories']);
    Route::get('/cartelli/chapters', [CartelloController::class, 'publicGetAllChapters']);
    Route::get('/cartelli/chapters/{categoryId}', [CartelloController::class, 'publicGetChapters']);
    Route::get('/cartelli/pages/{chapterId}', [CartelloController::class, 'publicGetPages']);
    Route::get('/cartelli/page-mcqs/{pageId}', [CartelloController::class, 'publicGetPageMcqs']);

    // 5. Dizionario (Dictionary) API
    Route::get('/dizionario', [DizionarioController::class, 'getDictionary']);

    // 6. E-Class & Live Classes APIs
    Route::get('/classes', [DynamicContentController::class, 'getLectureClasses']);
    Route::get('/live-classes', [DynamicContentController::class, 'getLiveClasses']);

    // 7. Client Verification & App Status
    Route::get('/client/status', [DynamicContentController::class, 'getClientStatus']);
    Route::post('/client/verify', [DynamicContentController::class, 'submitVerification']);

    // 8. Support Chat API
    Route::get('/chat/messages', function (Request $request) {
        $sessionId = $request->query('session_id') ?: session()->getId();
        $messages = \App\Models\Message::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    });

    Route::post('/chat/messages', function (Request $request) {
        $request->validate([
            'message' => 'required|string',
        ]);
        $sessionId = $request->input('session_id') ?: session()->getId();
        $msg = \App\Models\Message::create([
            'session_id' => $sessionId,
            'sender' => 'user',
            'message' => $request->input('message'),
            'status' => 'unread',
        ]);
        return response()->json([
            'status' => 'success',
            'data' => $msg
        ]);
    });

    // 9. Dashboard Dynamic Cards & Banners
    Route::get('/dashboard/cards', [DynamicContentController::class, 'getPublicHomeCards']);
    Route::get('/dashboard/banners', [DynamicContentController::class, 'getPublicSliders']);
    Route::get('/sliders', [DynamicContentController::class, 'getPublicSliders']);
});
