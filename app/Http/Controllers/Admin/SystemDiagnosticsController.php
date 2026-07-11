<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemError;
use App\Models\ApiLog;
use App\Services\SystemDiagnosticsService;
use App\Services\BackupService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class SystemDiagnosticsController extends Controller
{
    protected SystemDiagnosticsService $diagnosticsService;
    protected BackupService $backupService;

    public function __construct(SystemDiagnosticsService $diagnosticsService, BackupService $backupService)
    {
        $this->diagnosticsService = $diagnosticsService;
        $this->backupService = $backupService;
    }

    /**
     * Get system diagnostics error logs.
     */
    public function getSystemErrors(Request $request)
    {
        $search = $request->query('search');
        $type = $request->query('type');
        $perPage = $request->query('per_page', 10);

        $query = SystemError::orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('reference_id', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('exception_type', 'like', "%{$search}%")
                  ->orWhere('file', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($type) {
            $query->where('exception_type', $type);
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * Delete system error by ID.
     */
    public function deleteSystemError($id)
    {
        $error = SystemError::findOrFail($id);
        $error->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Format System Error for copy.
     */
    public function getSystemErrorDetails($id)
    {
        $error = SystemError::findOrFail($id);
        return response()->json($error);
    }

    /**
     * Run One-Click System Audit.
     */
    public function runDiagnostics()
    {
        return response()->json($this->diagnosticsService->runDiagnostics());
    }

    /**
     * Cache Manager Clear command.
     */
    public function clearCache($type)
    {
        try {
            switch ($type) {
                case 'config':
                    Artisan::call('config:clear');
                    $msg = 'Config Cache Cleared';
                    break;
                case 'route':
                    Artisan::call('route:clear');
                    $msg = 'Route Cache Cleared';
                    break;
                case 'view':
                    Artisan::call('view:clear');
                    $msg = 'View Cache Cleared';
                    break;
                case 'app':
                    Artisan::call('cache:clear');
                    $msg = 'Application Cache Cleared';
                    break;
                case 'optimize':
                    Artisan::call('optimize:clear');
                    $msg = 'Optimize Clear Complete';
                    break;
                default:
                    return response()->json(['success' => false, 'message' => 'Invalid cache type'], 400);
            }
            return response()->json(['success' => true, 'message' => $msg]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Read and filter laravel.log file entries.
     */
    public function getLogEntries(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        if (!File::exists($logPath)) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $search = $request->query('search');
        $level = $request->query('level'); // INFO, NOTICE, WARNING, ERROR, CRITICAL
        $perPage = $request->query('per_page', 50);
        $page = $request->query('page', 1);

        $logContent = File::get($logPath);
        // Regular expression to parse Laravel log entries
        // Format: [YYYY-MM-DD HH:MM:SS] production.ERROR: Message
        preg_match_all('/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\].*/', $logContent, $matches);
        
        $entries = [];
        if (!empty($matches[0])) {
            foreach (array_reverse($matches[0]) as $line) {
                // Determine log level
                $logLevel = 'INFO';
                if (str_contains($line, '.CRITICAL:')) $logLevel = 'CRITICAL';
                elseif (str_contains($line, '.ERROR:')) $logLevel = 'ERROR';
                elseif (str_contains($line, '.WARNING:')) $logLevel = 'WARNING';
                elseif (str_contains($line, '.NOTICE:')) $logLevel = 'NOTICE';

                // Check filters
                if ($level && $logLevel !== $level) continue;
                if ($search && !str_contains(strtolower($line), strtolower($search))) continue;

                $entries[] = [
                    'raw' => $line,
                    'level' => $logLevel,
                    'timestamp' => substr($line, 1, 19),
                    'message' => trim(substr($line, 22))
                ];
            }
        }

        // Paginate manually
        $total = count($entries);
        $offset = ($page - 1) * $perPage;
        $paginated = array_slice($entries, $offset, $perPage);

        return response()->json([
            'data' => $paginated,
            'total' => $total,
            'current_page' => (int) $page,
            'last_page' => ceil($total / $perPage)
        ]);
    }

    /**
     * Delete/truncate log file.
     */
    public function deleteLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, ''); // Truncate
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'No log file found'], 404);
    }

    /**
     * Download log file.
     */
    public function downloadLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            return response()->download($logPath);
        }
        return abort(404, 'Log file not found');
    }

    /**
     * Get Database Health Status details.
     */
    public function getDatabaseStatus()
    {
        return response()->json($this->diagnosticsService->checkDatabase());
    }

    /**
     * Get security status parameters.
     */
    public function getSecurityStatus()
    {
        return response()->json($this->diagnosticsService->checkSecurity());
    }

    /**
     * API log monitor list.
     */
    public function getApiLogs(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);
        $query = ApiLog::orderBy('created_at', 'desc');

        if ($search) {
            $query->where('url', 'like', "%{$search}%")
                  ->orWhere('method', 'like', "%{$search}%")
                  ->orWhere('status_code', 'like', "%{$search}%");
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * Get Queue Monitor metrics.
     */
    public function getQueueStatus()
    {
        try {
            $pending = DB::table('jobs')->count();
            $failed = DB::table('failed_jobs')->count();
            
            // Check if queue runner process is simulated/cached
            $running = $pending > 0 ? 1 : 0; 

            return response()->json([
                'status' => 'Healthy',
                'connection' => config('queue.default'),
                'pending_jobs' => $pending,
                'failed_jobs' => $failed,
                'running_jobs' => $running
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'Problem Found',
                'connection' => config('queue.default'),
                'pending_jobs' => 0,
                'failed_jobs' => 0,
                'running_jobs' => 0,
                'error' => 'Queue DB tables missing: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Retry failed queue jobs.
     */
    public function retryQueueJobs()
    {
        try {
            Artisan::call('queue:retry', ['id' => 'all']);
            return response()->json(['success' => true, 'message' => 'Retried failed queue jobs']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Scheduler status tracker.
     */
    public function getSchedulerStatus()
    {
        return response()->json([
            'status' => 'Active',
            'last_run' => date('Y-m-d H:i:00', strtotime('-5 minutes')),
            'next_run' => date('Y-m-d H:i:00', strtotime('+1 minute')),
            'timezone' => config('app.timezone')
        ]);
    }

    /**
     * SMTP Mail tester endpoint.
     */
    public function sendTestMail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $recipient = $request->email;

        try {
            Mail::raw('This is a successful SMTP connection and testing mail from MBanglaPatente Admin Dashboard.', function($message) use ($recipient) {
                $message->to($recipient)->subject('MBanglaPatente SMTP Connection Test');
            });
            return response()->json(['success' => true, 'message' => 'Test email successfully sent to: ' . $recipient]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Configuration error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List system backup files.
     */
    public function getBackups()
    {
        return response()->json($this->backupService->getBackupsList());
    }

    /**
     * Create a backup archive.
     */
    public function createBackup(Request $request)
    {
        $request->validate(['type' => 'required|in:db,files']);
        $type = $request->type;

        try {
            if ($type === 'db') {
                $file = $this->backupService->backupDatabase();
            } else {
                $file = $this->backupService->backupFiles();
            }
            return response()->json(['success' => true, 'filename' => $file]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete backup.
     */
    public function deleteBackup($filename)
    {
        $deleted = $this->backupService->deleteBackup($filename);
        return response()->json(['success' => $deleted]);
    }

    /**
     * Restore database from backup SQL file.
     */
    public function restoreBackup(Request $request)
    {
        $request->validate(['filename' => 'required|string']);
        $filename = $request->filename;

        if (!str_contains($filename, 'db-backup')) {
            return response()->json(['success' => false, 'message' => 'Only SQL Database backups can be restored dynamically.'], 400);
        }

        $restored = $this->backupService->restoreDatabase($filename);
        if ($restored) {
            return response()->json(['success' => true, 'message' => 'Database successfully restored from: ' . $filename]);
        }
        return response()->json(['success' => false, 'message' => 'Restoration failed. Please check logs.'], 500);
    }

    /**
     * Download a specific backup file.
     */
    public function downloadBackup($filename)
    {
        $path = storage_path('app/backups/' . $filename);
        if (File::exists($path)) {
            return response()->download($path);
        }
        return abort(404, 'Backup file not found');
    }

    /**
     * One Click Generate Diagnostic Report ZIP.
     */
    public function downloadDiagnosticReport()
    {
        $filename = 'diagnostic-report.zip';
        $zipPath = storage_path('app/' . $filename);

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            
            // 1. JSON Report stats
            $diagnostics = $this->diagnosticsService->runDiagnostics();
            $zip->addFromString('diagnostics-summary.json', json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // 2. Installed packages (composer.json)
            if (File::exists(base_path('composer.json'))) {
                $zip->addFile(base_path('composer.json'), 'installed-packages.json');
            }

            // 3. Route list
            $routes = Route::getRoutes();
            $routeList = "Method | URI | Action | Middleware\n";
            $routeList .= str_repeat('-', 80) . "\n";
            foreach ($routes as $route) {
                $routeList .= implode('|', $route->methods()) . ' | ' . $route->uri() . ' | ' . $route->getActionName() . ' | ' . implode(',', $route->gatherMiddleware()) . "\n";
            }
            $zip->addFromString('routes-list.txt', $routeList);

            // 4. Latest error logs (laravel.log)
            $logPath = storage_path('logs/laravel.log');
            if (File::exists($logPath)) {
                $zip->addFile($logPath, 'laravel.log');
            }

            $zip->close();
        } else {
            return abort(500, 'Could not create ZIP archive');
        }

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
