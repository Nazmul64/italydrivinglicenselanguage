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
        $setting = \App\Models\Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        if (
            !$isProtectionEnabled ||
            $request->is("*saved-mcqs*") ||
            $request->is("*correct-mcqs*") ||
            $request->is("*wrong-mcqs*") ||
            $request->is("*user-mcq-results*") ||
            $request->is("*client/*") ||
            $request->is("*support/*") ||
            $request->is("*translation*") ||
            $request->is("*settings*")
        ) {
            return $next($request);
        }

        $sessionId = $request->input("session_id") 
                  ?: $request->query("session_id") 
                  ?: $request->header("X-Client-Session-ID") 
                  ?: $request->header("x-client-session-id") 
                  ?: session()->getId();

        $phone = $request->input("phone") 
              ?: $request->query("phone") 
              ?: $request->header("X-Client-Phone") 
              ?: $request->header("x-client-phone") 
              ?: $request->cookie("app_client_phone") 
              ?: session("app_client_phone");

        $client = null;
        if ($phone) {
            $cleanPhone = preg_replace("/\D/", "", $phone);
            $client = AppClient::where(function ($q) use ($phone, $cleanPhone) {
                $q->where("phone", $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, \" \", \"\"), \"-\", \"\"), \"+\", \"\") = ?", [$cleanPhone]);
                }
            })->first();
        }

        if (!$client && $sessionId) {
            $client = AppClient::where("session_id", $sessionId)->first();
        }

        if (!$client && !$phone) {
            $client = AppClient::where("is_active", true)
                ->where(function($q) {
                    $q->whereNull("expires_at")->orWhere("expires_at", ">", now());
                })
                ->latest()
                ->first();
        }

        $userActive = false;
        if ($phone || $sessionId) {
            $cleanPhone = $phone ? preg_replace("/\D/", "", $phone) : null;
            $userQuery = \App\Models\User::query();
            if ($phone) {
                $userQuery->where(function($q) use ($phone, $cleanPhone) {
                    $q->where("phone", $phone);
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, \" \", \"\"), \"-\", \"\"), \"+\", \"\") = ?", [$cleanPhone]);
                    }
                });
            } else {
                $userQuery->where("uuid", $sessionId);
            }
            $userObj = $userQuery->first();
            if ($userObj) {
                $userActive = \App\Models\License::where("user_id", $userObj->uuid)
                    ->where("status", "active")
                    ->where(function ($q) {
                        $q->whereNull("expires_at")->orWhere("expires_at", ">", now());
                    })
                    ->exists();
            }
        }

        if ($client && $client->is_active) {
            if ($client->expires_at && now()->gt($client->expires_at)) {
                $client->is_active = false;
                $client->save();
            } else {
                $userActive = true;
            }

            if ($client->session_id !== $sessionId) {
                $oldSessionId = $client->session_id;
                $client->session_id = $sessionId;
                $client->save();

                \App\Models\Message::where("session_id", $oldSessionId)->update(["session_id" => $sessionId]);
                \App\Models\Note::where("session_id", $oldSessionId)->update(["session_id" => $sessionId]);
                \App\Models\SavedMcq::where("session_id", $oldSessionId)->update(["session_id" => $sessionId]);
                \App\Models\UserMcqResult::where("session_id", $oldSessionId)->update(["session_id" => $sessionId]);
            }
        }

        if (!$userActive) {
            return response()->json(["error" => "License inactive"], 403);
        }

        return $next($request);
    }
}