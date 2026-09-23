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
        if (Schema::hasTable('user_mcq_results')) {
            Schema::table('user_mcq_results', function (Blueprint $table) {
                if (!Schema::hasColumn('user_mcq_results', 'question_type')) {
                    $table->string('question_type')->nullable()->default('argomenti')->after('question_id')->index();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_mcq_results')) {
            Schema::table('user_mcq_results', function (Blueprint $table) {
                if (Schema::hasColumn('user_mcq_results', 'question_type')) {
                    $table->dropColumn('question_type');
                }
            });
        }
    }
};
