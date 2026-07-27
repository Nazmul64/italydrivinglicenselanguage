/**
 * Wrong MCQs Module JS
 * Integrates with /api/v1/wrong-mcqs
 */

let activeWrongMcqsData = [];
let selectedWrongMcqIds = [];

function loadWrongMcqsModule() {
    const container = document.getElementById('wrong-mcqs-list-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande errate...</div>`;
    }

    return fetch('/api/v1/wrong-mcqs')
        .then(res => res.json())
        .then(resData => {
            const questions = resData.data || resData || [];
            activeWrongMcqsData = Array.isArray(questions) ? questions : [];

            const countEl = document.getElementById('wrong-mcqs-count');
            if (countEl) countEl.innerText = `${activeWrongMcqsData.length} Domande`;

            renderWrongMcqsList(activeWrongMcqsData);
            return activeWrongMcqsData;
        })
        .catch(err => {
            console.error('Error loading wrong MCQs:', err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento delle domande errate.</div>`;
            }
            return [];
        });
}

function renderWrongMcqsList(questions) {
    const container = document.getElementById('wrong-mcqs-list-container');
    if (!container) return;

    container.innerHTML = '';
    if (!questions || questions.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda errata trovata. Complimenti!</div>`;
        return;
    }

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'content-card detail-q-card incorrect';
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-card); position: relative;';

        const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || (q.correct_answer && q.correct_answer.toLowerCase() === 'vero');

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 4px 10px; border-radius: 8px;">Question #${q.id}</span>
                <span style="font-size: 11px; font-weight: 800; color: ${isVero ? '#22c55e' : '#ef4444'};">Risposta Corretta: ${isVero ? 'VERO' : 'FALSO'}</span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${q.italian || q.question || ''}</div>
            <div style="font-size: 12.5px; font-weight: 600; color: var(--text-secondary);">${q.bangla || q.bn_question || ''}</div>
        `;
        container.appendChild(card);
    });
}

function loadWrongMcqsList() {
    loadWrongMcqsModule();
}


// Note: loadWrongMcqsModule() is called on-demand by 10_activation_profile.js
// via openScreen('wrong-mcqs', ...) -> loadWrongMcqsList()
// Do NOT auto-trigger here to avoid duplicate loads and conflicts.
