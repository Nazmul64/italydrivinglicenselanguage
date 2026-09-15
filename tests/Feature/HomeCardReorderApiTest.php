<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\HomeCard;

class HomeCardReorderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_cards_reorder_via_api()
    {
        // Seed 3 test cards
        $card1 = HomeCard::create([
            'title' => 'Card One',
            'subtitle' => 'Subtitle 1',
            'screen_key' => 'screen-1',
            'icon_class' => 'fa-solid fa-video',
            'order_index' => 1,
            'status' => true
        ]);
        $card2 = HomeCard::create([
            'title' => 'Card Two',
            'subtitle' => 'Subtitle 2',
            'screen_key' => 'screen-2',
            'icon_class' => 'fa-solid fa-book',
            'order_index' => 2,
            'status' => true
        ]);
        $card3 = HomeCard::create([
            'title' => 'Card Three',
            'subtitle' => 'Subtitle 3',
            'screen_key' => 'screen-3',
            'icon_class' => 'fa-solid fa-graduation-cap',
            'order_index' => 3,
            'status' => true
        ]);

        // Reorder cards to: Card 3 (order 1), Card 1 (order 2), Card 2 (order 3)
        $response = $this->postJson('/api/v1/home-cards/reorder', [
            'orders' => [$card3->id, $card1->id, $card2->id]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Home cards reordered successfully'
            ]);

        // Verify order in database
        $this->assertEquals(1, HomeCard::find($card3->id)->order_index);
        $this->assertEquals(2, HomeCard::find($card1->id)->order_index);
        $this->assertEquals(3, HomeCard::find($card2->id)->order_index);

        // Verify GET /api/v1/home-cards returns them in the updated order
        $getListResponse = $this->getJson('/api/v1/home-cards');
        $getListResponse->assertStatus(200)
            ->assertJsonPath('data.0.id', $card3->id)
            ->assertJsonPath('data.1.id', $card1->id)
            ->assertJsonPath('data.2.id', $card2->id);

        // Verify admin reorder endpoint also works with authenticated admin
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@mbangla.com'
        ]);

        $adminReorderResponse = $this->actingAs($admin)->postJson('/admin/api/home-cards/reorder', [
            'orders' => [$card2->id, $card3->id, $card1->id]
        ]);
        $adminReorderResponse->assertStatus(200);

        $this->assertEquals(1, HomeCard::find($card2->id)->order_index);
        $this->assertEquals(2, HomeCard::find($card3->id)->order_index);
        $this->assertEquals(3, HomeCard::find($card1->id)->order_index);
    }
}
