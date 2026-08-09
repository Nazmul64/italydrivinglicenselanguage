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
        if (Schema::hasTable('saved_mcqs') && !Schema::hasColumn('saved_mcqs', 'type')) {
            Schema::table('saved_mcqs', function (Blueprint $table) {
                $table->string('type')->default('argomenti')->nullable()->after('question_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('saved_mcqs') && Schema::hasColumn('saved_mcqs', 'type')) {
            Schema::table('saved_mcqs', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
};
