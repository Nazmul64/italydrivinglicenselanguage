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
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('cartello_questions');
        Schema::dropIfExists('cartelli');
        Schema::dropIfExists('cartello_categories');
        Schema::dropIfExists('cartello_mcqs');
        Schema::dropIfExists('cartello_pages');
        Schema::dropIfExists('cartello_chapters');
        Schema::enableForeignKeyConstraints();

        // 1. Categories
        Schema::create('cartello_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // Italian Category Name
            $table->string('bn_name');        // Bangla Category Name
            $table->text('description')->nullable();
            $table->text('bn_description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        // 2. Chapters (Max 25 per Category)
        Schema::create('cartello_chapters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');           // Italian Chapter Name
            $table->string('bn_name')->nullable(); // Bangla Chapter Name
            $table->integer('chapter_number');
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('cartello_categories')->onDelete('cascade');
        });

        // 3. Pages
        Schema::create('cartello_pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chapter_id');
            $table->integer('page_number');
            $table->string('title');           // Italian Page Title
            $table->string('bn_title');        // Bangla Page Title
            $table->text('description')->nullable();
            $table->text('bn_description')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('chapter_id')->references('id')->on('cartello_chapters')->onDelete('cascade');
        });

        // 4. MCQs
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cartello_mcqs');
        Schema::dropIfExists('cartello_pages');
        Schema::dropIfExists('cartello_chapters');
        Schema::dropIfExists('cartello_categories');
    }
};
