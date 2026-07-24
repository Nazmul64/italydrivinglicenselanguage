// ==========================================
// Cartelli (Road Signs) Module Logic
// ==========================================

let cartelliAllChapters = [];
let selectedCartelliChapters = [];
let cartelliActiveChapterId = null;
let cartelliActivePageId = null;
let cartelliPagesList = [];
let selectedCartelliSchede = [];

let cartelliNativeAudio = null;
let playingCartelliAudioIndex = null;
let cartelliAudioProgressInterval = null;
let isCartelliPlayAllActive = false;

function renderCartelliChaptersGrid() {
    const container = document.getElementById('cartelli-chapters-grid');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento capitoli...</div>`;

    fetch('/api/cartelli/chapters')
        .then(res => res.json())
        .then(chapters => {
            cartelliAllChapters = chapters;
            container.innerHTML = '';

            const badge = document.getElementById('cartelli-chapters-count-badge');
            if (badge) badge.innerText = `${chapters.length} Capitoli`;

            chapters.forEach(ch => {
                const isSelected = selectedCartelliChapters.includes(ch.id);
                const card = document.createElement('div');
                card.className = `chapter-image-card ${isSelected ? 'selected-chapter-card' : ''}`;
                card.onclick = () => openCartelliSchedeScreen(ch.id);

                const checkboxIcon = isSelected
                    ? `<i class="fa-solid fa-circle-check" style="font-size: 22px; color: var(--accent-green); position: absolute; top: 12px; right: 12px; z-index: 5;" onclick="event.stopPropagation(); toggleCartelliChapterSelection(${ch.id})"></i>`
                    : `<i class="fa-regular fa-circle" style="font-size: 22px; color: rgba(255,255,255,0.8); position: absolute; top: 12px; right: 12px; z-index: 5; text-shadow: 0 1px 4px rgba(0,0,0,0.4);" onclick="event.stopPropagation(); toggleCartelliChapterSelection(${ch.id})"></i>`;

                const coverImage = ch.image || `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60`;

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        ${checkboxIcon}
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px; padding-right: 24px;">
                            ${ch.chapter_number || ch.id}) ${ch.name}
                        </div>
                        <div class="chapter-card-img-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                            <img src="${coverImage}" class="chapter-card-img" alt="${ch.name}" style="object-fit: contain; border-radius: 8px;">
                        </div>
                        <div style="text-align: center; font-size: 16px; font-weight: 800; color: var(--text-secondary); margin-top: auto; padding-top: 10px;">
                            Progresso
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            updateCartelliCategoryQuizButtonVisibility();
        })
        .catch(err => {
            console.error("Error fetching cartelli chapters: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; grid-column: 1 / -1;">Si è verificato un errore nel caricamento.</div>`;
        });
}

function toggleCartelliChapterSelection(id) {
    const idx = selectedCartelliChapters.indexOf(id);
    if (idx > -1) {
        selectedCartelliChapters.splice(idx, 1);
    } else {
        selectedCartelliChapters.push(id);
    }
    renderCartelliChaptersGrid();
}

function unselectAllCartelliChapters() {
    selectedCartelliChapters = [];
    renderCartelliChaptersGrid();
}

function selectAllCartelliChapters() {
    selectedCartelliChapters = cartelliAllChapters.map(c => c.id);
    renderCartelliChaptersGrid();
}

function toggleSelectCartelliChapters() {
    if (selectedCartelliChapters.length === cartelliAllChapters.length) {
        selectedCartelliChapters = [];
    } else {
        selectedCartelliChapters = cartelliAllChapters.map(c => c.id);
    }
    renderCartelliChaptersGrid();
}

function updateCartelliCategoryQuizButtonVisibility() {
    const btn = document.getElementById('cartelli-category-quiz-btn');
    if (!btn) return;
    btn.style.display = selectedCartelliChapters.length > 0 ? 'block' : 'none';
}

