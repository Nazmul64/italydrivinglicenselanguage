<!-- SCREEN: Page Details (Vere e False list) -->
<div id="screen-page-details" class="screen" style="max-width: 100%; margin: 0 auto; padding-left: 12px; padding-right: 12px;">
    <!-- Top dropdown navigation bar matching screenshot 4 -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px;">
                <!-- Chapter Dropdown Select -->
                <div style="position: relative;">
                    <div class="chapter-selector-trigger" onclick="toggleArgomentiPageChapterDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                        <span id="page-details-chapter-label" style="font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Capitolo...</span>
                        <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;"></i>
                    </div>
                    <div class="chapter-dropdown-list-panel" id="page-details-chapter-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100;">
                        @if(isset($argomentiChapters))
                            @foreach($argomentiChapters as $ch)
                                <div class="chapter-dropdown-item" onclick="selectArgomentiPageChapter({{ $ch->id }})">
                                    Capitolo {{ $ch->chapter_number ?: $ch->id }}) {{ $ch->name }}
                                </div>
                            @endforeach
                        @endif
                    </div>
                </div>

                <!-- Page Dropdown Select -->
                <div style="position: relative;">
                    <div class="chapter-selector-trigger" onclick="toggleArgomentiPageDropdown()" style="padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                        <span id="page-details-page-label" style="font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pagina...</span>
                        <i class="fa-solid fa-chevron-down" style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;"></i>
                    </div>
                    <div class="chapter-dropdown-list-panel" id="page-details-page-dropdown" style="display: none; position: absolute; width: 100%; z-index: 100; max-height: 250px; overflow-y: auto;">
                        @if(isset($argomentiChapters))
                            @foreach($argomentiChapters as $ch)
                                @foreach($ch->pages as $p)
                                    <div class="chapter-dropdown-item argomenti-page-dropdown-opt" data-chap-parent="{{ $ch->id }}" data-page-id="{{ $p->id }}" onclick="openPageDetailsScreen({{ $ch->id }}, {{ $p->id }})" style="display: none;">
                                        Pagina {{ $p->sort_order ?: ($p->id) }}) {{ $p->title }}
                                    </div>
                                @endforeach
                            @endforeach
                        @endif
                    </div>
                </div>
            </div>

            <!-- Close Cross Button (X) requested by user beside dropdowns -->
            <button type="button" class="page-details-close-btn" onclick="closePageDetailsScreen()" title="Chiudi / Close" style="width: 44px; height: 44px; min-width: 44px; border-radius: 50%; border: 1.5px solid var(--border-card); background: var(--bg-card); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s ease;">
                <i class="fa-solid fa-xmark" style="font-size: 20px; font-weight: 900;"></i>
            </button>
        </div>

        <!-- Page selection controls -->
        <div class="pill-btn-group" style="margin-top: 4px; margin-bottom: 8px;">
            <button class="pill-btn" id="page-details-select-all-btn" onclick="selectAllPagesInDetails()">Select All</button>
            <button class="pill-btn" id="page-details-select-toggle-btn" onclick="toggleCurrentPageSelection()">Select</button>
            <button class="pill-btn active" id="page-details-unselect-all-btn" onclick="unselectAllPagesInDetails()">Unselect All</button>
        </div>

        <!-- Standalone Top Image Card -->
        <div id="page-details-media-container" style="display: none; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px; margin-top: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); width: 100%;">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img id="page-details-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" style="max-height: 210px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; cursor: pointer; display: inline-block;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" title="Zoom Image">
            </div>
        </div>
    </div>

    <!-- Unified Page Details Master Card -->
    <div style="margin-bottom: 90px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Pre-rendered Questions container per page -->
        <div id="page-questions-list-container" class="page-questions-list" style="margin-bottom: 0;">
            @if(isset($argomentiChapters))
                @foreach($argomentiChapters as $ch)
                    @foreach($ch->pages as $page)
                        <div id="argomenti-page-container-{{ $page->id }}" class="argomenti-page-box" style="display: none; width: 100%; flex-direction: column; gap: 16px;" data-chapter-id="{{ $ch->id }}" data-page-id="{{ $page->id }}" data-chapter-name="{{ $ch->name }}" data-chapter-num="{{ $ch->chapter_number ?: $ch->id }}" data-page-title="{{ $page->title }}" data-page-num="{{ $page->sort_order ?: $page->id }}" data-page-image="{{ $page->image ?: '' }}">
                            @if($page->questions && $page->questions->count() > 0)
                                @foreach($page->questions as $qIndex => $q)
                                    @php
                                        $rawAns = strtolower(trim((string)($q->correct_answer ?? '')));
                                        $databaseIsVero = ($q->is_vero === true || $q->is_vero === 1 || $q->is_vero === '1' || $rawAns === 'vero' || $rawAns === 'v' || $rawAns === '1');
                                    @endphp
                                    <div class="detail-q-card unanswered" id="argomenti-q-card-{{ $q->id }}" onclick="handleArgomentiCardClick(this, event)" style="position: relative; cursor: pointer; padding: 16px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-card);">
                                        <!-- Header Row -->
                                        <div class="detail-q-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                                            <div class="detail-q-num" style="margin-bottom: 0; font-weight: 800; color: var(--text-secondary); font-size: 13px;">{{ $qIndex + 1 }}</div>
                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                <button type="button" class="test-ctrl-btn" onclick="toggleArgomentiQuestionAnswer({{ $q->id }})" id="argomenti-eye-btn-{{ $q->id }}" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                                                    <i class="fa-regular fa-eye" id="argomenti-eye-icon-{{ $q->id }}" style="font-size: 13px; color: var(--text-secondary);"></i>
                                                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">দেখুন</span>
                                                </button>
                                                <span id="argomenti-ans-text-{{ $q->id }}" style="display: none; font-size: 14px; font-weight: 900; color: {{ $databaseIsVero ? '#4CAF50' : '#ef4444' }};">{{ $databaseIsVero ? 'VERO ✓' : 'FALSO ✗' }}</span>
                                            </div>
                                        </div>

                                        <!-- Body -->
                                        @php
                                            $cardImg = $q->image;
                                            if (!$cardImg && !empty($q->vocabulary) && is_array($q->vocabulary)) {
                                                foreach ($q->vocabulary as $vItem) {
                                                    if (!empty($vItem['image'])) {
                                                        $cardImg = $vItem['image'];
                                                        break;
                                                    }
                                                }
                                            }
                                        @endphp
                                        <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px; width: 100%;">
                                            <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center;">
                                                @if($cardImg)
                                                    <img src="{{ $cardImg }}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" title="ছবি দেখুন">
                                                @endif
                                            </div>
                                            <div style="flex: 1; min-width: 0;">
                                                <div class="detail-q-text-it" id="argomenti-q-it-{{ $q->id }}" style="font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.5;">{!! $q->italian !!}</div>
                                                <div class="detail-q-text-bn" id="argomenti-q-bn-{{ $q->id }}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">{{ $q->bangla ?: 'কোনো অনুবাদ পাওয়া যায়নি' }}</div>
                                                @if(!empty($q->vocabulary))
                                                    <script type="application/json" id="argomenti-vocab-{{ $q->id }}">{!! json_encode($q->vocabulary) !!}</script>
                                                @endif
                                            </div>
                                        </div>

                                        <!-- Buttons -->
                                        <div style="display: flex; gap: 6px; margin-top: 14px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
                                            <button type="button" class="test-speaker-btn" onclick="speakArgomentiQuestion({{ $q->id }})" style="padding: 5px 8px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; background-color: var(--bg-page); border: 1px solid var(--border-card); cursor: pointer;" title="Italiano">
                                                <i class="fa-solid fa-microphone" style="font-size: 13px; color: var(--accent-green);"></i>
                                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">Italiano</span>
                                            </button>
                                            <button type="button" class="test-ctrl-btn" onclick="openPageDetailsQuestionTranslation({{ $q->id }}, this)" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Translate">
                                                <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1;">A Z</div>
                                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">অনুবাদ</span>
                                            </button>
                                            <button type="button" class="test-ctrl-btn" onclick="toggleSavedMcq({{ $q->id }}, this, 'argomenti')" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Save">
                                                <i class="fa-regular fa-bookmark" style="font-size: 13px; color: var(--text-secondary);"></i>
                                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary);">সেভ</span>
                                            </button>
                                            <button type="button" class="test-ctrl-btn" onclick="openNotesModal(null, {{ $q->id }}, null, '', 'argomenti')" style="padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Note">
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
    </div>

    <!-- Compact Floating QUIZ button on bottom-right matching reference screenshot -->
    <button class="floating-quiz-btn" onclick="startPageQuiz()" style="position: fixed; bottom: 85px; right: 20px; background-color: var(--accent-green, #4CAF50); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); cursor: pointer; z-index: 99;" title="Start Quiz">
        <span>QUIZ</span>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px;"></i>
    </button>
