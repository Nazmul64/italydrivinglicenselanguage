<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\License;
use App\Models\AppClient;

class CheckLicenseActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $setting = \App\Models\Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        if (!$isProtectionEnabled) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Fetch active license for this user UUID (including lifetime license where expires_at is null)
        $hasActiveLicense = License::where('user_id', $user->uuid)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        if (!$hasActiveLicense && $user->phone) {
            $cleanPhone = preg_replace('/\D/', '', $user->phone);
            $hasActiveLicense = AppClient::where(function ($q) use ($user, $cleanPhone) {
                $q->where('phone', $user->phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                }
            })
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
        }

        if (!$hasActiveLicense) {
            return response()->json([
                'success' => false,
                'message' => 'Active license required.',
            ], 403);
        }

        return $next($request);
    }
}
