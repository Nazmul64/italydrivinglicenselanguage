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
        if (Schema::hasTable('questions') && !Schema::hasColumn('questions', 'image_position')) {
            Schema::table('questions', function (Blueprint $table) {
                $table->string('image_position', 20)->default('left')->after('image');
            });
        }

        if (Schema::hasTable('cartello_mcqs') && !Schema::hasColumn('cartello_mcqs', 'image_position')) {
            Schema::table('cartello_mcqs', function (Blueprint $table) {
                $table->string('image_position', 20)->default('left')->after('image');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('questions') && Schema::hasColumn('questions', 'image_position')) {
            Schema::table('questions', function (Blueprint $table) {
                $table->dropColumn('image_position');
            });
        }

        if (Schema::hasTable('cartello_mcqs') && Schema::hasColumn('cartello_mcqs', 'image_position')) {
            Schema::table('cartello_mcqs', function (Blueprint $table) {
                $table->dropColumn('image_position');
            });
        }
    }
};
