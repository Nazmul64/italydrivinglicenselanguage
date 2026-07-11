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
        // 1. Upgrade users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('staff')->after('password');
            }
            if (!Schema::hasColumn('users', 'permissions')) {
                $table->text('permissions')->nullable()->after('role');
            }
        });

        // 2. Upgrade chapters table
        Schema::table('chapters', function (Blueprint $table) {
            if (!Schema::hasColumn('chapters', 'chapter_number')) {
                $table->integer('chapter_number')->default(0)->after('id');
            }
            if (!Schema::hasColumn('chapters', 'description')) {
                $table->text('description')->nullable()->after('bn_name');
            }
            if (!Schema::hasColumn('chapters', 'status')) {
                $table->boolean('status')->default(true)->after('image');
            }
        });

        // 3. Upgrade pages table
        Schema::table('pages', function (Blueprint $table) {
            if (!Schema::hasColumn('pages', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('chapter_id');
            }
            if (!Schema::hasColumn('pages', 'pdf_path')) {
                $table->string('pdf_path')->nullable()->after('audio');
            }
            if (!Schema::hasColumn('pages', 'status')) {
                $table->boolean('status')->default(true)->after('pdf_path');
            }
        });

        // 4. Upgrade sliders table
        Schema::table('sliders', function (Blueprint $table) {
            if (!Schema::hasColumn('sliders', 'button_text')) {
                $table->string('button_text')->nullable()->after('subtitle');
            }
            if (!Schema::hasColumn('sliders', 'order_index')) {
                $table->integer('order_index')->default(0)->after('link_url');
            }
            if (!Schema::hasColumn('sliders', 'status')) {
                $table->boolean('status')->default(true)->after('order_index');
            }
        });

        // 5. Upgrade home_cards table
        Schema::table('home_cards', function (Blueprint $table) {
            if (!Schema::hasColumn('home_cards', 'icon_url')) {
                $table->string('icon_url')->nullable()->after('id');
            }
            if (!Schema::hasColumn('home_cards', 'description')) {
                $table->text('description')->nullable()->after('subtitle');
            }
            if (!Schema::hasColumn('home_cards', 'link')) {
                $table->string('link')->nullable()->after('screen_key');
            }
            if (!Schema::hasColumn('home_cards', 'color')) {
                $table->string('color')->default('#3B82F6')->after('icon_color');
            }
            if (!Schema::hasColumn('home_cards', 'status')) {
                $table->boolean('status')->default(true)->after('order_index');
            }
        });

        // 6. Upgrade lecture_classes table
        Schema::table('lecture_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('lecture_classes', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('lecture_classes', 'youtube_url')) {
                $table->string('youtube_url')->nullable()->after('video_url');
            }
            if (!Schema::hasColumn('lecture_classes', 'vimeo_url')) {
                $table->string('vimeo_url')->nullable()->after('youtube_url');
            }
            if (!Schema::hasColumn('lecture_classes', 'video_path')) {
                $table->string('video_path')->nullable()->after('vimeo_url');
            }
            if (!Schema::hasColumn('lecture_classes', 'chapter_id')) {
                $table->unsignedBigInteger('chapter_id')->nullable()->after('id');
                $table->foreign('chapter_id')->references('id')->on('chapters')->onDelete('set null');
            }
            if (!Schema::hasColumn('lecture_classes', 'status')) {
                $table->boolean('status')->default(true)->after('video_path');
            }
        });

        // 7. Upgrade live_classes table
        Schema::table('live_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('live_classes', 'description')) {
                $table->text('description')->nullable()->after('subtitle');
            }
            if (!Schema::hasColumn('live_classes', 'date')) {
                $table->date('date')->nullable()->after('scheduled_at');
            }
            if (!Schema::hasColumn('live_classes', 'time')) {
                $table->string('time')->nullable()->after('date');
            }
            if (!Schema::hasColumn('live_classes', 'zoom_link')) {
                $table->string('zoom_link')->nullable()->after('room_link');
            }
            if (!Schema::hasColumn('live_classes', 'meet_link')) {
                $table->string('meet_link')->nullable()->after('zoom_link');
            }
            if (!Schema::hasColumn('live_classes', 'live_url')) {
                $table->string('live_url')->nullable()->after('meet_link');
            }
            if (!Schema::hasColumn('live_classes', 'thumbnail_url')) {
                $table->string('thumbnail_url')->nullable()->after('live_url');
            }
            if (!Schema::hasColumn('live_classes', 'speaker_name')) {
                $table->string('speaker_name')->nullable()->after('thumbnail_url');
            }
            if (!Schema::hasColumn('live_classes', 'status')) {
                $table->boolean('status')->default(true)->after('speaker_name');
            }
        });

        // 8. Create media_files table (File Manager)
        if (!Schema::hasTable('media_files')) {
            Schema::create('media_files', function (Blueprint $table) {
                $table->id();
                $table->string('filename');
                $table->string('filepath');
                $table->string('filetype');
                $table->integer('filesize');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_files');

        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropColumn(['description', 'date', 'time', 'zoom_link', 'meet_link', 'live_url', 'thumbnail_url', 'speaker_name', 'status']);
        });

        Schema::table('lecture_classes', function (Blueprint $table) {
            $table->dropForeign(['chapter_id']);
            $table->dropColumn(['chapter_id', 'description', 'youtube_url', 'vimeo_url', 'video_path', 'status']);
        });

        Schema::table('home_cards', function (Blueprint $table) {
            $table->dropColumn(['icon_url', 'description', 'link', 'color', 'status']);
        });

        Schema::table('sliders', function (Blueprint $table) {
            $table->dropColumn(['button_text', 'order_index', 'status']);
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['sort_order', 'pdf_path', 'status']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn(['chapter_number', 'description', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'permissions']);
        });
    }
};
