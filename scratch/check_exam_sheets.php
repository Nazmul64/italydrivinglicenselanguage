<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sheets = App\Models\ExamSheet::all();
echo "Exam Sheets Count: " . $sheets->count() . "\n";
foreach ($sheets as $s) {
    echo "ID: {$s->id} | Name: {$s->student_name} | Moto: {$s->motorizzazione} | Date: {$s->exam_date} | Correct: {$s->correct_count}/{$s->total_count}\n";
}
