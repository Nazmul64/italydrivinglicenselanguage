<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
        if (!app()->runningInConsole()) {
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
}
