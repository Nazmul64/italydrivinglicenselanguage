<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/qr-unlock', function (Request $request) {
    $sessionId = $request->query('session_id') ?: session()->getId();
    session(['qr_unlocked' => true]);
    \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $sessionId, true, 86400);
    return redirect('/');
});

Route::get('/qr-check-session', function (Request $request) {
    $sessionId = $request->query('session_id') ?: session()->getId();
    $unlocked = session('qr_unlocked', false) 
        || \Illuminate\Support\Facades\Cache::get('qr_unlocked_' . $sessionId, false)
        || \Illuminate\Support\Facades\Cache::get('qr_unlocked_demo', false)
        || \Illuminate\Support\Facades\Cache::get('qr_unlocked_global', false);

    if ($unlocked) {
        session(['qr_unlocked' => true]);
        \Illuminate\Support\Facades\Cache::forget('qr_unlocked_global');
        \Illuminate\Support\Facades\Cache::forget('qr_unlocked_demo');
    }
    return response()->json(['unlocked' => (bool)$unlocked]);
});

$qrUnlockHandler = function (Request $request) {
    // Accept: token (new), session_id (legacy), qr_code, code, qrData
    // Also accept customer identity fields: phone, firstName, lastName
    $token     = $request->input('token');
    $code      = $request->input('session_id')
               ?: $request->input('qr_code')
               ?: $request->input('code')
               ?: $request->input('qrData');

    // If URL with ?token= or ?session_id= was scanned directly
    if (empty($token) && !empty($code) && str_contains($code, 'token=')) {
        parse_str(parse_url($code, PHP_URL_QUERY) ?? '', $q);
        $token = $q['token'] ?? null;
    }
    if (empty($code) && !empty($token)) {
        $code = $token;
    }
    if (empty($code) && empty($token)) {
        // Still allow unlock via phone / name (customer already activated)
        $phone = $request->input('phone') ?: $request->input('phoneNumber');
        if (!empty($phone)) {
            $code = 'customer_' . preg_replace('/\D/', '', $phone);
        }
    }

    if (empty($code) && empty($token)) {
        return response()->json(['status' => 'error', 'message' => 'QR payload missing'], 422);
    }

    // ---- GLOBAL UNLOCK: unlocks every browser window showing QR gate ----
    \Illuminate\Support\Facades\Cache::put('qr_unlocked_global', true, 300); // 5 minutes

    // Also unlock by token and code for precise matching
    if (!empty($token)) {
        \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $token, true, 300);
    }
    if (!empty($code)) {
        $sessionId = $code;
        if (str_contains($code, 'session_id=')) {
            parse_str(parse_url($code, PHP_URL_QUERY) ?? '', $q);
            $sessionId = $q['session_id'] ?? $code;
        }
        \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $sessionId, true, 300);
    }

    return response()->json([
        'status'  => 'success',
        'message' => 'Website unlocked successfully!',
    ]);
};


Route::post('/api/qr-unlock', $qrUnlockHandler);
Route::post('/api/v1/qr-unlock', $qrUnlockHandler);
Route::post('/qr-unlock', $qrUnlockHandler);

Route::get('/', function () {
    $sliders = \App\Models\Slider::where('status', 1)->orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();
    $homeCards = \App\Models\HomeCard::orderBy('order_index', 'asc')->get();
    $lectureClasses = \App\Models\LectureClass::orderBy('id', 'asc')->get();
    $liveClasses = \App\Models\LiveClass::orderBy('scheduled_at', 'asc')->get();
    $popupPromo = \App\Models\PopupPromo::where('is_active', true)->first();
    $setting = \App\Models\Setting::first();
    return view('frontend.home', compact('sliders', 'homeCards', 'lectureClasses', 'liveClasses', 'popupPromo', 'setting'));
});

Route::get('/{screen}', function ($screen) {
    $sliders = \App\Models\Slider::where('status', 1)->orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();
    $homeCards = \App\Models\HomeCard::orderBy('order_index', 'asc')->get();
    $lectureClasses = \App\Models\LectureClass::orderBy('id', 'asc')->get();
    $liveClasses = \App\Models\LiveClass::orderBy('scheduled_at', 'asc')->get();
    $popupPromo = \App\Models\PopupPromo::where('is_active', true)->first();
    $setting = \App\Models\Setting::first();
    return view('frontend.home', compact('sliders', 'homeCards', 'lectureClasses', 'liveClasses', 'popupPromo', 'setting'));
})->where('screen', 'home|lezioni|test|argomenti|argomenti-schede|page-details|eclass|sfida|scheda-esame|exam-simulation|dizionario|cartelli|cartelli-schede|cartelli-page|saved-mcqs|correct-mcqs|wrong-mcqs|social|profilo|manuale|translation|test-results-detail');

Route::get('/app', function () {
    $sliders = \App\Models\Slider::where('status', 1)->orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();
    $homeCards = \App\Models\HomeCard::orderBy('order_index', 'asc')->get();
    $lectureClasses = \App\Models\LectureClass::orderBy('id', 'asc')->get();
    $liveClasses = \App\Models\LiveClass::orderBy('scheduled_at', 'asc')->get();
    $popupPromo = \App\Models\PopupPromo::where('is_active', true)->first();
    $setting = \App\Models\Setting::first();
    return view('frontend.mobile_app', compact('sliders', 'homeCards', 'lectureClasses', 'liveClasses', 'popupPromo', 'setting'));
});

Route::get('/api/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);

// =========================================================================
// Enterprise SEO, Sitemap, Robots.txt & Merchant XML Feed Routes
// =========================================================================
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);
Route::get('/sitemaps/pages.xml', [\App\Http\Controllers\SitemapController::class, 'pages']);
Route::get('/sitemaps/categories.xml', [\App\Http\Controllers\SitemapController::class, 'categories']);
Route::get('/sitemaps/products.xml', [\App\Http\Controllers\SitemapController::class, 'products']);
Route::get('/sitemap', [\App\Http\Controllers\SitemapController::class, 'htmlSitemap']);

Route::get('/robots.txt', [\App\Http\Controllers\RobotsController::class, 'index']);

Route::get('/feeds/google-merchant.xml', [\App\Http\Controllers\FeedController::class, 'googleMerchant']);
Route::get('/feeds/facebook-catalog.xml', [\App\Http\Controllers\FeedController::class, 'facebookCatalog']);

// Admin SEO Dashboard API Endpoints
Route::get('/api/admin/seo/audit', [\App\Http\Controllers\Admin\AdminSeoController::class, 'audit']);
Route::get('/api/admin/seo/redirects', [\App\Http\Controllers\Admin\AdminSeoController::class, 'getRedirects']);
Route::post('/api/admin/seo/redirects', [\App\Http\Controllers\Admin\AdminSeoController::class, 'saveRedirect']);
Route::delete('/api/admin/seo/redirects/{id}', [\App\Http\Controllers\Admin\AdminSeoController::class, 'deleteRedirect']);
Route::post('/api/admin/seo/robots', [\App\Http\Controllers\Admin\AdminSeoController::class, 'saveRobotsTxt']);
Route::get('/api/admin/seo/metas', [\App\Http\Controllers\Admin\AdminSeoController::class, 'getSeoMetas']);
Route::post('/api/admin/seo/metas', [\App\Http\Controllers\Admin\AdminSeoController::class, 'saveSeoMeta']);

