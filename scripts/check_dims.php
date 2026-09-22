<?php
$files = glob(__DIR__ . '/../public/uploads/cards/*.webp');
foreach ($files as $f) {
    $info = getimagesize($f);
    echo basename($f) . ": " . ($info ? "{$info[0]}x{$info[1]} ({$info['mime']})" : "unknown") . "\n";
}
