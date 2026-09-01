<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneDatabase extends Command
{
    protected $signature   = 'db:prune {--force : Force prune even if DB is within limit}';
    protected $description = 'Prune old logs and expired data to keep Database under 2-3MB';

    // Max rows to keep per table
    const LIMITS = [
        'api_logs'       => 30,
        'system_errors'  => 15,
        'seo_health_logs'=> 20,
    ];

    // Max DB size in MB before forced prune
    const MAX_SIZE_MB = 2.5;

    public function handle(): int
    {
        $connection = config('database.default');
        $sizeMB = 0.0;

        if ($connection === 'mysql') {
            $dbName = config('database.connections.mysql.database');
            $res = DB::select("SELECT round(SUM(data_length + index_length) / 1024 / 1024, 3) AS total_mb FROM information_schema.TABLES WHERE table_schema = ?", [$dbName]);
            $sizeMB = (float) ($res[0]->total_mb ?? 0.0);
        } else {
            $dbPath = database_path('database.sqlite');
            if (file_exists($dbPath)) {
                $sizeMB = round(filesize($dbPath) / 1024 / 1024, 2);
            }
        }

        $this->info("Current DB size: {$sizeMB} MB");

        if ($sizeMB < self::MAX_SIZE_MB && !$this->option('force')) {
            $this->info('DB is within limit (<= 2.5 MB). No pruning needed.');
            return 0;
        }

        $this->info('Pruning database logs & old session cache...');

        // 1. Trim log tables
        foreach (self::LIMITS as $table => $limit) {
            try {
                $before = DB::table($table)->count();
                if ($before > $limit) {
                    $keepIds = DB::table($table)->orderByDesc('id')->limit($limit)->pluck('id');
                    DB::table($table)->whereNotIn('id', $keepIds)->delete();
                    $deleted = $before - DB::table($table)->count();
                    $this->line("  {$table}: deleted {$deleted} old rows");
                }
            } catch (\Exception $e) {
                // Table may not exist — skip
            }
        }

        // 2. Clear expired sessions (older than 1 day)
        try {
            $deleted = DB::table('sessions')
                ->where('last_activity', '<', now()->subDays(1)->timestamp)
                ->delete();
            if ($deleted) $this->line("  sessions: deleted {$deleted} expired");
        } catch (\Exception $e) {}

        // 3. Clear expired cache entries
        try {
            DB::table('cache')->where('expiration', '<', now()->timestamp)->delete();
            DB::table('cache_locks')->where('expiration', '<', now()->timestamp)->delete();
            $this->line('  cache: cleared expired entries');
        } catch (\Exception $e) {}

        // 4. Reclaim freed space
        if ($connection === 'mysql') {
            try {
                DB::statement('OPTIMIZE TABLE api_logs, system_errors, sessions, cache');
            } catch (\Exception $e) {}
        } else {
            try {
                DB::statement('VACUUM');
            } catch (\Exception $e) {}
        }

        if ($connection === 'mysql') {
            $dbName = config('database.connections.mysql.database');
            $res = DB::select("SELECT round(SUM(data_length + index_length) / 1024 / 1024, 3) AS total_mb FROM information_schema.TABLES WHERE table_schema = ?", [$dbName]);
            $newSizeMB = (float) ($res[0]->total_mb ?? 0.0);
        } else {
            clearstatcache();
            $dbPath = database_path('database.sqlite');
            $newSizeMB = file_exists($dbPath) ? round(filesize($dbPath) / 1024 / 1024, 2) : 0;
        }

        $this->info("New DB size: {$newSizeMB} MB ✓");

        return 0;
    }
}