Route::middleware(\App\Http\Middleware\EnsureLicenseIsActive::class)->group(function () {
    // Front-end MCQ API Endpoints
    Route::get('/api/questions/exam', function () {
        $argomentiQuestions = \App\Models\Question::inRandomOrder()->limit(30)->get()->map(function($q) {
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

        $cartelliQuestions = \App\Models\CartelloMcq::where('status', true)->inRandomOrder()->limit(30)->get()->map(function($q) {
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
        return response()->json($combined);
    });

    Route::get('/documentation.php', function() {
        return response()->file(public_path('documentation.php'));
    });
    Route::get('/documentation', function() {
        return response()->file(public_path('documentation.php'));
    });

    Route::get('/api/dashboard/cards', [\App\Http\Controllers\DynamicContentController::class, 'getPublicHomeCards']);
    Route::get('/api/dashboard/banners', [\App\Http\Controllers\DynamicContentController::class, 'getPublicSliders']);
    Route::get('/api/sliders', [\App\Http\Controllers\DynamicContentController::class, 'getPublicSliders']);

    Route::get('/api/leaderboard', function () {
        $rankings = \Illuminate\Support\Facades\DB::table('user_mcq_results')
            ->join('users', 'users.id', '=', 'user_mcq_results.user_id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.avatar_url',
                \Illuminate\Support\Facades\DB::raw('COUNT(user_mcq_results.id) as total_attempted'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 1 THEN 1 ELSE 0 END) as correct_count'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 0 THEN 1 ELSE 0 END) as wrong_count')
            )
            ->groupBy('users.id', 'users.name', 'users.email', 'users.avatar_url')
            ->orderByDesc('correct_count')
            ->orderByDesc('total_attempted')
            ->limit(20)
            ->get();

        $formatted = [];
        $rank = 1;

        foreach ($rankings as $row) {
            $formatted[] = [
                'rank' => $rank++,
                'name' => $row->name,
                'total_attempted' => (int)$row->total_attempted,
                'correct_count' => (int)$row->correct_count,
                'wrong_count' => (int)$row->wrong_count,
                'points' => (int)$row->correct_count * 10,
                'avatar' => $row->avatar_url ?? ('https://ui-avatars.com/api/?name=' . urlencode($row->name) . '&background=6366F1&color=fff')
            ];
        }

        // If no user_mcq_results yet, fallback to registered Users with 0/real DB counts
        if (count($formatted) === 0) {
            $allUsers = \App\Models\User::orderBy('id', 'asc')->limit(10)->get();
            foreach ($allUsers as $u) {
                $attempted = \App\Models\UserMcqResult::where('user_id', $u->id)->count();
                $correct = \App\Models\UserMcqResult::where('user_id', $u->id)->where('is_correct', 1)->count();
                $wrong = \App\Models\UserMcqResult::where('user_id', $u->id)->where('is_correct', 0)->count();

                $formatted[] = [
                    'rank' => $rank++,
                    'name' => $u->name,
                    'total_attempted' => $attempted,
                    'correct_count' => $correct,
                    'wrong_count' => $wrong,
                    'points' => $correct * 10,
                    'avatar' => $u->avatar_url ?? ('https://ui-avatars.com/api/?name=' . urlencode($u->name) . '&background=6366F1&color=fff')
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    });

    Route::get('/api/user/profile', function (Request $request) {
        $user = auth()->user();
        $userId = $user ? $user->id : null;
        $sessionId = session()->getId();

        $query = \App\Models\UserMcqResult::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where(function($q) use ($sessionId) {
                $q->where('session_id', $sessionId);
            });
        }

        $totalAttempted = $query->count();
        $totalCorrect = (clone $query)->where('is_correct', 1)->count();
        $totalWrong = (clone $query)->where('is_correct', 0)->count();

        $completedExams = $totalAttempted > 0 ? (int)ceil($totalAttempted / 30) : 0;
        $avgErrors = $completedExams > 0 ? round($totalWrong / $completedExams, 1) : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $user ? $user->name : session('user_name', 'ব্যবহারকারী'),
                'email' => $user ? $user->email : '',
                'avatar' => $user ? ($user->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&background=6366F1&color=fff') : session('user_avatar', 'https://ui-avatars.com/api/?name=User&background=6366F1&color=fff'),
                'completed_exams' => $completedExams,
                'avg_errors' => $avgErrors,
                'total_correct' => $totalCorrect,
                'total_wrong' => $totalWrong
            ]
        ]);
    });

    Route::post('/api/user/profile/update', function (Request $request) {
        $name = trim($request->input('name'));
        $avatar = $request->input('avatar');

        if (empty($name)) {
            return response()->json(['status' => 'error', 'message' => 'নাম প্রদান করুন।'], 422);
        }

        $currentUser = auth()->user();
        $currentUserId = $currentUser ? $currentUser->id : null;

        $nameExists = \App\Models\User::whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->when($currentUserId, function($q) use ($currentUserId) {
                return $q->where('id', '!=', $currentUserId);
            })
            ->exists();

        if ($nameExists) {
            return response()->json([
                'status' => 'error',
                'message' => 'এই নামটি ইতিমধ্যে অন্য একজন ব্যবহারকারী ব্যবহার করছেন! অনুগ্রহ করে অন্য একটি ইউনিক নাম বেছে নিন।'
            ], 422);
        }

        if ($currentUser) {
            $currentUser->name = $name;
            if ($avatar) {
                if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'avatar')) {
                    $currentUser->avatar = $avatar;
                }
                if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'avatar_url')) {
                    $currentUser->avatar_url = $avatar;
                }
            }
            $currentUser->save();
        }

        // Update AppClient for customer
        $phone = session('app_client_phone') ?: request()->cookie('app_client_phone');
        $sessionId = request()->input('session_id') ?: session()->getId();

        $client = null;
        if ($phone) {
            $client = \App\Models\AppClient::where('phone', $phone)->first();
        }
        if (!$client && $sessionId) {
            $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
        }

        if ($client) {
            $nameParts = explode(' ', $name, 2);
            $client->first_name = $nameParts[0];
            $client->last_name = isset($nameParts[1]) ? $nameParts[1] : '';
            if ($avatar) {
                $client->avatar = $avatar;
            }
            $client->save();
        }

        session(['user_name' => $name]);
        if ($avatar) {
            session(['user_avatar' => $avatar]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
            'data' => [
                'name' => $name,
                'avatar' => $avatar ?? ($client->avatar ?? ($currentUser->avatar ?? null))
            ]
        ]);
    });



    Route::get('/api/questions/by-ids', function (Request $request) {
        $ids = $request->query('ids');
        if (!$ids) {
            return response()->json([]);
        }
        $idList = array_filter(array_map('intval', explode(',', $ids)));
        
        $argomenti = \App\Models\Question::whereIn('id', $idList)->get()->map(function($q) {
            return [
                'id' => $q->id,
                'type' => 'argomenti',
                'chapter' => $q->chapter,
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'is_vero' => $q->is_vero === 1 || $q->is_vero === true || $q->is_vero === '1' || strtolower((string)$q->correct_answer) === 'vero',
                'image' => $q->image,
                'audio' => $q->audio,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        $cartelli = \App\Models\CartelloMcq::whereIn('id', $idList)->get()->map(function($q) {
            return [
                'id' => $q->id,
                'type' => 'cartelli',
                'chapter' => $q->chapter_id,
                'italian' => $q->question,
                'bangla' => $q->bn_question,
                'is_vero' => strtolower((string)$q->correct_answer) === 'vero' || $q->correct_answer === '1' || $q->correct_answer === 1,
                'image' => $q->image,
                'audio' => $q->voice,
                'vocabulary' => $q->vocabulary ?? []
            ];
        });

        return response()->json($argomenti->concat($cartelli));
    });

    Route::get('/api/questions/chapter/{chapter}', function ($chapter) {
        $questions = \App\Models\Question::where('chapter', $chapter)->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json($questions);
    });

    Route::get('/api/questions/custom-quiz', function (Request $request) {
        $chapters = $request->query('chapters');
        if (!$chapters) {
            return response()->json([]);
        }
        $chapterList = explode(',', $chapters);
        $questions = \App\Models\Question::whereIn('chapter', $chapterList)
            ->inRandomOrder()
            ->limit(30)
            ->get();
        return response()->json($questions);
    });

    Route::get('/api/questions/random-test', function () {
        $argomentiQuestions = \App\Models\Question::inRandomOrder()->limit(30)->get()->map(function($q) {
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

        $cartelliQuestions = \App\Models\CartelloMcq::where('status', true)->inRandomOrder()->limit(30)->get()->map(function($q) {
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
        return response()->json($combined);
    });

    // Public Classes API
    Route::get('/api/classes', [\App\Http\Controllers\DynamicContentController::class, 'getLectureClasses']);
    Route::get('/api/live-classes', [\App\Http\Controllers\DynamicContentController::class, 'getLiveClasses']);
    // Argomenti Public API Endpoints
    Route::get('/api/chapters', [\App\Http\Controllers\ArgomentiController::class, 'getChapters']);
    Route::get('/api/chapters/{id}/pages', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPages']);
    Route::get('/api/all-pages', [\App\Http\Controllers\ArgomentiController::class, 'getAllPages']);
    Route::get('/api/pages/{id}', [\App\Http\Controllers\ArgomentiController::class, 'getPageDetails']);
    Route::get('/api/saved-mcqs', [\App\Http\Controllers\ArgomentiController::class, 'getSavedMcqs']);
    Route::post('/api/saved-mcqs/toggle', [\App\Http\Controllers\ArgomentiController::class, 'toggleSavedMcq']);
    Route::get('/api/notes', [\App\Http\Controllers\ArgomentiController::class, 'getNotes']);
    Route::post('/api/notes', [\App\Http\Controllers\ArgomentiController::class, 'saveNote']);
    Route::delete('/api/notes/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deleteNote']);
    Route::post('/api/user-mcq-results/log', [\App\Http\Controllers\ArgomentiController::class, 'logUserMcqResults']);
    Route::get('/api/user-mcq-results', [\App\Http\Controllers\ArgomentiController::class, 'getUserMcqResults']);

    // Exam Module Public Routes
    Route::get('/api/exams', [\App\Http\Controllers\ExamSheetController::class, 'getExams']);
    Route::get('/api/exams/{id}', [\App\Http\Controllers\ExamSheetController::class, 'getExamDetails']);
    Route::post('/api/exams/{id}/submit', [\App\Http\Controllers\ExamSheetController::class, 'submitExam']);

    // Cartelli Module Public API Routes
    Route::get('/api/cartelli/categories', [\App\Http\Controllers\CartelloController::class, 'publicGetCategories']);
    Route::get('/api/cartelli/chapters', [\App\Http\Controllers\CartelloController::class, 'publicGetAllChapters']);
    Route::get('/api/cartelli/chapters/{categoryId}', [\App\Http\Controllers\CartelloController::class, 'publicGetChapters']);
    Route::get('/api/cartelli/pages/{chapterId}', [\App\Http\Controllers\CartelloController::class, 'publicGetPages']);
    Route::get('/api/cartelli/page-mcqs/{pageId}', [\App\Http\Controllers\CartelloController::class, 'publicGetPageMcqs']);
});


// Public Sliders & Promo API (accessible without license activation)
Route::get('/api/sliders', [\App\Http\Controllers\DynamicContentController::class, 'getSliders']);
Route::get('/api/popup-promo', [\App\Http\Controllers\DynamicContentController::class, 'getActivePopupPromo']);

// Client Status & Verification Routes
Route::get('/api/client/status', [\App\Http\Controllers\DynamicContentController::class, 'getClientStatus']);
Route::post('/api/client/verify', [\App\Http\Controllers\DynamicContentController::class, 'submitVerification']);
Route::post('/api/client/activate', function (\Illuminate\Http\Request $request) {
    $sessionId = $request->input('session_id') ?: session()->getId();
    $days = intval($request->input('days', 365));
    
    $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
    if (!$client) {
        $client = new \App\Models\AppClient();
        $client->session_id = $sessionId;
        $client->first_name = 'Guest';
        $client->last_name = 'User';
        $client->phone = 'N/A';
        $client->stars = 4;
        $client->progress = 55;
    }
    // Check if the client already has the welcome message in their chat history
    $hasWelcome = \App\Models\Message::where('session_id', $sessionId)
        ->where('message', 'like', '%🎉 ধন্যবাদ!%')
        ->exists();

    $client->is_active = true;
    $client->expires_at = now()->addDays($days);
    $client->save();

    if (!$hasWelcome) {
        $welcomeText = "🎉 ধন্যবাদ! আমাদের Package Activate করার জন্য আপনাকে আন্তরিক শুভেচ্ছা।\n"
                     . "এখন থেকে আপনি সকল Premium Feature ব্যবহার করতে পারবেন।\n"
                     . "নিয়মিত পড়াশোনা করুন, মনোযোগ দিয়ে পরীক্ষা দিন।\n"
                     . "আশা করি আপনার সফলতার যাত্রায় আমাদের এই Platform গুরুত্বপূর্ণ ভূমিকা রাখবে।\n"
                     . "আপনার জন্য রইল অনেক শুভকামনা।";
        
        \App\Models\Message::create([
            'session_id' => $sessionId,
            'sender' => 'admin',
            'sender_name' => 'Admin',
            'message' => $welcomeText
        ]);
    }

    return response()->json(['success' => true]);
});

// Guest Chat API Endpoints
Route::get('/api/chat/messages', function (Request $request) {
    $sessionId = $request->query('session_id') ?: $request->input('session_id') ?: session()->getId();
    $messages = \App\Models\Message::where('session_id', $sessionId)
        ->orderBy('created_at', 'asc')
        ->get();
    return response()->json($messages);
});

Route::post('/api/chat/messages', function (Request $request) {
    $request->validate([
        'message' => 'nullable|string',
        'file' => 'nullable|image|max:10240',
    ]);
    
    $sessionId = $request->input('session_id') ?: session()->getId();
    
    $attachmentPath = null;
    if ($request->hasFile('file')) {
        $attachmentPath = \App\Helpers\ImageHelper::uploadAndOptimize(
            $request->file('file'),
            'uploads/attachments',
            'attach'
        );
    }
    
    if (empty($request->message) && !$attachmentPath) {
        return response()->json(['error' => 'Message or attachment required'], 422);
    }
    
    $message = \App\Models\Message::create([
        'session_id' => $sessionId,
        'sender' => 'user',
        'sender_name' => 'Guest User',
        'message' => $request->message ?? '',
        'attachment_path' => $attachmentPath
    ]);
    
    return response()->json($message);
});

// Admin Authentication System Routes
Route::get('/admin/login', function () {
    if (session('admin_logged_in')) {
        return redirect('/admin');
    }
    return view('admin.login');
});

Route::post('/admin/login', function (Request $request) {
    $credentials = $request->only('email', 'password');
    
    // Try database authentication first
    if (\Illuminate\Support\Facades\Auth::attempt($credentials)) {
        session(['admin_logged_in' => true]);
        return redirect('/admin');
    }
    
    // Fallback direct check
    if ($credentials['email'] === 'admin@gmail.com' && $credentials['password'] === 'admin@gmail.com') {
        session(['admin_logged_in' => true]);
        return redirect('/admin');
    }
    
    return back()->with('error', 'আপনার দেওয়া ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়!');
});

Route::post('/admin/logout', function () {
    session()->forget('admin_logged_in');
    return redirect('/admin/login');
});

Route::middleware([\App\Http\Middleware\AdminAuth::class])->group(function () {
    
    Route::get('/admin', function () {
        return view('admin.dashboard');
    });

    // Server Mode Configuration - Dedicated Page
    Route::get('/admin/server-mode', function () {
        return view('admin.server_mode');
    });

    // Admin Settings API Endpoints
    Route::get('/admin/api/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::post('/admin/api/settings/update', [\App\Http\Controllers\SettingsController::class, 'updateSettings']);

    // Admin Profile & Password Update API Endpoints
    Route::get('/admin/api/profile', function () {
        $user = \Illuminate\Support\Facades\Auth::user() ?: \App\Models\User::first();
        return response()->json([
            'name' => $user ? $user->name : 'Admin',
            'email' => $user ? $user->email : 'admin@gmail.com',
            'avatar' => ($user && $user->avatar) ? asset($user->avatar) : null
        ]);
    });

    Route::post('/admin/api/profile/update', function (Request $request) {
        $user = \Illuminate\Support\Facades\Auth::user() ?: \App\Models\User::first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'admin_avatar_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/admin'), $filename);
            $user->avatar = '/uploads/admin/' . $filename;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'প্রোফাইল ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? asset($user->avatar) : null
            ]
        ]);
    });

    Route::get('/admin/api/stats', function () {
        return response()->json([
            'total_chapters'      => \App\Models\Chapter::count(),
            'total_pages'         => \App\Models\Page::count(),
            'total_questions'     => \App\Models\Question::count(),
            'total_videos'        => \App\Models\LectureClass::count(),
            'total_live_sessions' => \App\Models\LiveClass::count(),
            'total_sliders'       => \App\Models\Slider::count(),
            'total_users'         => \App\Models\User::count(),
        ]);
    });

    Route::get('/admin/api/chapters', function () {
        $chapters = \App\Models\Chapter::orderBy('chapter_number', 'asc')->orderBy('id', 'asc')->get();
        foreach ($chapters as $ch) {
            $ch->question_count = \App\Models\Question::where('chapter', $ch->id)->count();
            $ch->chapter = $ch->id;
            $ch->chapter_name = $ch->name;
        }
        return response()->json($chapters);
    });

    Route::get('/admin/api/questions', function (Request $request) {
        $query = \App\Models\Question::with('page');
        
        if ($request->has('chapter') && $request->chapter !== '') {
            $query->where('chapter', $request->chapter);
        }

        if ($request->has('page_id') && $request->page_id !== '') {
            $query->where('page_id', $request->page_id);
        }
        
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('italian', 'like', "%{$search}%")
                  ->orWhere('bangla', 'like', "%{$search}%")
                  ->orWhere('chapter_name', 'like', "%{$search}%");
            });
        }
        
        $questions = $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate(15);
        return response()->json($questions);
    });

    Route::post('/admin/api/questions/store', function (Request $request) {
        $request->validate([
            'chapter' => 'required|integer',
            'chapter_name' => 'required|string',
            'italian' => 'required|string',
            'bangla' => 'required|string',
            'is_vero' => 'required|boolean',
        ]);
        
        $question = \App\Models\Question::create([
            'chapter' => $request->chapter,
            'chapter_name' => $request->chapter_name,
            'italian' => $request->italian,
            'bangla' => $request->bangla,
            'is_vero' => $request->is_vero ? 1 : 0,
        ]);
        
        return response()->json($question);
    });

    Route::post('/admin/api/questions/update/{id}', function (Request $request, $id) {
        $request->validate([
            'chapter' => 'required|integer',
            'chapter_name' => 'required|string',
            'italian' => 'required|string',
            'bangla' => 'required|string',
            'is_vero' => 'required|boolean',
        ]);
        
        $question = \App\Models\Question::findOrFail($id);
        $question->update([
            'chapter' => $request->chapter,
            'chapter_name' => $request->chapter_name,
            'italian' => $request->italian,
            'bangla' => $request->bangla,
            'is_vero' => $request->is_vero ? 1 : 0,
        ]);
        
        return response()->json($question);
    });

    Route::post('/admin/api/questions/delete/{id}', function ($id) {
        $question = \App\Models\Question::findOrFail($id);
        $question->delete();
        
        return response()->json(['success' => true]);
    });

    // Admin Chat Room API Endpoints
    Route::get('/admin/api/chat/conversations', function () {
        $conversations = \App\Models\Message::select('session_id')
            ->selectRaw('MAX(created_at) as last_activity')
            ->groupBy('session_id')
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($convo) {
                $latest = \App\Models\Message::where('session_id', $convo->session_id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $client = \App\Models\AppClient::where('session_id', $convo->session_id)->first();
                return [
                    'session_id' => $convo->session_id,
                    'last_message' => $latest->message ?? '',
                    'sender' => $latest->sender ?? '',
                    'updated_at' => $convo->last_activity,
                    'client' => $client ? [
                        'id' => $client->id,
                        'first_name' => $client->first_name,
                        'last_name' => $client->last_name,
                        'phone' => $client->phone,
                        'is_active' => $client->is_active,
                        'stars' => $client->stars,
                        'progress' => $client->progress
                    ] : null
                ];
            });
            
        return response()->json($conversations);
    });

    Route::get('/admin/api/chat/unread-count', function () {
        $conversations = \App\Models\Message::select('session_id')
            ->selectRaw('MAX(id) as max_id')
            ->groupBy('session_id')
            ->get();

        $unreadCount = 0;
        foreach ($conversations as $c) {
            $latest = \App\Models\Message::find($c->max_id);
            if ($latest && $latest->sender !== 'admin') {
                $unreadCount++;
            }
        }
        return response()->json(['unread_count' => $unreadCount]);
    });

    Route::get('/admin/api/chat/messages/{session_id}', function ($session_id) {
        $messages = \App\Models\Message::where('session_id', $session_id)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($messages);
    });

    Route::post('/admin/api/chat/messages', function (Request $request) {
        $request->validate([
            'session_id' => 'required|string',
            'message' => 'required|string'
        ]);
        
        $message = \App\Models\Message::create([
            'session_id' => $request->session_id,
            'sender' => 'admin',
            'sender_name' => 'Admin',
            'message' => $request->message
        ]);
        
        return response()->json($message);
    });

    Route::post('/admin/api/chat/macro', function (Request $request) {
        $request->validate([
            'session_id' => 'required|string',
            'macro' => 'required|string'
        ]);
        
        $sessionId = $request->session_id;
        $macro = $request->macro;
        
        $days = null;
        if ($macro === 'send_31') $days = 31;
        elseif ($macro === 'send_92') $days = 92;
        elseif ($macro === 'send_184') $days = 184;
        elseif ($macro === 'send_365') $days = 365;
        elseif ($macro === 'invia_licenza') $days = 365;
        elseif ($macro === 'invia_licenza_trail') $days = 3;
        
        // Auto-activate client if a license macro is selected
        if ($days !== null) {
            $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
            if (!$client) {
                $client = new \App\Models\AppClient();
                $client->session_id = $sessionId;
                $client->first_name = 'Guest';
                $client->last_name = 'User';
                $client->phone = 'N/A';
                $client->stars = 4;
                $client->progress = 50;
            }
            $client->save();
            
            // 1. Create License Card Message
            $keyNum = rand(10000, 99999);
            \App\Models\Message::create([
                'session_id' => $sessionId,
                'sender' => 'admin',
                'sender_name' => 'Admin',
                'message' => "[LICENSE_CARD:days={$days},key={$keyNum}]"
            ]);
            
            // 2. Create Text Instruction Message
            $setting = \App\Models\Setting::first();
            $messageText = ($setting && !empty($setting->license_message))
                ? $setting->license_message
                : "apnake license key daoa hoise,click kore active korun.thanks call 3663584525 for info\n\nPial - TMM PATENTE TEAM";
            $message = \App\Models\Message::create([
                'session_id' => $sessionId,
                'sender' => 'admin',
                'sender_name' => 'Admin',
                'message' => $messageText
            ]);
            
            return response()->json($message);
        }
        
        $messageText = '';
        switch ($macro) {
            case 'ottieni_licenze':
                $messageText = "Puoi ottenere o acquistare nuove licenze contattando il nostro supporto su WhatsApp o visitando il nostro store.";
                break;
            case 'valuta_nostra_app':
                $messageText = "Se ti piace la nostra applicazione, ti invitiamo a lasciarci una valutazione a 5 stelle! Ci aiuta molto a crescere.";
                break;
            case 'whatsapp':
                $messageText = "Contattaci direttamente su WhatsApp al numero +39 366 358 4525 per qualsiasi richiesta di supporto.";
                break;
            case 'audio':
                $messageText = "Le spiegazioni audio per ogni quiz sono disponibili cliccando sull'icona dell'altoparlante durante lo svolgimento dei quiz.";
                break;
            case 'user_passed':
                $messageText = "Complimenti per aver superato l'esame di teoria! Ottimo lavoro!";
                break;
            case 'lezioni_video':
                $messageText = "Le nostre video lezioni complete sono disponibili all'interno della sezione dedicata del portale.";
                break;
            case 'progresso':
                $messageText = "Puoi visualizzare le statistiche dettagliate del tuo progresso di studio direttamente nella sezione Profilo.";
                break;
            case 'tutti_messaggi':
                $messageText = "Tutti i messaggi sono stati esaminati con successo.";
                break;
            default:
                return response()->json(['error' => 'Invalid macro'], 400);
        }
        
        $message = \App\Models\Message::create([
            'session_id' => $sessionId,
            'sender' => 'admin',
            'sender_name' => 'Admin',
            'message' => $messageText
        ]);
        
        return response()->json($message);
    });

    // Admin Chat Presets Management CRUD & Execution
    Route::get('/admin/api/chat-presets', function () {
        $presets = \App\Models\ChatPreset::orderBy('order_index', 'asc')->get();
        return response()->json($presets);
    });

    Route::post('/admin/api/chat-presets/store', function (Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:license,text',
            'days' => 'nullable|integer',
            'message_text' => 'nullable|string',
            'bg_color' => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'order_index' => 'required|integer',
        ]);

        $preset = \App\Models\ChatPreset::create([
            'title' => $request->title,
            'type' => $request->type,
            'days' => $request->days,
            'message_text' => $request->message_text,
            'bg_color' => $request->bg_color ?: '#4b5563',
            'text_color' => $request->text_color ?: '#ffffff',
            'order_index' => $request->order_index,
            'status' => true,
        ]);

        return response()->json($preset);
    });

    Route::post('/admin/api/chat-presets/update/{id}', function (Request $request, $id) {
        $preset = \App\Models\ChatPreset::findOrFail($id);
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:license,text',
            'days' => 'nullable|integer',
            'message_text' => 'nullable|string',
            'bg_color' => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'order_index' => 'required|integer',
        ]);

        $preset->update([
            'title' => $request->title,
            'type' => $request->type,
            'days' => $request->days,
            'message_text' => $request->message_text,
            'bg_color' => $request->bg_color ?: '#4b5563',
            'text_color' => $request->text_color ?: '#ffffff',
            'order_index' => $request->order_index,
        ]);

        return response()->json($preset);
    });

    Route::post('/admin/api/chat-presets/delete/{id}', function ($id) {
        $preset = \App\Models\ChatPreset::findOrFail($id);
        $preset->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/admin/api/chat/preset-execute', function (Request $request) {
        $request->validate([
            'session_id' => 'required|string',
            'preset_id' => 'required|integer'
        ]);

        $preset = \App\Models\ChatPreset::findOrFail($request->preset_id);
        $sessionId = $request->session_id;

        if ($preset->type === 'license' && $preset->days) {
            $days = $preset->days;
            $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
            if (!$client) {
                $client = new \App\Models\AppClient();
                $client->session_id = $sessionId;
                $client->first_name = 'Guest';
                $client->last_name = 'User';
                $client->phone = 'N/A';
                $client->stars = 4;
                $client->progress = 50;
            }
            $client->save();

            // 1. Create License Card Message
            $keyNum = rand(10000, 99999);
            \App\Models\Message::create([
                'session_id' => $sessionId,
                'sender' => 'admin',
                'sender_name' => 'Admin',
                'message' => "[LICENSE_CARD:days={$days},key={$keyNum}]"
            ]);

            // 2. Create Text Instruction Message
            $setting = \App\Models\Setting::first();
            $messageText = ($setting && !empty($setting->license_message))
                ? $setting->license_message
                : "apnake license key daoa hoise,click kore active korun.thanks call 3663584525 for info\n\nPial - TMM PATENTE TEAM";
            $message = \App\Models\Message::create([
                'session_id' => $sessionId,
                'sender' => 'admin',
                'sender_name' => 'Admin',
                'message' => $messageText
            ]);

            return response()->json($message);
        } else {
            $messageText = $preset->message_text ?: $preset->title;
            $message = \App\Models\Message::create([
                'session_id' => $sessionId,
                'sender' => 'admin',
                'sender_name' => 'Admin',
                'message' => $messageText
            ]);

            return response()->json($message);
        }
    });

    // Admin Category CRUD API Endpoints
    Route::get('/admin/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('/admin/api/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'show']);
    Route::post('/admin/api/categories/store', [\App\Http\Controllers\CategoryController::class, 'store']);
    Route::post('/admin/api/categories/update/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
    Route::post('/admin/api/categories/delete/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);
    Route::post('/admin/api/categories/bulk-delete', [\App\Http\Controllers\CategoryController::class, 'bulkDestroy']);

    // Admin Chapters and Pages CRUD API Endpoints
    Route::get('/admin/api/chapters/list', [\App\Http\Controllers\ArgomentiController::class, 'getChaptersAdmin']);
    Route::post('/admin/api/chapters/store', [\App\Http\Controllers\ArgomentiController::class, 'createChapter']);
    Route::post('/admin/api/chapters/update/{id}', [\App\Http\Controllers\ArgomentiController::class, 'updateChapter']);
    Route::post('/admin/api/chapters/toggle-status/{id}', [\App\Http\Controllers\ArgomentiController::class, 'toggleChapterStatus']);
    Route::post('/admin/api/chapters/delete/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deleteChapter']);
    Route::post('/admin/api/chapters/bulk-delete', [\App\Http\Controllers\ArgomentiController::class, 'bulkDeleteChapter']);
    
    Route::get('/admin/api/chapters/{id}/pages', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPages']);
    Route::get('/admin/api/chapters/{id}/pages/list', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPagesAdmin']);
    Route::post('/admin/api/pages/store', [\App\Http\Controllers\ArgomentiController::class, 'storePage']);
    Route::post('/admin/api/pages/update/{id}', [\App\Http\Controllers\ArgomentiController::class, 'updatePage']);
    Route::post('/admin/api/pages/toggle-status/{id}', [\App\Http\Controllers\ArgomentiController::class, 'togglePageStatus']);
    Route::post('/admin/api/pages/delete/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deletePage']);
    Route::post('/admin/api/pages/bulk-delete', [\App\Http\Controllers\ArgomentiController::class, 'bulkDeletePage']);
    Route::post('/admin/api/pages/{id}/assign-questions', [\App\Http\Controllers\ArgomentiController::class, 'assignQuestionsToPage']);

    // Admin Dizionario CRUD API Endpoints
    Route::get('/admin/api/dizionario/list', [\App\Http\Controllers\DizionarioController::class, 'getDictionaryAdmin']);
    Route::post('/admin/api/dizionario/store', [\App\Http\Controllers\DizionarioController::class, 'storeWord']);
    Route::post('/admin/api/dizionario/update/{id}', [\App\Http\Controllers\DizionarioController::class, 'updateWord']);
    Route::post('/admin/api/dizionario/delete/{id}', [\App\Http\Controllers\DizionarioController::class, 'deleteWord']);
    Route::post('/admin/api/dizionario/bulk-delete', [\App\Http\Controllers\DizionarioController::class, 'bulkDeleteWord']);

    // Admin Question CRUD with image support (multipart)
    Route::post('/admin/api/questions/store', function (Request $request) {
        $request->validate([
            'chapter'       => 'required|integer',
            'chapter_name'  => 'required|string',
            'page_id'       => 'nullable|integer',
            'sort_order'    => 'nullable|integer',
            'italian'       => 'required|string',
            'bangla'        => 'required|string',
            'question_type' => 'nullable|in:vero_falso,mcq',
            'is_vero'       => 'nullable|boolean',
            'option_a'      => 'nullable|string',
            'option_b'      => 'nullable|string',
            'option_c'      => 'nullable|string',
            'option_d'      => 'nullable|string',
            'correct_answer'=> 'nullable|string',
            'explanation'   => 'nullable|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'audio'         => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'         => 'nullable',
            'vocabulary'    => 'nullable|string',
        ]);

        $qType = $request->question_type ?? 'vero_falso';

        $data = [
            'chapter'       => $request->chapter,
            'chapter_name'  => $request->chapter_name,
            'question_type' => $qType,
            'page_id'       => $request->page_id ?? null,
            'sort_order'    => $request->sort_order ?? 0,
            'italian'       => $request->italian,
            'bangla'        => $request->bangla,
            'is_vero'       => ($qType === 'vero_falso') ? ($request->is_vero ? 1 : 0) : 0,
            'option_a'      => $request->option_a,
            'option_b'      => $request->option_b,
            'option_c'      => $request->option_c,
            'option_d'      => $request->option_d,
            'correct_answer'=> $request->correct_answer,
            'explanation'   => $request->explanation,
            'vocabulary'    => null,
        ];

        $vocabulary = $request->vocabulary ? json_decode($request->vocabulary, true) : null;
        if (is_array($vocabulary)) {
            foreach ($vocabulary as $index => &$item) {
                $fileKey = "vocab_image_{$index}";
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/vocabulary');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $item['image'] = '/uploads/vocabulary/' . $filename;
                }
                unset($item['image_index']);
            }
        }
        $data['vocabulary'] = $vocabulary;

        $question = \App\Models\Question::create($data);

        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $fileName = 'q_img_' . $question->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/images'), $fileName);
            $question->image = '/uploads/questions/images/' . $fileName;
            $question->save();
        }

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $fileName = 'q_aud_' . $question->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/audios'), $fileName);
            $question->audio = '/uploads/questions/audios/' . $fileName;
            $question->save();
        }

        if ($request->input('clear_video') == '1' || $request->input('clear_video') === 'true') {
            $question->video = null;
            $question->save();
        } elseif ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'q_vid_' . $question->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/videos'), $fileName);
            $question->video = '/uploads/questions/videos/' . $fileName;
            $question->save();
        } elseif ($request->filled('video')) {
            $question->video = $request->video;
            $question->save();
        }

        return response()->json($question);
    });

    Route::post('/admin/api/questions/update/{id}', function (Request $request, $id) {
        $request->validate([
            'chapter'       => 'required|integer',
            'chapter_name'  => 'required|string',
            'page_id'       => 'nullable|integer',
            'sort_order'    => 'nullable|integer',
            'italian'       => 'required|string',
            'bangla'        => 'required|string',
            'question_type' => 'nullable|in:vero_falso,mcq',
            'is_vero'       => 'nullable|boolean',
            'option_a'      => 'nullable|string',
            'option_b'      => 'nullable|string',
            'option_c'      => 'nullable|string',
            'option_d'      => 'nullable|string',
            'correct_answer'=> 'nullable|string',
            'explanation'   => 'nullable|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'audio'         => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'         => 'nullable',
            'vocabulary'    => 'nullable|string',
        ]);

        $question  = \App\Models\Question::findOrFail($id);
        $qType     = $request->question_type ?? $question->question_type ?? 'vero_falso';

        $question->chapter       = $request->chapter;
        $question->chapter_name  = $request->chapter_name;
        $question->page_id       = $request->page_id ?? null;
        $question->sort_order    = $request->sort_order ?? 0;
        $question->question_type = $qType;
        $question->italian       = $request->italian;
        $question->bangla        = $request->bangla;
        $question->is_vero       = ($qType === 'vero_falso') ? ($request->is_vero ? 1 : 0) : 0;
        $question->option_a      = $request->option_a;
        $question->option_b      = $request->option_b;
        $question->option_c      = $request->option_c;
        $question->option_d      = $request->option_d;
        $question->correct_answer= $request->correct_answer;
        $question->explanation   = $request->explanation;
        $vocabulary = $request->vocabulary ? json_decode($request->vocabulary, true) : null;
        if (is_array($vocabulary)) {
            foreach ($vocabulary as $index => &$item) {
                $fileKey = "vocab_image_{$index}";
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $filename = 'vocab_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/vocabulary');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    $file->move($destinationPath, $filename);
                    $item['image'] = '/uploads/vocabulary/' . $filename;
                }
                unset($item['image_index']);
            }
        }
        $question->vocabulary    = $vocabulary;

        if ($request->hasFile('image')) {
            if ($question->image && file_exists(public_path($question->image))) {
                @unlink(public_path($question->image));
            }
            $file     = $request->file('image');
            $fileName = 'q_img_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/images'), $fileName);
            $question->image = '/uploads/questions/images/' . $fileName;
        }

        if ($request->hasFile('audio')) {
            if ($question->audio && file_exists(public_path($question->audio))) {
                @unlink(public_path($question->audio));
            }
            $file = $request->file('audio');
            $fileName = 'q_aud_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/audios'), $fileName);
            $question->audio = '/uploads/questions/audios/' . $fileName;
        }

        if ($request->input('clear_video') == '1' || $request->input('clear_video') === 'true') {
            if ($question->video && file_exists(public_path($question->video))) {
                @unlink(public_path($question->video));
            }
            $question->video = null;
        } elseif ($request->hasFile('video')) {
            if ($question->video && file_exists(public_path($question->video))) {
                @unlink(public_path($question->video));
            }
            $file = $request->file('video');
            $fileName = 'q_vid_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/videos'), $fileName);
            $question->video = '/uploads/questions/videos/' . $fileName;
        } elseif ($request->filled('video')) {
            $question->video = $request->video;
        }

        $question->save();
        return response()->json($question);
    });

    Route::post('/admin/api/questions/delete/{id}', function ($id) {
        $question = \App\Models\Question::findOrFail($id);
        if ($question->image && file_exists(public_path($question->image))) {
            @unlink(public_path($question->image));
        }
        $question->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/admin/api/questions/bulk-delete', function (Request $request) {
        if ($request->input('all') === true) {
            $query = \App\Models\Question::query();
            
            if ($request->has('chapter') && $request->chapter !== '') {
                $query->where('chapter', $request->chapter);
            }
            
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('italian', 'like', "%{$search}%")
                      ->orWhere('bangla', 'like', "%{$search}%")
                      ->orWhere('chapter_name', 'like', "%{$search}%");
                });
            }
            
            $questions = $query->get();
            foreach ($questions as $question) {
                if ($question->image && file_exists(public_path($question->image))) {
                    @unlink(public_path($question->image));
                }
                $question->delete();
            }
            return response()->json(['success' => true]);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:questions,id',
        ]);
        $questions = \App\Models\Question::whereIn('id', $request->ids)->get();
        foreach ($questions as $question) {
            if ($question->image && file_exists(public_path($question->image))) {
                @unlink(public_path($question->image));
            }
            $question->delete();
        }
        return response()->json(['success' => true]);
    });

    // Admin Sliders CRUD
    Route::get('/admin/api/sliders', [\App\Http\Controllers\DynamicContentController::class, 'getSliders']);
    Route::post('/admin/api/sliders/store', [\App\Http\Controllers\DynamicContentController::class, 'storeSlider']);
    Route::post('/admin/api/sliders/update/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateSlider']);
    Route::post('/admin/api/sliders/toggle-status/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleSliderStatus']);
    Route::post('/admin/api/sliders/delete/{id}', [\App\Http\Controllers\DynamicContentController::class, 'deleteSlider']);

    // Admin Popup Promo Settings
    Route::get('/admin/api/popup-promo', [\App\Http\Controllers\DynamicContentController::class, 'getPopupPromo']);
    Route::post('/admin/api/popup-promo/save', [\App\Http\Controllers\DynamicContentController::class, 'savePopupPromo']);

    // Admin Client Verification & Activation CRUD
    Route::get('/admin/api/clients', [\App\Http\Controllers\DynamicContentController::class, 'getClients']);
    Route::post('/admin/api/clients/toggle-active/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleClientActive']);
    Route::post('/admin/api/clients/toggle-blocked/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleClientBlocked']);
    Route::post('/admin/api/clients/update-license/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateClientLicense']);
    Route::post('/admin/api/clients/delete/{id}', [\App\Http\Controllers\DynamicContentController::class, 'deleteClient']);
    Route::post('/admin/api/clients/update-stars/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateClientStars']);

    // Admin Lecture Classes CRUD
    Route::get('/admin/api/classes', [\App\Http\Controllers\DynamicContentController::class, 'getLectureClasses']);
    Route::post('/admin/api/classes/store', [\App\Http\Controllers\DynamicContentController::class, 'storeLectureClass']);
    Route::post('/admin/api/classes/update/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateLectureClass']);
    Route::post('/admin/api/classes/toggle-status/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleLectureClassStatus']);
    Route::post('/admin/api/classes/delete/{id}', [\App\Http\Controllers\DynamicContentController::class, 'deleteLectureClass']);

    // Admin Live Classes CRUD
    Route::get('/admin/api/live-classes', [\App\Http\Controllers\DynamicContentController::class, 'getLiveClasses']);
    Route::post('/admin/api/live-classes/store', [\App\Http\Controllers\DynamicContentController::class, 'storeLiveClass']);
    Route::post('/admin/api/live-classes/update/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateLiveClass']);
    Route::post('/admin/api/live-classes/toggle-status/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleLiveClassStatus']);
    Route::post('/admin/api/live-classes/delete/{id}', [\App\Http\Controllers\DynamicContentController::class, 'deleteLiveClass']);

    // Admin Exam CRUD Endpoints
    Route::get('/admin/api/exams', [\App\Http\Controllers\ExamSheetController::class, 'getExams']);
    Route::post('/admin/api/exams/store', [\App\Http\Controllers\ExamSheetController::class, 'storeExam']);
    Route::post('/admin/api/exams/delete/{id}', [\App\Http\Controllers\ExamSheetController::class, 'deleteExam']);

    // Admin Home Cards CRUD
    Route::get('/admin/api/home-cards', [\App\Http\Controllers\DynamicContentController::class, 'getHomeCards']);
    Route::post('/admin/api/home-cards/store', [\App\Http\Controllers\DynamicContentController::class, 'storeHomeCard']);
    Route::post('/admin/api/home-cards/update/{id}', [\App\Http\Controllers\DynamicContentController::class, 'updateHomeCard']);
    Route::post('/admin/api/home-cards/toggle-status/{id}', [\App\Http\Controllers\DynamicContentController::class, 'toggleHomeCardStatus']);
    Route::post('/admin/api/home-cards/delete/{id}', [\App\Http\Controllers\DynamicContentController::class, 'deleteHomeCard']);

    // Admin File Manager CRUD
    Route::get('/admin/api/media', [\App\Http\Controllers\FileManagerController::class, 'index']);
    Route::post('/admin/api/media/store', [\App\Http\Controllers\FileManagerController::class, 'store']);
    Route::post('/admin/api/media/rename/{id}', [\App\Http\Controllers\FileManagerController::class, 'rename']);
    Route::post('/admin/api/media/delete/{id}', [\App\Http\Controllers\FileManagerController::class, 'destroy']);
    Route::get('/admin/api/media/download/{id}', [\App\Http\Controllers\FileManagerController::class, 'download']);

    // System Diagnostics & Error Handling Dashboard Routes
    Route::get('/admin/api/system/errors', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getSystemErrors']);
    Route::post('/admin/api/system/errors/delete/{id}', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'deleteSystemError']);
    Route::get('/admin/api/system/errors/{id}', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getSystemErrorDetails']);
    
    Route::get('/admin/api/system/diagnostics', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'runDiagnostics']);
    Route::get('/admin/api/system/database', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getDatabaseStatus']);
    Route::get('/admin/api/system/security', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getSecurityStatus']);
    Route::post('/admin/api/system/cache/clear/{type}', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'clearCache']);
    
    Route::get('/admin/api/system/logs', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getLogEntries']);
    Route::post('/admin/api/system/logs/delete', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'deleteLogs']);
    Route::get('/admin/api/system/logs/download', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'downloadLogs']);
    
    Route::get('/admin/api/system/api-logs', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getApiLogs']);
    Route::get('/admin/api/system/queue', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getQueueStatus']);
    Route::post('/admin/api/system/queue/retry', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'retryQueueJobs']);
    Route::get('/admin/api/system/scheduler', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getSchedulerStatus']);
    
    Route::post('/admin/api/system/mail/test', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'sendTestMail']);
    
    Route::get('/admin/api/system/backups', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'getBackups']);
    Route::post('/admin/api/system/backups/create', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'createBackup']);
    Route::post('/admin/api/system/backups/delete/{filename}', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'deleteBackup']);
    Route::post('/admin/api/system/backups/restore', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'restoreBackup']);
    Route::get('/admin/api/system/backups/download/{filename}', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'downloadBackup']);
    
    Route::get('/admin/api/system/diagnostics/download', [\App\Http\Controllers\Admin\SystemDiagnosticsController::class, 'downloadDiagnosticReport']);

    // ============================================================
    // Admin Cartelli (Road Signs) CRUD - Category -> Chapter -> Page -> MCQ
    // ============================================================

    // Categories
    Route::get('/admin/api/cartello-categories', [\App\Http\Controllers\CartelloController::class, 'getCategories']);
    Route::post('/admin/api/cartello-categories/store', [\App\Http\Controllers\CartelloController::class, 'storeCategory']);
    Route::post('/admin/api/cartello-categories/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updateCategory']);
    Route::post('/admin/api/cartello-categories/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deleteCategory']);
    Route::post('/admin/api/cartello-categories/bulk-delete', [\App\Http\Controllers\CartelloController::class, 'bulkDeleteCategory']);

    // Chapters
    Route::get('/admin/api/cartello-chapters', [\App\Http\Controllers\CartelloController::class, 'getChapters']);
    Route::post('/admin/api/cartello-chapters/store', [\App\Http\Controllers\CartelloController::class, 'storeChapter']);
    Route::post('/admin/api/cartello-chapters/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updateChapter']);
    Route::post('/admin/api/cartello-chapters/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deleteChapter']);
    Route::post('/admin/api/cartello-chapters/bulk-delete', [\App\Http\Controllers\CartelloController::class, 'bulkDeleteChapter']);

    // Pages
    Route::get('/admin/api/cartello-pages', [\App\Http\Controllers\CartelloController::class, 'getPages']);
    Route::post('/admin/api/cartello-pages/store', [\App\Http\Controllers\CartelloController::class, 'storePage']);
    Route::post('/admin/api/cartello-pages/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updatePage']);
    Route::post('/admin/api/cartello-pages/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deletePage']);
    Route::post('/admin/api/cartello-pages/bulk-delete', [\App\Http\Controllers\CartelloController::class, 'bulkDeletePage']);

    // MCQs
    Route::get('/admin/api/cartello-mcqs', [\App\Http\Controllers\CartelloController::class, 'getMcqs']);
    Route::post('/admin/api/cartello-mcqs/store', [\App\Http\Controllers\CartelloController::class, 'storeMcq']);
    Route::post('/admin/api/cartello-mcqs/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updateMcq']);
    Route::post('/admin/api/cartello-mcqs/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deleteMcq']);
    Route::post('/admin/api/cartello-mcqs/bulk-delete', [\App\Http\Controllers\CartelloController::class, 'bulkDeleteMcq']);
});

