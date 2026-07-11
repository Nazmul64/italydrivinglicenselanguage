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
        Schema::create('system_errors', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id')->unique();
            $table->text('message');
            $table->string('exception_type');
            $table->string('file');
            $table->integer('line');
            $table->string('function')->nullable();
            $table->string('controller')->nullable();
            $table->string('route')->nullable();
            $table->text('middleware')->nullable();
            $table->string('method');
            $table->text('url');
            $table->integer('status_code');
            $table->longText('stack_trace')->nullable();
            $table->text('sql_error')->nullable(); // JSON object or string if SQL QueryException
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->timestamps();
        });

        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->text('url');
            $table->string('method');
            $table->longText('request_data')->nullable();
            $table->longText('response_data')->nullable();
            $table->integer('status_code');
            $table->decimal('execution_time_ms', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_errors');
        Schema::dropIfExists('api_logs');
    }
};
