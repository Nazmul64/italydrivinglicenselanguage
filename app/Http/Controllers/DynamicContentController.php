<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use App\Models\LectureClass;
use App\Models\LiveClass;
use App\Models\HomeCard;
use App\Models\PopupPromo;
use App\Models\AppClient;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;

class DynamicContentController extends Controller
{
    /**
     * Check if user has permission to manage a module.
     */
    protected function checkPermission($module)
    {
        $user = auth()->user();
        if (!$user) return; // Allow if authentication is disabled or in debug mode
        if ($user->role === 'super_admin') return;

        if ($user->role === 'staff') {
            $permissions = json_decode($user->permissions, true) ?: [];
            if (in_array($module, $permissions)) {
                return;
            }
        }

        abort(403, 'Unauthorized access: You do not have permission to manage ' . $module);
    }

    // ==============================
    // SLIDERS
    // ==============================

    public function getSliders(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = Slider::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        $sliders = $query->orderBy('order_index', 'asc')
                         ->orderBy('id', 'asc')
                         ->paginate($perPage);

        return response()->json($sliders);
    }

    public function storeSlider(Request $request)
    {
        $this->checkPermission('sliders');

        $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'button_text'  => 'nullable|string|max:255',
            'link_url'     => 'nullable|string|max:500',
            'order_index'  => 'nullable|integer',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'subtitle'    => $request->subtitle,
            'button_text' => $request->button_text,
            'link_url'    => $request->link_url,
            'order_index' => $request->order_index ?? 0,
            'status'      => $request->status ?? true,
        ];

        if ($request->hasFile('image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/sliders', 'slider', 1200, 80);
            $data['image_url'] = $uploadedPath ?: '';
        } else {
            $data['image_url'] = $request->image_url ?? '';
        }

