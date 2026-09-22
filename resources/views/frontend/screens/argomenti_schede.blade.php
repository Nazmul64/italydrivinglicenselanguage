<!-- SCREEN: Argomenti Schede (Scegli Scheda) -->
<div id="screen-argomenti-schede" class="screen" style="width: 100%; max-width: 1360px; margin: 0 auto; box-sizing: border-box;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Dropdown Selector Wrapper -->
    <div style="position: relative; margin-bottom: 16px; width: 100%;">
        <div class="chapter-selector-trigger" onclick="toggleChapterDropdownList()">
            <span id="selected-chapter-display-label">
                @if(isset($argomentiChapters) && count($argomentiChapters) > 0)
                    Capitolo {{ $argomentiChapters[0]->chapter_number ?: $argomentiChapters[0]->id }}) {{ $argomentiChapters[0]->name }}
                @else
                    Capitolo...
                @endif
            </span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <!-- Dropdown Panel -->
        <div class="chapter-dropdown-list-panel" id="chapter-dropdown-list-panel" style="display: none; position: absolute; width: 100%; z-index: 100;">
            @if(isset($argomentiChapters))
                @foreach($argomentiChapters as $ch)
                    <div class="chapter-dropdown-item {{ $loop->first ? 'active' : '' }}" onclick="selectChapterFromDropdown({{ $ch->id }})">
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

    <div id="argomenti-schede-list" style="padding-bottom: 80px; width: 100%;">
        @if(isset($argomentiChapters))
            @foreach($argomentiChapters as $ch)
                <div id="argomenti-chapter-schede-{{ $ch->id }}" class="argomenti-chapter-schede-box" style="display: {{ $loop->first ? 'block' : 'none' }}; width: 100%;">
                    <div class="argomenti-grid" style="width: 100%;">
                        @if($ch->pages && $ch->pages->count() > 0)
                            @foreach($ch->pages as $index => $page)
                                @php
                                    $pNum = $page->sort_order ?: ($page->page_number ?: ($index + 1));
                                    $rawTitle = preg_replace('/^pagina\s*\d+[\s\.\)\-]*/i', '', $page->title ?: '');
                                    $rawTitle = preg_replace('/^\d+[\s\.\)\-]+/', '', $rawTitle);
                                    $rawTitle = trim($rawTitle);
                                    $displayTitle = !empty($rawTitle) ? "Pagina {$pNum}) {$rawTitle}" : "Pagina {$pNum}";
                                    $pageImage = \App\Helpers\ImageHelper::formatImageUrl($page->image);
                                    $qCount = $page->questions ? $page->questions->count() : ($page->questions_count ?? 0);
                                    $pCorrect = $page->corrette ?? 0;
                                    $pWrong = $page->errori ?? 0;
                                    $pUnanswered = max(0, $qCount - $pCorrect - $pWrong);
                                    $pSafeTotal = $qCount > 0 ? $qCount : 1;
                                @endphp
                                <div class="chapter-image-card scheda-item-card" data-page-id="{{ $page->id }}" data-chapter-id="{{ $ch->id }}" onclick="handleArgomentiSchedaClick({{ $ch->id }}, {{ $page->id }})">
                                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                                        <div class="chapter-card-title" style="text-align: center; font-size: 16px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                                            {{ $displayTitle }}
                                        </div>
                                        @if(!empty($pageImage))
                                        <div class="chapter-card-img-wrapper" style="width: 100%; max-width: 460px; height: 210px; min-height: 180px; display: flex; align-items: center; justify-content: center; margin: 10px auto; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                                            <img src="{{ $pageImage }}" onerror="this.parentElement.style.display='none'" class="chapter-card-img" alt="{{ $displayTitle }}" style="height: 100%; width: 90%; max-height: 210px; max-width: 440px; object-fit: cover; object-position: center; border-radius: 14px; background: transparent; display: block;">
                                        </div>
                                        @endif
                                        <div style="width: 100%; margin-top: 14px;">
                                            <div style="text-align: center; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Progresso</div>
                                            <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
                                                <div>
                                                    <div>Corrette</div>
                                                    <div style="font-weight: 700; color: #4CAF50; margin-top: 2px;">{{ $pCorrect }}</div>
                                                </div>
                                                <div>
                                                    <div>Errori</div>
                                                    <div style="font-weight: 700; color: #ef4444; margin-top: 2px;">{{ $pWrong }}</div>
                                                </div>
                                                <div>
                                                    <div>Non risposte</div>
                                                    <div style="font-weight: 700; color: var(--text-secondary); margin-top: 2px;">{{ $pUnanswered }}</div>
                                                </div>
                                                <div>
                                                    <div>Totale</div>
                                                    <div style="font-weight: 700; color: var(--text-primary); margin-top: 2px;">{{ $qCount }}</div>
                                                </div>
                                            </div>
                                            <div style="height: 12px; background-color: #e5e7eb; border-radius: 999px; display: flex; overflow: hidden; border: 1.5px solid #d1d5db; padding: 1px;">
                                                <div style="background-color: #22c55e; width: {{ ($pCorrect / $pSafeTotal) * 100 }}%; border-radius: 999px 0 0 999px; transition: width 0.3s;"></div>
                                                <div style="background-color: #ef4444; width: {{ ($pWrong / $pSafeTotal) * 100 }}%; transition: width 0.3s;"></div>
                                                <div style="background-color: transparent; flex: 1;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        @else
                            <div style="text-align: center; color: var(--text-secondary); padding: 30px; grid-column: 1 / -1;">Nessuna pagina trovata per questo capitolo.</div>
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
    function handleArgomentiSchedaClick(chId, pageId) {
        if (typeof isSchedeSelectMode !== 'undefined' && isSchedeSelectMode) {
            if (typeof toggleSheetSelectionById === 'function') {
                toggleSheetSelectionById(pageId);
            }
        } else {
            if (typeof openPageDetailsScreen === 'function') {
                openPageDetailsScreen(pageId);
            }
        }
    }
</script>
