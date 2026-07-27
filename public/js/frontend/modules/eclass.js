/**
 * E-Class (Live Classes) Module JS
 * Integrates with /api/v1/eclass
 */

let allLiveClassesData = [];

function loadEClassModule() {
    return fetch('/api/v1/eclass')
        .then(res => res.json())
        .then(resData => {
            const classes = resData.data || resData || [];
            allLiveClassesData = Array.isArray(classes) ? classes : [];

            renderEClassSessions(allLiveClassesData);
            return allLiveClassesData;
        })
        .catch(err => {
            console.error('Error loading eclasses:', err);
        });
}

function renderEClassSessions(classes) {
    const screenEl = document.getElementById('screen-eclass');
    if (!screenEl) return;

    let dynamicContainer = document.getElementById('eclass-dynamic-list-container');
    if (!dynamicContainer) {
        dynamicContainer = document.createElement('div');
        dynamicContainer.id = 'eclass-dynamic-list-container';
        screenEl.appendChild(dynamicContainer);
    }

    if (!classes || classes.length === 0) {
        return;
    }

    dynamicContainer.innerHTML = '';
    classes.forEach(live => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cssText = 'text-align: center; padding: 24px 16px; margin-top: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-card);';
        
        const isLiveNow = live.is_active || live.status === 'live';
        const iconColor = isLiveNow ? '#FF5252' : '#3B82F6';

        card.innerHTML = `
            <i class="fa-solid fa-tower-broadcast" style="font-size: 36px; color: ${iconColor}; margin-bottom: 12px;"></i>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${live.title}</h4>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">${live.subtitle || live.description || 'লাইভ ক্লাস সেশন'}</p>
            ${live.room_link ? `
                <button class="action-btn" style="background-color: ${iconColor}; color: white; margin: 0 auto; width: auto; padding: 10px 20px;" onclick="window.open('${live.room_link}', '_blank')">
                    <i class="fa-solid fa-door-open"></i> ক্লাসরুমে প্রবেশ করুন
                </button>
            ` : `
                <button class="action-btn" style="background-color: ${iconColor}; color: white; margin: 0 auto; width: auto; padding: 10px 20px;" onclick="showToast('লাইভ ক্লাস শুরু হতে এখনো সময় বাকি আছে')">
                    <i class="fa-solid fa-door-open"></i> ক্লাসরুমে প্রবেশ করুন
                </button>
            `}
        `;
        dynamicContainer.appendChild(card);
    });
}


// Note: eclass.blade.php renders live classes via PHP $liveClasses.
// loadEClassModule() can be used for dynamic refresh but should not auto-run.