function startCartelliCategoryQuiz() {
    if (selectedCartelliChapters.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি অধ্যায় সিলেক্ট করুন');
        return;
    }
    showToast('কুইজ প্রশ্ন তৈরি হচ্ছে...');

    Promise.all(selectedCartelliChapters.map(chapId =>
        fetch(`/api/cartelli/pages/${chapId}`).then(res => res.json())
    ))
        .then(results => {
            let allMcqs = [];
            results.forEach(pagesList => {
                pagesList.forEach(p => {
                    if (p.mcqs && Array.isArray(p.mcqs)) {
                        p.mcqs.forEach(q => {
                            allMcqs.push({
                                id: q.id,
                                italian: q.question,
                                bangla: q.bn_question,
                                is_vero: q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                                image: q.image,
                                audio: q.voice,
                                video: q.video,
                                vocabulary: q.vocabulary || []
                            });
                        });
                    }
                });
            });

            if (allMcqs.length === 0) {
                showToast('কোনো প্রশ্ন পাওয়া যায়নি');
                return;
            }

            allMcqs.sort(() => 0.5 - Math.random());
            const quizMcqs = allMcqs.slice(0, 30);

            showTestOptionsDialog(() => {
                practiceMode = 'exam';
                testQuestions = quizMcqs;
                currentTestIndex = 0;
                testAnswers = Array(testQuestions.length).fill(null);

                const timerPill = document.getElementById('test-timer');
                if (timerPill) {
                    timerPill.innerText = `CARTELLI QUIZ`;
                    timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
                    timerPill.style.borderColor = 'var(--accent-green)';
                    timerPill.style.color = 'var(--accent-green)';
                }
                const timerLabel = document.querySelector('.test-timer-label');
                if (timerLabel) {
                    timerLabel.innerText = `${selectedCartelliChapters.length} Chapters`;
                }

                openScreen('test', 'Cartelli Quiz');
                switchTestQuestionTab(1);
                showTestQuestion();
                startTestTimer();
            });
        })
        .catch(err => {
            console.error("Error generating cartelli quiz: ", err);
            showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
        });
}

function openCartelliSchedeScreen(chapterId, preserveSelection = false) {
    if (cartelliActiveChapterId !== chapterId || !preserveSelection) {
        selectedCartelliSchede = [];
    }
    cartelliActiveChapterId = chapterId;

    const labelEl = document.getElementById('cartelli-schede-chapter-label');
    if (labelEl) labelEl.innerText = `Caricamento...`;

    populateCartelliSchedeChapterDropdown();

    const container = document.getElementById('cartelli-schede-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede...</div>`;
    }

    openScreen('cartelli-schede', 'Scegli Scheda');

    fetch(`/api/cartelli/pages/${chapterId}`)
        .then(res => res.json())
        .then(pages => {
            cartelliPagesList = pages;
            if (!preserveSelection) {
                selectedCartelliSchede = [];
            }
            updateCartelliSchedeQuizButtonVisibility();
            updateCartelliSchedePillStates();

            const ch = cartelliAllChapters.find(c => c.id === chapterId);
            if (ch && labelEl) {
                labelEl.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
            }

            if (pages.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Nessuna scheda trovata per questo capitolo.</div>`;
                return;
            }

            const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');
            container.innerHTML = '';
            pages.forEach((page, index) => {
                let correct = 0;
                let wrong = 0;
                const total = page.mcqs ? page.mcqs.length : 0;

                if (page.mcqs && Array.isArray(page.mcqs)) {
                    page.mcqs.forEach(q => {
                        let record = userStats[q.id];
                        let stState = (typeof record === 'object') ? record.state : record;
                        if (stState === 'correct') correct++;
                        else if (stState === 'wrong') wrong++;
                    });
                }

                const unanswered = Math.max(0, total - correct - wrong);
                const isSelected = selectedCartelliSchede.includes(index);

                const card = document.createElement('div');
                card.className = `content-card ${isSelected ? 'selected-sheet-card' : ''}`;
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                card.style.padding = '16px';
                card.style.position = 'relative';
                card.style.height = '100%';
                card.onclick = () => openCartelliPageScreen(page.id);

                const checkboxIcon = isSelected
                    ? `<i class="fa-solid fa-circle-check" style="font-size: 18px; color: var(--accent-green); position: absolute; top: 14px; right: 14px; z-index: 5;" onclick="event.stopPropagation(); toggleCartelliSchedeSelection(${index})"></i>`
                    : `<i class="fa-regular fa-circle" style="font-size: 18px; color: var(--text-secondary); position: absolute; top: 14px; right: 14px; z-index: 5;" onclick="event.stopPropagation(); toggleCartelliSchedeSelection(${index})"></i>`;

                const totalPercent = total || 1;

                const pageNum = page.page_number || (index + 1);
                let rawTitle = page.title || page.bn_title || page.name || '';
                rawTitle = rawTitle.replace(/^\d+[\s\.\)\-]+/, '').trim();
                const displaySheetTitle = `Pagina ${pageNum}) ${rawTitle}`;

                let pageImgHTML = '';
                if (page.image) {
                    const imgSrc = (page.image.startsWith('http') || page.image.startsWith('/')) ? page.image : `/storage/${page.image}`;
                    pageImgHTML = `
                        <div class="page-image-frame" style="width: 100%; display: flex; justify-content: center; align-items: center; margin: 8px 0; background: #eef2f7; border-radius: 14px; padding: 12px; box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;">
                            <img src="${imgSrc}" class="schede-page-img" alt="${rawTitle}" style="object-fit: contain; border-radius: 8px;">
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${checkboxIcon}
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; padding-right: 28px;">
                            <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                            ${displaySheetTitle}
                        </span>
                        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary); padding-right: 20px;"></i>
                    </div>

                    ${pageImgHTML}

                    <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: var(--text-secondary);">
                        <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                        <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                        <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                        <span>Totale: <strong>${total}</strong></span>
                    </div>

                    <div style="height: 8px; background-color: var(--border-card); border-radius: 4px; display: flex; overflow: hidden;">
                        <div style="background-color: #4CAF50; width: ${(correct / totalPercent) * 100}%;"></div>
                        <div style="background-color: #ef4444; width: ${(wrong / totalPercent) * 100}%;"></div>
                        <div style="background-color: #f59e0b; width: ${(unanswered / totalPercent) * 100}%;"></div>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error loading cartelli sheets: ", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento.</div>`;
            }
        });
}

