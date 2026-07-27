/**
 * Lezioni (Recorded Video Classes) Module JS
 * Integrates with /api/v1/lezioni and /api/v1/lezioni/{id}
 */

let allLezioniData = [];

function loadLezioniModule() {
    const container = document.getElementById('screen-lezioni');
    
    return fetch('/api/v1/lezioni')
        .then(res => res.json())
        .then(resData => {
            const lectures = resData.data || resData || [];
            allLezioniData = Array.isArray(lectures) ? lectures : [];
            
            renderLezioniList(allLezioniData);
            return allLezioniData;
        })
        .catch(err => {
            console.error('Error loading lezioni:', err);
        });
}

function renderLezioniList(lectures) {
    const screenEl = document.getElementById('screen-lezioni');
    if (!screenEl) return;

    let itemsContainer = document.getElementById('lezioni-items-list-container');
    if (!itemsContainer) {
        itemsContainer = document.createElement('div');
        itemsContainer.id = 'lezioni-items-list-container';
        screenEl.appendChild(itemsContainer);
    }

    if (!lectures || lectures.length === 0) {
        return;
    }

    itemsContainer.innerHTML = '';
    lectures.forEach(classItem => {
        const vUrl = classItem.video_url || classItem.youtube_url || classItem.vimeo_url || classItem.video_path || '';
        const titleEscaped = (classItem.title || '').replace(/'/g, "\\'");
        const durationEscaped = (classItem.duration || '15 min').replace(/'/g, "\\'");
        const urlEscaped = vUrl.replace(/'/g, "\\'");

        const card = document.createElement('div');
        card.className = 'content-card lesson-item';
        card.style.cssText = 'display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 16px; margin-bottom: 12px; cursor: pointer; background: var(--bg-card); border: 1px solid var(--border-card);';
        card.onclick = () => {
            if (typeof playLesson === 'function') {
                playLesson(titleEscaped, durationEscaped, urlEscaped);
            }
        };

        const thumb = classItem.thumbnail_url || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300';
        card.innerHTML = `
            <div class="lesson-thumbnail" style="position: relative; width: 90px; height: 60px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #000;">
                <img src="${thumb}" alt="${classItem.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                <i class="fa-solid fa-circle-play" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: #ffffff; text-shadow: 0 2px 8px rgba(0,0,0,0.5);"></i>
            </div>
            <div class="lesson-info" style="flex: 1;">
                <div class="lesson-title" style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${classItem.title}</div>
                <div class="lesson-duration" style="font-size: 11px; color: var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${classItem.duration || '15 min'} • বাংলা ব্যাখ্যা</div>
            </div>
        `;
        itemsContainer.appendChild(card);
    });
}


// Note: lezioni.blade.php renders the initial list via PHP $lectureClasses foreach.
// loadLezioniModule() is available for dynamic refresh if needed, but
// do NOT auto-trigger here to avoid creating duplicate cards.

