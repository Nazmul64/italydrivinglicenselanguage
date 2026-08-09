<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Redirects Table for 301/302 URL Redirect Manager
        if (!Schema::hasTable('redirects')) {
            Schema::create('redirects', function (Blueprint $table) {
                $table->id();
                $table->string('source_url')->unique();
                $table->string('destination_url');
                $table->integer('status_code')->default(301);
                $table->boolean('is_active')->default(true);
                $table->unsignedBigInteger('hits')->default(0);
                $table->timestamps();
            });
        }

        // 2. SEO Health Logs for 404 Errors & Broken Links Audit
        if (!Schema::hasTable('seo_health_logs')) {
            Schema::create('seo_health_logs', function (Blueprint $table) {
                $table->id();
                $table->string('url')->index();
                $table->string('referer')->nullable();
                $table->string('user_agent')->nullable();
                $table->string('ip_address')->nullable();
                $table->unsignedBigInteger('hits')->default(1);
                $table->timestamps();
            });
        }

        // 3. Polymorphic SEO Metas Table
        if (!Schema::hasTable('seo_metas')) {
            Schema::create('seo_metas', function (Blueprint $table) {
                $table->id();
                $table->nullableMorphs('seoable'); // seoable_type & seoable_id
                $table->string('url_path')->nullable()->index();
                $table->string('meta_title')->nullable();
                $table->text('meta_description')->nullable();
                $table->text('meta_keywords')->nullable();
                $table->string('focus_keyword')->nullable();
                $table->string('canonical_url')->nullable();
                $table->string('robots_meta')->default('index, follow');
                $table->string('og_title')->nullable();
                $table->text('og_description')->nullable();
                $table->string('og_image')->nullable();
                $table->string('twitter_title')->nullable();
                $table->text('twitter_description')->nullable();
                $table->string('twitter_image')->nullable();
                $table->json('faq_json')->nullable();
                $table->json('schema_json')->nullable();
                $table->timestamps();
            });
        }

        // 4. Add enterprise SEO & Analytics fields to settings table if missing
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'company_name')) {
                $table->string('company_name')->nullable()->after('app_name');
            }
            if (!Schema::hasColumn('settings', 'company_phone')) {
                $table->string('company_phone')->nullable();
            }
            if (!Schema::hasColumn('settings', 'company_email')) {
                $table->string('company_email')->nullable();
            }
            if (!Schema::hasColumn('settings', 'company_address')) {
                $table->text('company_address')->nullable();
            }
            if (!Schema::hasColumn('settings', 'geo_latitude')) {
                $table->string('geo_latitude')->nullable();
            }
            if (!Schema::hasColumn('settings', 'geo_longitude')) {
                $table->string('geo_longitude')->nullable();
            }
            if (!Schema::hasColumn('settings', 'opening_hours')) {
                $table->string('opening_hours')->nullable();
            }
            if (!Schema::hasColumn('settings', 'social_facebook')) {
                $table->string('social_facebook')->nullable();
            }
            if (!Schema::hasColumn('settings', 'social_twitter')) {
                $table->string('social_twitter')->nullable();
            }
            if (!Schema::hasColumn('settings', 'social_instagram')) {
                $table->string('social_instagram')->nullable();
            }
            if (!Schema::hasColumn('settings', 'social_youtube')) {
                $table->string('social_youtube')->nullable();
            }
            if (!Schema::hasColumn('settings', 'social_linkedin')) {
                $table->string('social_linkedin')->nullable();
            }
            if (!Schema::hasColumn('settings', 'robots_txt_content')) {
                $table->text('robots_txt_content')->nullable();
            }
            if (!Schema::hasColumn('settings', 'ga4_measurement_id')) {
                $table->string('ga4_measurement_id')->nullable();
            }
            if (!Schema::hasColumn('settings', 'search_console_verification')) {
                $table->string('search_console_verification')->nullable();
            }
            if (!Schema::hasColumn('settings', 'gtm_container_id')) {
                $table->string('gtm_container_id')->nullable();
            }
            if (!Schema::hasColumn('settings', 'fb_pixel_id')) {
                $table->string('fb_pixel_id')->nullable();
            }
            if (!Schema::hasColumn('settings', 'clarity_project_id')) {
                $table->string('clarity_project_id')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('seo_health_logs');
        Schema::dropIfExists('seo_metas');
    }
};
