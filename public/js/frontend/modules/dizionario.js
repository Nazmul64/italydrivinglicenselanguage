/**
 * Dizionario (Italian-Bangla Dictionary) Module JS
 * Integrates with /api/v1/dizionario?search=...
 */

let activeDizionarioTerms = [];

function loadDizionarioModule(searchQuery = '') {
    let url = '/api/v1/dizionario';
    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    return fetch(url)
        .then(res => res.json())
        .then(resData => {
            const terms = resData.data || resData || [];
            activeDizionarioTerms = Array.isArray(terms) ? terms : [];
            
            if (typeof dictionaryData !== 'undefined') {
                dictionaryData = activeDizionarioTerms.map(t => ({
                    word: t.italian || t.word || '',
                    bn: t.bangla || t.bn || '',
                    desc_it: t.definition || t.desc_it || '',
                    desc_bn: t.bangla || t.desc_bn || '',
                    image: t.image || '',
                    audio: t.audio || null,
                    video: t.video || null
                }));
            }

            renderDizionarioList(activeDizionarioTerms);
            return activeDizionarioTerms;
        })
        .catch(err => {
            console.error('Error loading dizionario terms:', err);
            return [];
        });
}

function renderDizionarioList(terms) {
    const container = document.getElementById('dictionary-list');
    if (!container) return;

    container.innerHTML = '';
    if (!terms || terms.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 30px; color: var(--text-secondary);">কোনো অভিধানের শব্দ পাওয়া যায়নি!</div>';
        return;
    }

    terms.forEach(item => {
        const italianWord = item.italian || item.word || '';
        const banglaMeaning = item.bangla || item.bn || '';
        const definition = item.definition || item.desc_it || '';

        const card = document.createElement('div');
        card.className = 'content-card dictionary-item';
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-card); cursor: pointer;';
        card.onclick = () => {
            if (typeof openDictTermModal === 'function') {
                openDictTermModal(italianWord, banglaMeaning, definition, item.image, item.audio, item.video);
            }
        };

        card.innerHTML = `
            <div class="dict-word" style="font-size: 16px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">${italianWord}</div>
            <div class="dict-meaning" style="font-size: 14px; font-weight: 700; color: var(--accent-green); margin-top: 2px;">${banglaMeaning}</div>
            ${definition ? `<div class="dict-desc" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">${definition}</div>` : ''}
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDizionarioModule();

    const searchInput = document.getElementById('dictionary-search');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadDizionarioModule(e.target.value.trim());
            }, 300);
        });
    }
});
