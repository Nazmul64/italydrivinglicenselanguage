<!-- SCREEN: Cartelli Module — Chapter Cards Grid -->
<div id="screen-cartelli" class="screen" style="width: 100%; max-width: 100%; margin: 0 auto; padding-left: 10px; padding-right: 10px;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Tutti i Capitoli</h3>
        <div id="cartelli-chapters-count-badge" style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">0 Capitoli</div>
    </div>

    <!-- Selection Control Pills matching screenshot -->
    <div class="pill-btn-group" style="margin-bottom: 24px;">
        <button class="pill-btn" id="cartelli-chap-btn-unselect" onclick="unselectAllCartelliChapters()">Unselect All</button>
        <button class="pill-btn" id="cartelli-chap-btn-select" onclick="toggleSelectCartelliChapters()">Select</button>
        <button class="pill-btn" id="cartelli-chap-btn-select-all" onclick="selectAllCartelliChapters()">Select All</button>
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
    <div class="pill-btn-group" style="margin-bottom: 16px;">
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
                <span id="cartelli-page-chapter-label" style="font-weight: 800; color: var(--text-primary);">Capitolo...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;"></div>
        </div>
        <!-- Page Dropdown -->
        <div style="position: relative; width: 100%;">
            <div class="chapter-selector-trigger" onclick="toggleCartelliPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%;">
                <span id="cartelli-page-label" style="font-weight: 800; color: var(--text-primary);">Pagina...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;"></div>
        </div>
        <!-- Select controls -->
        <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 8px;">
            <button class="pill-btn" onclick="toggleCartelliPageSelection()">Select Page</button>
            <button class="pill-btn active" onclick="selectAllCartelliPages()">Select All</button>
            <button class="pill-btn" onclick="unselectAllCartelliPages()">Unselect All</button>
        </div>

        <!-- Standalone Top Image Card -->
        <div id="cartelli-page-media-container" style="display: none; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px; margin-top: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); width: 100%;">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img id="cartelli-page-image" src="" style="max-height: 210px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; cursor: pointer; display: inline-block;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" title="Zoom Image">
            </div>
        </div>
    </div>

    <!-- MCQ list -->
    <div id="cartelli-page-mcq-list" style="margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px; width: 100%;">
        <!-- MCQ cards injected by JS -->
    </div>

    <!-- Compact Floating QUIZ button on bottom-right matching reference screenshot -->
    <button class="floating-quiz-btn" onclick="startCartelliPageQuiz()" style="position: fixed; bottom: 85px; right: 20px; background-color: var(--accent-green, #4CAF50); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); cursor: pointer; z-index: 99;" title="Start Quiz">
        <span>QUIZ</span>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px;"></i>
    </button>
</div>
