// ==========================================
// Saved MCQs Screen Logic
// ==========================================

let selectedSavedMcqIds = [];
let isSavedMcqSelectMode = false;

function loadSavedMcqsScreen() {
    const container = document.getElementById('saved-mcqs-list-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande salvate...</div>`;

    fetch('/api/v1/saved-mcqs')
        .then(res => res.json())
        .then(resData => {
            const saved = resData.data || resData || [];
            const savedArr = Array.isArray(saved) ? saved : [];
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

                const chapNum = chapter ? (chapter.chapter_number || chapter.id) : (q.chapter || '');
                const chapName = chapter ? (chapter.name || '') : '';
                const pageTitle = page ? (page.title || '') : '';
                const pageNum = page ? (page.sort_order || page.id) : '';

                let locationBadgeHtml = '';
                if (chapNum || pageTitle) {
                    locationBadgeHtml = `
                        <div style="font-size: 11px; font-weight: 700; color: var(--accent-green); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; background-color: rgba(76, 175, 80, 0.08); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(76, 175, 80, 0.18); width: fit-content;">
                            <i class="fa-solid fa-folder-open" style="font-size: 10px;"></i>
                            <span>${chapNum ? `Capitolo ${chapNum}` : ''}${chapName ? `: ${chapName}` : ''}${pageTitle ? ` · Pagina ${pageNum}: ${pageTitle}` : ''}</span>
                        </div>
                    `;
                }

                const qImage = q.image || q.img || (page && page.image ? page.image : null);

                const topRightImageHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <img src="${qImage}" style="max-height: 60px; max-width: 100px; object-fit: contain; border-radius: 6px; border: 1px solid var(--border-card); background: #fff; cursor: pointer;" onclick="openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 6px; border: 1px solid var(--border-card); background: #fff; cursor: pointer;" onclick="openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const isSelected = selectedSavedMcqIds.includes(q.id);
                const card = document.createElement('div');
                card.className = `detail-q-card unanswered ${isSelected ? 'selected-q-card' : ''}`;
                card.id = `saved-card-${q.id}`;
                card.style.position = 'relative';

                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('img')) return;
                    toggleSavedMcqCardSelection(q.id, card);
                };

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
                        <div>
                            ${locationBadgeHtml}
                            <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${index + 1}</div>
                        </div>
                        ${topRightImageHtml}
                    </div>

                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-right: 2px;">Risposta Corretta:</span>
                            <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                <i class="fa-solid ${databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> VERO
                            </span>
                            <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${!databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                <i class="fa-solid ${!databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> FALSO
                            </span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian, q.vocabulary)}</div>
                            <div class="detail-q-text-bn" id="saved-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="readSavedQuestionSpeech(${q.id}, '${q.italian.replace(/'/g, "\\'")}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Listen Pronunciation">
                            <i class="fa-solid fa-volume-high" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">উচ্চারণ</span>
                        </button>
                        <button class="test-ctrl-btn" id="saved-play-btn-${q.id}" onclick="readSavedQuestionSpeech(${q.id}, '${q.italian.replace(/'/g, "\\'")}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play Audio">
                            <i class="fa-solid fa-play" style="font-size:12px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">শুনুন</span>
                        </button>
                        <input type="range" class="test-slider" id="saved-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px;" readonly>
                        <button class="test-ctrl-btn" onclick="toggleSavedTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Remove Bookmark">
                            <i class="fa-solid fa-bookmark" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--accent-green); white-space: nowrap;">সেভ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                        </button>
                    </div>
                `;
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
}

function selectAllSavedMcqs() {
    selectedSavedMcqIds = activeSavedMcqs.map(q => q.id);
    isSavedMcqSelectMode = true;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    showToast('সব সেভড প্রশ্ন সিলেক্ট করা হয়েছে');
}

function unselectAllSavedMcqs() {
    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    showToast('সব আন-সিলেক্ট করা হয়েছে');
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

    if (selectedSavedMcqIds.length === 0) {
        if (btnUnselect) btnUnselect.classList.add('active');
    } else if (activeSavedMcqs.length > 0 && selectedSavedMcqIds.length === activeSavedMcqs.length) {
        if (btnAll) btnAll.classList.add('active');
    } else if (isSavedMcqSelectMode) {
        if (btnSelect) btnSelect.classList.add('active');
    }
}

function updateSavedMcqsQuizButtonVisibility() {
    const container = document.getElementById('saved-mcqs-quiz-btn-container');
    if (!container) return;
    container.style.display = selectedSavedMcqIds.length > 0 ? 'block' : 'none';
}

function startSavedMcqsQuiz() {
    if (selectedSavedMcqIds.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি সেভড প্রশ্ন সিলেক্ট করুন');
        return;
    }
    const questionsToQuiz = activeSavedMcqs.filter(q => selectedSavedMcqIds.includes(q.id));
    if (questionsToQuiz.length === 0) {
        showToast('কোনো কুইজ প্রশ্ন পাওয়া যায়নি');
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
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

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

    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || []);
}

function toggleSavedMcq(questionId, btnElement) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    fetch('/api/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({ question_id: questionId })
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message);
            if (data.saved) {
                btnElement.innerHTML = '<i class="fa-solid fa-bookmark" style="color: var(--accent-green);"></i>';
            } else {
                btnElement.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
            }

            const activeScreen = screenHistory[screenHistory.length - 1];
            if (activeScreen === 'saved-mcqs') {
                loadSavedMcqsScreen();
            } else if (activeScreen === 'page-details' && activePageDetails) {
                openPageDetailsScreen(activePageDetails.id);
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

function openNotesModal(pageId, questionId, noteId, existingText) {
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    document.getElementById('notes-form-page-id').value = pageId || '';
    document.getElementById('notes-form-question-id').value = questionId || '';
    document.getElementById('notes-form-note-id').value = noteId || '';
    document.getElementById('notes-textarea').value = existingText || '';

    if (!existingText && (questionId || pageId)) {
        const query = questionId ? `question_id=${questionId}` : `page_id=${pageId}`;
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
    } else if (existingText) {
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
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteText.trim()) {
        showToast('অনুগ্রহ করে নোটের বিবরণ লিখুন');
        return;
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
            note_text: noteText
        })
    })
        .then(res => res.json())
        .then(data => {
            showToast('নোট সফলভাবে সংরক্ষণ করা হয়েছে');
            closeNotesModal();

            // Reload details screen if note was added to it
            if (activePageDetails) {
                openPageDetailsScreen(activePageDetails.id);
            }
        })
        .catch(err => {
            console.error("Error saving note: ", err);
            showToast('নোট সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteUserNote() {
    const noteId = document.getElementById('notes-form-note-id').value;
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteId) {
        closeNotesModal();
        return;
    }

    if (confirm('আপনি কি নোটটি মুছে ফেলতে চান?')) {
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
                if (activePageDetails) {
                    openPageDetailsScreen(activePageDetails.id);
                }
            })
            .catch(err => {
                console.error("Error deleting note: ", err);
                showToast('নোটটি মুছে ফেলতে সমস্যা হয়েছে');
            });
    }
}

function saveQuestionAnswerStat(questionId, chapterId, state) {
    if (!questionId) return;
    const qIdNum = parseInt(questionId);
    const stats = getUserQuestionStats();
    const existing = stats[qIdNum] || { correct: 0, wrong: 0 };

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

    stats[qIdNum] = {
        state: isCorrect ? 'correct' : 'wrong',
        correct: correctCount,
        wrong: wrongCount,
        chapter: chapterId || null,
        updated_at: new Date().toISOString()
    };
    saveUserQuestionStats(stats);

    // Save/log to Database via API
    fetch('/api/user-mcq-results/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
            results: [{
                question_id: qIdNum,
                user_answer: isCorrect ? 'correct' : 'wrong',
                is_correct: isCorrect
            }]
        })
    }).catch(err => console.error("Error logging MCQ result to database:", err));
}
