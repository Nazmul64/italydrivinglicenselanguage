<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$card = \App\Models\HomeCard::find(1);
echo "raw: " . $card->getRawOriginal('lottie_url') . "\n";
echo "formatted: " . $card->lottie_url . "\n";
echo "media_type: " . $card->media_type . "\n";
