<!-- SCREEN: mbanglapatenteb (Community Feed) -->
<div id="screen-social" class="screen">
    <div class="section-header">
        <span class="section-title">mbanglapatenteb (কমিউনিটি ফোরাম)</span>
        <span class="section-subtitle">অন্যান্য শিক্ষার্থীদের সাথে প্রশ্ন, অভিজ্ঞতা ও আলোচনা শেয়ার করুন</span>
    </div>

    <!-- Create Post Card Box -->
    <div class="content-card" style="padding: 16px; border-radius: 18px; margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border-card); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px;">
            <img id="social-my-avatar" src="https://ui-avatars.com/api/?name=User&background=6366F1&color=fff" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;">
            <div style="flex: 1;">
                <div id="social-my-name" style="font-weight: 800; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">ব্যবহারকারী</div>
                <textarea id="social-post-input" rows="3" placeholder="পাতেন্তে ড্রাইভিং বা থিওরি সম্পর্কিত কিছু লিখুন..." style="width: 100%; border-radius: 12px; border: 1px solid var(--border-card); background: var(--bg-page); color: var(--text-primary); padding: 10px 14px; font-size: 14px; resize: none; outline: none; box-sizing: border-box;"></textarea>
            </div>
        </div>

        <!-- Photo Upload Preview -->
        <div id="social-photo-preview-box" style="display: none; position: relative; margin-bottom: 12px; border-radius: 12px; overflow: hidden; max-height: 220px; background: #000;">
            <img id="social-photo-preview" src="" style="width: 100%; max-height: 220px; object-fit: contain; display: block;">
            <button type="button" onclick="clearSocialPhotoSelection()" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #fff; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-card); padding-top: 10px;">
            <label for="social-post-photo" style="display: flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.08); color: #2563EB; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid rgba(37,99,235,0.2);">
                <i class="fa-solid fa-image" style="font-size: 15px; color: #10B981;"></i> ফটো যুক্ত করুন
            </label>
            <input type="file" id="social-post-photo" accept="image/*" style="display: none;" onchange="handleSocialPhotoSelect(this)">

            <button type="button" onclick="submitSocialPost()" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff; border: none; padding: 9px 22px; border-radius: 20px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 10px rgba(37,99,235,0.3); display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-paper-plane"></i> পাবলিশ করুন
            </button>
        </div>
    </div>

    <!-- Feed List Container -->
    <div id="social-feed-container" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 28px; margin-bottom: 10px;"></i>
            <div>সোশ্যাল ফিড লোড হচ্ছে...</div>
        </div>
    </div>
</div>

<!-- Edit Post Modal Overlay -->
<div class="modal-overlay" id="social-edit-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; padding: 16px;">
    <div class="modal-card" style="width: 100%; max-width: 450px; background: var(--bg-card); border-radius: 20px; padding: 20px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-card); padding-bottom: 10px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--text-primary);">পোস্ট এডিট করুন</h3>
            <i class="fa-solid fa-xmark" onclick="closeSocialEditModal()" style="font-size: 18px; cursor: pointer; color: var(--text-secondary);"></i>
        </div>
        <input type="hidden" id="social-edit-post-id">
        <textarea id="social-edit-content" rows="4" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-card); background: var(--bg-page); color: var(--text-primary); padding: 10px; font-size: 14px; resize: none; box-sizing: border-box; margin-bottom: 12px;"></textarea>

        <div id="social-edit-photo-container" style="margin-bottom: 12px; display: none;">
            <img id="social-edit-photo-preview" src="" style="width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px;">
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" onclick="closeSocialEditModal()" class="btn btn-secondary" style="padding: 8px 16px; border-radius: 12px;">বাতিল</button>
            <button type="button" onclick="saveSocialPostEdit()" class="btn btn-primary" style="padding: 8px 20px; border-radius: 12px; font-weight: 800;">সেভ করুন</button>
        </div>
    </div>
</div>
