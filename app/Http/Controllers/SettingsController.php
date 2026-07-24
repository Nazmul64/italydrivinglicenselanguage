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
                'exam_time_minutes' => 20,
            ]);
        }
        if (empty($setting->exam_time_minutes)) {
            $setting->exam_time_minutes = 20;
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
            'exam_time_minutes' => 'nullable|integer|min:1|max:300',
            'app_logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp',
            'favicon'  => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,ico,webp',
        ]);

        $setting->app_name = $request->app_name;
        $setting->exam_time_minutes = (int) $request->input('exam_time_minutes', 20);

        if ($request->has('home_desktop_columns')) $setting->home_desktop_columns = (int) $request->input('home_desktop_columns', 4);
        if ($request->has('home_tablet_columns')) $setting->home_tablet_columns = (int) $request->input('home_tablet_columns', 3);
        if ($request->has('home_mobile_columns')) $setting->home_mobile_columns = (int) $request->input('home_mobile_columns', 2);
        if ($request->has('home_card_width')) $setting->home_card_width = $request->input('home_card_width');
        if ($request->has('home_card_height')) $setting->home_card_height = $request->input('home_card_height');
        if ($request->has('home_card_gap')) $setting->home_card_gap = (int) $request->input('home_card_gap', 24);
        if ($request->has('schede_desktop_columns')) $setting->schede_desktop_columns = (int) $request->input('schede_desktop_columns', 2);
        if ($request->has('schede_mobile_columns')) $setting->schede_mobile_columns = (int) $request->input('schede_mobile_columns', 1);

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
        if ($request->has('argomenti_question_text_font_desktop')) $setting->argomenti_question_text_font_desktop = (int) $request->input('argomenti_question_text_font_desktop', 15);
        if ($request->has('argomenti_question_text_font_mobile')) $setting->argomenti_question_text_font_mobile = (int) $request->input('argomenti_question_text_font_mobile', 13);

        if ($request->has('argomenti_chapter_image_size_desktop')) $setting->argomenti_chapter_image_size_desktop = (int) $request->input('argomenti_chapter_image_size_desktop', 120);
        if ($request->has('argomenti_chapter_image_size_mobile')) $setting->argomenti_chapter_image_size_mobile = (int) $request->input('argomenti_chapter_image_size_mobile', 80);
        if ($request->has('argomenti_chapter_image_width_desktop')) $setting->argomenti_chapter_image_width_desktop = $request->input('argomenti_chapter_image_width_desktop');
        if ($request->has('argomenti_chapter_image_width_mobile')) $setting->argomenti_chapter_image_width_mobile = $request->input('argomenti_chapter_image_width_mobile');

        if ($request->has('argomenti_page_image_size_desktop')) $setting->argomenti_page_image_size_desktop = (int) $request->input('argomenti_page_image_size_desktop', 120);
        if ($request->has('argomenti_page_image_size_mobile')) $setting->argomenti_page_image_size_mobile = (int) $request->input('argomenti_page_image_size_mobile', 80);
        if ($request->has('argomenti_page_image_width_desktop')) $setting->argomenti_page_image_width_desktop = $request->input('argomenti_page_image_width_desktop');
        if ($request->has('argomenti_page_image_width_mobile')) $setting->argomenti_page_image_width_mobile = $request->input('argomenti_page_image_width_mobile');

        if ($request->has('reset_colors') && ($request->input('reset_colors') == 1 || $request->input('reset_colors') === 'true')) {
            $setting->primary_color = '#F4F7FA';
            $setting->accent_color = '#4CAF50';
            $setting->text_color = '#1e293b';
        } else {
            if ($request->has('primary_color') && !empty($request->input('primary_color'))) $setting->primary_color = $request->input('primary_color');
            if ($request->has('accent_color') && !empty($request->input('accent_color'))) $setting->accent_color = $request->input('accent_color');
            if ($request->has('text_color') && !empty($request->input('text_color'))) $setting->text_color = $request->input('text_color');
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
