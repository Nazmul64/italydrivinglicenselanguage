<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            if (!Schema::hasColumn('chapters', 'category_id')) {
                $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null')->after('id');
            }
            if (!Schema::hasColumn('chapters', 'video_url')) {
                $table->string('video_url')->nullable()->after('description');
            }
            if (!Schema::hasColumn('chapters', 'video_status')) {
                $table->boolean('video_status')->default(true)->after('video_url');
            }
            if (!Schema::hasColumn('chapters', 'estimated_minutes')) {
                $table->integer('estimated_minutes')->default(30)->after('video_status');
            }
        });

        Schema::table('pages', function (Blueprint $table) {
            if (!Schema::hasColumn('pages', 'video_status')) {
                $table->boolean('video_status')->default(true)->after('video');
            }
            if (!Schema::hasColumn('pages', 'estimated_minutes')) {
                $table->integer('estimated_minutes')->default(10)->after('video_status');
            }
        });

        // Set default category for existing chapters to Patente B (id = 2)
        DB::table('chapters')->whereNull('category_id')->update(['category_id' => 2]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            if (Schema::hasColumn('chapters', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }
            $table->dropColumn(['video_url', 'video_status', 'estimated_minutes']);
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['video_status', 'estimated_minutes']);
        });
    }
};
