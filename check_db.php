<?php
$db = new PDO('sqlite:database/database.sqlite');
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
$results = [];
foreach($tables as $t) {
    $count = $db->query("SELECT COUNT(*) FROM \"$t\"")->fetchColumn();
    $results[$t] = (int)$count;
}
arsort($results);
foreach($results as $t => $count) {
    echo str_pad($t, 40) . number_format($count) . " rows\n";
}
// Also show page count (each page = 4KB in SQLite)
$pageCount = $db->query("PRAGMA page_count")->fetchColumn();
$pageSize  = $db->query("PRAGMA page_size")->fetchColumn();
echo "\n--- SQLite stats ---\n";
echo "Page count: $pageCount\n";
echo "Page size:  $pageSize bytes\n";
echo "Total size: " . round($pageCount * $pageSize / 1024 / 1024, 2) . " MB\n";