// Guest Categories API
Route::get('/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

// Public Cartelli (Road Signs) API
Route::get('/api/cartello-categories', [\App\Http\Controllers\CartelloController::class, 'publicGetCategories']);
Route::get('/api/cartello-categories/{categoryId}/chapters', [\App\Http\Controllers\CartelloController::class, 'publicGetChapters']);
Route::get('/api/cartello-chapters', [\App\Http\Controllers\CartelloController::class, 'publicGetAllChapters']);
Route::get('/api/cartello-chapters/{chapterId}/pages', [\App\Http\Controllers\CartelloController::class, 'publicGetPages']);
Route::get('/api/cartello-pages/{pageId}/mcqs', [\App\Http\Controllers\CartelloController::class, 'publicGetPageMcqs']);

// Public Manuale (Theory Guidebook) API
Route::get('/api/manuale', function () {
    $items = \App\Models\Manuale::where('status', true)->orderBy('chapter_number', 'asc')->orderBy('order_index', 'asc')->get();
    return response()->json([
        'status' => 'success',
        'data' => $items
    ]);
});

// Admin Manuale API Endpoints
Route::get('/api/admin/manuale', function () {
    $items = \App\Models\Manuale::orderBy('chapter_number', 'asc')->orderBy('order_index', 'asc')->get();
    return response()->json([
        'status' => 'success',
        'data' => $items
    ]);
});
Route::get('/admin/api/manuale', function () {
    $items = \App\Models\Manuale::orderBy('chapter_number', 'asc')->orderBy('order_index', 'asc')->get();
    return response()->json([
        'status' => 'success',
        'data' => $items
    ]);
});

$saveManualeHandler = function (Request $request, $id = null) {
    try {
        $manuale = $id ? \App\Models\Manuale::findOrFail($id) : new \App\Models\Manuale();

        $vocabData = [];
        if ($request->has('vocab_italian') && is_array($request->input('vocab_italian'))) {
            $italians = $request->input('vocab_italian');
            $banglas = $request->input('vocab_bangla', []);
            $existingImgs = $request->input('vocab_existing_image', []);
            foreach ($italians as $idx => $itWord) {
                if (trim($itWord) === '') continue;
                $bnWord = $banglas[$idx] ?? '';
                $img = $existingImgs[$idx] ?? '';
                if ($request->hasFile("vocab_image_{$idx}")) {
                    $file = $request->file("vocab_image_{$idx}");
                    $ext = strtolower($file->getClientOriginalExtension()) ?: ($file->extension() ?: 'jpg');
                    $filename = 'vocab_' . time() . '_' . $idx . '_' . uniqid() . '.' . $ext;
                    $uploadDir = public_path('uploads/manuale/vocab');
                    if (!file_exists($uploadDir)) {
                        @mkdir($uploadDir, 0777, true);
                    }
                    $file->move($uploadDir, $filename);
                    $img = '/uploads/manuale/vocab/' . $filename;
                }
                $vocabData[] = [
                    'word' => $itWord,
                    'italian' => $itWord,
                    'bangla' => $bnWord,
                    'meaning' => $bnWord,
                    'image' => $img
                ];
            }
        } elseif ($request->has('vocabulary')) {
            $vocabData = is_array($request->input('vocabulary')) ? $request->input('vocabulary') : json_decode($request->input('vocabulary'), true);
        } elseif (!$id) {
            $vocabData = [];
        } else {
            $vocabData = $manuale->vocabulary;
        }

        $manuale->title = $request->input('title', $manuale->title);
        $manuale->chapter_number = $request->input('chapter_number', $manuale->chapter_number ?? 1);
        $manuale->content = $request->input('content', $manuale->content);
        $manuale->vocabulary = $vocabData;
        $manuale->order_index = $request->input('order_index', $manuale->order_index ?? 0);
        if (!$id) {
            $manuale->status = true;
        }

        if ($request->hasFile('image')) {
            $imgFile = $request->file('image');
            $ext = strtolower($imgFile->getClientOriginalExtension()) ?: ($imgFile->extension() ?: 'jpg');
            $filename = 'manuale_' . time() . '_' . uniqid() . '.' . $ext;
            $uploadDir = public_path('uploads/manuale');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0777, true);
            }
            $imgFile->move($uploadDir, $filename);
            $manuale->image_path = '/uploads/manuale/' . $filename;
        }

        $manuale->save();

        return response()->json([
            'status' => 'success',
            'message' => $id ? 'ম্যানুয়াল থিওরি আপডেট করা হয়েছে!' : 'ম্যানুয়াল থিওরি সফলভাবে যোগ করা হয়েছে!',
            'data' => $manuale
        ]);
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('Error saving manuale: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
        return response()->json([
            'status' => 'error',
            'message' => 'Error saving theory topic: ' . $e->getMessage()
        ], 500);
    }
};

