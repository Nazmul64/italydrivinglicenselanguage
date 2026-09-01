// ==========================================
// Saved MCQs Screen Logic
// ==========================================

let selectedSavedMcqIds = [];
let isSavedMcqSelectMode = false;

function loadSavedMcqsScreen() {
    const container = document.getElementById('saved-mcqs-list-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande salvate...</div>`;

    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    updateSavedMcqsPillStates();

    fetch(`/api/v1/saved-mcqs?phone=${encodeURIComponent(savedPhone)}&session_id=${encodeURIComponent(savedSessionId)}`, {
        headers: { 'X-Client-Phone': savedPhone }
    })
        .then(res => res.json())
        .then(resData => {
            const savedArr = Array.isArray(resData) ? resData : (resData.data || []);
            activeSavedMcqs = savedArr.map(item => item.question || item).filter(q => q && q.id);
            container.innerHTML = '';
            const countEl = document.getElementById('saved-mcqs-count');
            if (countEl) countEl.innerText = `${savedArr.length} Domande`;

            if (savedArr.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda salvata.</div>`;
                updateSavedMcqsQuizButtonVisibility();
                return;
            }

            savedArr.forEach((item, index) => {
                const q = item.question || item;
                if (!q || !q.id) return;

                const page = q.page || null;
                const chapter = (page && page.chapter) ? page.chapter : null;

                const qType = q.type || item.type || 'argomenti';
                const typeBadge = qType === 'cartelli' ? 'Cartelli' : 'Argomenti';

                const chapNum = chapter ? (chapter.chapter_number || chapter.id) : (q.chapter || '');
                const chapName = chapter ? (chapter.name || '') : '';
                const pageTitle = page ? (page.title || '') : '';
                const pageNum = page ? (page.sort_order || page.id) : '';

                let locationBadgeHtml = '';

                const vocabImg = (Array.isArray(q.vocabulary) && q.vocabulary.find(v => v && v.image && v.image.trim() !== '')) ? q.vocabulary.find(v => v && v.image && v.image.trim() !== '').image : null;
                const qImage = q.image || q.img || vocabImg || (page && page.image ? page.image : null);

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const isSelected = selectedSavedMcqIds.includes(q.id);

                const card = document.createElement('div');
                card.className = `detail-q-card unanswered ${isSelected ? 'selected-q-card' : ''}`;
                card.id = `saved-card-${q.id}`;
                card.setAttribute('data-qid', q.id);
                card.setAttribute('data-qtype', qType);
                card.style.position = 'relative';

                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('img')) return;
                    toggleSavedMcqCardSelection(q.id, card);
                };

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div>
                            <div class="detail-q-num" style="margin-bottom: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">${index + 1}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div id="q-correct-badge-${q.id}" style="display: none; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-right: 2px;">Risposta Corretta:</span>
                                ${databaseIsVero ? `
                                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;">
                                        <i class="fa-solid fa-circle-check" style="font-size: 10px;"></i> VERO
                                    </span>
                                ` : `
                                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1.5px solid #ef4444;">
                                        <i class="fa-solid fa-circle-xmark" style="font-size: 10px;"></i> FALSO
                                    </span>
                                `}
                            </div>
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                                <i class="fa fa-eye" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    ${locationBadgeHtml}

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian, q.vocabulary, q.id) : (q.italian || '')}</div>
                            <div class="detail-q-text-bn" id="saved-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || ''}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-end; width: 100%; flex-wrap: wrap;">
                        <button class="test-ctrl-btn" id="saved-play-btn-${q.id}" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play Audio">
                            <i class="fa-solid fa-play" style="font-size:12px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                        </button>
                        <input type="range" class="test-slider" id="saved-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; cursor: pointer;" readonly>
                        <button class="test-speaker-btn" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Listen Pronunciation">
                            <i class="fa-solid fa-volume-high" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this, '${qType}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Remove Bookmark">
                            <i class="fa-solid fa-bookmark" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--accent-green); white-space: nowrap;">সেভ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                        </button>
                    </div>
                `;

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const record = userStatsMap[q.id] || {};
                const correctCount = typeof record.correct === 'number' ? record.correct : (q.correct_count || 0);
                const wrongCount = typeof record.wrong === 'number' ? record.wrong : (q.wrong_count || 0);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;';
                    statsDiv.innerHTML = `
                        <div style="color: var(--text-primary); font-weight: 800; font-size: 13px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 13px; font-weight: 700;">
                            <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
                            <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                        </div>
                    `;
                    card.appendChild(statsDiv);
                }

                container.appendChild(card);
            });
            updateSavedMcqsPillStates();
            updateSavedMcqsQuizButtonVisibility();
        })
        .catch(err => {
            console.error("Error loading saved MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento delle domande salvate.</div>`;
        });
}