</div>

<script>
    let currentArgomentiPageId = null;
    let currentArgomentiChapId = null;

    function updateArgomentiPageDropdownOptions(targetChapId) {
        const dropdown = document.getElementById('page-details-page-dropdown');
        if (!dropdown) return;
        let activeChap = targetChapId || window.currentArgomentiChapId || currentArgomentiChapId;
        if (!activeChap) {
            const firstOpt = dropdown.querySelector('.argomenti-page-dropdown-opt');
            if (firstOpt) activeChap = parseInt(firstOpt.getAttribute('data-chap-parent'));
            window.currentArgomentiChapId = activeChap;
            currentArgomentiChapId = activeChap;
        }
        dropdown.querySelectorAll('.argomenti-page-dropdown-opt').forEach(opt => {
            const pChap = opt.getAttribute('data-chap-parent');
            opt.style.display = (!activeChap || pChap == activeChap) ? 'block' : 'none';
        });
    }

    function syncChapterPagesDropdown(chapId) {
        if (!chapId) return;
        fetch(`/api/v1/chapters/${chapId}/pages?_t=` + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(resData => {
                const pages = resData.data || resData || [];
                if (!Array.isArray(pages) || pages.length === 0) return;
                const dropdown = document.getElementById('page-details-page-dropdown');
                if (!dropdown) return;
                pages.forEach(p => {
                    const pId = p.id;
                    let opt = dropdown.querySelector(`.argomenti-page-dropdown-opt[data-page-id="${pId}"]`);
                    if (!opt) {
                        opt = document.createElement('div');
                        opt.className = 'chapter-dropdown-item argomenti-page-dropdown-opt';
                        opt.setAttribute('data-chap-parent', chapId);
                        opt.setAttribute('data-page-id', pId);
                        opt.onclick = () => openPageDetailsScreen(chapId, pId);
                        dropdown.appendChild(opt);
                    }
                    const pNum = p.sort_order || pId;
                    const pTitle = p.title || p.name || '';
                    opt.innerText = `Pagina ${pNum}) ${pTitle}`;
                    const curChap = window.currentArgomentiChapId || currentArgomentiChapId;
                    if (curChap == chapId) {
                        opt.style.display = 'block';
                    }
                });
            })
            .catch(() => {});
    }

    function openPageDetailsScreen(arg1, arg2) {
        let chId = null;
        let pageId = null;

        if (typeof arg2 !== 'undefined' && arg2 !== null) {
            chId = parseInt(arg1);
            pageId = parseInt(arg2);
        } else if (typeof arg1 !== 'undefined' && arg1 !== null) {
            pageId = parseInt(arg1);
        }

        if (!pageId && !chId) return;

        if (!chId && pageId) {
            const box = document.getElementById(`argomenti-page-container-${pageId}`);
            if (box) {
                chId = parseInt(box.getAttribute('data-chapter-id'));
            }
            if (!chId) {
                const opt = document.querySelector(`.argomenti-page-dropdown-opt[data-page-id="${pageId}"]`);
                if (opt) chId = parseInt(opt.getAttribute('data-chap-parent'));
            }
        }

        window.currentArgomentiChapId = chId;
        currentArgomentiChapId = chId;
        window.currentArgomentiPageId = pageId;
        currentArgomentiPageId = pageId;

        try { if (chId) sessionStorage.setItem('activeArgomentiChapId', chId); } catch(e) {}
        try { if (pageId) sessionStorage.setItem('activePageDetailsId', pageId); } catch(e) {}

        const d1 = document.getElementById('page-details-chapter-dropdown');
        if (d1) d1.style.display = 'none';
        const d2 = document.getElementById('page-details-page-dropdown');
        if (d2) d2.style.display = 'none';

        if (typeof unselectAllPagesInDetails === 'function') unselectAllPagesInDetails();

        // 1. Check if pre-rendered box exists
        const targetBox = document.getElementById(`argomenti-page-container-${pageId}`);
        if (targetBox) {
            document.querySelectorAll('.argomenti-page-box').forEach(b => b.style.display = 'none');
            targetBox.style.display = 'flex';
            syncArgomentiBookmarkStates(targetBox);

            const chName = targetBox.getAttribute('data-chapter-name') || '';
            const chNum = targetBox.getAttribute('data-chapter-num') || chId || '';
            const pTitle = targetBox.getAttribute('data-page-title') || '';
            const pNum = targetBox.getAttribute('data-page-num') || pageId;
            const pImg = targetBox.getAttribute('data-page-image') || '';

            const chLabel = document.getElementById('page-details-chapter-label');
            if (chLabel) chLabel.innerText = chName ? `Capitolo ${chNum}) ${chName}` : `Capitolo ${chNum}`;

            const pLabel = document.getElementById('page-details-page-label');
            if (pLabel) pLabel.innerText = `Pagina ${pNum}) ${pTitle}`;

            // Top image
            const mediaCont = document.getElementById('page-details-media-container');
            const imgEl = document.getElementById('page-details-image');
            if (mediaCont && imgEl) {
                const cleanImg = typeof sanitizeAppImageUrl === 'function' ? sanitizeAppImageUrl(pImg) : (pImg && !pImg.includes('/data/user/') && !pImg.includes('scaled_IMG') ? pImg : '');
                if (cleanImg) {
                    imgEl.src = cleanImg;
                    mediaCont.style.display = 'block';
                } else {
                    mediaCont.style.display = 'none';
                }
            }

            if (chId) {
                updateArgomentiPageDropdownOptions(chId);
                syncChapterPagesDropdown(chId);
            }
        } else {
            // Dynamic fallback
            if (typeof renderDynamicPageDetails === 'function') {
                renderDynamicPageDetails(pageId);
            }
        }

        if (typeof openScreen === 'function') {
            openScreen('page-details', 'Vere e False');
        }
    }

    function syncArgomentiBookmarkStates(container) {
        const root = container || document;
        const aBookmarks = JSON.parse(localStorage.getItem('argomenti_bookmarks') || '[]');
        root.querySelectorAll('[id^="argomenti-q-card-"]').forEach(card => {
            const match = card.id.match(/\d+/);
            if (!match) return;
            const qId = parseInt(match[0]);
            let isSaved = aBookmarks.includes(qId) || aBookmarks.includes(String(qId));
            if (!isSaved && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
                isSaved = activeSavedMcqs.some(q => (q.id == qId || (q.question && q.question.id == qId)));
            }
            const icon = card.querySelector('.fa-bookmark');
            if (icon) {
                icon.className = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                icon.style.color = isSaved ? 'var(--accent-green)' : '';
            }
        });
    }

    function toggleArgomentiPageChapterDropdown() {
        const dropdown = document.getElementById('page-details-chapter-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    function toggleArgomentiPageDropdown() {
        const dropdown = document.getElementById('page-details-page-dropdown');
        if (!dropdown) return;

        const isHidden = (dropdown.style.display === 'none' || !dropdown.style.display);
        if (isHidden) {
            let activeChap = window.currentArgomentiChapId || currentArgomentiChapId;
            if (!activeChap) {
                const firstBox = document.querySelector('.argomenti-page-box:not([style*="display: none"])') || document.querySelector('.argomenti-page-box');
                if (firstBox) activeChap = parseInt(firstBox.getAttribute('data-chapter-id'));
                if (!activeChap) {
                    const firstOpt = dropdown.querySelector('.argomenti-page-dropdown-opt');
                    if (firstOpt) activeChap = parseInt(firstOpt.getAttribute('data-chap-parent'));
                }
                window.currentArgomentiChapId = activeChap;
                currentArgomentiChapId = activeChap;
            }
            updateArgomentiPageDropdownOptions(activeChap);
            dropdown.style.display = 'block';
            if (activeChap) syncChapterPagesDropdown(activeChap);
        } else {
            dropdown.style.display = 'none';
        }
    }

    function selectArgomentiPageChapter(chId) {
        const dropdown = document.getElementById('page-details-chapter-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        window.currentArgomentiChapId = chId;
        currentArgomentiChapId = chId;

        const firstBox = document.querySelector(`.argomenti-page-box[data-chapter-id="${chId}"]`);
        if (firstBox) {
            const pageId = firstBox.getAttribute('data-page-id');
            openPageDetailsScreen(chId, pageId);
        } else {
            const firstOpt = document.querySelector(`.argomenti-page-dropdown-opt[data-chap-parent="${chId}"]`);
            if (firstOpt) {
                const pageId = firstOpt.getAttribute('data-page-id');
                openPageDetailsScreen(chId, pageId);
            } else if (typeof openChapterSheetsScreen === 'function') {
                openChapterSheetsScreen(chId);
            }
        }
    }

    function toggleArgomentiQuestionAnswer(qId) {
        const textEl = document.getElementById(`argomenti-ans-text-${qId}`) || document.getElementById(`page-ans-text-${qId}`);
        const iconEl = document.getElementById(`argomenti-eye-icon-${qId}`) || document.getElementById(`page-eye-icon-${qId}`);
        const btnEl = document.getElementById(`argomenti-eye-btn-${qId}`) || document.getElementById(`page-eye-btn-${qId}`);
        if (!textEl) return;

        const isHidden = (textEl.style.display === 'none' || !textEl.style.display || getComputedStyle(textEl).display === 'none');
        if (isHidden) {
            textEl.style.display = 'inline-block';
            if (iconEl) {
                iconEl.className = 'fa-regular fa-eye-slash';
                iconEl.style.color = 'var(--accent-green, #4CAF50)';
            }
            const labelEl = btnEl ? btnEl.querySelector('span') : null;
            if (labelEl) {
                labelEl.innerText = 'লুকান';
                labelEl.style.color = 'var(--accent-green, #4CAF50)';
            }
        } else {
            textEl.style.display = 'none';
            if (iconEl) {
                iconEl.className = 'fa-regular fa-eye';
                iconEl.style.color = 'var(--text-secondary, #64748b)';
            }
            const labelEl = btnEl ? btnEl.querySelector('span') : null;
            if (labelEl) {
                labelEl.innerText = 'দেখুন';
                labelEl.style.color = 'var(--text-secondary, #64748b)';
            }
        }
    }
    window.toggleArgomentiQuestionAnswer = toggleArgomentiQuestionAnswer;

    window.isArgomentiSelectionMode = window.isArgomentiSelectionMode || false;

    function handleArgomentiCardClick(card, e) {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) {
            return;
        }
        if (!window.isArgomentiSelectionMode) {
            return; // Selection mode not active: DO NOT select on card click
        }
        card.classList.toggle('selected-q-card');
        updateArgomentiSelectionPills();
    }

    function updateArgomentiSelectionPills() {
        const activeContainer = currentArgomentiPageId ? document.getElementById(`argomenti-page-container-${currentArgomentiPageId}`) : document.getElementById('page-questions-list-container');
        const cards = activeContainer ? activeContainer.querySelectorAll('.detail-q-card') : document.querySelectorAll('.detail-q-card');
        const selectedCards = activeContainer ? activeContainer.querySelectorAll('.detail-q-card.selected-q-card') : document.querySelectorAll('.detail-q-card.selected-q-card');
        const selectBtn = document.getElementById('page-details-select-toggle-btn');
        const selectAllBtn = document.getElementById('page-details-select-all-btn');
        const unselectAllBtn = document.getElementById('page-details-unselect-all-btn');

        if (selectAllBtn) selectAllBtn.classList.remove('active');
        if (unselectAllBtn) unselectAllBtn.classList.remove('active');
        if (selectBtn) selectBtn.classList.remove('active');

        if (window.isArgomentiSelectionMode) {
            if (selectBtn) selectBtn.style.display = 'none';
            if (cards.length > 0 && selectedCards.length === cards.length) {
                if (selectAllBtn) selectAllBtn.classList.add('active');
            }
        } else {
            if (selectBtn) selectBtn.style.display = 'inline-block';
            if (selectedCards.length === 0) {
                if (unselectAllBtn) unselectAllBtn.classList.add('active');
            }
        }
    }

    function toggleCurrentPageSelection() {
        window.isArgomentiSelectionMode = true;
        const activeContainer = currentArgomentiPageId ? document.getElementById(`argomenti-page-container-${currentArgomentiPageId}`) : document.getElementById('page-questions-list-container');
        const cards = activeContainer ? activeContainer.querySelectorAll('.detail-q-card') : document.querySelectorAll('.detail-q-card');
        const selectedCount = activeContainer ? activeContainer.querySelectorAll('.detail-q-card.selected-q-card').length : 0;
        if (selectedCount === 0 && cards.length > 0) {
            cards[0].classList.add('selected-q-card');
        }
        updateArgomentiSelectionPills();
        if (typeof showToast === 'function') showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
    }

    function selectAllPagesInDetails() {
        window.isArgomentiSelectionMode = true;
        const activeContainer = currentArgomentiPageId ? document.getElementById(`argomenti-page-container-${currentArgomentiPageId}`) : document.getElementById('page-questions-list-container');
        const cards = activeContainer ? activeContainer.querySelectorAll('.detail-q-card') : document.querySelectorAll('.detail-q-card');
        cards.forEach(c => c.classList.add('selected-q-card'));
        updateArgomentiSelectionPills();
        if (typeof showToast === 'function') showToast('সব প্রশ্ন সিলেক্ট করা হয়েছে');
    }

    function unselectAllPagesInDetails() {
        window.isArgomentiSelectionMode = false;
        const activeContainer = currentArgomentiPageId ? document.getElementById(`argomenti-page-container-${currentArgomentiPageId}`) : document.getElementById('page-questions-list-container');
        const cards = activeContainer ? activeContainer.querySelectorAll('.detail-q-card') : document.querySelectorAll('.detail-q-card');
        cards.forEach(c => c.classList.remove('selected-q-card'));
        updateArgomentiSelectionPills();
        if (typeof showToast === 'function') showToast('সব প্রশ্ন আনসিলেক্ট করা হয়েছে');
    }

    function openPageDetailsQuestionTranslation(qId, btnOrItText, bnText, vocab, img) {
        let itText = '';
        let targetBnText = '';
        let targetVocab = [];
        let targetImg = '';

        if (typeof btnOrItText === 'string') {
            itText = btnOrItText;
            targetBnText = bnText || '';
            targetVocab = vocab || [];
            targetImg = img || '';
        } else {
            const btn = btnOrItText;
            const card = (btn && btn.closest) ? btn.closest('.detail-q-card') : document.getElementById(`argomenti-q-card-${qId}`);
            const itEl = document.getElementById(`argomenti-q-it-${qId}`) || (card ? card.querySelector('.detail-q-text-it') : null);
            itText = itEl ? itEl.innerText.trim() : '';

            const bnEl = document.getElementById(`argomenti-q-bn-${qId}`) || (card ? card.querySelector('.detail-q-text-bn') : null);
            targetBnText = bnEl ? bnEl.innerText.trim() : '';

            const vocabScript = document.getElementById(`argomenti-vocab-${qId}`);
            if (vocabScript) {
                try { targetVocab = JSON.parse(vocabScript.textContent); } catch(e) {}
            }

            const imgEl = card ? card.querySelector('img') : null;
            targetImg = imgEl ? imgEl.src : '';
        }

        // 1. Toggle inline Bangla translation directly under the question card
        const cardBnEl = document.getElementById(`argomenti-q-bn-${qId}`) || document.getElementById(`page-bn-${qId}`);
        if (cardBnEl) {
            const isHidden = (cardBnEl.style.display === 'none' || !cardBnEl.style.display || getComputedStyle(cardBnEl).display === 'none');
            cardBnEl.style.display = isHidden ? 'block' : 'none';
        }

        // 2. Open full Translation Modal popup if available
        if (typeof openQuestionTranslationModal === 'function') {
            openQuestionTranslationModal(itText, targetBnText, targetVocab, targetImg);
        }
    }
    window.openPageDetailsQuestionTranslation = openPageDetailsQuestionTranslation;

    function toggleArgomentiTranslation(qId, btn) {
        openPageDetailsQuestionTranslation(qId, btn);
    }
    window.toggleArgomentiTranslation = toggleArgomentiTranslation;

    function speakArgomentiQuestion(qId) {
        const itEl = document.getElementById(`argomenti-q-it-${qId}`) || (document.getElementById(`argomenti-q-card-${qId}`)?.querySelector('.detail-q-text-it'));
        const text = itEl ? itEl.innerText.replace(/<[^>]*>/g, '').trim() : '';
        speakArgomentiItalian(text);
    }
    window.speakArgomentiQuestion = speakArgomentiQuestion;

    function speakArgomentiItalian(text) {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
            utterance.lang = 'it-IT';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        }
    }
    window.speakArgomentiItalian = speakArgomentiItalian;

    function syncArgomentiNoteStates() {
        const aNotes = JSON.parse(localStorage.getItem('argomenti_notes') || '{}');
        Object.keys(aNotes).forEach(qId => {
            if (aNotes[qId] && aNotes[qId].trim() !== '') {
                const card = document.getElementById(`argomenti-q-card-${qId}`);
                if (card) {
                    const icon = card.querySelector('.fa-note-sticky');
                    if (icon) {
                        icon.className = 'fa-solid fa-note-sticky';
                        icon.style.color = '#10B981';
                        const span = icon.closest('button')?.querySelector('span');
                        if (span) span.style.color = '#10B981';
                    }
                }
            }
        });
    }

    function closePageDetailsScreen() {
        const d1 = document.getElementById('page-details-chapter-dropdown');
        const d2 = document.getElementById('page-details-page-dropdown');
        if (d1) d1.style.display = 'none';
        if (d2) d2.style.display = 'none';
        if (typeof navigateBack === 'function') {
            navigateBack();
        } else if (typeof openScreen === 'function') {
            openScreen('argomenti', 'Argomenti');
        }
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chapter-selector-trigger')) {
            const d1 = document.getElementById('page-details-chapter-dropdown');
            if (d1) d1.style.display = 'none';
            const d2 = document.getElementById('page-details-page-dropdown');
            if (d2) d2.style.display = 'none';
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof syncArgomentiBookmarkStates === 'function') syncArgomentiBookmarkStates();
        syncArgomentiNoteStates();

        const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (path === 'page-details' || window.location.hash.includes('page-details')) {
            const savedPageId = sessionStorage.getItem('activePageDetailsId');
            if (savedPageId) {
                openPageDetailsScreen(parseInt(savedPageId));
            } else {
                const firstBox = document.querySelector('.argomenti-page-box');
                if (firstBox) {
                    openPageDetailsScreen(firstBox.getAttribute('data-chapter-id'), firstBox.getAttribute('data-page-id'));
                }
            }
        }
    });
</script>
