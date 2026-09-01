<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingsController extends Controller
{
    public function getSettings(Request $request)
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create([
                'app_name' => 'mbanglapatenteb',
                'exam_time_minutes' => 20,
                'qr_target_mode' => 'local',
                'qr_live_url' => 'https://mbanglapatenteb.com',
                'qr_local_url' => 'http://10.0.2.2:8000',
            ]);
        }
        if (empty($setting->exam_time_minutes)) {
            $setting->exam_time_minutes = 20;
        }
        if (empty($setting->qr_live_url)) {
            $setting->qr_live_url = 'https://mbanglapatenteb.com';
        }
        if (empty($setting->qr_local_url)) {
            $setting->qr_local_url = 'http://10.0.2.2:8000';
        }
        if (empty($setting->qr_target_mode)) {
            $setting->qr_target_mode = 'local';
        }
        if (empty($setting->privacy_policy)) {
            $setting->privacy_policy = "Privacy Policy for M Bangla Patente B\n\nYour privacy is important to us. We collect minimal information necessary to deliver Italian driving license preparation content, track quiz progress, and manage device activations.\n\n1. Information Collection: We store account details, study progress, and activation keys.\n2. Data Security: All communication between the app and server is encrypted.\n3. Changes: We may update this policy periodically.";
        }
        if (empty($setting->terms_conditions)) {
            $setting->terms_conditions = "Terms & Conditions for M Bangla Patente B\n\nWelcome to M Bangla Patente B. By using our application, you agree to comply with the following terms:\n\n1. License: App access is granted per activated device key.\n2. Usage: Content is for personal study purposes only.\n3. Content Ownership: Material presented remains proprietary to M Bangla Patente B.";
        }

        $requestHost = $request ? $request->getSchemeAndHttpHost() : null;
        $localServerUrl = $setting->qr_local_url;
        
        if (empty($localServerUrl) || str_contains($localServerUrl, '127.0.0.1') || str_contains($localServerUrl, 'localhost')) {
            if ($requestHost && !str_contains($requestHost, '127.0.0.1') && !str_contains($requestHost, 'localhost')) {
                $localServerUrl = $requestHost;
            } else {
                $port = parse_url($localServerUrl, PHP_URL_PORT) ?: '8000';
                $scheme = parse_url($localServerUrl, PHP_URL_SCHEME) ?: 'http';
                $localServerUrl = "{$scheme}://10.0.2.2:{$port}";
            }
        }

        $activeBaseUrl = ($setting->qr_target_mode === 'live')
            ? rtrim($setting->qr_live_url, '/')
            : rtrim($localServerUrl, '/');

        $data = array_merge($setting->toArray(), [
            'server_mode' => $setting->qr_target_mode,
            'active_base_url' => $activeBaseUrl,
            'live_server_url' => $setting->qr_live_url,
            'local_server_url' => $localServerUrl,
            'privacy_policy' => $setting->privacy_policy,
            'terms_conditions' => $setting->terms_conditions,
        ]);

        return response()->json($data);
    }

    public function updateSettings(Request $request)
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = new Setting();
        }

        $request->validate([
            'app_name' => 'nullable|string|max:255',
            'exam_time_minutes' => 'nullable|integer|min:1|max:300',
            'app_logo' => 'nullable|max:20480',
            'favicon'  => 'nullable|max:20480',
        ]);

        if ($request->has('app_name') && !empty($request->app_name)) {
            $setting->app_name = $request->app_name;
        } elseif (empty($setting->app_name)) {
            $setting->app_name = 'mbanglapatenteb';
        }
        $setting->exam_time_minutes = (int) $request->input('exam_time_minutes', $setting->exam_time_minutes ?: 20);

        if ($request->has('home_desktop_columns')) $setting->home_desktop_columns = (int) $request->input('home_desktop_columns', 4);
        if ($request->has('home_tablet_columns')) $setting->home_tablet_columns = (int) $request->input('home_tablet_columns', 3);
        if ($request->has('home_mobile_columns')) $setting->home_mobile_columns = (int) $request->input('home_mobile_columns', 2);
        if ($request->has('home_card_width')) $setting->home_card_width = $request->input('home_card_width');
        if ($request->has('home_card_height')) $setting->home_card_height = $request->input('home_card_height');
        if ($request->has('home_card_gap')) $setting->home_card_gap = (int) $request->input('home_card_gap', 24);
        if ($request->has('schede_desktop_columns')) $setting->schede_desktop_columns = (int) $request->input('schede_desktop_columns', 2);
        if ($request->has('schede_mobile_columns')) $setting->schede_mobile_columns = (int) $request->input('schede_mobile_columns', 1);
        if ($request->has('license_message')) $setting->license_message = $request->input('license_message');

        if ($request->has('icon_size_desktop')) $setting->icon_size_desktop = (int) $request->input('icon_size_desktop', 90);
        if ($request->has('icon_size_mobile')) $setting->icon_size_mobile = (int) $request->input('icon_size_mobile', 60);
        if ($request->has('title_font_size_desktop')) $setting->title_font_size_desktop = (int) $request->input('title_font_size_desktop', 16);
        if ($request->has('title_font_size_mobile')) $setting->title_font_size_mobile = (int) $request->input('title_font_size_mobile', 14);
        if ($request->has('subtitle_font_size_desktop')) $setting->subtitle_font_size_desktop = (int) $request->input('subtitle_font_size_desktop', 12);
        if ($request->has('subtitle_font_size_mobile')) $setting->subtitle_font_size_mobile = (int) $request->input('subtitle_font_size_mobile', 11);

        if ($request->has('cartelli_chapter_title_font_desktop')) $setting->cartelli_chapter_title_font_desktop = (int) $request->input('cartelli_chapter_title_font_desktop', 16);
        if ($request->has('cartelli_chapter_title_font_mobile')) $setting->cartelli_chapter_title_font_mobile = (int) $request->input('cartelli_chapter_title_font_mobile', 14);
        if ($request->has('cartelli_page_title_font_desktop')) $setting->cartelli_page_title_font_desktop = (int) $request->input('cartelli_page_title_font_desktop', 15);
        if ($request->has('cartelli_page_title_font_mobile')) $setting->cartelli_page_title_font_mobile = (int) $request->input('cartelli_page_title_font_mobile', 13);
        if ($request->has('cartelli_page_image_size_desktop')) $setting->cartelli_page_image_size_desktop = (int) $request->input('cartelli_page_image_size_desktop', 120);
        if ($request->has('cartelli_page_image_size_mobile')) $setting->cartelli_page_image_size_mobile = (int) $request->input('cartelli_page_image_size_mobile', 80);

        if ($request->has('cartelli_chapter_image_size_desktop')) $setting->cartelli_chapter_image_size_desktop = (int) $request->input('cartelli_chapter_image_size_desktop', 120);
        if ($request->has('cartelli_chapter_image_size_mobile')) $setting->cartelli_chapter_image_size_mobile = (int) $request->input('cartelli_chapter_image_size_mobile', 80);
        if ($request->has('cartelli_chapter_image_width_desktop')) $setting->cartelli_chapter_image_width_desktop = $request->input('cartelli_chapter_image_width_desktop');
        if ($request->has('cartelli_chapter_image_width_mobile')) $setting->cartelli_chapter_image_width_mobile = $request->input('cartelli_chapter_image_width_mobile');

        if ($request->has('cartelli_page_image_width_desktop')) $setting->cartelli_page_image_width_desktop = $request->input('cartelli_page_image_width_desktop');
        if ($request->has('cartelli_page_image_width_mobile')) $setting->cartelli_page_image_width_mobile = $request->input('cartelli_page_image_width_mobile');

        if ($request->has('argomenti_chapter_title_font_desktop')) $setting->argomenti_chapter_title_font_desktop = (int) $request->input('argomenti_chapter_title_font_desktop', 16);
        if ($request->has('argomenti_chapter_title_font_mobile')) $setting->argomenti_chapter_title_font_mobile = (int) $request->input('argomenti_chapter_title_font_mobile', 14);
        if ($request->has('argomenti_page_title_font_desktop')) $setting->argomenti_page_title_font_desktop = (int) $request->input('argomenti_page_title_font_desktop', 15);
        if ($request->has('argomenti_page_title_font_mobile')) $setting->argomenti_page_title_font_mobile = (int) $request->input('argomenti_page_title_font_mobile', 13);
        if ($request->has('argomenti_question_text_font_desktop')) $setting->argomenti_question_text_font_desktop = (int) $request->input('argomenti_question_text_font_desktop', 18);
        if ($request->has('argomenti_question_text_font_mobile')) $setting->argomenti_question_text_font_mobile = (int) $request->input('argomenti_question_text_font_mobile', 16);
        if ($request->has('argomenti_question_image_size_desktop')) $setting->argomenti_question_image_size_desktop = (int) $request->input('argomenti_question_image_size_desktop', 110);
        if ($request->has('argomenti_question_image_size_mobile')) $setting->argomenti_question_image_size_mobile = (int) $request->input('argomenti_question_image_size_mobile', 85);

        if ($request->has('argomenti_chapter_image_size_desktop')) $setting->argomenti_chapter_image_size_desktop = (int) $request->input('argomenti_chapter_image_size_desktop', 120);
        if ($request->has('argomenti_chapter_image_size_mobile')) $setting->argomenti_chapter_image_size_mobile = (int) $request->input('argomenti_chapter_image_size_mobile', 80);
        if ($request->has('argomenti_chapter_image_width_desktop')) $setting->argomenti_chapter_image_width_desktop = $request->input('argomenti_chapter_image_width_desktop');
        if ($request->has('argomenti_chapter_image_width_mobile')) $setting->argomenti_chapter_image_width_mobile = $request->input('argomenti_chapter_image_width_mobile');

        if ($request->has('argomenti_page_image_size_desktop')) $setting->argomenti_page_image_size_desktop = (int) $request->input('argomenti_page_image_size_desktop', 120);
        if ($request->has('argomenti_page_image_size_mobile')) $setting->argomenti_page_image_size_mobile = (int) $request->input('argomenti_page_image_size_mobile', 80);
        if ($request->has('argomenti_page_image_width_desktop')) $setting->argomenti_page_image_width_desktop = $request->input('argomenti_page_image_width_desktop');
        if ($request->has('argomenti_page_image_width_mobile')) $setting->argomenti_page_image_width_mobile = $request->input('argomenti_page_image_width_mobile');

        if ($request->has('mcq_number_font_desktop')) $setting->mcq_number_font_desktop = (int) $request->input('mcq_number_font_desktop', 16);
        if ($request->has('mcq_number_font_mobile')) $setting->mcq_number_font_mobile = (int) $request->input('mcq_number_font_mobile', 14);
        if ($request->has('schede_stat_font_desktop')) $setting->schede_stat_font_desktop = (int) $request->input('schede_stat_font_desktop', 13);
        if ($request->has('schede_stat_font_mobile')) $setting->schede_stat_font_mobile = (int) $request->input('schede_stat_font_mobile', 11);

        if ($request->has('reset_colors') && ($request->input('reset_colors') == 1 || $request->input('reset_colors') === 'true')) {
            $setting->primary_color = '#F4F7FA';
            $setting->accent_color = '#4CAF50';
            $setting->text_color = '#1e293b';
        } else {
            if ($request->has('primary_color') && !empty($request->input('primary_color'))) $setting->primary_color = $request->input('primary_color');
            if ($request->has('accent_color') && !empty($request->input('accent_color'))) $setting->accent_color = $request->input('accent_color');
            if ($request->has('text_color') && !empty($request->input('text_color'))) $setting->text_color = $request->input('text_color');
        }

        if ($request->has('company_name')) $setting->company_name = $request->input('company_name');
        if ($request->has('company_phone')) $setting->company_phone = $request->input('company_phone');
        if ($request->has('company_email')) $setting->company_email = $request->input('company_email');
        if ($request->has('company_address')) $setting->company_address = $request->input('company_address');
        if ($request->has('geo_latitude')) $setting->geo_latitude = $request->input('geo_latitude');
        if ($request->has('geo_longitude')) $setting->geo_longitude = $request->input('geo_longitude');
        if ($request->has('opening_hours')) $setting->opening_hours = $request->input('opening_hours');
        if ($request->has('ga4_measurement_id')) $setting->ga4_measurement_id = $request->input('ga4_measurement_id');
        if ($request->has('search_console_verification')) $setting->search_console_verification = $request->input('search_console_verification');
        if ($request->has('gtm_container_id')) $setting->gtm_container_id = $request->input('gtm_container_id');
        if ($request->has('fb_pixel_id')) $setting->fb_pixel_id = $request->input('fb_pixel_id');
        if ($request->has('clarity_project_id')) $setting->clarity_project_id = $request->input('clarity_project_id');

        $setting->qr_protection_enabled = $request->has('qr_protection_enabled')
            ? filter_var($request->input('qr_protection_enabled'), FILTER_VALIDATE_BOOLEAN)
            : false;
        if ($request->has('qr_target_mode')) {
            $setting->qr_target_mode = $request->input('qr_target_mode');
        }
        if ($request->has('qr_live_url')) {
            $setting->qr_live_url = $request->input('qr_live_url');
        }
        if ($request->has('qr_local_url')) {
            $setting->qr_local_url = $request->input('qr_local_url');
        }
        if ($request->has('privacy_policy')) {
            $setting->privacy_policy = $request->input('privacy_policy');
        }
        if ($request->has('terms_conditions')) {
            $setting->terms_conditions = $request->input('terms_conditions');
        }

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
