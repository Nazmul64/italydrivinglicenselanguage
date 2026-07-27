<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_presets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type')->default('text');
            $table->integer('days')->nullable();
            $table->text('message_text')->nullable();
            $table->string('bg_color')->default('#4b5563');
            $table->string('text_color')->default('#ffffff');
            $table->integer('order_index')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_presets');
    }
};
