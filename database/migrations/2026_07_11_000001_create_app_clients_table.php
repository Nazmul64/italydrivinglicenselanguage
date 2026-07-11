<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('app_clients')) {
            Schema::create('app_clients', function (Blueprint $table) {
                $table->id();
                $table->string('session_id')->unique();
                $table->string('first_name')->nullable();
                $table->string('last_name')->nullable();
                $table->string('phone')->nullable();
                $table->boolean('is_active')->default(false);
                $table->integer('stars')->default(3);
                $table->integer('progress')->default(50);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_clients');
    }
};
