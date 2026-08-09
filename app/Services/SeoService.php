<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\SeoMeta;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Request;

class SeoService
{
    protected static $seoData = null;

    /**
     * Get or build full SEO data payload for current request.
     */
    public static function getSeoData($pageTitle = null, $pageDesc = null, $pageImage = null, $customSchema = null, $faqArray = null, $breadcrumbs = [])
    {
        $setting = Setting::first();
        $appName = $setting?->company_name ?? $setting?->app_name ?? 'Italy Bangla Patente';
        $currentUrl = Request::url();
        $path = Request::path();

        // Check if there is an explicit DB entry in seo_metas for this URL path
        $dbMeta = SeoMeta::where('url_path', $path)->orWhere('url_path', '/' . $path)->first();

        // 1. Meta Title Resolution
        $rawTitle = $dbMeta->meta_title ?? $pageTitle ?? $setting?->app_name ?? 'Italy Bangla Patente B Driving License Course';
        $metaTitle = Str::limit(trim($rawTitle), 60, '');
        if (!Str::contains(strtolower($metaTitle), strtolower($appName)) && strlen($metaTitle) < 45) {
            $metaTitle .= ' | ' . $appName;
        }

        // 2. Meta Description Resolution
        $rawDesc = $dbMeta->meta_description ?? $pageDesc ?? 'ইতালিয়ান ড্রাইভিং লাইসেন্স (Patente B) সহজ বাংলা ভাষায় প্রস্তুত করুন। কুইজ সিমুলেটর, ছবি সহ ব্যাখ্যা, অডিও ও চ্যাপ্টার ওয়াইজ প্রস্তুতি।';
        $metaDescription = Str::limit(strip_tags(trim($rawDesc)), 160, '...');

        // 3. Image Resolution
        $appLogo = $setting?->app_logo;
        $metaImage = $dbMeta->og_image ?? $dbMeta->twitter_image ?? $pageImage ?? ($appLogo ? asset($appLogo) : asset('images/logo.png'));
        if ($metaImage && !Str::startsWith($metaImage, ['http://', 'https://'])) {
            $metaImage = asset($metaImage);
        }

        // 4. Canonical URL & Robots Meta
        $canonicalUrl = $dbMeta->canonical_url ?? $currentUrl;
        $robotsMeta = $dbMeta->robots_meta ?? 'index, follow';

        // 5. Open Graph & Twitter Card Tags
        $ogTitle = $dbMeta->og_title ?? $metaTitle;
        $ogDesc = $dbMeta->og_description ?? $metaDescription;
        $twitterTitle = $dbMeta->twitter_title ?? $metaTitle;
        $twitterDesc = $dbMeta->twitter_description ?? $metaDescription;

        // 6. Generate JSON-LD Schemas
        $schemas = [];

        // Organization Schema
        $schemas[] = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $appName,
            'url' => url('/'),
            'logo' => asset($setting->app_logo ?? 'images/logo.png'),
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => $setting->company_phone ?? '+8801700000000',
                'contactType' => 'customer service',
                'email' => $setting->company_email ?? 'info@italybanglapatente.com'
            ],
            'sameAs' => array_filter([
                $setting->social_facebook ?? null,
                $setting->social_youtube ?? null,
                $setting->social_instagram ?? null,
                $setting->social_twitter ?? null,
                $setting->social_linkedin ?? null,
            ])
        ];

        // WebSite & SearchAction Schema
        $schemas[] = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $appName,
            'url' => url('/'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/?search={search_term_string}'),
                'query-input' => 'required name=search_term_string'
            ]
        ];

        // LocalBusiness Schema (For Bangladesh Store / Office)
        if (!empty($setting->company_address)) {
            $schemas[] = [
                '@context' => 'https://schema.org',
                '@type' => 'LocalBusiness',
                'name' => $appName,
                'image' => asset($setting->app_logo ?? 'images/logo.png'),
                'telephone' => $setting->company_phone ?? '',
                'email' => $setting->company_email ?? '',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $setting->company_address ?? 'Dhaka, Bangladesh',
                    'addressLocality' => 'Dhaka',
                    'addressCountry' => 'BD'
                ],
                'geo' => [
                    '@type' => 'GeoCoordinates',
                    'latitude' => $setting->geo_latitude ?? '23.8103',
                    'longitude' => $setting->geo_longitude ?? '90.4125'
                ],
                'openingHours' => $setting->opening_hours ?? 'Mo-Sa 09:00-20:00'
            ];
        }

        // BreadcrumbList Schema
        if (!empty($breadcrumbs)) {
            $itemListElement = [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => url('/')
                ]
            ];
            $pos = 2;
            foreach ($breadcrumbs as $name => $link) {
                $itemListElement[] = [
                    '@type' => 'ListItem',
                    'position' => $pos++,
                    'name' => $name,
                    'item' => $link ? (Str::startsWith($link, 'http') ? $link : url($link)) : $currentUrl
                ];
            }
            $schemas[] = [
                '@context' => 'https://schema.org',
                '@type' => 'BreadcrumbList',
                'itemListElement' => $itemListElement
            ];
        }

        // FAQPage Schema
        $faqs = $faqArray ?? ($dbMeta ? $dbMeta->faq_json : null);
        if (!empty($faqs) && is_array($faqs)) {
            $faqElements = [];
            foreach ($faqs as $q => $a) {
                $questionText = is_array($a) ? ($a['question'] ?? $q) : $q;
                $answerText = is_array($a) ? ($a['answer'] ?? '') : $a;
                if (!empty($questionText) && !empty($answerText)) {
                    $faqElements[] = [
                        '@type' => 'Question',
                        'name' => $questionText,
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => strip_tags($answerText)
                        ]
                    ];
                }
            }
            if (!empty($faqElements)) {
                $schemas[] = [
                    '@context' => 'https://schema.org',
                    '@type' => 'FAQPage',
                    'mainEntity' => $faqElements
                ];
            }
        }

        // Custom Product/Course Schema if provided
        if ($customSchema) {
            $schemas[] = $customSchema;
        }

        return (object)[
            'title' => $metaTitle,
            'description' => $metaDescription,
            'keywords' => $dbMeta->meta_keywords ?? 'Italy Bangla Patente, Patente B, Quiz Patente, driving license Italy',
            'focus_keyword' => $dbMeta->focus_keyword ?? 'Patente B Bangla',
            'canonical' => $canonicalUrl,
            'robots' => $robotsMeta,
            'og_title' => $ogTitle,
            'og_description' => $ogDesc,
            'og_image' => $metaImage,
            'og_url' => $currentUrl,
            'twitter_title' => $twitterTitle,
            'twitter_description' => $twitterDesc,
            'twitter_image' => $metaImage,
            'schemas' => $schemas,
            'analytics' => (object)[
                'ga4' => $setting->ga4_measurement_id ?? null,
                'search_console' => $setting->search_console_verification ?? null,
                'gtm' => $setting->gtm_container_id ?? null,
                'fb_pixel' => $setting->fb_pixel_id ?? null,
                'clarity' => $setting->clarity_project_id ?? null,
            ]
        ];
    }
}