        $slider = Slider::create($data);
        return response()->json($slider);
    }

    public function updateSlider(Request $request, $id)
    {
        $this->checkPermission('sliders');
        $slider = Slider::findOrFail($id);

        $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'button_text'  => 'nullable|string|max:255',
            'link_url'     => 'nullable|string|max:500',
            'order_index'  => 'nullable|integer',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'subtitle'    => $request->subtitle,
            'button_text' => $request->button_text,
            'link_url'    => $request->link_url,
            'order_index' => $request->order_index ?? $slider->order_index,
        ];

        if ($request->hasFile('image')) {
            if ($slider->image_url && file_exists(public_path($slider->image_url))) {
                @unlink(public_path($slider->image_url));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/sliders', 'slider', 1200, 80);
            $data['image_url'] = $uploadedPath ?: '';
        }

        $slider->update($data);
        return response()->json($slider);
    }

    public function toggleSliderStatus($id)
    {
        $this->checkPermission('sliders');
        $slider = Slider::findOrFail($id);
        $slider->update(['status' => !$slider->status]);
        return response()->json($slider);
    }

    public function deleteSlider($id)
    {
        $this->checkPermission('sliders');
        $slider = Slider::findOrFail($id);
        if ($slider->image_url && file_exists(public_path($slider->image_url))) {
            @unlink(public_path($slider->image_url));
        }
        $slider->delete();
        return response()->json(['success' => true]);
    }

    // ==============================
    // LECTURE CLASSES
    // ==============================

    public function getLectureClasses(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = LectureClass::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $classes = $query->orderBy('id', 'asc')->paginate($perPage);
        return response()->json($classes);
    }

    public function storeLectureClass(Request $request)
    {
        $this->checkPermission('lectures');

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'nullable|string|max:50',
            'video_url'   => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'vimeo_url'   => 'nullable|string|max:500',
            'chapter_id'  => 'nullable|integer|exists:chapters,id',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'video_file'  => 'nullable|file|mimes:mp4,webm,ogg,mov|max:51200', // max 50MB
        ]);

        $data = [
            'title'       => $request->title,
            'description' => $request->description,
            'duration'    => $request->duration,
            'video_url'   => $request->video_url,
            'youtube_url' => $request->youtube_url,
            'vimeo_url'   => $request->vimeo_url,
            'chapter_id'  => $request->chapter_id,
            'status'      => $request->status ?? true,
        ];

        if ($request->hasFile('thumbnail')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('thumbnail'), 'uploads/classes', 'class_thumb', 800, 80);
            $data['thumbnail_url'] = $uploadedPath ?: '';
        } else {
            $data['thumbnail_url'] = $request->thumbnail_url ?? null;
        }

        if ($request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $fileName = 'class_video_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/classes/videos'), $fileName);
            $data['video_path'] = '/uploads/classes/videos/' . $fileName;
        }

        $class = LectureClass::create($data);
        return response()->json($class);
    }

    public function updateLectureClass(Request $request, $id)
    {
        $this->checkPermission('lectures');
        $class = LectureClass::findOrFail($id);

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'nullable|string|max:50',
            'video_url'   => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'vimeo_url'   => 'nullable|string|max:500',
            'chapter_id'  => 'nullable|integer|exists:chapters,id',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'video_file'  => 'nullable|file|mimes:mp4,webm,ogg,mov|max:51200',
        ]);

        $data = [
            'title'       => $request->title,
            'description' => $request->description,
            'duration'    => $request->duration,
            'video_url'   => $request->video_url,
            'youtube_url' => $request->youtube_url,
            'vimeo_url'   => $request->vimeo_url,
            'chapter_id'  => $request->chapter_id,
        ];

        if ($request->hasFile('thumbnail')) {
            if ($class->thumbnail_url && file_exists(public_path($class->thumbnail_url))) {
                @unlink(public_path($class->thumbnail_url));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('thumbnail'), 'uploads/classes', 'class_thumb', 800, 80);
            $data['thumbnail_url'] = $uploadedPath ?: '';
        }

        if ($request->hasFile('video_file')) {
            if ($class->video_path && file_exists(public_path($class->video_path))) {
                @unlink(public_path($class->video_path));
            }
            $file = $request->file('video_file');
            $fileName = 'class_video_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/classes/videos'), $fileName);
            $data['video_path'] = '/uploads/classes/videos/' . $fileName;
        }

        $class->update($data);
        return response()->json($class);
    }

    public function toggleLectureClassStatus($id)
    {
        $this->checkPermission('lectures');
        $class = LectureClass::findOrFail($id);
        $class->update(['status' => !$class->status]);
        return response()->json($class);
    }

    public function deleteLectureClass($id)
    {
        $this->checkPermission('lectures');
        $class = LectureClass::findOrFail($id);
        if ($class->thumbnail_url && file_exists(public_path($class->thumbnail_url))) {
            @unlink(public_path($class->thumbnail_url));
        }
        if ($class->video_path && file_exists(public_path($class->video_path))) {
            @unlink(public_path($class->video_path));
        }
        $class->delete();
        return response()->json(['success' => true]);
    }

    // ==============================
    // LIVE CLASSES
    // ==============================

    public function getLiveClasses(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = LiveClass::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('speaker_name', 'like', "%{$search}%");
            });
        }

        $classes = $query->orderBy('scheduled_at', 'asc')->paginate($perPage);
        return response()->json($classes);
    }

    public function storeLiveClass(Request $request)
    {
        $this->checkPermission('live_sessions');

        $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'scheduled_at' => 'required|date',
            'date'         => 'nullable|date',
            'time'         => 'nullable|string|max:50',
            'room_link'    => 'nullable|string|max:500',
            'zoom_link'    => 'nullable|string|max:500',
            'meet_link'    => 'nullable|string|max:500',
            'live_url'     => 'nullable|string|max:500',
            'speaker_name' => 'nullable|string|max:255',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $data = [
            'title'        => $request->title,
            'subtitle'     => $request->subtitle,
            'description'  => $request->description,
            'scheduled_at' => $request->scheduled_at,
            'date'         => $request->date,
            'time'         => $request->time,
            'room_link'    => $request->room_link,
            'zoom_link'    => $request->zoom_link,
            'meet_link'    => $request->meet_link,
            'live_url'     => $request->live_url,
            'speaker_name' => $request->speaker_name,
            'status'       => $request->status ?? true,
        ];

        if ($request->hasFile('thumbnail')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('thumbnail'), 'uploads/live', 'live_thumb', 800, 80);
            $data['thumbnail_url'] = $uploadedPath ?: '';
        }

        $class = LiveClass::create($data);
        return response()->json($class);
    }

    public function updateLiveClass(Request $request, $id)
    {
        $this->checkPermission('live_sessions');
        $class = LiveClass::findOrFail($id);

        $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'scheduled_at' => 'required|date',
            'date'         => 'nullable|date',
            'time'         => 'nullable|string|max:50',
            'room_link'    => 'nullable|string|max:500',
            'zoom_link'    => 'nullable|string|max:500',
            'meet_link'    => 'nullable|string|max:500',
            'live_url'     => 'nullable|string|max:500',
            'speaker_name' => 'nullable|string|max:255',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $data = [
            'title'        => $request->title,
            'subtitle'     => $request->subtitle,
            'description'  => $request->description,
            'scheduled_at' => $request->scheduled_at,
            'date'         => $request->date,
            'time'         => $request->time,
            'room_link'    => $request->room_link,
            'zoom_link'    => $request->zoom_link,
            'meet_link'    => $request->meet_link,
            'live_url'     => $request->live_url,
            'speaker_name' => $request->speaker_name,
        ];

        if ($request->hasFile('thumbnail')) {
            if ($class->thumbnail_url && file_exists(public_path($class->thumbnail_url))) {
                @unlink(public_path($class->thumbnail_url));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('thumbnail'), 'uploads/live', 'live_thumb', 800, 80);
            $data['thumbnail_url'] = $uploadedPath ?: '';
        }

        $class->update($data);
        return response()->json($class);
    }

    public function toggleLiveClassStatus($id)
    {
        $this->checkPermission('live_sessions');
        $class = LiveClass::findOrFail($id);
        $class->update(['status' => !$class->status]);
        return response()->json($class);
    }

    public function deleteLiveClass($id)
    {
        $this->checkPermission('live_sessions');
        $class = LiveClass::findOrFail($id);
        if ($class->thumbnail_url && file_exists(public_path($class->thumbnail_url))) {
            @unlink(public_path($class->thumbnail_url));
        }
        $class->delete();
        return response()->json(['success' => true]);
    }

    // ==============================
    // HOME CARDS (ICONS)
    // ==============================

    public function getHomeCards(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = HomeCard::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $cards = $query->orderBy('order_index', 'asc')->paginate($perPage);
        return response()->json($cards);
    }

    public function storeHomeCard(Request $request)
    {
        $this->checkPermission('home_cards');

        $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'screen_key'  => 'nullable|string|max:255',
            'link'        => 'nullable|string|max:255',
            'icon_class'  => 'nullable|string|max:255',
            'color'       => 'nullable|string|max:7',
            'order_index' => 'required|integer',
            'icon_file'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'subtitle'    => $request->subtitle,
            'description' => $request->description,
            'screen_key'  => $request->screen_key ?: 'custom',
            'link'        => $request->link,
            'icon_class'  => $request->icon_class ?? 'fa-solid fa-shapes',
            'color'       => $request->color ?? '#3B82F6',
            'order_index' => $request->order_index,
            'status'      => $request->status ?? true,
        ];

        if ($request->hasFile('icon_file')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('icon_file'), 'uploads/cards', 'card_icon', 300, 90);
            $data['icon_url'] = $uploadedPath ?: '';
        }

        $card = HomeCard::create($data);
        return response()->json($card);
    }

    public function updateHomeCard(Request $request, $id)
    {
        $this->checkPermission('home_cards');
        $card = HomeCard::findOrFail($id);

        $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'screen_key'  => 'nullable|string|max:255',
            'link'        => 'nullable|string|max:255',
            'icon_class'  => 'nullable|string|max:255',
            'color'       => 'nullable|string|max:7',
            'order_index' => 'required|integer',
            'icon_file'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'subtitle'    => $request->subtitle,
            'description' => $request->description,
            'screen_key'  => $request->screen_key ?: $card->screen_key,
            'link'        => $request->link,
            'icon_class'  => $request->icon_class ?? $card->icon_class,
            'color'       => $request->color ?? $card->color,
            'order_index' => $request->order_index,
        ];

        if ($request->hasFile('icon_file')) {
            if ($card->icon_url && file_exists(public_path($card->icon_url))) {
                @unlink(public_path($card->icon_url));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('icon_file'), 'uploads/cards', 'card_icon', 300, 90);
            $data['icon_url'] = $uploadedPath ?: '';
        }

        $card->update($data);
        return response()->json($card);
    }

    public function toggleHomeCardStatus($id)
    {
        $this->checkPermission('home_cards');
        $card = HomeCard::findOrFail($id);
        $card->update(['status' => !$card->status]);
        return response()->json($card);
    }

    public function deleteHomeCard($id)
    {
        $this->checkPermission('home_cards');
        $card = HomeCard::findOrFail($id);
        if ($card->icon_url && file_exists(public_path($card->icon_url))) {
            @unlink(public_path($card->icon_url));
        }
        $card->delete();
        return response()->json(['success' => true]);
    }

    // ==============================
    // POPUP PROMO SETTINGS
    // ==============================

    public function getPopupPromo()
    {
        $this->checkPermission('sliders');
        $promo = PopupPromo::first();
        if (!$promo) {
            $promo = PopupPromo::create([
                'image_path' => '',
                'link_url' => '',
                'is_active' => false
            ]);
        }
        return response()->json($promo);
    }

    public function savePopupPromo(Request $request)
    {
        $this->checkPermission('sliders');

        $request->validate([
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'link_url'  => 'nullable|string|max:500',
            'is_active' => 'required|boolean',
        ]);

        $promo = PopupPromo::first();
        if (!$promo) {
            $promo = new PopupPromo();
        }

        $promo->link_url = $request->link_url;
        $promo->is_active = $request->is_active;

        if ($request->hasFile('image')) {
            if ($promo->image_path && file_exists(public_path($promo->image_path))) {
                @unlink(public_path($promo->image_path));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/popup_promo', 'popup_promo', 1200, 80);
            $promo->image_path = $uploadedPath ?: '';
        }

        if (empty($promo->image_path) && $promo->is_active) {
            return response()->json(['error' => 'You must upload an advertisement image first before enabling it.'], 422);
        }

        $promo->save();
        return response()->json($promo);
    }

    public function getActivePopupPromo()
    {
        $promo = PopupPromo::where('is_active', true)->first();
        return response()->json($promo);
    }

    // ==============================
    // CLIENT ACTIVATION & VERIFICATION
    // ==============================

    public function getClientStatus()
    {
        $sessionId = session()->getId();
        $client = AppClient::where('session_id', $sessionId)->first();
        
        if ($client && $client->is_active && $client->expires_at && now()->gt($client->expires_at)) {
            $client->is_active = false;
            $client->save();
        }
        
        return response()->json([
            'verified' => $client ? true : false,
            'is_active' => $client ? (bool)$client->is_active : false,
            'first_name' => $client ? $client->first_name : null,
            'last_name' => $client ? $client->last_name : null,
            'phone' => $client ? $client->phone : null,
            'expires_at' => $client && $client->expires_at ? $client->expires_at->toIso8601String() : null,
            'days_left' => $client && $client->expires_at ? now()->diffInDays($client->expires_at, false) : null
        ]);
    }

    public function submitVerification(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'required|string|max:50',
        ]);

        $sessionId = session()->getId();
        $client = AppClient::where('session_id', $sessionId)->first();
        if (!$client) {
            $client = new AppClient();
            $client->session_id = $sessionId;
        }

        $client->first_name = $request->first_name;
        $client->last_name = $request->last_name;
        $client->phone = $request->phone;
        $client->is_active = false; // Requires admin activation
        $client->stars = rand(3, 5); // Default stars
        $client->progress = rand(30, 80); // Default progress
        $client->save();

        return response()->json([
            'success' => true,
            'client' => $client
        ]);
    }

    public function getClients()
    {
        $this->checkPermission('sliders');
        $clients = AppClient::orderBy('updated_at', 'desc')->get();
        return response()->json($clients);
    }

    public function toggleClientActive($id)
    {
        $this->checkPermission('sliders');
        $client = AppClient::findOrFail($id);
        $client->is_active = !$client->is_active;
        $client->save();

        return response()->json([
            'success' => true,
            'client' => $client
        ]);
    }

    public function updateClientStars(Request $request, $id)
    {
        $this->checkPermission('sliders');
        $request->validate([
            'stars' => 'required|integer|min:0|max:5'
        ]);
        $client = AppClient::findOrFail($id);
        $client->stars = $request->stars;
        $client->save();

        return response()->json([
            'success' => true,
            'client' => $client
        ]);
    }
}
