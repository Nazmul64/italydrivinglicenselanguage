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
use App\Http\Controllers\Api\SupportRegistrationApiController;
use App\Http\Controllers\Api\LicenseApiController;
use App\Http\Controllers\Api\QrVerificationApiController;
use App\Http\Middleware\CheckLicenseActive;

use App\Models\Question;
use App\Models\CartelloMcq;

/*
|--------------------------------------------------------------------------
| RESTful API Routes for Mobile App (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 🔑 1. SUPPORT REGISTRATION & UNPROTECTED INITIAL AUTH
    Route::post('/support/register', [SupportRegistrationApiController::class, 'register']);

    // 💬 PUBLIC / FALLBACK SUPPORT ENDPOINTS
    Route::get('/support/messages', [SupportApiController::class, 'index']);

    // 🌐 PUBLIC/UNLOCKED DATA (Sliders, Settings, Categories, Terms, Chapters view)
    Route::get('/chapters', [ArgomentiApiController::class, 'getChapters']);
    Route::get('/chapters/{id}/pages', [ArgomentiApiController::class, 'getChapterPages']);
    Route::get('/pages/all', [ArgomentiApiController::class, 'getAllPages']);
    Route::get('/pages/{id}', [ArgomentiApiController::class, 'getPageDetails']);

    Route::get('/cartelli/categories', [CartelliApiController::class, 'getCategories']);
    Route::get('/cartelli/chapters/{categoryId?}', [CartelliApiController::class, 'getChapters']);
    Route::get('/cartelli/pages/{chapterId}', [CartelliApiController::class, 'getPages']);
    Route::get('/cartelli/page-mcqs/{pageId}', [CartelliApiController::class, 'getPageMcqs']);
    Route::get('/cartelli/chapter-mcqs/{chapterId}', [CartelliApiController::class, 'getChapterMcqs']);

    Route::get('/dizionario', [DizionarioApiController::class, 'getTerms']);
    Route::get('/patente-social/cards', [PatenteSocialApiController::class, 'getCards']);
    Route::get('/patente-social/banners', [PatenteSocialApiController::class, 'getBanners']);
    Route::get('/patente-social/settings', [PatenteSocialApiController::class, 'getSettings']);
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::get('/server-mode', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::get('/server-config', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::get('/leaderboard', [LeaderboardApiController::class, 'index']);

    // 🔒 2. AUTHENTICATED USER ROUTES (Sanctum)
    
    // 📌 4. SAVED, CORRECT & WRONG MCQS & LOGGING API (Sanctum Token or Phone / Session ID)
    Route::get('/saved-mcqs', [SavedMcqsApiController::class, 'index']);
    Route::get('/v1/saved-mcqs', [SavedMcqsApiController::class, 'index']);
    Route::post('/saved-mcqs/toggle', [SavedMcqsApiController::class, 'toggle']);
    Route::post('/v1/saved-mcqs/toggle', [SavedMcqsApiController::class, 'toggle']);
    Route::get('/correct-mcqs', [CorrectMcqsApiController::class, 'index']);
    Route::get('/v1/correct-mcqs', [CorrectMcqsApiController::class, 'index']);
    Route::get('/wrong-mcqs', [WrongMcqsApiController::class, 'index']);
    Route::get('/v1/wrong-mcqs', [WrongMcqsApiController::class, 'index']);
    Route::post('/user-mcq-results/log', [\App\Http\Controllers\ArgomentiController::class, 'logUserMcqResults']);
    Route::post('/v1/user-mcq-results/log', [\App\Http\Controllers\ArgomentiController::class, 'logUserMcqResults']);
    Route::get('/user-mcq-results', [\App\Http\Controllers\ArgomentiController::class, 'getUserMcqResults']);
    Route::get('/v1/user-mcq-results', [\App\Http\Controllers\ArgomentiController::class, 'getUserMcqResults']);

    Route::middleware('auth:sanctum')->group(function () {
        // User Profile & Status
        Route::get('/user', [SupportRegistrationApiController::class, 'getUser']);

        // License Status & Activation
        Route::get('/license/status', [LicenseApiController::class, 'getStatus']);
        Route::post('/license/activate', [LicenseApiController::class, 'activate']);

        // Support Conversation & Messages
        Route::get('/support/conversation', [SupportApiController::class, 'getConversation']);
        Route::post('/support/messages', [SupportApiController::class, 'store']);

        // Secure QR Verification (Active License Required)
        Route::post('/qr/verify', [QrVerificationApiController::class, 'verify']);

        // 🛡️ 3. PROTECTED LEARNING & EXAM FEATURES (Active License Required Middleware)
        Route::middleware([CheckLicenseActive::class])->group(function () {
            Route::get('/protected-data', function () {
                return response()->json(['success' => true, 'message' => 'Access granted to protected data']);
            });

            Route::get('/lezioni', [LezioniApiController::class, 'index']);
            Route::get('/lezioni/{id}', [LezioniApiController::class, 'show']);
            Route::get('/eclass', [EClassApiController::class, 'index']);

            Route::get('/test/questions', [TestApiController::class, 'getQuestions']);
            Route::post('/test/submit', [TestApiController::class, 'submitResult']);

            Route::get('/scheda-esame/generate', [SchedaEsameApiController::class, 'generateSheet']);
            Route::post('/scheda-esame/submit', [SchedaEsameApiController::class, 'submitExam']);

            Route::get('/sfida/questions', [SfidaApiController::class, 'getQuestions']);

            Route::get('/manuale/chapters', [ManualeApiController::class, 'getChapters']);
            Route::get('/manuale/pages/{chapterId}', [ManualeApiController::class, 'getPages']);
            Route::get('/manuale/page/{id}', [ManualeApiController::class, 'getPageContent']);
        });
    });

    Route::post('/qr-unlock', [QrVerificationApiController::class, 'verify']);
    Route::post('/qr-verification/verify', [QrVerificationApiController::class, 'verify']);
    Route::post('/qr/verify', [QrVerificationApiController::class, 'verify']);

    Route::get('/translation', [TranslationApiController::class, 'getQuestionTranslation']);
    Route::get('/client/status', [DynamicContentController::class, 'getClientStatus']);
    Route::post('/client/verify', [DynamicContentController::class, 'submitVerification']);

    Route::get('/questions/by-ids', function (Request $request) {
        $idsStr = $request->query('ids', '');
        if (empty($idsStr)) return response()->json(['status' => 'success', 'data' => []]);
        $ids = array_map('intval', explode(',', $idsStr));
        $questions = Question::whereIn('id', $ids)->get();
        return response()->json(['status' => 'success', 'data' => $questions]);
    });

    
    // Live Chat & Support Messages for App & Frontend
    Route::get('/chat/messages', function (Request $request) {
        $sessionId = $request->query('session_id') ?: $request->header('X-Session-ID');
        $phone = $request->query('phone') ?: $request->header('X-Client-Phone');
        
        $query = \App\Models\Message::query();
        if ($phone) {
            $user = \App\Models\User::where('phone', $phone)->first();
            $client = \App\Models\AppClient::where('phone', $phone)->first();
            $userUuids = array_filter([$user?->uuid, $client?->session_id, $sessionId]);
            $query->where(function($q) use ($userUuids, $sessionId) {
                if (!empty($userUuids)) {
                    $q->whereIn('session_id', $userUuids)
                      ->orWhereIn('sender_id', $userUuids);
                }
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId)->orWhere('sender_id', $sessionId);
        }
        
        $messages = $query->orderBy('created_at', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    });

    Route::post('/chat/messages', function (Request $request) {
        $sessionId = $request->input('session_id') ?: $request->header('X-Session-ID') ?: session()->getId();
        $phone = $request->input('phone') ?: $request->header('X-Client-Phone');
        $firstName = $request->input('first_name');
        $lastName = $request->input('last_name');
        $messageText = $request->input('message') ?: '';
        $attachmentPath = $request->input('attachment_path') ?: $request->input('attachment');

        $user = $phone ? \App\Models\User::where('phone', $phone)->first() : null;
        $client = $phone ? \App\Models\AppClient::where('phone', $phone)->first() : null;

        $senderName = trim(($firstName . ' ' . $lastName)) ?: ($user ? $user->name : ($client ? $client->first_name : 'Customer'));
        $senderId = $user ? $user->uuid : ($client ? $client->session_id : $sessionId);

        $convo = null;
        if ($user) {
            $convo = \App\Models\Conversation::firstOrCreate(['user_id' => $user->uuid]);
        }

        $msg = \App\Models\Message::create([
            'conversation_id' => $convo ? $convo->id : null,
            'session_id'      => $sessionId,
            'sender'          => 'user',
            'sender_type'     => 'user',
            'sender_id'       => $senderId,
            'sender_name'     => $senderName,
            'message'         => $messageText,
            'attachment_path' => $attachmentPath,
        ]);

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => $msg
        ]);
    });

    Route::post('/client/activate', function (Request $request) {
        $sessionId = $request->input('session_id') ?: $request->header('X-Session-ID');
        $phone = $request->input('phone') ?: $request->header('X-Client-Phone');
        $days = (int) ($request->input('days') ?: 365);

        $client = null;
        if ($phone) {
            $client = \App\Models\AppClient::where('phone', $phone)->first();
        }
        if (!$client && $sessionId) {
            $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
        }

        if ($client) {
            $client->is_active = true;
            $client->expires_at = now()->addDays($days);
            $client->save();
        }

        if ($phone) {
            $user = \App\Models\User::where('phone', $phone)->first();
            if ($user) {
                \App\Models\License::updateOrCreate(
                    ['user_id' => $user->uuid],
                    [
                        'license_key'  => (string) rand(100000, 999999),
                        'status'       => 'active',
                        'activated_at' => now(),
                        'expires_at'   => now()->addDays($days),
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'success' => true,
            'message' => 'License activated successfully for ' . $days . ' days.',
            'expires_at' => now()->addDays($days)->toIso8601String()
        ]);
    });

    Route::get('/quiz/exam', [SchedaEsameApiController::class, 'generateSheet']);
    Route::get('/classes', [DynamicContentController::class, 'getLectureClasses']);
    Route::get('/live-classes', [DynamicContentController::class, 'getLiveClasses']);
    Route::get('/dashboard/cards', [DynamicContentController::class, 'getPublicHomeCards']);
    Route::get('/dashboard/banners', [DynamicContentController::class, 'getPublicSliders']);
    Route::get('/sliders', [DynamicContentController::class, 'getPublicSliders']);
});

Route::post('/support/register', [SupportRegistrationApiController::class, 'register']);
Route::post('/client/verify', [DynamicContentController::class, 'submitVerification']);
Route::get('/client/status', [DynamicContentController::class, 'getClientStatus']);
Route::get('/support/messages', [SupportApiController::class, 'index']);
