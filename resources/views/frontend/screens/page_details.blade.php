<!-- SCREEN: Page Details (Vere e False list) -->
<div id="screen-page-details" class="screen" style="max-width: 100%; margin: 0 auto;">
    <!-- Top dropdown navigation bar matching screenshot 4 -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <!-- Chapter Dropdown Select -->
        <div style="position: relative;">
            <div class="chapter-selector-trigger" onclick="togglePageDetailsChapterDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <span id="page-details-chapter-label" style="font-weight: 800; color: var(--text-primary);">Capitolo...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="page-details-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;">
                <!-- Chapters populated by JS -->
            </div>
        </div>

        <!-- Page Dropdown Select -->
        <div style="position: relative;">
            <div class="chapter-selector-trigger" onclick="togglePageDetailsPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <span id="page-details-page-label" style="font-weight: 800; color: var(--text-primary);">Pagina...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="page-details-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;">
                <!-- Pages populated by JS -->
            </div>
        </div>

        <!-- Page selection controls -->
        <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 8px;">
            <button class="pill-btn" id="page-details-select-toggle-btn" onclick="toggleCurrentPageSelection()">Select Page</button>
            <button class="pill-btn active" id="page-details-select-all-btn" onclick="selectAllPagesInDetails()">Select All</button>
            <button class="pill-btn" id="page-details-unselect-all-btn" onclick="unselectAllPagesInDetails()">Unselect All</button>
        </div>

        <!-- Standalone Top Image Card -->
        <div id="page-details-media-container" style="display: none; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px; margin-top: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); width: 100%;">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img id="page-details-image" src="" style="max-height: 210px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; cursor: pointer; display: inline-block;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" title="Zoom Image">
            </div>
        </div>
    </div>

    <!-- Unified Page Details Master Card -->
    <div style="margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Video Player Section matching screenshot -->
        <div id="page-details-video-container" style="display: none; width: 100%; border-radius: 12px; overflow: hidden; background-color: #000; position: relative;">
            <!-- Native Video Element or Youtube iframe wrapper -->
            <div id="page-video-player-wrapper" style="width: 100%; aspect-ratio: 16/9; position: relative;">
                <!-- Will be dynamically populated by JS with <video> or iframe -->
            </div>
        </div>

        <!-- Page Text Content -->
        <div id="page-details-content-text" style="font-size: 13px; color: var(--text-primary); line-height: 1.6; font-weight: 600;"></div>

        <!-- Hidden native audio element -->
        <audio id="page-native-audio" style="display: none;"></audio>

        <!-- Divider line above questions list -->
        <hr id="page-details-questions-divider" style="border: none; border-top: 1px solid var(--border-card); margin: 8px 0; display: none;">

        <!-- Questions list container -->
        <div id="page-questions-list-container" class="page-questions-list" style="margin-bottom: 0;">
            <!-- Question cards injected by JS -->
        </div>


    </div>

    <!-- Compact Floating QUIZ button on bottom-right matching reference screenshot -->
    <button class="floating-quiz-btn" onclick="startPageQuiz()" style="position: fixed; bottom: 85px; right: 20px; background-color: var(--accent-green, #4CAF50); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); cursor: pointer; z-index: 99;" title="Start Quiz">
        <span>QUIZ</span>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px;"></i>
    </button>
</div>
