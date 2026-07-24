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
        Schema::create('manuales', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('chapter_number')->default(1);
            $table->longText('content')->nullable();
            $table->string('image_path')->nullable();
            $table->string('audio_path')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manuales');
    }
};
