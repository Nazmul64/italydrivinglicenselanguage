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
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'font_family')) {
                    $table->string('font_family')->nullable()->default('Inter');
                }
                if (!Schema::hasColumn('settings', 'font_weight')) {
                    $table->string('font_weight')->nullable()->default('normal');
                }
            });
        }

        if (Schema::hasTable('user_mcq_results')) {
            Schema::table('user_mcq_results', function (Blueprint $table) {
                if (!Schema::hasColumn('user_mcq_results', 'correct_count')) {
                    $table->unsignedInteger('correct_count')->default(0);
                }
                if (!Schema::hasColumn('user_mcq_results', 'wrong_count')) {
                    $table->unsignedInteger('wrong_count')->default(0);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (Schema::hasColumn('settings', 'font_family')) {
                    $table->dropColumn('font_family');
                }
                if (Schema::hasColumn('settings', 'font_weight')) {
                    $table->dropColumn('font_weight');
                }
            });
        }

        if (Schema::hasTable('user_mcq_results')) {
            Schema::table('user_mcq_results', function (Blueprint $table) {
                if (Schema::hasColumn('user_mcq_results', 'correct_count')) {
                    $table->dropColumn('correct_count');
                }
                if (Schema::hasColumn('user_mcq_results', 'wrong_count')) {
                    $table->dropColumn('wrong_count');
                }
            });
        }
    }
};