Route::post('/api/admin/manuale/store', $saveManualeHandler);
Route::post('/admin/api/manuale/store', $saveManualeHandler);
Route::post('/api/admin/manuale/update/{id}', $saveManualeHandler);
Route::post('/admin/api/manuale/update/{id}', $saveManualeHandler);

Route::post('/api/admin/manuale/delete/{id}', function ($id) {
    $manuale = \App\Models\Manuale::findOrFail($id);
    $manuale->delete();
    return response()->json(['status' => 'success', 'message' => 'ম্যানুয়াল থিওরি মুছে ফেলা হয়েছে!']);
});
Route::post('/admin/api/manuale/delete/{id}', function ($id) {
    $manuale = \App\Models\Manuale::findOrFail($id);
    $manuale->delete();
    return response()->json(['status' => 'success', 'message' => 'ম্যানুয়াল থিওরি মুছে ফেলা হয়েছে!']);
});

Route::post('/api/admin/manuale/toggle-status/{id}', function ($id) {
    $manuale = \App\Models\Manuale::findOrFail($id);
    $manuale->status = !$manuale->status;
    $manuale->save();
    return response()->json(['status' => 'success', 'message' => 'স্ট্যাটাস আপডেট করা হয়েছে!']);
});
Route::post('/admin/api/manuale/toggle-status/{id}', function ($id) {
    $manuale = \App\Models\Manuale::findOrFail($id);
    $manuale->status = !$manuale->status;
    $manuale->save();
    return response()->json(['status' => 'success', 'message' => 'স্ট্যাটাস আপডেট করা হয়েছে!']);
});

