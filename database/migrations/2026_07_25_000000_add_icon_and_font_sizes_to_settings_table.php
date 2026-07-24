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
                if (!Schema::hasColumn('settings', 'icon_size_desktop')) {
                    $table->integer('icon_size_desktop')->default(90);
                }
                if (!Schema::hasColumn('settings', 'icon_size_mobile')) {
                    $table->integer('icon_size_mobile')->default(60);
                }
                if (!Schema::hasColumn('settings', 'title_font_size_desktop')) {
                    $table->integer('title_font_size_desktop')->default(16);
                }
                if (!Schema::hasColumn('settings', 'title_font_size_mobile')) {
                    $table->integer('title_font_size_mobile')->default(14);
                }
                if (!Schema::hasColumn('settings', 'subtitle_font_size_desktop')) {
                    $table->integer('subtitle_font_size_desktop')->default(12);
                }
                if (!Schema::hasColumn('settings', 'subtitle_font_size_mobile')) {
                    $table->integer('subtitle_font_size_mobile')->default(11);
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
                    'icon_size_desktop',
                    'icon_size_mobile',
                    'title_font_size_desktop',
                    'title_font_size_mobile',
                    'subtitle_font_size_desktop',
                    'subtitle_font_size_mobile',
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