function populateCartelliSchedeChapterDropdown() {
    const panel = document.getElementById('cartelli-schede-chapter-dropdown');
    if (!panel) return;
    panel.innerHTML = '';

    cartelliAllChapters.forEach(ch => {
        const item = document.createElement('div');
        item.className = `chapter-dropdown-item ${ch.id === cartelliActiveChapterId ? 'active' : ''}`;
        item.onclick = (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
            openCartelliSchedeScreen(ch.id);
        };
        item.innerText = `Cartello ${ch.chapter_number || ch.id}) ${ch.name}`;
        panel.appendChild(item);
    });
}

function toggleCartelliSchedeChapterDropdown() {
    const panel = document.getElementById('cartelli-schede-chapter-dropdown');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleCartelliSchedeSelection(index) {
    const idx = selectedCartelliSchede.indexOf(index);
    if (idx > -1) {
        selectedCartelliSchede.splice(idx, 1);
    } else {
        selectedCartelliSchede.push(index);
    }
    openCartelliSchedeScreen(cartelliActiveChapterId, true);
}

function unselectAllCartelliSchede() {
    selectedCartelliSchede = [];
    openCartelliSchedeScreen(cartelliActiveChapterId, true);
}

function selectAllCartelliSchede() {
    selectedCartelliSchede = Array.from({ length: cartelliPagesList.length }, (_, idx) => idx);
    openCartelliSchedeScreen(cartelliActiveChapterId, true);
}

function toggleSelectCartelliSchede() {
    if (selectedCartelliSchede.length === cartelliPagesList.length) {
        selectedCartelliSchede = [];
    } else {
        selectedCartelliSchede = Array.from({ length: cartelliPagesList.length }, (_, idx) => idx);
    }
    openCartelliSchedeScreen(cartelliActiveChapterId, true);
}

function updateCartelliSchedePillStates() {
    const btnUnselect = document.getElementById('cartelli-schede-btn-unselect');
    const btnSelect = document.getElementById('cartelli-schede-btn-select');
    const btnSelectAll = document.getElementById('cartelli-schede-btn-select-all');

    if (btnUnselect) btnUnselect.classList.remove('active');
    if (btnSelect) btnSelect.classList.remove('active');
    if (btnSelectAll) btnSelectAll.classList.remove('active');

    if (selectedCartelliSchede.length === 0) {
        if (btnUnselect) btnUnselect.classList.add('active');
    } else if (cartelliPagesList.length > 0 && selectedCartelliSchede.length === cartelliPagesList.length) {
        if (btnSelectAll) btnSelectAll.classList.add('active');
    } else {
        if (btnSelect) btnSelect.classList.add('active');
    }
}

function updateCartelliSchedeQuizButtonVisibility() {
    const btn = document.getElementById('cartelli-schede-quiz-btn');
    if (btn) btn.style.display = selectedCartelliSchede.length > 0 ? 'block' : 'none';
}

function startCartelliSchedeQuiz() {
    if (selectedCartelliSchede.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি পেজ সিলেক্ট করুন');
        return;
    }
    showToast('কুইজ প্রশ্ন তৈরি হচ্ছে...');

    let allMcqs = [];
    selectedCartelliSchede.forEach(idx => {
        const p = cartelliPagesList[idx];
        if (p && p.mcqs && Array.isArray(p.mcqs)) {
            p.mcqs.forEach(q => {
                allMcqs.push({
                    id: q.id,
                    italian: q.question,
                    bangla: q.bn_question,
                    is_vero: q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                    image: q.image,
                    audio: q.voice,
                    video: q.video,
                    vocabulary: q.vocabulary || []
                });
            });
        }
    });

    if (allMcqs.length === 0) {
        showToast('কোনো প্রশ্ন পাওয়া যায়নি');
        return;
    }

    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        testQuestions = allMcqs;
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `SCHEDE QUIZ`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = `${selectedCartelliSchede.length} Selected Sheets`;
        }

        openScreen('test', 'Sheets Quiz');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}

