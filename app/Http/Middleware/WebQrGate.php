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
            $request->is('sitemap*') ||
            $request->is('robots.txt') ||
            $request->is('feeds/*') ||
            $request->is('uploads/*') ||
            $request->is('assets/*')
        ) {
            return $next($request);
        }

        $setting = Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        $sessionId  = session()->getId();
        $isUnlocked = session('qr_unlocked', false)
            || Cache::get('qr_unlocked_' . $sessionId, false)
            || Cache::get('qr_unlocked_global', false);

        if ($isUnlocked) {
            session(['qr_unlocked' => true]);
        }

        if ($isProtectionEnabled && !$isUnlocked) {
            // QR unlock URL ALWAYS points to live server
            // Server mode only affects app data API, never QR unlock
            $liveBase = 'http://mbanglapatenteb.com';
            if ($setting && !empty($setting->qr_live_url)) {
                $liveBase = rtrim($setting->qr_live_url, '/');
            }

            // Global unlock token — no session_id needed
            // Any app scan unlocks ALL browser windows showing the gate
            $globalToken = 'mbp_' . date('YmdH'); // rotates every hour

            $qrUnlockUrl = $liveBase . '/qr-unlock?token=' . $globalToken;

            return response()->view('frontend.qr_gate', [
                'qrUnlockUrl' => $qrUnlockUrl,
                'sessionId'   => $sessionId,
                'setting'     => $setting,
            ]);
        }

        return $next($request);
    }
}
