<!-- SCREEN: E-Class -->
<div id="screen-eclass" class="screen">
    <div class="section-header">
        <span class="section-title">ই-ক্লাস লাইভ সেশন</span>
        <span class="section-subtitle">সরাসরি শিক্ষকদের ক্লাস</span>
    </div>

    @if($liveClasses->count() > 0)
        @php $latestLive = $liveClasses->first(); @endphp
        <div class="content-card" style="text-align: center; padding: 24px 16px;">
            <i class="fa-solid fa-tower-broadcast" style="font-size: 40px; color: #FF5252; margin-bottom: 12px; animation: pulse 2s infinite;"></i>
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">{{ $latestLive->title }}</h4>
            @if($latestLive->subtitle)
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">{{ $latestLive->subtitle }}</p>
            @endif
            @if($latestLive->room_link)
                <button class="action-btn" style="background-color: #FF5252; color: white;" onclick="window.open('{{ $latestLive->room_link }}', '_blank')">
                    <i class="fa-solid fa-door-open"></i> ক্লাসরুমে প্রবেশ করুন
                </button>
            @else
                <button class="action-btn" style="background-color: #FF5252; color: white;" onclick="showToast('লাইভ ক্লাস শুরু হতে এখনো সময় বাকি আছে')">
                    <i class="fa-solid fa-door-open"></i> ক্লাসরুমে প্রবেশ করুন
                </button>
            @endif
        </div>
    @else
        <div class="content-card" style="text-align: center; padding: 30px; color: var(--text-secondary);">
            <i class="fa-solid fa-tower-broadcast" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px;"></i>
            <p style="font-size: 13px; font-weight: bold;">বর্তমানে কোনো লাইভ ক্লাস শিডিউল করা নেই।</p>
        </div>
    @endif

    <div class="section-header" style="margin-top: 10px;">
        <span class="section-title">উপলব্ধ টিউটরগণ</span>
    </div>
    <div class="content-card" style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                MR
            </div>
            <div>
                <div style="font-size: 13px; font-weight: bold;">M Rahman (Senior Instructor)</div>
                <div style="font-size: 11px; color: #10B981;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> অনলাইনে আছেন</div>
            </div>
        </div>
        <button class="action-btn" style="width: auto; margin: 0; padding: 6px 12px;" onclick="toggleGuestChat(true)">
            চ্যাট
        </button>
    </div>
</div>
