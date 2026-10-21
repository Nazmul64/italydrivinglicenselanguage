<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'is_uninstalled')) {
                    $table->boolean('is_uninstalled')->default(false)->after('role');
                }
                if (!Schema::hasColumn('users', 'install_uuid')) {
                    $table->string('install_uuid')->nullable()->after('is_uninstalled');
                }
            });
        }

        if (Schema::hasTable('app_clients')) {
            Schema::table('app_clients', function (Blueprint $table) {
                if (!Schema::hasColumn('app_clients', 'is_uninstalled')) {
                    $table->boolean('is_uninstalled')->default(false)->after('is_active');
                }
                if (!Schema::hasColumn('app_clients', 'install_uuid')) {
                    $table->string('install_uuid')->nullable()->after('is_uninstalled');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'is_uninstalled')) {
                    $table->dropColumn('is_uninstalled');
                }
                if (Schema::hasColumn('users', 'install_uuid')) {
                    $table->dropColumn('install_uuid');
                }
            });
        }

        if (Schema::hasTable('app_clients')) {
            Schema::table('app_clients', function (Blueprint $table) {
                if (Schema::hasColumn('app_clients', 'is_uninstalled')) {
                    $table->dropColumn('is_uninstalled');
                }
                if (Schema::hasColumn('app_clients', 'install_uuid')) {
                    $table->dropColumn('install_uuid');
                }
            });
        }
    }
};
