// ==========================================
// Exam Simulation (Scheda Esame) Module
// ==========================================
let activeExamTab = 'new';
let allExamsData = [];
let activeExamSession = null;
let schedaExamQuestions = [];
let currentExamQuestionIndex = 0;
let examUserAnswers = {}; // question_id => true/false/null
let schedaExamTimerInterval = null;
let examTimeLeft = 1800; // 30 minutes in seconds

function loadExamSheets() {
    const container = document.getElementById('exam-cards-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede esame...</div>`;
    }

    fetch('/api/exams')
        .then(res => res.json())
        .then(data => {
            allExamsData = data;
            renderExamSheets();
        })
        .catch(err => {
            console.error("Error loading exams: ", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore durante il caricamento delle schede.</div>`;
            }
        });
}

function switchExamTab(tabName) {
    activeExamTab = tabName;

    const tabNew = document.getElementById('exam-tab-new');
    const tabCompleted = document.getElementById('exam-tab-completed');

    if (tabName === 'new') {
        if (tabNew) {
            tabNew.style.borderBottom = '3px solid white';
            tabNew.style.color = 'white';
        }
        if (tabCompleted) {
            tabCompleted.style.borderBottom = 'none';
            tabCompleted.style.color = 'rgba(255,255,255,0.7)';
        }
    } else {
        if (tabCompleted) {
            tabCompleted.style.borderBottom = '3px solid white';
            tabCompleted.style.color = 'white';
        }
        if (tabNew) {
            tabNew.style.borderBottom = 'none';
            tabNew.style.color = 'rgba(255,255,255,0.7)';
        }
    }

    renderExamSheets();
}

function filterExamCards() {
    renderExamSheets();
}

function renderExamSheets() {
    const container = document.getElementById('exam-cards-list');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('exam-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter by tab status and search text
    const filtered = allExamsData.filter(ex => {
        const matchesStatus = (ex.status === activeExamTab);
        const matchesSearch = !searchVal ||
            ex.student_name.toLowerCase().includes(searchVal) ||
            ex.motorizzazione.toLowerCase().includes(searchVal) ||
            ex.id.toString().includes(searchVal);
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-weight: bold; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">Nessuna scheda trovata in questa sezione.</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.style.backgroundColor = 'var(--bg-card)';
        card.style.border = '1px solid var(--border-color)';
        card.style.borderRadius = '16px';
        card.style.padding = '18px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '16px';
        card.style.position = 'relative';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
        card.style.cursor = 'pointer';

        // Handle click event to start or review
        card.onclick = () => {
            if (ex.status === 'new') {
                startSchedaExamSimulation(ex.id);
            } else {
                openCompletedExamDetails(ex.id);
            }
        };

        const isCompleted = ex.status === 'completed';

        let scoreHtml = '';
        let progressBarHtml = '';

        if (isCompleted) {
            scoreHtml = `
                <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-top: 4px; display: flex; justify-content: space-between;">
                    <span>Corrette: <strong style="color: #4CAF50;">${ex.correct_count}</strong></span>
                    <span>Errori: <strong style="color: #ef4444;">${ex.wrong_count}</strong></span>
                    <span>Non risposte: <strong style="color: #f59e0b;">${ex.unanswered_count}</strong></span>
                    <span>Totale: <strong>${ex.total_count}</strong></span>
                </div>
            `;
            progressBarHtml = `
                <div style="height: 6px; background-color: var(--border-card); border-radius: 3px; display: flex; overflow: hidden; margin-top: 8px;">
                    <div style="background-color: #4CAF50; width: ${(ex.correct_count / ex.total_count) * 100}%;"></div>
                    <div style="background-color: #ef4444; width: ${(ex.wrong_count / ex.total_count) * 100}%;"></div>
                    <div style="background-color: #f59e0b; width: ${(ex.unanswered_count / ex.total_count) * 100}%;"></div>
                </div>
            `;
        }

        // Circular Icon
        const circleIcon = `
            <div style="width: 60px; height: 60px; border-radius: 50%; background-color: rgba(76,175,80,0.08); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(76,175,80,0.15); flex-shrink: 0;">
                <i class="fa-solid fa-file-signature" style="color: var(--accent-green); font-size: 24px;"></i>
            </div>
        `;

        card.innerHTML = `
            ${circleIcon}
            <div style="flex: 1; min-width: 0;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">Nome: ${ex.id} ${ex.student_name}</h4>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-weight: 600;">
                    <div>Motorizzazione: ${ex.motorizzazione}</div>
                    <div style="margin-top: 2px;">Exam date: ${ex.exam_date}</div>
                </div>
                ${scoreHtml}
                ${progressBarHtml}
            </div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-secondary); font-size: 16px; margin-left: auto;"></i>
        `;
        container.appendChild(card);
    });
}

function startSchedaExamSimulation(examId) {
    showTestOptionsDialog(() => {
        const container = document.getElementById('exam-dots-container');
        if (container) {
            container.innerHTML = '';
        }

        fetch(`/api/exams/${examId}`)
            .then(res => res.json())
            .then(exam => {
                activeExamSession = exam;
                schedaExamQuestions = exam.answers; // Contains populated questions
                currentExamQuestionIndex = 0;
                examUserAnswers = {};
                examTimeLeft = 1800; // 30 minutes

                // Populate previous answers if any
                schedaExamQuestions.forEach(q => {
                    examUserAnswers[q.id] = q.user_answer;
                });

                // Start Timer
                if (schedaExamTimerInterval) clearInterval(schedaExamTimerInterval);
                schedaExamTimerInterval = setInterval(() => {
                    examTimeLeft--;
                    updateSchedaExamTimerDisplay();
                    if (examTimeLeft <= 0) {
                        clearInterval(schedaExamTimerInterval);
                        alert('সময় শেষ! আপনার পরীক্ষাটি স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।');
                        submitSchedaExam();
                    }
                }, 1000);

                updateSchedaExamTimerDisplay();
                openScreen('exam-simulation', 'Exam Simulation');
                renderSchedaExamQuestion();
            })
            .catch(err => {
                console.error("Error loading exam details: ", err);
                showToast('পরীক্ষা শুরু করতে সমস্যা হয়েছে');
            });
    });
}

function updateSchedaExamTimerDisplay() {
    const timerBadge = document.getElementById('exam-timer');
    if (!timerBadge) return;

    let minutes = Math.floor(examTimeLeft / 60);
    let seconds = examTimeLeft % 60;

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    timerBadge.innerText = `${minutes}:${seconds}`;

    // Alert colors if low time
    if (examTimeLeft < 300) {
        timerBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        timerBadge.style.color = 'var(--accent-red)';
        timerBadge.style.borderColor = 'var(--accent-red)';
    } else {
        timerBadge.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        timerBadge.style.color = 'var(--accent-green)';
        timerBadge.style.borderColor = 'var(--accent-green)';
    }
}

function renderSchedaExamQuestion() {
    if (schedaExamQuestions.length === 0) return;

    const q = schedaExamQuestions[currentExamQuestionIndex];

    // Set question number label
    const numLabel = document.getElementById('exam-question-number');
    if (numLabel) {
        numLabel.innerText = `প্রশ্ন ${currentExamQuestionIndex + 1}`;
    }

    // Set Text
    const textIt = document.getElementById('exam-question-it');
    const textBn = document.getElementById('exam-question-bn');

    if (textIt) textIt.innerHTML = highlightDictionaryTerms(q.italian, q.vocabulary);
    if (textBn) {
        textBn.innerText = q.bangla;
        textBn.style.display = isTranslationDisabled ? 'none' : 'block';
    }

    // Reset button states
    const veroBtn = document.getElementById('exam-vero-btn');
    const falsoBtn = document.getElementById('exam-falso-btn');

    if (veroBtn) {
        veroBtn.classList.remove('active');
        veroBtn.style.backgroundColor = '';
        veroBtn.style.color = '';
    }
    if (falsoBtn) {
        falsoBtn.classList.remove('active');
        falsoBtn.style.backgroundColor = '';
        falsoBtn.style.color = '';
    }

    // Highlight user selection if already made
    const selection = examUserAnswers[q.id];
    if (selection === true) {
        if (veroBtn) {
            veroBtn.classList.add('active');
            veroBtn.style.backgroundColor = '#4CAF50';
            veroBtn.style.color = 'white';
        }
    } else if (selection === false) {
        if (falsoBtn) {
            falsoBtn.classList.add('active');
            falsoBtn.style.backgroundColor = '#ef4444';
            falsoBtn.style.color = 'white';
        }
    }

    // Generate Dots grid
    renderSchedaExamDots();
}

function renderSchedaExamDots() {
    const dotsContainer = document.getElementById('exam-dots-container');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    for (let i = 0; i < schedaExamQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.innerText = i + 1;
        dot.style.cursor = 'pointer';

        const qId = schedaExamQuestions[i].id;
        const answer = examUserAnswers[qId];

        // Style states
        if (i === currentExamQuestionIndex) {
            dot.style.backgroundColor = 'var(--accent-orange)';
            dot.style.color = 'white';
            dot.style.borderColor = 'var(--accent-orange)';
            dot.style.fontWeight = 'bold';
        } else if (answer !== undefined && answer !== null) {
            dot.style.backgroundColor = 'var(--text-primary)';
            dot.style.color = 'var(--bg-card)';
            dot.style.borderColor = 'var(--text-primary)';
        } else {
            dot.style.backgroundColor = 'var(--bg-card)';
            dot.style.color = 'var(--text-primary)';
            dot.style.borderColor = 'var(--border-color)';
        }

        dot.onclick = () => {
            currentExamQuestionIndex = i;
            renderSchedaExamQuestion();
        };

        dotsContainer.appendChild(dot);
    }
}

// vocabCache: stores per-question vocabulary by word (for modal lookup)
const vocabCache = {};

function highlightDictionaryTerms(text, questionVocabulary, questionId, questionType) {
    if (!text) return '';
    let resultText = text;

    // Cache question vocabulary for popup lookup
    if (Array.isArray(questionVocabulary) && questionVocabulary.length > 0) {
        questionVocabulary.forEach(item => {
            const word = item.italian || item.word || item.italian_word || '';
            if (word) {
                vocabCache[word.toLowerCase()] = item;
            }
        });
    }

    const qIdVal = questionId ? questionId : null;
    const qTypeVal = questionType ? questionType : 'argomenti';
    const qIdArg = qIdVal ? qIdVal : 'null';
    const qTypeArg = `'${qTypeVal}'`;

    const hasExplicitUnderlines = /<u>[\s\S]*?<\/u>/i.test(resultText);

    // 1. Process <u>word</u> HTML tags first (admin-underlined terms in questions)
    if (hasExplicitUnderlines) {
        resultText = resultText.replace(/<u>([\s\S]*?)<\/u>/gi, (match, innerWord) => {
            const cleanWord = innerWord.replace(/<[^>]*>/g, '').trim();
            const lowerClean = cleanWord.toLowerCase();
            return `<span class="dict-term-link" data-qid="${qIdVal || ''}" data-qtype="${qTypeVal}" style="text-decoration: underline; color: inherit; text-decoration-color: inherit; font-weight: 700; cursor: pointer;" onclick="event.stopPropagation(); if(typeof openVocabModal === 'function' && typeof vocabCache !== 'undefined' && vocabCache['${lowerClean}']){ openVocabModal('${cleanWord.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg}); } else if(typeof openDictionaryTermModal === 'function'){ openDictionaryTermModal('${cleanWord.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg}); }">${innerWord}</span>`;
        });
        return resultText;
    }

    // 2. If NO explicit <u> tags exist, highlight per-question vocabulary words
    if (Array.isArray(questionVocabulary) && questionVocabulary.length > 0) {
        const sortedVocab = [...questionVocabulary].sort((a, b) =>
            (b.italian || '').length - (a.italian || '').length
        );
        sortedVocab.forEach(item => {
            const word = item.italian || '';
            if (!word) return;
            vocabCache[word.toLowerCase()] = item;
            const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp('\\b(' + escapedWord + ')\\b', 'i');
            resultText = resultText.replace(regex, (match) => {
                return `<span class="dict-term-link" data-qid="${qIdVal || ''}" data-qtype="${qTypeVal}" onclick="event.stopPropagation(); openVocabModal('${word.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg})">${match}</span>`;
            });
        });
    }

    // 3. Highlight global dictionary words from database
    if (typeof dictionaryData !== 'undefined' && Array.isArray(dictionaryData) && dictionaryData.length > 0) {
        const sortedTerms = [...dictionaryData].sort((a, b) => (b.word || '').length - (a.word || '').length);
        sortedTerms.forEach(term => {
            if (!term.word) return;
            const escapedWord = term.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp('\\b(' + escapedWord + ')\\b', 'i');
            resultText = resultText.replace(regex, (match) => {
                return `<span class="dict-term-link" data-qid="${qIdVal || ''}" data-qtype="${qTypeVal}" onclick="event.stopPropagation(); openDictionaryTermModal('${term.word.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg})">${match}</span>`;
            });
        });
    }

    return resultText;
}

let currentDictTerm = null;
let currentDictModalLang = 'bn';
let savedDictWords = JSON.parse(localStorage.getItem('saved_dict_words') || '[]');

function extractTargetQuestionId(elOrQId) {
    if (typeof elOrQId === 'number') return elOrQId;
    if (typeof elOrQId === 'string' && /^\d+$/.test(elOrQId.trim())) return parseInt(elOrQId.trim());

    let card = null;
    if (elOrQId && typeof elOrQId.closest === 'function') {
        card = elOrQId.closest('.detail-q-card, [id*="-card-"], [id*="argomenti-q-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="saved-card-"], [id*="wrong-card-"], [id*="correct-card-"]');
    }
    if (!card && typeof window !== 'undefined' && window.event && window.event.target) {
        card = window.event.target.closest('.detail-q-card, [id*="-card-"], [id*="argomenti-q-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="saved-card-"], [id*="wrong-card-"], [id*="correct-card-"]');
    }
    if (card) {
        if (card.getAttribute('data-qid')) return parseInt(card.getAttribute('data-qid'));
        if (card.getAttribute('data-question-id')) return parseInt(card.getAttribute('data-question-id'));
        const match = (card.id || '').match(/\d+/);
        if (match) return parseInt(match[0]);
    }
    return null;
}

function extractTargetQuestionType(elOrQId, fallbackQId) {
    if (elOrQId && typeof elOrQId === 'object' && elOrQId.getAttribute) {
        const directType = elOrQId.getAttribute('data-qtype');
        if (directType) return directType;
    }
    let card = null;
    if (elOrQId && typeof elOrQId.closest === 'function') {
        card = elOrQId.closest('.detail-q-card, [id*="-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="argomenti-q-card-"]');
    }
    if (!card && typeof window !== 'undefined' && window.event && window.event.target) {
        card = window.event.target.closest('.detail-q-card, [id*="-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="argomenti-q-card-"]');
    }
    if (card) {
        const type = card.getAttribute('data-qtype');
        if (type) return type;
        if ((card.id || '').includes('cartelli')) return 'cartelli';
    }
    const currentActive = (typeof screenHistory !== 'undefined' && screenHistory.length > 0) ? screenHistory[screenHistory.length - 1] : (typeof activeScreen !== 'undefined' ? activeScreen : '');
    if (currentActive === 'cartelli-page' || currentActive === 'cartelli' || currentActive === 'cartelli-schede') {
        return 'cartelli';
    }
    return 'argomenti';
}

function updateDictSaveIconState() {
    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (!saveBtn || !currentDictTerm) return;

    let isSaved = false;
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';
    const wordKey = currentDictTerm.word ? currentDictTerm.word.toLowerCase() : '';

    if (qId) {
        if (qType === 'cartelli') {
            const cBookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
            isSaved = cBookmarks.includes(qId) || cBookmarks.includes(String(qId)) || cBookmarks.includes(parseInt(qId));
            
            if (!isSaved && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
                isSaved = activeSavedMcqs.some(q => {
                    const type = q.type || (q.question && q.question.type);
                    const id = (q.question && q.question.id) || q.id;
                    return type === 'cartelli' && id == qId;
                });
            }
            
            if (!isSaved) {
                const cardBookmark = document.querySelector(`#cartelli-mcq-card-${qId} .fa-bookmark, #cartelli-card-${qId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${qId}"] .fa-bookmark`);
                if (cardBookmark && (cardBookmark.classList.contains('fa-solid') || (cardBookmark.style.color && cardBookmark.style.color.includes('green')))) {
                    isSaved = true;
                }
            }
        } else {
            const aBookmarks = JSON.parse(localStorage.getItem('argomenti_bookmarks') || '[]');
            isSaved = aBookmarks.includes(qId) || aBookmarks.includes(String(qId)) || aBookmarks.includes(parseInt(qId));
            
            if (!isSaved && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
                isSaved = activeSavedMcqs.some(q => {
                    const type = q.type || (q.question && q.question.type) || 'argomenti';
                    const id = (q.question && q.question.id) || q.id;
                    return type !== 'cartelli' && id == qId;
                });
            }
            
            if (!isSaved) {
                const cardBookmark = document.querySelector(`#argomenti-q-card-${qId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${qId}"] .fa-bookmark`);
                if (cardBookmark && (cardBookmark.classList.contains('fa-solid') || (cardBookmark.style.color && cardBookmark.style.color.includes('green')))) {
                    isSaved = true;
                }
            }
        }
    } else if (wordKey) {
        isSaved = savedDictWords.includes(wordKey);
    }

    if (isSaved) {
        saveBtn.className = 'fa-solid fa-bookmark';
        saveBtn.style.color = '#4CAF50';
    } else {
        saveBtn.className = 'fa-regular fa-bookmark';
        saveBtn.style.color = 'var(--text-primary, #1e293b)';
    }

    // Also update Note icon state in modal
    const noteBtn = document.getElementById('dict-modal-note-btn');
    if (noteBtn && qId) {
        const cNotes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
        const aNotes = JSON.parse(localStorage.getItem('argomenti_notes') || '{}');
        const hasNote = qType === 'cartelli'
            ? (cNotes[qId] && cNotes[qId].trim() !== '')
            : (aNotes[qId] && aNotes[qId].trim() !== '');
        noteBtn.style.color = hasNote ? '#4CAF50' : 'var(--text-primary, #1e293b)';
    }
}

