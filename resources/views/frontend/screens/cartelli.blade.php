<!-- SCREEN: Cartelli Module — Chapter Cards Grid -->
<div id="screen-cartelli" class="screen" style="width: 100%; max-width: 100%; margin: 0 auto; padding-left: 10px; padding-right: 10px;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Tutti i Capitoli</h3>
        <div id="cartelli-chapters-count-badge" style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">0 Capitoli</div>
    </div>

    <!-- Selection Control Pills matching screenshot -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 10px;">
        <button class="pill-btn" onclick="unselectAllCartelliChapters()">Unselect All</button>
        <button class="pill-btn" onclick="toggleSelectCartelliChapters()">Select</button>
        <button class="pill-btn" onclick="selectAllCartelliChapters()">Select All</button>
    </div>

    <div id="cartelli-chapters-grid" class="argomenti-grid" style="padding-bottom: 80px; width: 100%;">
        <!-- Chapter cards injected by JS -->
    </div>

    <!-- Floating QUIZ button -->
    <button class="floating-quiz-btn" id="cartelli-category-quiz-btn" onclick="startCartelliCategoryQuiz()" style="display: none;">
        QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<!-- SCREEN: Cartelli Schede (Page cards for a chapter) -->
<div id="screen-cartelli-schede" class="screen" style="width: 100%; max-width: 100%; margin: 0 auto; padding-left: 10px; padding-right: 10px;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Chapter Selector Dropdown -->
    <div style="position: relative; margin-bottom: 16px; width: 100%;">
        <div class="chapter-selector-trigger" onclick="toggleCartelliSchedeChapterDropdown()">
            <span id="cartelli-schede-chapter-label">Caricamento...</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <div class="chapter-dropdown-list-panel" id="cartelli-schede-chapter-dropdown" style="display: none;">
            <!-- Chapters populated by JS -->
        </div>
    </div>

    <!-- Pills -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button class="pill-btn active" id="cartelli-schede-btn-unselect" onclick="unselectAllCartelliSchede()">Unselect All</button>
        <button class="pill-btn" id="cartelli-schede-btn-select" onclick="toggleSelectCartelliSchede()">Select</button>
        <button class="pill-btn" id="cartelli-schede-btn-select-all" onclick="selectAllCartelliSchede()">Select All</button>
    </div>

    <div id="cartelli-schede-list" class="argomenti-schede-grid" style="padding-bottom: 80px; width: 100%;">
        <!-- Scheda cards injected by JS -->
    </div>

    <button class="floating-quiz-btn" id="cartelli-schede-quiz-btn" onclick="startCartelliSchedeQuiz()" style="display: none;">
        QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<!-- SCREEN: Cartelli Page Details (MCQ list for a page) -->
<div id="screen-cartelli-page" class="screen" style="max-width: 100%; width: 100%; margin: 0 auto; padding-left: 12px; padding-right: 12px;">
    <!-- Top Dropdowns -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; width: 100%;">
        <!-- Chapter Dropdown -->
        <div style="position: relative; width: 100%;">
            <div class="chapter-selector-trigger" onclick="toggleCartelliPageChapterDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%;">
                <span id="cartelli-page-chapter-label" style="font-weight: 800; font-size: 13px; color: var(--text-primary);">Capitolo...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;"></div>
        </div>
        <!-- Page Dropdown -->
        <div style="position: relative; width: 100%;">
            <div class="chapter-selector-trigger" onclick="toggleCartelliPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%;">
                <span id="cartelli-page-label" style="font-weight: 800; font-size: 13px; color: var(--text-primary);">Pagina...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;"></div>
        </div>
        <!-- Select controls -->
        <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="pill-btn" onclick="toggleCartelliPageSelection()">Select Page</button>
            <button class="pill-btn active" onclick="selectAllCartelliPages()">Select All</button>
            <button class="pill-btn" onclick="unselectAllCartelliPages()">Unselect All</button>
        </div>
    </div>

    <!-- MCQ list -->
    <div id="cartelli-page-mcq-list" style="margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px; width: 100%;">
        <!-- MCQ cards injected by JS -->
    </div>

    <!-- Fixed Bottom Buttons -->
    <div style="position: fixed; bottom: 95px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 100%; display: flex; justify-content: space-between; padding: 10px 16px; background-color: var(--bg-card); border-top: 1px solid var(--border-card); z-index: 99; gap: 12px; box-shadow: 0 -4px 10px rgba(0,0,0,0.03);">
        <button class="action-btn" id="cartelli-play-all-btn" onclick="togglePlayAllCartelliMcqs()" style="flex: 1; background-color: var(--accent-green); color: white; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; border-radius: 12px; margin: 0; padding: 12px;">
            <i class="fa-solid fa-circle-play"></i>
            <span>Play All</span>
        </button>
        <button class="action-btn" onclick="startCartelliPageQuiz()" style="flex: 1; background-color: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; border-radius: 12px; margin: 0; padding: 12px;">
            <span>QUIZ</span>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    </div>
</div>
