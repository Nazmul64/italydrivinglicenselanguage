// ==========================================
// Cartelli (Road Signs) Module Logic
// ==========================================

let cartelliAllChapters = [];
let selectedCartelliChapters = [];
let selectedCartelliSchede = [];
let isCartelliChapterSelectMode = false;
let isCartelliSchedeSelectMode = false;
let cartelliActiveChapterId = null;
let cartelliActivePageId = null;
let cartelliPagesList = [];

let cartelliNativeAudio = null;
let playingCartelliAudioIndex = null;
let cartelliAudioProgressInterval = null;
let isCartelliPlayAllActive = false;

function renderCartelliChaptersGrid() {
    const container = document.getElementById('cartelli-chapters-grid');
    if (!container) return;

    // If server rendered cards exist, update selection state without wiping HTML
    const cards = container.querySelectorAll('.chapter-image-card');
    if (cards.length > 0) {
        cards.forEach(card => {
            const id = parseInt(card.getAttribute('data-cartelli-chapter-id'));
            if (selectedCartelliChapters.includes(id)) {
                card.classList.add('selected-chapter-card');
            } else {
                card.classList.remove('selected-chapter-card');
            }
        });
        updateCartelliCategoryQuizButtonVisibility();
        updateCartelliChapterPillStates();
        return;
    }

    // Dynamic fetch fallback if container has no cards
    fetch('/api/cartelli/chapters')
        .then(res => res.json())
        .then(data => {
            const chapters = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            cartelliAllChapters = chapters;
            const countBadge = document.getElementById('cartelli-chapters-count-badge');
            if (countBadge) countBadge.innerText = `${chapters.length} Capitoli`;

            if (chapters.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;">Nessun capitolo trovato.</div>';
                return;
            }

            container.innerHTML = chapters.map(ch => {
                const chapNum = ch.chapter_number || ch.sort_order || ch.id;
                const isSelected = selectedCartelliChapters.includes(ch.id);
                const imgSrc = ch.image ? ((ch.image.startsWith('http') || ch.image.startsWith('/')) ? ch.image : `/storage/${ch.image}`) : '';
                const imgHtml = imgSrc ? `
                    <div class="chapter-card-img-wrapper" style="width: 100%; height: 250px; min-height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                        <img src="${imgSrc}" class="chapter-card-img" alt="${ch.name}" style="height: 100%; width: 100%; max-height: 250px; max-width: 92%; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
                    </div>
                ` : '';

                return `
                    <div class="chapter-image-card ${isSelected ? 'selected-chapter-card' : ''}" data-cartelli-chapter-id="${ch.id}" onclick="handleCartelliChapterCardClick(${ch.id})">
                        <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                            <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                                ${chapNum}) ${ch.name}
                            </div>
                            ${imgHtml}
                        </div>
                    </div>
                `;
            }).join('');

            updateCartelliCategoryQuizButtonVisibility();
            updateCartelliChapterPillStates();
        })
        .catch(err => {
            console.error('Error fetching cartelli chapters:', err);
        });
}

function toggleCartelliChapterSelection(chId) {
    chId = parseInt(chId);
    const idx = selectedCartelliChapters.indexOf(chId);
    if (idx > -1) {
        selectedCartelliChapters.splice(idx, 1);
    } else {
        selectedCartelliChapters.push(chId);
    }
    isCartelliChapterSelectMode = selectedCartelliChapters.length > 0;

    const card = document.querySelector(`.chapter-image-card[data-cartelli-chapter-id="${chId}"]`);
    if (card) {
        if (selectedCartelliChapters.includes(chId)) {
            card.classList.add('selected-chapter-card');
        } else {
            card.classList.remove('selected-chapter-card');
        }
    }

    updateCartelliCategoryQuizButtonVisibility();
    updateCartelliChapterPillStates();
}

