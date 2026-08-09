<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "CHAPTERS COUNT: " . App\Models\Chapter::count() . "\n";
    echo "PAGES COUNT: " . App\Models\Page::count() . "\n";
    echo "QUESTIONS COUNT: " . App\Models\Question::count() . "\n";
    echo "CARTELLI MCQS COUNT: " . App\Models\CartelloMcq::count() . "\n";

    $chapters = App\Models\Chapter::withCount(['pages', 'questions'])->get();
    foreach ($chapters as $c) {
        echo "Chap {$c->id}: {$c->name} | status={$c->status} | pages={$c->pages_count} | questions={$c->questions_count}\n";
    }
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine() . "\n";
}
