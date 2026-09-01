<!-- SCREEN: Noted MCQs (নোট করা এমসিকিউ) -->
<div id="screen-noted-mcqs" class="screen">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Noted MCQs</h3>
        <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);" id="noted-mcqs-count">0 Domande</div>
    </div>

    <!-- Select / Unselect Action Pills -->
    <div class="pill-btn-group" style="margin-bottom: 16px;">
        <button class="pill-btn" id="noted-select-all-btn" onclick="selectAllNotedMcqs()">Select All</button>
        <button class="pill-btn" id="noted-select-toggle-btn" onclick="toggleNotedMcqsSelectMode()">Select</button>
        <button class="pill-btn active" id="noted-unselect-all-btn" onclick="unselectAllNotedMcqs()">Unselect All</button>
    </div>

    <!-- Scrollable content lists -->
    <div id="noted-mcqs-list-container" class="noted-mcqs-list" style="margin-bottom: 80px;">
        <!-- Noted MCQ cards injected dynamically by JS -->
    </div>

    <!-- Sticky Bottom Right Quiz Button -->
    <div id="noted-mcqs-quiz-btn-container" style="position: fixed; bottom: 80px; right: 24px; z-index: 1000; display: none;">
        <button class="btn btn-primary" id="noted-mcqs-quiz-btn" onclick="startNotedMcqsQuiz()" style="height: 40px; border-radius: 20px; font-weight: 800; font-size: 13px; background-color: var(--accent-green); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 20px; cursor: pointer;">
            <span>QUIZ &gt;</span>
        </button>
    </div>
</div>
