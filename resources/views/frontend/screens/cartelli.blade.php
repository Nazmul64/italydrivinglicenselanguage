<!-- SCREEN: Cartelli Module — Chapter Cards Grid -->
<div id="screen-cartelli" class="screen" style="width: 100%; max-width: 1360px; margin: 0 auto; box-sizing: border-box;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Tutti i Capitoli</h3>
        <div id="cartelli-chapters-count-badge" style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">
            {{ isset($cartelliChapters) ? $cartelliChapters->count() : 0 }} Capitoli
        </div>
    </div>

    <!-- Selection Control Pills -->
    <div class="pill-btn-group" style="margin-bottom: 24px;">
        <button class="pill-btn" id="cartelli-chap-btn-select-all" onclick="selectAllCartelliChapters()">Select All</button>
        <button class="pill-btn" id="cartelli-chap-btn-select" onclick="toggleSelectCartelliChapters()">Select</button>
        <button class="pill-btn active" id="cartelli-chap-btn-unselect" onclick="unselectAllCartelliChapters()">Unselect All</button>
    </div>

    <div id="cartelli-chapters-grid" class="argomenti-grid" style="padding-bottom: 80px; width: 100%;">
        @if(isset($cartelliChapters) && $cartelliChapters->count() > 0)
            @foreach($cartelliChapters as $ch)
                @php
                    $chapNum = $ch->chapter_number ?? $ch->sort_order ?? $ch->id;
                @endphp
                <div class="chapter-image-card" data-cartelli-chapter-id="{{ $ch->id }}" onclick="handleCartelliChapterCardClick({{ $ch->id }})">
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                            {{ $chapNum }}) {{ $ch->name }}
                        </div>
                        @if($ch->image)
                            <div class="chapter-card-img-wrapper" style="width: 100%; height: 250px; min-height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                                <img src="{{ $ch->image }}" class="chapter-card-img" alt="{{ $ch->name }}" style="height: 100%; width: 100%; max-height: 250px; max-width: 92%; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        @else
            <div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;">
                Nessun capitolo trovato.
            </div>
        @endif
    </div>

    <!-- Floating QUIZ button (Always visible) -->
    <button class="floating-quiz-btn" id="cartelli-category-quiz-btn" onclick="startCartelliCategoryQuiz()" style="display: flex;">
        <i class="fa-solid fa-play"></i> QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<!-- SCREEN: Cartelli Schede (Page cards for a chapter) -->
