<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DynamicContentController;
use App\Http\Controllers\ArgomentiController;
use App\Http\Controllers\DizionarioController;
use App\Http\Controllers\CartelloController;

use App\Http\Controllers\Api\ArgomentiApiController;
use App\Http\Controllers\Api\LezioniApiController;
use App\Http\Controllers\Api\TestApiController;
use App\Http\Controllers\Api\CartelliApiController;
use App\Http\Controllers\Api\DizionarioApiController;
use App\Http\Controllers\Api\SchedaEsameApiController;
use App\Http\Controllers\Api\SfidaApiController;
use App\Http\Controllers\Api\SupportApiController;
use App\Http\Controllers\Api\WrongMcqsApiController;
use App\Http\Controllers\Api\CorrectMcqsApiController;
use App\Http\Controllers\Api\SavedMcqsApiController;
use App\Http\Controllers\Api\TranslationApiController;
use App\Http\Controllers\Api\PatenteSocialApiController;
use App\Http\Controllers\Api\ManualeApiController;
use App\Http\Controllers\Api\LeaderboardApiController;
use App\Http\Controllers\Api\EClassApiController;

use App\Models\Question;
use App\Models\CartelloMcq;

/*
|--------------------------------------------------------------------------
| RESTful API Routes for Mobile App (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 1. ARGOMENTI API (Theory Chapters & Pages)
    Route::get('/chapters', [ArgomentiApiController::class, 'getChapters']);
    Route::get('/chapters/{id}/pages', [ArgomentiApiController::class, 'getChapterPages']);
    Route::get('/pages/all', [ArgomentiApiController::class, 'getAllPages']);
    Route::get('/pages/{id}', [ArgomentiApiController::class, 'getPageDetails']);

    // 2. E-CLASS & LEZIONI API (Classes & Video Tutorials)
    Route::get('/lezioni', [LezioniApiController::class, 'index']);
    Route::get('/lezioni/{id}', [LezioniApiController::class, 'show']);
    Route::get('/eclass', [EClassApiController::class, 'index']);

    // 3. TEST API (Practice Test)
    Route::get('/test/questions', [TestApiController::class, 'getQuestions']);
    Route::post('/test/submit', [TestApiController::class, 'submitResult']);

    // 4. CARTELLI API (Traffic Signs)
    Route::get('/cartelli/categories', [CartelliApiController::class, 'getCategories']);
    Route::get('/cartelli/chapters/{categoryId?}', [CartelliApiController::class, 'getChapters']);
    Route::get('/cartelli/pages/{chapterId}', [CartelliApiController::class, 'getPages']);
    Route::get('/cartelli/page-mcqs/{pageId}', [CartelliApiController::class, 'getPageMcqs']);

    // 5. DIZIONARIO API (Italian-Bangla Terms)
    Route::get('/dizionario', [DizionarioApiController::class, 'getTerms']);

    // 6. SCHEDA ESAME API (Official 30 MCQs Simulation)
    Route::get('/scheda-esame/generate', [SchedaEsameApiController::class, 'generateSheet']);
    Route::post('/scheda-esame/submit', [SchedaEsameApiController::class, 'submitExam']);

    // 7. SFIDA API (Speed Challenge)
    Route::get('/sfida/questions', [SfidaApiController::class, 'getQuestions']);

    // 8. SUPPORT API (Live Chat Room)
    Route::get('/support/messages', [SupportApiController::class, 'index']);
    Route::post('/support/messages', [SupportApiController::class, 'store']);

    // 9. WRONG MCQs API
    Route::get('/wrong-mcqs', [WrongMcqsApiController::class, 'index']);

    // 10. CORRECT MCQs API
    Route::get('/correct-mcqs', [CorrectMcqsApiController::class, 'index']);

    // 11. SAVED MCQs & NOTES API
    Route::get('/saved-mcqs', [SavedMcqsApiController::class, 'index']);
    Route::post('/saved-mcqs/toggle', [SavedMcqsApiController::class, 'toggle']);
    Route::get('/notes', [ArgomentiController::class, 'getNotes']);
    Route::post('/notes', [ArgomentiController::class, 'saveNote']);
    Route::delete('/notes/{id}', [ArgomentiController::class, 'deleteNote']);

    // 12. TRANSLATION & VOCABULARY API
    Route::get('/translation', [TranslationApiController::class, 'getQuestionTranslation']);

    // 13. PATENTE SOCIAL API (Home Cards, Banners, Settings)
    Route::get('/patente-social/cards', [PatenteSocialApiController::class, 'getCards']);
    Route::get('/patente-social/banners', [PatenteSocialApiController::class, 'getBanners']);
    Route::get('/patente-social/settings', [PatenteSocialApiController::class, 'getSettings']);
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::post('/qr-unlock', function (Illuminate\Http\Request $request) {
        $code = $request->input('session_id') ?: $request->input('qr_code') ?: $request->input('code') ?: $request->input('qrData');
        if (empty($code)) {
            return response()->json(['status' => 'error', 'message' => 'QR payload parameter missing'], 422);
        }

        $sessionId = $code;
        if (str_contains($code, 'session_id=')) {
            $queryString = parse_url($code, PHP_URL_QUERY);
            if ($queryString) {
                parse_str($queryString, $query);
                if (!empty($query['session_id'])) {
                    $sessionId = $query['session_id'];
                }
            }
        }

        \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $sessionId, true, 86400);

        if ($code === 'web_qr_scan_demo' || $sessionId === 'web_qr_scan_demo' || $code === 'demo') {
            \Illuminate\Support\Facades\Cache::put('qr_unlocked_demo', true, 86400);
            \Illuminate\Support\Facades\Cache::put('qr_unlocked_global', true, 86400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Web session unlocked successfully!',
            'session_id' => $sessionId
        ]);
    });

    // 14. MANUALE API (Manual Theory Chapters & Pages)
    Route::get('/manuale/chapters', [ManualeApiController::class, 'getChapters']);
    Route::get('/manuale/pages/{chapterId}', [ManualeApiController::class, 'getPages']);
    Route::get('/manuale/page/{id}', [ManualeApiController::class, 'getPageContent']);

    // 15. LEADERBOARD API (Rankings)
    Route::get('/leaderboard', [LeaderboardApiController::class, 'index']);

    // 16. CLIENT STATUS & VERIFICATION API
    Route::get('/client/status', [DynamicContentController::class, 'getClientStatus']);
    Route::post('/client/verify', [DynamicContentController::class, 'submitVerification']);

    // Questions By IDs helper
    Route::get('/questions/by-ids', function (Request $request) {
        $idsStr = $request->query('ids', '');
        if (empty($idsStr)) return response()->json(['status' => 'success', 'data' => []]);
        $ids = array_map('intval', explode(',', $idsStr));
        $questions = Question::whereIn('id', $ids)->get();
        return response()->json(['status' => 'success', 'data' => $questions]);
    });

    // Legacy Fallback Endpoints
    Route::get('/quiz/exam', [SchedaEsameApiController::class, 'generateSheet']);
    Route::get('/classes', [DynamicContentController::class, 'getLectureClasses']);
    Route::get('/live-classes', [DynamicContentController::class, 'getLiveClasses']);
    Route::get('/dashboard/cards', [DynamicContentController::class, 'getPublicHomeCards']);
    Route::get('/dashboard/banners', [DynamicContentController::class, 'getPublicSliders']);
    Route::get('/sliders', [DynamicContentController::class, 'getPublicSliders']);
});
