<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use App\Models\SeoHealthLog;
use App\Models\SeoMeta;
use App\Models\Setting;
use App\Models\Question;
use App\Models\Page;
use App\Models\Chapter;
use Illuminate\Http\Request;

class AdminSeoController extends Controller
{
    /**
     * Get SEO Audit summary data.
     */
    public function audit()
    {
        $missingTitleCount = Question::whereNull('italian')->orWhere('italian', '')->count();
        $missingAltCount = Question::whereNotNull('image')->where('image', '!=', '')->count(); // Questions with image
        $redirectsCount = Redirect::count();
        $logs404 = SeoHealthLog::orderBy('hits', 'desc')->take(20)->get();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'missing_meta_titles' => $missingTitleCount,
                'total_redirects' => $redirectsCount,
                'total_404_errors' => SeoHealthLog::count(),
            ],
            'recent_404s' => $logs404,
            'sitemap_url' => url('/sitemap.xml'),
            'robots_url' => url('/robots.txt'),
        ]);
    }

    /**
     * Redirects CRUD Operations
     */
    public function getRedirects()
    {
        return response()->json(Redirect::orderBy('id', 'desc')->get());
    }

    public function saveRedirect(Request $request)
    {
        $request->validate([
            'source_url' => 'required|string',
            'destination_url' => 'required|string',
            'status_code' => 'nullable|integer',
        ]);

        $redirect = Redirect::updateOrCreate(
            ['id' => $request->input('id')],
            [
                'source_url' => ltrim($request->input('source_url'), '/'),
                'destination_url' => $request->input('destination_url'),
                'status_code' => $request->input('status_code', 301),
                'is_active' => $request->input('is_active', true),
            ]
        );

        return response()->json(['status' => 'success', 'data' => $redirect]);
    }

    public function deleteRedirect($id)
    {
        Redirect::findOrFail($id)->delete();
        return response()->json(['status' => 'success']);
    }

    /**
     * Save Robots.txt content
     */
    public function saveRobotsTxt(Request $request)
    {
        $content = $request->input('content');
        $setting = Setting::first();
        if ($setting) {
            $setting->update(['robots_txt_content' => $content]);
        }
        return response()->json(['status' => 'success', 'message' => 'Robots.txt updated successfully']);
    }

    /**
     * SEO Metas CRUD
     */
    public function getSeoMetas()
    {
        return response()->json(SeoMeta::orderBy('id', 'desc')->get());
    }

    public function saveSeoMeta(Request $request)
    {
        $meta = SeoMeta::updateOrCreate(
            ['id' => $request->input('id')],
            [
                'url_path' => $request->input('url_path'),
                'meta_title' => $request->input('meta_title'),
                'meta_description' => $request->input('meta_description'),
                'meta_keywords' => $request->input('meta_keywords'),
                'focus_keyword' => $request->input('focus_keyword'),
                'canonical_url' => $request->input('canonical_url'),
                'robots_meta' => $request->input('robots_meta', 'index, follow'),
                'og_title' => $request->input('og_title'),
                'og_description' => $request->input('og_description'),
                'og_image' => $request->input('og_image'),
                'twitter_title' => $request->input('twitter_title'),
                'twitter_description' => $request->input('twitter_description'),
                'twitter_image' => $request->input('twitter_image'),
                'faq_json' => $request->input('faq_json'),
            ]
        );

        return response()->json(['status' => 'success', 'data' => $meta]);
    }
}
