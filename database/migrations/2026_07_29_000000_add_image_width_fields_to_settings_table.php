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
                if (!Schema::hasColumn('settings', 'cartelli_chapter_image_width_desktop')) {
                    $table->string('cartelli_chapter_image_width_desktop')->nullable();
                }
                if (!Schema::hasColumn('settings', 'cartelli_chapter_image_width_mobile')) {
                    $table->string('cartelli_chapter_image_width_mobile')->nullable();
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_image_width_desktop')) {
                    $table->string('cartelli_page_image_width_desktop')->nullable();
                }
                if (!Schema::hasColumn('settings', 'cartelli_page_image_width_mobile')) {
                    $table->string('cartelli_page_image_width_mobile')->nullable();
                }

                if (!Schema::hasColumn('settings', 'argomenti_chapter_image_width_desktop')) {
                    $table->string('argomenti_chapter_image_width_desktop')->nullable();
                }
                if (!Schema::hasColumn('settings', 'argomenti_chapter_image_width_mobile')) {
                    $table->string('argomenti_chapter_image_width_mobile')->nullable();
                }
                if (!Schema::hasColumn('settings', 'argomenti_page_image_width_desktop')) {
                    $table->string('argomenti_page_image_width_desktop')->nullable();
                }
                if (!Schema::hasColumn('settings', 'argomenti_page_image_width_mobile')) {
                    $table->string('argomenti_page_image_width_mobile')->nullable();
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
                    'cartelli_chapter_image_width_desktop',
                    'cartelli_chapter_image_width_mobile',
                    'cartelli_page_image_width_desktop',
                    'cartelli_page_image_width_mobile',
                    'argomenti_chapter_image_width_desktop',
                    'argomenti_chapter_image_width_mobile',
                    'argomenti_page_image_width_desktop',
                    'argomenti_page_image_width_mobile',
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