// Dizionario Public API (outside license middleware so dict images always load)
Route::get('/api/dizionario', [\App\Http\Controllers\DizionarioController::class, 'getDictionary']);

// ==========================================
// mbanglapatenteb (Community Feed) API
// ==========================================
Route::get('/api/social/posts', function (Request $request) {
    $userPhone = trim((string)$request->query('user_phone', ''));
    $posts = \App\Models\SocialPost::where('status', true)
        ->with(['comments' => function($q) {
            $q->orderBy('created_at', 'asc');
        }])
        ->orderBy('created_at', 'desc')
        ->get();

    $data = $posts->map(function($post) use ($userPhone) {
        $isLiked = false;
        if ($userPhone !== '') {
            $isLiked = \App\Models\SocialLike::where('post_id', $post->id)
                ->where('user_identifier', $userPhone)
                ->exists();
        }
        return [
            'id' => $post->id,
            'user_id' => $post->user_id,
            'author_name' => $post->author_name,
            'author_phone' => $post->author_phone,
            'author_avatar' => $post->author_avatar ?: ('https://ui-avatars.com/api/?name=' . urlencode($post->author_name) . '&background=6366F1&color=fff'),
            'content' => $post->content,
            'image_path' => $post->image_path,
            'likes_count' => (int)$post->likes_count,
            'comments_count' => (int)$post->comments_count,
            'is_liked' => $isLiked,
            'comments' => $post->comments,
            'created_at_formatted' => $post->created_at ? $post->created_at->diffForHumans() : 'Just now'
        ];
    });

    return response()->json([
        'status' => 'success',
        'data' => $data
    ]);
});

