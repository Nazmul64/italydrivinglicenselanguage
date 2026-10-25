<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ExamSheet;
use App\Models\Question;
use App\Helpers\ImageHelper;

$count = ExamSheet::count();
if ($count === 0) {
    $questions = Question::inRandomOrder()->limit(30)->get();
    $candidates = [
        ['name' => 'MD. Nazmul Hassan', 'city' => 'Motorizzazione di Roma', 'c' => 29, 'w' => 1, 'date' => '24/10/2026'],
        ['name' => 'Farhana Akter', 'city' => 'Motorizzazione di Milano', 'c' => 28, 'w' => 2, 'date' => '23/10/2026'],
        ['name' => 'Rashidul Islam', 'city' => 'Motorizzazione di Bologna', 'c' => 30, 'w' => 0, 'date' => '22/10/2026'],
        ['name' => 'Tanvir Ahmed', 'city' => 'Motorizzazione di Napoli', 'c' => 27, 'w' => 3, 'date' => '21/10/2026'],
    ];

    foreach ($candidates as $cand) {
        $qs = [];
        foreach ($questions as $idx => $q) {
            $isCorrect = $idx < $cand['c'];
            $isVero = ($q->is_vero == 1 || $q->is_vero === true || $q->is_vero == '1' || strtolower((string)$q->correct_answer) === 'vero');
            $userAns = $isCorrect ? ($isVero ? 'V' : 'F') : ($isVero ? 'F' : 'V');
            $qs[] = [
                'id' => $q->id,
                'type' => 'argomenti',
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'is_vero' => $isVero,
                'user_answer' => $userAns,
                'is_correct' => $isCorrect,
                'image' => !empty($q->image) ? ImageHelper::formatImageUrl($q->image) : null,
                'audio' => $q->audio,
                'video' => $q->video,
                'vocabulary' => $q->vocabulary ?? []
            ];
        }
        ExamSheet::create([
            'student_name' => $cand['name'],
            'avatar' => null,
            'motorizzazione' => $cand['city'],
            'exam_date' => $cand['date'],
            'status' => 'completed',
            'is_passed' => true,
            'correct_count' => $cand['c'],
            'wrong_count' => $cand['w'],
            'unanswered_count' => 30 - ($cand['c'] + $cand['w']),
            'total_count' => 30,
            'answers' => $qs,
        ]);
    }
    echo "Seeded " . count($candidates) . " passed exams successfully!\n";
} else {
    echo "ExamSheet already has $count records.\n";
}
