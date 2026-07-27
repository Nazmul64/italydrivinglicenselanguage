/**
 * Manuale (Theory Guidebook) Module JS
 * Integrates with /api/v1/manuale/chapters, /api/v1/manuale/pages/{chapterId}, /api/v1/manuale/page/{id}
 */

let allManualeChaptersData = [];

function loadManualeModule() {
    const container = document.getElementById('manuale-topics-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento manuale...</div>`;
    }

    return fetch('/api/v1/manuale/chapters')
        .then(res => res.json())
        .then(resData => {
            const chapters = resData.data || resData || [];
            allManualeChaptersData = Array.isArray(chapters) ? chapters : [];

            renderManualeTopics(allManualeChaptersData);
            return allManualeChaptersData;
        })
        .catch(err => {
            console.error('Error loading manuale chapters:', err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; font-weight: bold;">Si è verificato un errore durante il caricamento del manuale.</div>`;
            }
            return [];
        });
}

function renderManualeTopics(chapters) {
    const container = document.getElementById('manuale-topics-container');
    if (!container) return;

    container.innerHTML = '';
    if (!chapters || chapters.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ম্যানুয়াল চ্যাপ্টার পাওয়া যায়নি।</div>`;
        return;
    }

    chapters.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cssText = 'padding: 16px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-card); cursor: pointer; display: flex; justify-content: space-between; align-items: center;';
        card.onclick = () => {
            if (typeof openArgomentiSchedeScreen === 'function') {
                openArgomentiSchedeScreen(ch.id);
            }
        };

        card.innerHTML = `
            <div>
                <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Capitolo ${ch.sort_order || ch.id}) ${ch.name}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${ch.pages_count || ch.question_count || 0} Pagine & Teoria</div>
            </div>
            <i class="fa-solid fa-book-open" style="color: var(--accent-blue); font-size: 18px;"></i>
        `;
        container.appendChild(card);
    });
}

function filterManualeTopics() {
    const searchInput = document.getElementById('manuale-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!query) {
        renderManualeTopics(allManualeChaptersData);
        return;
    }

    const filtered = allManualeChaptersData.filter(ch => 
        (ch.name || '').toLowerCase().includes(query)
    );
    renderManualeTopics(filtered);
}


// Note: loadManualeModule() is called on-demand by 10_activation_profile.js
// via openScreen('manuale', ...) -> loadManualeTopics()
// Do NOT auto-trigger here to avoid duplicate loads and conflicts.

