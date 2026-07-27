/**
 * Saved MCQs (Bookmarks) Module JS
 * Integrates with /api/v1/saved-mcqs and /api/v1/saved-mcqs/toggle
 */

let activeSavedMcqsData = [];

function loadSavedMcqsModule() {
    const container = document.getElementById('saved-mcqs-list-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande salvate...</div>`;
    }

    return fetch('/api/v1/saved-mcqs')
        .then(res => res.json())
        .then(resData => {
            const savedItems = resData.data || resData || [];
            activeSavedMcqsData = Array.isArray(savedItems) ? savedItems : [];

            const countEl = document.getElementById('saved-mcqs-count');
            if (countEl) countEl.innerText = `${activeSavedMcqsData.length} Domande`;

            renderSavedMcqsList(activeSavedMcqsData);
            return activeSavedMcqsData;
        })
        .catch(err => {
            console.error('Error loading saved MCQs:', err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento delle domande salvate.</div>`;
            }
            return [];
        });
}

function toggleSaveMcqApi(questionId) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    return fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            question_id: questionId
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

    savedItems.forEach(item => {
        const q = item.question || item;
        if (!q || !q.id) return;

        const card = document.createElement('div');
        card.className = 'content-card detail-q-card';
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-card); position: relative;';

        const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || (q.correct_answer && q.correct_answer.toLowerCase() === 'vero');

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--accent-green); background: rgba(34, 197, 94, 0.1); padding: 4px 10px; border-radius: 8px;">Saved Question #${q.id}</span>
                <i class="fa-solid fa-bookmark" onclick="toggleSaveMcqApi(${q.id})" style="font-size: 18px; color: var(--accent-green); cursor: pointer;" title="Remove from bookmarks"></i>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${q.italian || q.question || ''}</div>
            <div style="font-size: 12.5px; font-weight: 600; color: var(--text-secondary);">${q.bangla || q.bn_question || ''}</div>
        `;
        container.appendChild(card);
    });
}


// Note: loadSavedMcqsModule() is called on-demand by 08_cartelli_signs.js
// via openScreen('saved-mcqs', ...) -> loadSavedMcqsScreen()
// Do NOT auto-trigger here to avoid duplicate loads and conflicts.
