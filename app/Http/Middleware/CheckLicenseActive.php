<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\License;


class CheckLicenseActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Fetch active license for this user UUID
        $license = License::where('user_id', $user->uuid)
            ->where('status', 'active')
            ->first();

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Active license required.'
            ], 403);
        }

        return $next($request);
    }
}
