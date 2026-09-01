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

        $sessionId  = session()->getId();

        $isUnlocked = session('qr_unlocked') === true
            || Cache::get('qr_unlocked_' . $sessionId) === true
            || $request->query('qr_unlocked') === '1';

        if ($isUnlocked) {
            session(['qr_unlocked' => true]);
            session()->save();
        }

        if ($isProtectionEnabled && !$isUnlocked) {
            $currentHost = $request->getSchemeAndHttpHost();

            // When hosted on a live domain (not localhost/127.0.0.1), always use current website domain
            if (!str_contains($currentHost, '127.0.0.1') && !str_contains($currentHost, 'localhost')) {
                $baseUrl = $currentHost;
            } elseif ($setting && $setting->qr_target_mode === 'live' && !empty($setting->qr_live_url)) {
                $baseUrl = rtrim($setting->qr_live_url, '/');
            } elseif ($setting && !empty($setting->qr_local_url) && !str_contains($setting->qr_local_url, '10.0.2.2') && !str_contains($setting->qr_local_url, '127.0.0.1') && !str_contains($setting->qr_local_url, 'localhost')) {
                $baseUrl = rtrim($setting->qr_local_url, '/');
            } else {
                $lanIp = @gethostbyname(gethostname());
                if (!$lanIp || $lanIp === '127.0.0.1' || $lanIp === 'localhost') {
                    $lanIp = '192.168.0.100';
                }
                $baseUrl = str_replace(['127.0.0.1', 'localhost'], $lanIp, $currentHost);
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
