// ==========================================
// Scheda Esame (Passed Exam Sheets & 30-MCQ Quiz)
// ==========================================

let allSchedaExamsData = [];
let activeSchedaExamObj = null;
let currentSchedaQuestionIndex = 0;
let schedaUserAnswers = {}; // question_id => true / false / null
let schedaTimerInterval = null;
let schedaTimeLeft = 1800; // 30 minutes

function showSchedaInfoModal() {
    const modal = document.getElementById('scheda-info-modal');
    if (modal) modal.style.display = 'flex';
}

function closeSchedaInfoModal() {
    const modal = document.getElementById('scheda-info-modal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('scheda_info_seen', 'true');
}

function loadSchedaEsameModule() {
    const container = document.getElementById('scheda-cards-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede esame...</div>`;
    }

    // Check if user has seen info modal, otherwise show automatically
    if (!localStorage.getItem('scheda_info_seen')) {
        showSchedaInfoModal();
    }

    fetch('/api/exams')
        .then(res => res.json())
        .then(data => {
            allSchedaExamsData = Array.isArray(data) ? data : (data.data || []);
            renderSchedaExamCards();
        })
        .catch(err => {
            console.error("Error loading exam sheets:", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento delle schede.</div>`;
            }
        });
}

function filterSchedaCards() {
    renderSchedaExamCards();
}

function renderSchedaExamCards() {
    const container = document.getElementById('scheda-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('scheda-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allSchedaExamsData.filter(ex => {
        if (!searchVal) return true;
        const name = (ex.student_name || '').toLowerCase();
        const moto = (ex.motorizzazione || '').toLowerCase();
        return name.includes(searchVal) || moto.includes(searchVal);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px; font-weight: bold; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">Nessuna scheda trovata.</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#ffffff';
        card.style.border = '1.5px solid #e2e8f0';
        card.style.borderRadius = '20px';
        card.style.padding = '18px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '14px';
        card.style.boxShadow = '0 4px 14px rgba(0,0,0,0.04)';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.15s ease';

        card.onclick = () => openSchedaQuizSheet(ex.id);

        const correct = ex.correct_count || 29;
        const wrong = ex.wrong_count || 1;
        const unanswered = ex.unanswered_count || 0;
        const total = ex.total_count || 30;
        const quizPercent = Math.round((correct / total) * 100);

        // Circular Icon matching Screenshot 3
        const circleIcon = `
            <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #0EA5E9, #0284C7); display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(14,165,233,0.3);">
                <i class="fa-solid fa-file-signature" style="font-size: 22px;"></i>
            </div>
        `;

        const scoreBarHtml = `
            <div style="margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 8px;">Quiz ${quizPercent}%</span>
                </div>
                <div style="height: 7px; background-color: #e2e8f0; border-radius: 4px; display: flex; overflow: hidden;">
                    <div style="background-color: #22c55e; width: ${(correct / total) * 100}%;"></div>
                    <div style="background-color: #ef4444; width: ${(wrong / total) * 100}%;"></div>
                    <div style="background-color: #f59e0b; width: ${(unanswered / total) * 100}%;"></div>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 6px; display: flex; justify-content: space-between; gap: 4px;">
                    <span>Corrette:${correct}</span>
                    <span>Sbagliate:${wrong}</span>
                    <span>Non risposte:${unanswered}</span>
                    <span>Totale:${total}</span>
                </div>
            </div>
        `;

        card.innerHTML = `
            ${circleIcon}
            <div style="flex: 1; min-width: 0;">
                <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.3;">Name: ${ex.student_name}</h4>
                <div style="font-size: 12px; color: #475569; margin-top: 3px; font-weight: 700;">
                    <div>Motorizzazione: ${ex.motorizzazione}</div>
                    <div style="margin-top: 1px;">Exam date: ${ex.exam_date}</div>
                </div>
                ${scoreBarHtml}
            </div>
            <i class="fa-solid fa-chevron-right" style="color: #94a3b8; font-size: 16px; margin-left: 4px;"></i>
        `;
        container.appendChild(card);
    });
}

function openSchedaQuizSheet(examId) {
    const listView = document.getElementById('scheda-list-view');
    const quizView = document.getElementById('scheda-quiz-view');

    if (listView) listView.style.display = 'none';
    if (quizView) quizView.style.display = 'block';

    const titleEl = document.getElementById('scheda-quiz-title');
    if (titleEl) titleEl.innerText = 'Caricamento kizz...';

    fetch(`/api/exams/${examId}`)
        .then(res => res.json())
        .then(data => {
            activeSchedaExamObj = data;
            schedaUserAnswers = {};
            currentSchedaQuestionIndex = 0;

            if (titleEl) titleEl.innerText = `${data.student_name} (${data.motorizzazione})`;

            // Initialize question answers state
            const questions = data.answers || [];
            questions.forEach(q => {
                if (q.user_answer !== undefined && q.user_answer !== null) {
                    schedaUserAnswers[q.id] = q.user_answer;
                }
            });

            renderSchedaCurrentQuestion();
            startSchedaTimer();
        })
        .catch(err => {
            console.error("Error loading exam detail:", err);
            if (titleEl) titleEl.innerText = 'Errore nel caricamento';
        });
}

function exitSchedaQuizView() {
    clearInterval(schedaTimerInterval);
    const listView = document.getElementById('scheda-list-view');
    const quizView = document.getElementById('scheda-quiz-view');

    if (quizView) quizView.style.display = 'none';
    if (listView) listView.style.display = 'block';
}

function setSchedaQuestionRange(startNum) {
    currentSchedaQuestionIndex = startNum - 1;

    // Update Tab Colors
    const t1 = document.getElementById('scheda-tab-group-1');
    const t2 = document.getElementById('scheda-tab-group-2');
    const t3 = document.getElementById('scheda-tab-group-3');

    if (t1) { t1.style.color = startNum === 1 ? '#dc2626' : '#64748b'; t1.style.background = startNum === 1 ? '#ffffff' : 'transparent'; }
    if (t2) { t2.style.color = startNum === 11 ? '#dc2626' : '#64748b'; t2.style.background = startNum === 11 ? '#ffffff' : 'transparent'; }
    if (t3) { t3.style.color = startNum === 21 ? '#dc2626' : '#64748b'; t3.style.background = startNum === 21 ? '#ffffff' : 'transparent'; }

    renderSchedaCurrentQuestion();
}

function renderSchedaCurrentQuestion() {
    if (!activeSchedaExamObj || !activeSchedaExamObj.answers) return;
    const questions = activeSchedaExamObj.answers;
    if (questions.length === 0) return;

    if (currentSchedaQuestionIndex < 0) currentSchedaQuestionIndex = 0;
    if (currentSchedaQuestionIndex >= questions.length) currentSchedaQuestionIndex = questions.length - 1;

    // Determine current range (1-10, 11-20, 21-30)
    const rangeStart = Math.floor(currentSchedaQuestionIndex / 10) * 10 + 1;
    const rangeEnd = Math.min(rangeStart + 9, questions.length);

    // Render Pills
    const pillsBar = document.getElementById('scheda-question-pills-bar');
    if (pillsBar) {
        pillsBar.innerHTML = '';
        for (let i = rangeStart; i <= rangeEnd; i++) {
            const idx = i - 1;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerText = i;
            btn.style.width = '32px';
            btn.style.height = '32px';
            btn.style.borderRadius = '50%';
            btn.style.border = 'none';
            btn.style.fontWeight = '800';
            btn.style.fontSize = '12px';
            btn.style.cursor = 'pointer';
            btn.style.flexShrink = '0';

            const qId = questions[idx].id;
            const hasAns = schedaUserAnswers[qId] !== undefined && schedaUserAnswers[qId] !== null;

            if (idx === currentSchedaQuestionIndex) {
                btn.style.backgroundColor = '#dc2626';
                btn.style.color = '#ffffff';
            } else if (hasAns) {
                btn.style.backgroundColor = '#22c55e';
                btn.style.color = '#ffffff';
            } else {
                btn.style.backgroundColor = '#e2e8f0';
                btn.style.color = '#475569';
            }

            btn.onclick = () => {
                currentSchedaQuestionIndex = idx;
                renderSchedaCurrentQuestion();
            };
            pillsBar.appendChild(btn);
        }
    }

    const currentQ = questions[currentSchedaQuestionIndex];

    // Underline terms in Italian question
    const textEl = document.getElementById('scheda-quiz-question-text');
    if (textEl) {
        let itText = currentQ.italian || '';
        // Underline terms using <u> tag
        const words = itText.split(' ');
        const underlined = words.map(w => `<u style="text-decoration-color: #94a3b8; text-underline-offset: 3px; cursor: pointer;">${w}</u>`).join(' ');
        textEl.innerHTML = `${currentSchedaQuestionIndex + 1}. ${underlined}`;
    }

    // Bangla text
    const bnEl = document.getElementById('scheda-quiz-question-bn');
    if (bnEl) {
        bnEl.innerText = currentQ.bangla || 'অনুবাদ পাওয়া যায়নি';
    }

    // Image
    const imgContainer = document.getElementById('scheda-quiz-img-container');
    const imgEl = document.getElementById('scheda-quiz-img');
    if (imgContainer && imgEl) {
        if (currentQ.image) {
            imgEl.src = currentQ.image;
            imgContainer.style.display = 'block';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    // Update Vero/Falso button state
    const btnVero = document.getElementById('scheda-btn-vero');
    const btnFalso = document.getElementById('scheda-btn-falso');
    const userAns = schedaUserAnswers[currentQ.id];

    if (btnVero) {
        if (userAns === true) {
            btnVero.style.background = '#22c55e';
            btnVero.style.color = '#ffffff';
        } else {
            btnVero.style.background = '#f0fdf4';
            btnVero.style.color = '#15803d';
        }
    }

    if (btnFalso) {
        if (userAns === false) {
            btnFalso.style.background = '#ef4444';
            btnFalso.style.color = '#ffffff';
        } else {
            btnFalso.style.background = '#fef2f2';
            btnFalso.style.color = '#b91c1c';
        }
    }
}

function selectSchedaAnswer(ansBool) {
    if (!activeSchedaExamObj || !activeSchedaExamObj.answers) return;
    const questions = activeSchedaExamObj.answers;
    const currentQ = questions[currentSchedaQuestionIndex];

    schedaUserAnswers[currentQ.id] = ansBool;
    renderSchedaCurrentQuestion();
}

function prevSchedaQuestion() {
    if (currentSchedaQuestionIndex > 0) {
        currentSchedaQuestionIndex--;
        renderSchedaCurrentQuestion();
    }
}

function nextSchedaQuestion() {
    if (activeSchedaExamObj && activeSchedaExamObj.answers && currentSchedaQuestionIndex < activeSchedaExamObj.answers.length - 1) {
        currentSchedaQuestionIndex++;
        renderSchedaCurrentQuestion();
    }
}

function startSchedaTimer() {
    clearInterval(schedaTimerInterval);
    schedaTimeLeft = 1800; // 30 mins

    const timerEl = document.getElementById('scheda-quiz-timer');

    schedaTimerInterval = setInterval(() => {
        if (schedaTimeLeft <= 0) {
            clearInterval(schedaTimerInterval);
            submitSchedaQuiz();
            return;
        }
        schedaTimeLeft--;
        const mins = Math.floor(schedaTimeLeft / 60).toString().padStart(2, '0');
        const secs = (schedaTimeLeft % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.innerText = `⏱ ${mins}:${secs}`;
    }, 1000);
}

function submitSchedaQuiz() {
    clearInterval(schedaTimerInterval);
    if (!activeSchedaExamObj || !activeSchedaExamObj.answers) return;

    const questions = activeSchedaExamObj.answers;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach(q => {
        const userAns = schedaUserAnswers[q.id];
        const isVero = (q.is_vero === true || q.is_vero == 1 || q.is_vero == '1');

        if (userAns === undefined || userAns === null) {
            unanswered++;
        } else if (userAns === isVero) {
            correct++;
        } else {
            wrong++;
        }
    });

    const total = questions.length;
    const passed = wrong <= 3;

    alert(`ফলাফল:\nসঠিক: ${correct}\nভুল: ${wrong}\nউত্তর না দেওয়া: ${unanswered}\nমোট: ${total}\nস্ট্যাটাস: ${passed ? '✅ পাস করেছেন (PROMOSSO)' : '❌ ফেল করেছেন (BOCCIATO)'}`);
    exitSchedaQuizView();
}
