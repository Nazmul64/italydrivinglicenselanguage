<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HomeCard;

$cards = HomeCard::orderBy('order_index')->get();
foreach ($cards as $c) {
    echo "ID: {$c->id} | Key: {$c->screen_key} | Title: {$c->title} | Media: {$c->media_type} | Img: {$c->image_url}\n";
}
