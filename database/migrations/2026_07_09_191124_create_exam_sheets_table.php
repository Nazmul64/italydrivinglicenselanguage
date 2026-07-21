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
        Schema::create('exam_sheets', function (Blueprint $table) {
            $table->id();
            $table->string('student_name');
            $table->string('motorizzazione');
            $table->string('exam_date');
            $table->string('status')->default('new'); // 'new', 'completed'
            $table->integer('correct_count')->default(0);
            $table->integer('wrong_count')->default(0);
            $table->integer('unanswered_count')->default(30);
            $table->integer('total_count')->default(30);
            $table->text('answers')->nullable(); // JSON representation of selections
            $table->timestamps();
        });

        // Set starting auto-increment value to 6240 if using mysql
        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE exam_sheets AUTO_INCREMENT = 6240;');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sheets');
    }
};
