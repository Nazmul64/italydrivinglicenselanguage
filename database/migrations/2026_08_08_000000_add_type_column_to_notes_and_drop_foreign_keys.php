<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop foreign keys on notes table if any
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            $constraints = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'notes' 
                  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ");

            foreach ($constraints as $c) {
                DB::statement("ALTER TABLE `notes` DROP FOREIGN KEY `{$c->CONSTRAINT_NAME}`");
            }
        }

        // 2. Add type column to notes table
        if (Schema::hasTable('notes') && !Schema::hasColumn('notes', 'type')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->string('type')->default('argomenti')->nullable()->after('question_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('notes') && Schema::hasColumn('notes', 'type')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
};
