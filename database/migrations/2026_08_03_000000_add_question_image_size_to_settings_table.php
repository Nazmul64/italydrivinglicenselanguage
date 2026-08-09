<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'argomenti_question_image_size_desktop')) {
                    $table->integer('argomenti_question_image_size_desktop')->default(110)->nullable();
                }
                if (!Schema::hasColumn('settings', 'argomenti_question_image_size_mobile')) {
                    $table->integer('argomenti_question_image_size_mobile')->default(85)->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (Schema::hasColumn('settings', 'argomenti_question_image_size_desktop')) {
                    $table->dropColumn('argomenti_question_image_size_desktop');
                }
                if (Schema::hasColumn('settings', 'argomenti_question_image_size_mobile')) {
                    $table->dropColumn('argomenti_question_image_size_mobile');
                }
            });
        }
    }
};
