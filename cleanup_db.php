<?php
$db = new PDO('sqlite:database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== Database Cleanup ===\n";

// 1. Trim api_logs — keep latest 500 rows
$before = $db->query("SELECT COUNT(*) FROM api_logs")->fetchColumn();
$db->exec("DELETE FROM api_logs WHERE id NOT IN (SELECT id FROM api_logs ORDER BY id DESC LIMIT 500)");
$after = $db->query("SELECT COUNT(*) FROM api_logs")->fetchColumn();
echo "api_logs:     $before → $after rows (deleted " . ($before - $after) . ")\n";

// 2. Trim system_errors — keep latest 200 rows
$before = $db->query("SELECT COUNT(*) FROM system_errors")->fetchColumn();
$db->exec("DELETE FROM system_errors WHERE id NOT IN (SELECT id FROM system_errors ORDER BY id DESC LIMIT 200)");
$after = $db->query("SELECT COUNT(*) FROM system_errors")->fetchColumn();
echo "system_errors: $before → $after rows (deleted " . ($before - $after) . ")\n";

// 3. Clear expired sessions
$db->exec("DELETE FROM sessions WHERE last_activity < " . (time() - 86400 * 7));
echo "sessions:     cleared expired (older than 7 days)\n";

// 4. Clear expired cache
$db->exec("DELETE FROM cache WHERE expiration < " . time());
$db->exec("DELETE FROM cache_locks WHERE expiration < " . time());
echo "cache:        cleared expired entries\n";

// 5. Clear old seo_health_logs — keep latest 50
if ($db->query("SELECT COUNT(*) FROM seo_health_logs")->fetchColumn() > 50) {
    $db->exec("DELETE FROM seo_health_logs WHERE id NOT IN (SELECT id FROM seo_health_logs ORDER BY id DESC LIMIT 50)");
    echo "seo_health_logs: trimmed to 50 rows\n";
}

// 6. VACUUM to reclaim space
echo "\nRunning VACUUM...\n";
$db->exec("VACUUM");

// 7. Show new size
$pageCount = $db->query("PRAGMA page_count")->fetchColumn();
$pageSize  = $db->query("PRAGMA page_size")->fetchColumn();
$newSizeMB = round($pageCount * $pageSize / 1024 / 1024, 2);
echo "New DB size:  {$newSizeMB} MB\n";
echo "Done!\n";