function openCartelliPageScreen(pageId) {
    cartelliActivePageId = pageId;

    const playBtn = document.getElementById('cartelli-play-all-btn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
        playBtn.style.backgroundColor = 'var(--accent-green)';
    }

    const container = document.getElementById('cartelli-page-mcq-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande...</div>`;
    }

    openScreen('cartelli-page', 'Vere e False');

    const page = cartelliPagesList.find(p => p.id === pageId);
    if (!page) {
        console.error("Page details not found in cache");
        return;
    }

    const ch = cartelliAllChapters.find(c => c.id === page.chapter_id);
    const chapterName = ch ? ch.name : '';
    const chapterNum = ch ? (ch.chapter_number || ch.id) : '';
    document.getElementById('cartelli-page-chapter-label').innerText = `Cartello ${chapterNum}) ${chapterName}`;
    const cartelliPageNum = page.sort_order || page.page_number || page.id;
    document.getElementById('cartelli-page-label').innerText = `Pagina ${cartelliPageNum}) ${page.title}`;

    populateCartelliPageChapterDropdown();
    populateCartelliPageDropdown(page.chapter_id);

    renderCartelliPageMcqs(page.mcqs || []);
}

function renderCartelliPageMcqs(mcqs) {
    const container = document.getElementById('cartelli-page-mcq-list');
    if (!container) return;
    container.innerHTML = '';

    if (mcqs.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি।</div>`;
        return;
    }

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

    mcqs.forEach((q, index) => {
        const databaseIsVero = q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;

        const cartelliBookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
        const cartelliIsBookmarked = cartelliBookmarks.includes(q.id);

        const cartelliNotes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
        const cartelliHasNote = cartelliNotes[q.id] !== undefined && cartelliNotes[q.id].trim() !== '';

        const bookmarkIconClass = cartelliIsBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const bookmarkIconColor = cartelliIsBookmarked ? 'color: var(--accent-green);' : '';

        const record = userStats[q.id];
        let correctCount = 0;
        let wrongCount = 0;
        let isAnswered = false;

        if (record && typeof record === 'object') {
            correctCount = typeof record.correct === 'number' ? record.correct : 0;
            wrongCount = typeof record.wrong === 'number' ? record.wrong : 0;
            if (correctCount > 0 || wrongCount > 0) {
                isAnswered = true;
            }
        }

        const statsHtml = isAnswered ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); font-size: 13px; text-align: center;">
                <div style="color: var(--text-primary); font-weight: 800; margin-bottom: 4px; text-align: center;">(TU) Hai risposto:</div>
                <div style="display: flex; justify-content: center; gap: 24px; font-size: 13px; font-weight: 700;">
                    <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
                    <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                </div>
            </div>
        ` : '';

        const card = document.createElement('div');
        card.className = `detail-q-card ${!isAnswered ? 'unanswered' : (record && record.state === 'correct' ? 'correct' : 'incorrect')}`;
        card.style.position = 'relative';

        let mediaHtml = '';
        if (q.image) {
            mediaHtml += `
                <div style="margin-top: 12px; text-align: center;">
                    <img src="${q.image}" style="max-width: 100%; max-height: 220px; border-radius: 8px; border: 1px solid var(--border-card); object-fit: contain;">
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
                <div class="detail-q-num" style="margin-bottom: 0; flex-shrink: 0;">Domanda #${index + 1}</div>
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <button class="test-ctrl-btn" onclick="showQuestionSpeedPopover(this, true)" style="width: 30px; height: 30px; min-width:30px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Speech Speed">
                        <i class="fa-solid fa-gauge-high" style="color: var(--accent-green);"></i>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleCartelliPageTranslation(${q.id})" style="width: 30px; height: 30px; min-width:30px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Translate">
                        <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 2px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleCartelliBookmark(${q.id}, this)" style="width: 30px; height: 30px; min-width:30px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Bookmark">
                        <i class="${bookmarkIconClass}" style="${bookmarkIconColor}"></i>
                    </button>
                    <button class="test-ctrl-btn" id="cartelli-note-btn-${q.id}" onclick="openCartelliNotesModal(${q.id})" style="width: 30px; height: 30px; min-width:30px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Add Note">
                        <i class="fa-regular fa-note-sticky" style="${cartelliHasNote ? 'color: var(--accent-green);' : ''}"></i>
                    </button>
                    <i class="fa-regular fa-eye" id="cartelli-eye-icon-${q.id}" onclick="toggleCartelliQuestionAnswer(${q.id})" style="cursor: pointer; font-size: 15px; color: var(--text-secondary); margin-left: 2px;" title="Show Answer"></i>
                    <span id="cartelli-ans-text-${q.id}" style="display: none; font-size: 13px; font-weight: 900; color: ${databaseIsVero ? '#4CAF50' : '#ef4444'};">${databaseIsVero ? 'VERO' : 'FALSO'}</span>
                </div>
            </div>
            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.question || '', q.vocabulary || []) : (q.question || '')}</div>
            <div class="detail-q-text-bn" id="cartelli-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bn_question || ''}</div>
            ${mediaHtml}

            <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center;">
                <button class="test-speaker-btn" onclick="readCartelliQuestionSpeech(${index})" style="width: 36px; height: 36px; min-width:36px; flex-shrink: 0;">
                    <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                </button>
                <button class="test-ctrl-btn" id="cartelli-play-btn-${index}" onclick="playCartelliMcqAudioOrSpeech(${index})" style="width: 32px; height: 32px; min-width:32px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer; flex-shrink: 0;">
                    <i class="fa-solid fa-play"></i>
                </button>
                <input type="range" class="test-slider" id="cartelli-audio-slider-${index}" min="0" max="100" value="0" style="flex: 1;" readonly>
            </div>
            ${statsHtml}
        `;
        container.appendChild(card);
    });
}

