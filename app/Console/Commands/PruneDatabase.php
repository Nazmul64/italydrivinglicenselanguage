<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PruneDatabase extends Command
{
    protected $signature   = 'db:prune {--force : Force prune even if DB is within limit}';
    protected $description = 'Prune old logs and expired data to keep SQLite DB under 20MB';

    // Max rows to keep per table
    const LIMITS = [
        'api_logs'       => 500,
        'system_errors'  => 200,
        'seo_health_logs'=> 50,
    ];

    // Max DB size in MB before forced prune
    const MAX_SIZE_MB = 18;

    public function handle(): int
    {
        $dbPath = database_path('database.sqlite');

        if (!file_exists($dbPath)) {
            $this->info('No SQLite database found.');
            return 0;
        }

        $sizeMB = round(filesize($dbPath) / 1024 / 1024, 2);
        $this->info("Current DB size: {$sizeMB} MB");

        if ($sizeMB < self::MAX_SIZE_MB && !$this->option('force')) {
            $this->info('DB is within limit. No pruning needed.');
            return 0;
        }

        $this->info('Pruning database...');

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

        // 2. Clear expired sessions (older than 7 days)
        try {
            $deleted = DB::table('sessions')
                ->where('last_activity', '<', now()->subDays(7)->timestamp)
                ->delete();
            if ($deleted) $this->line("  sessions: deleted {$deleted} expired");
        } catch (\Exception $e) {}

        // 3. Clear expired cache entries
        try {
            DB::table('cache')->where('expiration', '<', now()->timestamp)->delete();
            DB::table('cache_locks')->where('expiration', '<', now()->timestamp)->delete();
            $this->line('  cache: cleared expired entries');
        } catch (\Exception $e) {}

        // 4. VACUUM to reclaim freed space
        $this->info('Running VACUUM...');
        DB::statement('VACUUM');

        clearstatcache();
        $newSizeMB = round(filesize($dbPath) / 1024 / 1024, 2);
        $this->info("New DB size: {$newSizeMB} MB ✓");

        return 0;
    }
}
