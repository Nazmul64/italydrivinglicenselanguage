<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\LectureClass;
use App\Models\Question;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    /**
     * Google Merchant Center Product Feed (/feeds/google-merchant.xml)
     */
    public function googleMerchant()
    {
        $setting = Setting::first();
        $appName = $setting->company_name ?? $setting->app_name ?? 'Italy Bangla Patente';
        $lectures = LectureClass::orderBy('id', 'asc')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml .= '  <channel>' . "\n";
        $xml .= '    <title>' . htmlspecialchars($appName) . '</title>' . "\n";
        $xml .= '    <link>' . url('/') . '</link>' . "\n";
        $xml .= '    <description>Italy Bangla Patente B License Preparation Courses and Packages</description>' . "\n";

        foreach ($lectures as $l) {
            $title = $l->title ?? 'Lecture Class #' . $l->id;
            $desc = strip_tags($l->description ?? $title);
            $img = $l->thumbnail ? asset($l->thumbnail) : asset('images/logo.png');
            $price = ($l->is_free ?? true) ? '0.00 BDT' : '1500.00 BDT';

            $xml .= '    <item>' . "\n";
            $xml .= '      <g:id>course_' . $l->id . '</g:id>' . "\n";
            $xml .= '      <g:title>' . htmlspecialchars($title) . '</g:title>' . "\n";
            $xml .= '      <g:description>' . htmlspecialchars(mb_substr($desc, 0, 500)) . '</g:description>' . "\n";
            $xml .= '      <g:link>' . url('/?lecture=' . $l->id) . '</g:link>' . "\n";
            $xml .= '      <g:image_link>' . htmlspecialchars($img) . '</g:image_link>' . "\n";
            $xml .= '      <g:condition>new</g:condition>' . "\n";
            $xml .= '      <g:availability>in_stock</g:availability>' . "\n";
            $xml .= '      <g:price>' . $price . '</g:price>' . "\n";
            $xml .= '      <g:brand>' . htmlspecialchars($appName) . '</g:brand>' . "\n";
            $xml .= '      <g:google_product_category>Media &gt; Educational Software</g:google_product_category>' . "\n";
            $xml .= '    </item>' . "\n";
        }

        $xml .= '  </channel>' . "\n";
        $xml .= '</rss>';

        return response($xml, 200, ['Content-Type' => 'text/xml']);
    }

    /**
     * Facebook & Instagram Shopping Catalog XML Feed (/feeds/facebook-catalog.xml)
     */
    public function facebookCatalog()
    {
        $setting = Setting::first();
        $appName = $setting->company_name ?? $setting->app_name ?? 'Italy Bangla Patente';
        $lectures = LectureClass::orderBy('id', 'asc')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml .= '  <channel>' . "\n";
        $xml .= '    <title>' . htmlspecialchars($appName) . ' Facebook Catalog</title>' . "\n";
        $xml .= '    <link>' . url('/') . '</link>' . "\n";
        $xml .= '    <description>Facebook Shopping XML Feed</description>' . "\n";

        foreach ($lectures as $l) {
            $title = $l->title ?? 'Lecture Class #' . $l->id;
            $desc = strip_tags($l->description ?? $title);
            $img = $l->thumbnail ? asset($l->thumbnail) : asset('images/logo.png');

            $xml .= '    <item>' . "\n";
            $xml .= '      <g:id>course_' . $l->id . '</g:id>' . "\n";
            $xml .= '      <g:title>' . htmlspecialchars($title) . '</g:title>' . "\n";
            $xml .= '      <g:description>' . htmlspecialchars(mb_substr($desc, 0, 500)) . '</g:description>' . "\n";
            $xml .= '      <g:link>' . url('/?lecture=' . $l->id) . '</g:link>' . "\n";
            $xml .= '      <g:image_link>' . htmlspecialchars($img) . '</g:image_link>' . "\n";
            $xml .= '      <g:condition>new</g:condition>' . "\n";
            $xml .= '      <g:availability>in stock</g:availability>' . "\n";
            $xml .= '      <g:price>0.00 BDT</g:price>' . "\n";
            $xml .= '      <g:brand>' . htmlspecialchars($appName) . '</g:brand>' . "\n";
            $xml .= '    </item>' . "\n";
        }

        $xml .= '  </channel>' . "\n";
        $xml .= '</rss>';

        return response($xml, 200, ['Content-Type' => 'text/xml']);
    }
}
