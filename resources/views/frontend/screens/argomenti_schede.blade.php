<!-- SCREEN: Argomenti Schede (Scegli Scheda) -->
<div id="screen-argomenti-schede" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Dropdown Selector Wrapper -->
    <div style="position: relative; margin-bottom: 16px;">
        <div class="chapter-selector-trigger" onclick="toggleChapterDropdownList()">
            <span id="selected-chapter-display-label">Capitolo 1) DOVERI NELL'USO DELLA STRADA</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <!-- Dropdown Panel (Screenshot 4 list) -->
        <div class="chapter-dropdown-list-panel" id="chapter-dropdown-list-panel" style="display: none;">
            <!-- Dropdown list options injected via JS -->
        </div>
    </div>

    <!-- Pills matching screenshot -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-start;">
        <button class="pill-btn" onclick="unselectAllSheets()">Unselect All</button>
        <button class="pill-btn active" onclick="selectAllSheets()">Select All</button>
    </div>

    <div id="argomenti-schede-list" class="argomenti-schede-grid">
        <!-- Sheet cards injected dynamically via JS -->
    </div>

    <!-- Floating QUIZ button -->
    <button class="floating-quiz-btn" id="sheets-quiz-btn" onclick="startCustomSheetsQuiz()" style="display: none;">
        QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>