function toggleCartelliQuestionAnswer(qId) {
    const textEl = document.getElementById(`cartelli-ans-text-${qId}`);
    const iconEl = document.getElementById(`cartelli-eye-icon-${qId}`);
    if (!textEl || !iconEl) return;

    if (textEl.style.display === 'none') {
        textEl.style.display = 'inline';
        iconEl.className = 'fa-regular fa-eye-slash';
        iconEl.style.color = 'var(--accent-green)';
    } else {
        textEl.style.display = 'none';
        iconEl.className = 'fa-regular fa-eye';
        iconEl.style.color = 'var(--text-secondary)';
    }
}

function startCartelliPageQuiz() {
    let currentMcqs = [];
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);

    if (page && page.mcqs && page.mcqs.length > 0) {
        currentMcqs = page.mcqs;
    } else if (cartelliPagesList && cartelliPagesList.length > 0) {
        cartelliPagesList.forEach(p => {
            if (p.mcqs && Array.isArray(p.mcqs)) {
                currentMcqs = currentMcqs.concat(p.mcqs);
            }
        });
    }

    if (currentMcqs.length === 0) {
        showToast('এই পৃষ্ঠায় কোনো প্রশ্ন নেই');
        return;
    }

    const mappedMcqs = currentMcqs.map(q => ({
        id: q.id,
        italian: q.question || q.italian || '',
        bangla: q.bn_question || q.bangla || '',
        is_vero: q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1 || q.is_vero === 1 || q.is_vero === true || q.is_vero === '1',
        image: q.image,
        audio: q.voice || q.audio,
        video: q.video,
        vocabulary: q.vocabulary || []
    }));

    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        testQuestions = mappedMcqs;
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `CARTELLI QUIZ`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'Modalità Esercitazione';
        }

        openScreen('test', 'Practice Quiz');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}

