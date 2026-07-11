<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('app_clients', function (Blueprint $table) {
            if (!Schema::hasColumn('app_clients', 'expires_at')) {
                $table->dateTime('expires_at')->nullable()->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_clients', function (Blueprint $table) {
            if (Schema::hasColumn('app_clients', 'expires_at')) {
                $table->dropColumn('expires_at');
            }
        });
    }
};
