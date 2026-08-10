<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Conversation;
use App\Models\License;

class SupportRegistrationApiController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'phone'      => 'required|string|max:25',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $phone = trim($request->input('phone'));
        $firstName = trim($request->input('first_name'));
        $lastName  = trim($request->input('last_name'));

        // Normalize phone format if needed (e.g. ensure + prefix or standard string)
        if (!preg_match('/^\+?[0-9]{7,15}$/', str_replace([' ', '-'], '', $phone))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number format.'
            ], 422);
        }

        // Check if existing user exists by phone
        $user = User::where('phone', $phone)->first();

        if (!$user) {
            // Create new user with UUID
            $user = User::create([
                'uuid'       => (string) Str::uuid(),
                'name'       => $firstName . ' ' . $lastName,
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $phone,
                'email'      => 'user_' . Str::random(8) . '@mbanglapatenteb.com',
                'password'   => bcrypt(Str::random(16)),
                'role'       => 'user',
            ]);
        } else {
            // Update names if changed
            $user->update([
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'name'       => $firstName . ' ' . $lastName,
            ]);
        }

        // Ensure user has a conversation
        Conversation::firstOrCreate([
            'user_id' => $user->uuid,
        ]);

        // Get license status
        $license = License::where('user_id', $user->uuid)->latest()->first();
        $licenseStatus = $license ? $license->status : 'inactive';

        // Issue Sanctum Token
        $token = $user->createToken('mobile_app_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id'         => $user->uuid,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone,
            ],
            'license_status' => $licenseStatus,
            'token'          => $token
        ]);
    }

    public function getUser(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $license = License::where('user_id', $user->uuid)->latest()->first();
        $licenseStatus = $license ? $license->status : 'inactive';

        return response()->json([
            'success' => true,
            'user' => [
                'id'         => $user->uuid,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'phone'      => $user->phone,
            ],
            'license_status' => $licenseStatus,
        ]);
    }
}
