<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class WebQrGate
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Exclude Admin, API, QR unlock, asset and system routes
        if (
            $request->is('admin*') ||
            $request->is('api/*') ||
            $request->is('qr-unlock') ||
            $request->is('qr-check-session') ||
            $request->is('qr-logout-session') ||
            $request->is('sitemap*') ||
            $request->is('robots.txt') ||
            $request->is('feeds/*') ||
            $request->is('uploads/*') ||
            $request->is('assets/*')
        ) {
            return $next($request);
        }

        try {
            $setting = Setting::first();
        } catch (\Throwable $e) {
            $setting = null;
        }
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        $sessionId        = session()->getId();
        $cookieSessionId  = $request->cookie('qr_session_id');
        $cookieAppPhone   = $request->cookie('app_client_phone');
        $cookieAppSession = $request->cookie('app_client_session_id');

        $isUnlocked = session('qr_unlocked') === true
            || Cache::get('qr_unlocked_' . $sessionId) === true
            || ($cookieSessionId && Cache::get('qr_unlocked_' . $cookieSessionId) === true)
            || ($cookieAppPhone && Cache::get('qr_unlocked_' . $cookieAppPhone) === true)
            || ($cookieAppSession && Cache::get('qr_unlocked_' . $cookieAppSession) === true);

        if ($isUnlocked) {
            session(['qr_unlocked' => true]);
            if ($cookieAppPhone) session(['app_client_phone' => $cookieAppPhone]);
            session()->save();
            Cache::put('qr_unlocked_' . $sessionId, true, 86400 * 365);
        }

        if ($isProtectionEnabled && !$isUnlocked) {
            $currentHost = $request->getSchemeAndHttpHost();
            $isLocal = str_contains($currentHost, '127.0.0.1') || str_contains($currentHost, 'localhost');

            if (!$isLocal) {
                $baseUrl = $currentHost;
            } elseif ($setting && !empty($setting->qr_local_url) && !str_contains($setting->qr_local_url, '127.0.0.1') && !str_contains($setting->qr_local_url, 'localhost')) {
                $baseUrl = rtrim($setting->qr_local_url, '/');
            } else {
                $lanIp = '192.168.0.102';
                $port = $request->getPort() ?: 8000;
                $baseUrl = "http://{$lanIp}:{$port}";
            }

            $globalToken = 'mbp_' . date('YmdH');

            $qrUnlockUrl = $baseUrl . '/qr-unlock?session_id=' . $sessionId . '&token=' . $globalToken;

            return response()->view('frontend.qr_gate', [
                'qrUnlockUrl' => $qrUnlockUrl,
                'sessionId'   => $sessionId,
                'setting'     => $setting,
            ]);
        }

        return $next($request);
    }
}
