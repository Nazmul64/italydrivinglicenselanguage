<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    $sliders = \App\Models\Slider::orderBy('id', 'asc')->get();
    $homeCards = \App\Models\HomeCard::orderBy('order_index', 'asc')->get();
    $lectureClasses = \App\Models\LectureClass::orderBy('id', 'asc')->get();
    $liveClasses = \App\Models\LiveClass::orderBy('scheduled_at', 'asc')->get();
    $popupPromo = \App\Models\PopupPromo::where('is_active', true)->first();
    return view('frontend.home', compact('sliders', 'homeCards', 'lectureClasses', 'liveClasses', 'popupPromo'));
});

// Front-end MCQ API Endpoints
Route::get('/api/questions/exam', function () {
    $questions = \App\Models\Question::inRandomOrder()->limit(30)->get();
    return response()->json($questions);
});

Route::get('/api/questions/chapter/{chapter}', function ($chapter) {
    $questions = \App\Models\Question::where('chapter', $chapter)->get();
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
    $questions = \App\Models\Question::inRandomOrder()->limit(30)->get();
    return response()->json($questions);
});

// Public Sliders & Classes API
Route::get('/api/sliders', [\App\Http\Controllers\DynamicContentController::class, 'getSliders']);
Route::get('/api/classes', [\App\Http\Controllers\DynamicContentController::class, 'getLectureClasses']);
Route::get('/api/live-classes', [\App\Http\Controllers\DynamicContentController::class, 'getLiveClasses']);
Route::get('/api/popup-promo', [\App\Http\Controllers\DynamicContentController::class, 'getActivePopupPromo']);


// Argomenti Public API Endpoints
Route::get('/api/chapters', [\App\Http\Controllers\ArgomentiController::class, 'getChapters']);
Route::get('/api/chapters/{id}/pages', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPages']);
Route::get('/api/pages/{id}', [\App\Http\Controllers\ArgomentiController::class, 'getPageDetails']);
Route::get('/api/saved-mcqs', [\App\Http\Controllers\ArgomentiController::class, 'getSavedMcqs']);
Route::post('/api/saved-mcqs/toggle', [\App\Http\Controllers\ArgomentiController::class, 'toggleSavedMcq']);
Route::get('/api/notes', [\App\Http\Controllers\ArgomentiController::class, 'getNotes']);
Route::post('/api/notes', [\App\Http\Controllers\ArgomentiController::class, 'saveNote']);
Route::delete('/api/notes/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deleteNote']);

// Exam Module Public Routes
Route::get('/api/exams', [\App\Http\Controllers\ExamSheetController::class, 'getExams']);
Route::get('/api/exams/{id}', [\App\Http\Controllers\ExamSheetController::class, 'getExamDetails']);
Route::post('/api/exams/{id}/submit', [\App\Http\Controllers\ExamSheetController::class, 'submitExam']);

// Client Status & Verification Routes
Route::get('/api/client/status', [\App\Http\Controllers\DynamicContentController::class, 'getClientStatus']);
Route::post('/api/client/verify', [\App\Http\Controllers\DynamicContentController::class, 'submitVerification']);
Route::post('/api/client/activate', function (\Illuminate\Http\Request $request) {
    $sessionId = session()->getId();
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
    $client->is_active = true;
    $client->expires_at = now()->addDays($days);
    $client->save();
    return response()->json(['success' => true]);
});

