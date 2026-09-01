/**
 * Saved MCQs (Bookmarks) Module JS
 * Integrates with /api/v1/saved-mcqs and /api/v1/saved-mcqs/toggle
 */

let activeSavedMcqsData = [];

function loadSavedMcqsModule() {
    if (typeof loadSavedMcqsScreen === 'function') {
        return loadSavedMcqsScreen();
    }
}

function toggleSaveMcqApi(questionId) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    return fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            question_id: questionId,
            phone: savedPhone,
            session_id: savedSessionId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (typeof showToast === 'function') {
            showToast(data.message || (data.saved ? 'প্রশ্ন সেভ করা হয়েছে' : 'সেভ থেকে সরানো হয়েছে'));
        }
        loadSavedMcqsModule();
        return data;
    })
    .catch(err => {
        console.error('Error toggling saved MCQ:', err);
    });
}

function renderSavedMcqsList(savedItems) {
    const container = document.getElementById('saved-mcqs-list-container');
    if (!container) return;

    container.innerHTML = '';
    if (!savedItems || savedItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda salvata.</div>`;
        return;
    }

    const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};

    savedItems.forEach((item, index) => {
        const q = item.question || item;
        if (!q || !q.id) return;

        window.cachedQuestionsMap = window.cachedQuestionsMap || {};
        window.cachedQuestionsMap[q.id] = q;

        const card = document.createElement('div');
        card.className = 'content-card detail-q-card';
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-card); position: relative;';

        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || (q.correct_answer && q.correct_answer.toLowerCase() === 'vero');
        const safeItalian = (q.italian || q.question || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
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

        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'saved-mcq-item-wrapper';
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
                <div class="detail-q-num" style="margin-bottom: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">${index + 1}</div>
                <div style="display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap;">
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
                    <button onclick="if(typeof toggleQCorrectAnswerInfo==='function') toggleQCorrectAnswerInfo(${q.id}); else { const b=document.getElementById('q-correct-badge-${q.id}'); if(b) b.style.display=(b.style.display==='none'||!b.style.display?'flex':'none'); }" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                        <i class="fa fa-eye" aria-hidden="true"></i>
                    </button>
                    <i class="fa-solid fa-bookmark" onclick="if(typeof toggleSaveMcqApi==='function') toggleSaveMcqApi(${q.id}); else if(typeof toggleSavedMcq==='function') toggleSavedMcq(${q.id}, this);" style="font-size: 18px; color: var(--accent-green); cursor: pointer; margin-left: 4px;" title="Remove from bookmarks"></i>
                </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                ${leftThumbHtml}
                <div style="flex: 1; min-width: 0;">
                    <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian || q.question || '', q.vocabulary) : (q.italian || q.question || '')}</div>
                    <div class="detail-q-text-bn" id="mod-saved-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || q.bn_question || ''}</div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-start; width: 100%; flex-wrap: wrap;">
                <button class="test-speaker-btn" onclick="if(typeof readSavedQuestionSpeech === 'function') readSavedQuestionSpeech(${q.id}); else if(typeof speakTextTTS === 'function') speakTextTTS(${q.id});" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                    <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                    <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                </button>
                ${(q.audio || q.voice) ? `
                    <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="if(typeof playQuestionMp3 === 'function') playQuestionMp3('${q.audio || q.voice}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                        <i class="fa-solid fa-play" style="font-size:12px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                    </button>
                    <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
                ` : ''}
                <button class="test-ctrl-btn" onclick="const el=document.getElementById('mod-saved-bn-${q.id}'); if(el) el.style.display=(el.style.display==='none'?'block':'none');" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                    <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                </button>
                <button class="test-ctrl-btn" onclick="if(typeof openNotesModal === 'function') openNotesModal(null, ${q.id}, null, '');" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                    <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                </button>
            </div>
        `;

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

        itemWrapper.appendChild(card);
        container.appendChild(itemWrapper);
    });
}
