<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\License;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\QrToken;
use Illuminate\Support\Str;

class SupportAndLicenseV1Test extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function first_time_support_registration_creates_user_with_uuid_and_token()
    {
        $response = $this->postJson('/api/v1/support/register', [
            'first_name' => 'John',
            'last_name'  => 'Doe',
            'phone'      => '+8801700000000',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'license_status' => 'inactive',
            ])
            ->assertJsonStructure([
                'success',
                'user' => ['id', 'first_name', 'last_name', 'phone'],
                'license_status',
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'first_name' => 'John',
            'last_name'  => 'Doe',
            'phone'      => '+8801700000000',
        ]);

        $user = User::where('phone', '+8801700000000')->first();
        $this->assertNotNull($user->uuid);
    }

    /** @test */
    public function duplicate_phone_number_identifies_existing_user_account()
    {
        // 1. First registration
        $this->postJson('/api/v1/support/register', [
            'first_name' => 'Jane',
            'last_name'  => 'Doe',
            'phone'      => '+8801800000000',
        ]);

        $userCount = User::where('phone', '+8801800000000')->count();
        $this->assertEquals(1, $userCount);

        // 2. Second registration with same phone
        $response = $this->postJson('/api/v1/support/register', [
            'first_name' => 'Jane Updated',
            'last_name'  => 'Doe',
            'phone'      => '+8801800000000',
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        // Assert user count is still 1 (no duplicate creation)
        $this->assertEquals(1, User::where('phone', '+8801800000000')->count());
    }

    /** @test */
    public function inactive_license_user_receives_403_on_protected_routes()
    {
        $user = User::create([
            'uuid'       => (string) Str::uuid(),
            'name'       => 'Inactive User',
            'first_name' => 'Inactive',
            'last_name'  => 'User',
            'phone'      => '+8801900000000',
            'email'      => 'inactive@test.com',
            'password'   => bcrypt('password'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/protected-data');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Active license required.',
            ]);
    }

    /** @test */
    public function license_activation_activates_license_for_assigned_user()
    {
        $user = User::create([
            'uuid'       => (string) Str::uuid(),
            'name'       => 'License User',
            'first_name' => 'License',
            'last_name'  => 'User',
            'phone'      => '+8801500000000',
            'email'      => 'license@test.com',
            'password'   => bcrypt('password'),
        ]);

        $license = License::create([
            'user_id'     => $user->uuid,
            'license_key' => 'TEST-1234-5678',
            'status'      => 'pending',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/license/activate', [
                'license_key' => 'TEST-1234-5678',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'license_status' => 'active',
            ]);

        $this->assertDatabaseHas('licenses', [
            'license_key' => 'TEST-1234-5678',
            'status'      => 'active',
        ]);
    }

    /** @test */
    public function cross_account_license_activation_returns_403_forbidden()
    {
        $userA = User::create([
            'uuid'       => (string) Str::uuid(),
            'name'       => 'User A',
            'first_name' => 'User',
            'last_name'  => 'A',
            'phone'      => '+8801111111111',
            'email'      => 'usera@test.com',
            'password'   => bcrypt('password'),
        ]);

        $userB = User::create([
            'uuid'       => (string) Str::uuid(),
            'name'       => 'User B',
            'first_name' => 'User',
            'last_name'  => 'B',
            'phone'      => '+8802222222222',
            'email'      => 'userb@test.com',
            'password'   => bcrypt('password'),
        ]);

        // License belongs to User A
        License::create([
            'user_id'     => $userA->uuid,
            'license_key' => 'USERA-KEY-9999',
            'status'      => 'pending',
        ]);

        // User B tries to activate User A's license
        $tokenB = $userB->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/license/activate', [
                'license_key' => 'USERA-KEY-9999',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'This license does not belong to this account.',
            ]);
    }

    /** @test */
    public function qr_verification_rejects_user_mismatch_or_inactive_license()
    {
        $user = User::create([
            'uuid'       => (string) Str::uuid(),
            'name'       => 'QR User',
            'first_name' => 'QR',
            'last_name'  => 'User',
            'phone'      => '+8803333333333',
            'email'      => 'qr@test.com',
            'password'   => bcrypt('password'),
        ]);

        License::create([
            'user_id'     => $user->uuid,
            'license_key' => 'ACTIVE-KEY-1111',
            'status'      => 'active',
            'activated_at'=> now(),
        ]);

        // Create QR mapped to ANOTHER user UUID
        $otherUuid = (string) Str::uuid();
        QrToken::create([
            'token'   => 'qrx_mismatch12345',
            'user_id' => $otherUuid,
            'status'  => 'active',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/qr/verify', [
                'token' => 'qrx_mismatch12345',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized: This QR code is assigned to another user account.',
            ]);
    }

    /** @test */
    public function admin_can_execute_preset_to_send_license_card_and_activate_customer()
    {
        // 1. Customer registers via support
        $regResponse = $this->postJson('/api/v1/support/register', [
            'first_name' => 'Kalam',
            'last_name'  => 'Hossain',
            'phone'      => '+393450000001',
        ]);
        $regResponse->assertStatus(200);
        $userUuid = $regResponse->json('user.id');

        // 2. Create Super Admin
        $admin = User::create([
            'name'     => 'admin',
            'email'    => 'admin@gmail.com',
            'password' => bcrypt('password'),
            'role'     => 'super_admin',
        ]);

        // 3. Admin fetches conversations - ensure admin is not listed, only customer is listed with valid session_id
        $this->actingAs($admin);
        $convos = $this->getJson('/admin/api/chat/conversations');
        $convos->assertStatus(200);
        $this->assertCount(1, $convos->json());
        $this->assertEquals($userUuid, $convos->json('0.session_id'));
        $this->assertEquals('Kalam', $convos->json('0.client.first_name'));

        // 4. Create ChatPreset
        $preset = \App\Models\ChatPreset::create([
            'title'       => 'Lezioni Video',
            'type'        => 'license',
            'days'        => 365,
            'bg_color'    => '#3b82f6',
            'text_color'  => '#ffffff',
            'order_index' => 1,
            'status'      => 1,
        ]);

        // 5. Admin executes preset
        $presetExec = $this->postJson('/admin/api/chat/preset-execute', [
            'session_id' => $userUuid,
            'preset_id'  => $preset->id,
        ]);
        $presetExec->assertStatus(200)->assertJson(['success' => true]);

        // 6. Verify License is active
        $license = License::where('user_id', $userUuid)->first();
        $this->assertNotNull($license);
        $this->assertEquals('active', $license->status);

        // 7. Verify messages contain the license card
        $messages = $this->getJson('/api/chat/messages?session_id=' . $userUuid);
        $messages->assertStatus(200);
        $this->assertTrue(collect($messages->json())->contains(function($msg) {
            return str_contains($msg['message'], '[LICENSE_CARD:days=365');
        }));
    }
}
