<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeCard;
use App\Models\Slider;
use App\Models\Setting;
use Illuminate\Http\Request;

class PatenteSocialApiController extends Controller
{
    /**
     * Get home screen cards.
     */
    public function getCards()
    {
        $cards = HomeCard::where('status', true)->orderBy('order_index', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $cards
        ]);
    }

    /**
     * Get promotional sliders/banners.
     */
    public function getBanners()
    {
        $sliders = Slider::where('status', true)->orderBy('order_index', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $sliders
        ]);
    }

    /**
     * Get general application settings and theme colors.
     */
    public function getSettings()
    {
        $settings = Setting::first();
        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }
}
