<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->text('description')->nullable()->after('bn_name');
            $table->string('cover_image')->nullable()->after('image');
            $table->unsignedSmallInteger('sort_order')->default(0)->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn(['description', 'cover_image', 'sort_order']);
        });
    }
};
