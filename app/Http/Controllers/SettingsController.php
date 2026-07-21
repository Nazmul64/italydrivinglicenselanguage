<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingsController extends Controller
{
    public function getSettings()
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create([
                'app_name' => 'mbanglapatenteb',
            ]);
        }
        return response()->json($setting);
    }

    public function updateSettings(Request $request)
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = new Setting();
        }

        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp',
            'favicon'  => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,ico,webp',
        ]);

        $setting->app_name = $request->app_name;

        if ($request->hasFile('app_logo')) {
            $file = $request->file('app_logo');
            $fileName = 'logo_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/settings'), $fileName);
            if ($setting->app_logo && file_exists(public_path($setting->app_logo))) {
                @unlink(public_path($setting->app_logo));
            }
            $setting->app_logo = '/uploads/settings/' . $fileName;
        }

        if ($request->hasFile('favicon')) {
            $file = $request->file('favicon');
            $fileName = 'favicon_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/settings'), $fileName);
            if ($setting->favicon && file_exists(public_path($setting->favicon))) {
                @unlink(public_path($setting->favicon));
            }
            $setting->favicon = '/uploads/settings/' . $fileName;
        }

        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $setting
        ]);
    }
}
