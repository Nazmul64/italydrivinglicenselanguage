<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_sheets', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_sheets', 'avatar')) {
                $table->string('avatar')->nullable()->after('student_name');
            }
            if (!Schema::hasColumn('exam_sheets', 'user_id')) {
                $table->string('user_id')->nullable()->index()->after('answers');
            }
            if (!Schema::hasColumn('exam_sheets', 'session_id')) {
                $table->string('session_id')->nullable()->index()->after('user_id');
            }
            if (!Schema::hasColumn('exam_sheets', 'is_passed')) {
                $table->boolean('is_passed')->default(true)->index()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_sheets', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'user_id', 'session_id', 'is_passed']);
        });
    }
};
