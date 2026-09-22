<?php
if (!file_exists(__DIR__ . '/../public/js/vendor')) {
    mkdir(__DIR__ . '/../public/js/vendor', 0777, true);
}

$urls = [
    'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
    'https://cdnjs.cloudflare.com/ajax/libs/lottie-player/2.0.4/lottie-player.js',
    'https://cdn.jsdelivr.net/npm/@lottiefiles/lottie-player@latest/dist/lottie-player.js'
];

$content = null;
foreach ($urls as $url) {
    $ctx = stream_context_create([
        'http' => ['timeout' => 5],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
    ]);
    $data = @file_get_contents($url, false, $ctx);
    if ($data && strlen($data) > 1000) {
        $content = $data;
        echo "Successfully downloaded from {$url} (" . strlen($data) . " bytes)\n";
        break;
    }
}

if ($content) {
    file_put_contents(__DIR__ . '/../public/js/vendor/lottie-player.js', $content);
    echo "Saved to public/js/vendor/lottie-player.js\n";
} else {
    echo "Warning: Could not fetch from CDN directly.\n";
}
