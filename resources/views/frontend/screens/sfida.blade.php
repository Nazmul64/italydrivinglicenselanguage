<!-- SCREEN: Sfida (Challenge) -->
<div id="screen-sfida" class="screen">
    <div class="section-header">
        <span class="section-title">চ্যালেঞ্জ মোড</span>
        <span class="section-subtitle">ভুল এড়ানোর প্রতিযোগিতা</span>
    </div>

    <!-- Top Score & Start Challenge Banner Card -->
    <div class="content-card" style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-align: center; padding: 24px 16px; border-radius: 20px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); margin-bottom: 24px;">
        <i class="fa-solid fa-trophy" style="font-size: 44px; color: #F59E0B; margin-bottom: 10px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));"></i>
        <h4 id="sfida-user-high-score" style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">আপনার সর্বোচ্চ স্কোর: 0 পয়েন্ট</h4>
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 16px;">ভুল করলেই খেলা শেষ! সর্বোচ্চ কয়টি সঠিক উত্তর দিতে পারেন দেখুন।</p>
        <button class="action-btn" style="background-color: white; color: #6366F1; font-weight: 800; border-radius: 12px; padding: 12px 24px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" onclick="startSfidaChallenge()">
            <i class="fa-solid fa-play"></i> চ্যালেঞ্জ শুরু করুন
        </button>
    </div>

    <!-- Leaderboard Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 0 4px;">
        <div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-award" style="color: #F59E0B;"></i> সেরা পারফর্মারদের র্যাঙ্কিং
            </h3>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">সর্বোচ্চ সঠিক উত্তরদাতা ও পয়েন্ট তালিকা</p>
        </div>
        <button onclick="loadLeaderboardData()" style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 8px; padding: 6px 12px; font-size: 11px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-arrows-rotate"></i> রিফ্রেশ
        </button>
    </div>

    <!-- Leaderboard Top 3 Podium Grid -->
    <div id="sfida-podium-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
        <!-- Populated via JS -->
    </div>

    <!-- Full Leaderboard List Container -->
    <div id="sfida-leaderboard-list" style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Populated via JS -->
    </div>
</div>
