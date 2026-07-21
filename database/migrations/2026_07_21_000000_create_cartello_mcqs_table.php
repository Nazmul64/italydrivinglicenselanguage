<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('cartello_mcqs');
        Schema::create('cartello_mcqs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id')->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->text('question')->nullable();
            $table->text('bn_question')->nullable();
            $table->string('correct_answer')->default('vero')->nullable();
            $table->text('explanation')->nullable();
            $table->text('bn_explanation')->nullable();
            $table->string('image')->nullable();
            $table->string('voice')->nullable();
            $table->string('video')->nullable();
            $table->json('vocabulary')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartello_mcqs');
    }
};