function readCartelliQuestionSpeech(index) {
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    if (!page || !page.mcqs || !page.mcqs[index]) return;
    const q = page.mcqs[index];
    const textToRead = (q.question || '').replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'it-IT';
        utterance.rate = typeof testAudioSpeed !== 'undefined' ? testAudioSpeed : 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

function toggleCartelliPageTranslation(qId) {
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    if (!page || !page.mcqs) return;
    const q = page.mcqs.find(item => item.id === qId);
    if (!q) return;
    if (typeof openQuestionTranslationModal === 'function') {
        openQuestionTranslationModal(q.question || q.italian || '', q.bn_question || q.bangla || '');
    }
}

function playCartelliMcqAudioOrSpeech(index) {
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    if (!page || !page.mcqs || !page.mcqs[index]) return;
    const q = page.mcqs[index];

    if (playingCartelliAudioIndex === index) {
        stopAllCartelliAudio();
        return;
    }

    stopAllCartelliAudio();
    playingCartelliAudioIndex = index;

    if (q.voice) {
        if (!cartelliNativeAudio) {
            cartelliNativeAudio = new Audio();
        }
        cartelliNativeAudio.src = q.voice;

        const pBtn = document.getElementById(`cartelli-play-btn-${index}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        cartelliNativeAudio.play().then(() => {
            const slider = document.getElementById(`cartelli-audio-slider-${index}`);
            cartelliAudioProgressInterval = setInterval(() => {
                if (cartelliNativeAudio.paused || cartelliNativeAudio.ended) {
                    clearInterval(cartelliAudioProgressInterval);
                    return;
                }
                if (slider && cartelliNativeAudio.duration) {
                    slider.value = (cartelliNativeAudio.currentTime / cartelliNativeAudio.duration) * 100;
                }
            }, 100);
        }).catch(err => {
            console.error("Error playing Cartelli MCQ audio file: ", err);
            playingCartelliAudioIndex = null;
            playCartelliMcqAudioOrSpeech(index);
        });

        cartelliNativeAudio.onended = () => {
            stopAllCartelliAudio();
            if (isCartelliPlayAllActive) {
                setTimeout(() => {
                    playCartelliSpeechSequentially(index + 1);
                }, 600);
            }
        };
    } else {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(q.question);
            utterance.lang = 'it-IT';
            utterance.rate = testAudioSpeed;

            const pBtn = document.getElementById(`cartelli-play-btn-${index}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

            const slider = document.getElementById(`cartelli-audio-slider-${index}`);
            if (slider) slider.value = 0;
            let stepCount = 0;
            let durationSteps = Math.max(15, Math.floor((q.question.length / 3) / testAudioSpeed));

            cartelliAudioProgressInterval = setInterval(() => {
                stepCount++;
                let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
                if (slider) slider.value = prg;
                if (prg >= 100) {
                    clearInterval(cartelliAudioProgressInterval);
                }
            }, 200);

            utterance.onend = () => {
                stopAllCartelliAudio();
                if (isCartelliPlayAllActive) {
                    setTimeout(() => {
                        playCartelliSpeechSequentially(index + 1);
                    }, 600);
                }
            };

            utterance.onerror = () => {
                stopAllCartelliAudio();
            };

            window.speechSynthesis.speak(utterance);
        }
    }
}

function stopAllCartelliAudio() {
    if (cartelliNativeAudio) {
        cartelliNativeAudio.pause();
        cartelliNativeAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (cartelliAudioProgressInterval) {
        clearInterval(cartelliAudioProgressInterval);
    }
    if (playingCartelliAudioIndex !== null) {
        const btn = document.getElementById(`cartelli-play-btn-${playingCartelliAudioIndex}`);
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        const slider = document.getElementById(`cartelli-audio-slider-${playingCartelliAudioIndex}`);
        if (slider) slider.value = 0;
    }
    playingCartelliAudioIndex = null;
}

function populateCartelliPageChapterDropdown() {
    const panel = document.getElementById('cartelli-page-chapter-dropdown');
    if (!panel) return;
    panel.innerHTML = '';

    cartelliAllChapters.forEach(ch => {
        const item = document.createElement('div');
        item.className = `chapter-dropdown-item ${ch.id === cartelliActiveChapterId ? 'active' : ''}`;
        item.onclick = (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
            fetch(`/api/cartelli/pages/${ch.id}`)
                .then(r => r.json())
                .then(pages => {
                    cartelliPagesList = pages;
                    if (pages.length > 0) {
                        openCartelliPageScreen(pages[0].id);
                    } else {
                        showToast('এই অধ্যায়ে কোনো পেজ পাওয়া যায়নি');
                    }
                });
        };
        item.innerText = `Cartello ${ch.chapter_number || ch.id}) ${ch.name}`;
        panel.appendChild(item);
    });
}

function toggleCartelliPageChapterDropdown() {
    const panel = document.getElementById('cartelli-page-chapter-dropdown');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function populateCartelliPageDropdown(chapterId) {
    const panel = document.getElementById('cartelli-page-dropdown');
    if (!panel) return;
    panel.innerHTML = '';

    cartelliPagesList.forEach(p => {
        const item = document.createElement('div');
        item.className = `chapter-dropdown-item ${p.id === cartelliActivePageId ? 'active' : ''}`;
        item.onclick = (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
            openCartelliPageScreen(p.id);
        };
        const pNum = p.sort_order || p.page_number || p.id;
        item.innerText = `Pagina ${pNum}) ${p.title}`;
        panel.appendChild(item);
    });
}

function toggleCartelliPageDropdown() {
    const panel = document.getElementById('cartelli-page-dropdown');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleCartelliPageSelection() {
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    cards.forEach(c => c.classList.toggle('selected-q-card'));
    showToast('পৃষ্ঠা সিলেকশন সম্পূর্ণ');
}

function selectAllCartelliPages() {
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('সব পৃষ্ঠা সিলেক্ট করা হয়েছে');
}

function unselectAllCartelliPages() {
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('সব পৃষ্ঠা সিলেকশন বাতিল');
}

function togglePlayAllCartelliMcqs() {
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    if (!page || !page.mcqs || page.mcqs.length === 0) return;

    const playAllBtn = document.getElementById('cartelli-play-all-btn');
    if (isCartelliPlayAllActive) {
        isCartelliPlayAllActive = false;
        stopAllCartelliAudio();
        if (playAllBtn) {
            playAllBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
            playAllBtn.style.backgroundColor = 'var(--accent-green)';
        }
    } else {
        isCartelliPlayAllActive = true;
        if (playAllBtn) {
            playAllBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> <span>Stop</span>';
            playAllBtn.style.backgroundColor = 'var(--accent-red)';
        }
        playCartelliSpeechSequentially(0);
    }
}

function playCartelliSpeechSequentially(index) {
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    if (!page || !isCartelliPlayAllActive || index >= page.mcqs.length) {
        isCartelliPlayAllActive = false;
        const playAllBtn = document.getElementById('cartelli-play-all-btn');
        if (playAllBtn) {
            playAllBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
            playAllBtn.style.backgroundColor = 'var(--accent-green)';
        }
        return;
    }
    playCartelliMcqAudioOrSpeech(index);
}



function toggleCartelliBookmark(qId, btn) {
    let bookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
    const idx = bookmarks.indexOf(qId);
    if (idx > -1) {
        bookmarks.splice(idx, 1);
        localStorage.setItem('cartelli_bookmarks', JSON.stringify(bookmarks));
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fa-regular fa-bookmark';
                icon.style.color = '';
            }
        }
        showToast('বুকমার্ক মুছে ফেলা হয়েছে');
    } else {
        bookmarks.push(qId);
        localStorage.setItem('cartelli_bookmarks', JSON.stringify(bookmarks));
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fa-solid fa-bookmark';
                icon.style.color = 'var(--accent-green)';
            }
        }
        showToast('বুকমার্ক করা হয়েছে');
    }
}

function openCartelliNotesModal(qId) {
    let notes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
    const existingNote = notes[qId] || '';
    const newNote = prompt("এখানে আপনার নোট লিখুন:", existingNote);
    if (newNote !== null) {
        if (newNote.trim() === '') {
            delete notes[qId];
        } else {
            notes[qId] = newNote;
        }
        localStorage.setItem('cartelli_notes', JSON.stringify(notes));
        showToast('নোট আপডেট করা হয়েছে');

        const noteBtn = document.getElementById(`cartelli-note-btn-${qId}`);
        if (noteBtn) {
            const icon = noteBtn.querySelector('i');
            if (icon) {
                if (newNote.trim() !== '') {
                    icon.style.color = 'var(--accent-green)';
                } else {
                    icon.style.color = '';
                }
            }
        }
    }
}
