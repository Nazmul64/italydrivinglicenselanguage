<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Chapter;
use App\Models\Category;
use App\Models\CartelloCategory;
use App\Models\Question;
use App\Models\LectureClass;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SitemapController extends Controller
{
    /**
     * Main Sitemap Index (/sitemap.xml)
     */
    public function index()
    {
        $content = '<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>' . url('/sitemaps/pages.xml') . '</loc>
        <lastmod>' . date('c') . '</lastmod>
    </sitemap>
    <sitemap>
        <loc>' . url('/sitemaps/categories.xml') . '</loc>
        <lastmod>' . date('c') . '</lastmod>
    </sitemap>
    <sitemap>
        <loc>' . url('/sitemaps/products.xml') . '</loc>
        <lastmod>' . date('c') . '</lastmod>
    </sitemap>
</sitemapindex>';

        return response($content, 200, ['Content-Type' => 'text/xml']);
    }

    /**
     * Static Pages Sitemap (/sitemaps/pages.xml)
     */
    public function pages()
    {
        $urls = [
            ['loc' => url('/'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => url('/app'), 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => url('/sitemap'), 'priority' => '0.5', 'changefreq' => 'weekly'],
        ];

        return $this->buildSitemapResponse($urls);
    }

    /**
     * Categories Sitemap (/sitemaps/categories.xml)
     */
    public function categories()
    {
        $urls = [];

        $chapters = Chapter::orderBy('updated_at', 'desc')->get();
        foreach ($chapters as $c) {
            $urls[] = [
                'loc' => url('/?chapter=' . $c->id),
                'lastmod' => $c->updated_at ? $c->updated_at->toIso8601String() : date('c'),
                'priority' => '0.8',
                'changefreq' => 'weekly'
            ];
        }

        $cartelliCats = CartelloCategory::orderBy('updated_at', 'desc')->get();
        foreach ($cartelliCats as $cc) {
            $urls[] = [
                'loc' => url('/?cartelli_cat=' . $cc->id),
                'lastmod' => $cc->updated_at ? $cc->updated_at->toIso8601String() : date('c'),
                'priority' => '0.7',
                'changefreq' => 'weekly'
            ];
        }

        return $this->buildSitemapResponse($urls);
    }

    /**
     * Products & Course Material Sitemap (/sitemaps/products.xml)
     */
    public function products()
    {
        $urls = [];

        $lectures = LectureClass::orderBy('updated_at', 'desc')->get();
        foreach ($lectures as $l) {
            $urls[] = [
                'loc' => url('/?lecture=' . $l->id),
                'lastmod' => $l->updated_at ? $l->updated_at->toIso8601String() : date('c'),
                'priority' => '0.9',
                'changefreq' => 'daily'
            ];
        }

        return $this->buildSitemapResponse($urls);
    }

    /**
     * HTML Sitemap Page (/sitemap)
     */
    public function htmlSitemap()
    {
        $chapters = Chapter::with('pages')->orderBy('sort_order', 'asc')->get();
        $cartelliCats = CartelloCategory::orderBy('id', 'asc')->get();
        $lectures = LectureClass::orderBy('id', 'asc')->get();

        $seo = \App\Services\SeoService::getSeoData(
            'HTML Sitemap | Italy Bangla Patente',
            'Full directory of chapters, topics, lecture classes, and cartelli categories for Italy Bangla Patente B driving license course.',
            null,
            null,
            null,
            ['Sitemap' => url('/sitemap')]
        );

        return view('frontend.sitemap', compact('chapters', 'cartelliCats', 'lectures', 'seo'));
    }

    /**
     * Helper to render XML response from URL list
     */
    protected function buildSitemapResponse(array $urls)
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $u) {
            $xml .= '  <url>' . "\n";
            $xml .= '    <loc>' . htmlspecialchars($u['loc']) . '</loc>' . "\n";
            if (!empty($u['lastmod'])) {
                $xml .= '    <lastmod>' . htmlspecialchars($u['lastmod']) . '</lastmod>' . "\n";
            }
            $xml .= '    <changefreq>' . ($u['changefreq'] ?? 'weekly') . '</changefreq>' . "\n";
            $xml .= '    <priority>' . ($u['priority'] ?? '0.5') . '</priority>' . "\n";
            $xml .= '  </url>' . "\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'text/xml']);
    }
}