<div id="screen-cartelli-schede" class="screen" style="width: 100%; max-width: 1360px; margin: 0 auto; box-sizing: border-box;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
    </div>

    <!-- Chapter Selector Dropdown -->
    <div style="position: relative; margin-bottom: 16px; width: 100%;">
        <div class="chapter-selector-trigger" onclick="toggleCartelliSchedeChapterDropdown()">
            <span id="cartelli-schede-chapter-label">Capitolo...</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
        </div>
        <div class="chapter-dropdown-list-panel" id="cartelli-schede-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;">
            @if(isset($cartelliChapters))
                @foreach($cartelliChapters as $ch)
                    <div class="chapter-dropdown-item" data-dropdown-chap-id="{{ $ch->id }}" onclick="openCartelliSchedeScreen({{ $ch->id }})">
                        Capitolo {{ $ch->chapter_number ?: $ch->id }}) {{ $ch->name }}
                    </div>
                @endforeach
            @endif
        </div>
    </div>

    <!-- Pills -->
    <div class="pill-btn-group" style="margin-bottom: 16px;">
        <button class="pill-btn" id="cartelli-schede-btn-select-all" onclick="selectAllCartelliSchede()">Select All</button>
        <button class="pill-btn" id="cartelli-schede-btn-select" onclick="toggleSelectCartelliSchede()">Select</button>
        <button class="pill-btn active" id="cartelli-schede-btn-unselect" onclick="unselectAllCartelliSchede()">Unselect All</button>
    </div>

    <!-- Pre-rendered Schede list for each chapter -->
    <div id="cartelli-schede-list" class="argomenti-schede-grid" style="padding-bottom: 80px; width: 100%;">
        @if(isset($cartelliChapters))
            @foreach($cartelliChapters as $ch)
                <div id="cartelli-chapter-schede-{{ $ch->id }}" class="cartelli-chapter-schede-box" style="display: none; width: 100%; grid-column: 1 / -1;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; width: 100%;">
                        @if($ch->pages && $ch->pages->count() > 0)
                            @foreach($ch->pages as $page)
                                @php
                                    $pNum = $page->sort_order ?: ($page->page_number ?: $page->id);
                                    $mcqCount = $page->mcqs ? $page->mcqs->count() : 0;
                                @endphp
                                <div class="content-card scheda-item-card" data-cartelli-page-id="{{ $page->id }}" data-chapter-id="{{ $ch->id }}" onclick="handleCartelliSchedaCardClick({{ $ch->id }}, {{ $page->id }})" style="padding: 16px; border-radius: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-card); transition: all 0.15s ease;">
                                    <div>
                                        <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Pagina {{ $pNum }}) {{ $page->title }}</div>
                                        @if($page->bn_title)
                                            <div style="font-size: 12px; color: var(--accent-green); font-weight: 700; margin-top: 2px;">{{ $page->bn_title }}</div>
                                        @endif
                                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">{{ $mcqCount }} Domande (MCQs)</div>
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
    <button class="floating-quiz-btn" id="cartelli-schede-quiz-btn" onclick="startCartelliSchedeQuiz()" style="display: flex;">
        <i class="fa-solid fa-play"></i> QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<!-- SCREEN: Cartelli Page Details (MCQ list for a page) -->
