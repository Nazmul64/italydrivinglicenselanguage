<!-- SCREEN: Argomenti (Scegli Categoria) -->
<div id="screen-argomenti" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Categoria</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">25 Capitoli</div>
    </div>

    <!-- Custom Pills bar matching screenshot -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-start;">
        <button class="pill-btn" onclick="unselectAllChapters()">Unselect All</button>
        <button class="pill-btn active" onclick="selectAllChapters()">Select All</button>
    </div>

    <div id="argomenti-list" class="argomenti-grid">
        <!-- Chapter category cards injected dynamically via JS -->
    </div>

    <!-- Floating QUIZ button -->
    <button class="floating-quiz-btn" id="category-quiz-btn" onclick="startCustomChaptersQuiz()" style="display: none;">
        QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>
