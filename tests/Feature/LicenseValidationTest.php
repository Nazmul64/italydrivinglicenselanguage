<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\AppClient;
use App\Models\Message;

class LicenseValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_license_activation_and_protection_flow(): void
    {
        $customSessionId = 'client_test_999888';

        // Set up admin session or bypass for macro
        $this->withSession(['admin_logged_in' => true]);

        // 1. Trigger admin macro to send license (365 days)
        $response = $this->postJson('/admin/api/chat/macro', [
            'session_id' => $customSessionId,
            'macro' => 'invia_licenza',
        ]);
        $response->assertStatus(200);

        // Verify that the client is NOT auto-activated
        $client = AppClient::where('session_id', $customSessionId)->first();
        $this->assertNotNull($client);
        $this->assertFalse((bool)$client->is_active);

        // Verify that premium endpoints return 403
        $response = $this->getJson("/api/chapters?session_id={$customSessionId}");
        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'License inactive',
        ]);

        // 2. Client clicks "Activate Now", calling /api/client/activate
        $response = $this->postJson("/api/client/activate?session_id={$customSessionId}", [
            'days' => 365,
        ]);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        // Verify client is now active
        $client->refresh();
        $this->assertTrue((bool)$client->is_active);

        // Verify premium endpoints now work (e.g. returns 200, not 403)
        $response = $this->getJson("/api/chapters?session_id={$customSessionId}");
        $response->assertStatus(200);

        // Verify that a welcome message was automatically added to the chat
        $messages = Message::where('session_id', $customSessionId)->get();
        $welcomeMessage = $messages->first(function ($msg) {
            return str_contains($msg->message, '🎉 ধন্যবাদ!');
        });
        $this->assertNotNull($welcomeMessage);
        $this->assertEquals('admin', $welcomeMessage->sender);

        // 3. Try activating again to ensure welcome message is not duplicated
        $initialMessageCount = Message::where('session_id', $customSessionId)->count();
        $response = $this->postJson("/api/client/activate?session_id={$customSessionId}", [
            'days' => 365,
        ]);
        $response->assertStatus(200);

        $newMessageCount = Message::where('session_id', $customSessionId)->count();
        $this->assertEquals($initialMessageCount, $newMessageCount);

        // 4. Manually expire the license in the database
        $client->expires_at = now()->subSeconds(1);
        $client->save();

        // Verify that premium endpoints are blocked again
        $response = $this->getJson("/api/chapters?session_id={$customSessionId}");
        $response->assertStatus(403);

        // Verify that status endpoint deactivates the expired client
        $response = $this->getJson("/api/client/status?session_id={$customSessionId}");
        $response->assertStatus(200);
        $response->assertJson([
            'is_active' => false,
        ]);
    }
}
