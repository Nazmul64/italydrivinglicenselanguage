<?php
if (!file_exists(__DIR__ . '/../public/js/vendor')) {
    mkdir(__DIR__ . '/../public/js/vendor', 0777, true);
}

$urls = [
    'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js',
    'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js',
    'https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js'
];

$content = null;
foreach ($urls as $url) {
    $ctx = stream_context_create([
        'http' => ['timeout' => 8],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
    ]);
    $data = @file_get_contents($url, false, $ctx);
    if ($data && strlen($data) > 1000) {
        $content = $data;
        echo "Successfully downloaded lottie-web from {$url} (" . strlen($data) . " bytes)\n";
        break;
    }
}

if ($content) {
    file_put_contents(__DIR__ . '/../public/js/vendor/lottie.min.js', $content);
    echo "Saved to public/js/vendor/lottie.min.js\n";
} else {
    echo "Warning: Could not fetch from CDN directly.\n";
}
