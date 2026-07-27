<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('app_clients', function (Blueprint $table) {
            if (!Schema::hasColumn('app_clients', 'avatar')) {
                $table->string('avatar')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('app_clients', 'is_blocked')) {
                $table->boolean('is_blocked')->default(false)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('app_clients', function (Blueprint $table) {
            if (Schema::hasColumn('app_clients', 'avatar')) {
                $table->dropColumn('avatar');
            }
            if (Schema::hasColumn('app_clients', 'is_blocked')) {
                $table->dropColumn('is_blocked');
            }
        });
    }
};
