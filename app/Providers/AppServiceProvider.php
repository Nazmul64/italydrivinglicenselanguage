<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Safe 'mimes' and 'image' validation fallbacks when php_fileinfo is not enabled on hosting server
        Validator::extend('mimes', function ($attribute, $value, $parameters, $validator) {
            if (!$value instanceof UploadedFile) {
                return false;
            }
            $extension = strtolower($value->getClientOriginalExtension() ?: '');
            if (empty($extension) && (extension_loaded('fileinfo') || function_exists('finfo_open'))) {
                try {
                    $extension = strtolower($value->guessExtension() ?: '');
                } catch (\Throwable $e) {}
            }
            return in_array($extension, array_map('strtolower', $parameters));
        });

        Validator::extend('image', function ($attribute, $value, $parameters, $validator) {
            if (!$value instanceof UploadedFile) {
                return false;
            }
            $extension = strtolower($value->getClientOriginalExtension() ?: '');
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'jfif', 'pjp', 'pjpeg', 'tif', 'tiff', 'ico', 'avif'];
            if (in_array($extension, $imageExtensions)) {
                return true;
            }
            if (extension_loaded('fileinfo') || function_exists('finfo_open')) {
                try {
                    $mime = $value->getMimeType();
                    return $mime && str_starts_with($mime, 'image/');
                } catch (\Throwable $e) {}
            }
            return false;
        });

        try {
            $setting = \App\Models\Setting::first();
            if (!$setting) {
                $setting = new \App\Models\Setting(['app_name' => 'mbanglapatenteb']);
            }
            \Illuminate\Support\Facades\View::share('gSettings', $setting);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\View::share('gSettings', new \App\Models\Setting(['app_name' => 'mbanglapatenteb']));
        }
    }
}
