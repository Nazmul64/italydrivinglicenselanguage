/**
 * Argomenti (Theory Chapters & Pages) Module JS
 * Integrates with /api/v1/chapters, /api/v1/chapters/{id}/pages, /api/v1/pages/{id}
 */

function loadArgomentiModule() {
    const container = document.getElementById('argomenti-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento capitoli...</div>`;
    }

    return fetch('/api/v1/chapters')
        .then(res => res.json())
        .then(resData => {
            const chapters = resData.data || resData || [];
            if (typeof allArgomentiChapters !== 'undefined') {
                allArgomentiChapters = Array.isArray(chapters) ? chapters : [];
            }
            const countBadge = document.getElementById('argomenti-chapters-count-badge');
            if (countBadge) {
                countBadge.innerText = `${chapters.length} Capitoli`;
            }

            if (typeof renderArgomentiList === 'function') {
                renderArgomentiList();
            } else if (container) {
                renderArgomentiCards(chapters, container);
            }
            return chapters;
        })
        .catch(err => {
            console.error('Error loading Argomenti chapters:', err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento dei capitoli.</div>`;
            }
        });
}

function renderArgomentiCards(chapters, container) {
    container.innerHTML = '';
    if (!chapters || chapters.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Nessun capitolo trovato.</div>`;
        return;
    }

    chapters.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cssText = 'padding: 16px; border-radius: 16px; margin-bottom: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-card);';
        card.onclick = () => {
            if (typeof openArgomentiSchedeScreen === 'function') {
                openArgomentiSchedeScreen(ch.id);
            }
        };
        card.innerHTML = `
            <div>
                <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Capitolo ${ch.sort_order || ch.id}) ${ch.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${ch.question_count || 0} Domande</div>
            </div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-secondary);"></i>
        `;
        container.appendChild(card);
    });
}


// Note: loadArgomentiModule() is called on-demand via openScreen('argomenti')
// Do NOT auto-trigger here to avoid duplicate loads.

