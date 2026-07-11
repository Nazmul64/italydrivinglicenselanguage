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
        // 1. Chapters Table
        Schema::create('chapters', function (Blueprint $table) {
            $table->id(); // Use custom ID matching 1-25
            $table->string('name');
            $table->string('bn_name')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // 2. Pages Table
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chapter_id');
            $table->string('title');
            $table->string('bn_title')->nullable();
            $table->text('content')->nullable();
            $table->string('image')->nullable();
            $table->string('audio')->nullable();
            $table->timestamps();

            $table->foreign('chapter_id')->references('id')->on('chapters')->onDelete('cascade');
        });

        // 3. Saved MCQs Table
        Schema::create('saved_mcqs', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('question_id');
            $table->timestamps();

            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });

        // 4. Notes Table
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('page_id')->nullable();
            $table->unsignedBigInteger('question_id')->nullable();
            $table->text('note_text');
            $table->timestamps();

            $table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });

        // 5. Add page_id to questions table
        Schema::table('questions', function (Blueprint $table) {
            $table->unsignedBigInteger('page_id')->nullable()->after('chapter_name');
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['page_id']);
            $table->dropColumn('page_id');
        });

        Schema::dropIfExists('notes');
        Schema::dropIfExists('saved_mcqs');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('chapters');
    }
};