function unselectAllCartelliChapters() {
    selectedCartelliChapters = [];
    isCartelliChapterSelectMode = false;
    document.querySelectorAll('.chapter-image-card[data-cartelli-chapter-id]').forEach(card => {
        card.classList.remove('selected-chapter-card');
    });
    updateCartelliCategoryQuizButtonVisibility();
    updateCartelliChapterPillStates();
    showToast('সব অধ্যায় আন-সিলেক্ট করা হয়েছে');
}

function selectAllCartelliChapters() {
    const cards = document.querySelectorAll('.chapter-image-card[data-cartelli-chapter-id]');
    selectedCartelliChapters = [];
    cards.forEach(card => {
        const id = parseInt(card.getAttribute('data-cartelli-chapter-id'));
        if (!isNaN(id)) {
            selectedCartelliChapters.push(id);
            card.classList.add('selected-chapter-card');
        }
    });

    if (selectedCartelliChapters.length === 0 && cartelliAllChapters.length > 0) {
        selectedCartelliChapters = cartelliAllChapters.map(c => c.id);
    }

    isCartelliChapterSelectMode = true;
    updateCartelliCategoryQuizButtonVisibility();
    updateCartelliChapterPillStates();
    showToast('সব অধ্যায় সিলেক্ট করা হয়েছে');
}

function toggleSelectCartelliChapters() {
    isCartelliChapterSelectMode = true;
    const cards = document.querySelectorAll('.chapter-image-card[data-cartelli-chapter-id]');
    if (selectedCartelliChapters.length === 0 && cards.length > 0) {
        const firstId = parseInt(cards[0].getAttribute('data-cartelli-chapter-id'));
        if (!isNaN(firstId)) {
            selectedCartelliChapters = [firstId];
            cards[0].classList.add('selected-chapter-card');
        }
    }
    updateCartelliCategoryQuizButtonVisibility();
    updateCartelliChapterPillStates();
}

function updateCartelliChapterPillStates() {
    const unselectPill = document.getElementById('cartelli-chap-btn-unselect');
    const selectPill = document.getElementById('cartelli-chap-btn-select');
    const selectAllPill = document.getElementById('cartelli-chap-btn-select-all');

    if (unselectPill) unselectPill.classList.remove('active');
    if (selectPill) selectPill.classList.remove('active');
    if (selectAllPill) selectAllPill.classList.remove('active');

    if (selectPill) {
        selectPill.style.display = isCartelliChapterSelectMode ? 'none' : 'inline-block';
    }

    const cards = document.querySelectorAll('.chapter-image-card[data-cartelli-chapter-id]');
    const totalCount = cards.length;

    if (!isCartelliChapterSelectMode && selectedCartelliChapters.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
    } else if (totalCount > 0 && selectedCartelliChapters.length >= totalCount) {
        if (selectAllPill) selectAllPill.classList.add('active');
    } else if (isCartelliChapterSelectMode) {
        if (selectPill) selectPill.classList.add('active');
    }
}

function updateCartelliCategoryQuizButtonVisibility() {
    const btn = document.getElementById('cartelli-category-quiz-btn');
    if (btn) btn.style.display = 'flex';
}