function toggleSavedMcqCardSelection(qId, cardEl) {
    const idx = selectedSavedMcqIds.indexOf(qId);
    if (idx > -1) {
        selectedSavedMcqIds.splice(idx, 1);
        if (cardEl) cardEl.classList.remove('selected-q-card');
    } else {
        selectedSavedMcqIds.push(qId);
        if (cardEl) cardEl.classList.add('selected-q-card');
    }
    if (selectedSavedMcqIds.length > 0) {
        isSavedMcqSelectMode = true;
    } else {
        isSavedMcqSelectMode = false;
    }
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
}

function toggleSavedMcqsSelectMode() {
    isSavedMcqSelectMode = true;
    if (selectedSavedMcqIds.length === 0 && activeSavedMcqs.length > 0) {
        selectedSavedMcqIds = [activeSavedMcqs[0].id];
    }
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
    }
}

function selectAllSavedMcqs() {
    selectedSavedMcqIds = activeSavedMcqs.map(q => q.id);
    isSavedMcqSelectMode = true;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('সব সেভড প্রশ্ন সিলেক্ট করা হয়েছে');
    }
}

function unselectAllSavedMcqs() {
    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('সব আন-সিলেক্ট করা হয়েছে');
    }
}

function renderSavedMcqsSelectionUI() {
    activeSavedMcqs.forEach(q => {
        const card = document.getElementById(`saved-card-${q.id}`);
        if (card) {
            if (selectedSavedMcqIds.includes(q.id)) {
                card.classList.add('selected-q-card');
            } else {
                card.classList.remove('selected-q-card');
            }
        }
    });
}

function updateSavedMcqsPillStates() {
    const btnSelect = document.getElementById('saved-select-toggle-btn');
    const btnAll = document.getElementById('saved-select-all-btn');
    const btnUnselect = document.getElementById('saved-unselect-all-btn');

    if (btnSelect) btnSelect.classList.remove('active');
    if (btnAll) btnAll.classList.remove('active');
    if (btnUnselect) btnUnselect.classList.remove('active');

    if (isSavedMcqSelectMode || selectedSavedMcqIds.length > 0) {
        if (btnSelect) btnSelect.style.display = 'none';
        if (activeSavedMcqs.length > 0 && selectedSavedMcqIds.length === activeSavedMcqs.length) {
            if (btnAll) btnAll.classList.add('active');
        }
    } else {
        if (btnSelect) btnSelect.style.display = 'inline-block';
        if (btnUnselect) btnUnselect.classList.add('active');
    }
}

function updateSavedMcqsQuizButtonVisibility() {
    const container = document.getElementById('saved-mcqs-quiz-btn-container');
    if (!container) return;
    container.style.display = (activeSavedMcqs && activeSavedMcqs.length > 0) ? 'block' : 'none';
}

function startSavedMcqsQuiz() {
    const questionsToQuiz = (selectedSavedMcqIds && selectedSavedMcqIds.length > 0) 
        ? activeSavedMcqs.filter(q => selectedSavedMcqIds.includes(q.id))
        : activeSavedMcqs;

    if (!questionsToQuiz || questionsToQuiz.length === 0) {
        showToast('কোনো সেভড প্রশ্ন পাওয়া যায়নি');
        return;
    }
    testQuestions = questionsToQuiz.sort(() => Math.random() - 0.5);
    currentTestIndex = 0;
    testAnswers = Array(testQuestions.length).fill(null);
    practiceMode = 'exam';

    const timerPill = document.getElementById('test-timer');
    if (timerPill) {
        timerPill.innerText = `SAVED MCQS QUIZ`;
        timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        timerPill.style.borderColor = 'var(--accent-green)';
        timerPill.style.color = 'var(--accent-green)';
    }
    const timerLabel = document.querySelector('.test-timer-label');
    if (timerLabel) {
        timerLabel.innerText = `${testQuestions.length} Saved MCQs`;
    }

    openScreen('test', 'Saved MCQs Quiz');
    switchTestQuestionTab(1);
    showTestQuestion();
    startTestTimer();
}

