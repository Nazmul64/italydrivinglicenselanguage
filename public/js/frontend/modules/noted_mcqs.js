/**
 * Noted MCQs Module JS
 * Integrates with /api/v1/noted-mcqs
 */

let activeNotedMcqsData = [];
let isNotedSelectMode = false;
let selectedNotedMcqIds = [];

function loadNotedMcqsScreen() {
    const container = document.getElementById('noted-mcqs-list-container');
    const countBadge = document.getElementById('noted-mcqs-count');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--accent-green);"></i>
            <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">লোড হচ্ছে...</div>
        </div>
    `;

    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    let url = '/api/v1/noted-mcqs';
    const params = [];
    if (savedPhone) params.push(`phone=${encodeURIComponent(savedPhone)}`);
    if (savedSessionId) params.push(`session_id=${encodeURIComponent(savedSessionId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-Client-Phone': savedPhone,
            'X-Session-ID': savedSessionId
        }
    })
    .then(res => res.json())
    .then(resData => {
        const items = resData.data || resData || [];
        activeNotedMcqsData = items;
        if (countBadge) countBadge.innerText = `${items.length} Domande`;
        renderNotedMcqsList(items);
        updateNotedMcqsPillStates();
        updateNotedQuizBtn();
    })
    .catch(err => {
        console.error('Error fetching noted MCQs:', err);
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">নোট করা প্রশ্ন লোড করতে সমস্যা হয়েছে।</div>`;
    });
}

