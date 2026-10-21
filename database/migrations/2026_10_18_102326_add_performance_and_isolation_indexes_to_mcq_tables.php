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
        Schema::table('saved_mcqs', function (Blueprint $table) {
            $table->index(['session_id', 'question_id'], 'saved_mcqs_session_question_idx');
            $table->index(['user_id', 'question_id'], 'saved_mcqs_user_question_idx');
            $table->index('session_id', 'saved_mcqs_session_id_idx');
            $table->index('user_id', 'saved_mcqs_user_id_idx');
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->index(['session_id', 'question_id'], 'notes_session_question_idx');
            $table->index(['user_id', 'question_id'], 'notes_user_question_idx');
            $table->index('session_id', 'notes_session_id_idx');
            $table->index('user_id', 'notes_user_id_idx');
        });

        Schema::table('app_clients', function (Blueprint $table) {
            $table->index('phone', 'app_clients_phone_idx');
            $table->index('session_id', 'app_clients_session_id_idx');
        });

        Schema::table('user_mcq_results', function (Blueprint $table) {
            $table->index(['user_id', 'is_correct'], 'umr_user_correct_idx');
            $table->index(['session_id', 'is_correct'], 'umr_session_correct_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saved_mcqs', function (Blueprint $table) {
            $table->dropIndex('saved_mcqs_session_question_idx');
            $table->dropIndex('saved_mcqs_user_question_idx');
            $table->dropIndex('saved_mcqs_session_id_idx');
            $table->dropIndex('saved_mcqs_user_id_idx');
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->dropIndex('notes_session_question_idx');
            $table->dropIndex('notes_user_question_idx');
            $table->dropIndex('notes_session_id_idx');
            $table->dropIndex('notes_user_id_idx');
        });

        Schema::table('app_clients', function (Blueprint $table) {
            $table->dropIndex('app_clients_phone_idx');
            $table->dropIndex('app_clients_session_id_idx');
        });

        Schema::table('user_mcq_results', function (Blueprint $table) {
            $table->dropIndex('umr_user_correct_idx');
            $table->dropIndex('umr_session_correct_idx');
        });
    }
};
