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
        Schema::table('home_cards', function (Blueprint $table) {
            if (!Schema::hasColumn('home_cards', 'media_type')) {
                $table->string('media_type', 20)->default('icon')->after('screen_key');
            }
            if (!Schema::hasColumn('home_cards', 'image_url')) {
                $table->string('image_url', 500)->nullable()->after('icon_url');
            }
            if (!Schema::hasColumn('home_cards', 'lottie_url')) {
                $table->string('lottie_url', 500)->nullable()->after('image_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_cards', function (Blueprint $table) {
            if (Schema::hasColumn('home_cards', 'media_type')) {
                $table->dropColumn('media_type');
            }
            if (Schema::hasColumn('home_cards', 'image_url')) {
                $table->dropColumn('image_url');
            }
            if (Schema::hasColumn('home_cards', 'lottie_url')) {
                $table->dropColumn('lottie_url');
            }
        });
    }
};
