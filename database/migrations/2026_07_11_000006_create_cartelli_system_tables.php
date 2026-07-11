<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates 3 tables:
     *  - cartello_categories : Pericolo / Divieto / Obbligo etc.
     *  - cartelli            : Individual road-sign figures (image + name)
     *  - cartello_questions  : MCQ questions per figure
     */
    public function up(): void
    {
        // Drop old placeholder tables if they exist (from 2026_07_10_104624)
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('cartello_questions');
        Schema::dropIfExists('cartelli');
        Schema::dropIfExists('cartello_categories');
        Schema::dropIfExists('cartelli_and_cartello_question_tables');
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // 1. Categories table
        Schema::create('cartello_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g. "Pericolo"
            $table->string('bn_name');        // e.g. "বিপদ চিহ্ন"
            $table->string('color', 20)->nullable(); // hex color for badge
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        // 2. Cartelli (road sign figures) table
        Schema::create('cartelli', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');           // Italian sign name
            $table->string('bn_name')->nullable(); // Bangla name
            $table->text('description')->nullable();
            $table->text('bn_description')->nullable();
            $table->string('image')->nullable();  // sign image path
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('cartello_categories')->onDelete('cascade');
        });

        // 3. Cartello Questions (MCQs) table
        Schema::create('cartello_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cartello_id');
            $table->text('italian');          // Question text in Italian
            $table->text('bangla');           // Question text in Bangla
            $table->string('question_type')->default('vero_falso'); // vero_falso | mcq
            $table->boolean('is_vero')->nullable();                 // for vero_falso type
            $table->string('option_a')->nullable();                 // for mcq type
            $table->string('option_b')->nullable();
            $table->string('option_c')->nullable();
            $table->string('option_d')->nullable();
            $table->string('correct_answer')->nullable();           // 'a'|'b'|'c'|'d'
            $table->text('explanation')->nullable();
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('cartello_id')->references('id')->on('cartelli')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cartello_questions');
        Schema::dropIfExists('cartelli');
        Schema::dropIfExists('cartello_categories');
    }
};
