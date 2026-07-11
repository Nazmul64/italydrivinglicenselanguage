<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ApiLog;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class MonitorPerformanceAndApi
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();

        // Enable query logging if we are measuring query performance
        DB::enableQueryLog();

        $response = $next($request);

        $executionTimeMs = (microtime(true) - $startTime) * 1000;
        $memoryUsed = memory_get_usage() - $startMemory;
        $queries = DB::getQueryLog();

        // Save execution details as response headers for performance monitoring
        $response->headers->set('X-Execution-Time-Ms', round($executionTimeMs, 2));
        $response->headers->set('X-Memory-Usage-Bytes', $memoryUsed);
        $response->headers->set('X-Query-Count', count($queries));

        // API Monitor: log request if it targets API endpoints
        if ($request->is('api/*') || $request->is('admin/api/*')) {
            try {
                // Prepare safe request data
                $requestData = $request->except(['password', 'password_confirmation', 'token']);
                
                // Get clean response content
                $responseContent = '';
                if ($response instanceof \Illuminate\Http\JsonResponse) {
                    $responseContent = json_encode($response->getData(), JSON_UNESCAPED_UNICODE);
                } else {
                    $responseContent = substr($response->getContent(), 0, 2000); // Truncate html if large
                }

                ApiLog::create([
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'request_data' => json_encode($requestData, JSON_UNESCAPED_UNICODE),
                    'response_data' => $responseContent,
                    'status_code' => $response->getStatusCode(),
                    'execution_time_ms' => round($executionTimeMs, 2),
                ]);
            } catch (\Throwable $e) {
                // Log failed middleware writing quietly
                \Illuminate\Support\Facades\Log::warning('ApiLog writing failed: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
