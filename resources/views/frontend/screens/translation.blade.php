<!-- SCREEN: Translation & Pronunciation -->
<div id="screen-translation" class="screen">
    <div class="section-header">
        <span class="section-title">অনুবাদ ও উচ্চারণ (Translation)</span>
        <span class="section-subtitle">বাংলা ➔ ইতালিয়ান এবং ইতালিয়ান ➔ বাংলা তাৎক্ষণিক অনুবাদ ও সঠিক উচ্চারণ</span>
    </div>

    <!-- Mode Selection Buttons (Top Prominent Location) -->
    <div style="display: flex; gap: 10px; margin-bottom: 16px; box-sizing: border-box; flex-wrap: wrap;">
        <button type="button" id="btn-trans-mode-bn-it" onclick="setTranslationMode('bn_to_it')" style="flex: 1; min-width: 140px; padding: 12px 10px; border-radius: 16px; font-weight: 800; font-size: 13px; background: #ffffff; color: #1e293b; border: 2px solid #2563EB; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.06); text-align: center; transition: all 0.2s;">
            Translate Bangla to Italian
        </button>
        <button type="button" id="btn-trans-mode-it-bn" onclick="setTranslationMode('it_to_bn')" style="flex: 1; min-width: 140px; padding: 12px 10px; border-radius: 16px; font-weight: 800; font-size: 13px; background: #ffffff; color: #1e293b; border: 2px solid #cbd5e1; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.06); text-align: center; transition: all 0.2s;">
            Translate Italian to Bangla
        </button>
    </div>

    <!-- Input Card Box -->
    <div class="content-card" style="padding: 18px; border-radius: 20px; margin-bottom: 16px; background: var(--bg-card); border: 1px solid var(--border-card); box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span id="trans-current-mode-label" style="font-weight: 800; font-size: 13px; color: #2563EB; background: rgba(37,99,235,0.1); padding: 4px 12px; border-radius: 12px;">
                <i class="fa-solid fa-language"></i> বাংলা ➔ ইতালিয়ান
            </span>
            <button type="button" onclick="clearTranslationInput()" style="background: none; border: none; color: var(--text-secondary); font-weight: 700; font-size: 12px; cursor: pointer;">
                <i class="fa-solid fa-trash-can"></i> পরিষ্কার করুন
            </button>
        </div>

        <textarea id="trans-input-text" rows="4" placeholder="অনুবাদ করতে চাওয়া শব্দ বা বাক্যটি এখানে লিখুন..." style="width: 100%; border-radius: 14px; border: 1px solid var(--border-card); background: var(--bg-page); color: var(--text-primary); padding: 12px 14px; font-size: 15px; resize: none; outline: none; box-sizing: border-box; font-family: inherit; line-height: 1.5;"></textarea>

        <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
            <button type="button" onclick="performTranslation()" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff; border: none; padding: 10px 26px; border-radius: 20px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-repeat"></i> অনুবাদ করুন
            </button>
        </div>
    </div>

    <!-- Output Translation Result Card -->
    <div id="trans-result-card" class="content-card" style="display: none; padding: 20px; border-radius: 20px; margin-bottom: 24px; background: linear-gradient(145deg, #1e293b, #0f172a); color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-circle-check" style="color: #10B981;"></i> অনুবাদিত ফল (Translated Result)
        </div>

        <div id="trans-result-text" style="font-size: 18px; font-weight: 700; line-height: 1.6; color: #f8fafc; margin-bottom: 16px; min-height: 48px;">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
            <!-- Speaker Audio TTS Button -->
            <button type="button" onclick="playTranslationAudio()" style="background: #22c55e; color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 3px 8px rgba(34,197,94,0.3);">
                <i class="fa-solid fa-volume-high" style="font-size: 16px;"></i> উচ্চারণ শুনুন
            </button>

            <!-- Copy Text Button -->
            <button type="button" onclick="copyTranslationResult()" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-copy"></i> কপি করুন
            </button>
        </div>
    </div>
</div>
