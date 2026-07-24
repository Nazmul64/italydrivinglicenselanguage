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
                if (!Schema::hasColumn('settings', 'argomenti_chapter_title_font_desktop')) {
                    $table->integer('argomenti_chapter_title_font_desktop')->default(16);
                }
                if (!Schema::hasColumn('settings', 'argomenti_chapter_title_font_mobile')) {
                    $table->integer('argomenti_chapter_title_font_mobile')->default(14);
                }
                if (!Schema::hasColumn('settings', 'argomenti_page_title_font_desktop')) {
                    $table->integer('argomenti_page_title_font_desktop')->default(15);
                }
                if (!Schema::hasColumn('settings', 'argomenti_page_title_font_mobile')) {
                    $table->integer('argomenti_page_title_font_mobile')->default(13);
                }
                if (!Schema::hasColumn('settings', 'argomenti_question_text_font_desktop')) {
                    $table->integer('argomenti_question_text_font_desktop')->default(15);
                }
                if (!Schema::hasColumn('settings', 'argomenti_question_text_font_mobile')) {
                    $table->integer('argomenti_question_text_font_mobile')->default(13);
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
                    'argomenti_chapter_title_font_desktop',
                    'argomenti_chapter_title_font_mobile',
                    'argomenti_page_title_font_desktop',
                    'argomenti_page_title_font_mobile',
                    'argomenti_question_text_font_desktop',
                    'argomenti_question_text_font_mobile',
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
