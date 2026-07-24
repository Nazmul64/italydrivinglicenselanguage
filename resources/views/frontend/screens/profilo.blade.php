<!-- SCREEN: Profile & Settings -->
<div id="screen-profilo" class="screen">
    <div class="section-header">
        <span class="section-title">ব্যবহারকারীর প্রোফাইল সম্পাদনা</span>
    </div>

    <!-- Edit Profile Card -->
    <div class="content-card" style="margin-bottom: 20px; text-align: center; padding: 24px 16px; border-radius: 18px;">
        <div style="position: relative; width: 90px; height: 90px; margin: 0 auto 16px; cursor: pointer;" onclick="document.getElementById('profile-avatar-input').click()">
            <img id="profile-avatar-img" src="https://ui-avatars.com/api/?name=User&background=6366F1&color=fff" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #6366F1; box-shadow: var(--shadow-card); cursor: pointer;" alt="Profile Picture">
            <button type="button" onclick="event.stopPropagation(); document.getElementById('profile-avatar-input').click();" style="position: absolute; bottom: 0; right: 0; background: #6366F1; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3);" title="ছবি পরিবর্তন করুন">
                <i class="fa-solid fa-camera" style="font-size: 13px;"></i>
            </button>
            <input type="file" id="profile-avatar-input" accept="image/*" style="display: none;" onchange="handleAvatarUpload(event)">
        </div>

        <div style="text-align: left; width: 100%; max-width: 400px; margin: 0 auto;">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 6px;">আপনার নাম (ইউনিক হতে হবে)</label>
            <input type="text" id="profile-name-input" placeholder="আপনার নাম লিখুন..." style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-card); background: var(--bg-card); color: var(--text-primary); font-size: 14px; box-sizing: border-box;" oninput="validateProfileNameInput()">
            <div id="profile-name-hint" style="font-size: 11px; margin-top: 6px; min-height: 16px;"></div>
        </div>

        <button type="button" class="action-btn" onclick="saveUserProfile()" style="margin-top: 16px; background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border-radius: 12px; padding: 12px; width: 100%; max-width: 400px; font-weight: 800; border: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
            <i class="fa-solid fa-floppy-disk"></i> প্রোফাইল সংরক্ষণ করুন
        </button>
    </div>

    <div class="section-header">
        <span class="section-title">পরীক্ষার পরিসংখ্যান</span>
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

    <div class="section-header" style="margin-top: 20px;">
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