function saveDictWord() {
    if (!currentDictTerm) return;
    const wordKey = currentDictTerm.word ? currentDictTerm.word.toLowerCase() : '';
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';

    if (qId) {
        const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
        const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        fetch('/api/v1/saved-mcqs/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Client-Phone': savedPhone
            },
            body: JSON.stringify({
                question_id: qId,
                type: qType,
                phone: savedPhone,
                session_id: savedSessionId
            })
        })
        .then(res => res.json())
        .then(data => {
            const isNowSaved = data.saved ?? (data.status === 'saved' || data.is_saved);
            const saveBtn = document.getElementById('dict-modal-save-btn');
            if (saveBtn) {
                saveBtn.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                saveBtn.style.color = isNowSaved ? '#4CAF50' : 'var(--text-primary, #1e293b)';
            }

            // Sync with local storage bookmarks
            const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
            let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const idx = bookmarks.indexOf(qId);
            if (isNowSaved && idx === -1) bookmarks.push(qId);
            else if (!isNowSaved && idx > -1) bookmarks.splice(idx, 1);
            localStorage.setItem(storageKey, JSON.stringify(bookmarks));

            // Sync card bookmark icons on current screen
            const selector = qType === 'cartelli'
                ? `#cartelli-mcq-card-${qId} .fa-bookmark, #cartelli-card-${qId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${qId}"] .fa-bookmark`
                : `#argomenti-q-card-${qId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${qId}"] .fa-bookmark`;

            const cardBookmarks = document.querySelectorAll(selector);
            cardBookmarks.forEach(icon => {
                icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                icon.style.color = isNowSaved ? 'var(--accent-green)' : '';
            });

            if (typeof showToast === 'function') {
                showToast(data.message || (isNowSaved ? 'প্রশ্নটি সেভ করা হয়েছে (Saved)' : 'সেভ থেকে সরানো হয়েছে (Removed)'));
            }

            // Refresh saved screen if active or reload cached saved MCQs
            if (typeof loadSavedMcqsScreen === 'function') {
                loadSavedMcqsScreen();
            }
        })
        .catch(err => {
            console.error('Error toggling save MCQ from modal:', err);
            toggleLocalDictWordSave(wordKey);
        });
    } else if (wordKey) {
        toggleLocalDictWordSave(wordKey);
    }
}

