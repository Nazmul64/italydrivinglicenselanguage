<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Models\License;
use App\Models\QrToken;

class QrVerificationApiController extends Controller
{
    public function verify(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check active license status
        $license = License::where('user_id', $user->uuid)->where('status', 'active')->first();
        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Active license required to access QR content.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'QR Token parameter is missing.'
            ], 422);
        }

        $tokenStr = trim($request->input('token'));

        // Handle session_id parameter extraction if URL format is passed
        if (str_contains($tokenStr, 'token=') || str_contains($tokenStr, 'session_id=')) {
            $queryString = parse_url($tokenStr, PHP_URL_QUERY);
            if ($queryString) {
                parse_str($queryString, $query);
                $tokenStr = $query['token'] ?? $query['session_id'] ?? $tokenStr;
            }
        }

        // Lookup token in DB
        $qrToken = QrToken::where('token', $tokenStr)->first();

        if ($qrToken) {
            // Check status
            if ($qrToken->status === 'expired' || ($qrToken->expires_at && $qrToken->expires_at->isPast())) {
                $qrToken->update(['status' => 'expired']);
                return response()->json([
                    'success' => false,
                    'message' => 'This QR code has expired.'
                ], 403);
            }

            // Check User Mapping Security Rule
            if ($qrToken->user_id && $qrToken->user_id !== $user->uuid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: This QR code is assigned to another user account.'
                ], 403);
            }
        }

        // Mark QR session as unlocked in cache for web compatibility
        Cache::put('qr_unlocked_' . $tokenStr, true, 86400);

        return response()->json([
            'success'      => true,
            'message'      => 'QR verified successfully.',
            'token'        => $tokenStr,
            'content_type' => 'authorized_page',
            'redirect_url' => url('/lezioni?session_id=' . urlencode($tokenStr)),
            'user'         => [
                'id'   => $user->uuid,
                'name' => $user->name,
            ]
        ]);
    }
}
