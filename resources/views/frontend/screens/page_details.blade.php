<!-- SCREEN: Page Details (Vere e False list) -->
<div id="screen-page-details" class="screen">
    <!-- Top dropdown navigation bar matching screenshot 4 -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <!-- Chapter Dropdown Select -->
        <div style="position: relative;">
            <div class="chapter-selector-trigger" onclick="togglePageDetailsChapterDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <span id="page-details-chapter-label" style="font-weight: 800; font-size: 13px; color: var(--text-primary);">Capitolo 1) DOVERI NELL'USO DELLA STRADA</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="page-details-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;">
                <!-- Chapters populated by JS -->
            </div>
        </div>

        <!-- Page Dropdown Select -->
        <div style="position: relative;">
            <div class="chapter-selector-trigger" onclick="togglePageDetailsPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <span id="page-details-page-label" style="font-weight: 800; font-size: 13px; color: var(--text-primary);">Pagina 1) Definizioni stradali: la strada</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="page-details-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;">
                <!-- Pages populated by JS -->
            </div>
        </div>
    </div>

    <!-- Video Player Section matching screenshot -->
    <div id="page-details-video-container" style="display: none; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 16px; background-color: #000; box-shadow: 0 4px 15px rgba(0,0,0,0.15); position: relative;">
        <!-- Native Video Element or Youtube iframe wrapper -->
        <div id="page-video-player-wrapper" style="width: 100%; aspect-ratio: 16/9; position: relative;">
            <!-- Will be dynamically populated by JS with <video> or iframe -->
        </div>
    </div>

    <!-- Page Body Content, Image, and Audio Player Section -->
    <div class="content-card" style="padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div id="page-details-content-text" style="font-size: 13px; color: var(--text-primary); line-height: 1.6; font-weight: 600;">
            Definizioni generali del traffico e delle parti della strada pubblica.
        </div>
        
        <!-- Optional Page Image -->
        <div id="page-details-media-container" style="display: none; width: 100%; border-radius: 12px; overflow: hidden; margin-top: 4px;">
            <img id="page-details-image" src="" style="width: 100%; height: auto; object-fit: contain;">
        </div>

        <!-- Audio Player Section matching screenshot 4 -->
        <div style="background-color: var(--bg-page); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border-card);">
            <button class="test-ctrl-btn" id="page-audio-play-btn" onclick="togglePageMainAudio()" style="width: 36px; height: 36px; min-width: 36px; border-radius: 50%; background-color: var(--bg-card); border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fa-solid fa-play" style="font-size: 12px; color: var(--accent-green);"></i>
            </button>
            <input type="range" class="test-slider" id="page-audio-slider" min="0" max="100" value="0" style="flex: 1;" oninput="seekPageMainAudio(this.value)">
            <span id="page-audio-time-label" style="font-size: 10px; font-weight: bold; color: var(--text-secondary);">0:00 / 0:00</span>
            
            <!-- Hidden native audio element -->
            <audio id="page-native-audio" style="display: none;"></audio>
        </div>
    </div>

    <!-- Questions list container -->
    <div id="page-questions-list-container" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 80px;">
        <!-- Question cards injected by JS -->
    </div>

    <!-- Fixed Bottom Controls Row matching screenshot 4 -->
    <div style="position: fixed; bottom: 70px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 10px 16px; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-top: 1px solid var(--border-card); z-index: 99; gap: 12px; box-shadow: 0 -4px 10px rgba(0,0,0,0.03);">
        <!-- Play All Speech Button -->
        <button class="action-btn" id="page-play-all-btn" onclick="togglePlayAllPageQuestions()" style="flex: 1; background-color: var(--accent-green); color: white; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; border-radius: 12px; margin: 0; padding: 12px;">
            <i class="fa-solid fa-circle-play"></i>
            <span>Play All</span>
        </button>
        <!-- Quiz Practice button for this page -->
        <button class="action-btn" onclick="startPageQuiz()" style="flex: 1; background-color: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; border-radius: 12px; margin: 0; padding: 12px;">
            <span>QUIZ</span>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    </div>
</div>
