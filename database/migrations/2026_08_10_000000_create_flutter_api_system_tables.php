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
        // 1. Upgrade users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'uuid')) {
                $table->uuid('uuid')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->unique()->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('phone');
            }
        });

        // Populate UUID for any existing users without UUID
        $existingUsers = \Illuminate\Support\Facades\DB::table('users')->whereNull('uuid')->get();
        foreach ($existingUsers as $user) {
            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->update(['uuid' => (string) \Illuminate\Support\Str::uuid()]);
        }

        // 2. Licenses table
        if (!Schema::hasTable('licenses')) {
            Schema::create('licenses', function (Blueprint $table) {
                $table->id();
                $table->string('user_id')->index(); // UUID of user
                $table->string('license_key')->unique();
                $table->string('status')->default('inactive'); // inactive, pending, active, expired, revoked
                $table->timestamp('activated_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // 3. Conversations table
        if (!Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->string('user_id')->index(); // UUID of user
                $table->timestamps();
            });
        }

        // 4. Update messages table
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'conversation_id')) {
                $table->unsignedBigInteger('conversation_id')->nullable()->index()->after('id');
            }
            if (!Schema::hasColumn('messages', 'sender_type')) {
                $table->string('sender_type')->default('user')->after('sender'); // user, admin, system
            }
            if (!Schema::hasColumn('messages', 'sender_id')) {
                $table->string('sender_id')->nullable()->after('sender_type');
            }
            if (!Schema::hasColumn('messages', 'license_key')) {
                $table->string('license_key')->nullable()->after('message');
            }
            if (!Schema::hasColumn('messages', 'is_license_card')) {
                $table->boolean('is_license_card')->default(false)->after('license_key');
            }
        });

        // 5. QR Tokens table
        if (!Schema::hasTable('qr_tokens')) {
            Schema::create('qr_tokens', function (Blueprint $table) {
                $table->id();
                $table->string('token')->unique();
                $table->string('user_id')->nullable()->index(); // Mapped user UUID
                $table->string('content_id')->nullable();
                $table->string('status')->default('active'); // active, consumed, expired
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_tokens');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('licenses');
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['conversation_id', 'sender_type', 'sender_id', 'license_key', 'is_license_card']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'first_name', 'last_name', 'phone', 'role']);
        });
    }
};
