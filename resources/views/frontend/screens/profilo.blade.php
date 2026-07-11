<!-- SCREEN: Profile & Settings -->
<div id="screen-profilo" class="screen">
    <div class="section-header">
        <span class="section-title">ব্যবহারকারীর প্রোফাইল</span>
    </div>

    <!-- User Statistics -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value" id="stats-exams">১২</div>
            <div class="stat-label">সম্পূর্ণ পরীক্ষা</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="stats-errors">২.৫</div>
            <div class="stat-label">গড় ভুল সংখ্যা</div>
        </div>
    </div>

    <div class="section-header" style="margin-top: 10px;">
        <span class="section-title">অ্যাপ্লিকেশন সেটিংস</span>
    </div>

    <div class="content-card">
        <div class="settings-row">
            <div class="settings-info">
                <span class="settings-title">শব্দ সংকেত (Sound Effects)</span>
                <span class="settings-desc">সঠিক/ভুল উত্তরে ভাইব্রেশন ও সাউন্ড</span>
            </div>
            <label class="switch">
                <input type="checkbox" id="sound-switch" checked onchange="toggleSound(this.checked)">
                <span class="slider-switch"></span>
            </label>
        </div>

        <button class="action-btn danger" onclick="resetAppData()">
            <i class="fa-solid fa-trash-can"></i> সমস্ত ডেটা রিসেট করুন
        </button>
    </div>
</div>
