<?php

$urls = [
    'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/bodymovin/data.json',
    'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/gman/data.json',
    'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json',
    'https://assets9.lottiefiles.com/packages/lf20_5tl1xxcx.json',
    'https://assets3.lottiefiles.com/packages/lf20_touohxv0.json',
];

foreach ($urls as $u) {
    $ctx = stream_context_create([
        'http' => ['timeout' => 5, 'header' => "User-Agent: Mozilla/5.0\r\n"],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
    ]);
    $data = @file_get_contents($u, false, $ctx);
    echo ($data ? "SUCCESS: " . strlen($data) . " bytes from {$u}\n" : "FAIL: {$u}\n");
}
