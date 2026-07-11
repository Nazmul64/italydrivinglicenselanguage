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
        // 1. Sliders Table
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_url');
            $table->string('link_url')->nullable();
            $table->timestamps();
        });

        // 2. Lecture Classes (lessons) Table
        Schema::create('lecture_classes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('duration')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('video_url');
            $table->timestamps();
        });

        // 3. Live Classes Table
        Schema::create('live_classes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->dateTime('scheduled_at');
            $table->string('room_link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_classes');
        Schema::dropIfExists('lecture_classes');
        Schema::dropIfExists('sliders');
    }
};
