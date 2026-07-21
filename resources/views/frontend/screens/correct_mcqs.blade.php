<!-- SCREEN: Correct MCQs -->
<div id="screen-correct-mcqs" class="screen">
    <!-- Header Row -->
    <div class="category-header-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="back-btn" onclick="openScreen('home', 'Dashboard')" style="background: none; border: none; font-size: 18px; color: var(--text-primary); cursor: pointer; padding: 0;">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0;">Correct MCQs (সঠিক এমসিকিউ)</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card); margin-left: auto;" id="correct-mcqs-count">0 Domande</div>
    </div>

    <!-- Filters and Search Bar -->
    <div class="card p-3 mb-4" style="background-color: var(--bg-card); border-radius: 16px; border: 1.5px solid var(--border-card) !important; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
            <select id="correct-filter-category" onchange="onCorrectCategoryChange()" style="padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 12px; font-weight: 700; outline: none;">
                <option value="">All Categories</option>
                <option value="2">Patente B</option>
                <option value="1">Patente AM</option>
                <option value="3">Patente C</option>
            </select>
            <select id="correct-filter-chapter" onchange="onCorrectChapterChange()" style="padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 12px; font-weight: 700; outline: none;">
                <option value="">All Chapters</option>
            </select>
            <select id="correct-filter-page" onchange="loadCorrectMcqsList()" style="padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 12px; font-weight: 700; outline: none;">
                <option value="">All Pages</option>
            </select>
            <input type="date" id="correct-filter-date" onchange="loadCorrectMcqsList()" style="padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 12px; font-weight: 700; outline: none;">
        </div>
        <div style="display: flex; gap: 8px;">
            <input type="text" id="correct-search-input" placeholder="Search questions..." style="flex: 1; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 12px; font-weight: 700; outline: none;">
            <button onclick="loadCorrectMcqsList()" style="background-color: var(--accent-green); color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-magnifying-glass"></i> Search
            </button>
        </div>
    </div>

    <!-- Correct Questions List -->
    <div id="correct-mcqs-list-container" class="saved-mcqs-list" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Injected dynamically via JS -->
    </div>

    <!-- Pagination -->
    <div id="correct-mcqs-pagination" style="display: flex; justify-content: center; gap: 8px; margin-top: 20px; padding-bottom: 20px;">
        <!-- Injected dynamically via JS -->
    </div>
</div>
