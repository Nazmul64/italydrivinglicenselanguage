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

    <!-- Selection Actions Toolbar (Select All, Unselect All, Start Quiz) -->
    <div id="correct-mcqs-selection-bar" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; background-color: var(--bg-card); padding: 10px 14px; border-radius: 14px; border: 1.5px solid var(--border-card);">
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: nowrap; overflow-x: auto; max-width: 100%;">
            <button id="correct-select-all-btn" onclick="selectAllCorrectMcqs()" style="padding: 6px 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0;">
                <i class="fa-regular fa-square-check" style="color: var(--accent-green);"></i> Select All
            </button>
            <button id="correct-unselect-all-btn" onclick="unselectAllCorrectMcqs()" style="padding: 6px 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0;">
                <i class="fa-regular fa-square" style="color: var(--text-secondary);"></i> Unselect
            </button>
            <span id="correct-selected-count-badge" style="font-size: 11px; font-weight: 800; color: var(--text-secondary); background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-card); white-space: nowrap; flex-shrink: 0;">Selected: 0</span>
        </div>
        <div>
            <button id="correct-start-quiz-btn" onclick="startSelectedCorrectMcqsQuiz()" style="padding: 8px 16px; border-radius: 10px; border: none; background-color: var(--accent-green); color: white; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(34, 197, 94, 0.3); transition: all 0.2s;">
                <i class="fa-solid fa-play"></i> Start Quiz (<span id="correct-quiz-btn-count">0</span>)
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

    <!-- Floating Bottom Start Quiz Button Container -->
    <div id="correct-mcqs-quiz-btn-container" style="position: fixed; bottom: 75px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 600px; z-index: 1000; display: none;">
        <button class="btn btn-primary" id="correct-mcqs-quiz-btn" onclick="startSelectedCorrectMcqsQuiz()" style="width: 100%; height: 50px; border-radius: 14px; font-weight: 800; font-size: 15px; background-color: var(--accent-green); color: #ffffff; border: none; box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
            <i class="fa-solid fa-play"></i> Start Quiz (<span id="correct-floating-quiz-count">0</span>)
        </button>
    </div>
</div>
