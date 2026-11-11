// ==========================================================================
// MBanglaPatente - Scheda Esame (Passed Sheets) & Scheda Live Exam (PDF)
// ==========================================================================

// Global state for Scheda Esame (Student Passed Sheets)
let allSchedaPassedExams = [];
let activePassedExamDetail = null;
let selectedQuestionIds = new Set();

// Global state for Interactive 30-MCQ Quiz Simulator (inside Scheda Esame)
let activeSchedaQuizQuestions = [];
let currentSchedaQuestionIndex = 0;
let schedaUserAnswers = {}; // question_id => true / false / null
let schedaTimerInterval = null;
let schedaTimeLeft = 1800; // 30 minutes

// Global state for Scheda Live Exam (Official Admin PDF Sheets)
let allLivePassedExams = [];
let currentLiveExamTab = 'completato';

// --------------------------------------------------------------------------
// 1. SCHEDA ESAME (PASSED SHEETS BY STUDENTS)
// --------------------------------------------------------------------------

function showSchedaInfoModal() {
    const modal = document.getElementById('scheda-info-modal');
    if (modal) modal.style.display = 'flex';
}

function closeSchedaInfoModal() {
    const modal = document.getElementById('scheda-info-modal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('scheda_info_seen', 'true');
}

/**
 * Loads student passed exams where correct >= 27
 */
function loadSchedaEsameModule() {
    const container = document.getElementById('scheda-esame-cards-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px; color: #10b981;"></i><br>Caricamento schede esame superati...</div>`;
    }

    // Ensure we start on the list view
    const listView = document.getElementById('scheda-esame-list-view');
    const sheetView = document.getElementById('scheda-candidate-sheet-view');
    const quizView = document.getElementById('scheda-quiz-view');
    if (listView) listView.style.display = 'block';
    if (sheetView) sheetView.style.display = 'none';
    if (quizView) quizView.style.display = 'none';

    fetch('/api/v1/scheda-esame/passed-list?_t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
            const list = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
            allSchedaPassedExams = list;
            renderSchedaEsameCards();
        })
        .catch(err => {
            console.warn("Scheda esame fetch error, trying fallback /api/exams:", err);
            fetch('/api/exams?_t=' + Date.now(), { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    const fallbackList = Array.isArray(data) ? data : (data.data || []);
                    allSchedaPassedExams = fallbackList.filter(ex => (ex.correct_count ?? 27) >= 27 || ex.is_passed);
                    renderSchedaEsameCards();
                })
                .catch(err2 => {
                    console.error("Error loading passed exams:", err2);
                    if (container) {
                        container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento delle schede.</div>`;
                    }
                });
        });
}

function filterSchedaEsameCards() {
    renderSchedaEsameCards();
}

/**
 * Render exam cards matching Mobile App Screenshot 2
 */
function renderSchedaEsameCards() {
    const container = document.getElementById('scheda-esame-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('scheda-esame-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allSchedaPassedExams.filter(ex => {
        if (!searchVal) return true;
        const name = (ex.student_name || ex.nome || '').toLowerCase();
        const moto = (ex.motorizzazione || '').toLowerCase();
        const idStr = String(ex.id || '').toLowerCase();
        const dateStr = (ex.exam_date || '').toLowerCase();
        return name.includes(searchVal) || moto.includes(searchVal) || idStr.includes(searchVal) || dateStr.includes(searchVal);
    });

    if (filtered.length === 0) {
        const emptyMsg = searchVal
            ? `<div style="padding: 24px; font-size: 14px; font-weight: 700; color: #64748b;">Nessuna scheda trovata per "${searchVal}".</div>`
            : `
            <div style="padding: 24px 16px;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #ECFDF5; border: 2px dashed #10B981; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: #10B981; font-size: 26px;">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">
                    কোনো পাস করা শিট পাওয়া যায়নি
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #64748b; line-height: 1.5; max-width: 380px; margin: 0 auto 18px auto;">
                    শিক্ষার্থীরা পরীক্ষা দিয়ে ২৭ বা তার বেশি সঠিক উত্তর পেলে স্বয়ংক্রিয়ভাবে তাদের শিট এখানে যুক্ত হবে।
                </div>
                <button type="button" onclick="startNewSchedaExamSimulation()" style="background: #10B981; color: #ffffff; border: none; padding: 10px 22px; border-radius: 20px; font-weight: 800; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                    <i class="fa-solid fa-play"></i> এখন পরীক্ষা দিন
                </button>
            </div>
            `;
        container.innerHTML = `<div style="text-align: center; background: #ffffff; border-radius: 20px; border: 1.5px solid #e2e8f0;">${emptyMsg}</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'scheda-exam-card';

        const displayName = ex.student_name || ex.nome || 'Candidato';
        const displayMoto = ex.motorizzazione || 'Motorizzazione Civile';
        const displayDate = ex.exam_date || 'N/A';

        const correct = ex.correct_count ?? (ex.corrette ?? 27);
        const wrong = ex.wrong_count ?? (ex.errori ?? 0);
        const unanswered = ex.unanswered_count ?? (ex.non_risposte ?? 0);
        const total = ex.total_count ?? (ex.totale ?? 30);

        const correctPercent = Math.min(100, Math.max(0, (correct / total) * 100));
        const wrongPercent = Math.min(100, Math.max(0, (wrong / total) * 100));
        const unansweredPercent = Math.min(100, Math.max(0, (unanswered / total) * 100));

        // On Click: Open Candidate Passed Exam Sheet
        card.onclick = () => {
            openCandidatePassedSheet(ex.id);
        };

        const avatarUrl = ex.avatar || '/images/avatar-candidate.png';

        card.innerHTML = `
            <!-- Left: Candidate Profile Avatar with Green Verified Badge -->
            <div style="position: relative; width: 68px; height: 68px; min-width: 68px; min-height: 68px; flex-shrink: 0;">
                <div style="width: 68px; height: 68px; border-radius: 50%; overflow: hidden; border: 2.5px solid #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25); background: #f0fdf4; display: flex; align-items: center; justify-content: center;">
                    <img src="${avatarUrl}" alt="${displayName}" onerror="this.onerror=null; this.src='/images/avatar-candidate.png';" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="position: absolute; bottom: 0; right: 0; width: 22px; height: 22px; background: #22c55e; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                    <i class="fa-solid fa-check"></i>
                </div>
            </div>

            <!-- Center: Candidate Details + Stats + Progress Bar Capsule -->
            <div style="min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 16.5px; font-weight: 700; color: #1e293b; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    Nome: ${displayName}
                </div>
                <div style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.35;">
                    Motorizzazione: ${displayMoto}
                </div>
                <div style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.35;">
                    Exam date: ${displayDate}
                </div>
                <div style="font-size: 11.5px; font-weight: 500; color: #64748b; margin-top: 4px; line-height: 1.3; display: flex; gap: 8px; flex-wrap: wrap;">
                    <span>Corrette: ${correct}</span>
                    <span>Errori: ${wrong}</span>
                    <span>Non risposte: ${unanswered}</span>
                    <span>Totale: ${total}</span>
                </div>

                <!-- Progress Bar Capsule (Green for Corrette + Red for Errori) -->
                <div style="height: 11px; width: 100%; max-width: 440px; background-color: #cbd5e1; border-radius: 9999px; display: flex; overflow: hidden; margin-top: 6px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);">
                    <div style="background-color: #22c55e; width: ${correctPercent}%; height: 100%; transition: width 0.3s ease;"></div>
                    <div style="background-color: #ef4444; width: ${wrongPercent}%; height: 100%; transition: width 0.3s ease;"></div>
                    <div style="background-color: #f59e0b; width: ${unansweredPercent}%; height: 100%; transition: width 0.3s ease;"></div>
                </div>
            </div>

            <!-- Right: Chevron -->
            <div style="flex-shrink: 0; display: flex; align-items: center; padding-left: 4px;">
                <i class="fa-solid fa-chevron-right" style="color: #1e293b; font-size: 20px; font-weight: 900;"></i>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Start a fresh 30-MCQ Exam Simulation
 */
function startNewSchedaExamSimulation() {
    if (typeof openScreen === 'function') {
        openScreen('test', 'Test Simulator');
    }
}

/**
 * Open Candidate Passed Exam Sheet (Matching Screenshot 3)
 */
function openCandidatePassedSheet(examId) {
    const listView = document.getElementById('scheda-esame-list-view');
    const sheetView = document.getElementById('scheda-candidate-sheet-view');
    const quizView = document.getElementById('scheda-quiz-view');

    if (listView) listView.style.display = 'none';
    if (quizView) quizView.style.display = 'none';
    if (sheetView) sheetView.style.display = 'block';

    const headerName = document.getElementById('scheda-candidate-name-header');
    const centerDate = document.getElementById('scheda-candidate-center-date');
    const scoreText = document.getElementById('scheda-candidate-score-text');
    const questionsContainer = document.getElementById('scheda-candidate-questions-list');

    if (headerName) headerName.innerText = 'Caricamento...';
    if (questionsContainer) {
        questionsContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #10B981; margin-bottom: 8px;"></i><br>Caricamento domande della scheda...</div>`;
    }

    fetch(`/api/v1/scheda-esame/sheet/${examId}?_t=` + Date.now())
        .then(res => res.json())
        .then(data => {
            const exam = data.data || data;
            activePassedExamDetail = exam;
            selectedQuestionIds = new Set();

            const studentName = exam.student_name || exam.nome || 'Candidato';
            const moto = exam.motorizzazione || 'Motorizzazione Civile';
            const dateStr = exam.exam_date || 'N/A';
            const correct = exam.correct_count ?? (exam.corrette ?? 27);
            const total = exam.total_count ?? (exam.totale ?? 30);

            if (headerName) headerName.innerText = studentName;
            if (centerDate) centerDate.innerText = `${moto} • ${dateStr}`;
            if (scoreText) scoreText.innerText = `Punteggio: ${correct}/${total} Corrette (IDONEO)`;

            const questions = exam.answers || [];
            // By default select all
            questions.forEach(q => selectedQuestionIds.add(q.id));

            renderCandidateQuestionsList(questions);
        })
        .catch(err => {
            console.error("Error loading candidate exam details:", err);
            if (questionsContainer) {
                questionsContainer.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">Errore durante il caricamento delle domande.</div>`;
            }
        });
}

function backToSchedaEsameList() {
    const listView = document.getElementById('scheda-esame-list-view');
    const sheetView = document.getElementById('scheda-candidate-sheet-view');
    const quizView = document.getElementById('scheda-quiz-view');

    if (sheetView) sheetView.style.display = 'none';
    if (quizView) quizView.style.display = 'none';
    if (listView) listView.style.display = 'block';
}

function renderCandidateQuestionsList(questions) {
    const container = document.getElementById('scheda-candidate-questions-list');
    if (!container) return;
    container.innerHTML = '';

    if (!questions || questions.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 30px; font-weight: 600;">Nessun quesito disponibile per questa scheda.</div>`;
        return;
    }

    questions.forEach((q, idx) => {
        const isSelected = selectedQuestionIds.has(q.id);
        const card = document.createElement('div');
        card.style.backgroundColor = '#ffffff';
        card.style.border = isSelected ? '1.5px solid #10B981' : '1.5px solid #e2e8f0';
        card.style.borderRadius = '16px';
        card.style.padding = '14px 16px';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
        card.style.display = 'flex';
        card.style.gap = '14px';
        card.style.alignItems = 'flex-start';
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.15s ease';

        card.onclick = (e) => {
            if (e.target.tagName.toLowerCase() !== 'input') {
                const cb = card.querySelector('input[type="checkbox"]');
                if (cb) {
                    cb.checked = !cb.checked;
                    handleQuestionCheckboxChange(q.id, cb.checked);
                }
            }
        };

        const itText = q.italian || q.domanda || 'Domanda senza testo';
        const bnText = q.bangla || '';
        const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

        card.innerHTML = `
            <div style="padding-top: 2px;">
                <input type="checkbox" id="q_cb_${q.id}" ${isSelected ? 'checked' : ''} onchange="handleQuestionCheckboxChange(${q.id}, this.checked)" style="width: 20px; height: 20px; accent-color: #10B981; cursor: pointer;">
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 14px; font-weight: 800; color: #10B981;">Quesito ${idx + 1}</span>
                    <span style="font-size: 11.5px; font-weight: 800; padding: 2px 8px; border-radius: 8px; background: ${isVero ? '#ECFDF5' : '#FEF2F2'}; color: ${isVero ? '#059669' : '#DC2626'};">
                        Risposta: ${isVero ? 'VERO' : 'FALSO'}
                    </span>
                </div>
                <div style="font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.45; margin-bottom: 6px;">
                    ${itText}
                </div>
                ${bnText ? `<div style="font-size: 13.5px; font-weight: 600; color: #2563EB; background: #EFF6FF; padding: 6px 10px; border-radius: 8px; line-height: 1.4;">${bnText}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function handleQuestionCheckboxChange(qId, checked) {
    if (checked) {
        selectedQuestionIds.add(qId);
    } else {
        selectedQuestionIds.delete(qId);
    }
    const card = document.getElementById(`q_cb_${qId}`)?.closest('div[style*="border:"]');
    if (card) {
        card.style.border = checked ? '1.5px solid #10B981' : '1.5px solid #e2e8f0';
    }
}

function selectAllSchedaQuestions() {
    if (!activePassedExamDetail || !activePassedExamDetail.answers) return;
    activePassedExamDetail.answers.forEach(q => selectedQuestionIds.add(q.id));
    renderCandidateQuestionsList(activePassedExamDetail.answers);
}

function unselectAllSchedaQuestions() {
    selectedQuestionIds.clear();
    if (activePassedExamDetail && activePassedExamDetail.answers) {
        renderCandidateQuestionsList(activePassedExamDetail.answers);
    }
}

function toggleSelectSchedaQuestions() {
    if (!activePassedExamDetail || !activePassedExamDetail.answers) return;
    activePassedExamDetail.answers.forEach(q => {
        if (selectedQuestionIds.has(q.id)) {
            selectedQuestionIds.delete(q.id);
        } else {
            selectedQuestionIds.add(q.id);
        }
    });
    renderCandidateQuestionsList(activePassedExamDetail.answers);
}

/**
 * Launches the 30-MCQ Quiz Simulator with the selected questions
 */
function startSchedaQuizFromSelection() {
    if (!activePassedExamDetail || !activePassedExamDetail.answers) return;
    const allQuestions = activePassedExamDetail.answers;
    const selected = allQuestions.filter(q => selectedQuestionIds.has(q.id));

    if (selected.length === 0) {
        alert('Seleziona almeno un quesito per avviare il quiz.');
        return;
    }

    activeSchedaQuizQuestions = selected;
    currentSchedaQuestionIndex = 0;
    schedaUserAnswers = {};

    const sheetView = document.getElementById('scheda-candidate-sheet-view');
    const quizView = document.getElementById('scheda-quiz-view');
    if (sheetView) sheetView.style.display = 'none';
    if (quizView) quizView.style.display = 'block';

    const titleEl = document.getElementById('scheda-quiz-title');
    if (titleEl) {
        titleEl.innerText = `${activePassedExamDetail.student_name || 'Scheda Esame'} (${selected.length} Quesiti)`;
    }

    renderSchedaCurrentQuestion();
    startSchedaTimer();
}

function exitSchedaQuizView() {
    clearInterval(schedaTimerInterval);
    const quizView = document.getElementById('scheda-quiz-view');
    const sheetView = document.getElementById('scheda-candidate-sheet-view');
    if (quizView) quizView.style.display = 'none';
    if (sheetView) sheetView.style.display = 'block';
}

function setSchedaQuestionRange(startNum) {
    currentSchedaQuestionIndex = startNum - 1;

    const t1 = document.getElementById('scheda-tab-group-1');
    const t2 = document.getElementById('scheda-tab-group-2');
    const t3 = document.getElementById('scheda-tab-group-3');

    if (t1) { t1.style.color = startNum === 1 ? '#dc2626' : '#64748b'; t1.style.background = startNum === 1 ? '#ffffff' : 'transparent'; }
    if (t2) { t2.style.color = startNum === 11 ? '#dc2626' : '#64748b'; t2.style.background = startNum === 11 ? '#ffffff' : 'transparent'; }
    if (t3) { t3.style.color = startNum === 21 ? '#dc2626' : '#64748b'; t3.style.background = startNum === 21 ? '#ffffff' : 'transparent'; }

    renderSchedaCurrentQuestion();
}

function renderSchedaCurrentQuestion() {
    if (!activeSchedaQuizQuestions || activeSchedaQuizQuestions.length === 0) return;

    if (currentSchedaQuestionIndex < 0) currentSchedaQuestionIndex = 0;
    if (currentSchedaQuestionIndex >= activeSchedaQuizQuestions.length) currentSchedaQuestionIndex = activeSchedaQuizQuestions.length - 1;

    const q = activeSchedaQuizQuestions[currentSchedaQuestionIndex];

    // Render 1..30 Number Pills
    const pillsBar = document.getElementById('scheda-question-pills-bar');
    if (pillsBar) {
        pillsBar.innerHTML = '';
        activeSchedaQuizQuestions.forEach((item, idx) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.innerText = idx + 1;
            pill.style.minWidth = '34px';
            pill.style.height = '34px';
            pill.style.borderRadius = '50%';
            pill.style.border = 'none';
            pill.style.fontWeight = '800';
            pill.style.fontSize = '12px';
            pill.style.cursor = 'pointer';
            pill.style.flexShrink = '0';
            pill.style.transition = 'all 0.15s ease';

            const ans = schedaUserAnswers[item.id];
            if (idx === currentSchedaQuestionIndex) {
                pill.style.border = '2.5px solid #2563eb';
                pill.style.boxShadow = '0 0 8px rgba(37,99,235,0.4)';
            }

            if (ans === true || ans === false) {
                pill.style.backgroundColor = '#22c55e';
                pill.style.color = '#ffffff';
            } else {
                pill.style.backgroundColor = '#e2e8f0';
                pill.style.color = '#475569';
            }

            pill.onclick = () => {
                currentSchedaQuestionIndex = idx;
                renderSchedaCurrentQuestion();
            };
            pillsBar.appendChild(pill);
        });
    }

    // Question Image
    const imgBox = document.getElementById('scheda-quiz-img-container');
    const imgEl = document.getElementById('scheda-quiz-img');
    if (imgBox && imgEl) {
        if (q.image) {
            imgEl.src = q.image;
            imgBox.style.display = 'block';
        } else {
            imgBox.style.display = 'none';
        }
    }

    // Italian text with interactive word clicks
    const textEl = document.getElementById('scheda-quiz-question-text');
    if (textEl) {
        const rawText = q.italian || '';
        const words = rawText.split(/\s+/);
        const linkedHtml = words.map(w => {
            const cleanWord = w.replace(/[^a-zA-ZàèéìòùÀÈÉÌÒÙ]/g, '');
            if (cleanWord.length > 2) {
                return `<span onclick="onSchedaWordClick('${cleanWord}')" style="cursor: pointer; text-decoration: underline; text-decoration-color: #93c5fd; text-underline-offset: 3px;">${w}</span>`;
            }
            return w;
        }).join(' ');

        textEl.innerHTML = `<span style="color: #dc2626; font-weight: 800; margin-right: 6px;">${currentSchedaQuestionIndex + 1}.</span> ` + linkedHtml;
    }

    // Bengali Translation
    const bnEl = document.getElementById('scheda-quiz-question-bn');
    if (bnEl) {
        bnEl.innerText = q.bangla || 'অনুবাদ লোড হচ্ছে...';
    }

    // Highlight VERO / FALSO buttons if answered
    const currentAns = schedaUserAnswers[q.id];
    const btnVero = document.getElementById('scheda-btn-vero');
    const btnFalso = document.getElementById('scheda-btn-falso');

    if (btnVero) {
        if (currentAns === true) {
            btnVero.style.backgroundColor = '#22c55e';
            btnVero.style.color = '#ffffff';
        } else {
            btnVero.style.backgroundColor = '#f0fdf4';
            btnVero.style.color = '#15803d';
        }
    }

    if (btnFalso) {
        if (currentAns === false) {
            btnFalso.style.backgroundColor = '#ef4444';
            btnFalso.style.color = '#ffffff';
        } else {
            btnFalso.style.backgroundColor = '#fef2f2';
            btnFalso.style.color = '#b91c1c';
        }
    }
}

function selectSchedaAnswer(isVero) {
    if (!activeSchedaQuizQuestions || activeSchedaQuizQuestions.length === 0) return;
    const q = activeSchedaQuizQuestions[currentSchedaQuestionIndex];
    if (!q) return;

    schedaUserAnswers[q.id] = isVero;
    renderSchedaCurrentQuestion();

    // Auto advance after 350ms
    setTimeout(() => {
        if (currentSchedaQuestionIndex < activeSchedaQuizQuestions.length - 1) {
            currentSchedaQuestionIndex++;
            renderSchedaCurrentQuestion();
        }
    }, 350);
}

function prevSchedaQuestion() {
    if (currentSchedaQuestionIndex > 0) {
        currentSchedaQuestionIndex--;
        renderSchedaCurrentQuestion();
    }
}

function nextSchedaQuestion() {
    if (currentSchedaQuestionIndex < activeSchedaQuizQuestions.length - 1) {
        currentSchedaQuestionIndex++;
        renderSchedaCurrentQuestion();
    }
}

function startSchedaTimer() {
    clearInterval(schedaTimerInterval);
    schedaTimeLeft = 1800; // 30 minutes
    updateSchedaTimerDisplay();

    schedaTimerInterval = setInterval(() => {
        schedaTimeLeft--;
        if (schedaTimeLeft <= 0) {
            clearInterval(schedaTimerInterval);
            submitSchedaQuiz();
        } else {
            updateSchedaTimerDisplay();
        }
    }, 1000);
}

function updateSchedaTimerDisplay() {
    const timerEl = document.getElementById('scheda-quiz-timer');
    if (!timerEl) return;
    const mins = Math.floor(schedaTimeLeft / 60);
    const secs = schedaTimeLeft % 60;
    timerEl.innerText = `⏱ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function submitSchedaQuiz() {
    clearInterval(schedaTimerInterval);
    if (!activeSchedaQuizQuestions || activeSchedaQuizQuestions.length === 0) return;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    activeSchedaQuizQuestions.forEach(q => {
        const userAns = schedaUserAnswers[q.id];
        const correctAns = (q.is_vero === 1 || q.is_vero === true || q.is_vero === '1');

        if (userAns === undefined || userAns === null) {
            unansweredCount++;
        } else if (userAns === correctAns) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    const isPassed = correctCount >= 27;

    const msg = isPassed
        ? `🎉 Complimenti! IDONEO (PROMOSSO)\nRisposte corrette: ${correctCount}/${activeSchedaQuizQuestions.length}\nErrori: ${wrongCount}\nNon risposte: ${unansweredCount}`
        : `❌ NON IDONEO (BOCCIATO)\nRisposte corrette: ${correctCount}/${activeSchedaQuizQuestions.length}\nErrori: ${wrongCount}\nNon risposte: ${unansweredCount}\n(Minimo 27 risposte corrette richieste)`;

    alert(msg);
    exitSchedaQuizView();
}

function onSchedaWordClick(word) {
    if (typeof searchDictionaryWord === 'function') {
        searchDictionaryWord(word);
    }
}

// --------------------------------------------------------------------------
// 2. SCHEDA LIVE EXAM (OFFICIAL MOTORIZZAZIONE PDF SHEETS)
// --------------------------------------------------------------------------

function switchLiveExamTab(tab) {
    currentLiveExamTab = tab;
    const tabNuove = document.getElementById('tab-live-nuove');
    const tabComp = document.getElementById('tab-live-completato');
    if (tabNuove && tabComp) {
        if (tab === 'completato') {
            tabComp.style.color = '#ffffff';
            tabComp.style.borderBottom = '3px solid #6366F1';
            tabNuove.style.color = 'rgba(255,255,255,0.75)';
            tabNuove.style.borderBottom = '3px solid transparent';
        } else {
            tabNuove.style.color = '#ffffff';
            tabNuove.style.borderBottom = '3px solid #6366F1';
            tabComp.style.color = 'rgba(255,255,255,0.75)';
            tabComp.style.borderBottom = '3px solid transparent';
        }
    }
    loadSchedaLiveExamModule();
}

function filterLiveExamCards() {
    renderLiveExamCards();
}

/**
 * Loads official live exam records uploaded via Admin Panel
 */
function loadSchedaLiveExamModule() {
    const container = document.getElementById('scheda-live-cards-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px; color: #10B981;"></i><br>Caricamento schede live ufficiali (PDF)...</div>`;
    }

    fetch(`/api/v1/live-passed-exams?status=${encodeURIComponent(currentLiveExamTab)}&_t=` + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
            const list = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
            allLivePassedExams = list;
            renderLiveExamCards();
        })
        .catch(err => {
            console.error("Error loading official live passed exams:", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">Errore durante il caricamento dei risultati live.</div>`;
            }
        });
}

/**
 * Render official live exam cards
 * CRITICAL: Clicking any candidate card ONLY OPENS/SHOWS THE UPLOADED PDF FILE! (NO MCQ SIMULATION!)
 */
function renderLiveExamCards() {
    const container = document.getElementById('scheda-live-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('scheda-live-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allLivePassedExams.filter(ex => {
        if (!searchVal) return true;
        const name = (ex.nome || ex.student_name || '').toLowerCase();
        const moto = (ex.motorizzazione || '').toLowerCase();
        const idStr = String(ex.id || '').toLowerCase();
        const dateStr = (ex.exam_date || '').toLowerCase();
        return name.includes(searchVal) || moto.includes(searchVal) || idStr.includes(searchVal) || dateStr.includes(searchVal);
    });

    if (filtered.length === 0) {
        const emptyMsg = searchVal
            ? `<div style="padding: 24px; font-size: 14px; font-weight: 700; color: #64748b;">Nessuna scheda trovata per "${searchVal}".</div>`
            : `
            <div style="padding: 24px 16px;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #FEE2E2; border: 2px dashed #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: #EF4444; font-size: 26px;">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">
                    কোনো অফিশিয়াল লাইভ পরীক্ষার PDF শিট পাওয়া যায়নি
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #64748b; line-height: 1.5; max-width: 400px; margin: 0 auto;">
                    ${currentLiveExamTab === 'nuove' ? 'বর্তমানে কোনো নতুন পরীক্ষা শিডিউল করা নেই।' : 'অ্যাডমিন প্যানেল থেকে শিক্ষার্থীদের লাইভ পরীক্ষার রেজাল্ট ও PDF শিট আপলোড করার সাথে সাথে এখানে প্রদর্শিত হবে।'}
                </div>
            </div>
            `;
        container.innerHTML = `<div style="text-align: center; background: #ffffff; border-radius: 20px; border: 1.5px solid #e2e8f0;">${emptyMsg}</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'scheda-exam-card';

        const displayName = ex.nome || ex.student_name || 'Candidato';
        const displayMoto = ex.motorizzazione || 'Motorizzazione Civile';
        const displayDate = ex.exam_date || 'N/A';
        const correct = ex.corrette ?? 28;
        const errors = ex.errori ?? 2;
        const nonRisposte = ex.non_risposte ?? 0;
        const total = ex.totale || (correct + errors + nonRisposte) || 30;

        const correctPercent = Math.min(100, Math.max(0, (correct / total) * 100));
        const errorPercent = Math.min(100, Math.max(0, (errors / total) * 100));
        const nonRispostePercent = Math.min(100, Math.max(0, (nonRisposte / total) * 100));

        // CRITICAL: On click ONLY open the PDF!
        card.onclick = () => {
            openLiveExamPdf(ex.pdf_url, displayName, displayMoto);
        };

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1;">
                <!-- Circular Quiz Exam Icon (Matching mobile app screenshot) -->
                <div class="scheda-exam-icon-box" style="width: 70px; height: 70px; min-width: 70px; min-height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(14, 116, 144, 0.25);">
                    <img src="/images/scheda-exam-icon.svg" alt="Exam Sheet" style="width: 100%; height: 100%; object-fit: contain;">
                </div>

                <!-- Candidate Info + Dynamic Progress Bar -->
                <div style="min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-size: 16.5px; font-weight: 700; color: #1e293b; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        Nome: ${displayName}
                    </div>
                    <div style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.35;">
                        Motorizzazione: ${displayMoto}
                    </div>
                    <div style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.35;">
                        Exam date: ${displayDate}
                    </div>
                    <div style="font-size: 11.5px; font-weight: 500; color: #64748b; margin-top: 4px; line-height: 1.3; display: flex; gap: 8px; flex-wrap: wrap;">
                        <span>Corrette: ${correct}</span>
                        <span>Errori: ${errors}</span>
                        <span>Non risposte: ${nonRisposte}</span>
                        <span>Totale: ${total}</span>
                    </div>

                    <!-- Progress Bar Capsule (Green for Corrette + Red for Errori) -->
                    <div style="height: 11px; width: 100%; max-width: 440px; background-color: #cbd5e1; border-radius: 9999px; display: flex; overflow: hidden; margin-top: 6px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);">
                        <div style="background-color: #22c55e; width: ${correctPercent}%; height: 100%; transition: width 0.3s ease;"></div>
                        <div style="background-color: #ef4444; width: ${errorPercent}%; height: 100%; transition: width 0.3s ease;"></div>
                        <div style="background-color: #f59e0b; width: ${nonRispostePercent}%; height: 100%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>

            <!-- Right: Chevron & Action -->
            <div style="flex-shrink: 0; display: flex; align-items: center; gap: 10px;">
                <div class="hide-on-mobile" style="background: #ef4444; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(239,68,68,0.25);">
                    <i class="fa-solid fa-file-pdf"></i> Visualizza PDF
                </div>
                <i class="fa-solid fa-chevron-right" style="color: #1e293b; font-size: 20px; font-weight: 900; margin-left: 2px;"></i>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Opens official PDF in responsive modal or new tab
 */
function openLiveExamPdf(pdfUrl, candidateName, moto) {
    if (!pdfUrl) {
        alert('Nessun file PDF allegato dall\'amministratore per questo esame.');
        return;
    }

    const modal = document.getElementById('live-exam-pdf-modal');
    const frame = document.getElementById('live-exam-pdf-frame');
    const title = document.getElementById('pdf-modal-title');
    const sub = document.getElementById('pdf-modal-sub');
    const extLink = document.getElementById('pdf-modal-external-link');

    if (modal && frame) {
        if (title) title.innerText = `Scheda Esame PDF - ${candidateName || 'Candidato'}`;
        if (sub) sub.innerText = moto || 'Motorizzazione Civile';
        if (extLink) extLink.href = pdfUrl;
        frame.src = pdfUrl;

        // Hide floating navigation dock and header while PDF is viewing
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) bottomNav.style.setProperty('display', 'none', 'important');
        const appHeader = document.querySelector('.app-header');
        if (appHeader) appHeader.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = 'hidden';

        modal.style.display = 'flex';
    } else {
        window.open(pdfUrl, '_blank');
    }
}

function closeLiveExamPdfModal() {
    const modal = document.getElementById('live-exam-pdf-modal');
    const frame = document.getElementById('live-exam-pdf-frame');
    if (modal) modal.style.display = 'none';
    if (frame) frame.src = '';

    // Restore bottom navigation dock and header
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.removeProperty('display');
    const appHeader = document.querySelector('.app-header');
    if (appHeader) appHeader.style.removeProperty('display');
    document.body.style.overflow = '';
}

// Global escape listener for PDF modal
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('live-exam-pdf-modal');
        if (modal && modal.style.display === 'flex') {
            closeLiveExamPdfModal();
        }
    }
});