// Guest Chat API Endpoints
Route::get('/api/chat/messages', function (Request $request) {
    $sessionId = session()->getId();
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
    
    $sessionId = session()->getId();
    
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
        $chapters = \App\Models\Chapter::orderBy('id', 'asc')->get();
        foreach ($chapters as $ch) {
            $ch->question_count = \App\Models\Question::where('chapter', $ch->id)->count();
            $ch->chapter = $ch->id;
            $ch->chapter_name = $ch->name;
        }
        return response()->json($chapters);
    });

    Route::get('/admin/api/questions', function (Request $request) {
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
        
        $questions = $query->orderBy('id', 'desc')->paginate(15);
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
            $client->is_active = true;
            $client->expires_at = now()->addDays($days);
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
            $messageText = "apnake license key daoa hoise,click kore active korun.thanks call 3663584525 for info\n\nPial - TMM PATENTE TEAM";
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

    // Admin Category CRUD API Endpoints
    Route::get('/admin/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('/admin/api/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'show']);
    Route::post('/admin/api/categories/store', [\App\Http\Controllers\CategoryController::class, 'store']);
    Route::post('/admin/api/categories/update/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
    Route::post('/admin/api/categories/delete/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);

    // Admin Chapters and Pages CRUD API Endpoints
    Route::get('/admin/api/chapters/list', [\App\Http\Controllers\ArgomentiController::class, 'getChaptersAdmin']);
    Route::post('/admin/api/chapters/store', [\App\Http\Controllers\ArgomentiController::class, 'createChapter']);
    Route::post('/admin/api/chapters/update/{id}', [\App\Http\Controllers\ArgomentiController::class, 'updateChapter']);
    Route::post('/admin/api/chapters/toggle-status/{id}', [\App\Http\Controllers\ArgomentiController::class, 'toggleChapterStatus']);
    Route::post('/admin/api/chapters/delete/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deleteChapter']);
    
    Route::get('/admin/api/chapters/{id}/pages', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPages']);
    Route::get('/admin/api/chapters/{id}/pages/list', [\App\Http\Controllers\ArgomentiController::class, 'getChapterPagesAdmin']);
    Route::post('/admin/api/pages/store', [\App\Http\Controllers\ArgomentiController::class, 'storePage']);
    Route::post('/admin/api/pages/update/{id}', [\App\Http\Controllers\ArgomentiController::class, 'updatePage']);
    Route::post('/admin/api/pages/toggle-status/{id}', [\App\Http\Controllers\ArgomentiController::class, 'togglePageStatus']);
    Route::post('/admin/api/pages/delete/{id}', [\App\Http\Controllers\ArgomentiController::class, 'deletePage']);
    Route::post('/admin/api/pages/{id}/assign-questions', [\App\Http\Controllers\ArgomentiController::class, 'assignQuestionsToPage']);

    // Admin Question CRUD with image support (multipart)
    Route::post('/admin/api/questions/store', function (Request $request) {
        $request->validate([
            'chapter'       => 'required|integer',
            'chapter_name'  => 'required|string',
            'page_id'       => 'nullable|integer',
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
        ]);

        $qType = $request->question_type ?? 'vero_falso';

        $data = [
            'chapter'       => $request->chapter,
            'chapter_name'  => $request->chapter_name,
            'question_type' => $qType,
            'page_id'       => $request->page_id ?? null,
            'italian'       => $request->italian,
            'bangla'        => $request->bangla,
            'is_vero'       => ($qType === 'vero_falso') ? ($request->is_vero ? 1 : 0) : 0,
            'option_a'      => $request->option_a,
            'option_b'      => $request->option_b,
            'option_c'      => $request->option_c,
            'option_d'      => $request->option_d,
            'correct_answer'=> $request->correct_answer,
            'explanation'   => $request->explanation,
        ];

        $question = \App\Models\Question::create($data);

        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $fileName = 'q_img_' . $question->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/images'), $fileName);
            $question->image = '/uploads/questions/images/' . $fileName;
            $question->save();
        }

        return response()->json($question);
    });

    Route::post('/admin/api/questions/update/{id}', function (Request $request, $id) {
        $request->validate([
            'chapter'       => 'required|integer',
            'chapter_name'  => 'required|string',
            'page_id'       => 'nullable|integer',
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
        ]);

        $question  = \App\Models\Question::findOrFail($id);
        $qType     = $request->question_type ?? $question->question_type ?? 'vero_falso';

        $question->chapter       = $request->chapter;
        $question->chapter_name  = $request->chapter_name;
        $question->page_id       = $request->page_id ?? null;
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

        if ($request->hasFile('image')) {
            if ($question->image && file_exists(public_path($question->image))) {
                @unlink(public_path($question->image));
            }
            $file     = $request->file('image');
            $fileName = 'q_img_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/questions/images'), $fileName);
            $question->image = '/uploads/questions/images/' . $fileName;
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

    // Chapters
    Route::get('/admin/api/cartello-chapters', [\App\Http\Controllers\CartelloController::class, 'getChapters']);
    Route::post('/admin/api/cartello-chapters/store', [\App\Http\Controllers\CartelloController::class, 'storeChapter']);
    Route::post('/admin/api/cartello-chapters/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updateChapter']);
    Route::post('/admin/api/cartello-chapters/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deleteChapter']);

    // Pages
    Route::get('/admin/api/cartello-pages', [\App\Http\Controllers\CartelloController::class, 'getPages']);
    Route::post('/admin/api/cartello-pages/store', [\App\Http\Controllers\CartelloController::class, 'storePage']);
    Route::post('/admin/api/cartello-pages/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updatePage']);
    Route::post('/admin/api/cartello-pages/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deletePage']);

    // MCQs
    Route::get('/admin/api/cartello-mcqs', [\App\Http\Controllers\CartelloController::class, 'getMcqs']);
    Route::post('/admin/api/cartello-mcqs/store', [\App\Http\Controllers\CartelloController::class, 'storeMcq']);
    Route::post('/admin/api/cartello-mcqs/update/{id}', [\App\Http\Controllers\CartelloController::class, 'updateMcq']);
    Route::post('/admin/api/cartello-mcqs/delete/{id}', [\App\Http\Controllers\CartelloController::class, 'deleteMcq']);
});

// Guest Categories API
Route::get('/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

// Public Cartelli (Road Signs) API
Route::get('/api/cartello-categories', [\App\Http\Controllers\CartelloController::class, 'publicGetCategories']);
Route::get('/api/cartello-categories/{categoryId}/chapters', [\App\Http\Controllers\CartelloController::class, 'publicGetChapters']);
Route::get('/api/cartello-chapters/{chapterId}/pages', [\App\Http\Controllers\CartelloController::class, 'publicGetPages']);
Route::get('/api/cartello-pages/{pageId}/mcqs', [\App\Http\Controllers\CartelloController::class, 'publicGetPageMcqs']);
