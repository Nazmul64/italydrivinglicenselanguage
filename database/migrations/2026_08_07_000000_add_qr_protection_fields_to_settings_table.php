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
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'qr_protection_enabled')) {
                $table->boolean('qr_protection_enabled')->default(true);
            }
            if (!Schema::hasColumn('settings', 'qr_target_mode')) {
                $table->string('qr_target_mode')->default('live'); // 'live' or 'local'
            }
            if (!Schema::hasColumn('settings', 'qr_live_url')) {
                $table->string('qr_live_url')->default('http://mbanglapatenteb.com');
            }
            if (!Schema::hasColumn('settings', 'qr_local_url')) {
                $table->string('qr_local_url')->default('http://127.0.0.1:8000');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (Schema::hasColumn('settings', 'qr_protection_enabled')) {
                $table->dropColumn('qr_protection_enabled');
            }
            if (Schema::hasColumn('settings', 'qr_target_mode')) {
                $table->dropColumn('qr_target_mode');
            }
            if (Schema::hasColumn('settings', 'qr_live_url')) {
                $table->dropColumn('qr_live_url');
            }
            if (Schema::hasColumn('settings', 'qr_local_url')) {
                $table->dropColumn('qr_local_url');
            }
        });
    }
};
