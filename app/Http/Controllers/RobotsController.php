<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class RobotsController extends Controller
{
    /**
     * Dynamic robots.txt output.
     */
    public function index()
    {
        $setting = Setting::first();

        if (!empty($setting->robots_txt_content)) {
            $content = $setting->robots_txt_content;
        } else {
            $content = "User-agent: *\n";
            $content .= "Allow: /\n";
            $content .= "Disallow: /admin/\n";
            $content .= "Disallow: /api/\n";
            $content .= "Disallow: /login\n";
            $content .= "Disallow: /register\n\n";
            $content .= "Sitemap: " . url('/sitemap.xml') . "\n";
        }

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}
