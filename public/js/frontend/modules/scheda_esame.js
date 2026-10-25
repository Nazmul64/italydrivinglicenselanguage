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

let currentSchedaTab = 'nuove'; // 'nuove' or 'completato'

function switchSchedaTab(tab) {
    currentSchedaTab = tab;
    const tabNuove = document.getElementById('tab-scheda-nuove');
    const tabComp = document.getElementById('tab-scheda-completato');
    if (tabNuove && tabComp) {
        if (tab === 'nuove') {
            tabNuove.style.color = '#ffffff';
            tabNuove.style.borderBottom = '3px solid #6366F1';
            tabComp.style.color = 'rgba(255,255,255,0.75)';
            tabComp.style.borderBottom = '3px solid transparent';
        } else {
            tabComp.style.color = '#ffffff';
            tabComp.style.borderBottom = '3px solid #6366F1';
            tabNuove.style.color = 'rgba(255,255,255,0.75)';
            tabNuove.style.borderBottom = '3px solid transparent';
        }
    }
    loadSchedaEsameModule();
}

function loadSchedaEsameModule() {
    const container = document.getElementById('scheda-cards-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px; color: #22c55e;"></i><br>Caricamento schede esame superati...</div>`;
    }

    fetch('/api/v1/live-passed-exams?status=' + encodeURIComponent(currentSchedaTab) + '&_t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
            const list = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
            allSchedaExamsData = list;
            renderSchedaExamCards();
        })
        .catch(err => {
            console.warn("Live passed exams fetch error, trying fallback:", err);
            fetch('/api/live-passed-exams?_t=' + Date.now(), { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    allSchedaExamsData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                    renderSchedaExamCards();
                })
                .catch(err2 => {
                    console.error("Error loading exam sheets:", err2);
                    if (container) {
                        container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento delle schede.</div>`;
                    }
                });
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
        const name = (ex.nome || ex.student_name || '').toLowerCase();
        const moto = (ex.motorizzazione || '').toLowerCase();
        const dateStr = (ex.exam_date || '').toLowerCase();
        return name.includes(searchVal) || moto.includes(searchVal) || dateStr.includes(searchVal);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px; font-weight: bold; background: #ffffff; border-radius: 20px; border: 1.5px solid #e2e8f0;">Nessuna scheda trovata per "${searchVal || currentSchedaTab}".</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#ffffff';
        card.style.border = '1.5px solid #e2e8f0';
        card.style.borderRadius = '24px';
        card.style.padding = '18px 20px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '16px';
        card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

        card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; };
        card.onmouseleave = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)'; };

        const displayName = ex.nome || ex.student_name || 'Candidato';
        const displayMoto = ex.motorizzazione || 'Motorizzazione Civile';
        const displayDate = ex.exam_date || 'N/A';

        const correct = ex.corrette ?? (ex.correct_count ?? 29);
        const wrong = ex.errori ?? (ex.wrong_count ?? 1);
        const unanswered = ex.non_risposte ?? (ex.unanswered_count ?? 0);
        const total = ex.totale ?? (ex.total_count ?? 30);

        // On Click: Open PDF if available, otherwise launch quiz
        card.onclick = () => {
            if (ex.pdf_url) {
                window.open(ex.pdf_url, '_blank');
            } else if (ex.id) {
                openSchedaQuizSheet(ex.id);
            }
        };

        // Circular Icon matching Screenshot 1 & 3 (Cyan circle with clipboard & pencil)
        const circleIcon = `
            <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #0284C7, #0369A1); display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0; box-shadow: 0 4px 14px rgba(2,132,199,0.35); position: relative;">
                <i class="fa-solid fa-clipboard-check" style="font-size: 24px; color: #ffffff;"></i>
                <i class="fa-solid fa-pencil" style="font-size: 14px; color: #FACC15; position: absolute; right: 8px; bottom: 8px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));"></i>
            </div>
        `;

        const correctPercent = Math.min(100, Math.max(0, (correct / total) * 100));
        const wrongPercent = Math.min(100, Math.max(0, (wrong / total) * 100));

        const scoreBarHtml = `
            <div style="margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 5px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <span>Corrette: ${correct}</span>
                    <span>Errori: ${wrong}</span>
                    <span>Non risposte: ${unanswered}</span>
                    <span>Totale: ${total}</span>
                </div>
                <div style="height: 8px; background-color: #cbd5e1; border-radius: 6px; display: flex; overflow: hidden; max-width: 220px;">
                    <div style="background-color: #22c55e; width: ${correctPercent}%;"></div>
                    <div style="background-color: #ef4444; width: ${wrongPercent}%;"></div>
                </div>
            </div>
        `;

        card.innerHTML = `
            ${circleIcon}
            <div style="flex: 1; min-width: 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.3;">Nome: ${displayName}</h3>
                <div style="font-size: 13px; color: #334155; margin-top: 3px; font-weight: 700;">
                    <div>Motorizzazione: ${displayMoto}</div>
                    <div style="margin-top: 1px;">Exam date: ${displayDate}</div>
                </div>
                ${scoreBarHtml}
            </div>
            <i class="fa-solid fa-chevron-right" style="color: #0f172a; font-size: 20px; font-weight: 900; margin-left: 6px;"></i>
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

    // Italian question text
    const textEl = document.getElementById('scheda-quiz-question-text');
    if (textEl) {
        let itText = currentQ.italian || '';
        if (typeof highlightDictionaryTerms === 'function') {
            textEl.innerHTML = `${currentSchedaQuestionIndex + 1}. ${highlightDictionaryTerms(itText, currentQ.vocabulary, currentQ.id, 'scheda-esame')}`;
        } else {
            textEl.innerHTML = `${currentSchedaQuestionIndex + 1}. ${itText}`;
        }
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

    const curPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '') || '';
    const curSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '') || '';
    const curFirstName = localStorage.getItem('app_client_first_name') || (typeof currentClientFirstName !== 'undefined' ? currentClientFirstName : '') || '';
    const curLastName = localStorage.getItem('app_client_last_name') || (typeof currentClientLastName !== 'undefined' ? currentClientLastName : '') || '';
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const resultsPayload = [];
    questions.forEach(q => {
        const userAns = schedaUserAnswers[q.id];
        if (userAns !== undefined && userAns !== null) {
            const isVero = (q.is_vero === true || q.is_vero == 1 || q.is_vero == '1');
            resultsPayload.push({
                question_id: q.id,
                user_answer: userAns ? 'V' : 'F',
                is_correct: (userAns === isVero) ? 1 : 0,
                question_type: 'argomenti'
            });
        }
    });

    if (resultsPayload.length > 0) {
        fetch('/api/v1/user-mcq-results/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                'X-Client-Phone': curPhone,
                'X-Session-ID': curSessionId,
                'X-Client-Session-ID': curSessionId,
                'X-Client-First-Name': encodeURIComponent(curFirstName || ''),
                'X-Client-Last-Name': encodeURIComponent(curLastName || '')
            },
            body: JSON.stringify({
                results: resultsPayload,
                phone: curPhone,
                user_phone: curPhone,
                session_id: curSessionId,
                first_name: curFirstName,
                last_name: curLastName
            })
        }).then(() => {
            window.dispatchEvent(new CustomEvent('user-stats-updated'));
            if (typeof loadUserProfileStats === 'function') loadUserProfileStats();
        }).catch(e => console.error("Error logging scheda quiz results:", e));
    }

    const total = questions.length;
    // User Rule: 27, 28, 29, 30 correct = PASS (Promosso). 26 or less = FAIL (Bocciato).
    const passed = total >= 30 ? (correct >= 27) : (correct >= Math.ceil(total * 0.9));

    alert(`ফলাফল:\nসঠিক: ${correct}\nভুল: ${wrong}\nউত্তর না দেওয়া: ${unanswered}\nমোট: ${total}\nস্ট্যাটাস: ${passed ? '✅ পাস করেছেন (PROMOSSO)' : '❌ ফেল করেছেন (BOCCIATO)'}`);
    exitSchedaQuizView();
}