<div id="screen-cartelli-page" class="screen" style="max-width: 100%; width: 100%; margin: 0 auto; padding-left: 12px; padding-right: 12px;">
    <!-- Top Dropdowns -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; width: 100%;">
        <!-- Chapter Dropdown -->
        <div style="position: relative; width: 100%;">
            <div class="chapter-selector-trigger" onclick="toggleCartelliPageChapterDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%;">
                <span id="cartelli-page-chapter-label" style="font-weight: 800; color: var(--text-primary);">Capitolo...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;">
                @if(isset($cartelliChapters))
                    @foreach($cartelliChapters as $ch)
                        <div class="chapter-dropdown-item" onclick="selectCartelliPageChapter({{ $ch->id }})">
                            Capitolo {{ $ch->chapter_number ?: $ch->id }}) {{ $ch->name }}
                        </div>
                    @endforeach
                @endif
            </div>
        </div>
        <!-- Page Dropdown -->
        <div style="position: relative; width: 100%;">
            <div class="chapter-selector-trigger" onclick="toggleCartelliPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%;">
                <span id="cartelli-page-label" style="font-weight: 800; color: var(--text-primary);">Pagina...</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary);"></i>
            </div>
            <div class="chapter-dropdown-list-panel" id="cartelli-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;">
                @if(isset($cartelliChapters))
                    @foreach($cartelliChapters as $ch)
                        @foreach($ch->pages as $p)
                            <div class="chapter-dropdown-item cartelli-page-dropdown-opt" data-chap-parent="{{ $ch->id }}" onclick="openCartelliPageScreen({{ $ch->id }}, {{ $p->id }})" style="display: none;">
                                Pagina {{ $p->sort_order ?: ($p->page_number ?: $p->id) }}) {{ $p->title }}
                            </div>
                        @endforeach
                    @endforeach
                @endif
            </div>
        </div>
        <!-- Select controls -->
        <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 8px;">
            <button class="pill-btn" id="cartelli-select-all-btn" onclick="selectAllCartelliPages()">Select All</button>
            <button class="pill-btn" id="cartelli-select-toggle-btn" onclick="toggleCartelliPageSelection()">Select</button>
            <button class="pill-btn active" id="cartelli-unselect-all-btn" onclick="unselectAllCartelliPages()">Unselect All</button>
        </div>

        <!-- Standalone Top Image Card -->
        <div id="cartelli-page-media-container" style="display: none; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px; margin-top: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); width: 100%;">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img id="cartelli-page-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" style="max-height: 210px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; cursor: pointer; display: inline-block;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" title="Zoom Image">
            </div>
        </div>
    </div>

    <!-- Pre-rendered MCQ lists for all pages -->
    <div id="cartelli-page-mcq-list" style="margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px; width: 100%;">
        @if(isset($cartelliChapters))
            @foreach($cartelliChapters as $ch)
                @foreach($ch->pages as $page)
                    <div id="cartelli-page-container-{{ $page->id }}" class="cartelli-page-mcq-box" style="display: none; width: 100%; flex-direction: column; gap: 16px;" data-chapter-id="{{ $ch->id }}" data-page-id="{{ $page->id }}" data-chapter-name="{{ $ch->name }}" data-chapter-num="{{ $ch->chapter_number ?: $ch->id }}" data-page-title="{{ $page->title }}" data-page-num="{{ $page->sort_order ?: ($page->page_number ?: $page->id) }}" data-page-image="{{ $page->image ?: '' }}">
                        @if($page->mcqs && $page->mcqs->count() > 0)
                            @foreach($page->mcqs as $mIndex => $mcq)
                                @php
                                    $databaseIsVero = strtolower((string)$mcq->correct_answer) === 'vero' || $mcq->correct_answer === '1' || $mcq->correct_answer === 1;
                                @endphp
                                <div class="detail-q-card unanswered" id="cartelli-mcq-card-{{ $mcq->id }}" style="position: relative; cursor: pointer; padding: 16px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-card);">
                                    <!-- MCQ Header -->
                                    <div class="detail-q-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                                        <div class="detail-q-num" style="margin-bottom: 0; font-weight: 800; color: var(--text-secondary); font-size: 13px;">{{ $mIndex + 1 }}</div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <button type="button" class="test-ctrl-btn" onclick="toggleCartelliMcqAnswer({{ $mcq->id }})" id="cartelli-eye-btn-{{ $mcq->id }}" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                                                <i class="fa-regular fa-eye" id="cartelli-eye-icon-{{ $mcq->id }}" style="font-size: 13px; color: var(--text-secondary);"></i>
                                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">দেখুন</span>
                                            </button>
                                            <span id="cartelli-ans-text-{{ $mcq->id }}" style="display: none; font-size: 14px; font-weight: 900; color: {{ $databaseIsVero ? '#4CAF50' : '#ef4444' }};">{{ $databaseIsVero ? 'VERO ✓' : 'FALSO ✗' }}</span>
                                        </div>
                                    </div>

                                    <!-- MCQ Body -->
                                    <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px; width: 100%;">
                                        @if($mcq->image)
                                            <img src="{{ $mcq->image }}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" style="width: 90px; min-width: 90px; height: 90px; object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; background: #fff; padding: 4px;" title="ছবি দেখুন">
                                        @endif
                                        <div style="flex: 1; min-width: 0;">
                                            <div class="detail-q-text-it" style="font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.5;">{!! $mcq->question !!}</div>
                                            @if($mcq->bn_question)
                                                <div class="detail-q-text-bn" id="cartelli-mcq-bn-{{ $mcq->id }}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">{{ $mcq->bn_question }}</div>
                                            @endif
                                        </div>
                                    </div>

                                    <!-- MCQ Action Buttons -->
                                    <div style="display: flex; gap: 6px; margin-top: 14px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
                                        <button type="button" class="test-speaker-btn" onclick="speakCartelliItalian('{{ addslashes(strip_tags($mcq->question)) }}')" style="padding: 5px 8px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; background-color: var(--bg-page); border: 1px solid var(--border-card); cursor: pointer;" title="Italiano">
                                            <i class="fa-solid fa-microphone" style="font-size: 13px; color: var(--accent-green);"></i>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">Italiano</span>
                                        </button>
                                        <button type="button" class="test-ctrl-btn" onclick="toggleCartelliTranslation({{ $mcq->id }})" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Translate">
                                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1;">A Z</div>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">অনুবাদ</span>
                                        </button>
                                        <button type="button" class="test-ctrl-btn" onclick="toggleSavedMcq({{ $mcq->id }}, this, 'cartelli')" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Save">
                                            <i class="fa-regular fa-bookmark" style="font-size: 13px; color: var(--text-secondary);"></i>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">সেভ</span>
                                        </button>
                                        <button type="button" class="test-ctrl-btn" onclick="openNotesModal(null, {{ $mcq->id }}, null, '')" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Note">
                                            <i class="fa-regular fa-note-sticky" style="font-size: 13px; color: var(--text-secondary);"></i>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">নোট</span>
                                        </button>
                                    </div>
                                </div>
                            @endforeach
                        @else
                            <div style="text-align: center; color: var(--text-secondary); padding: 30px;">এই পৃষ্ঠায় কোনো প্রশ্ন নেই।</div>
                        @endif
                    </div>
                @endforeach
            @endforeach
        @endif
    </div>

    <!-- Compact Floating QUIZ button on bottom-right matching reference screenshot -->
    <button class="floating-quiz-btn" onclick="startCartelliPageQuiz()" style="position: fixed; bottom: 85px; right: 20px; background-color: var(--accent-green, #4CAF50); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); cursor: pointer; z-index: 99;" title="Start Quiz">
        <span>QUIZ</span>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px;"></i>
    </button>
