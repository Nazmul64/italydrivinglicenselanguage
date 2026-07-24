<!-- SCREEN: Test (Practice Quiz) -->
<div id="screen-test" class="screen">
    <!-- 1. Question Pagination Bar (3 Rows) -->
    <div class="test-pagination-container" style="background-color: var(--bg-card); border: 1px solid var(--border-card); border-radius: 14px; padding: 12px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px var(--shadow-card);">
        <!-- Row 1: Tabs -->
        <div class="test-pagination-tabs" style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <span class="test-tab-btn active" id="test-tab-btn-1" onclick="switchTestQuestionTab(1)" style="flex: 1; text-align: center; font-weight: 800;">Domande da 1 a 10</span>
            <span class="test-tab-btn" id="test-tab-btn-2" onclick="switchTestQuestionTab(2)" style="flex: 1; text-align: center; font-weight: 800;">Domande da 11 a 20</span>
            <span class="test-tab-btn" id="test-tab-btn-3" onclick="switchTestQuestionTab(3)" style="flex: 1; text-align: center; font-weight: 800;">Domande da 21 a 30</span>
        </div>

        <!-- Row 2: 10 Large Question Numbers for Active Tab -->
        <div class="test-pagination-numbers" id="test-num-grid" style="display: flex; justify-content: space-between; gap: 6px; margin-bottom: 8px;">
            <!-- Questions 1-10 / 11-20 / 21-30 injected by JS -->
        </div>

        <!-- Row 3: All 30 Mini Question Numbers (1 to 30) -->
        <div class="test-pagination-all-30" id="test-all-30-grid" style="display: flex; justify-content: space-between; gap: 3px;">
            <!-- Mini boxes 1-30 injected by JS -->
        </div>
    </div>

    <!-- 2. Question Text Display & Left Figure Image (Side by Side) -->
    <div class="test-question-box" style="display: flex; gap: 20px; align-items: center; background-color: var(--bg-card); padding: 20px; border-radius: 16px; border: 1px solid var(--border-card); margin-bottom: 16px; min-height: 180px;">
        <!-- Left Side: Traffic Sign / Figure Image -->
        <div id="test-question-img-container" style="display: flex; width: 170px; min-width: 170px; height: 170px; align-items: center; justify-content: center; background: #ffffff; border-radius: 12px; border: 1px solid var(--border-card); padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <img id="test-question-img" src="" alt="Figura" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>

        <!-- Right Side: Question Statement Text & Bangla -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <div class="test-question-it" id="test-question-it" style="font-size: 16px; font-weight: 600; line-height: 1.6; color: var(--text-primary);">Caricamento delle domande...</div>
            <div class="test-question-bn" id="test-question-bn" style="display: none; margin-top: 10px; font-size: 14px; color: var(--text-secondary);">প্রশ্ন লোড হচ্ছে...</div>
        </div>
    </div>

    <!-- 3. Bottom Controls Row -->
    <div class="test-bottom-section">
        
        <!-- Horizontal Options Bar overlay (shown when Opzioni clicked) -->
        <div class="test-options-bar" id="test-options-bar" style="display: none;">
            <div class="opt-btn-item" onclick="toggleGuestChat(true)" title="Live Chat" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper" style="position: relative;">
                    <i class="fa-solid fa-headset"></i>
                    <span style="position: absolute; top: -2px; right: -2px; width: 6px; height: 6px; background-color: var(--accent-red); border-radius: 50%;"></span>
                </div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Live Chat</span>
            </div>
            <div class="opt-btn-item" onclick="toggleTestTranslation()" title="Translate" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i class="fa-solid fa-language"></i></div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Translate</span>
            </div>
            <div class="opt-btn-item" onclick="toggleCurrentTestBookmark()" title="Save" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i id="test-bookmark-icon" class="fa-regular fa-bookmark"></i></div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Save</span>
            </div>
            <div class="opt-btn-item" onclick="openCurrentTestNoteModal()" title="Note" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i class="fa-regular fa-note-sticky"></i></div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Note</span>
            </div>
            <div class="opt-btn-item" onclick="showToast('অধ্যায়ের তথ্য')" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i class="fa-solid fa-circle-info"></i></div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Info</span>
            </div>
            <div class="opt-btn-item" onclick="showToast('পরীক্ষার সংক্ষিপ্ত বিবরণ')" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i class="fa-solid fa-list-check"></i></div>
                <span style="font-size: 8px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Summary</span>
            </div>
            <div class="opt-btn-item close" onclick="closeTestExam()" title="Chiudi Esame" style="display: flex; flex-direction: column; align-items: center;">
                <div class="opt-icon-wrapper"><i class="fa-solid fa-circle-xmark"></i></div>
                <span style="font-size: 8px; color: var(--text-secondary); margin-top: 2px; font-weight: 700;">Chiudi</span>
            </div>
        </div>

        <!-- Main Bottom Controls Layout -->
        <div class="test-controls-row">
            <!-- Left Controls Column (Opzioni, Speaker, Play/Pause, Progress, Speed) -->
            <div class="test-controls-left" style="position: relative; display: flex; align-items: center; gap: 10px; flex: 1.1;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <button class="test-ctrl-btn opt" onclick="toggleTestOptions()">
                        <i class="fa-solid fa-table-cells-large" style="color: var(--accent-green);"></i>
                    </button>
                    <span class="test-ctrl-label" style="color: var(--text-primary);">Opzioni</span>
                </div>
                
                <!-- Circular Blue Speaker -->
                <button class="test-speaker-btn" onclick="readItalianQuestionOutLoud()">
                    <i class="fa-solid fa-volume-high"></i>
                    <span>Italiano</span>
                </button>

                <!-- Circular Pause/Play Toggle Button -->
                <button class="test-ctrl-btn" id="test-audio-play-btn" onclick="togglePlayPauseSpeech()" style="background-color: var(--bg-card); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; cursor: pointer;">
                    <i class="fa-solid fa-play" style="color: var(--text-primary);"></i>
                </button>

                <!-- Progress Slider -->
                <input type="range" class="test-slider" id="test-audio-slider" min="0" max="100" value="0" style="margin: 0 4px; flex: 1;" oninput="changeAudioProgress(this.value)">

                <!-- Speed Trigger Button -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <button class="test-ctrl-btn" onclick="toggleSpeedDropdown()" style="background-color: var(--bg-card); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; cursor: pointer;">
                        <i class="fa-solid fa-gauge-high" style="color: var(--text-primary);"></i>
                    </button>
                    <span class="test-ctrl-label" style="color: var(--text-primary);">Speed</span>
                </div>

                <!-- Speed Dropdown Popover overlay -->
                <div class="speed-popover" id="test-speed-popover" style="display: none;">
                    <!-- Speed items populated dynamically via JS -->
                </div>
            </div>

            <!-- Right Controls Column (VERO, FALSO and Navigation) -->
            <div class="test-controls-right">
                <div class="vero-falso-grid">
                    <button class="vf-btn vero" id="test-vero-btn" onclick="selectTestAnswer(true)">
                        <div class="vf-letter">V</div>
                        <span class="vf-label">VERO</span>
                    </button>
                    <button class="vf-btn falso" id="test-falso-btn" onclick="selectTestAnswer(false)">
                        <div class="vf-letter">F</div>
                        <span class="vf-label">FALSO</span>
                    </button>
                </div>
                
                <div class="nav-arrows-grid">
                    <button class="test-nav-arrow" onclick="prevTestQuestion()">
                        <i class="fa-solid fa-chevron-left" style="color: var(--accent-green);"></i>
                        <span>Indietro</span>
                    </button>
                    <button class="test-nav-arrow" onclick="nextTestQuestion()">
                        <span>Avanti</span>
                        <i class="fa-solid fa-chevron-right" style="color: var(--accent-green);"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Left Bottom Corner Timer Placement -->
        <div style="margin-top: 14px; text-align: left; display: inline-block;">
            <div class="test-timer-pill" id="test-timer">{{ sprintf('%02d:00', $setting->exam_time_minutes ?? 20) }}</div>
            <div class="test-timer-label">Tempo a Disposizione</div>
        </div>
    </div>
</div>