Route::post('/api/social/posts/store', function (Request $request) {
    $authorName = trim($request->input('author_name', 'Anonymous User')) ?: 'Anonymous User';
    $authorPhone = trim($request->input('author_phone', ''));
    $authorAvatar = trim($request->input('author_avatar', ''));
    if (empty($authorAvatar) || str_starts_with($authorAvatar, 'data:')) {
        $authorAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($authorName) . '&background=6366F1&color=fff';
    }
    $content = trim($request->input('content', ''));

    if (empty($content) && !$request->hasFile('photo') && !$request->hasFile('image')) {
        return response()->json([
            'status' => 'error',
            'message' => 'অনুগ্রহ করে কিছু লিখুন অথবা একটি ছবি যুক্ত করুন।'
        ], 422);
    }

    $imagePath = trim((string)$request->input('image_url', $request->input('image_path', ''))) ?: null;
    $file = $request->file('photo') ?: $request->file('image');
    if ($file) {
        $ext = strtolower($file->getClientOriginalExtension()) ?: ($file->extension() ?: 'jpg');
        $filename = 'social_' . time() . '_' . uniqid() . '.' . $ext;
        $path = $file->storeAs('social', $filename, 'public');
        // Force 644 permission so file is world-readable on production server
        $fullPath = storage_path('app/public/' . $path);
        if (file_exists($fullPath)) {
            @chmod($fullPath, 0644);
        }
        $imagePath = '/storage/' . $path;
    }


    $post = \App\Models\SocialPost::create([
        'author_name' => $authorName ?: 'Anonymous User',
        'author_phone' => $authorPhone,
        'author_avatar' => $authorAvatar,
        'content' => $content,
        'image_path' => $imagePath,
        'likes_count' => 0,
        'comments_count' => 0,
        'status' => true
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'পোস্ট সফলভাবে পাবলিশ হয়েছে!',
        'data' => $post
    ]);
});

