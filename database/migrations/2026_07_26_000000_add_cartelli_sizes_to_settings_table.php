<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'cartelli_chapter_title_font_desktop')) {
                    $table->integer('cartelli_chapter_title_font_desktop')->default(16);
                }
                if (!Schema::hasColumn('settings', 'cartelli_chapter_title_font_mobile')) {
                    $table->integer('cartelli_chapter_title_font_mobile')->default(14);
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_title_font_desktop')) {
                    $table->integer('cartelli_page_title_font_desktop')->default(15);
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_title_font_mobile')) {
                    $table->integer('cartelli_page_title_font_mobile')->default(13);
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_image_size_desktop')) {
                    $table->integer('cartelli_page_image_size_desktop')->default(120);
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_image_size_mobile')) {
                    $table->integer('cartelli_page_image_size_mobile')->default(80);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                $cols = [
                    'cartelli_chapter_title_font_desktop',
                    'cartelli_chapter_title_font_mobile',
                    'cartelli_page_title_font_desktop',
                    'cartelli_page_title_font_mobile',
                    'cartelli_page_image_size_desktop',
                    'cartelli_page_image_size_mobile',
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('settings', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
