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
                if (!Schema::hasColumn('settings', 'primary_color')) {
                    $table->string('primary_color')->default('#F4F7FA');
                }
                if (!Schema::hasColumn('settings', 'accent_color')) {
                    $table->string('accent_color')->default('#4CAF50');
                }
                if (!Schema::hasColumn('settings', 'text_color')) {
                    $table->string('text_color')->default('#1e293b');
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
                $cols = ['primary_color', 'accent_color', 'text_color'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('settings', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
