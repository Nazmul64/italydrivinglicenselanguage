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
        Schema::table('questions', function (Blueprint $table) {
            $table->text('option_a')->nullable()->after('bangla');
            $table->text('option_b')->nullable()->after('option_a');
            $table->text('option_c')->nullable()->after('option_b');
            $table->text('option_d')->nullable()->after('option_c');
            $table->string('correct_answer')->nullable()->after('option_d');
            $table->text('explanation')->nullable()->after('correct_answer');
            $table->string('image')->nullable()->after('explanation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'image']);
        });
    }
};
