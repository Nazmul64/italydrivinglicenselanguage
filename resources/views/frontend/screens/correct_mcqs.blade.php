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

    <!-- Filters: Chapter and Page Dropdowns only -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <select id="correct-filter-chapter" onchange="onCorrectChapterChange()" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); color: var(--text-primary); font-size: 13px; font-weight: 800; outline: none; cursor: pointer; box-shadow: var(--shadow-sm);">
            <option value="">All Chapters (সব অধ্যায়)</option>
        </select>
        <select id="correct-filter-page" onchange="loadCorrectMcqsList()" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); color: var(--text-primary); font-size: 13px; font-weight: 800; outline: none; cursor: pointer; box-shadow: var(--shadow-sm);">
            <option value="">All Pages (সব পেইজ)</option>
        </select>
    </div>

    <!-- Select / Unselect Action Pills -->
    <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 16px;">
        <button class="pill-btn" id="correct-select-all-btn" onclick="selectAllCorrectMcqs()">Select All</button>
        <button class="pill-btn" id="correct-select-toggle-btn" onclick="toggleCorrectMcqsSelectMode()">Select</button>
        <button class="pill-btn active" id="correct-unselect-all-btn" onclick="unselectAllCorrectMcqs()">Unselect All</button>
    </div>

    <!-- Correct Questions List -->
    <div id="correct-mcqs-list-container" class="saved-mcqs-list" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 90px;">
        <!-- Injected dynamically via JS -->
    </div>

    <!-- Pagination -->
    <div id="correct-mcqs-pagination" style="display: flex; justify-content: center; gap: 8px; margin-top: 20px; padding-bottom: 20px;">
        <!-- Injected dynamically via JS -->
    </div>

    <!-- Floating Bottom-Right Start Quiz Button -->
    <div id="correct-mcqs-quiz-btn-container" style="position: fixed; bottom: 85px; right: 20px; z-index: 1000;">
        <button class="floating-quiz-btn" id="correct-mcqs-quiz-btn" onclick="startSelectedCorrectMcqsQuiz()" style="background-color: var(--accent-green, #4CAF50); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); cursor: pointer;" title="Start Quiz">
            QUIZ &gt;
        </button>
    </div>
</div>