function renderNotedMcqsList(notedItems) {
    const container = document.getElementById('noted-mcqs-list-container');
    if (!container) return;

    container.innerHTML = '';
    if (!notedItems || notedItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">এখনো কোনো প্রশ্ন নোট করা হয়নি।</div>`;
        return;
    }

    const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};

    notedItems.forEach((item, index) => {
        const q = item.question || item;
        if (!q || !q.id) return;

        window.cachedQuestionsMap = window.cachedQuestionsMap || {};
        window.cachedQuestionsMap[q.id] = q;

        const qType = item.type || q.type || 'argomenti';
        const isSelected = selectedNotedMcqIds.includes(q.id);

        const card = document.createElement('div');
        card.className = `content-card detail-q-card ${isSelected ? 'selected-q-card' : ''}`;
        card.id = `noted-card-${q.id}`;
        card.setAttribute('data-qid', q.id);
        card.setAttribute('data-qtype', qType);
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1.5px solid ' + (isSelected ? 'var(--accent-green, #22c55e)' : 'var(--border-card)') + '; position: relative; cursor: pointer; transition: all 0.2s ease;';

        card.onclick = function(e) {
            if (e.target.closest('button, input, a, i, .test-ctrl-btn, .test-speaker-btn, .pill-btn, img')) return;
            toggleNotedCardSelection(q.id);
        };

        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || (q.correct_answer && q.correct_answer.toLowerCase() === 'vero');
        const qImage = q.image || q.img || (q.page && q.page.image ? q.page.image : null);
        const imgPos = q.image_position || 'left';
        const showTopImg = qImage && (imgPos === 'top' || imgPos === 'both');
        const showLeftImg = qImage && (imgPos === 'left' || imgPos === 'both');

        const topImageCardHtml = showTopImg ? `
            <div style="width: 100%; text-align: center; padding: 12px; margin-bottom: 12px; background: var(--bg-card, #fff); border-radius: 16px; border: 1px solid var(--border-card); box-shadow: 0 2px 8px rgba(0,0,0,0.03); box-sizing: border-box;">
                <img src="${qImage}" style="max-height: 200px; width: 100%; max-width: 100%; object-fit: contain; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
            </div>
        ` : '';

        const leftThumbHtml = showLeftImg ? `
            <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
            </div>
        ` : '';

        const noteSnippet = (item.note_text || q.note_text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'noted-mcq-item-wrapper';
        itemWrapper.style.marginBottom = '12px';
        itemWrapper.style.flex = '1';
        itemWrapper.style.minWidth = '0';
        itemWrapper.style.maxWidth = '100%';
        itemWrapper.style.boxSizing = 'border-box';
        if (topImageCardHtml) {
            itemWrapper.innerHTML = topImageCardHtml;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%; flex-wrap: wrap; gap: 6px; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="detail-q-num" style="margin-bottom: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">${index + 1}</div>
                    <span style="font-size: 10px; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #10B981; padding: 2px 8px; border-radius: 8px; text-transform: uppercase;">${qType}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap;">
                    <div id="q-noted-correct-badge-${q.id}" style="display: none; align-items: center; gap: 6px; flex-wrap: wrap;">
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
                    <button type="button" onclick="const b=document.getElementById('q-noted-correct-badge-${q.id}'); if(b) b.style.display=(b.style.display==='none'||!b.style.display?'flex':'none');" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                        <i class="fa fa-eye" aria-hidden="true"></i>
                    </button>
                    <button type="button" onclick="openNotesModal(null, ${q.id}, ${item.id || 'null'}, '${noteSnippet}', '${qType}')" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: #10B981; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Edit Note">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                ${leftThumbHtml}
                <div style="flex: 1; min-width: 0;">
                    <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian || q.question || '', q.vocabulary) : (q.italian || q.question || '')}</div>
                </div>
            </div>

            <!-- Note content callout -->
            <div style="margin-top: 10px; padding: 10px 14px; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; border-radius: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <i class="fa-regular fa-note-sticky" style="color: #10B981; font-size: 14px; margin-top: 2px; flex-shrink: 0;"></i>
                <div style="font-size: 12px; color: var(--text-primary); font-weight: 600; line-height: 1.4; flex: 1;">${item.note_text || q.note_text || ''}</div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-start; width: 100%; flex-wrap: wrap;">
                <button type="button" class="test-speaker-btn" onclick="speakTextTTS(${q.id});" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                    <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                    <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                </button>
                ${(q.audio || q.voice) ? `
                    <button type="button" class="test-ctrl-btn" id="noted-play-btn-${q.id}" onclick="if(typeof playQuestionMp3 === 'function') playQuestionMp3('${q.audio || q.voice}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                        <i class="fa-solid fa-play" style="font-size:12px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                    </button>
                    <input type="range" class="test-slider" id="noted-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
                ` : ''}
                <button type="button" class="test-ctrl-btn" onclick="openNotedQuestionTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                    <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                </button>
                <button type="button" class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, ${item.id || 'null'}, '${noteSnippet}', '${qType}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Edit Note">
                    <i class="fa-solid fa-note-sticky" style="font-size: 13px; color: #10B981;"></i>
                    <span style="font-size: 9px; font-weight: 800; color: #10B981; white-space: nowrap;">নোট</span>
                </button>
            </div>
        `;

        itemWrapper.appendChild(card);
        container.appendChild(itemWrapper);
    });
}

function openNotedQuestionTranslation(qId) {
    let targetQ = null;
    if (window.cachedQuestionsMap && window.cachedQuestionsMap[qId]) {
        targetQ = window.cachedQuestionsMap[qId];
    } else if (activeNotedMcqsData && Array.isArray(activeNotedMcqsData)) {
        const found = activeNotedMcqsData.find(item => (item.id == qId || (item.question && item.question.id == qId)));
        if (found) targetQ = found.question || found;
    }
    if (!targetQ) return;

    const itText = targetQ.italian || targetQ.question || '';
    const bnText = targetQ.bangla || targetQ.bn_question || '';
    const vocab = targetQ.vocabulary || [];
    const img = targetQ.image || targetQ.img || (targetQ.page ? targetQ.page.image : '');

    if (typeof openQuestionTranslationModal === 'function') {
        openQuestionTranslationModal(itText, bnText, vocab, img);
    }
}

function toggleNotedCardSelection(qId) {
    const idx = selectedNotedMcqIds.indexOf(qId);
    if (idx > -1) {
        selectedNotedMcqIds.splice(idx, 1);
    } else {
        selectedNotedMcqIds.push(qId);
    }
    isNotedSelectMode = selectedNotedMcqIds.length > 0;
    renderNotedMcqsSelectionUI();
    updateNotedMcqsPillStates();
    updateNotedQuizBtn();
}

function selectAllNotedMcqs() {
    selectedNotedMcqIds = activeNotedMcqsData.map(item => (item.question ? item.question.id : item.id));
    isNotedSelectMode = true;
    renderNotedMcqsSelectionUI();
    updateNotedMcqsPillStates();
    updateNotedQuizBtn();
    if (typeof showToast === 'function') {
        showToast('সব নোট করা প্রশ্ন সিলেক্ট করা হয়েছে');
    }
}

function unselectAllNotedMcqs() {
    selectedNotedMcqIds = [];
    isNotedSelectMode = false;
    renderNotedMcqsSelectionUI();
    updateNotedMcqsPillStates();
    updateNotedQuizBtn();
    if (typeof showToast === 'function') {
        showToast('সব আন-সিলেক্ট করা হয়েছে');
    }
}

function toggleNotedMcqsSelectMode() {
    isNotedSelectMode = true;
    renderNotedMcqsSelectionUI();
    updateNotedMcqsPillStates();
    updateNotedQuizBtn();
    if (typeof showToast === 'function') {
        showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
    }
}

function renderNotedMcqsSelectionUI() {
    activeNotedMcqsData.forEach(item => {
        const q = item.question || item;
        if (!q || !q.id) return;
        const card = document.getElementById(`noted-card-${q.id}`);
        if (card) {
            if (selectedNotedMcqIds.includes(q.id)) {
                card.classList.add('selected-q-card');
                card.style.borderColor = 'var(--accent-green, #22c55e)';
                card.style.backgroundColor = 'rgba(34, 197, 94, 0.04)';
            } else {
                card.classList.remove('selected-q-card');
                card.style.borderColor = 'var(--border-card)';
                card.style.backgroundColor = 'var(--bg-card)';
            }
        }
    });
}

function updateNotedMcqsPillStates() {
    const btnSelect = document.getElementById('noted-select-toggle-btn');
    const btnAll = document.getElementById('noted-select-all-btn');
    const btnUnselect = document.getElementById('noted-unselect-all-btn');

    if (btnSelect) btnSelect.classList.remove('active');
    if (btnAll) btnAll.classList.remove('active');
    if (btnUnselect) btnUnselect.classList.remove('active');

    if (isNotedSelectMode || selectedNotedMcqIds.length > 0) {
        if (btnSelect) btnSelect.style.display = 'none';
        if (activeNotedMcqsData.length > 0 && selectedNotedMcqIds.length === activeNotedMcqsData.length) {
            if (btnAll) btnAll.classList.add('active');
        }
    } else {
        if (btnSelect) btnSelect.style.display = 'inline-block';
        if (btnUnselect) btnUnselect.classList.add('active');
    }
}

function updateNotedQuizBtn() {
    const btn = document.getElementById('noted-mcqs-quiz-btn-container');
    if (!btn) return;
    if (selectedNotedMcqIds.length > 0 || (isNotedSelectMode && activeNotedMcqsData.length > 0)) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
}

function startNotedMcqsQuiz() {
    const questionsToQuiz = (selectedNotedMcqIds && selectedNotedMcqIds.length > 0)
        ? activeNotedMcqsData
            .map(item => item.question || item)
            .filter(q => selectedNotedMcqIds.includes(q.id))
        : activeNotedMcqsData.map(item => item.question || item);

    if (!questionsToQuiz || questionsToQuiz.length === 0) {
        if (typeof showToast === 'function') showToast('কোনো প্রশ্ন সিলেক্ট করা হয়নি');
        return;
    }

    testQuestions = questionsToQuiz.map(q => ({
        id: q.id,
        italian: q.italian || q.question || '',
        bangla: q.bangla || q.bn_question || '',
        is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || (q.correct_answer && q.correct_answer.toLowerCase() === 'vero'),
        image: q.image || q.img || (q.page && q.page.image ? q.page.image : null),
        audio: q.audio || q.voice,
        video: q.video,
        vocabulary: q.vocabulary || []
    })).sort(() => Math.random() - 0.5);

    currentTestIndex = 0;
    testAnswers = Array(testQuestions.length).fill(null);
    practiceMode = 'exam';

    const timerPill = document.getElementById('test-timer');
    if (timerPill) {
        timerPill.innerText = `NOTED MCQS QUIZ`;
        timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        timerPill.style.borderColor = 'var(--accent-green)';
        timerPill.style.color = 'var(--accent-green)';
    }
    const timerLabel = document.querySelector('.test-timer-label');
    if (timerLabel) {
        timerLabel.innerText = `${testQuestions.length} Noted MCQs`;
    }

    if (typeof openScreen === 'function') {
        openScreen('test', 'Noted MCQs Quiz');
        if (typeof switchTestQuestionTab === 'function') switchTestQuestionTab(1);
        if (typeof showTestQuestion === 'function') showTestQuestion();
        if (typeof startTestTimer === 'function') startTestTimer();
    }
}

window.loadNotedMcqsScreen = loadNotedMcqsScreen;
window.openNotedQuestionTranslation = openNotedQuestionTranslation;
window.toggleNotedCardSelection = toggleNotedCardSelection;
window.selectAllNotedMcqs = selectAllNotedMcqs;
window.unselectAllNotedMcqs = unselectAllNotedMcqs;
window.toggleNotedMcqsSelectMode = toggleNotedMcqsSelectMode;
window.startNotedMcqsQuiz = startNotedMcqsQuiz;
