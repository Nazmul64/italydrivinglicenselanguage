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
                if (!Schema::hasColumn('settings', 'home_desktop_columns')) {
                    $table->integer('home_desktop_columns')->default(4);
                }
                if (!Schema::hasColumn('settings', 'home_tablet_columns')) {
                    $table->integer('home_tablet_columns')->default(3);
                }
                if (!Schema::hasColumn('settings', 'home_mobile_columns')) {
                    $table->integer('home_mobile_columns')->default(2);
                }
                if (!Schema::hasColumn('settings', 'home_card_width')) {
                    $table->string('home_card_width')->nullable();
                }
                if (!Schema::hasColumn('settings', 'home_card_height')) {
                    $table->string('home_card_height')->nullable();
                }
                if (!Schema::hasColumn('settings', 'home_card_gap')) {
                    $table->integer('home_card_gap')->default(24);
                }
                if (!Schema::hasColumn('settings', 'schede_desktop_columns')) {
                    $table->integer('schede_desktop_columns')->default(2);
                }
                if (!Schema::hasColumn('settings', 'schede_mobile_columns')) {
                    $table->integer('schede_mobile_columns')->default(1);
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
                    'home_desktop_columns',
                    'home_tablet_columns',
                    'home_mobile_columns',
                    'home_card_width',
                    'home_card_height',
                    'home_card_gap',
                    'schede_desktop_columns',
                    'schede_mobile_columns',
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
