<!-- SCREEN: Saved MCQs -->
<div id="screen-saved-mcqs" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Saved MCQs</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);" id="saved-mcqs-count">0 Domande</div>
    </div>

    <!-- Select / Unselect Action Pills -->
    <div class="pill-btn-group" style="margin-bottom: 16px;">
        <button class="pill-btn" id="saved-select-toggle-btn" onclick="toggleSavedMcqsSelectMode()">Select</button>
        <button class="pill-btn" id="saved-select-all-btn" onclick="selectAllSavedMcqs()">Select All</button>
        <button class="pill-btn active" id="saved-unselect-all-btn" onclick="unselectAllSavedMcqs()">Unselect All</button>
    </div>

    <!-- Scrollable content lists -->
    <div id="saved-mcqs-list-container" class="saved-mcqs-list" style="margin-bottom: 80px;">
        <!-- Saved MCQ cards injected dynamically by JS -->
    </div>

    <!-- Sticky Bottom Quiz Bar -->
    <div id="saved-mcqs-quiz-btn-container" style="position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 800px; z-index: 1000; display: none;">
        <button class="btn btn-primary" id="saved-mcqs-quiz-btn" onclick="startSavedMcqsQuiz()" style="width: 100%; height: 50px; border-radius: 12px; font-weight: 800; font-size: 16px; background-color: var(--accent-green); color: #ffffff; border: none; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
            <i class="fa-solid fa-circle-play" style="font-size: 18px;"></i>
            <span>QUIZ &gt;</span>
        </button>
    </div>
</div>