</div>

<script>
    let currentCartelliChapId = null;
    let currentCartelliPageId = null;

    function handleCartelliChapterCardClick(chId) {
        openCartelliSchedeScreen(chId);
    }

    function handleCartelliChapterCardClick(chId) {
        if (typeof isCartelliChapterSelectMode !== 'undefined' && isCartelliChapterSelectMode) {
            if (typeof toggleCartelliChapterSelection === 'function') {
                toggleCartelliChapterSelection(chId);
            }
        } else {
            openCartelliSchedeScreen(chId);
        }
    }

    function handleCartelliSchedaCardClick(chId, pageId) {
        if (typeof isCartelliSchedeSelectMode !== 'undefined' && isCartelliSchedeSelectMode) {
            if (typeof toggleCartelliSchedaSelection === 'function') {
                toggleCartelliSchedaSelection(pageId);
            }
        } else {
            openCartelliPageScreen(chId, pageId);
        }
    }

    function openCartelliSchedeScreen(chId) {
        currentCartelliChapId = chId;
        const chapLabel = document.getElementById('cartelli-schede-chapter-label');
        
        // Hide all chapter schede boxes
        document.querySelectorAll('.cartelli-chapter-schede-box').forEach(box => box.style.display = 'none');
        
        // Show active chapter schede
        const activeBox = document.getElementById(`cartelli-chapter-schede-${chId}`);
        if (activeBox) {
            activeBox.style.display = 'block';
        }

        // Update dropdown label text
        const chapCard = document.querySelector(`[data-cartelli-chapter-id="${chId}"] .chapter-card-title`);
        if (chapLabel && chapCard) {
            chapLabel.innerText = chapCard.innerText.trim();
        }

        if (typeof openScreen === 'function') {
            openScreen('cartelli-schede', 'Scegli Scheda');
        }
    }

    function openCartelliPageScreen(chId, pageId) {
        currentCartelliChapId = chId;
        currentCartelliPageId = pageId;

        // Hide all page containers
        document.querySelectorAll('.cartelli-page-mcq-box').forEach(box => {
            box.style.display = 'none';
        });

        // Show active page container
        const targetBox = document.getElementById(`cartelli-page-container-${pageId}`);
        if (targetBox) {
            targetBox.style.display = 'flex';
            
            const chName = targetBox.getAttribute('data-chapter-name') || '';
            const chNum = targetBox.getAttribute('data-chapter-num') || chId;
            const pTitle = targetBox.getAttribute('data-page-title') || '';
            const pNum = targetBox.getAttribute('data-page-num') || pageId;
            const pImg = targetBox.getAttribute('data-page-image') || '';

            const chLabel = document.getElementById('cartelli-page-chapter-label');
            if (chLabel) chLabel.innerText = `Capitolo ${chNum}) ${chName}`;

            const pLabel = document.getElementById('cartelli-page-label');
            if (pLabel) pLabel.innerText = `Pagina ${pNum}) ${pTitle}`;

            // Top Image
            const mediaCont = document.getElementById('cartelli-page-media-container');
            const imgEl = document.getElementById('cartelli-page-image');
            if (mediaCont && imgEl) {
                if (pImg) {
                    imgEl.src = pImg;
                    mediaCont.style.display = 'block';
                } else {
                    mediaCont.style.display = 'none';
                }
            }
        }

        if (typeof openScreen === 'function') {
            openScreen('cartelli-page', 'Vere e False');
        }
    }

    function toggleCartelliSchedeChapterDropdown() {
        const dropdown = document.getElementById('cartelli-schede-chapter-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    function toggleCartelliPageChapterDropdown() {
        const dropdown = document.getElementById('cartelli-page-chapter-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    function toggleCartelliPageDropdown() {
        const dropdown = document.getElementById('cartelli-page-dropdown');
        if (!dropdown) return;
        
        const isHidden = dropdown.style.display === 'none';
        if (isHidden && currentCartelliChapId) {
            dropdown.querySelectorAll('.cartelli-page-dropdown-opt').forEach(opt => {
                const parentChap = opt.getAttribute('data-chap-parent');
                opt.style.display = (parentChap == currentCartelliChapId) ? 'block' : 'none';
            });
        }
        dropdown.style.display = isHidden ? 'block' : 'none';
    }

    function selectCartelliPageChapter(chId) {
        const dropdown = document.getElementById('cartelli-page-chapter-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        
        // Find first page of chapter
        const firstPageBox = document.querySelector(`.cartelli-page-mcq-box[data-chapter-id="${chId}"]`);
        if (firstPageBox) {
            const pageId = firstPageBox.getAttribute('data-page-id');
            openCartelliPageScreen(chId, pageId);
        } else {
            openCartelliSchedeScreen(chId);
        }
    }

    function toggleCartelliMcqAnswer(qId) {
        const textEl = document.getElementById(`cartelli-ans-text-${qId}`);
        const iconEl = document.getElementById(`cartelli-eye-icon-${qId}`);
        const btnEl = document.getElementById(`cartelli-eye-btn-${qId}`);
        if (!textEl || !iconEl) return;

        if (textEl.style.display === 'none') {
            textEl.style.display = 'inline';
            iconEl.className = 'fa-regular fa-eye-slash';
            iconEl.style.color = 'var(--accent-green)';
            const labelEl = btnEl ? btnEl.querySelector('span') : null;
            if (labelEl) { labelEl.innerText = 'লুকান'; labelEl.style.color = 'var(--accent-green)'; }
        } else {
            textEl.style.display = 'none';
            iconEl.className = 'fa-regular fa-eye';
            iconEl.style.color = 'var(--text-secondary)';
            const labelEl = btnEl ? btnEl.querySelector('span') : null;
            if (labelEl) { labelEl.innerText = 'দেখুন'; labelEl.style.color = 'var(--text-secondary)'; }
        }
    }

    function toggleCartelliTranslation(qId) {
        const bnEl = document.getElementById(`cartelli-mcq-bn-${qId}`);
        if (bnEl) {
            bnEl.style.display = (bnEl.style.display === 'none' || !bnEl.style.display) ? 'block' : 'none';
        }
    }

    function speakCartelliItalian(text) {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
            utterance.lang = 'it-IT';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chapter-selector-trigger')) {
            const d1 = document.getElementById('cartelli-schede-chapter-dropdown');
            if (d1) d1.style.display = 'none';
            const d2 = document.getElementById('cartelli-page-chapter-dropdown');
            if (d2) d2.style.display = 'none';
            const d3 = document.getElementById('cartelli-page-dropdown');
            if (d3) d3.style.display = 'none';
        }
    });
</script>
