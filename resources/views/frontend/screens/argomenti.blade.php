<!-- SCREEN: Argomenti (Scegli Categoria) -->
<div id="screen-argomenti" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Tutti i Capitoli</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">25 Capitoli</div>
    </div>

    <!-- Selection Control Pills matching screenshot -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 10px;">
        <button class="pill-btn" onclick="unselectAllArgomentiChapters()">Unselect All</button>
        <button class="pill-btn" onclick="toggleSelectArgomentiChapters()">Select</button>
        <button class="pill-btn" onclick="selectAllArgomentiChapters()">Select All</button>
    </div>

    <div id="argomenti-list" class="argomenti-grid">
        <!-- Chapter category cards injected dynamically via JS -->
    </div>
</div>
