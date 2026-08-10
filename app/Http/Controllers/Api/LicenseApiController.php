<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\License;

class LicenseApiController extends Controller
{
    public function getStatus(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $license = License::where('user_id', $user->uuid)->latest()->first();
        $status = $license ? $license->status : 'inactive';

        return response()->json([
            'success' => true,
            'status'  => $status,
            'license' => $license ? [
                'license_key'  => $license->license_key,
                'status'       => $license->status,
                'activated_at' => $license->activated_at,
                'expires_at'   => $license->expires_at,
            ] : null,
        ]);
    }

    public function activate(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'License key is required.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $licenseKey = trim($request->input('license_key'));

        $license = License::where('license_key', $licenseKey)->first();

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid license key.'
            ], 404);
        }

        // Check ownership: license must belong to this user UUID
        if ($license->user_id !== $user->uuid) {
            return response()->json([
                'success' => false,
                'message' => 'This license does not belong to this account.'
            ], 403);
        }

        if ($license->status === 'revoked') {
            return response()->json([
                'success' => false,
                'message' => 'This license has been revoked.'
            ], 403);
        }

        if ($license->expires_at && $license->expires_at->isPast()) {
            $license->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'This license has expired.'
            ], 403);
        }

        // Activate license
        $license->update([
            'status'       => 'active',
            'activated_at' => now(),
        ]);

        return response()->json([
            'success'        => true,
            'message'        => 'License activated successfully.',
            'license_status' => 'active'
        ]);
    }
}
