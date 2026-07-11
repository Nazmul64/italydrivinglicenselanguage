<!-- SCREEN: Test Results Detailed Breakdown -->
<div id="screen-test-results-detail" class="screen container py-4">
    <!-- Result Header Card -->
    <div class="card p-4 text-center mb-4 border-0 shadow-sm" style="background-color: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-card) !important;">
        <div id="detail-outcome-emoji" class="display-3 mb-2">🙄</div>
        <h2 id="detail-outcome-title" class="fw-bold mb-1" style="color: var(--accent-red); font-size: 28px;">Bocciato</h2>
        <p id="detail-outcome-time" class="text-muted fw-semibold mb-0" style="font-size: 14px;">Tempo: 3 minuti 3 secondi</p>
    </div>

    <!-- Result Summary Stats Section -->
    <div class="row g-3 mb-4 text-center">
        <!-- Total Questions -->
        <div class="col-6 col-md-4 col-lg-2.4" style="flex: 1; min-width: 120px;">
            <div class="card h-100 p-3 border-0 shadow-sm" style="background-color: var(--bg-card); border: 1px solid var(--border-card) !important; border-radius: 14px;">
                <span class="text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Total Questions</span>
                <span id="summary-total-val" class="display-6 fw-bold mt-2" style="color: var(--text-primary);">30</span>
            </div>
        </div>
        <!-- Attempted Questions -->
        <div class="col-6 col-md-4 col-lg-2.4" style="flex: 1; min-width: 120px;">
            <div class="card h-100 p-3 border-0 shadow-sm" style="background-color: var(--bg-card); border: 1px solid var(--border-card) !important; border-radius: 14px;">
                <span class="text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Attempted</span>
                <span id="summary-attempted-val" class="display-6 fw-bold mt-2" style="color: var(--accent-green);">0</span>
            </div>
        </div>
        <!-- Correct Answers -->
        <div class="col-6 col-md-4 col-lg-2.4" style="flex: 1; min-width: 120px;">
            <div class="card h-100 p-3 border-0 shadow-sm" style="background-color: var(--bg-card); border: 1px solid var(--border-card) !important; border-radius: 14px;">
                <span class="text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Correct</span>
                <span id="summary-correct-val" class="display-6 fw-bold mt-2 text-success">0</span>
            </div>
        </div>
        <!-- Incorrect Answers -->
        <div class="col-6 col-md-4 col-lg-2.4" style="flex: 1; min-width: 120px;">
            <div class="card h-100 p-3 border-0 shadow-sm" style="background-color: var(--bg-card); border: 1px solid var(--border-card) !important; border-radius: 14px;">
                <span class="text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Incorrect</span>
                <span id="summary-incorrect-val" class="display-6 fw-bold mt-2 text-danger">0</span>
            </div>
        </div>
        <!-- Not Answered -->
        <div class="col-6 col-md-4 col-lg-2.4" style="flex: 1; min-width: 120px;">
            <div class="card h-100 p-3 border-0 shadow-sm" style="background-color: var(--bg-card); border: 1px solid var(--border-card) !important; border-radius: 14px;">
                <span class="text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">No Response</span>
                <span id="summary-unanswered-val" class="display-6 fw-bold mt-2 text-warning">0</span>
            </div>
        </div>
    </div>

    <!-- Split ratio progress bar -->
    <div class="progress mb-4" style="height: 14px; border-radius: 7px; background-color: var(--border-card); overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
        <div id="split-bar-giusto" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
        <div id="split-bar-sbagliato" class="progress-bar bg-danger" role="progressbar" style="width: 0%"></div>
        <div id="split-bar-nondate" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
    </div>

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

    <!-- Show all option toggle -->
    <div class="text-center mb-4">
        <button class="detail-toggle-btn show-all btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" id="btn-toggle-all" onclick="filterDetailResults('all')">
            Mostra tutte <i class="fa-regular fa-eye-slash ms-1"></i>
        </button>
    </div>

    <!-- Detailed Card List Container -->
    <div id="detail-cards-list-container" class="d-flex flex-column gap-3 mb-5">
        <!-- Question detail card list injected dynamically via JS -->
    </div>
</div>
