<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'admin/api/*',
            'api/*',
        ]);
        $middleware->append(\App\Http\Middleware\MonitorPerformanceAndApi::class);
        $middleware->append(\App\Http\Middleware\SeoRedirectMiddleware::class);
        $middleware->append(\App\Http\Middleware\WebQrGate::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle CSRF TokenMismatchException gracefully for API & Admin requests
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson() || $request->is('api/*') || $request->is('admin/api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'CSRF token or session expired. Please refresh the page.',
                    'csrf_expired' => true
                ], 419);
            }
        });

        // Log all exceptions to system_errors table
        $exceptions->report(function (\Throwable $e) {
            \App\Exceptions\DiagnosticsLogger::log($e);
        });

        // Custom renderer when app.debug is false
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                if ($request->expectsJson() || $request->is('api/*') || $request->is('admin/api/*')) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors' => $e->errors(),
                    ], 422);
                }
                return null; // Let Laravel handle validation exceptions normally
            }

            $refId = \App\Exceptions\DiagnosticsLogger::log($e);

            if ($request->expectsJson() || $request->is('api/*') || $request->is('admin/api/*')) {
                return response()->json([
                    'message' => 'Oops! Something went wrong.',
                    'reference_id' => $refId
                ], \App\Exceptions\DiagnosticsLogger::getStatusCode($e));
            }

            if (!config('app.debug')) {
                return response()->view('errors.500', [
                    'exception' => $e,
                    'reference_id' => $refId,
                    'status_code' => \App\Exceptions\DiagnosticsLogger::getStatusCode($e),
                ], 500);
            }

            return null;
        });
    })->create();
