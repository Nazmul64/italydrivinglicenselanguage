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
        if (Schema::hasTable('licenses') && !Schema::hasColumn('licenses', 'duration_seconds')) {
            Schema::table('licenses', function (Blueprint $table) {
                $table->unsignedBigInteger('duration_seconds')->nullable()->default(31536000)->after('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('licenses') && Schema::hasColumn('licenses', 'duration_seconds')) {
            Schema::table('licenses', function (Blueprint $table) {
                $table->dropColumn('duration_seconds');
            });
        }
    }
};
