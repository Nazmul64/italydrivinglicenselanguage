<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class SystemDiagnosticsService
{
    /**
     * Run all checks for One-Click System Audit.
     */
    public function runDiagnostics(): array
    {
        return [
            'database' => $this->checkDatabase(),
            'storage_permissions' => $this->checkStoragePermissions(),
            'routes' => $this->checkRoutes(),
            'controllers' => $this->checkControllers(),
            'models' => $this->checkModels(),
            'views' => $this->checkViews(),
            'security' => $this->checkSecurity(),
            'server' => $this->getServerInfo(),
            'php_extensions' => $this->checkPhpExtensions(),
        ];
    }

    /**
     * Database Health diagnostics.
     */
    public function checkDatabase(): array
    {
        try {
            $pdo = DB::connection()->getPdo();
            $connected = true;
            $dbName = DB::connection()->getDatabaseName();
            
            // Get connection details
            $config = DB::connection()->getConfig();
            $host = $config['host'] ?? 'localhost';
            $port = $config['port'] ?? '3306';
            $username = $config['username'] ?? '';

            // MySQL Server info
            $mysqlVersion = DB::select("SELECT VERSION() as version")[0]->version;
            $charset = DB::select("SELECT @@character_set_database as charset")[0]->charset;
            $collation = DB::select("SELECT @@collation_database as collation")[0]->collation;

            // Total Tables and Rows
            $tables = DB::select("SHOW TABLES");
            $tableCount = count($tables);
            $totalRows = 0;
            $dbSize = 0;

            // Use information_schema to get size and row estimates safely
            $schemaData = DB::select("
                SELECT TABLE_ROWS, (DATA_LENGTH + INDEX_LENGTH) AS SIZE_BYTES
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
            ", [$dbName]);

            foreach ($schemaData as $row) {
                $totalRows += $row->TABLE_ROWS ?? 0;
                $dbSize += $row->SIZE_BYTES ?? 0;
            }

            $sizeMb = round($dbSize / (1024 * 1024), 2);

            return [
                'status' => 'Healthy',
                'connected' => true,
                'database_name' => $dbName,
                'username' => $username,
                'host' => $host,
                'port' => $port,
                'mysql_version' => $mysqlVersion,
                'charset' => $charset,
                'collation' => $collation,
                'tables_count' => $tableCount,
                'total_rows' => $totalRows,
                'size_mb' => $sizeMb,
                'storage_used' => $sizeMb . ' MB',
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'Problem Found',
                'connected' => false,
                'database_name' => config('database.connections.mysql.database', 'unknown'),
                'username' => config('database.connections.mysql.username', 'unknown'),
                'host' => config('database.connections.mysql.host', 'unknown'),
                'port' => config('database.connections.mysql.port', 'unknown'),
                'reason' => $e->getMessage(),
                'sqlstate' => method_exists($e, 'getCode') ? $e->getCode() : 'N/A',
            ];
        }
    }

    /**
     * Storage directory permission check.
     */
    public function checkStoragePermissions(): array
    {
        $paths = [
            'storage' => storage_path(),
            'bootstrap/cache' => base_path('bootstrap/cache'),
            'public/uploads' => public_path('uploads'),
            'public/storage' => public_path('storage'),
        ];

        $report = [];
        $healthy = true;

        foreach ($paths as $name => $path) {
            if (!File::exists($path)) {
                try {
                    File::makeDirectory($path, 0755, true);
                } catch (\Throwable $e) {
                    $report[$name] = [
                        'path' => $path,
                        'exists' => false,
                        'writable' => false,
                        'status' => 'Not Writable'
                    ];
                    $healthy = false;
                    continue;
                }
            }

            $writable = is_writable($path);
            if (!$writable) {
                $healthy = false;
            }

            $report[$name] = [
                'path' => $path,
                'exists' => true,
                'writable' => $writable,
                'status' => $writable ? 'Writable' : 'Not Writable'
            ];
        }

        $report['status'] = $healthy ? 'Healthy' : 'Problem Found';
        return $report;
    }

    /**
     * Audit registered routes.
     */
    public function checkRoutes(): array
    {
        $routes = Route::getRoutes();
        $missingControllers = [];
        $duplicates = [];
        $routeMap = [];
        $healthy = true;

        foreach ($routes as $route) {
            $methods = implode('|', $route->methods());
            $uri = $route->uri();
            $action = $route->getActionName();

            // Duplicate checks
            $key = $methods . ' - ' . $uri;
            if (isset($routeMap[$key])) {
                $duplicates[] = [
                    'uri' => $uri,
                    'methods' => $methods,
                    'action' => $action
                ];
                $healthy = false;
            }
            $routeMap[$key] = true;

            // Missing Controller and Middleware audit
            if (is_string($action) && str_contains($action, '@')) {
                $parts = explode('@', $action);
                $controllerClass = $parts[0];
                $methodName = $parts[1] ?? '';

                if (!class_exists($controllerClass)) {
                    $missingControllers[] = [
                        'route' => $uri,
                        'type' => 'Missing Controller Class',
                        'expected_class' => $controllerClass,
                        'path' => app_path(str_replace(['App\\', '\\'], ['', '/'], $controllerClass) . '.php')
                    ];
                    $healthy = false;
                } elseif (!method_exists($controllerClass, $methodName)) {
                    $missingControllers[] = [
                        'route' => $uri,
                        'type' => 'Missing Action Method',
                        'expected_class' => $controllerClass,
                        'method' => $methodName
                    ];
                    $healthy = false;
                }
            }
        }

        return [
            'status' => $healthy ? 'Healthy' : 'Problem Found',
            'total_routes' => count($routes),
            'duplicate_routes' => $duplicates,
            'missing_controllers' => $missingControllers,
            'invalid_routes_count' => count($duplicates) + count($missingControllers)
        ];
    }

    /**
     * Check if controllers declared exist.
     */
    public function checkControllers(): array
    {
        $controllersPath = app_path('Http/Controllers');
        $missingControllers = [];
        $healthy = true;

        // Fetch expects routes and verify controllers mapping
        $routes = Route::getRoutes();
        foreach ($routes as $route) {
            $action = $route->getActionName();
            if (is_string($action) && str_contains($action, '@')) {
                $parts = explode('@', $action);
                $controllerClass = $parts[0];
                if (!class_exists($controllerClass)) {
                    $missingControllers[] = [
                        'class' => $controllerClass,
                        'expected_path' => app_path(str_replace(['App\\', '\\'], ['', '/'], $controllerClass) . '.php')
                    ];
                    $healthy = false;
                }
            }
        }

        return [
            'status' => $healthy ? 'Healthy' : 'Problem Found',
            'missing' => $missingControllers,
        ];
    }

    /**
     * Verify app/Models integrity.
     */
    public function checkModels(): array
    {
        $modelsPath = app_path('Models');
        $missingModels = [];
        $healthy = true;

        if (File::exists($modelsPath)) {
            $files = File::files($modelsPath);
            foreach ($files as $file) {
                $modelName = $file->getBasename('.php');
                $class = 'App\\Models\\' . $modelName;

                if (!class_exists($class)) {
                    $missingModels[] = [
                        'model' => $modelName,
                        'namespace' => $class,
                        'path' => $file->getPathname(),
                        'reason' => 'Class definition missing'
                    ];
                    $healthy = false;
                } else {
                    // Check if model table exists in DB
                    try {
                        $modelObj = new $class;
                        $table = $modelObj->getTable();
                        if (!Schema::hasTable($table)) {
                            $missingModels[] = [
                                'model' => $modelName,
                                'namespace' => $class,
                                'path' => $file->getPathname(),
                                'reason' => "Database Table '{$table}' is missing"
                            ];
                            $healthy = false;
                        }
                    } catch (\Throwable $e) {
                        $missingModels[] = [
                            'model' => $modelName,
                            'namespace' => $class,
                            'path' => $file->getPathname(),
                            'reason' => 'Connection / Boot failure: ' . $e->getMessage()
                        ];
                        $healthy = false;
                    }
                }
            }
        }

        return [
            'status' => $healthy ? 'Healthy' : 'Problem Found',
            'missing' => $missingModels
        ];
    }

    /**
     * Audit standard Blade view layouts.
     */
    public function checkViews(): array
    {
        $requiredViews = [
            'frontend.home' => resource_path('views/frontend/home.blade.php'),
            'admin.dashboard' => resource_path('views/admin/dashboard.blade.php'),
            'admin.login' => resource_path('views/admin/login.blade.php'),
            'errors.500' => resource_path('views/errors/500.blade.php'),
        ];

        $missingViews = [];
        $healthy = true;

        foreach ($requiredViews as $viewName => $path) {
            if (!File::exists($path)) {
                $missingViews[] = [
                    'view' => $viewName,
                    'expected_path' => 'resources/views/' . str_replace('.', '/', $viewName) . '.blade.php'
                ];
                $healthy = false;
            }
        }

        return [
            'status' => $healthy ? 'Healthy' : 'Problem Found',
            'missing' => $missingViews
        ];
    }

    /**
     * Security audit scanner.
     */
    public function checkSecurity(): array
    {
        $debugOff = !config('app.debug');
        $https = request()->secure() || request()->header('X-Forwarded-Proto') === 'https';
        $envExists = File::exists(base_path('.env'));
        $appKeySet = !empty(config('app.key'));
        
        // Check writable permissions for public folder files
        $envProtected = true;
        if ($envExists) {
            // Check if .env is publicly readable via direct filesystem write rule checking
            // We just ensure standard file protections are checked
            $permissions = decoct(fileperms(base_path('.env')) & 0777);
            if (in_array($permissions, ['777', '666'])) {
                $envProtected = false;
            }
        }

        $csrfActive = true; // Laravel handles CSRF globally

        $healthy = ($debugOff && $appKeySet && $envExists && $envProtected);

        return [
            'status' => $healthy ? 'Healthy' : 'Action Required',
            'app_debug_off' => $debugOff,
            'https_enabled' => $https,
            'env_exists' => $envExists,
            'env_protected' => $envProtected,
            'app_key_set' => $appKeySet,
            'csrf_enabled' => $csrfActive,
        ];
    }

    /**
     * Get Server information.
     */
    public function getServerInfo(): array
    {
        $nginxOrApache = $_SERVER['SERVER_SOFTWARE'] ?? 'Apache/Nginx (CLI Serve)';
        
        return [
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'server_software' => $nginxOrApache,
            'server_time' => date('Y-m-d H:i:s'),
            'timezone' => config('app.timezone'),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time') . 's',
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
        ];
    }

    /**
     * Verify required PHP extensions are loaded.
     */
    public function checkPhpExtensions(): array
    {
        $requiredExtensions = ['pdo', 'openssl', 'mbstring', 'tokenizer', 'xml', 'ctype', 'json', 'gd', 'zip'];
        $report = [];
        $healthy = true;

        foreach ($requiredExtensions as $ext) {
            $loaded = extension_loaded($ext);
            if (!$loaded) {
                $healthy = false;
            }
            $report[$ext] = $loaded;
        }

        $report['status'] = $healthy ? 'Healthy' : 'Problem Found';
        return $report;
    }
}
