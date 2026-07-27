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
        $sessionId = $request->input('session_id') 
                  ?: $request->query('session_id') 
                  ?: $request->header('X-Client-Session-ID') 
                  ?: $request->header('x-client-session-id') 
                  ?: session()->getId();

        $phone = $request->input('phone') 
              ?: $request->query('phone') 
              ?: $request->header('X-Client-Phone') 
              ?: $request->header('x-client-phone') 
              ?: $request->cookie('app_client_phone') 
              ?: session('app_client_phone');

        $client = null;
        if ($phone) {
            $client = AppClient::where('phone', $phone)->first();
        }

        if (!$client && $sessionId) {
            $client = AppClient::where('session_id', $sessionId)->first();
        }

        if ($client && $client->is_active) {
            if ($client->session_id !== $sessionId) {
                $oldSessionId = $client->session_id;
                $client->session_id = $sessionId;
                $client->save();

                \App\Models\Message::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\Note::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\SavedMcq::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\UserMcqResult::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
            }
        }

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
