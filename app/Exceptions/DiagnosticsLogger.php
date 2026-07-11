<?php

namespace App\Exceptions;

use Throwable;
use App\Models\SystemError;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class DiagnosticsLogger
{
    private static array $loggedExceptions = [];

    /**
     * Log the given exception to the database and standard logs.
     */
    public static function log(Throwable $e): string
    {
        $hash = spl_object_hash($e);
        if (isset(self::$loggedExceptions[$hash])) {
            return self::$loggedExceptions[$hash];
        }
        $referenceId = 'ERR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        $request = request();
        
        // Extract Route and Controller details
        $route = $request->route();
        $routeName = $route ? $route->getName() : null;
        $controller = null;
        $action = null;
        $middleware = null;

        if ($route) {
            $action = $route->getActionName();
            if (is_string($action) && str_contains($action, '@')) {
                $parts = explode('@', $action);
                $controller = $parts[0];
                $function = $parts[1] ?? null;
            } else {
                $function = is_object($action) ? 'Closure' : (string) $action;
            }
            $middleware = $route->gatherMiddleware();
        } else {
            $function = null;
        }

        // Detect Browser and OS from user agent
        $userAgent = $request->header('User-Agent', '');
        $os = self::parseOs($userAgent);
        $browser = self::parseBrowser($userAgent);

        // SQL Query Exception extra info
        $sqlError = null;
        if ($e instanceof QueryException) {
            $sqlError = [
                'connection' => $e->getConnectionName(),
                'database' => config('database.connections.' . $e->getConnectionName() . '.database', 'unknown'),
                'username' => config('database.connections.' . $e->getConnectionName() . '.username', 'unknown'),
                'host' => config('database.connections.' . $e->getConnectionName() . '.host', 'unknown'),
                'port' => config('database.connections.' . $e->getConnectionName() . '.port', 'unknown'),
                'sqlstate' => $e->errorInfo[0] ?? $e->getCode(),
                'reason' => $e->getMessage(),
                'query' => $e->getSql(),
                'bindings' => $e->getBindings(),
            ];
        }

        // User info
        $userId = Auth::id();
        $userName = Auth::user() ? Auth::user()->name : null;

        try {
            // Log to system_errors table
            SystemError::create([
                'reference_id' => $referenceId,
                'message' => $e->getMessage(),
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'function' => $function,
                'controller' => $controller,
                'route' => $routeName,
                'middleware' => $middleware,
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'status_code' => self::getStatusCode($e),
                'stack_trace' => $e->getTraceAsString(),
                'sql_error' => $sqlError,
                'user_id' => $userId,
                'user_name' => $userName,
                'ip_address' => $request->ip(),
                'browser' => $browser,
                'os' => $os,
            ]);

            // Try critical notifications
            if (self::getStatusCode($e) >= 500) {
                self::sendCriticalNotification($referenceId, $e);
            }
        } catch (Throwable $dbEx) {
            // Fallback if DB write fails
            Log::error('DiagnosticsLogger failed saving to DB: ' . $dbEx->getMessage());
        }

        // Standard Laravel log backup
        Log::error(sprintf(
            '[%s] Exception: %s in %s:%d. Message: %s',
            $referenceId,
            get_class($e),
            $e->getFile(),
            $e->getLine(),
            $e->getMessage()
        ));

        self::$loggedExceptions[$hash] = $referenceId;
        return $referenceId;
    }

    /**
     * Parse OS from user agent.
     */
    private static function parseOs(string $userAgent): string
    {
        if (preg_match('/windows|win32/i', $userAgent)) return 'Windows';
        if (preg_match('/macintosh|mac os x/i', $userAgent)) return 'macOS';
        if (preg_match('/linux/i', $userAgent)) return 'Linux';
        if (preg_match('/android/i', $userAgent)) return 'Android';
        if (preg_match('/iphone|ipad|ipod/i', $userAgent)) return 'iOS';
        return 'Unknown';
    }

    /**
     * Parse Browser from user agent.
     */
    private static function parseBrowser(string $userAgent): string
    {
        if (preg_match('/chrome/i', $userAgent)) return 'Chrome';
        if (preg_match('/firefox/i', $userAgent)) return 'Firefox';
        if (preg_match('/safari/i', $userAgent)) return 'Safari';
        if (preg_match('/msie|trident/i', $userAgent)) return 'Internet Explorer';
        if (preg_match('/edge/i', $userAgent)) return 'Edge';
        return 'Unknown';
    }

    /**
     * Get HTTP status code corresponding to exception.
     */
    public static function getStatusCode(Throwable $e): int
    {
        if (method_exists($e, 'getStatusCode')) {
            return $e->getStatusCode();
        }
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
            return $e->getStatusCode();
        }
        if ($e instanceof \Illuminate\Validation\ValidationException) {
            return 422;
        }
        if ($e instanceof \Illuminate\Auth\AuthenticationException) {
            return 401;
        }
        if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
            return 403;
        }
        if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return 404;
        }
        
        $code = $e->getCode();
        return ($code >= 400 && $code < 600) ? $code : 500;
    }

    /**
     * Send email, slack or telegram notification for critical errors.
     */
    public static function sendCriticalNotification(string $refId, Throwable $e): void
    {
        // Placed for extensibility.
        // We will log to storage log that notification channel was triggered.
        Log::info("Critical error notification triggered for {$refId} to Email, Telegram, and Slack.");
    }
}
