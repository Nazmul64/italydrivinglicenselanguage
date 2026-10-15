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
        if (Schema::hasTable('chat_presets') && !Schema::hasColumn('chat_presets', 'duration_seconds')) {
            Schema::table('chat_presets', function (Blueprint $table) {
                $table->unsignedBigInteger('duration_seconds')->nullable()->after('days');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('chat_presets') && Schema::hasColumn('chat_presets', 'duration_seconds')) {
            Schema::table('chat_presets', function (Blueprint $table) {
                $table->dropColumn('duration_seconds');
            });
        }
    }
};
