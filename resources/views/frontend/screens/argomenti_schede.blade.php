<!-- SCREEN: Argomenti Schede (Scegli Scheda) -->
<div id="screen-argomenti-schede" class="screen" style="width: 100%; max-width: 1360px; margin: 0 auto; box-sizing: border-box;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Dropdown Selector Wrapper -->
    <div style="position: relative; margin-bottom: 16px;">
        <div class="chapter-selector-trigger" onclick="toggleArgomentiSchedeChapterDropdown()">
            <span id="selected-chapter-display-label">Capitolo...</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <!-- Dropdown Panel -->
        <div class="chapter-dropdown-list-panel" id="chapter-dropdown-list-panel" style="display: none; position: absolute; width: 100%; z-index: 100;">
            @if(isset($argomentiChapters))
                @foreach($argomentiChapters as $ch)
                    <div class="chapter-dropdown-item" onclick="openChapterSheetsScreen({{ $ch->id }})">
                        Capitolo {{ $ch->chapter_number ?: $ch->id }}) {{ $ch->name }}
                    </div>
                @endforeach
            @endif
        </div>
    </div>

    <!-- Pills -->
    <div class="pill-btn-group" style="margin-bottom: 16px;">
        <button class="pill-btn" id="pill-argomenti-select-all" onclick="selectAllSheets()">Select All</button>
        <button class="pill-btn" id="pill-argomenti-select" onclick="toggleSelectSheets()">Select</button>
        <button class="pill-btn active" id="pill-argomenti-unselect" onclick="unselectAllSheets()">Unselect All</button>
    </div>

    <div id="argomenti-schede-list" class="argomenti-schede-grid" style="padding-bottom: 80px; width: 100%;">
        @if(isset($argomentiChapters))
            @foreach($argomentiChapters as $ch)
                <div id="argomenti-chapter-schede-{{ $ch->id }}" class="argomenti-chapter-schede-box" style="display: none; width: 100%; grid-column: 1 / -1;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; width: 100%;">
                        @if($ch->pages && $ch->pages->count() > 0)
                            @foreach($ch->pages as $page)
                                @php
                                    $pNum = $page->sort_order ?: ($page->id);
                                    $qCount = $page->questions ? $page->questions->count() : 0;
                                @endphp
                                <div class="content-card scheda-item-card" data-page-id="{{ $page->id }}" data-chapter-id="{{ $ch->id }}" onclick="handleArgomentiSchedaClick({{ $ch->id }}, {{ $page->id }})" style="padding: 16px; border-radius: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-card); transition: all 0.15s ease;">
                                    <div>
                                        <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Pagina {{ $pNum }}) {{ $page->title }}</div>
                                        @if($page->bn_title)
                                            <div style="font-size: 12px; color: var(--accent-green); font-weight: 700; margin-top: 2px;">{{ $page->bn_title }}</div>
                                        @endif
                                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">{{ $qCount }} Domande (MCQs)</div>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: var(--text-secondary);"></i>
                                </div>
                            @endforeach
                        @else
                            <div style="text-align: center; color: var(--text-secondary); padding: 30px; grid-column: 1 / -1;">এই অধ্যায়ে কোনো পেজ পাওয়া যায়নি।</div>
                        @endif
                    </div>
                </div>
            @endforeach
        @endif
    </div>

    <!-- Floating QUIZ button (Always visible) -->
    <button class="floating-quiz-btn" id="sheets-quiz-btn" onclick="startCustomSheetsQuiz()" style="display: flex;">
        <i class="fa-solid fa-play"></i> QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<script>
    let currentArgomentiChapId = null;

    function openChapterSheetsScreen(chId) {
        currentArgomentiChapId = chId;
        const chapLabel = document.getElementById('selected-chapter-display-label');
        
        // Hide all chapter schede boxes
        document.querySelectorAll('.argomenti-chapter-schede-box').forEach(box => box.style.display = 'none');
        
        // Show active chapter schede
        const activeBox = document.getElementById(`argomenti-chapter-schede-${chId}`);
        if (activeBox) {
            activeBox.style.display = 'block';
        }

        const chapCard = document.querySelector(`[data-chapter-id="${chId}"] .chapter-card-title`);
        if (chapLabel && chapCard) {
            chapLabel.innerText = chapCard.innerText.trim();
        } else if (chapLabel) {
            chapLabel.innerText = `Capitolo ${chId}`;
        }

        const dropdown = document.getElementById('chapter-dropdown-list-panel');
        if (dropdown) dropdown.style.display = 'none';

        if (typeof openScreen === 'function') {
            openScreen('argomenti-schede', 'Scegli Scheda');
        }
    }

    function toggleArgomentiSchedeChapterDropdown() {
        const dropdown = document.getElementById('chapter-dropdown-list-panel');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    function handleArgomentiSchedaClick(chId, pageId) {
        if (typeof isSchedeSelectMode !== 'undefined' && isSchedeSelectMode) {
            if (typeof toggleSheetSelectionById === 'function') {
                toggleSheetSelectionById(pageId);
            }
        } else {
            if (typeof openPageDetailsScreen === 'function') {
                openPageDetailsScreen(chId, pageId);
            }
        }
    }
</script>
