<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;
use App\Models\Message;

class LiveChatImageUploadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_standalone_live_chat_image_upload_endpoint()
    {
        $fakeImage = UploadedFile::fake()->image('screenshot.png', 600, 400);

        $response = $this->post('/api/v1/chat/upload-image', [
            'image' => $fakeImage
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'success' => true
            ]);

        $json = $response->json();
        $this->assertNotEmpty($json['image_url']);
        $this->assertStringContainsString('/uploads/live_chat/', $json['image_url']);

        // Verify file was written to public/uploads/live_chat/
        $relativePath = ltrim($json['image_url'], '/');
        $this->assertTrue(file_exists(public_path($relativePath)));

        // Cleanup test file
        if (file_exists(public_path($relativePath))) {
            @unlink(public_path($relativePath));
        }
    }

    public function test_send_chat_message_with_multipart_image_attachment()
    {
        $sessionId = 'test_guest_session_' . uniqid();
        $fakeImage = UploadedFile::fake()->image('problem_screen.jpg', 800, 600);

        $response = $this->post('/api/v1/chat/messages', [
            'session_id' => $sessionId,
            'phone'      => '01700000000',
            'message'    => 'Hello, I have an issue with this question',
            'image'      => $fakeImage
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'success' => true
            ]);

        $msgId = $response->json('data.id');
        $msg = Message::find($msgId);

        $this->assertNotNull($msg);
        $this->assertNotEmpty($msg->attachment_path);
        $this->assertStringContainsString('/uploads/live_chat/', $msg->attachment_path);

        $relativePath = ltrim($msg->attachment_path, '/');
        $this->assertTrue(file_exists(public_path($relativePath)));

        // Cleanup test file
        if (file_exists(public_path($relativePath))) {
            @unlink(public_path($relativePath));
        }
    }

    public function test_send_chat_message_with_only_image_sets_default_text()
    {
        $sessionId = 'test_guest_session_img_only_' . uniqid();
        $fakeImage = UploadedFile::fake()->image('receipt.png', 500, 500);

        $response = $this->post('/api/v1/chat/messages', [
            'session_id' => $sessionId,
            'file'       => $fakeImage
        ]);

        $response->assertStatus(200);
        $this->assertEquals('ছবি পাঠানো হয়েছে', $response->json('data.message'));
        $this->assertStringContainsString('/uploads/live_chat/', $response->json('data.attachment_path'));

        // Cleanup test file
        $relativePath = ltrim($response->json('data.attachment_path'), '/');
        if (file_exists(public_path($relativePath))) {
            @unlink(public_path($relativePath));
        }
    }
}
