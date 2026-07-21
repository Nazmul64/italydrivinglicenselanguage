<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppClient;

class EnsureLicenseIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionId = $request->input('session_id') ?: $request->query('session_id') ?: session()->getId();
        $client = AppClient::where('session_id', $sessionId)->first();

        // If license has expired, deactivate it first
        if ($client && $client->is_active && $client->expires_at && now()->gt($client->expires_at)) {
            $client->is_active = false;
            $client->save();
        }

        if (!$client || !$client->is_active) {
            return response()->json(['error' => 'License inactive'], 403);
        }

        return $next($request);
    }
}
