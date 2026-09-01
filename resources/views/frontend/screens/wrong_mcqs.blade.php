<!-- SCREEN: Wrong MCQs -->
<div id="screen-wrong-mcqs" class="screen">
    <!-- Header Row -->
    <div class="category-header-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="back-btn" onclick="openScreen('home', 'Dashboard')" style="background: none; border: none; font-size: 18px; color: var(--text-primary); cursor: pointer; padding: 0;">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0;">Wrong MCQs (ভুল এমসিকিউ)</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card); margin-left: auto;" id="wrong-mcqs-count">0 Domande</div>
    </div>

    <!-- Filters: Chapter and Page Dropdowns only -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <select id="wrong-filter-chapter" onchange="onWrongChapterChange()" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); color: var(--text-primary); font-size: 13px; font-weight: 800; outline: none; cursor: pointer; box-shadow: var(--shadow-sm);">
            <option value="">All Chapters (সব অধ্যায়)</option>
        </select>
        <select id="wrong-filter-page" onchange="loadWrongMcqsList()" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); color: var(--text-primary); font-size: 13px; font-weight: 800; outline: none; cursor: pointer; box-shadow: var(--shadow-sm);">
            <option value="">All Pages (সব পেইজ)</option>
        </select>
    </div>

    <!-- Select / Unselect Action Pills -->
    <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 16px;">
        <button class="pill-btn" id="wrong-select-all-btn" onclick="selectAllWrongMcqs()">Select All</button>
        <button class="pill-btn" id="wrong-select-toggle-btn" onclick="toggleWrongMcqsSelectMode()">Select</button>
        <button class="pill-btn active" id="wrong-unselect-all-btn" onclick="unselectAllWrongMcqs()">Unselect All</button>
    </div>

    <!-- Wrong Questions List -->
    <div id="wrong-mcqs-list-container" class="saved-mcqs-list" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 90px;">
        <!-- Injected dynamically via JS -->
    </div>

    <!-- Pagination -->
    <div id="wrong-mcqs-pagination" style="display: flex; justify-content: center; gap: 8px; margin-top: 20px; padding-bottom: 20px;">
        <!-- Injected dynamically via JS -->
    </div>

    <!-- Floating Bottom-Right Start Quiz Button -->
    <div id="wrong-mcqs-quiz-btn-container" style="position: fixed; bottom: 85px; right: 20px; z-index: 1000;">
        <button class="floating-quiz-btn" id="wrong-mcqs-quiz-btn" onclick="startSelectedWrongMcqsQuiz()" style="background-color: var(--accent-red, #ef4444); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35); cursor: pointer;" title="Start Quiz">
            QUIZ &gt;
        </button>
    </div>
</div>