let playingSavedSpeechIndex = null;
let savedSpeechInterval = null;

function readSavedQuestionSpeech(qId, text) {
    if (!text && typeof window.cachedQuestionsMap !== 'undefined' && window.cachedQuestionsMap[qId]) {
        const q = window.cachedQuestionsMap[qId];
        text = q.italian || q.question || '';
    } else if (!text && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
        const q = activeSavedMcqs.find(item => item.id == qId || (item.question && item.question.id == qId));
        if (q) text = (q.question ? (q.question.italian || q.question.question) : (q.italian || q.question)) || '';
    }
    if (!text) text = '';
    if ('speechSynthesis' in window) {
        if (playingSavedSpeechIndex === qId) {
            playingSavedSpeechIndex = null;
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            const pBtn = document.getElementById(`saved-play-btn-${qId}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const slider = document.getElementById(`saved-audio-slider-${qId}`);
            if (slider) slider.value = 0;
            return;
        }

        if (playingSavedSpeechIndex !== null) {
            const oldBtn = document.getElementById(`saved-play-btn-${playingSavedSpeechIndex}`);
            const oldSlider = document.getElementById(`saved-audio-slider-${playingSavedSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (oldSlider) oldSlider.value = 0;
        }

        playingSavedSpeechIndex = qId;
        if (savedSpeechInterval) clearInterval(savedSpeechInterval);

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        const pBtn = document.getElementById(`saved-play-btn-${qId}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        let slider = document.getElementById(`saved-audio-slider-${qId}`);
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((text.length / 3) / testAudioSpeed));

        savedSpeechInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) slider.value = prg;
            if (prg >= 100) {
                clearInterval(savedSpeechInterval);
            }
        }, 200);

        utterance.onend = () => {
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            if (slider) slider.value = 100;
            const btn = document.getElementById(`saved-play-btn-${qId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingSavedSpeechIndex = null;
        };

        utterance.onerror = () => {
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            if (slider) slider.value = 0;
            const btn = document.getElementById(`saved-play-btn-${qId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingSavedSpeechIndex = null;
        };

        window.speechSynthesis.speak(utterance);
    }
}

function toggleSavedTranslation(qId) {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    if (!activeSavedMcqs) return;
    const q = activeSavedMcqs.find(item => item.id === qId);
    if (!q) return;

    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || [], q.image || q.img || '');
}

function toggleSavedMcq(questionId, btnElement, type) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
    const qType = type || 'argomenti';

    const payload = { 
        question_id: questionId,
        type: qType,
        phone: savedPhone,
        session_id: savedSessionId
    };

    fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': token,
            'X-Client-Phone': savedPhone
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            const isNowSaved = data.saved ?? (data.status === 'saved' || data.is_saved);
            showToast(data.message || (isNowSaved ? 'প্রশ্নটি সেভ করা হয়েছে' : 'সেভ থেকে সরানো হয়েছে'));

            // Sync with local storage bookmarks
            const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
            let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const idx = bookmarks.indexOf(questionId);
            if (isNowSaved && idx === -1) bookmarks.push(questionId);
            else if (!isNowSaved && idx > -1) bookmarks.splice(idx, 1);
            localStorage.setItem(storageKey, JSON.stringify(bookmarks));

            // Sync all matching card icons strictly by qType
            const selector = qType === 'cartelli'
                ? `#cartelli-mcq-card-${questionId} .fa-bookmark, #cartelli-card-${questionId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-bookmark`
                : `#argomenti-q-card-${questionId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-bookmark`;

            const cardBookmarks = document.querySelectorAll(selector);
            cardBookmarks.forEach(icon => {
                icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                icon.style.color = isNowSaved ? 'var(--accent-green)' : '';
            });

            // Update modal bookmark icon if open for this exact question and type
            if (typeof currentDictTerm !== 'undefined' && currentDictTerm && currentDictTerm.questionId == questionId && (currentDictTerm.questionType || 'argomenti') === qType) {
                const saveBtn = document.getElementById('dict-modal-save-btn');
                if (saveBtn) {
                    saveBtn.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    saveBtn.style.color = isNowSaved ? '#4CAF50' : 'var(--text-primary, #1e293b)';
                }
            }

            const activeScreen = typeof screenHistory !== 'undefined' && screenHistory.length > 0 ? screenHistory[screenHistory.length - 1] : '';
            if (activeScreen === 'saved-mcqs') {
                loadSavedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error toggling bookmark: ", err);
            showToast('বুকমার্ক করতে সমস্যা হয়েছে');
        });
}

// ==========================================
// User Notes Modal Dialog Operations
// ==========================================

function openNotesModal(pageId, questionId, noteId, existingText, type) {
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    let qType = type;
    if (!qType && questionId) {
        if (typeof extractTargetQuestionType === 'function') {
            qType = extractTargetQuestionType(null, questionId);
        } else {
            const currentActive = (typeof screenHistory !== 'undefined' && screenHistory.length > 0) ? screenHistory[screenHistory.length - 1] : (typeof activeScreen !== 'undefined' ? activeScreen : '');
            qType = (currentActive.includes('cartelli')) ? 'cartelli' : 'argomenti';
        }
    }
    qType = qType || 'argomenti';

    document.getElementById('notes-form-page-id').value = pageId || '';
    document.getElementById('notes-form-question-id').value = questionId || '';
    document.getElementById('notes-form-note-id').value = noteId || '';
    const typeInput = document.getElementById('notes-form-type');
    if (typeInput) typeInput.value = qType;

    let localText = existingText || '';
    if (!localText && questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        const localNotes = JSON.parse(localStorage.getItem(storeKey) || '{}');
        if (localNotes[questionId]) localText = localNotes[questionId];
    }
    document.getElementById('notes-textarea').value = localText;

    if (!localText && (questionId || pageId)) {
        const query = questionId ? `question_id=${questionId}&type=${qType}` : `page_id=${pageId}`;
        fetch(`/api/notes?${query}`)
            .then(res => res.json())
            .then(notes => {
                if (notes && notes.length > 0) {
                    document.getElementById('notes-form-note-id').value = notes[0].id;
                    document.getElementById('notes-textarea').value = notes[0].note_text;
                    document.getElementById('notes-delete-btn').style.display = 'block';
                } else {
                    document.getElementById('notes-delete-btn').style.display = 'none';
                }
            })
            .catch(err => {
                console.error("Error loading note: ", err);
            });
    } else if (localText) {
        document.getElementById('notes-delete-btn').style.display = 'block';
    } else {
        document.getElementById('notes-delete-btn').style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal');
    if (modal) modal.style.display = 'none';
}

function saveUserNote() {
    const pageId = document.getElementById('notes-form-page-id').value;
    const questionId = document.getElementById('notes-form-question-id').value;
    const noteText = document.getElementById('notes-textarea').value;
    const typeInput = document.getElementById('notes-form-type');
    const qType = (typeInput ? typeInput.value : null) || 'argomenti';
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteText.trim()) {
        showToast('অনুগ্রহ করে নোটের বিবরণ লিখুন');
        return;
    }

    if (questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        let notesObj = JSON.parse(localStorage.getItem(storeKey) || '{}');
        notesObj[questionId] = noteText.trim();
        localStorage.setItem(storeKey, JSON.stringify(notesObj));

        // Sync card Note button icons
        const selector = qType === 'cartelli'
            ? `#cartelli-mcq-card-${questionId} .fa-note-sticky, #cartelli-card-${questionId} .fa-note-sticky, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-note-sticky`
            : `#argomenti-q-card-${questionId} .fa-note-sticky, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-note-sticky`;

        const noteIcons = document.querySelectorAll(selector);
        noteIcons.forEach(icon => {
            icon.className = 'fa-solid fa-note-sticky';
            icon.style.color = '#10B981';
            const span = icon.closest('button')?.querySelector('span');
            if (span) span.style.color = '#10B981';
        });

        // Sync modal note button icon if open
        const dictNoteBtn = document.getElementById('dict-modal-note-btn');
        if (dictNoteBtn) {
            dictNoteBtn.style.color = '#4CAF50';
        }
    }

    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
            page_id: pageId || null,
            question_id: questionId || null,
            type: qType,
            note_text: noteText,
            session_id: localStorage.getItem('app_client_session_id') || '',
            user_phone: localStorage.getItem('app_client_phone') || ''
        })
    })
        .then(res => res.json())
        .then(data => {
            showToast('নোট সফলভাবে সংরক্ষণ করা হয়েছে');
            closeNotesModal();

            if (typeof loadNotedMcqsScreen === 'function') {
                loadNotedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error saving note: ", err);
            showToast('নোট সফলভাবে সংরক্ষণ করা হয়েছে');
            closeNotesModal();
        });
}

function deleteUserNote() {
    const questionId = document.getElementById('notes-form-question-id').value;
    const noteId = document.getElementById('notes-form-note-id').value;
    const typeInput = document.getElementById('notes-form-type');
    const qType = (typeInput ? typeInput.value : null) || 'argomenti';
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        let notesObj = JSON.parse(localStorage.getItem(storeKey) || '{}');
        delete notesObj[questionId];
        localStorage.setItem(storeKey, JSON.stringify(notesObj));

        // Reset card Note button icons
        const selector = qType === 'cartelli'
            ? `#cartelli-mcq-card-${questionId} .fa-note-sticky, #cartelli-card-${questionId} .fa-note-sticky, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-note-sticky`
            : `#argomenti-q-card-${questionId} .fa-note-sticky, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-note-sticky`;

        const noteIcons = document.querySelectorAll(selector);
        noteIcons.forEach(icon => {
            icon.className = 'fa-regular fa-note-sticky';
            icon.style.color = '';
            const span = icon.closest('button')?.querySelector('span');
            if (span) span.style.color = '';
        });

        // Reset modal note button icon
        const dictNoteBtn = document.getElementById('dict-modal-note-btn');
        if (dictNoteBtn) {
            dictNoteBtn.style.color = 'var(--text-primary, #1e293b)';
        }
    }

    if (!noteId) {
        showToast('নোটটি মুছে ফেলা হয়েছে');
        closeNotesModal();
        if (typeof loadNotedMcqsScreen === 'function') loadNotedMcqsScreen();
        return;
    }

    fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': token
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast('নোটটি মুছে ফেলা হয়েছে');
            closeNotesModal();
            if (typeof loadNotedMcqsScreen === 'function') {
                loadNotedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error deleting note: ", err);
            showToast('নোটটি মুছে ফেলা হয়েছে');
            closeNotesModal();
        });
}