Route::post('/api/social/posts/update/{id}', function (Request $request, $id) {
    $post = \App\Models\SocialPost::findOrFail($id);
    $reqPhone = trim((string)$request->input('author_phone', ''));

    // Verify authorship restriction
    if (!empty($post->author_phone) && $post->author_phone !== $reqPhone) {
        return response()->json([
            'status' => 'error',
            'message' => 'আপনি শুধুমাত্র আপনার নিজের পোস্ট এডিট করতে পারবেন!'
        ], 403);
    }

    $content = trim($request->input('content', $post->content));
    $post->content = $content;

    $file = $request->file('photo') ?: $request->file('image');
    if ($file) {
        $ext = strtolower($file->getClientOriginalExtension()) ?: ($file->extension() ?: 'jpg');
        $filename = 'social_' . time() . '_' . uniqid() . '.' . $ext;
        $path = $file->storeAs('social', $filename, 'public');
        $post->image_path = '/storage/' . $path;
    }

    $post->save();

    return response()->json([
        'status' => 'success',
        'message' => 'পোস্ট আপডেট করা হয়েছে!',
        'data' => $post
    ]);
});

Route::post('/api/social/posts/delete/{id}', function (Request $request, $id) {
    $post = \App\Models\SocialPost::findOrFail($id);
    $reqPhone = trim((string)$request->input('author_phone', ''));

    // Verify authorship restriction
    if (!empty($post->author_phone) && $post->author_phone !== $reqPhone) {
        return response()->json([
            'status' => 'error',
            'message' => 'আপনি শুধুমাত্র আপনার নিজের পোস্ট ডিলিট করতে পারবেন!'
        ], 403);
    }

    $post->delete();

    return response()->json([
        'status' => 'success',
        'message' => 'পোস্ট মুছে ফেলা হয়েছে!'
    ]);
});

Route::post('/api/social/posts/like/{id}', function (Request $request, $id) {
    $post = \App\Models\SocialPost::findOrFail($id);
    $userPhone = trim((string)$request->input('user_phone', ''));

    if (empty($userPhone)) {
        return response()->json([
            'status' => 'error',
            'message' => 'User identifier required'
        ], 422);
    }

    $existing = \App\Models\SocialLike::where('post_id', $post->id)
        ->where('user_identifier', $userPhone)
        ->first();

    if ($existing) {
        $existing->delete();
        $post->likes_count = max(0, $post->likes_count - 1);
        $post->save();
        $isLiked = false;
    } else {
        \App\Models\SocialLike::create([
            'post_id' => $post->id,
            'user_identifier' => $userPhone
        ]);
        $post->likes_count = $post->likes_count + 1;
        $post->save();
        $isLiked = true;
    }

    return response()->json([
        'status' => 'success',
        'likes_count' => (int)$post->likes_count,
        'is_liked' => $isLiked
    ]);
});

Route::get('/api/social/posts/{id}/comments', function ($id) {
    $comments = \App\Models\SocialComment::where('post_id', $id)
        ->orderBy('created_at', 'asc')
        ->get();

    return response()->json([
        'status' => 'success',
        'data' => $comments
    ]);
});

Route::post('/api/social/posts/comments/store', function (Request $request) {
    $postId = $request->input('post_id');
    $post = \App\Models\SocialPost::findOrFail($postId);
    $authorName = trim($request->input('author_name', 'Anonymous User')) ?: 'Anonymous User';
    $authorPhone = trim($request->input('author_phone', ''));
    $authorAvatar = trim($request->input('author_avatar', ''));
    if (empty($authorAvatar) || str_starts_with($authorAvatar, 'data:')) {
        $authorAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($authorName) . '&background=6366F1&color=fff';
    }
    $commentText = trim($request->input('comment', ''));

    if (empty($commentText)) {
        return response()->json([
            'status' => 'error',
            'message' => 'কমেন্ট লিখুন।'
        ], 422);
    }

    $comment = \App\Models\SocialComment::create([
        'post_id' => $post->id,
        'author_name' => $authorName ?: 'Anonymous User',
        'author_phone' => $authorPhone,
        'author_avatar' => $authorAvatar,
        'comment' => $commentText
    ]);

    $post->comments_count = $post->comments_count + 1;
    $post->save();

    return response()->json([
        'status' => 'success',
        'message' => 'কমেন্ট যুক্ত হয়েছে!',
        'data' => $comment,
        'comments_count' => (int)$post->comments_count
    ]);
});

