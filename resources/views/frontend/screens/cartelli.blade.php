<!-- SCREEN: Cartelli (Scegli Scheda / Traffic Signs) -->
<div id="screen-cartelli" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Chapter Selector Dropdown -->
    <div style="position: relative; margin-bottom: 16px;">
        <div class="chapter-selector-trigger" onclick="toggleCartelliChapterDropdown()">
            <span id="selected-cartelli-chapter-display-label">Caricamento capitoli...</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <div class="chapter-dropdown-list-panel" id="cartelli-chapter-dropdown-panel" style="display: none;">
            <!-- Dropdown list options injected via JS -->
        </div>
    </div>

    <!-- Pills matching Scegli Scheda screenshot 2 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-start;">
        <button class="pill-btn" onclick="unselectAllCartelliSheets()">Unselect All</button>
        <button class="pill-btn" onclick="initCartelliScreen()">Select</button>
        <button class="pill-btn active" onclick="selectAllCartelliSheets()">Select All</button>
    </div>

    <div id="cartelli-schede-list" class="argomenti-schede-grid">
        <!-- Sheet cards generated via JS -->
    </div>

    <!-- Floating QUIZ button for Cartelli -->
    <button class="floating-quiz-btn" id="cartelli-sheets-quiz-btn" onclick="startCustomCartelliSheetsQuiz()" style="display: none;">
        QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>
