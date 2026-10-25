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
        Schema::create('live_passed_exams', function (Blueprint $table) {
            $table->id();
            $table->string('nome'); // e.g. "6731 GOFUR A"
            $table->string('motorizzazione')->nullable(); // e.g. "MODENA"
            $table->string('exam_date')->nullable(); // e.g. "19/10/2026"
            $table->string('status')->default('completato'); // 'nuove', 'completato'
            $table->integer('corrette')->default(28);
            $table->integer('errori')->default(2);
            $table->integer('non_risposte')->default(0);
            $table->integer('totale')->default(30);
            $table->string('pdf_path')->nullable(); // Path to uploaded PDF sheet
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_passed_exams');
    }
};
