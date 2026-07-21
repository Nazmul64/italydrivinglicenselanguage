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
        // Drop cartello_mcqs table
        Schema::dropIfExists('cartello_mcqs');

        // Modify cartello_pages table
        Schema::table('cartello_pages', function (Blueprint $table) {
            if (!Schema::hasColumn('cartello_pages', 'voice')) {
                $table->string('voice')->nullable()->after('image');
            }
            if (!Schema::hasColumn('cartello_pages', 'translation')) {
                $table->text('translation')->nullable()->after('voice');
            }
            if (!Schema::hasColumn('cartello_pages', 'is_vero')) {
                $table->boolean('is_vero')->default(true)->after('translation');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cartello_pages', function (Blueprint $table) {
            $table->dropColumn(['voice', 'translation', 'is_vero']);
        });

        // Recreate cartello_mcqs table
        Schema::create('cartello_mcqs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->text('question');          // Italian Question
            $table->text('bn_question');       // Bangla Question
            $table->text('option_a')->nullable();
            $table->text('bn_option_a')->nullable();
            $table->text('option_b')->nullable();
            $table->text('bn_option_b')->nullable();
            $table->text('option_c')->nullable();
            $table->text('bn_option_c')->nullable();
            $table->text('option_d')->nullable();
            $table->text('bn_option_d')->nullable();
            $table->string('correct_answer');  // a, b, c, d
            $table->text('explanation')->nullable();
            $table->text('bn_explanation')->nullable();
            $table->string('image')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('page_id')->references('id')->on('cartello_pages')->onDelete('cascade');
        });
    }
};
