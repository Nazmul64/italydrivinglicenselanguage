/**
 * Manuale (Theory Guidebook) Module JS
 * Integrates with /api/v1/manuale/chapters
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

    const searchInput = document.getElementById('manuale-search-input');
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.style.display = 'block';
    }

    container.innerHTML = '';
    if (!chapters || chapters.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ম্যানুয়াল থিওরি পাওয়া যায়নি।</div>`;
        return;
    }

    chapters.forEach((ch, index) => {
        const titleText = ch.title || ch.name || `Capitolo ${ch.chapter_number || index + 1}`;
        const chapterNum = ch.chapter_number || ch.sort_order || (index + 1);
        const imgUrl = ch.image || ch.image_path || '';
        const contentText = ch.content || 'Nessuna spiegazione teorica inserita.';

        let vocabs = ch.vocabulary || [];
        if (typeof vocabs === 'string') {
            try { vocabs = JSON.parse(vocabs); } catch(e) { vocabs = []; }
        }

        let vocabHtml = '';
        if (Array.isArray(vocabs) && vocabs.length > 0) {
            vocabHtml = `
                <div style="margin-top: 18px; border-top: 1px dashed var(--border-card); padding-top: 14px;">
                    <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-spell-check" style="color: var(--accent-blue);"></i> Vocabolario & Traduzioni (${vocabs.length})
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                        ${vocabs.map(v => {
                            const word = v.italian || v.word || '';
                            const meaning = v.bangla || v.meaning || '';
                            const vImg = v.image || '';
                            return `
                                <div style="background: var(--bg-primary); border: 1px solid var(--border-card); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 10px;">
                                    ${vImg ? `<img src="${vImg}" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-card);">` : ''}
                                    <div>
                                        <div style="font-weight: 800; font-size: 13px; color: var(--text-primary);">${word}</div>
                                        <div style="font-size: 12px; color: var(--accent-green); font-weight: 600; margin-top: 2px;">${meaning}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cssText = 'padding: 20px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-card); margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);';

        card.innerHTML = `
            <!-- Header Badge & Title -->
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0;">
                    ${chapterNum}
                </div>
                <div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 0.5px;">Capitolo ${chapterNum}</div>
                    <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${titleText}</div>
                </div>
            </div>

            <!-- Theory Illustration Image (Top) -->
            ${imgUrl ? `
                <div style="text-align: center; margin-bottom: 16px; background: var(--bg-primary); padding: 12px; border-radius: 16px; border: 1px solid var(--border-card);">
                    <img src="${imgUrl}" style="max-height: 320px; width: auto; max-width: 100%; object-fit: contain; border-radius: 12px; cursor: pointer;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)">
                </div>
            ` : ''}

            <!-- Theory Content -->
            <div style="background: var(--bg-primary); border: 1px solid var(--border-card); border-radius: 14px; padding: 16px 18px; color: var(--text-primary); font-size: 15px; line-height: 1.8; font-weight: 500;">
                ${contentText}
            </div>

            <!-- Vocabulary Section -->
            ${vocabHtml}
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
        (ch.title || ch.name || '').toLowerCase().includes(query) ||
        (ch.content || '').toLowerCase().includes(query) ||
        String(ch.chapter_number || '').includes(query)
    );
    renderManualeTopics(filtered);
}