// ==========================================
// Translation & Pronunciation API
// ==========================================
Route::post('/api/translate', function (Request $request) {
    $text = trim((string)$request->input('text', ''));
    $fromLang = strtolower(trim((string)$request->input('from_lang', 'bn')));
    $toLang = strtolower(trim((string)$request->input('to_lang', 'it')));

    if (empty($text)) {
        return response()->json([
            'status' => 'error',
            'message' => 'অনুবাদ করার জন্য কিছু লিখুন।'
        ], 422);
    }

    // 1. Check cached translations DB
    $cached = \App\Models\Translation::where('source_text', $text)
        ->where('from_lang', $fromLang)
        ->where('to_lang', $toLang)
        ->first();

    if ($cached) {
        $cached->increment('search_count');
        return response()->json([
            'status' => 'success',
            'translated_text' => $cached->translated_text,
            'source_text' => $text,
            'from_lang' => $fromLang,
            'to_lang' => $toLang,
            'cached' => true
        ]);
    }

    // 2. Check Dizionario DB if translating a word
    if ($fromLang === 'it' && $toLang === 'bn') {
        $dict = \App\Models\Dizionario::where('word', 'like', $text)->first();
        if ($dict && !empty($dict->bn)) {
            $transText = $dict->bn;
            \App\Models\Translation::create([
                'source_text' => $text,
                'translated_text' => $transText,
                'from_lang' => $fromLang,
                'to_lang' => $toLang
            ]);
            return response()->json([
                'status' => 'success',
                'translated_text' => $transText,
                'source_text' => $text,
                'from_lang' => $fromLang,
                'to_lang' => $toLang
            ]);
        }
    }

    // 3. Fallback to MyMemory Free Translation API
    $pair = ($fromLang === 'bn' ? 'bn' : 'it') . '|' . ($toLang === 'it' ? 'it' : 'bn');
    $url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=" . $pair;

    $transText = null;
    try {
        $response = @file_get_contents($url);
        if ($response) {
            $json = json_decode($response, true);
            if (isset($json['responseData']['translatedText'])) {
                $transText = $json['responseData']['translatedText'];
            }
        }
    } catch (\Throwable $e) {
        // Ignore network exception
    }

    if (empty($transText)) {
        $transText = $text; // Fallback
    }

    // Cache translation
    \App\Models\Translation::create([
        'source_text' => $text,
        'translated_text' => $transText,
        'from_lang' => $fromLang,
        'to_lang' => $toLang
    ]);

    return response()->json([
        'status' => 'success',
        'translated_text' => $transText,
        'source_text' => $text,
        'from_lang' => $fromLang,
        'to_lang' => $toLang
    ]);
});



// Admin: Fix storage permissions (run once on production to fix 403 on social images)
Route::get('/admin/fix-storage-permissions', function () {
    if (!session('admin_logged_in')) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    $dir = storage_path('app/public/social');
    $fixed = 0;
    $errors = [];
    if (is_dir($dir)) {
        foreach (glob($dir . '/*') as $file) {
            if (is_file($file)) {
                if (@chmod($file, 0644)) {
                    $fixed++;
                } else {
                    $errors[] = basename($file);
                }
            }
        }
    }
    return response()->json([
        'status'  => 'done',
        'fixed'   => $fixed,
        'errors'  => $errors,
        'message' => $fixed . ' files fixed. ' . (count($errors) ? implode(', ', $errors) . ' failed.' : 'All OK.'),
    ]);
});

// =========================================================================
// 💬 LIVE SUPPORT CHAT, CLIENT VERIFICATION & LICENSE ACTIVATION ROUTES
// =========================================================================

// 1. Client Verification endpoint (from website & app)
Route::post('/api/client/verify', function (Request $request) {
    $firstName = trim($request->input('first_name', ''));
    $lastName  = trim($request->input('last_name', ''));
    $phone     = trim($request->input('phone', ''));
    $sessionId = $request->input('session_id') ?: session()->getId();

    if (empty($firstName) || empty($lastName) || empty($phone)) {
        return response()->json(['success' => false, 'message' => 'সকল প্রয়োজনীয় ফিল্ড পূরণ করুন'], 422);
    }

    $client = \App\Models\AppClient::updateOrCreate(
        ['session_id' => $sessionId],
        [
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'phone'      => $phone,
        ]
    );

    session(['client_verified' => true, 'client_phone' => $phone, 'app_client_id' => $client->id]);

    return response()->json([
        'success' => true,
        'message' => 'ভেরিফিকেশন সফল হয়েছে',
        'client'  => $client
    ]);
});

// 2. Fetch Chat Messages (for current client session)
Route::get('/api/chat/messages', function (Request $request) {
    $sessionId = $request->query('session_id') ?: session()->getId();
    
    $phone = $request->query('phone');
    if ($phone) {
        $client = \App\Models\AppClient::where('phone', $phone)->first();
        if ($client) {
            $sessionId = $client->session_id;
        }
    }

    $messages = \App\Models\Message::where('session_id', $sessionId)
        ->orderBy('id', 'asc')
        ->get();

    return response()->json($messages);
});

// 3. Send Chat Message (from client)
Route::post('/api/chat/messages', function (Request $request) {
    $sessionId = $request->input('session_id') ?: session()->getId();
    $text      = trim($request->input('message', ''));
    $attachment = $request->input('attachment_path');

    if (empty($text) && empty($attachment)) {
        return response()->json(['success' => false, 'message' => 'বার্তা প্রদান করুন'], 422);
    }

    $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
    $senderName = $client ? ($client->first_name . ' ' . $client->last_name) : 'Guest User';

    $msg = \App\Models\Message::create([
        'session_id'      => $sessionId,
        'sender'          => 'user',
        'sender_name'     => $senderName,
        'message'         => $text,
        'attachment_path' => $attachment,
    ]);

    return response()->json($msg);
});

// 4. Activate License (when customer clicks "Attiva Licenza" on License Card)
$activateLicenseHandler = function (Request $request) {
    $sessionId = $request->input('session_id') ?: session()->getId();
    $days      = (int)($request->input('days', 365));

    $client = \App\Models\AppClient::where('session_id', $sessionId)->first();
    if (!$client && $request->input('phone')) {
        $client = \App\Models\AppClient::where('phone', $request->input('phone'))->first();
    }

    if ($client) {
        $client->update([
            'is_active'  => true,
            'expires_at' => now()->addDays($days),
        ]);
        $sessionId = $client->session_id;
    }

    // Mark session & global cache as unlocked
    session(['qr_unlocked' => true]);
    \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $sessionId, true, 86400 * 365);
    \Illuminate\Support\Facades\Cache::put('qr_unlocked_global', true, 86400 * 365);

    return response()->json([
        'success' => true,
        'message' => 'Licenza Attivata ✓',
    ]);
};

Route::post('/api/client/activate-license', $activateLicenseHandler);
Route::post('/api/client/activate', $activateLicenseHandler);

// 5. Admin: Fetch Chat Conversations List
Route::get('/admin/api/chat/conversations', function () {
    $sessions = \App\Models\Message::select('session_id')
        ->distinct()
        ->get()
        ->pluck('session_id');

    $clientSessions = \App\Models\AppClient::pluck('session_id');
    $allSessions = $sessions->concat($clientSessions)->unique();

    $conversations = [];
    foreach ($allSessions as $sId) {
        $client = \App\Models\AppClient::where('session_id', $sId)->first();
        $lastMsgObj = \App\Models\Message::where('session_id', $sId)->orderBy('id', 'desc')->first();

        $conversations[] = [
            'session_id'   => $sId,
            'client'       => $client,
            'last_message' => $lastMsgObj ? $lastMsgObj->message : 'No messages yet',
            'last_time'    => $lastMsgObj ? $lastMsgObj->created_at->diffForHumans() : '',
        ];
    }

    return response()->json($conversations);
});

// 6. Admin: Fetch Messages for a Conversation Session
Route::get('/admin/api/chat/messages/{sessionId}', function ($sessionId) {
    $messages = \App\Models\Message::where('session_id', $sessionId)
        ->orderBy('id', 'asc')
        ->get();
    return response()->json($messages);
});

// 7. Admin: Send Chat Message / License Card to Client
Route::post('/admin/api/chat/messages', function (Request $request) {
    $sessionId = $request->input('session_id');
    $text      = trim($request->input('message', ''));

    if (empty($sessionId) || empty($text)) {
        return response()->json(['success' => false, 'message' => 'Missing session_id or message'], 422);
    }

    $msg = \App\Models\Message::create([
        'session_id'  => $sessionId,
        'sender'      => 'admin',
        'sender_name' => 'Support Admin',
        'message'     => $text,
    ]);

    return response()->json($msg);
});

// 8. Admin: Toggle Client Activation
Route::post('/admin/api/clients/toggle-active/{id}', function ($id) {
    $client = \App\Models\AppClient::findOrFail($id);
    $client->is_active = !$client->is_active;
    if ($client->is_active) {
        $client->expires_at = now()->addDays(365);
        \Illuminate\Support\Facades\Cache::put('qr_unlocked_' . $client->session_id, true, 86400 * 365);
        \Illuminate\Support\Facades\Cache::put('qr_unlocked_global', true, 86400 * 365);
    }
    $client->save();

    return response()->json([
        'success' => true,
        'client'  => $client
    ]);
});

// 9. Admin: Get Chat Presets
Route::get('/admin/api/chat-presets', function () {
    $presets = \App\Models\ChatPreset::orderBy('order_index', 'asc')->get();
    if ($presets->isEmpty()) {
        $default = \App\Models\ChatPreset::create([
            'title'        => '🔑 Send 1 Year License',
            'type'         => 'license',
            'days'         => 365,
            'bg_color'     => '#10b981',
            'text_color'   => '#ffffff',
            'order_index'  => 1,
            'status'       => true,
        ]);
        $presets = collect([$default]);
    }
    return response()->json($presets);
});

// 10. Admin: Execute Chat Preset (Send License Card)
Route::post('/admin/api/chat/preset-execute', function (Request $request) {
    $sessionId = $request->input('session_id');
    $presetId  = $request->input('preset_id');

    $preset = \App\Models\ChatPreset::findOrFail($presetId);

    if ($preset->type === 'license') {
        $days = $preset->days ?: 365;
        $key  = rand(100000, 999999);
        $cardMsg = "[LICENSE_CARD:key={$key},days={$days}]";

        $msg = \App\Models\Message::create([
            'session_id'  => $sessionId,
            'sender'      => 'admin',
            'sender_name' => 'Support Admin',
            'message'     => $cardMsg,
        ]);
        return response()->json($msg);
    } else {
        $msg = \App\Models\Message::create([
            'session_id'  => $sessionId,
            'sender'      => 'admin',
            'sender_name' => 'Support Admin',
            'message'     => $preset->message_text,
        ]);
        return response()->json($msg);
    }
});