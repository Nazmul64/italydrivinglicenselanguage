<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\AppClient;
use App\Models\Message;
use App\Models\Note;
use App\Models\SavedMcq;
use App\Models\UserMcqResult;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Group clients by phone number
        $groupedClients = AppClient::whereNotNull('phone')
            ->where('phone', '!=', 'N/A')
            ->where('phone', '!=', '')
            ->get()
            ->groupBy('phone');

        foreach ($groupedClients as $phone => $clients) {
            if ($clients->count() <= 1) {
                continue;
            }

            // The most recently updated client is the primary one
            $primary = $clients->sortByDesc('updated_at')->first();
            
            // Check if any of the clients in the group is active
            $hasActiveLicense = $clients->contains(function ($c) {
                return $c->is_active && $c->expires_at && $c->expires_at > now();
            });

            // Find the latest expires_at date among all clients in the group
            $latestExpiry = $clients->max('expires_at');

            // Update primary client status if needed
            if ($hasActiveLicense) {
                $primary->is_active = true;
            }
            if ($latestExpiry && (!$primary->expires_at || $latestExpiry > $primary->expires_at)) {
                $primary->expires_at = $latestExpiry;
            }
            $primary->save();

            // Merge all other clients' data into the primary client's session ID
            foreach ($clients as $client) {
                if ($client->id === $primary->id) {
                    continue;
                }

                $oldSessionId = $client->session_id;
                $newSessionId = $primary->session_id;

                if ($oldSessionId && $newSessionId && $oldSessionId !== $newSessionId) {
                    Message::where('session_id', $oldSessionId)->update(['session_id' => $newSessionId]);
                    Note::where('session_id', $oldSessionId)->update(['session_id' => $newSessionId]);
                    SavedMcq::where('session_id', $oldSessionId)->update(['session_id' => $newSessionId]);
                    UserMcqResult::where('session_id', $oldSessionId)->update(['session_id' => $newSessionId]);
                }

                $client->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation
    }
};