function toggleLocalDictWordSave(wordKey) {
    if (!wordKey) return;
    const index = savedDictWords.indexOf(wordKey);
    if (index > -1) {
        savedDictWords.splice(index, 1);
        if (typeof showToast === 'function') showToast('শব্দটি বুকমার্ক থেকে সরানো হয়েছে');
    } else {
        savedDictWords.push(wordKey);
        if (typeof showToast === 'function') showToast('শব্দটি বুকমার্কে সেভ করা হয়েছে');
    }
    localStorage.setItem('saved_dict_words', JSON.stringify(savedDictWords));
    updateDictSaveIconState();
}

function openDictWordNote() {
    if (!currentDictTerm || !currentDictTerm.questionId) {
        if (typeof showToast === 'function') showToast('নোট যোগ করার জন্য কোনো প্রশ্ন পাওয়া যায়নি');
        return;
    }
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';
    closeDictTermModal();
    if (typeof openNotesModal === 'function') {
        openNotesModal(null, qId, null, '', qType);
    } else if (typeof openCartelliNotesModal === 'function') {
        openCartelliNotesModal(qId);
    }
}
window.openDictWordNote = openDictWordNote;

function closeDictTermModal() {
    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function openDictionaryTermModal(wordText, elOrQId, explicitQId, explicitType) {
    const cleanWord = (wordText || '').trim();
    if (!cleanWord) return;
    const questionId = explicitQId || extractTargetQuestionId(elOrQId);
    const questionType = explicitType || extractTargetQuestionType(elOrQId, questionId);

    if (typeof vocabCache !== 'undefined' && vocabCache[cleanWord.toLowerCase()]) {
        openVocabModal(cleanWord, elOrQId, questionId, questionType);
        return;
    }

    let item = (typeof dictionaryData !== 'undefined' && Array.isArray(dictionaryData))
        ? dictionaryData.find(d => (d.word || '').toLowerCase() === cleanWord.toLowerCase())
        : null;

    if (!item) {
        fetch(`/api/v1/dizionario?search=${encodeURIComponent(cleanWord)}`)
            .then(res => res.json())
            .then(resData => {
                let termData = null;
                if (resData && resData.data && resData.data.length > 0) {
                    termData = resData.data.find(d => (d.word || '').toLowerCase() === cleanWord.toLowerCase()) || resData.data[0];
                }
                displayDictTermModal(termData || { word: cleanWord, desc_it: cleanWord, desc_bn: '' }, questionId, questionType);
            })
            .catch(err => {
                displayDictTermModal({ word: cleanWord, desc_it: cleanWord, desc_bn: '' }, questionId, questionType);
            });
        return;
    }

    displayDictTermModal(item, questionId, questionType);
}

function displayDictTermModal(item, questionId, questionType) {
    if (!item) return;

    currentDictTerm = {
        word: item.word || '',
        desc_it: item.desc_it || item.word || '',
        desc_bn: item.desc_bn || item.bn || '',
        image: item.image || '',
        video: item.video || null,
        questionId: questionId || null,
        questionType: questionType || 'argomenti'
    };
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = (item.word || '').toUpperCase();

    const imgContainer = document.getElementById('dict-modal-image-container');
    const imgEl = document.getElementById('dict-modal-image');
    if (imgEl && imgContainer) {
        if (item.image) {
            imgEl.src = item.image;
            imgContainer.style.display = 'flex';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    const videoContainer = document.getElementById('dict-modal-video-container');
    const videoEl = document.getElementById('dict-modal-video');
    if (videoContainer && videoEl) {
        if (item.video) {
            videoEl.src = item.video;
            videoContainer.style.display = 'flex';
        } else {
            videoContainer.style.display = 'none';
        }
    }

    const textItEl = document.getElementById('dict-modal-text-it');
    if (textItEl) textItEl.innerText = item.desc_it || item.word || '';

    const textBnEl = document.getElementById('dict-modal-text-bn');
    if (textBnEl) {
        textBnEl.innerText = item.desc_bn || item.bn || '';
        textBnEl.style.display = 'block';
    }

    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (saveBtn) saveBtn.style.display = 'block';

    updateDictSaveIconState();

    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'flex';
}

function openVocabModal(wordText, elOrQId, explicitQId, explicitType) {
    const item = vocabCache ? vocabCache[wordText.toLowerCase()] : null;
    const questionId = explicitQId || extractTargetQuestionId(elOrQId);
    const questionType = explicitType || extractTargetQuestionType(elOrQId, questionId);

    if (!item) {
        openDictionaryTermModal(wordText, elOrQId, questionId, questionType);
        return;
    }

    currentDictTerm = {
        word: item.italian || wordText,
        desc_it: item.italian || wordText,
        desc_bn: item.bangla || '',
        image: item.image || '',
        questionId: questionId || null,
        questionType: questionType || 'argomenti'
    };
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = (item.italian || wordText).toUpperCase();

    const imgContainer = document.getElementById('dict-modal-image-container');
    const imgEl = document.getElementById('dict-modal-image');
    if (imgEl && imgContainer) {
        if (item.image) {
            imgEl.src = item.image;
            imgContainer.style.display = 'flex';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    const videoContainer = document.getElementById('dict-modal-video-container');
    if (videoContainer) videoContainer.style.display = 'none';

    const textItEl = document.getElementById('dict-modal-text-it');
    if (textItEl) textItEl.innerText = item.italian || wordText || '';

    const textBnEl = document.getElementById('dict-modal-text-bn');
    if (textBnEl) {
        textBnEl.innerText = item.bangla || '';
        textBnEl.style.display = 'block';
    }

    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (saveBtn) saveBtn.style.display = 'block';

    updateDictSaveIconState();

    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'flex';
}

function answerSchedaExamQuestion(choice) {
    if (schedaExamQuestions.length === 0) return;

    const q = schedaExamQuestions[currentExamQuestionIndex];
    examUserAnswers[q.id] = choice;

    // Trigger visual updates immediately
    renderSchedaExamQuestion();

    // Auto-advance after a brief delay
    setTimeout(() => {
        if (currentExamQuestionIndex < schedaExamQuestions.length - 1) {
            currentExamQuestionIndex++;
            renderSchedaExamQuestion();
        }
    }, 200);
}

function prevSchedaExamQuestion() {
    if (currentExamQuestionIndex > 0) {
        currentExamQuestionIndex--;
        renderSchedaExamQuestion();
    }
}

function nextSchedaExamQuestion() {
    if (currentExamQuestionIndex < schedaExamQuestions.length - 1) {
        currentExamQuestionIndex++;
        renderSchedaExamQuestion();
    }
}

function submitSchedaExam() {
    if (!activeExamSession) return;
    if (examTimeLeft > 0) {
        if (!confirm('আপনি কি নিশ্চিতভাবে খাতা জমা দিতে চান?')) {
            return;
        }
    }

    if (schedaExamTimerInterval) clearInterval(schedaExamTimerInterval);

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    fetch(`/api/exams/${activeExamSession.id}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({ answers: examUserAnswers })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error);
                openScreen('scheda-esame', 'Scheda Esame');
                return;
            }

            // Show result popup modal
            showSchedaExamResultModal(data.correct, data.wrong, data.unanswered, data.total);
        })
        .catch(err => {
            console.error("Error submitting exam: ", err);
            showToast('খাতা জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            openScreen('scheda-esame', 'Scheda Esame');
        });
}

function showSchedaExamResultModal(correct, wrong, unanswered, total) {
    const passed = wrong <= 4;

    const txtGiusto = document.getElementById('txt-giusto');
    const txtSbagliato = document.getElementById('txt-sbagliato');
    const txtNondate = document.getElementById('txt-nondate');
    const barGiusto = document.getElementById('bar-giusto');
    const barSbagliato = document.getElementById('bar-sbagliato');
    const barNondate = document.getElementById('bar-nondate');
    const resultEmoji = document.getElementById('test-result-emoji');

    if (txtGiusto) txtGiusto.innerText = correct;
    if (txtSbagliato) txtSbagliato.innerText = wrong;
    if (txtNondate) txtNondate.innerText = unanswered;

    if (barGiusto) barGiusto.style.width = `${total > 0 ? (correct / total) * 100 : 0}%`;
    if (barSbagliato) barSbagliato.style.width = `${total > 0 ? (wrong / total) * 100 : 0}%`;
    if (barNondate) barNondate.style.width = `${total > 0 ? (unanswered / total) * 100 : 0}%`;

    if (resultEmoji) resultEmoji.innerText = passed ? '😊' : '😢';

    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'flex';
}
