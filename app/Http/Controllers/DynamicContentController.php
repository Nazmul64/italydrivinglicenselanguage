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

        if (!$request->is('admin/*')) {
            $query->where('status', 1);
        }

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
            'image'        => 'nullable|max:20480',
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
            'image'        => 'nullable|max:20480',
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
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'nullable|string|max:50',
            'video_url'   => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'vimeo_url'   => 'nullable|string|max:500',
            'chapter_id'  => 'nullable|integer|exists:chapters,id',
            'thumbnail'   => 'nullable|max:20480',
            'video_file'  => 'nullable|max:51200',
        ]);

        $vUrl = $request->video_url ?? $request->youtube_url ?? '';

        $data = [
            'title'       => $request->title ?: 'Lecture Video',
            'description' => $request->description,
            'duration'    => $request->duration,
            'video_url'   => $vUrl,
            'youtube_url' => $vUrl,
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
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'nullable|string|max:50',
            'video_url'   => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'vimeo_url'   => 'nullable|string|max:500',
            'chapter_id'  => 'nullable|integer|exists:chapters,id',
            'thumbnail'   => 'nullable|max:20480',
            'video_file'  => 'nullable|max:51200',
        ]);

        $vUrl = $request->video_url ?? $request->youtube_url ?? '';

        $data = [
            'title'       => $request->title ?: 'Lecture Video',
            'description' => $request->description,
            'duration'    => $request->duration,
            'video_url'   => $vUrl,
            'youtube_url' => $vUrl,
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
            'thumbnail'    => 'nullable|max:20480',
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
            'thumbnail'    => 'nullable|max:20480',
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
            'icon_file'   => 'nullable|max:20480',
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
            'icon_file'   => 'nullable|max:20480',
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
            'image'     => 'nullable|max:20480',
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

    public function getClientStatus(Request $request)
    {
        $sessionId = $request->input('session_id') 
                  ?: $request->header('X-Client-Session-ID') 
                  ?: $request->cookie('app_client_session_id') 
                  ?: session()->getId();

        $phone = $request->query('phone') 
              ?: $request->input('phone') 
              ?: $request->header('X-Client-Phone') 
              ?: $request->cookie('app_client_phone') 
              ?: session('app_client_phone')
              ?: \Illuminate\Support\Facades\Cache::get('qr_phone_' . $sessionId);

        $client = null;
        if ($phone) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $last10Digits = strlen($cleanPhone) >= 10 ? substr($cleanPhone, -10) : $cleanPhone;

            $client = AppClient::where(function ($q) use ($phone, $cleanPhone, $last10Digits) {
                $q->where('phone', $phone);
                if (!empty($cleanPhone)) {
                    $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                    if (!empty($last10Digits) && strlen($last10Digits) >= 7) {
                        $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10Digits) . ") = ?", [$last10Digits]);
                    }
                }
            })
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->first();
        }
        
        if (!$client && $sessionId) {
            $client = AppClient::where('session_id', $sessionId)
                ->orderBy('is_active', 'desc')
                ->orderBy('updated_at', 'desc')
                ->first();
        }

        if ($client && $client->is_active && $client->expires_at && now()->gt($client->expires_at)) {
            $client->is_active = false;
            $client->save();
            session()->forget('qr_unlocked');
            \Illuminate\Support\Facades\Cache::forget('qr_unlocked_' . $sessionId);
            if ($client->phone) {
                \Illuminate\Support\Facades\Cache::forget('qr_unlocked_' . $client->phone);
            }
        }

        $isQrUnlocked = session('qr_unlocked') === true
            || \Illuminate\Support\Facades\Cache::get('qr_unlocked_' . $sessionId) === true
            || $request->query('qr_unlocked') === '1'
            || $request->header('X-QR-Unlocked') === '1'
            || (!empty($phone) && \Illuminate\Support\Facades\Cache::get('qr_unlocked_' . $phone) === true);

        if ($isQrUnlocked) {
            session(['qr_unlocked' => true]);
            if ($phone) session(['app_client_phone' => $phone]);
            session()->save();
        }

        $userActive = false;
        $userObj = null;
        if ($phone || $sessionId) {
            $cleanPhone = $phone ? preg_replace('/\D/', '', $phone) : null;
            $last10Digits = ($cleanPhone && strlen($cleanPhone) >= 10) ? substr($cleanPhone, -10) : $cleanPhone;

            $userQuery = \App\Models\User::query();
            if ($phone) {
                $userQuery->where(function($q) use ($phone, $cleanPhone, $last10Digits) {
                    $q->where('phone', $phone);
                    if (!empty($cleanPhone)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
                        if (!empty($last10Digits) && strlen($last10Digits) >= 7) {
                            $q->orWhereRaw("SUBSTR(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), -" . strlen($last10Digits) . ") = ?", [$last10Digits]);
                        }
                    }
                });
            } else {
                $userQuery->where('uuid', $sessionId);
            }
            $userObj = $userQuery->first();
            if ($userObj) {
                $userActive = \App\Models\License::where('user_id', $userObj->uuid)
                    ->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    })
                    ->exists();
            }
        }

        $setting = \App\Models\Setting::first();
        $isProtectionEnabled = $setting ? (bool)$setting->qr_protection_enabled : false;

        $isClientExpired = $client && $client->expires_at && now()->gt($client->expires_at);

        $isActive = !$isProtectionEnabled || (!$isClientExpired && (
            $isQrUnlocked 
            || $userActive 
            || ($client && $client->is_active && (!$client->expires_at || $client->expires_at->isFuture()))
        ));
        
        if ($client) {
            if ($phone && !$client->phone) {
                $client->phone = $phone;
            }
            if ($userObj) {
                if (!$client->first_name && $userObj->first_name) $client->first_name = $userObj->first_name;
                if (!$client->last_name && $userObj->last_name) $client->last_name = $userObj->last_name;
            }
            if ($isActive && !$client->is_active) {
                $client->is_active = true;
            }
            if ($client->isDirty()) {
                $client->save();
            }

            if ($client->phone) {
                session(['app_client_phone' => $client->phone]);
            }
            if ($client->session_id && $client->session_id !== $sessionId && $isActive) {
                $oldSessionId = $client->session_id;
                $client->session_id = $sessionId;
                $client->save();
                
                \App\Models\Message::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\Note::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\SavedMcq::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
                \App\Models\UserMcqResult::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
            }
        }
        
        $firstName = $client ? $client->first_name : ($userObj ? $userObj->first_name : null);
        $lastName  = $client ? $client->last_name : ($userObj ? $userObj->last_name : null);
        $phoneNum  = $client ? $client->phone : ($userObj ? $userObj->phone : $phone);

        if (empty($firstName) && $sessionId) {
            $firstName = \Illuminate\Support\Facades\Cache::get('qr_first_name_' . $sessionId);
        }
        if (empty($lastName) && $sessionId) {
            $lastName = \Illuminate\Support\Facades\Cache::get('qr_last_name_' . $sessionId);
        }
        if (empty($phoneNum) && $sessionId) {
            $phoneNum = \Illuminate\Support\Facades\Cache::get('qr_phone_' . $sessionId);
        }

        if (empty($firstName)) $firstName = 'Customer';
        if (empty($lastName))  $lastName  = 'User';
        $isVerified = !empty($phoneNum) || $isQrUnlocked;

        $response = response()->json([
            'session_id' => $client ? $client->session_id : $sessionId,
            'verified'   => (bool)(!$isProtectionEnabled || $isVerified),
            'is_active'  => (bool)$isActive,
            'free_access_mode' => !$isProtectionEnabled,
            'qr_protection_enabled' => (bool)$isProtectionEnabled,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'phone'      => $phoneNum,
            'expires_at' => $client && $client->expires_at ? $client->expires_at->toIso8601String() : null,
            'days_left'  => $client && $client->expires_at ? max(0, now()->diffInDays($client->expires_at, false)) : null
        ]);

        if ($client && $client->phone) {
            $response->cookie('app_client_phone', $client->phone, 525600);
        }

        return $response;
    }

    public function submitVerification(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'required|string|max:50',
        ]);

        $sessionId = $request->input('session_id') ?: session()->getId();
        $rawPhone  = trim($request->phone);
        $firstName = trim($request->first_name);
        $lastName  = trim($request->last_name);
        $cleanPhone = preg_replace('/\D/', '', $rawPhone);
        
        // 1. Find existing client by phone number or session ID
        $client = AppClient::where(function ($q) use ($rawPhone, $cleanPhone) {
            $q->where('phone', $rawPhone);
            if (!empty($cleanPhone)) {
                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
            }
        })->orderBy('is_active', 'desc')->first();
        
        if (!$client) {
            $client = AppClient::where('session_id', $sessionId)->first();
            if (!$client) {
                $client = new AppClient();
                $client->session_id = $sessionId;
                $client->stars = rand(3, 5);
                $client->progress = rand(30, 80);
            }
        }
        
        $oldSessionId = $client->session_id;

        // Check if this client already has an active, unexpired license
        $hasActiveLicense = false;
        if ($client->is_active && $client->expires_at && $client->expires_at->isFuture()) {
            $hasActiveLicense = true;
        }
        
        // Update customer fields in AppClient
        $client->first_name = $firstName;
        $client->last_name  = $lastName;
        $client->phone      = $rawPhone;
        $client->session_id = $sessionId;
        $client->is_active  = $hasActiveLicense;
        if (!$hasActiveLicense) {
            $client->expires_at = null;
        }
        $client->save();

        if ($oldSessionId && $oldSessionId !== $sessionId) {
            \App\Models\Message::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
            \App\Models\Note::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
            \App\Models\SavedMcq::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
            \App\Models\UserMcqResult::where('session_id', $oldSessionId)->update(['session_id' => $sessionId]);
        }

        // 2. Sync or create User table record
        $userObj = \App\Models\User::where(function ($q) use ($rawPhone, $cleanPhone) {
            $q->where('phone', $rawPhone);
            if (!empty($cleanPhone)) {
                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone]);
            }
        })->first();

        if (!$userObj) {
            $userObj = \App\Models\User::create([
                'uuid'       => (string) \Illuminate\Support\Str::uuid(),
                'name'       => $firstName . ' ' . $lastName,
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $rawPhone,
                'email'      => 'user_' . \Illuminate\Support\Str::random(8) . '@mbanglapatenteb.com',
                'password'   => bcrypt(\Illuminate\Support\Str::random(16)),
                'role'       => 'user',
            ]);
        } else {
            $userObj->update([
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'name'       => $firstName . ' ' . $lastName,
                'phone'      => $rawPhone,
            ]);
        }

        // Check existing user license or keep inactive by default
        $existingLicense = \App\Models\License::where('user_id', $userObj->uuid)->latest()->first();
        if (!$existingLicense) {
            \App\Models\License::create([
                'user_id'     => $userObj->uuid,
                'license_key' => (string) rand(100000, 999999),
                'status'      => 'inactive',
                'activated_at'=> null,
                'expires_at'  => null,
            ]);
        } elseif ($existingLicense->status === 'active' && $existingLicense->expires_at && $existingLicense->expires_at->isPast()) {
            $existingLicense->update(['status' => 'expired']);
        }

        session(['app_client_phone' => $client->phone]);

        // Ensure Conversation exists
        $convo = \App\Models\Conversation::firstOrCreate(['user_id' => $userObj->uuid]);

        // Ensure an initial registration message exists for this session
        $existingMsg = \App\Models\Message::where('session_id', $sessionId)
            ->orWhere('session_id', $userObj->uuid)
            ->orWhere('conversation_id', $convo->id)
            ->exists();

        if (!$existingMsg) {
            \App\Models\Message::create([
                'conversation_id' => $convo->id,
                'session_id'      => $sessionId,
                'sender'          => 'user',
                'sender_type'     => 'user',
                'sender_id'       => $userObj->uuid,
                'sender_name'     => trim($firstName . ' ' . $lastName),
                'message'         => '🎉 কাস্টমার নিবন্ধিত হয়েছে (' . $firstName . ' ' . $lastName . ' - ' . $rawPhone . ')',
            ]);
        }

        $alreadyActive = (bool) $client->is_active;

        $response = response()->json([
            'success' => true,
            'already_active' => $alreadyActive,
            'is_active' => (bool)$client->is_active,
            'client' => $client,
            'user' => $userObj,
            'message' => 'Client verified successfully.'
        ]);

        return $response->cookie('app_client_phone', $client->phone, 525600);
    }

    public function getClients(Request $request)
    {
        $this->checkPermission('sliders');

        // Sync any User records that aren't yet in AppClient
        $users = \App\Models\User::whereNotNull('phone')->get();
        foreach ($users as $u) {
            $exists = AppClient::where('phone', $u->phone)->exists();
            if (!$exists && !empty($u->phone)) {
                $license = \App\Models\License::where('user_id', $u->uuid)->where('status', 'active')->first();
                AppClient::create([
                    'session_id' => $u->uuid,
                    'first_name' => $u->first_name ?: $u->name,
                    'last_name'  => $u->last_name ?: '',
                    'phone'      => $u->phone,
                    'is_active'  => $license ? true : false,
                    'expires_at' => $license ? $license->expires_at : now()->addDays(365),
                    'stars'      => 5,
                    'progress'   => 50,
                ]);
            }
        }

        $query = AppClient::orderBy('updated_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('session_id', 'like', "%{$search}%");
            });
        }

        $clients = $query->get();

        return response()->json([
            'clients' => $clients,
            'total_count' => AppClient::count(),
            'active_count' => AppClient::where('is_active', true)->where('is_blocked', false)->count(),
            'blocked_count' => AppClient::where('is_blocked', true)->count(),
            'pending_count' => AppClient::where('is_active', false)->where('is_blocked', false)->count(),
        ]);
    }

    public function toggleClientActive($id)
    {
        $this->checkPermission('sliders');
        $client = AppClient::findOrFail($id);
        $client->is_active = !$client->is_active;
        if ($client->is_active && !$client->expires_at) {
            $client->expires_at = now()->addYear();
        }
        $client->save();

        return response()->json([
            'success' => true,
            'client' => $client
        ]);
    }

    public function toggleClientBlocked($id)
    {
        $this->checkPermission('sliders');
        $client = AppClient::findOrFail($id);
        $client->is_blocked = !$client->is_blocked;
        if ($client->is_blocked) {
            $client->is_active = false;
        }
        $client->save();

        return response()->json([
            'success' => true,
            'message' => $client->is_blocked ? 'গ্রাহককে ব্লক করা হয়েছে' : 'গ্রাহককে আনব্লক করা হয়েছে',
            'client' => $client
        ]);
    }

    public function updateClientLicense(Request $request, $id)
    {
        $this->checkPermission('sliders');
        $request->validate([
            'days' => 'required|integer|min:1'
        ]);

        $client = AppClient::findOrFail($id);
        $client->is_active = true;
        $client->is_blocked = false;
        $client->expires_at = now()->addDays($request->days);
        $client->save();

        return response()->json([
            'success' => true,
            'message' => "গ্রাহককে {$request->days} দিনের জন্য লাইসেন্স দেওয়া হয়েছে",
            'client' => $client
        ]);
    }

    public function deleteClient($id)
    {
        $this->checkPermission('sliders');
        $client = AppClient::findOrFail($id);
        $client->delete();

        return response()->json([
            'success' => true,
            'message' => 'গ্রাহকের ডাটা মুছে ফেলা হয়েছে'
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

    public function getPublicHomeCards()
    {
        $cards = HomeCard::where('status', true)
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($cards->isEmpty()) {
            $defaultCards = [
                ['title' => 'LEZIONI', 'subtitle' => 'ক্লাস ভিডিও', 'screen_key' => 'lezioni', 'icon_class' => 'fa-solid fa-video', 'order_index' => 1],
                ['title' => 'TEST', 'subtitle' => 'অনুশীলন টেস্ট', 'screen_key' => 'test', 'icon_class' => 'fa-solid fa-laptop-code', 'order_index' => 2],
                ['title' => 'ARGOMENTI', 'subtitle' => 'অধ্যায়সমূহ', 'screen_key' => 'argomenti', 'icon_class' => 'fa-solid fa-graduation-cap', 'order_index' => 3],
                ['title' => 'E-CLASS', 'subtitle' => 'অনলাইন ক্লাস', 'screen_key' => 'eclass', 'icon_class' => 'fa-solid fa-chalkboard-user', 'order_index' => 4],
                ['title' => 'SFIDA', 'subtitle' => 'চ্যালেঞ্জ', 'screen_key' => 'sfida', 'icon_class' => 'fa-solid fa-trophy', 'order_index' => 5],
                ['title' => 'SCHEDA ESAME', 'subtitle' => 'পরীক্ষার শিট', 'screen_key' => 'scheda-esame', 'icon_class' => 'fa-solid fa-file-signature', 'order_index' => 6],
                ['title' => 'DIZIONARIO', 'subtitle' => 'অভিধান', 'screen_key' => 'dizionario', 'icon_class' => 'fa-solid fa-book-open', 'order_index' => 7],
                ['title' => 'CARTELLI', 'subtitle' => 'ট্রাফিক সাইন', 'screen_key' => 'cartelli', 'icon_class' => 'fa-solid fa-map-signs', 'order_index' => 8],
                ['title' => 'SAVED MCQS', 'subtitle' => 'সেভ করা এমসিকিউ', 'screen_key' => 'saved-mcqs', 'icon_class' => 'fa-solid fa-bookmark', 'order_index' => 9],
                ['title' => 'CORRECT MCQS', 'subtitle' => 'সঠিক এমসিকিউ', 'screen_key' => 'correct-mcqs', 'icon_class' => 'fa-solid fa-circle-check', 'order_index' => 10],
                ['title' => 'WRONG MCQS', 'subtitle' => 'ভুল এমসিকিউ', 'screen_key' => 'wrong-mcqs', 'icon_class' => 'fa-solid fa-circle-xmark', 'order_index' => 11],
                ['title' => 'SUPPORT', 'subtitle' => 'লাইভ চ্যাট', 'screen_key' => 'support', 'icon_class' => 'fa-solid fa-headset', 'order_index' => 12],
                ['title' => 'TOP PERFORMERS', 'subtitle' => 'সেরা শিক্ষার্থী র‍্যাংকিং', 'screen_key' => 'top-performers', 'icon_class' => 'fa-solid fa-ranking-star', 'order_index' => 13],
                ['title' => 'MANUALE', 'subtitle' => 'ম্যানুয়াল থিওরি বই', 'screen_key' => 'manuale', 'icon_class' => 'fa-solid fa-book-bookmark', 'order_index' => 14],
                ['title' => 'PATENTE SOCIAL', 'subtitle' => 'কমিউনিটি সোশ্যাল ফিড', 'screen_key' => 'patente-social', 'icon_class' => 'fa-solid fa-users', 'order_index' => 15],
                ['title' => 'TRANSLATION', 'subtitle' => 'অনুবাদ ও সঠিক উচ্চারণ', 'screen_key' => 'translation', 'icon_class' => 'fa-solid fa-language', 'order_index' => 16],
            ];
            foreach ($defaultCards as $dc) {
                HomeCard::create($dc);
            }
            $cards = HomeCard::where('status', true)->orderBy('order_index', 'asc')->get();
        }

        $cards->transform(function($c) {
            if ($c->icon_url && !str_starts_with($c->icon_url, 'http')) {
                $c->icon_url = request()->getSchemeAndHttpHost() . '/' . ltrim($c->icon_url, '/');
            }
            return $c;
        });

        return response()->json([
            'status' => 'success',
            'data' => $cards
        ]);
    }

    public function getPublicSliders()
    {
        $sliders = Slider::where('status', 1)
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($sliders->isEmpty()) {
            $defaultSliders = [
                [
                    'id' => 1,
                    'title' => 'Patente B Exam Prep',
                    'subtitle' => 'বাংলা ভাষায় ইতালিয়ান ড্রাইভিং লাইসেন্স কোর্স',
                    'image_url' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
                    'link_url' => '',
                    'button_text' => 'শুরু করুন',
                    'order_index' => 1,
                    'status' => true
                ],
                [
                    'id' => 2,
                    'title' => 'Live Interactive Classes',
                    'subtitle' => 'সরাসরি শিক্ষক এর সাথে ক্লাস করুন',
                    'image_url' => 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop',
                    'link_url' => '',
                    'button_text' => 'জয়েন করুন',
                    'order_index' => 2,
                    'status' => true
                ],
                [
                    'id' => 3,
                    'title' => 'Cartelli Traffic Signs',
                    'subtitle' => 'সকল ট্রাফিক সিগন্যাল ও কুইজ',
                    'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
                    'link_url' => '',
                    'button_text' => 'পড়ুন',
                    'order_index' => 3,
                    'status' => true
                ]
            ];
            return response()->json([
                'status' => 'success',
                'data' => $defaultSliders
            ]);
        }

        $sliders->transform(function($s) {
            $path = $s->image_url;
            if ($path && !str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
                $s->image_url = request()->getSchemeAndHttpHost() . '/' . ltrim($path, '/');
            }
            return $s;
        });

        return response()->json([
            'status' => 'success',
            'data' => $sliders
        ]);
    }
}
