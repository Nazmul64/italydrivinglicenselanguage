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

        // Check if THIS specific session has been unlocked via QR code from the mobile app
        $isUnlocked = (Cache::get('qr_unlocked_' . $sessionId) === true)
            || ($cookieSessionId && Cache::get('qr_unlocked_' . $cookieSessionId) === true);

        $phone = Cache::get('qr_phone_' . $sessionId)
            ?: ($cookieSessionId ? Cache::get('qr_phone_' . $cookieSessionId) : null)
            ?: session('app_client_phone');

        // If marked unlocked in cache, strictly verify that the associated client is still active and unexpired
        if ($isUnlocked && $phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $last10 = (strlen($cleanPhone) >= 7) ? substr($cleanPhone, -10) : $cleanPhone;
            $client = \App\Models\AppClient::where(function($q) use ($phone, $cleanPhone, $last10) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10)) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10) . ") = ?", [$last10]);
                    }
                }
            })->first();

            if ($client) {
                if (!$client->is_active || ($client->expires_at && now()->gt($client->expires_at))) {
                    // Client is inactive or expired! Lock session immediately
                    $isUnlocked = false;
                    Cache::forget('qr_unlocked_' . $sessionId);
                    if ($cookieSessionId) Cache::forget('qr_unlocked_' . $cookieSessionId);
                    session()->forget('qr_unlocked');
                    session()->forget('app_client_phone');
                } else {
                    $isUnlocked = true;
                    session(['qr_unlocked' => true, 'app_client_phone' => $client->phone]);
                }
            } else {
                $isUnlocked = false;
                Cache::forget('qr_unlocked_' . $sessionId);
                session()->forget('qr_unlocked');
            }
        } elseif ($isUnlocked && !$phone) {
            $isUnlocked = true;
        } else {
            $isUnlocked = false;
            session()->forget('qr_unlocked');
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
