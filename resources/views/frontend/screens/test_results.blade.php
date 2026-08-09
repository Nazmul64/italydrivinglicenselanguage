<!-- SCREEN: Test Results Detailed Breakdown -->
<div id="screen-test-results-detail" class="screen container py-4">




    <!-- Navigation Toggles / Filter Buttons -->
    <div class="d-flex gap-2 flex-wrap justify-content-center mb-3">
        <button class="detail-toggle-btn corrette btn px-3 py-2 fw-bold" id="btn-toggle-corrette" onclick="filterDetailResults('correct')">
            Corrette: <span id="detail-count-corrette">0</span> <i class="fa-regular fa-eye ms-1"></i>
        </button>
        <button class="detail-toggle-btn errori btn px-3 py-2 fw-bold" id="btn-toggle-errori" onclick="filterDetailResults('incorrect')">
            Errori: <span id="detail-count-errori">0</span> <i class="fa-regular fa-eye ms-1"></i>
        </button>
        <button class="detail-toggle-btn nondate btn px-3 py-2 fw-bold" id="btn-toggle-nondate" onclick="filterDetailResults('unanswered')">
            Non risposte: <span id="detail-count-nondate">0</span> <i class="fa-regular fa-eye ms-1"></i>
        </button>
    </div>

    <!-- Split ratio progress bar -->
    <div class="progress mb-4" style="height: 14px; border-radius: 7px; background-color: var(--border-card); overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
        <div id="split-bar-giusto" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
        <div id="split-bar-sbagliato" class="progress-bar bg-danger" role="progressbar" style="width: 0%"></div>
        <div id="split-bar-nondate" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
    </div>

    <!-- Detailed Card List Container -->
    <div id="detail-cards-list-container" class="test-results-detail-list">
        <!-- Question detail card list injected dynamically via JS -->
    </div>
</div>
