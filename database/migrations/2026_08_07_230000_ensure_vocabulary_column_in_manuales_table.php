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
        if (Schema::hasTable('manuales') && !Schema::hasColumn('manuales', 'vocabulary')) {
            Schema::table('manuales', function (Blueprint $table) {
                $table->text('vocabulary')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('manuales') && Schema::hasColumn('manuales', 'vocabulary')) {
            Schema::table('manuales', function (Blueprint $table) {
                $table->dropColumn('vocabulary');
            });
        }
    }
};
