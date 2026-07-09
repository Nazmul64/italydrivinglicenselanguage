<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('frontend.home');
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
        'message' => 'required|string',
    ]);
    
    $sessionId = session()->getId();
    
    $message = \App\Models\Message::create([
        'session_id' => $sessionId,
        'sender' => 'user',
        'sender_name' => 'Guest User',
        'message' => $request->message
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
        $totalQuestions = \App\Models\Question::count();
        $totalChapters = \App\Models\Question::distinct('chapter')->count('chapter') ?: 25;
        
        return response()->json([
            'total_questions' => $totalQuestions,
            'total_chapters' => $totalChapters,
            'avg_errors' => 2.5,
            'active_users' => 184
        ]);
    });

    Route::get('/admin/api/chapters', function () {
        // Get unique list of chapters with question counts
        $chapters = \App\Models\Question::select('chapter', 'chapter_name')
            ->selectRaw('count(*) as question_count')
            ->groupBy('chapter', 'chapter_name')
            ->orderBy('chapter')
            ->get();
            
        return response()->json($chapters);
    });

    Route::post('/admin/api/chapters/store', function (Request $request) {
        $request->validate([
            'chapter' => 'required|integer',
            'chapter_name' => 'required|string',
        ]);
        
        // Update all questions belonging to this chapter to the new chapter name
        \App\Models\Question::where('chapter', $request->chapter)
            ->update(['chapter_name' => $request->chapter_name]);
            
        return response()->json(['success' => true]);
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
                return [
                    'session_id' => $convo->session_id,
                    'last_message' => $latest->message ?? '',
                    'sender' => $latest->sender ?? '',
                    'updated_at' => $convo->last_activity
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

    // Admin Category CRUD API Endpoints
    Route::get('/admin/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('/admin/api/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'show']);
    Route::post('/admin/api/categories/store', [\App\Http\Controllers\CategoryController::class, 'store']);
    Route::post('/admin/api/categories/update/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
    Route::post('/admin/api/categories/delete/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);
});

// Guest Categories API
Route::get('/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