function saveQuestionAnswerStat(questionId, chapterId, state, questionType = 'argomenti') {
    if (!questionId) return;
    const qIdNum = parseInt(questionId);
    const key = (questionType === 'cartelli' || String(questionId).startsWith('cartelli_'))
        ? `cartelli_${qIdNum}`
        : qIdNum;

    const stats = getUserQuestionStats();
    const existing = stats[key] || { correct: 0, wrong: 0 };

    let correctCount = typeof existing.correct === 'number' ? existing.correct : 0;
    let wrongCount = typeof existing.wrong === 'number' ? existing.wrong : 0;
    const isCorrect = (state === 'correct');

    if (isCorrect) {
        correctCount += 1;
        wrongCount = 0; // Reset wrong count so it leaves Wrong MCQs list
        if (window.selectedWrongMcqIds && window.selectedWrongMcqIds.has(qIdNum)) {
            window.selectedWrongMcqIds.delete(qIdNum);
            if (typeof updateWrongMcqSelectionUI === 'function') {
                updateWrongMcqSelectionUI();
            }
        }
    } else {
        wrongCount += 1;
    }

    stats[key] = {
        state: isCorrect ? 'correct' : 'wrong',
        correct: correctCount,
        wrong: wrongCount,
        chapter: chapterId || null,
        updated_at: new Date().toISOString()
    };
    saveUserQuestionStats(stats);

    // Save/log to Database via API
    const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    fetch('/api/user-mcq-results/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            'X-Client-Phone': userPhone
        },
        body: JSON.stringify({
            phone: userPhone,
            session_id: userSessionId,
            results: [{
                question_id: qIdNum,
                user_answer: isCorrect ? 'correct' : 'wrong',
                is_correct: isCorrect
            }]
        })
    }).catch(err => console.error("Error logging MCQ result to database:", err));
}