function startCartelliCategoryQuiz() {
    let targetChapters = [...selectedCartelliChapters];
    if (targetChapters.length === 0) {
        if ((!cartelliAllChapters || cartelliAllChapters.length === 0) && window.cartelliAllChapters) {
            cartelliAllChapters = window.cartelliAllChapters;
        }
        if (cartelliAllChapters && cartelliAllChapters.length > 0) {
            targetChapters = cartelliAllChapters.map(c => c.id);
        } else {
            const cards = document.querySelectorAll('.chapter-image-card[data-cartelli-chapter-id]');
            cards.forEach(card => {
                const id = parseInt(card.getAttribute('data-cartelli-chapter-id'));
                if (!isNaN(id)) targetChapters.push(id);
            });
        }
    }

    if (targetChapters.length === 0) {
        showToast('কোনো অধ্যায় পাওয়া যায়নি');
        return;
    }
    showToast('কুইজ প্রশ্ন লোড হচ্ছে...');

    Promise.all(targetChapters.map(chapId =>
        fetch(`/api/cartelli/questions/chapter/${chapId}`)
            .then(res => res.json())
            .then(data => Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : (data && Array.isArray(data.mcqs) ? data.mcqs : [])))
            .catch(() => [])
    ))
        .then(results => {
            let allMcqs = [];
            results.forEach(list => {
                if (Array.isArray(list)) {
                    list.forEach(q => {
                        allMcqs.push({
                            id: q.id,
                            chapter: q.chapter_id,
                            italian: q.italian || q.question,
                            bangla: q.bangla || q.bn_question,
                            is_vero: String(q.correct_answer || '').toLowerCase() === 'vero' || q.correct_answer === '1' || q.correct_answer === 1 || q.is_vero === true || q.is_vero === 1 || q.is_vero === '1',
                            image: q.image,
                            audio: q.audio || q.voice,
                            video: q.video,
                            vocabulary: q.vocabulary || []
                        });
                    });
                }
            });

            if (allMcqs.length === 0) {
                showToast('সিলেক্ট করা অধ্যায়ের অধীনে কোনো এমসিকিউ প্রশ্ন পাওয়া যায়নি');
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
                    timerLabel.innerText = `${targetChapters.length} Chapters`;
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
    chapterId = parseInt(chapterId);
    if (cartelliActiveChapterId !== chapterId || !preserveSelection) {
        selectedCartelliSchede = [];
        isCartelliSchedeSelectMode = false;
    }
    cartelliActiveChapterId = chapterId;

    const labelEl = document.getElementById('cartelli-schede-chapter-label');
    if (labelEl) labelEl.innerText = `Caricamento...`;

    const updateLabel = () => {
        const ch = cartelliAllChapters.find(c => c.id === chapterId);
        if (ch && labelEl) {
            labelEl.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
        }
        populateCartelliSchedeChapterDropdown();
    };

    if (!cartelliAllChapters || cartelliAllChapters.length === 0) {
        fetch('/api/cartelli/chapters')
            .then(res => res.json())
            .then(data => {
                cartelliAllChapters = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
                updateLabel();
            })
            .catch(() => {});
    } else {
        updateLabel();
    }

    const container = document.getElementById('cartelli-schede-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede...</div>`;
    }

    openScreen('cartelli-schede', 'Scegli Scheda');

    fetch(`/api/cartelli/pages/${chapterId}`)
        .then(res => res.json())
        .then(resData => {
            const pages = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.data) ? resData.data : []);
            cartelliPagesList = pages;
            if (!preserveSelection) {
                selectedCartelliSchede = [];
                isCartelliSchedeSelectMode = false;
            }
            updateCartelliSchedeQuizButtonVisibility();
            updateCartelliSchedePillStates();
            updateLabel();

            if (pages.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Nessuna scheda trovata per questo capitolo.</div>`;
                return;
            }

            const userStats = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : JSON.parse(localStorage.getItem('user_question_stats') || '{}');
            container.innerHTML = '';
            pages.forEach((page, index) => {
                let correct = 0;
                let wrong = 0;
                const total = page.mcqs ? page.mcqs.length : 0;

                if (page.mcqs && Array.isArray(page.mcqs)) {
                    page.mcqs.forEach(q => {
                        let record = userStats[`cartelli_${q.id}`];
                        let stState = (typeof record === 'object') ? record.state : record;
                        if (stState === 'correct') correct++;
                        else if (stState === 'wrong') wrong++;
                    });
                }

                const unanswered = Math.max(0, total - correct - wrong);
                const isSelected = selectedCartelliSchede.includes(page.id);

                const card = document.createElement('div');
                card.className = `content-card scheda-item-card ${isSelected ? 'selected-sheet-card' : ''}`;
                card.setAttribute('data-cartelli-page-id', page.id);
                card.setAttribute('data-chapter-id', chapterId);
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                card.style.padding = '16px';
                card.onclick = () => {
                    if (isCartelliSchedeSelectMode) {
                        toggleCartelliSchedaSelection(page.id);
                    } else {
                        openCartelliPageScreen(page.id);
                    }
                };

                const totalPercent = total || 1;

                const pageNum = page.page_number || (index + 1);
                let rawTitle = page.title || page.bn_title || page.name || '';
                rawTitle = rawTitle.replace(/^\d+[\s\.\)\-]+/, '').trim();
                const displaySheetTitle = `Pagina ${pageNum}) ${rawTitle}`;

                let pageImgHTML = '';
                if (page.image) {
                    const imgSrc = (page.image.startsWith('http') || page.image.startsWith('/')) ? page.image : `/storage/${page.image}`;
                    pageImgHTML = `
                        <div class="page-image-frame" style="width: 100%; min-width: 100%; align-self: stretch; height: auto; display: block; margin: 10px 0; background: transparent; border-radius: 14px; padding: 0; box-shadow: none; overflow: hidden;">
                            <img src="${imgSrc}" class="schede-page-img" alt="${rawTitle}" style="width: 100%; min-width: 100%; height: auto; border-radius: 14px; background: transparent; display: block; object-fit: cover;">
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="schede-page-title" style="font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                            ${displaySheetTitle}
                        </span>
                        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary);"></i>
                    </div>

                    ${pageImgHTML}

                    <div class="schede-card-footer" style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-secondary);">
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
            updateCartelliSchedePillStates();
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

function toggleCartelliSchedaSelection(pageId) {
    pageId = parseInt(pageId);
    const idx = selectedCartelliSchede.indexOf(pageId);
    if (idx > -1) {
        selectedCartelliSchede.splice(idx, 1);
    } else {
        selectedCartelliSchede.push(pageId);
    }
    isCartelliSchedeSelectMode = selectedCartelliSchede.length > 0;

    const card = document.querySelector(`.scheda-item-card[data-cartelli-page-id="${pageId}"]`);
    if (card) {
        if (selectedCartelliSchede.includes(pageId)) {
            card.classList.add('selected-sheet-card');
        } else {
            card.classList.remove('selected-sheet-card');
        }
    }

    updateCartelliSchedeQuizButtonVisibility();
    updateCartelliSchedePillStates();
}

function unselectAllCartelliSchede() {
    selectedCartelliSchede = [];
    isCartelliSchedeSelectMode = false;
    document.querySelectorAll('.scheda-item-card[data-cartelli-page-id]').forEach(card => {
        card.classList.remove('selected-sheet-card');
    });
    updateCartelliSchedeQuizButtonVisibility();
    updateCartelliSchedePillStates();
    showToast('সব পৃষ্ঠা আন-সিলেক্ট করা হয়েছে');
}

function selectAllCartelliSchede() {
    const currentBox = currentCartelliChapId ? document.getElementById(`cartelli-chapter-schede-${currentCartelliChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card[data-cartelli-page-id]') : document.querySelectorAll('#screen-cartelli-schede .scheda-item-card[data-cartelli-page-id]');
    
    selectedCartelliSchede = [];
    cards.forEach(card => {
        const pageId = parseInt(card.getAttribute('data-cartelli-page-id'));
        if (!isNaN(pageId)) {
            selectedCartelliSchede.push(pageId);
            card.classList.add('selected-sheet-card');
        }
    });

    isCartelliSchedeSelectMode = true;
    updateCartelliSchedeQuizButtonVisibility();
    updateCartelliSchedePillStates();
    showToast('সব পৃষ্ঠা সিলেক্ট করা হয়েছে');
}

function toggleSelectCartelliSchede() {
    isCartelliSchedeSelectMode = true;
    const currentBox = currentCartelliChapId ? document.getElementById(`cartelli-chapter-schede-${currentCartelliChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card[data-cartelli-page-id]') : document.querySelectorAll('#screen-cartelli-schede .scheda-item-card[data-cartelli-page-id]');
    
    if (selectedCartelliSchede.length === 0 && cards.length > 0) {
        const firstId = parseInt(cards[0].getAttribute('data-cartelli-page-id'));
        if (!isNaN(firstId)) {
            selectedCartelliSchede = [firstId];
            cards[0].classList.add('selected-sheet-card');
        }
    }
    updateCartelliSchedeQuizButtonVisibility();
    updateCartelliSchedePillStates();
}

function updateCartelliSchedePillStates() {
    const btnUnselect = document.getElementById('cartelli-schede-btn-unselect');
    const btnSelect = document.getElementById('cartelli-schede-btn-select');
    const btnSelectAll = document.getElementById('cartelli-schede-btn-select-all');

    if (btnUnselect) btnUnselect.classList.remove('active');
    if (btnSelect) btnSelect.classList.remove('active');
    if (btnSelectAll) btnSelectAll.classList.remove('active');

    if (btnSelect) {
        btnSelect.style.display = isCartelliSchedeSelectMode ? 'none' : 'inline-block';
    }

    const currentBox = currentCartelliChapId ? document.getElementById(`cartelli-chapter-schede-${currentCartelliChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card[data-cartelli-page-id]') : document.querySelectorAll('#screen-cartelli-schede .scheda-item-card[data-cartelli-page-id]');
    const totalCount = cards.length;

    if (!isCartelliSchedeSelectMode && selectedCartelliSchede.length === 0) {
        if (btnUnselect) btnUnselect.classList.add('active');
    } else if (totalCount > 0 && selectedCartelliSchede.length >= totalCount) {
        if (btnSelectAll) btnSelectAll.classList.add('active');
    } else if (isCartelliSchedeSelectMode) {
        if (btnSelect) btnSelect.classList.add('active');
    }
}

function updateCartelliSchedeQuizButtonVisibility() {
    const btn = document.getElementById('cartelli-schede-quiz-btn');
    if (btn) btn.style.display = 'flex';
}

function startCartelliSchedeQuiz() {
    let targetPages = [...selectedCartelliSchede];
    if (targetPages.length === 0) {
        const currentBox = currentCartelliChapId ? document.getElementById(`cartelli-chapter-schede-${currentCartelliChapId}`) : null;
        const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card[data-cartelli-page-id]') : document.querySelectorAll('#screen-cartelli-schede .scheda-item-card[data-cartelli-page-id]');
        cards.forEach(card => {
            const pageId = parseInt(card.getAttribute('data-cartelli-page-id'));
            if (!isNaN(pageId)) targetPages.push(pageId);
        });
    }

    if (targetPages.length === 0) {
        showToast('কোনো পেজ পাওয়া যায়নি');
        return;
    }
    showToast('কুইজ প্রশ্ন লোড হচ্ছে...');

    Promise.all(targetPages.map(pageId =>
        fetch(`/api/cartelli/page-mcqs/${pageId}`)
            .then(res => res.json())
            .then(data => Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : (data && Array.isArray(data.mcqs) ? data.mcqs : [])))
            .catch(() => [])
    ))
        .then(results => {
            let allMcqs = [];
            results.forEach(list => {
                if (Array.isArray(list)) {
                    list.forEach(q => {
                        allMcqs.push({
                            id: q.id,
                            chapter: q.chapter_id,
                            italian: q.italian || q.question,
                            bangla: q.bangla || q.bn_question,
                            is_vero: String(q.correct_answer || '').toLowerCase() === 'vero' || q.correct_answer === '1' || q.correct_answer === 1 || q.is_vero === true || q.is_vero === 1 || q.is_vero === '1',
                            image: q.image,
                            audio: q.audio || q.voice,
                            video: q.video,
                            vocabulary: q.vocabulary || []
                        });
                    });
                }
            });

            if (allMcqs.length === 0) {
                showToast('সিলেক্ট করা পেজের অধীনে কোনো এমসিকিউ প্রশ্ন পাওয়া যায়নি');
                return;
            }

            allMcqs.sort(() => 0.5 - Math.random());
            const quizMcqs = allMcqs.slice(0, 30);

            showTestOptionsDialog(() => {
                practiceMode = 'sheet';
                testQuestions = quizMcqs;
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

                openScreen('test', 'Cartelli Quiz');
                switchTestQuestionTab(1);
                showTestQuestion();
                startTestTimer();
            });
        })
        .catch(err => {
            console.error("Error generating cartelli schede quiz: ", err);
            showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
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

    const mcqImage = (page.mcqs && page.mcqs.length) ? (page.mcqs.find(q => q.image || q.img)?.image || page.mcqs.find(q => q.image || q.img)?.img) : null;
    const pageMainImage = mcqImage || null;
    cartelliActivePageMainImage = pageMainImage || null;
    const mediaCont = document.getElementById('cartelli-page-media-container');
    if (mediaCont) mediaCont.style.display = 'none';

    // Save state for F5 reload restore
    try {
        sessionStorage.setItem('cartelliActivePageId', pageId);
        sessionStorage.setItem('cartelliActiveChapterId', page.chapter_id || '');
    } catch(e) {}

    renderCartelliPageMcqs(page.mcqs || []);
}

function loadCartelliPageScreenFromSession() {
    const savedPageId = parseInt(sessionStorage.getItem('cartelliActivePageId'));
    const savedChapterId = parseInt(sessionStorage.getItem('cartelliActiveChapterId'));
    if (!savedPageId) {
        openScreen('cartelli', 'Cartelli');
        if (typeof renderCartelliChaptersGrid === 'function') renderCartelliChaptersGrid();
        return;
    }

    // Load all chapters first, then load pages for the chapter, then open the page
    fetch('/api/cartelli/chapters')
        .then(r => r.json())
        .then(chapters => {
            cartelliAllChapters = chapters;
            const chapterId = savedChapterId || (chapters.length > 0 ? chapters[0].id : null);
            if (!chapterId) {
                openScreen('cartelli', 'Cartelli');
                renderCartelliChaptersGrid();
                return;
            }
            cartelliActiveChapterId = chapterId;
            return fetch(`/api/cartelli/pages/${chapterId}`);
        })
        .then(r => r ? r.json() : [])
        .then(pages => {
            if (!pages || pages.length === 0) {
                openScreen('cartelli', 'Cartelli');
                renderCartelliChaptersGrid();
                return;
            }
            cartelliPagesList = pages;
            const page = pages.find(p => p.id === savedPageId) || pages[0];
            openCartelliPageScreen(page.id);
        })
        .catch(() => {
            openScreen('cartelli', 'Cartelli');
            if (typeof renderCartelliChaptersGrid === 'function') renderCartelliChaptersGrid();
        });
}


function renderCartelliPageMcqs(mcqs) {
    const container = document.getElementById('cartelli-page-mcq-list');
    if (!container) return;
    container.innerHTML = '';

    if (mcqs.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি।</div>`;
        return;
    }

    const userStats = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : JSON.parse(localStorage.getItem('user_question_stats') || '{}');

    mcqs.forEach((q, index) => {
        const databaseIsVero = q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;

        const cartelliBookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
        const cartelliIsBookmarked = cartelliBookmarks.includes(q.id);

        const cartelliNotes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
        const cartelliHasNote = cartelliNotes[q.id] !== undefined && cartelliNotes[q.id].trim() !== '';

        const bookmarkIconClass = cartelliIsBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const bookmarkIconColor = cartelliIsBookmarked ? 'color: var(--accent-green);' : '';

        const record = userStats[`cartelli_${q.id}`];
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
            <div style="flex: 1; font-size: 13px; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 10px;">
                <div style="color: var(--text-primary); font-weight: 800; font-size: 13px;">(TU) Hai risposto:</div>
                <div style="display: flex; gap: 16px; font-size: 13px; font-weight: 700;">
                    <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
                    <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                </div>
            </div>
        ` : '<div style="flex: 1;"></div>';

        const card = document.createElement('div');
        card.className = `detail-q-card ${!isAnswered ? 'unanswered' : (record && record.state === 'correct' ? 'correct' : 'incorrect')}`;
        card.id = `cartelli-card-${q.id}`;
        card.setAttribute('data-qid', q.id);
        card.setAttribute('data-qtype', 'cartelli');
        card.setAttribute('data-qid', q.id);
        card.style.position = 'relative';
        card.style.cursor = 'pointer';

        card.onclick = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) {
                return;
            }
            if (typeof isCartelliSelectionMode !== 'undefined' && !isCartelliSelectionMode) {
                return; // Selection mode inactive: do not select on card click
            }
            card.classList.toggle('selected-q-card');
            if (typeof updateCartelliSelectionPills === 'function') {
                updateCartelliSelectionPills();
            }
        };

        const hasImage = !!(q.image || q.img);
        const imgPos = q.image_position || 'left';
        const showTopImg = hasImage && (imgPos === 'top' || imgPos === 'both');
        const showLeftImg = hasImage && (imgPos === 'left' || imgPos === 'both');

        if (showTopImg) {
            const topImgCard = document.createElement('div');
            topImgCard.className = 'detail-q-top-image-card';
            topImgCard.style.cssText = 'padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; margin-top: 16px; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.03);';
            topImgCard.innerHTML = `<img src="${q.image || q.img}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${q.image || q.img}')" style="max-width: 100%; height: auto; max-height: 450px; object-fit: contain; border-radius: 8px; cursor: pointer;" title="ইমেজ দেখুন">`;
            container.appendChild(topImgCard);
        }

        card.innerHTML = `
            <div class="detail-q-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                <div class="detail-q-num" style="margin-bottom: 0; flex-shrink: 0;">${index + 1}</div>
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; justify-content: flex-end; margin-left: auto;">
                    <button class="test-ctrl-btn" onclick="toggleCartelliQuestionAnswer(${q.id})" id="cartelli-eye-btn-${q.id}" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Show Answer">
                        <i class="fa-regular fa-eye" id="cartelli-eye-icon-${q.id}" style="font-size: 13px; color: var(--text-secondary);"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">দেখুন</span>
                    </button>
                    <span id="cartelli-ans-text-${q.id}" style="display: none; font-size: 14px; font-weight: 900; color: ${databaseIsVero ? '#4CAF50' : '#ef4444'}; flex-shrink: 0;">${databaseIsVero ? 'VERO ✓' : 'FALSO ✗'}</span>
                </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px; width: 100%;">
                ${showLeftImg ? `<img src="${q.image || q.img}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${q.image || q.img}')" style="width: var(--argomenti-q-img-size-desk, 110px); min-width: var(--argomenti-q-img-size-desk, 110px); max-width: 250px; height: auto; max-height: var(--argomenti-q-img-size-desk, 110px); object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" title="ইমেজ দেখুন">` : ''}
                <div style="flex: 1; min-width: 0;">
                    <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.question || '', q.vocabulary || [], q.id, 'cartelli') : (q.question || '')}</div>
                    <div class="detail-q-text-bn" id="cartelli-q-bn-${q.id}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bn_question || ''}</div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;">
                    <button class="test-ctrl-btn" id="cartelli-play-btn-${index}" onclick="playCartelliMcqAudioOrSpeech(${index})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Play Audio Voiceover">
                        <i class="fa-solid fa-play" style="font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                    </button>
                    <input type="range" class="test-slider" id="cartelli-audio-slider-${index}" min="0" max="100" value="0" style="flex: 1;" readonly>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="test-speaker-btn" onclick="readCartelliQuestionSpeech(${index})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; background-color: var(--bg-page); border: 1px solid var(--border-card); cursor: pointer;" title="Listen TTS Pronunciation">
                        <i class="fa-solid fa-microphone" style="font-size: 13px; color: var(--accent-green);"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">Italiano</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="showQuestionSpeedPopover(this, true)" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Speech Speed">
                        <i class="fa-solid fa-gauge-high" style="color: var(--accent-green); font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">স্পিড</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleCartelliPageTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Translate">
                        <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleCartelliBookmark(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Bookmark">
                        <i class="${bookmarkIconClass}" style="${bookmarkIconColor} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">সেভ</span>
                    </button>
                    <button class="test-ctrl-btn" id="cartelli-note-btn-${q.id}" onclick="openCartelliNotesModal(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Add Note">
                        <i class="fa-regular fa-note-sticky" style="${cartelliHasNote ? 'color: var(--accent-green);' : ''} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: ${cartelliHasNote ? 'var(--accent-green)' : 'var(--text-secondary)'}; white-space: nowrap;">নোট</span>
                    </button>
                </div>
            </div>

            ${isAnswered ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); display: flex; justify-content: center; align-items: center;">
                ${statsHtml}
            </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function toggleCartelliQuestionAnswer(qId) {
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
        if (labelEl) { labelEl.innerText = 'প্রশ্ন দেখুন'; labelEl.style.color = 'var(--text-secondary)'; }
    }
}

function startCartelliPageQuiz() {
    const selectedCards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card.selected-q-card');
    let currentMcqs = [];
    const page = cartelliPagesList.find(p => p.id === cartelliActivePageId);
    const allPageMcqs = (page && page.mcqs) ? page.mcqs : [];

    if (selectedCards.length > 0) {
        selectedCards.forEach(cardEl => {
            const qId = parseInt(cardEl.getAttribute('data-qid'));
            const found = allPageMcqs.find(m => m.id === qId);
            if (found) currentMcqs.push(found);
        });
    } else if (allPageMcqs.length > 0) {
        currentMcqs = allPageMcqs;
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
        type: 'cartelli',
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
        openQuestionTranslationModal(q.question || q.italian || '', q.bn_question || q.bangla || '', q.vocabulary || [], q.image || q.img || '');
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

window.isCartelliSelectionMode = window.isCartelliSelectionMode || false;

function updateCartelliSelectionPills() {
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    const selectedCards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card.selected-q-card');
    const selectBtn = document.getElementById('cartelli-select-toggle-btn');
    const selectAllBtn = document.getElementById('cartelli-select-all-btn');
    const unselectAllBtn = document.getElementById('cartelli-unselect-all-btn');

    if (selectAllBtn) selectAllBtn.classList.remove('active');
    if (unselectAllBtn) unselectAllBtn.classList.remove('active');
    if (selectBtn) selectBtn.classList.remove('active');

    if (window.isCartelliSelectionMode) {
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

function toggleCartelliPageSelection() {
    window.isCartelliSelectionMode = true;
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    const selectedCount = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card.selected-q-card').length;
    if (selectedCount === 0 && cards.length > 0) {
        cards[0].classList.add('selected-q-card');
    }
    updateCartelliSelectionPills();
    showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
}

function selectAllCartelliPages() {
    window.isCartelliSelectionMode = true;
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    updateCartelliSelectionPills();
    showToast('সব প্রশ্ন সিলেক্ট করা হয়েছে');
}

function unselectAllCartelliPages() {
    window.isCartelliSelectionMode = false;
    const cards = document.querySelectorAll('#cartelli-page-mcq-list .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    updateCartelliSelectionPills();
    showToast('সব প্রশ্ন আনসিলেক্ট করা হয়েছে');
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
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
            'X-Client-Phone': userPhone
        },
        body: JSON.stringify({ question_id: qId, type: 'cartelli', phone: userPhone, session_id: userSessionId })
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message);
            let bookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
            const idx = bookmarks.indexOf(qId);
            if (data.saved) {
                if (idx === -1) bookmarks.push(qId);
                if (btn) {
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = 'fa-solid fa-bookmark';
                        icon.style.color = 'var(--accent-green)';
                    }
                }
            } else {
                if (idx > -1) bookmarks.splice(idx, 1);
                if (btn) {
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = 'fa-regular fa-bookmark';
                        icon.style.color = '';
                    }
                }
            }
            localStorage.setItem('cartelli_bookmarks', JSON.stringify(bookmarks));
        })
        .catch(err => {
            console.error("Error bookmarking Cartelli MCQ:", err);
            showToast('বুকমার্ক করতে সমস্যা হয়েছে');
        });
}

function openCartelliNotesModal(qId) {
    let notes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
    const existingNote = notes[qId] || '';
    if (typeof openNotesModal === 'function') {
        openNotesModal(null, qId, null, existingNote);
    }
}
