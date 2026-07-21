<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Chapter;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For any chapter where image is empty/null but cover_image is set, copy it.
        $chapters = Chapter::all();
        foreach ($chapters as $ch) {
            if ((empty($ch->image) || $ch->image === '') && !empty($ch->cover_image)) {
                $ch->image = $ch->cover_image;
                $ch->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed
    }
};
