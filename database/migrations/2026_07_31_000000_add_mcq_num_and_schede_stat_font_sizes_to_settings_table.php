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
                if (!Schema::hasColumn('settings', 'mcq_number_font_desktop')) {
                    $table->integer('mcq_number_font_desktop')->default(16);
                }
                if (!Schema::hasColumn('settings', 'mcq_number_font_mobile')) {
                    $table->integer('mcq_number_font_mobile')->default(14);
                }
                if (!Schema::hasColumn('settings', 'schede_stat_font_desktop')) {
                    $table->integer('schede_stat_font_desktop')->default(13);
                }
                if (!Schema::hasColumn('settings', 'schede_stat_font_mobile')) {
                    $table->integer('schede_stat_font_mobile')->default(11);
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
                    'mcq_number_font_desktop',
                    'mcq_number_font_mobile',
                    'schede_stat_font_desktop',
                    'schede_stat_font_mobile',
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
