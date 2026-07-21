<!-- SCREEN: Page Details (Vere e False list) -->
<div id="screen-page-details" class="screen" style="max-width: 100%; margin: 0 auto;">
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

        <!-- Page selection controls -->
        <div style="display: flex; gap: 8px; margin-top: 4px; justify-content: flex-start;">
            <button class="pill-btn" id="page-details-select-toggle-btn" onclick="toggleCurrentPageSelection()">Select Page</button>
            <button class="pill-btn active" id="page-details-select-all-btn" onclick="selectAllPagesInDetails()">Select All</button>
            <button class="pill-btn" id="page-details-unselect-all-btn" onclick="unselectAllPagesInDetails()">Unselect All</button>
        </div>
    </div>

    <!-- Unified Page Details Master Card -->
    <div class="content-card" style="padding: 16px; margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Video Player Section matching screenshot -->
        <div id="page-details-video-container" style="display: none; width: 100%; border-radius: 12px; overflow: hidden; background-color: #000; position: relative;">
            <!-- Native Video Element or Youtube iframe wrapper -->
            <div id="page-video-player-wrapper" style="width: 100%; aspect-ratio: 16/9; position: relative;">
                <!-- Will be dynamically populated by JS with <video> or iframe -->
            </div>
        </div>

        <!-- Page Text Content -->
        <div id="page-details-content-text" style="font-size: 13px; color: var(--text-primary); line-height: 1.6; font-weight: 600;">
            Definizioni generali del traffico e delle parti della strada pubblica.
        </div>
        
        <!-- Optional Page Image (Placed at top above questions list, matching red circle) -->
        <div id="page-details-media-container" style="display: none; width: 100%; text-align: center; border-radius: 12px; overflow: hidden; background-color: var(--bg-page); padding: 12px; margin-bottom: 12px;">
            <img id="page-details-image" src="" style="max-height: 280px; width: auto; max-width: 100%; object-fit: contain; display: inline-block; border-radius: 8px;">
        </div>

        <!-- Hidden native audio element -->
        <audio id="page-native-audio" style="display: none;"></audio>

        <!-- Divider line above questions list -->
        <hr id="page-details-questions-divider" style="border: none; border-top: 1px solid var(--border-card); margin: 8px 0; display: none;">

        <!-- Questions list container -->
        <div id="page-questions-list-container" class="page-questions-list" style="margin-bottom: 0;">
            <!-- Question cards injected by JS -->
        </div>

        <!-- Next / Prev Page Navigation Block -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; border-top: 1px solid var(--border-card); padding-top: 16px;">
            <button class="pill-btn" id="page-nav-prev" onclick="navigateToSiblingPage(-1)" style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 12px;">
                <i class="fa-solid fa-chevron-left"></i> Prec (পূর্ববর্তী)
            </button>
            <button class="pill-btn" id="page-nav-next" onclick="navigateToSiblingPage(1)" style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 12px;">
                Succ (পরবর্তী) <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>

    <!-- Fixed Bottom Controls Row matching screenshot 4 -->
    <div style="position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 100%; display: flex; justify-content: space-between; padding: 10px 16px; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-top: 1px solid var(--border-card); z-index: 99; gap: 12px; box-shadow: 0 -4px 10px rgba(0,0,0,0.03);">
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
