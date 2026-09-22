<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HomeCard;

$cards = HomeCard::where('status', 1)->orderBy('order_index')->get();
echo "Total cards: " . $cards->count() . "\n";
foreach ($cards as $c) {
    echo "ID: {$c->id} | Key: {$c->screen_key} | Media: {$c->media_type} | Lottie: {$c->lottie_url}\n";
}
