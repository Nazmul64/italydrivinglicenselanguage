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
        // Drop dummy old table if it exists
        Schema::dropIfExists('cartelli_and_cartello_question_tables');

        // 1. Cartelli Chapters/Categories
        Schema::create('cartelli_chapters', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Pericolo
            $table->string('bn_name')->nullable(); // বিপদ
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 2. Cartelli Pages (Individual signs under a chapter)
        Schema::create('cartelli_pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chapter_id');
            $table->string('title'); // e.g. Strada deformata
            $table->string('bn_title')->nullable();
            $table->string('image')->nullable(); // uploaded sign image path
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('chapter_id')->references('id')->on('cartelli_chapters')->onDelete('cascade');
        });

        // 3. Cartelli Questions/MCQs mapped to each page
        Schema::create('cartelli_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->text('italian');
            $table->text('bangla')->nullable();
            $table->boolean('is_vero')->default(true);
            $table->text('explanation')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();

            $table->foreign('page_id')->references('id')->on('cartelli_pages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cartelli_questions');
        Schema::dropIfExists('cartelli_pages');
        Schema::dropIfExists('cartelli_chapters');
    }
};
