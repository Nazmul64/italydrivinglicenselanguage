<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Redirect;
use App\Models\SeoHealthLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SeoRedirectMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        $fullUri = '/' . ltrim($path, '/');

        // 1. Check for database 301/302 Redirect Rule
        try {
            $redirect = Redirect::where('is_active', true)
                ->where(function ($q) use ($path, $fullUri) {
                    $q->where('source_url', $path)
                      ->orWhere('source_url', $fullUri);
                })->first();

            if ($redirect) {
                $redirect->increment('hits');
                return redirect($redirect->destination_url, $redirect->status_code);
            }
        } catch (\Throwable $e) {
            // Silently proceed if table or database connection is temporarily inaccessible
        }

        $response = $next($request);

        // 2. Log 404 error if request failed to audit broken links in Admin SEO Dashboard
        if ($response->getStatusCode() === 404) {
            try {
                $log = SeoHealthLog::firstOrNew(['url' => $fullUri]);
                $log->referer = $request->header('referer');
                $log->user_agent = $request->header('user-agent');
                $log->ip_address = $request->ip();
                $log->hits = ($log->hits ?? 0) + 1;
                $log->save();
            } catch (\Exception $e) {
                // Ignore log exceptions to prevent breaking response
            }
        }

        return $response;
    }
}
