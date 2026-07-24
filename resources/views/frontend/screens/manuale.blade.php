<!-- SCREEN: Manuale (Theory Guidebook) -->
<div id="screen-manuale" class="screen">
    <div class="section-header">
        <span class="section-title">ম্যানুয়াল থিওরি গাইড (Manuale)</span>
        <span class="section-subtitle">পাতেন্তে ড্রাইভিং থিওরি ও বিস্তারিত ব্যাখ্যা</span>
    </div>

    <!-- Manuale Search / Filter Bar -->
    <div style="margin-bottom: 16px;">
        <input type="text" id="manuale-search-input" placeholder="থিওরি বা চ্যাপ্টার খুঁজুন..." oninput="filterManualeTopics()" style="width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--border-card); background: var(--bg-card); color: var(--text-primary); font-size: 14px; box-sizing: border-box;">
    </div>

    <!-- Manuale Topics List Container -->
    <div id="manuale-topics-container" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i>
            <div>ম্যানুয়াল থিওরি লোড হচ্ছে...</div>
        </div>
    </div>
</div>
