// --- Global Fetch Interceptor for Client License Headers ---
(function () {
    const originalFetch = window.fetch;

    function safeAsciiHeader(val) {
        if (val === null || val === undefined) return '';
        const str = String(val).trim();
        if (/[^\x00-\x7F]/.test(str)) {
            try {
                return encodeURIComponent(str);
            } catch (e) {
                return '';
            }
        }
        return str;
    }

    window.fetch = function (resource, init = {}) {
        init = init || {};
        const phone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : null);
        const sessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : null);
        const firstName = localStorage.getItem('app_client_first_name') || (typeof currentClientFirstName !== 'undefined' ? currentClientFirstName : null);
        const lastName = localStorage.getItem('app_client_last_name') || (typeof currentClientLastName !== 'undefined' ? currentClientLastName : null);

        // Sanitize any existing headers to guarantee 0 fetch exceptions
        if (init.headers) {
            if (init.headers instanceof Headers) {
                const pairs = [];
                init.headers.forEach((v, k) => {
                    pairs.push([k, safeAsciiHeader(v)]);
                });
                init.headers = new Headers();
                pairs.forEach(([k, v]) => init.headers.set(k, v));
            } else if (Array.isArray(init.headers)) {
                init.headers = init.headers.map(([k, v]) => [k, safeAsciiHeader(v)]);
            } else if (typeof init.headers === 'object') {
                for (const k of Object.keys(init.headers)) {
                    init.headers[k] = safeAsciiHeader(init.headers[k]);
                }
            }
        } else {
            init.headers = {};
        }

        const safePhone = safeAsciiHeader(phone);
        const safeSession = safeAsciiHeader(sessionId);
        const safeFirst = safeAsciiHeader(firstName);
        const safeLast = safeAsciiHeader(lastName);

        if (safePhone || safeSession || safeFirst || safeLast) {
            if (init.headers instanceof Headers) {
                if (safePhone && !init.headers.has('X-Client-Phone')) init.headers.append('X-Client-Phone', safePhone);
                if (safeSession && !init.headers.has('X-Client-Session-ID')) init.headers.append('X-Client-Session-ID', safeSession);
                if (safeFirst && !init.headers.has('X-Client-First-Name')) init.headers.append('X-Client-First-Name', safeFirst);
                if (safeLast && !init.headers.has('X-Client-Last-Name')) init.headers.append('X-Client-Last-Name', safeLast);
            } else if (Array.isArray(init.headers)) {
                if (safePhone) init.headers.push(['X-Client-Phone', safePhone]);
                if (safeSession) init.headers.push(['X-Client-Session-ID', safeSession]);
                if (safeFirst) init.headers.push(['X-Client-First-Name', safeFirst]);
                if (safeLast) init.headers.push(['X-Client-Last-Name', safeLast]);
            } else {
                if (safePhone && !init.headers['X-Client-Phone']) init.headers['X-Client-Phone'] = safePhone;
                if (safeSession && !init.headers['X-Client-Session-ID']) init.headers['X-Client-Session-ID'] = safeSession;
                if (safeFirst && !init.headers['X-Client-First-Name']) init.headers['X-Client-First-Name'] = safeFirst;
                if (safeLast && !init.headers['X-Client-Last-Name']) init.headers['X-Client-Last-Name'] = safeLast;
            }
        }
        return originalFetch.call(this, resource, init);
    };
})();

// --- Global Safe Image URL Sanitizer & Cache Sanitizer ---
window.sanitizeAppImageUrl = function (url) {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (
        url.startsWith('/data/user/') ||
        url.startsWith('/data/data/') ||
        url.startsWith('file://') ||
        url.startsWith('/storage/emulated/') ||
        url.includes('scaled_IMG') ||
        url.includes('com.example.')
    ) {
        return '';
    }
    // If it's already an absolute HTTP/HTTPS URL
    if (/^https?:\/\//i.test(url)) {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            try {
                const u = new URL(url);
                return window.location.origin + u.pathname + u.search;
            } catch (e) { }
        }
        return url;
    }
    // If it's a relative path, ensure it always prepends current window origin
    if (url.startsWith('/')) {
        return window.location.origin + url;
    }
    return window.location.origin + '/' + url;
};

// Auto-clean bad local device image paths from ALL browser localStorage and sessionStorage keys
(function cleanupBadLocalStoreImages() {
    try {
        const cleanStore = (store) => {
            const keys = [];
            for (let i = 0; i < store.length; i++) {
                keys.push(store.key(i));
            }
            keys.forEach(key => {
                if (!key) return;
                const raw = store.getItem(key);
                if (raw && (raw.includes('/data/user/') || raw.includes('/data/data/') || raw.includes('scaled_IMG') || raw.includes('/storage/emulated/') || raw.includes('com.example.'))) {
                    try {
                        let parsed = JSON.parse(raw);
                        let cleaned = JSON.stringify(parsed, (k, v) => {
                            if (typeof v === 'string' && (v.startsWith('/data/user/') || v.startsWith('/data/data/') || v.startsWith('file://') || v.startsWith('/storage/emulated/') || v.includes('scaled_IMG') || v.includes('com.example.'))) {
                                return '';
                            }
                            return v;
                        });
                        store.setItem(key, cleaned);
                    } catch (e) {
                        if (raw.startsWith('/data/user/') || raw.includes('scaled_IMG') || raw.includes('com.example.')) {
                            store.removeItem(key);
                        }
                    }
                }
            });
        };
        cleanStore(localStorage);
        cleanStore(sessionStorage);
    } catch (err) { }
})();

// --- Global Simulation & Speech Variables ---
const speedOptionsList = [0.65, 0.75, 0.85, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
let testAudioSpeed = 1.0;
let isSpeechSpeaking = false;

window.openTeacherHelpModal = function () {
    if (typeof toggleGuestChat === 'function') {
        toggleGuestChat(true);
    } else {
        const widget = document.getElementById('guest-chat-widget');
        if (widget) widget.style.display = 'flex';
    }
};
let practiceMode = 'exam';
let activeSavedMcqs = [];
let isSchedeSelectMode = false;

// --- Global Activation State Variables ---
let activationStatusInterval = null;
let currentClientVerified = false;
let currentClientActive = sessionStorage.getItem('tab_qr_unlocked') === 'true';
let currentClientPhone = localStorage.getItem('app_client_phone') || null;
let currentClientSessionId = localStorage.getItem('app_client_session_id') || null;

if (currentClientActive) {
    sessionStorage.setItem('tab_qr_unlocked', 'true');
    document.cookie = "qr_tab_unlocked=1; path=/; SameSite=Lax";
}
if (currentClientPhone) {
    document.cookie = "app_client_phone=" + encodeURIComponent(currentClientPhone) + "; path=/; SameSite=Lax";
}
if (currentClientSessionId) {
    document.cookie = "app_client_session_id=" + encodeURIComponent(currentClientSessionId) + "; path=/; SameSite=Lax";
}

function getUserStatsStorageKey() {
    if (currentClientPhone) {
        return `user_question_stats_${currentClientPhone}`;
    }
    if (currentClientSessionId) {
        return `user_question_stats_${currentClientSessionId}`;
    }
    return 'user_question_stats';
}

function getUserQuestionStats() {
    const key = getUserStatsStorageKey();
    let statsStr = localStorage.getItem(key);

    // Fallback: If scoped key is missing but legacy key exists, copy it over
    if (!statsStr && key !== 'user_question_stats') {
        const legacyStats = localStorage.getItem('user_question_stats');
        if (legacyStats) {
            localStorage.setItem(key, legacyStats);
            statsStr = legacyStats;
        }
    }

    try {
        return JSON.parse(statsStr || '{}');
    } catch (e) {
        return {};
    }
}

function saveUserQuestionStats(stats) {
    const key = getUserStatsStorageKey();
    localStorage.setItem(key, JSON.stringify(stats));
    localStorage.setItem('user_question_stats', JSON.stringify(stats));
}

function syncUserQuestionStatsFromBackend() {
    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    let url = '/api/user-mcq-results?per_page=5000';
    if (savedPhone) url += `&phone=${encodeURIComponent(savedPhone)}`;
    if (savedSessionId) url += `&session_id=${encodeURIComponent(savedSessionId)}`;

    return fetch(url)
        .then(res => {
            if (!res.ok) return null;
            return res.json();
        })
        .then(data => {
            if (!data) return;
            const items = data.data || (Array.isArray(data) ? data : []);

            if (!Array.isArray(items)) return;

            const stats = {};
            items.forEach(item => {
                const rawQId = item.question_id;
                if (!rawQId) return;
                const isCartelli = item.question_type === 'cartelli' || (typeof item.question_type === 'undefined' && (item.cartello_question || item.cartello_id));
                const qId = isCartelli ? `cartelli_${rawQId}` : rawQId;
                const isCorrect = item.is_correct === 1 || item.is_correct === true || item.is_correct === '1';
                const cCount = (typeof item.correct_count === 'number') ? item.correct_count : (isCorrect ? 1 : 0);
                const wCount = (typeof item.wrong_count === 'number') ? item.wrong_count : (isCorrect ? 0 : 1);

                if (!stats[qId]) {
                    stats[qId] = {
                        state: isCorrect ? 'correct' : 'wrong',
                        correct: cCount,
                        wrong: wCount,
                        chapter: item.chapter_id || null,
                        updated_at: item.updated_at
                    };
                } else {
                    stats[qId].correct = Math.max(stats[qId].correct || 0, cCount);
                    stats[qId].wrong = Math.max(stats[qId].wrong || 0, wCount);
                    if (new Date(item.updated_at || 0) >= new Date(stats[qId].updated_at || 0)) {
                        stats[qId].state = isCorrect ? 'correct' : 'wrong';
                        stats[qId].updated_at = item.updated_at;
                    }
                }
            });
            saveUserQuestionStats(stats);
        })
        .catch(err => console.error("Error syncing user question stats: ", err));
}

function applyAppFontFamily(fontFamily, fontWeight) {
    if (!fontFamily) return;
    fontWeight = fontWeight || 'normal';

    if (!fontFamily.includes('system-ui') && !fontFamily.includes('Arial') && !fontFamily.includes('Segoe UI')) {
        const fontNameForUrl = fontFamily.replace(/\s+/g, '+');
        const linkId = `google-font-app-${fontNameForUrl}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@300;400;500;600;700;800;900&display=swap`;
            document.head.appendChild(link);
        }
    }

    const appliedFont = fontFamily.includes(',') ? fontFamily : `"${fontFamily}", sans-serif`;
    document.documentElement.style.setProperty('--app-font-family', appliedFont);
    document.documentElement.style.setProperty('--app-font-weight', fontWeight);
}
window.applyAppFontFamily = applyAppFontFamily;

function openImageZoomModal(imgSrc) {
    if (!imgSrc) return;
    let modal = document.getElementById('global-image-zoom-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-image-zoom-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px;';
        modal.onclick = () => modal.style.display = 'none';
        modal.innerHTML = `
            <div style="position: relative; max-width: 90%; max-height: 90%;" onclick="event.stopPropagation()">
                <i class="fa-solid fa-xmark" style="position: absolute; top: -35px; right: 0; color: #fff; font-size: 24px; cursor: pointer;" onclick="document.getElementById('global-image-zoom-modal').style.display='none'"></i>
                <img id="global-image-zoom-img" src="" style="max-width: 100%; max-height: 80vh; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
            </div>
        `;
        document.body.appendChild(modal);
    }
    const imgEl = document.getElementById('global-image-zoom-img');
    if (imgEl) imgEl.src = imgSrc;
    modal.style.display = 'flex';
}
window.openImageZoomModal = openImageZoomModal;

function toggleQCorrectAnswerInfo(qId) {
    const badge = document.getElementById(`q-correct-badge-${qId}`);
    if (badge) {
        const isHidden = getComputedStyle(badge).display === 'none' || badge.style.display === 'none' || !badge.style.display;
        badge.style.display = isHidden ? 'flex' : 'none';
    }
}
window.toggleQCorrectAnswerInfo = toggleQCorrectAnswerInfo;


// --- Helper: Retrieve CSRF Token from meta tag ---
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// --- 1. Clock display ---
function updateClock() {
    const timeEl = document.getElementById('status-time');
    if (!timeEl) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    timeEl.innerText = hours + ':' + minutes;
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. Dark/Light Mode Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

if (themeToggle && themeIcon) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        document.body.classList.remove('dark-mode');
        themeIcon.className = 'fa-solid fa-moon';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('theme', 'dark');
            showToast('à¦¡à¦¾à¦°à§à¦• à¦®à§‹à¦¡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦¹à§Ÿà§‡à¦›à§‡');
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'light');
            showToast('à¦²à¦¾à¦‡à¦Ÿ à¦®à§‹à¦¡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦¹à§Ÿà§‡à¦›à§‡');
        }
    });
}

// --- 3. Auto-Sliding Image Banner Carousel ---
let currentSlide = 0;
const sliderWrapper = document.getElementById('slider-wrapper');
let totalSlides = sliderWrapper ? sliderWrapper.querySelectorAll('.slide').length : 0;
let autoSlideTimer;

function updateSlider() {
    if (!sliderWrapper || totalSlides === 0) return;
    sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((ind, index) => {
        if (index === currentSlide) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });
}

function nextSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetAutoSlide();
}

function startAutoSlide() {
    if (totalSlides > 1) {
        autoSlideTimer = setInterval(nextSlide, 4000);
    }
}

function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
}

if (sliderWrapper && totalSlides > 1) {
    startAutoSlide();
}
// --- 4. Chapters List Metadata & Dynamic Rendering ---
const chaptersList = [
    { id: 1, name: "Definizioni stradali e doveri dell'uso della strada", bn: "à¦°à¦¾à¦¸à§à¦¤à¦¾ à¦“ à¦Ÿà§à¦°à¦¾à¦«à¦¿à¦•à§‡à¦° à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à¦‚à¦œà§à¦žà¦¾ à¦à¦¬à¦‚ à¦šà¦¾à¦²à¦•à§‡à¦° à¦¦à¦¾à§Ÿà¦¿à¦¤à§à¦¬" },
    { id: 2, name: "Segnali di pericolo", bn: "à¦¬à¦¿à¦ªà¦¦à¦œà¦¨à¦• à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 3, name: "Segnali di divieto", bn: "à¦¨à¦¿à¦·à§‡à¦§à¦¾à¦œà§à¦žà¦¾ à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 4, name: "Segnali di obbligo", bn: "à¦¬à¦¾à¦§à§à¦¯à¦¤à¦¾à¦®à§‚à¦²à¦• à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 5, name: "Segnali orizzontali e segni sulla strada", bn: "à¦°à¦¾à¦¸à§à¦¤à¦¾à¦° à¦…à¦¨à§à¦­à§‚à¦®à¦¿à¦• à¦¦à¦¾à¦— à¦à¦¬à¦‚ à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 6, name: "Segnalazioni semaforiche e degli agenti del traffico", bn: "à¦Ÿà§à¦°à¦¾à¦«à¦¿à¦• à¦²à¦¾à¦‡à¦Ÿ à¦à¦¬à¦‚ à¦Ÿà§à¦°à¦¾à¦«à¦¿à¦• à¦ªà§à¦²à¦¿à¦¶à§‡à¦° à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 7, name: "Pericolo e intralcio, limiti di velocitÃ , distanza di sicurezza", bn: "à¦¬à¦¿à¦ªà¦¦ à¦“ à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à¦•à¦¤à¦¾, à¦—à¦¤à¦¿à¦¸à§€à¦®à¦¾, à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¦à§‚à¦°à¦¤à§à¦¬" },
    { id: 8, name: "Norme sulla circolazione dei veicoli (precedenze)", bn: "à¦¯à¦¾à¦¨à¦¬à¦¾à¦¹à¦¨ à¦šà¦²à¦¾à¦šà§‡à¦²à§‡à¦° à¦¨à¦¿à§Ÿà¦® (à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦°)" },
    { id: 9, name: "Esempi di precedenza (rappresentazioni grafiche)", bn: "à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦°à§‡à¦° à¦šà¦¿à¦¤à§à¦°à¦­à¦¿à¦¤à§à¦¤à¦¿à¦• à¦‰à¦¦à¦¾à¦¹à¦°à¦£" },
    { id: 10, name: "Norme sul sorpasso", bn: "à¦“à¦­à¦¾à¦°à¦Ÿà§‡à¦•à¦¿à¦‚à§Ÿà§‡à¦° à¦¨à¦¿à§Ÿà¦®à¦¾à¦¬à¦²à¦¿" },
    { id: 11, name: "Fermata, sosta, partenza e ingombro della carreggiata", bn: "à¦¥à¦¾à¦®à¦¾, à¦ªà¦¾à¦°à§à¦•à¦¿à¦‚, à¦¯à¦¾à¦¤à§à¦°à¦¾ à¦¶à§à¦°à§ à¦à¦¬à¦‚ à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à¦•à¦¤à¦¾ à¦¸à§ƒà¦·à§à¦Ÿà¦¿" },
    { id: 12, name: "Norme sull'uso delle luci, dispositivi acustici, spie", bn: "à¦²à¦¾à¦‡à¦Ÿ, à¦¹à¦°à§à¦¨ à¦à¦¬à¦‚ à¦‡à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿà¦° à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à§‡à¦° à¦¨à¦¿à§Ÿà¦®" },
    { id: 13, name: "Cinture di sicurezza, sistemi di ritenuta, casco", bn: "à¦¸à¦¿à¦Ÿà¦¬à§‡à¦²à§à¦Ÿ, à¦¹à§‡à¦²à¦®à§‡à¦Ÿ à¦à¦¬à¦‚ à¦šà¦¾à¦‡à¦²à§à¦¡ à¦¸à¦¿à¦Ÿ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à§‡à¦° à¦¨à¦¿à§Ÿà¦®" },
    { id: 14, name: "Patenti di guida, documenti, punti patente", bn: "à¦¡à§à¦°à¦¾à¦‡à¦­à¦¿à¦‚ à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸, à¦¨à¦¥à¦¿à¦ªà¦¤à§à¦° à¦à¦¬à¦‚ à¦ªà§‡à¦¨à¦¾à¦²à§à¦Ÿà¦¿ à¦ªà§Ÿà§‡à¦¨à§à¦Ÿ" },
    { id: 15, name: "Incidenti stradali e primo soccorso", bn: "à¦¸à§œà¦• à¦¦à§à¦°à§à¦˜à¦Ÿà¦¨à¦¾ à¦à¦¬à¦‚ à¦ªà§à¦°à¦¾à¦¥à¦®à¦¿à¦• à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾" },
    { id: 16, name: "Guida in relazione alle condizioni ambientali", bn: "à¦ªà§à¦°à¦¾à¦•à§ƒà¦¤à¦¿à¦• à¦¬à§ˆà¦°à§€ à¦ªà¦°à¦¿à¦¬à§‡à¦¶à§‡ à¦—à¦¾à§œà¦¿ à¦šà¦¾à¦²à¦¾à¦¨à§‹" },
    { id: 17, name: "ResponsabilitÃ  civile, penale, amministrativa, assicurazione", bn: "à¦†à¦‡à¦¨à¦¿ à¦“ à¦«à§Œà¦œà¦¦à¦¾à¦°à¦¿ à¦¦à¦¾à§Ÿà¦¬à¦¦à§à¦§à¦¤à¦¾ à¦à¦¬à¦‚ à¦‡à¦¨à¦¸à§à¦¯à§à¦°à§‡à¦¨à§à¦¸" },
    { id: 18, name: "Limitazione dei consumi, inquinamento, elementi del veicolo", bn: "à¦œà§à¦¬à¦¾à¦²à¦¾à¦¨à¦¿ à¦¸à¦¾à¦¶à§à¦°à§Ÿ, à¦ªà¦°à¦¿à¦¬à§‡à¦¶ à¦¦à§‚à¦·à¦£ à¦à¦¬à¦‚ à¦—à¦¾à§œà¦¿à¦° à¦ªà¦¾à¦°à§à¦Ÿà¦¸" },
    { id: 19, name: "Dispositivi di equipaggiamento e specchietti retrovisori", bn: "à¦—à¦¾à§œà¦¿à¦° à¦…à¦­à§à¦¯à¦¨à§à¦¤à¦°à§€à¦£ à¦¯à¦¨à§à¦¤à§à¦°à¦ªà¦¾à¦¤à¦¿ à¦“ à¦²à§à¦•à¦¿à¦‚ à¦—à§à¦²à¦¾à¦¸" },
    { id: 20, name: "Uso ed efficienza dei dispositivi del veicolo", bn: "à¦—à¦¾à§œà¦¿à¦° à¦—à§à¦°à§à¦¤à§à¦¬à¦ªà§‚à¦°à§à¦£ à¦ªà¦¾à¦°à§à¦Ÿà¦¸à§‡à¦° à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦“ à¦•à¦¾à¦°à§à¦¯à¦•à¦¾à¦°à¦¿à¦¤à¦¾" },
    { id: 21, name: "Comportamenti alla guida in autostrada e strade extraurbane", bn: "à¦à¦•à§à¦¸à¦ªà§à¦°à§‡à¦¸à¦“à§Ÿà§‡ à¦à¦¬à¦‚ à¦¹à¦¾à¦‡à¦“à§Ÿà§‡à¦¤à§‡ à¦—à¦¾à§œà¦¿ à¦šà¦¾à¦²à¦¾à¦¨à§‹à¦° à¦¨à¦¿à§Ÿà¦®" },
    { id: 22, name: "Segnali di indicazione, pannelli integrativi, segnali turistici", bn: "à¦¨à¦¿à¦°à§à¦¦à§‡à¦¶à¦¨à¦¾à¦®à§‚à¦²à¦• à¦à¦¬à¦‚ à¦ªà¦°à§à¦¯à¦Ÿà¦¨ à¦¸à¦¾à¦‡à¦¨à¦¬à§‹à¦°à§à¦¡" },
    { id: 23, name: "Uso corretto della strada e comportamenti precauzionali", bn: "à¦°à¦¾à¦¸à§à¦¤à¦¾à¦° à¦¸à¦ à¦¿à¦• à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦à¦¬à¦‚ à¦¸à¦¤à¦°à§à¦•à¦¤à¦¾à¦®à§‚à¦²à¦• à¦†à¦šà¦°à¦£" },
    { id: 24, name: "Segnali luminosi e indicazioni degli agenti di polizia", bn: "à¦ªà§à¦²à¦¿à¦¶à§‡à¦° à¦¹à¦¾à¦¤à§‡à¦° à¦‡à¦¶à¦¾à¦°à¦¾ à¦à¦¬à¦‚ à¦¬à¦¿à¦¶à§‡à¦· à¦²à¦¾à¦‡à¦Ÿ à¦¸à¦‚à¦•à§‡à¦¤" },
    { id: 25, name: "Definizioni generali e classificazione dei veicoli", bn: "à¦¯à¦¾à¦¨à¦¬à¦¾à¦¹à¦¨à§‡à¦° à¦ªà§à¦°à¦•à¦¾à¦°à¦­à§‡à¦¦ à¦à¦¬à¦‚ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦ªà¦°à¦¿à¦šà¦¿à¦¤à¦¿" }
];

let selectedChapters = [];
let selectedSheets = [];



function getChapterIllustrationSVG(chapterId) {
    if (chapterId === 1) {
        return `
        <div class="chapter-card-illustration">
            <svg viewBox="0 0 400 130" style="background:#e2e8f0; width:100%; height:130px; display:block;">
                <rect width="400" height="130" fill="#a3b8cc"/>
                <rect y="100" width="400" height="30" fill="#7ba37b"/>
                <rect y="0" width="400" height="30" fill="#7ba37b"/>
                <rect y="85" width="400" height="15" fill="#c2c7cc"/>
                <rect y="30" width="400" height="15" fill="#c2c7cc"/>
                <rect y="45" width="400" height="40" fill="#4a4a4a"/>
                <line x1="0" y1="65" x2="400" y2="65" stroke="white" stroke-width="3" stroke-dasharray="20,15"/>
                <text x="200" y="70" fill="white" font-size="11" font-weight="800" text-anchor="middle">CARREGGIATA</text>
                <text x="200" y="20" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">LA STRADA</text>
            </svg>
        </div>`;
    } else if (chapterId === 2) {
        return `
        <div class="chapter-card-illustration">
            <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                <polygon points="100,20 60,90 140,90" fill="white" stroke="#e53e3e" stroke-width="8"/>
                <polygon points="100,20 60,90 140,90" fill="none" stroke="black" stroke-width="1"/>
                <path d="M90,80 Q100,60 110,80" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
                
                <polygon points="300,20 260,90 340,90" fill="white" stroke="#e53e3e" stroke-width="8"/>
                <polygon points="300,20 260,90 340,90" fill="none" stroke="black" stroke-width="1"/>
                <path d="M290,70 L310,70 M300,60 L300,80" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
                <text x="200" y="115" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI DI PERICOLO</text>
            </svg>
        </div>`;
    } else if (chapterId === 3) {
        return `
        <div class="chapter-card-illustration">
            <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                <circle cx="100" cy="55" r="30" fill="white" stroke="#e53e3e" stroke-width="8"/>
                <line x1="78" y1="33" x2="122" y2="77" stroke="#e53e3e" stroke-width="8"/>
                
                <circle cx="300" cy="55" r="30" fill="white" stroke="#e53e3e" stroke-width="8"/>
                <rect x="280" y="51" width="40" height="8" fill="#e53e3e"/>
                <text x="200" y="110" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI DI DIVIETO</text>
            </svg>
        </div>`;
    } else if (chapterId === 4) {
        return `
        <div class="chapter-card-illustration">
            <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                <circle cx="100" cy="55" r="30" fill="#3182ce"/>
                <path d="M100,35 L100,75 M88,63 L100,75 L112,63" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                
                <circle cx="300" cy="55" r="30" fill="#3182ce"/>
                <path d="M285,55 L315,55 M303,43 L315,55 L303,67" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="200" y="110" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI Dâ€™OBBLIGO</text>
            </svg>
        </div>`;
    } else {
        return `
        <div class="chapter-card-illustration">
            <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                <rect width="400" height="130" fill="#edf2f7"/>
                <path d="M170,65 L230,65 L200,35 Z" fill="#3182ce" opacity="0.8"/>
                <circle cx="200" cy="80" r="12" fill="#4a5568"/>
                <text x="200" y="115" fill="#4a5568" font-size="13" font-weight="bold" text-anchor="middle">Capitolo ${chapterId}</text>
            </svg>
        </div>`;
    }
}

function getSheetName(chapterId, sheetIndex) {
    const chapter1Sheets = [
        "Definizioni stradali: la strada",
        "Definizioni stradali: la carreggiata",
        "Definizioni stradali: parti della carreggiata",
        "Definizioni stradali: le corsie",
        "Definizioni stradali: marciapiede e banchina",
        "Definizioni stradali: isola di traffico",
        "Definizioni stradali: salvagente",
        "Definizioni stradali: passaggio a livello",
        "Definizioni stradali: pista ciclabile",
        "Definizioni stradali: area pedonale",
        "Definizioni stradali: zona a traffico limitato",
        "Definizioni stradali: isola pedonale",
        "Definizioni stradali: autostrada",
        "Definizioni stradali: carreggiata e corsia d'emergenza",
        "Definizioni stradali: strada extraurbana",
        "Definizioni stradali: curva e dosso",
        "Definizioni stradali: incrocio o intersezione",
        "Definizioni stradali: passaggio pedonale",
        "Definizioni stradali: passo carrabile",
        "Definizioni stradali: isola spartitraffico",
        "Definizioni stradali: banchina stradale",
        "Definizioni stradali: corsia di decelerazione",
        "Definizioni stradali: corsia di accelerazione"
    ];

    return `Pagina ${sheetIndex + 1}`;
}

function updateArgomentiPillStates() {
    const unselectPill = document.getElementById('pill-argomenti-unselect');
    const selectPill = document.getElementById('pill-argomenti-select');
    const selectAllPill = document.getElementById('pill-argomenti-select-all');

    if (unselectPill) unselectPill.classList.remove('active');
    if (selectPill) selectPill.classList.remove('active');
    if (selectAllPill) selectAllPill.classList.remove('active');

    if (selectPill) {
        selectPill.style.display = isSchedeSelectMode ? 'none' : 'inline-block';
    }

    const cards = document.querySelectorAll('#screen-argomenti-schede .scheda-item-card');
    const totalCount = cards.length;

    if (!isSchedeSelectMode && selectedSheets.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
        if (selectAllPill) selectAllPill.classList.add('active');
    } else if (isSchedeSelectMode) {
        if (selectPill) selectPill.classList.add('active');
    }
}

function unselectAllSheets() {
    selectedSheets = [];
    isSchedeSelectMode = false;
    document.querySelectorAll('.scheda-item-card').forEach(card => {
        card.classList.remove('selected-sheet-card');
    });
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
    showToast('à¦¸à¦¬ à¦ªà§ƒà¦·à§à¦ à¦¾ à¦†à¦¨-à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function selectAllSheets() {
    const currentBox = currentArgomentiChapId ? document.getElementById(`argomenti-chapter-schede-${currentArgomentiChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card') : document.querySelectorAll('#screen-argomenti-schede .scheda-item-card');

    selectedSheets = [];
    cards.forEach(card => {
        const pageId = parseInt(card.getAttribute('data-page-id'));
        if (!isNaN(pageId)) {
            selectedSheets.push(pageId);
            card.classList.add('selected-sheet-card');
        }
    });

    isSchedeSelectMode = true;
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
    showToast('à¦¸à¦¬ à¦ªà§ƒà¦·à§à¦ à¦¾ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function toggleSelectSheets() {
    isSchedeSelectMode = true;
    const currentBox = currentArgomentiChapId ? document.getElementById(`argomenti-chapter-schede-${currentArgomentiChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card') : document.querySelectorAll('#screen-argomenti-schede .scheda-item-card');

    if (selectedSheets.length === 0 && cards.length > 0) {
        const firstId = parseInt(cards[0].getAttribute('data-page-id'));
        if (!isNaN(firstId)) {
            selectedSheets = [firstId];
            cards[0].classList.add('selected-sheet-card');
        }
    }
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
}

function toggleSheetSelectionById(pageId) {
    pageId = parseInt(pageId);
    const idx = selectedSheets.indexOf(pageId);
    if (idx > -1) {
        selectedSheets.splice(idx, 1);
    } else {
        selectedSheets.push(pageId);
    }
    isSchedeSelectMode = selectedSheets.length > 0;

    const card = document.querySelector(`.scheda-item-card[data-page-id="${pageId}"]`);
    if (card) {
        if (selectedSheets.includes(pageId)) {
            card.classList.add('selected-sheet-card');
        } else {
            card.classList.remove('selected-sheet-card');
        }
    }

    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
}

function toggleSheetSelection(sheetIndex) {
    toggleSheetSelectionById(sheetIndex);
}

function updateSheetsQuizButtonVisibility() {
    const btn = document.getElementById('sheets-quiz-btn');
    if (btn) btn.style.display = 'flex';
}

function startCustomSheetsQuiz() {
    let targetSheets = [...selectedSheets];
    if (targetSheets.length === 0) {
        const currentBox = currentArgomentiChapId ? document.getElementById(`argomenti-chapter-schede-${currentArgomentiChapId}`) : null;
        const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card[data-page-id]') : document.querySelectorAll('#screen-argomenti-schede .scheda-item-card[data-page-id]');
        cards.forEach(card => {
            const pageId = parseInt(card.getAttribute('data-page-id'));
            if (!isNaN(pageId)) targetSheets.push(pageId);
        });
    }

    if (targetSheets.length === 0) {
        showToast('à¦•à§‹à¦¨à§‹ à¦ªà§ƒà¦·à§à¦ à¦¾ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }

    showToast('à¦•à§à¦‡à¦œ à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...');

    Promise.all(targetSheets.map(pageId =>
        fetch(`/api/questions/page/${pageId}?_t=` + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []))
            .catch(() => [])
    ))
        .then(results => {
            let pool = [];
            results.forEach(list => {
                list.forEach(q => {
                    pool.push({
                        id: q.id,
                        chapter: q.chapter,
                        page_id: q.page_id,
                        italian: q.italian,
                        bangla: q.bangla,
                        is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || String(q.correct_answer || '').toLowerCase() === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                        image: q.image,
                        audio: q.audio,
                        video: q.video,
                        vocabulary: q.vocabulary || []
                    });
                });
            });

            if (pool.length === 0) {
                showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦ªà§ƒà¦·à§à¦ à¦¾à¦¸à¦®à§‚à¦¹à§‡ à¦•à§‹à¦¨à§‹ à¦à¦®à¦¸à¦¿à¦•à¦¿à¦‰ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
                return;
            }

            const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
            const quizQuestions = shuffledPool.slice(0, Math.min(30, shuffledPool.length));

            showTestOptionsDialog(() => {
                testQuestions = quizQuestions;
                currentTestIndex = 0;
                testAnswers = Array(testQuestions.length).fill(null);
                practiceMode = 'exam';

                const timerPill = document.getElementById('test-timer');
                if (timerPill) {
                    timerPill.innerText = `SHEETS QUIZ`;
                    timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
                    timerPill.style.borderColor = 'var(--accent-green)';
                    timerPill.style.color = 'var(--accent-green)';
                }
                const timerLabel = document.querySelector('.test-timer-label');
                if (timerLabel) {
                    timerLabel.innerText = `${targetSheets.length} Selected Sheets`;
                }

                openScreen('test', 'Sheets Exam');
                switchTestQuestionTab(1);
                showTestQuestion();
                startTestTimer();
            });
        })
        .catch(err => {
            console.error('Error fetching sheets quiz:', err);
            showToast('à¦•à§à¦‡à¦œ à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

let allArgomentiChapters = [];
let isArgomentiSelectMode = false;

function toggleChapterSelection(id) {
    id = parseInt(id);
    const idx = selectedChapters.indexOf(id);
    if (idx > -1) {
        selectedChapters.splice(idx, 1);
    } else {
        selectedChapters.push(id);
    }
    isArgomentiSelectMode = selectedChapters.length > 0;

    const card = document.querySelector(`.chapter-image-card[data-chapter-id="${id}"]`);
    if (card) {
        if (selectedChapters.includes(id)) {
            card.classList.add('selected-chapter-card');
        } else {
            card.classList.remove('selected-chapter-card');
        }
    }

    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
}

function unselectAllArgomentiChapters() {
    selectedChapters = [];
    isArgomentiSelectMode = false;
    document.querySelectorAll('.chapter-image-card').forEach(card => {
        card.classList.remove('selected-chapter-card');
    });
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
    showToast('à¦¸à¦¬ à¦…à¦§à§à¦¯à¦¾à§Ÿ à¦†à¦¨-à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function selectAllArgomentiChapters() {
    if ((!allArgomentiChapters || allArgomentiChapters.length === 0) && window.allArgomentiChapters && window.allArgomentiChapters.length > 0) {
        allArgomentiChapters = window.allArgomentiChapters;
    }
    const cards = document.querySelectorAll('#argomenti-list .chapter-image-card');
    selectedChapters = [];
    cards.forEach(card => {
        const id = parseInt(card.getAttribute('data-chapter-id'));
        if (!isNaN(id)) {
            selectedChapters.push(id);
            card.classList.add('selected-chapter-card');
        }
    });

    if (selectedChapters.length === 0 && allArgomentiChapters.length > 0) {
        selectedChapters = allArgomentiChapters.map(c => c.id);
    }

    isArgomentiSelectMode = true;
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
    showToast('à¦¸à¦¬ à¦…à¦§à§à¦¯à¦¾à§Ÿ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function toggleSelectArgomentiChapters() {
    isArgomentiSelectMode = true;
    const cards = document.querySelectorAll('#argomenti-list .chapter-image-card');
    if (selectedChapters.length === 0 && cards.length > 0) {
        const firstId = parseInt(cards[0].getAttribute('data-chapter-id'));
        if (!isNaN(firstId)) {
            selectedChapters = [firstId];
            cards[0].classList.add('selected-chapter-card');
        }
    }
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
}

function updateCategoryQuizButtonVisibility() {
    const btn = document.getElementById('argomenti-category-quiz-btn');
    if (btn) btn.style.display = 'flex';
}

function updateArgomentiChapterPillStates() {
    const unselectPill = document.getElementById('pill-argomenti-chap-unselect');
    const selectPill = document.getElementById('pill-argomenti-chap-select');
    const selectAllPill = document.getElementById('pill-argomenti-chap-select-all');

    if (unselectPill) unselectPill.classList.remove('active');
    if (selectPill) selectPill.classList.remove('active');
    if (selectAllPill) selectAllPill.classList.remove('active');

    if (selectPill) {
        selectPill.style.display = isArgomentiSelectMode ? 'none' : 'inline-block';
    }

    const cards = document.querySelectorAll('#argomenti-list .chapter-image-card');
    const totalCount = cards.length;

    if (!isArgomentiSelectMode && selectedChapters.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
    } else if (totalCount > 0 && selectedChapters.length >= totalCount) {
        if (selectAllPill) selectAllPill.classList.add('active');
    } else if (isArgomentiSelectMode) {
        if (selectPill) selectPill.classList.add('active');
    }
}

function startArgomentiCategoryQuiz() {
    let targetChapters = [...selectedChapters];
    if (targetChapters.length === 0) {
        if ((!allArgomentiChapters || allArgomentiChapters.length === 0) && window.allArgomentiChapters) {
            allArgomentiChapters = window.allArgomentiChapters;
        }
        if (allArgomentiChapters && allArgomentiChapters.length > 0) {
            targetChapters = allArgomentiChapters.map(c => c.id);
        } else {
            const cards = document.querySelectorAll('#argomenti-list .chapter-image-card');
            cards.forEach(card => {
                const id = parseInt(card.getAttribute('data-chapter-id'));
                if (!isNaN(id)) targetChapters.push(id);
            });
        }
    }

    if (targetChapters.length === 0) {
        showToast('à¦•à§‹à¦¨à§‹ à¦…à¦§à§à¦¯à¦¾à§Ÿ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }
    showToast('à¦•à§à¦‡à¦œ à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...');

    Promise.all(targetChapters.map(chapId =>
        fetch(`/api/questions/chapter/${chapId}?_t=` + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []))
            .catch(() => [])
    ))
        .then(results => {
            let allMcqs = [];
            results.forEach(list => {
                if (Array.isArray(list)) {
                    list.forEach(q => {
                        allMcqs.push({
                            id: q.id,
                            chapter: q.chapter,
                            page_id: q.page_id,
                            italian: q.italian,
                            bangla: q.bangla,
                            is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || String(q.correct_answer || '').toLowerCase() === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                            image: q.image,
                            audio: q.audio,
                            video: q.video,
                            vocabulary: q.vocabulary || []
                        });
                    });
                }
            });

            if (allMcqs.length === 0) {
                showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦…à¦§à§à¦¯à¦¾à§Ÿà§‡à¦° à¦…à¦§à§€à¦¨à§‡ à¦•à§‹à¦¨à§‹ à¦à¦®à¦¸à¦¿à¦•à¦¿à¦‰ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
                return;
            }

            const quizQuestions = allMcqs.sort(() => Math.random() - 0.5).slice(0, Math.min(30, allMcqs.length));

            showTestOptionsDialog(() => {
                testQuestions = quizQuestions;
                currentTestIndex = 0;
                testAnswers = Array(testQuestions.length).fill(null);
                practiceMode = 'exam';

                const timerPill = document.getElementById('test-timer');
                if (timerPill) {
                    timerPill.innerText = `CHAPTER QUIZ`;
                    timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
                    timerPill.style.borderColor = 'var(--accent-green)';
                    timerPill.style.color = 'var(--accent-green)';
                }
                const timerLabel = document.querySelector('.test-timer-label');
                if (timerLabel) {
                    timerLabel.innerText = `${targetChapters.length} Selected Chapters`;
                }

                openScreen('test', 'Argomenti Exam');
                switchTestQuestionTab(1);
                showTestQuestion();
                startTestTimer();
            });
        })
        .catch(err => {
            console.error("Error creating category quiz: ", err);
            showToast('à¦•à§à¦‡à¦œ à¦¶à§à¦°à§ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function renderArgomentiList() {
    const container = document.getElementById('argomenti-list');
    if (!container) return;

    const cards = container.querySelectorAll('.chapter-image-card');
    if (cards.length > 0) {
        cards.forEach(card => {
            const id = parseInt(card.getAttribute('data-chapter-id'));
            if (selectedChapters.includes(id)) {
                card.classList.add('selected-chapter-card');
            } else {
                card.classList.remove('selected-chapter-card');
            }
        });
        updateCategoryQuizButtonVisibility();
        updateArgomentiChapterPillStates();
        return;
    }

    const userStats = getUserQuestionStats();

    fetch('/api/chapters?_t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
            const chapters = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.data) ? resData.data : []);
            allArgomentiChapters = chapters;
            const countBadge = document.getElementById('argomenti-chapters-count-badge');
            if (countBadge) {
                countBadge.innerText = `${chapters ? chapters.length : 0} Capitoli`;
            }
            container.innerHTML = '';

            if (!chapters || chapters.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;">Nessun capitolo trovato.</div>`;
                updateCategoryQuizButtonVisibility();
                updateArgomentiChapterPillStates();
                return;
            }

            chapters.forEach(ch => {
                let correct = 0;
                let wrong = 0;
                let total = ch.question_count || ch.questions_count || 0;

                for (let key in userStats) {
                    let record = userStats[key];
                    let chNum = (typeof record === 'object') ? record.chapter : null;
                    let stState = (typeof record === 'object') ? record.state : record;

                    if (chNum === ch.id) {
                        if (stState === 'correct') correct++;
                        else if (stState === 'wrong') wrong++;
                    }
                }

                const unanswered = Math.max(0, total - correct - wrong);
                const safeTotal = total > 0 ? total : 1;
                const isSelected = selectedChapters.includes(ch.id);

                const card = document.createElement('div');
                card.className = `chapter-image-card ${isSelected ? 'selected-chapter-card' : ''}`;
                card.setAttribute('data-chapter-id', ch.id);
                card.onclick = () => {
                    if (isArgomentiSelectMode) {
                        toggleChapterSelection(ch.id);
                    } else {
                        openChapterSheetsScreen(ch.id);
                    }
                };

                const rawCover = ch.cover_image || ch.image;
                const cleanCover = typeof sanitizeAppImageUrl === 'function' ? sanitizeAppImageUrl(rawCover) : rawCover;
                const coverImage = cleanCover || '';

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                            ${ch.chapter_number || ch.id}) ${ch.name}
                        </div>
                        ${coverImage ? `
                        <div class="chapter-card-img-wrapper" style="width: 100%; height: 250px; min-height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                            <img src="${coverImage}" class="chapter-card-img" alt="${ch.name}" onerror="this.parentElement.style.display='none'" style="height: 100%; width: 100%; max-height: 250px; max-width: 92%; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
                        </div>
                        ` : ''}

                        <div style="width: 100%; margin-top: 14px;">
                            <div style="text-align: center; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Progresso</div>
                            <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
                                <div>
                                    <div>Corrette</div>
                                    <div style="font-weight: 700; color: #4CAF50; margin-top: 2px;">${correct}</div>
                                </div>
                                <div>
                                    <div>Errori</div>
                                    <div style="font-weight: 700; color: #ef4444; margin-top: 2px;">${wrong}</div>
                                </div>
                                <div>
                                    <div>Non risposte</div>
                                    <div style="font-weight: 700; color: var(--text-secondary); margin-top: 2px;">${unanswered}</div>
                                </div>
                                <div>
                                    <div>Totale</div>
                                    <div style="font-weight: 700; color: var(--text-primary); margin-top: 2px;">${total}</div>
                                </div>
                            </div>
                            <div style="height: 12px; background-color: #e5e7eb; border-radius: 999px; display: flex; overflow: hidden; border: 1.5px solid #d1d5db; padding: 1px;">
                                <div style="background-color: #22c55e; width: ${(correct / safeTotal) * 100}%; border-radius: 999px 0 0 999px; transition: width 0.3s;"></div>
                                <div style="background-color: #ef4444; width: ${(wrong / safeTotal) * 100}%; transition: width 0.3s;"></div>
                                <div style="background-color: transparent; flex: 1;"></div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            updateCategoryQuizButtonVisibility();
            updateArgomentiChapterPillStates();
        })
        .catch(err => {
            console.error("Error fetching chapters: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si Ã¨ verificato un errore nel caricamento dei capitoli.</div>`;
        });
}

// --- Scegli Scheda (Sheets Selection Screen) Operations ---
let activeChapterId = null;
let activeChapterQuestions = [];
let activeChapterPages = [];
let activeSheetIndex = null;

window.chapterPagesCache = window.chapterPagesCache || {};

let isOpeningChapterSheets = false;
function openChapterSheetsScreen(chapterId) {
    if (isOpeningChapterSheets) return;
    isOpeningChapterSheets = true;
    try {
        chapterId = parseInt(chapterId);
        activeChapterId = chapterId;
        try {
            sessionStorage.setItem('activeArgomentiChapId', chapterId);
        } catch (e) { }

        const labelEl = document.getElementById('selected-chapter-display-label');

        // Instantly set chapter label from in-memory chapters list if available
        if (window.allArgomentiChapters && Array.isArray(window.allArgomentiChapters)) {
            const ch = window.allArgomentiChapters.find(c => c.id == chapterId);
            if (ch && labelEl) {
                labelEl.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
            }
        } else if (labelEl) {
            labelEl.innerText = `Capitolo ${chapterId}`;
        }

        // Toggle pre-rendered chapter schede box if present in DOM
        const allBoxes = document.querySelectorAll('.argomenti-chapter-schede-box');
        if (allBoxes.length > 0) {
            allBoxes.forEach(box => box.style.display = 'none');
            const activeBox = document.getElementById(`argomenti-chapter-schede-${chapterId}`);
            if (activeBox) {
                activeBox.style.display = 'block';
            }
        }

        populateChapterDropdownOptions();
        openScreen('argomenti-schede', 'Scegli Scheda');

        const container = document.getElementById('argomenti-schede-list');
        const hasBoxes = document.getElementById(`argomenti-chapter-schede-${chapterId}`);
        if (hasBoxes) {
            updateArgomentiPillStates();
        } else if (window.chapterPagesCache[chapterId] && window.chapterPagesCache[chapterId].length > 0) {
            // 1. Instant Fast-Path: Render immediately from cache (0ms delay)
            activeChapterPages = window.chapterPagesCache[chapterId];
            selectedSheets = [];
            isSchedeSelectMode = false;
            updateSheetsQuizButtonVisibility();
            updateArgomentiPillStates();
            renderSheetsList();
        } else if (container) {
            if (!container.classList.contains('argomenti-grid')) container.classList.add('argomenti-grid');
            container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 22px; margin-bottom: 8px;"></i><br>Caricamento schede...</div>`;
        }

        // 2. Fetch fresh chapter pages directly with cache-busting
        fetch(`/api/chapters/${chapterId}/pages?_t=` + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(pagesData => {
                const pages = Array.isArray(pagesData) ? pagesData : (pagesData && Array.isArray(pagesData.data) ? pagesData.data : []);
                activeChapterPages = pages;
                window.chapterPagesCache[chapterId] = pages;

                if (pages.length === 0) {
                    if (container) {
                        if (!container.classList.contains('argomenti-grid')) container.classList.add('argomenti-grid');
                        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px; grid-column: 1 / -1;">Nessuna pagina trovata per questo capitolo.</div>`;
                    }
                    return;
                }

                if (!isSchedeSelectMode) {
                    selectedSheets = [];
                }
                updateSheetsQuizButtonVisibility();
                updateArgomentiPillStates();
                renderSheetsList();
            })
            .catch(err => {
                console.error("Error loading chapter pages: ", err);
                if (container && !window.chapterPagesCache[chapterId] && !hasBoxes) {
                    if (!container.classList.contains('argomenti-grid')) container.classList.add('argomenti-grid');
                    container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; grid-column: 1 / -1;">Si è verificato un errore nel caricamento delle pagine.</div>`;
                }
            });
    } finally {
        isOpeningChapterSheets = false;
    }
}

function renderSheetsList() {
    const container = document.getElementById('argomenti-schede-list');
    if (!container) return;
    if (!container.classList.contains('argomenti-grid')) {
        container.classList.add('argomenti-grid');
    }
    container.innerHTML = '';

    const userStats = getUserQuestionStats();

    activeChapterPages.forEach((page, index) => {
        let pageQuestions = activeChapterQuestions.filter(q => q.page_id == page.id);
        if (!pageQuestions || pageQuestions.length === 0) {
            pageQuestions = activeChapterQuestions.slice(index * 10, (index + 1) * 10);
        }

        let correct = 0;
        let wrong = 0;
        pageQuestions.forEach(q => {
            let record = userStats[q.id];
            let stState = (typeof record === 'object') ? record.state : record;
            if (stState === 'correct') correct++;
            else if (stState === 'wrong') wrong++;
        });

        const total = pageQuestions.length || (page.questions_count || 10);
        const safeTotal = total > 0 ? total : 1;
        const unanswered = Math.max(0, total - correct - wrong);
        const isSelected = selectedSheets.includes(page.id);

        const pageNum = page.sort_order || page.page_number || (index + 1);
        let rawTitle = page.title || page.name || '';
        rawTitle = rawTitle.replace(/^pagina\s*\d+[\s\.\)\-]*/i, '').replace(/^\d+[\s\.\)\-]+/, '').trim();
        const displaySheetTitle = rawTitle ? `Pagina ${pageNum}) ${rawTitle}` : `Pagina ${pageNum}`;

        const card = document.createElement('div');
        card.className = `chapter-image-card scheda-item-card ${isSelected ? 'selected-sheet-card' : ''}`;
        card.setAttribute('data-page-id', page.id);
        card.setAttribute('data-chapter-id', activeChapterId);
        card.style.cursor = 'pointer';
        card.onclick = () => {
            if (isSchedeSelectMode) {
                toggleSheetSelectionById(page.id);
            } else {
                openPageDetailsScreen(page.id);
            }
        };

        let pageImgHTML = '';
        const cleanPageImg = typeof sanitizeAppImageUrl === 'function' ? sanitizeAppImageUrl(page.image) : (page.image && !page.image.includes('/data/user/') && !page.image.includes('scaled_IMG') ? page.image : '');
        if (cleanPageImg) {
            const imgSrc = (cleanPageImg.startsWith('http') || cleanPageImg.startsWith('/')) ? cleanPageImg : `/storage/${cleanPageImg}`;
            pageImgHTML = `
                <div class="chapter-card-img-wrapper" style="width: 100%; height: 230px; min-height: 180px; display: flex; align-items: center; justify-content: center; margin: 10px auto; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                    <img src="${imgSrc}" onerror="this.parentElement.style.display='none'" class="chapter-card-img" alt="${displaySheetTitle}" style="height: 100%; width: 100%; max-height: 230px; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                <div class="chapter-card-title" style="text-align: center; font-size: 16px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                    ${displaySheetTitle}
                </div>

                ${pageImgHTML}

                <div style="width: 100%; margin-top: 14px;">
                    <div style="text-align: center; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Progresso</div>
                    <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
                        <div>
                            <div>Corrette</div>
                            <div style="font-weight: 700; color: #4CAF50; margin-top: 2px;">${correct}</div>
                        </div>
                        <div>
                            <div>Errori</div>
                            <div style="font-weight: 700; color: #ef4444; margin-top: 2px;">${wrong}</div>
                        </div>
                        <div>
                            <div>Non risposte</div>
                            <div style="font-weight: 700; color: var(--text-secondary); margin-top: 2px;">${unanswered}</div>
                        </div>
                        <div>
                            <div>Totale</div>
                            <div style="font-weight: 700; color: var(--text-primary); margin-top: 2px;">${total}</div>
                        </div>
                    </div>
                    <div style="height: 12px; background-color: #e5e7eb; border-radius: 999px; display: flex; overflow: hidden; border: 1.5px solid #d1d5db; padding: 1px;">
                        <div style="background-color: #22c55e; width: ${(correct / safeTotal) * 100}%; border-radius: 999px 0 0 999px; transition: width 0.3s;"></div>
                        <div style="background-color: #ef4444; width: ${(wrong / safeTotal) * 100}%; transition: width 0.3s;"></div>
                        <div style="background-color: transparent; flex: 1;"></div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    updateArgomentiPillStates();
}

function toggleChapterDropdownList() {
    const panel = document.getElementById('chapter-dropdown-list-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleCartelliChapterDropdown() {
    const panel = document.getElementById('cartelli-chapter-dropdown-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function populateChapterDropdownOptions() {
    const panel = document.getElementById('chapter-dropdown-list-panel');
    if (!panel) return;
    panel.innerHTML = '';

    fetch('/api/chapters?_t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(chapters => {
            chapters.forEach(ch => {
                const item = document.createElement('div');
                item.className = `chapter-dropdown-item ${ch.id === activeChapterId ? 'active' : ''}`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    selectChapterFromDropdown(ch.id);
                };
                item.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
                panel.appendChild(item);
            });
        })
        .catch(err => {
            console.error("Error populating chapter dropdown: ", err);
        });
}

function selectChapterFromDropdown(chapterId) {
    const panel = document.getElementById('chapter-dropdown-list-panel');
    if (panel) panel.style.display = 'none';
    openChapterSheetsScreen(chapterId);
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.chapter-selector-trigger')) {
        const panel = document.getElementById('chapter-dropdown-list-panel');
        if (panel) panel.style.display = 'none';
        const cartelliPanel = document.getElementById('cartelli-chapter-dropdown-panel');
        if (cartelliPanel) cartelliPanel.style.display = 'none';
    }
});

let selectedCartelliSheets = [];

function unselectAllCartelliSheets() {
    selectedCartelliSheets = [];
    const container = document.getElementById('cartelli-schede-list');
    if (container) {
        const checkIcons = container.querySelectorAll('.fa-circle-check');
        checkIcons.forEach(icon => {
            icon.className = 'fa-regular fa-circle';
            icon.style.color = 'var(--text-secondary)';
        });
    }
}

function selectAllCartelliSheets() {
    if (typeof activeCartelliPages !== 'undefined' && Array.isArray(activeCartelliPages)) {
        selectedCartelliSheets = Array.from({ length: activeCartelliPages.length }, (_, idx) => idx);
    }
    const container = document.getElementById('cartelli-schede-list');
    if (container) {
        const icons = container.querySelectorAll('i[onclick*="toggleCartelliSheetSelection"]');
        icons.forEach(icon => {
            icon.className = 'fa-solid fa-circle-check';
            icon.style.color = 'var(--accent-green)';
        });
    }
}

function initCartelliScreen() {
    if (typeof loadCartelliChapters === 'function') loadCartelliChapters();
}

function startCustomCartelliSheetsQuiz() {
    console.log("startCustomCartelliSheetsQuiz triggered");
}

function startSheetQuiz(sheetIndex) {
    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        activeSheetIndex = sheetIndex;

        testQuestions = activeChapterQuestions.slice(sheetIndex * 10, (sheetIndex + 1) * 10);
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `SCHEDA ${sheetIndex + 1}`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'ModalitÃ  Esercitazione';
        }

        openScreen('test', 'Scheda Practice');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}

// --- 5. Navigation Logic ---
let screenHistory = ['home'];

const SCREEN_TITLES = {
    'home': 'mbanglapatenteb',
    'lezioni': 'Lezioni Video',
    'test': 'Practice Quiz',
    'argomenti': 'Argomenti',
    'argomenti-schede': 'Scegli Scheda',
    'page-details': 'Vere e False',
    'eclass': 'E-Class',
    'sfida': 'Sfida Challenge',
    'scheda-esame': 'Scheda Esame',
    'exam-simulation': 'Exam Simulation',
    'dizionario': 'Dizionario',
    'dictionary': 'Dizionario',
    'words': 'Word',
    'word': 'Word',
    'cartelli': 'Cartelli',
    'cartelli-schede': 'Scegli Scheda',
    'cartelli-page': 'Vere e False',
    'saved-mcqs': 'Saved MCQs',
    'noted-mcqs': 'Noted MCQs',
    'correct-mcqs': 'Correct MCQs',
    'wrong-mcqs': 'Wrong MCQs',
    'social': 'Patente Social',
    'profilo': 'Profilo',
    'manuale': 'Manuale',
    'translation': 'Translation',
    'test-results-detail': 'Test Details'
};

function openScreen(screenId, headerTitle, skipPushState = false) {
    if (!currentClientActive && screenId !== 'home') {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }

    const resolvedTitle = headerTitle || SCREEN_TITLES[screenId] || 'mbanglapatenteb';

    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    const appHeaderTitle = document.getElementById('app-header-title');
    const backBtn = document.getElementById('back-button');

    if (screenId === 'home') {
        if (appHeaderTitle) appHeaderTitle.innerText = 'mbanglapatenteb';
        if (backBtn) backBtn.style.display = 'none';
        screenHistory = ['home'];
        if (typeof window.initLottieAnimations === 'function') {
            window.initLottieAnimations();
        }
    } else {
        if (appHeaderTitle) appHeaderTitle.innerText = resolvedTitle;
        if (backBtn) backBtn.style.display = 'flex';
        if (screenHistory[screenHistory.length - 1] !== screenId) {
            screenHistory.push(screenId);
        }
    }

    syncBottomNav(screenId);

    // Synchronize HTML5 History API (URL in address bar)
    if (!skipPushState && typeof history !== 'undefined' && history.pushState) {
        const targetPath = screenId === 'home' ? '/' : '/' + screenId;
        if (window.location.pathname !== targetPath) {
            history.pushState({ screenId: screenId, headerTitle: resolvedTitle }, resolvedTitle, targetPath);
        }
    }

    if (screenId === 'test') {
        if (!testQuestions || testQuestions.length === 0) {
            const testIt = document.getElementById('test-question-it');
            if (testIt) testIt.innerText = 'Caricamento delle domande...';
            fetch('/api/questions/random-test?_t=' + Date.now(), { cache: 'no-store' })
                .then(r => r.json())
                .then(data => {
                    if (data && data.length > 0) {
                        practiceMode = 'exam';
                        const testList = Array.isArray(data) ? data : (data.data || []);
                        testQuestions = testList.slice(0, 30).map(q => ({
                            id: q.id,
                            italian: q.italian || q.question || '',
                            bangla: q.bangla || q.bn_question || '',
                            is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                            image: q.image,
                            audio: q.audio || q.voice,
                            video: q.video,
                            vocabulary: q.vocabulary || []
                        }));
                        currentTestIndex = 0;
                        testAnswers = Array(testQuestions.length).fill(null);
                        switchTestQuestionTab(1);
                        showTestQuestion();
                        startTestTimer();
                    } else {
                        if (testIt) testIt.innerText = 'à¦¡à¦¾à¦Ÿà¦¾à¦¬à§‡à¦¸à§‡ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦à¦¡à¦®à¦¿à¦¨ à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦¥à§‡à¦•à§‡ à¦ªà§à¦°à¦¶à§à¦¨ à¦¯à§‹à¦— à¦•à¦°à§à¦¨à¥¤';
                    }
                })
                .catch(() => {
                    if (testIt) testIt.innerText = 'à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡';
                });
        } else {
            switchTestQuestionTab(1);
            showTestQuestion();
            startTestTimer();
        }
    } else if (screenId === 'argomenti') {
        renderArgomentiList();
    } else if (screenId === 'argomenti-schede') {
        updateArgomentiPillStates();
    } else if (screenId === 'cartelli-schede') {
        if (typeof updateCartelliSchedePillStates === 'function') updateCartelliSchedePillStates();
    } else if (screenId === 'social') {
        if (typeof initSocialModule === 'function') initSocialModule();
    } else if (screenId === 'translation') {
        if (typeof initTranslationModule === 'function') initTranslationModule();
    } else if (screenId === 'scheda-esame') {
        if (typeof loadSchedaEsameModule === 'function') loadSchedaEsameModule();
    } else if (screenId === 'dizionario') {
        if (typeof initDictionary === 'function') initDictionary();
    } else if (screenId === 'dictionary') {
        if (typeof initMcqDictionary === 'function') initMcqDictionary();
    } else if (screenId === 'cartelli') {
        if (typeof renderCartelliChaptersGrid === 'function') renderCartelliChaptersGrid();
    } else if (screenId === 'saved-mcqs') {
        if (typeof loadSavedMcqsScreen === 'function') loadSavedMcqsScreen();
    } else if (screenId === 'noted-mcqs') {
        if (typeof loadNotedMcqsScreen === 'function') loadNotedMcqsScreen();
    } else if (screenId === 'correct-mcqs') {
        if (typeof loadCorrectMcqsList === 'function') loadCorrectMcqsList();
    } else if (screenId === 'wrong-mcqs') {
        if (typeof loadWrongMcqsList === 'function') loadWrongMcqsList();
    } else if (screenId === 'scheda-esame') {
        if (typeof loadExamSheets === 'function') loadExamSheets();
    } else if (screenId === 'sfida') {
        if (typeof loadLeaderboardData === 'function') loadLeaderboardData();
    } else if (screenId === 'profilo') {
        if (typeof loadUserProfileData === 'function') loadUserProfileData();
    } else if (screenId === 'manuale') {
        if (typeof loadManualeTopics === 'function') loadManualeTopics();
    } else if (screenId === 'test-results-detail') {
        if (typeof loadTestResultsDetailScreen === 'function') {
            loadTestResultsDetailScreen();
        }
    }
}

function navigateBack() {
    if (screenHistory.length === 0) {
        openScreen('home', 'mbanglapatenteb');
        return;
    }

    const activeScreen = screenHistory[screenHistory.length - 1];

    // Special confirm cases
    if (activeScreen === 'exam-simulation') {
        if (confirm("à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à§‡ à¦«à¦¿à¦°à§‡ à¦¯à§‡à¦¤à§‡ à¦šà¦¾à¦¨?")) {
            if (typeof examTimerInterval !== 'undefined') clearInterval(examTimerInterval);
            screenHistory.pop();
            openScreen('scheda-esame', 'Scheda Esame');
        }
        return;
    }
    if (activeScreen === 'test') {
        if (confirm("à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦Ÿà§‡à¦¸à§à¦Ÿ à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à§‡ à¦«à¦¿à¦°à§‡ à¦¯à§‡à¦¤à§‡ à¦šà¦¾à¦¨?")) {
            if (typeof testTimerInterval !== 'undefined') clearInterval(testTimerInterval);
            if (typeof audioProgressInterval !== 'undefined') clearInterval(audioProgressInterval);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            testQuestions = [];
            screenHistory.pop();
            openScreen('home', 'mbanglapatenteb');
        }
        return;
    }

    // Pop the current screen
    screenHistory.pop();
    const prevScreen = screenHistory.length > 0 ? screenHistory[screenHistory.length - 1] : 'home';

    // Stop audio if leaving cartelli-page
    if (activeScreen === 'cartelli-page' && typeof stopAllCartelliAudio === 'function') {
        stopAllCartelliAudio();
    }

    // Map prevScreen to title
    const titleMap = {
        'home': 'mbanglapatenteb', 'lezioni': 'Lezioni', 'test': 'Practice Quiz',
        'argomenti': 'Argomenti', 'argomenti-schede': 'Scegli Scheda',
        'page-details': 'Vere e False', 'saved-mcqs': 'Saved MCQs',
        'noted-mcqs': 'Noted MCQs',
        'correct-mcqs': 'Correct MCQs', 'wrong-mcqs': 'Wrong MCQs',
        'eclass': 'E-Class', 'sfida': 'Sfida', 'scheda-esame': 'Scheda Esame',
        'exam-simulation': 'Exam Simulation', 'dizionario': 'Word', 'dictionary': 'Dizionario',
        'cartelli': 'Cartelli', 'cartelli-schede': 'Scegli Scheda',
        'cartelli-page': 'Vere e False', 'profilo': 'Profilo',
        'manuale': 'Manuale', 'translation': 'Translation', 'test-results-detail': 'Test Details'
    };
    const prevTitle = titleMap[prevScreen] || 'mbanglapatenteb';

    // Screens that need data loading when navigating back TO them
    if (prevScreen === 'argomenti') {
        renderArgomentiList();
        openScreen('argomenti', 'Argomenti');
    } else if (prevScreen === 'argomenti-schede') {
        if (typeof activeChapterId !== 'undefined' && activeChapterId && typeof openChapterSheetsScreen === 'function') {
            openChapterSheetsScreen(activeChapterId);
        } else {
            renderArgomentiList();
            openScreen('argomenti', 'Argomenti');
        }
    } else if (prevScreen === 'cartelli') {
        renderCartelliChaptersGrid();
        openScreen('cartelli', 'Cartelli');
    } else if (prevScreen === 'cartelli-schede') {
        if (typeof cartelliActiveChapterId !== 'undefined' && cartelliActiveChapterId && typeof openCartelliSchedeScreen === 'function') {
            openCartelliSchedeScreen(cartelliActiveChapterId, true);
        } else {
            renderCartelliChaptersGrid();
            openScreen('cartelli', 'Cartelli');
        }
    } else if (prevScreen === 'test-results-detail') {
        openScreen('home', 'mbanglapatenteb');
    } else {
        openScreen(prevScreen, prevTitle);
    }
}


function clickBottomNav(screenId) {
    let title = 'mbanglapatenteb';
    if (screenId === 'test') title = 'Practice Quiz';
    else if (screenId === 'argomenti') title = 'Argomenti';
    else if (screenId === 'cartelli') title = 'Cartelli';
    else if (screenId === 'profilo') title = 'Profilo';
    else if (screenId === 'scheda-esame') title = 'Scheda Esame';
    else if (screenId === 'dizionario') title = 'Dizionario';

    if (screenId === 'argomenti' && typeof renderArgomentiList === 'function') {
        renderArgomentiList();
    } else if (screenId === 'cartelli' && typeof renderCartelliChaptersGrid === 'function') {
        renderCartelliChaptersGrid();
    }

    openScreen(screenId, title);
}

function syncBottomNav(screenId) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const navHome = document.getElementById('nav-home');
    const navTest = document.getElementById('nav-test') || document.getElementById('nav-quiz');
    const navArgomenti = document.getElementById('nav-argomenti') || document.getElementById('nav-scanner');
    const navCartelli = document.getElementById('nav-cartelli') || document.getElementById('nav-dictionary');
    const navProfile = document.getElementById('nav-profile');

    if (screenId === 'home' && navHome) {
        navHome.classList.add('active');
    } else if ((screenId === 'test' || screenId === 'scheda-esame') && navTest) {
        navTest.classList.add('active');
    } else if ((screenId === 'argomenti' || screenId === 'argomenti-schede' || screenId === 'page-details') && navArgomenti) {
        navArgomenti.classList.add('active');
    } else if ((screenId === 'cartelli' || screenId === 'cartelli-schede' || screenId === 'cartelli-page') && navCartelli) {
        navCartelli.classList.add('active');
    } else if (screenId === 'profilo' && navProfile) {
        navProfile.classList.add('active');
    }
}

// --- 6. Toast Notification System ---
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast-container');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.innerText = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Browser history back/forward navigation handler
window.addEventListener('popstate', function (event) {
    let screenId = 'home';
    let headerTitle = 'mbanglapatenteb';
    if (event.state && event.state.screenId) {
        screenId = event.state.screenId;
        headerTitle = event.state.headerTitle;
    } else {
        const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (path && SCREEN_TITLES[path]) {
            screenId = path;
            headerTitle = SCREEN_TITLES[path];
        }
    }
    // For data-dependent screens, restore data from session on popstate
    if (screenId === 'cartelli-page') {
        if (typeof loadCartelliPageScreenFromSession === 'function') {
            loadCartelliPageScreenFromSession();
        }
    } else if (screenId === 'page-details') {
        const savedPageId = sessionStorage.getItem('activePageDetailsId');
        if (savedPageId && typeof openPageDetailsScreen === 'function') {
            openPageDetailsScreen(parseInt(savedPageId));
        } else {
            openScreen('argomenti', 'Argomenti');
        }
    } else {
        openScreen(screenId, headerTitle, true);
    }
});

function restoreScreenFromUrl() {
    if (typeof currentClientActive !== 'undefined' && !currentClientActive) return;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path && path !== 'app' && SCREEN_TITLES[path]) {
        // Screens that need data loading on F5 restore
        if (path === 'cartelli-page') {
            openScreen(path, SCREEN_TITLES[path], true);
            if (typeof loadCartelliPageScreenFromSession === 'function') {
                loadCartelliPageScreenFromSession();
            }
        } else if (path === 'page-details') {
            const savedPageId = sessionStorage.getItem('activePageDetailsId');
            if (savedPageId && typeof openPageDetailsScreen === 'function') {
                openPageDetailsScreen(parseInt(savedPageId));
            } else {
                openScreen('argomenti', 'Argomenti');
            }
        } else if (path === 'dictionary' || path === 'dizionario') {
            openScreen('dictionary', 'Dizionario', true);
            if (typeof initDictionaryScreen === 'function') {
                initDictionaryScreen();
            }
        } else if (path === 'argomenti-schede') {
            const savedChapId = sessionStorage.getItem('activeArgomentiChapId');
            if (savedChapId) {
                openChapterSheetsScreen(parseInt(savedChapId));
            } else {
                fetch('/api/chapters?_t=' + Date.now(), { cache: 'no-store' })
                    .then(res => res.json())
                    .then(chapters => {
                        if (chapters && chapters.length > 0) {
                            window.allArgomentiChapters = chapters;
                            openChapterSheetsScreen(chapters[0].id);
                        } else {
                            openScreen('argomenti-schede', 'Scegli Scheda', true);
                        }
                    })
                    .catch(() => openScreen('argomenti-schede', 'Scegli Scheda', true));
            }
        } else if (path === 'cartelli-schede') {
            const savedCartelliChapId = sessionStorage.getItem('activeCartelliChapId');
            if (savedCartelliChapId && typeof openCartelliSchedeScreen === 'function') {
                openCartelliSchedeScreen(parseInt(savedCartelliChapId));
            } else {
                fetch('/api/cartelli/chapters?_t=' + Date.now(), { cache: 'no-store' })
                    .then(res => res.json())
                    .then(chapters => {
                        if (chapters && chapters.length > 0 && typeof openCartelliSchedeScreen === 'function') {
                            openCartelliSchedeScreen(chapters[0].id);
                        } else {
                            openScreen('cartelli-schede', 'Scegli Scheda', true);
                        }
                    })
                    .catch(() => openScreen('cartelli-schede', 'Scegli Scheda', true));
            }
        } else if (path === 'words' || path === 'word') {
            openScreen('dizionario', 'Word', true);
        } else {
            const activeScreen = document.querySelector('.screen.active');
            if (!activeScreen || activeScreen.id !== `screen-${path}`) {
                openScreen(path, SCREEN_TITLES[path], true);
            }
        }
    }
}
window.restoreScreenFromUrl = restoreScreenFromUrl;

// Restore active screen based on URL on initial page load / refresh
document.addEventListener('DOMContentLoaded', function () {
    restoreScreenFromUrl();
});

window.openArgomentiSchedeScreen = function (chId) {
    if (typeof openChapterSheetsScreen === 'function') {
        openChapterSheetsScreen(chId);
    }
};

window.handleArgomentiChapterCardClick = function (chId) {
    chId = parseInt(chId);
    if (typeof isArgomentiSelectMode !== 'undefined' && isArgomentiSelectMode) {
        toggleChapterSelection(chId);
    } else {
        openChapterSheetsScreen(chId);
    }
};

window.handleArgomentiSchedaClick = function (chId, pageId) {
    pageId = parseInt(pageId);
    if (typeof isSchedeSelectMode !== 'undefined' && isSchedeSelectMode) {
        toggleSheetSelectionById(pageId);
    } else {
        openPageDetailsScreen(pageId);
    }
};

window.handleCartelliChapterCardClick = function (chId) {
    chId = parseInt(chId);
    if (typeof isCartelliChapterSelectMode !== 'undefined' && isCartelliChapterSelectMode) {
        if (typeof toggleCartelliChapterSelection === 'function') toggleCartelliChapterSelection(chId);
    } else {
        if (typeof openCartelliSchedeScreen === 'function') openCartelliSchedeScreen(chId);
    }
};

window.handleCartelliSchedaCardClick = function (chId, pageId) {
    pageId = parseInt(pageId);
    if (typeof isCartelliSchedeSelectMode !== 'undefined' && isCartelliSchedeSelectMode) {
        if (typeof toggleCartelliSchedaSelection === 'function') toggleCartelliSchedaSelection(pageId);
    } else {
        if (typeof openCartelliPageScreen === 'function') openCartelliPageScreen(pageId);
    }
};

// --- 7. Lezioni (Video Player) Logic ---
function getEmbedVideoHTML(url) {
    if (!url) return '<div style="color:white; font-weight:bold; padding:20px; text-align:center;">à¦­à¦¿à¦¡à¦¿à¦“ à¦²à¦¿à¦™à§à¦• à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿</div>';

    let youtubeId = null;
    const cleanUrl = url.trim();

    if (cleanUrl.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(cleanUrl.split('?')[1] || '');
        youtubeId = urlParams.get('v');
    } else if (cleanUrl.includes('youtu.be/')) {
        youtubeId = cleanUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('youtube.com/embed/')) {
        youtubeId = cleanUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    }

    if (youtubeId) {
        return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%; height:100%; border:none; border-radius:12px;"></iframe>`;
    }

    const src = (cleanUrl.startsWith('http') || cleanUrl.startsWith('/')) ? cleanUrl : `/storage/${cleanUrl}`;
    return `<video src="${src}" controls autoplay style="width:100%; height:100%; border-radius:12px; object-fit:contain;"></video>`;
}

function playLesson(title, duration, videoUrl) {
    const modal = document.getElementById('video-player-modal');
    const modalTitle = document.getElementById('video-player-title');
    const modalSub = document.getElementById('video-player-sub');
    const playerBox = document.getElementById('video-player-box');
    if (!modal || !playerBox) return;

    if (modalTitle) modalTitle.innerText = title || 'à¦­à¦¿à¦¡à¦¿à¦“ à¦²à§‡à¦•à¦šà¦¾à¦°';
    if (modalSub) modalSub.innerText = duration ? `${duration} â€¢ à¦¬à¦¾à¦‚à¦²à¦¾ à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾` : 'à¦­à¦¿à¦¡à¦¿à¦“ à¦²à§‡à¦•à¦šà¦¾à¦°';

    playerBox.innerHTML = getEmbedVideoHTML(videoUrl);
    modal.style.display = 'flex';
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const playerBox = document.getElementById('video-player-box');
    if (modal) modal.style.display = 'none';
    if (playerBox) playerBox.innerHTML = '';
}

// --- 8. Dynamic Quiz Practice Logic (MCQ Module) ---
let quizData = [];
let currentQuizIndex = 0;

function startChapterQuiz(chapterId, chapterName) {
    showToast('à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...');
    activeChapterId = chapterId;

    fetch(`/api/questions/chapter/${chapterId}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                quizData = data;
                currentQuizIndex = 0;
                openScreen('test', `Practice: Ch ${chapterId}`);
                renderQuizQuestion();
            } else {
                showToast('à¦à¦‡ à¦…à¦§à§à¦¯à¦¾à§Ÿà§‡ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¬à§à¦¯à¦°à§à¦¥ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function renderQuizQuestion() {
    if (quizData.length === 0) return;
    const currentQ = quizData[currentQuizIndex];

    const progressText = document.getElementById('quiz-progress-text');
    const quizIt = document.getElementById('quiz-question-it');
    const quizBn = document.getElementById('quiz-question-bn');
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-quiz-btn');

    if (progressText) progressText.innerText = `à¦ªà§à¦°à¦¶à§à¦¨: ${currentQuizIndex + 1}/${quizData.length}`;
    if (quizIt) quizIt.innerHTML = highlightDictionaryTerms(currentQ.italian, currentQ.vocabulary);
    if (quizBn) quizBn.innerText = currentQ.bangla;
    if (feedback) feedback.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    const buttons = document.querySelectorAll('#screen-test .ans-btn');
    buttons.forEach(b => b.classList.remove('selected'));
}

function checkQuizAnswer(userSelection) {
    if (quizData.length === 0) return;
    const currentQ = quizData[currentQuizIndex];
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-quiz-btn');
    if (!feedback || !nextBtn) return;

    const databaseIsVero = currentQ.is_vero === 1 || currentQ.is_vero === true || currentQ.is_vero === '1';
    const isCorrect = userSelection === databaseIsVero;

    if (isCorrect) {
        feedback.className = 'feedback-box correct';
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> à¦¸à¦ à¦¿à¦• à¦‰à¦¤à§à¦¤à¦°!';
        playAppSound(true);
        updateChapterProgressLocally();
    } else {
        feedback.className = 'feedback-box incorrect';
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> à¦­à§à¦² à¦‰à¦¤à§à¦¤à¦°! à¦¸à¦ à¦¿à¦• à¦‰à¦¤à§à¦¤à¦°: ${databaseIsVero ? 'VERO' : 'FALSO'}`;
        playAppSound(false);
    }
    feedback.style.display = 'block';
    nextBtn.style.display = 'block';
}

function updateChapterProgressLocally() {
    if (!activeChapterId) return;
    const stats = JSON.parse(localStorage.getItem('chapter_progress') || '{}');
    let currentProg = stats[activeChapterId] || 0;
    if (currentProg < 100) {
        currentProg += Math.ceil(100 / quizData.length);
        if (currentProg > 100) currentProg = 100;
        stats[activeChapterId] = currentProg;
        localStorage.setItem('chapter_progress', JSON.stringify(stats));
    }
}

function nextQuizQuestion() {
    currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
    renderQuizQuestion();
}

// --- 9. Dynamic Official Exam Simulation Logic (30 Questions, Max 4 Errors) ---
let examQuestions = [];
let userExamAnswers = [];
let currentExamIndex = 0;
let examTimerInterval;
let examTimeRemaining = 30 * 60;

function initExam() {
    showToast('à¦ªà¦°à§€à¦•à§à¦·à¦¾à¦° à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...');
    examQuestions = [];
    userExamAnswers = Array(30).fill(null);
    currentExamIndex = 0;
    examTimeRemaining = 30 * 60;

    const container = document.getElementById('exam-dots-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.className = 'exam-dot';
        dot.innerText = i + 1;
        dot.id = `exam-dot-${i}`;
        dot.onclick = () => jumpToExamQuestion(i);
        container.appendChild(dot);
    }

    fetch('/api/questions/exam')
        .then(res => res.json())
        .then(data => {
            examQuestions = data;
            showExamQuestion();

            clearInterval(examTimerInterval);
            examTimerInterval = setInterval(updateExamTimer, 1000);
            updateExamTimer();
        })
        .catch(err => {
            console.error(err);
            showToast('à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¶à§à¦°à§ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function updateExamTimer() {
    if (examTimeRemaining <= 0) {
        clearInterval(examTimerInterval);
        submitExam();
        return;
    }
    examTimeRemaining--;
    const mins = Math.floor(examTimeRemaining / 60);
    const secs = examTimeRemaining % 60;
    const timerBadge = document.getElementById('exam-timer');
    if (timerBadge) {
        timerBadge.innerText = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    }
}

function showExamQuestion() {
    if (examQuestions.length === 0) return;
    const currentQ = examQuestions[currentExamIndex];

    const examQNum = document.getElementById('exam-question-number');
    const examQIt = document.getElementById('exam-question-it');
    const examQBn = document.getElementById('exam-question-bn');

    if (examQNum) examQNum.innerText = `à¦ªà§à¦°à¦¶à§à¦¨ ${currentExamIndex + 1}/à§©à§¦`;
    if (examQIt) examQIt.innerHTML = highlightDictionaryTerms(currentQ.italian, currentQ.vocabulary);
    if (examQBn) examQBn.innerText = currentQ.bangla;

    const dots = document.querySelectorAll('.exam-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentExamIndex) {
            dot.classList.add('active');
        }
    });

    const veroBtn = document.getElementById('exam-vero-btn');
    const falsoBtn = document.getElementById('exam-falso-btn');
    if (veroBtn && falsoBtn) {
        veroBtn.classList.remove('selected');
        falsoBtn.classList.remove('selected');

        if (userExamAnswers[currentExamIndex] === true) {
            veroBtn.classList.add('selected');
        } else if (userExamAnswers[currentExamIndex] === false) {
            falsoBtn.classList.add('selected');
        }
    }
}

function answerExamQuestion(answer) {
    if (examQuestions.length === 0) return;
    userExamAnswers[currentExamIndex] = answer;

    const activeDot = document.getElementById(`exam-dot-${currentExamIndex}`);
    if (activeDot) {
        activeDot.classList.add('answered');
    }
    showExamQuestion();
}

function nextExamQuestion() {
    if (currentExamIndex < 29) {
        currentExamIndex++;
        showExamQuestion();
    }
}

function jumpToExamQuestion(index) {
    currentExamIndex = index;
    showExamQuestion();
}

function submitExam() {
    if (examQuestions.length === 0) return;
    clearInterval(examTimerInterval);

    let errors = 0;
    let unanswered = 0;

    for (let i = 0; i < 30; i++) {
        const databaseIsVero = examQuestions[i].is_vero === 1 || examQuestions[i].is_vero === true || examQuestions[i].is_vero === '1';
        if (userExamAnswers[i] === null) {
            errors++;
            unanswered++;
        } else if (userExamAnswers[i] !== databaseIsVero) {
            errors++;
        }
    }

    const passed = errors <= 4;
    const modal = document.getElementById('exam-result-modal');
    const statusBadge = document.getElementById('result-badge-status');
    const errorsCount = document.getElementById('result-errors-count');
    const resultMsg = document.getElementById('result-message');

    if (errorsCount) errorsCount.innerText = `${errors} à¦Ÿà¦¿ à¦­à§à¦²`;

    if (passed) {
        if (statusBadge) {
            statusBadge.className = 'result-badge passed';
            statusBadge.innerText = 'à¦‰à¦¤à§à¦¤à§€à¦°à§à¦£ (IDONEO)';
        }
        if (resultMsg) resultMsg.innerHTML = `à¦…à¦­à¦¿à¦¨à¦¨à§à¦¦à¦¨! à¦†à¦ªà¦¨à¦¿ à¦¡à§‡à¦®à§‹ à¦ªà¦°à§€à¦•à§à¦·à¦¾à¦¯à¦¼ à¦‰à¦¤à§à¦¤à§€à¦°à§à¦£ à¦¹à§Ÿà§‡à¦›à§‡à¦¨à¥¤<br><small>à¦®à§‹à¦Ÿ à¦ªà§à¦°à¦¶à§à¦¨ à§©à§¦à¦Ÿà¦¿ â€¢ à¦…à¦¨à§à¦¤à§à¦¤à¦°à¦¿à¦¤: ${unanswered}à¦Ÿà¦¿</small>`;
        playAppSound(true);
    } else {
        if (statusBadge) {
            statusBadge.className = 'result-badge failed';
            statusBadge.innerText = 'à¦…à¦•à§ƒà¦¤à¦•à¦¾à¦°à§à¦¯ (RESPINTO)';
        }
        if (resultMsg) resultMsg.innerHTML = `à¦¦à§à¦ƒà¦–à¦¿à¦¤! à¦†à¦ªà¦¨à¦¿ à¦ªà¦°à§€à¦•à§à¦·à¦¾à§Ÿ à¦ªà¦¾à¦¸ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¦¨à¦¿à¥¤ à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à§ªà¦Ÿà¦¿ à¦­à§à¦² à¦—à§à¦°à¦¹à¦£à¦¯à§‹à¦—à§à¦¯ à¦›à¦¿à¦²à¥¤<br><small>à¦®à§‹à¦Ÿ à¦­à§à¦²: ${errors}à¦Ÿà¦¿ (à¦…à¦¨à§à¦¤à§à¦¤à¦°à¦¿à¦¤ à¦¸à¦¹)</small>`;
        playAppSound(false);
    }

    if (modal) modal.style.display = 'flex';

    const examsEl = document.getElementById('stats-exams');
    if (examsEl) {
        let completedExamsCount = parseInt(examsEl.innerText) || 0;
        examsEl.innerText = completedExamsCount + 1;
    }
}

function closeResultModal() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';
    testQuestions = [];
    practiceMode = 'exam';
    openScreen('home', 'mbanglapatenteb');
}
// --- 10. Dictionary Logic ---
if (!window.dictionaryData) {
    window.dictionaryData = [];
}
let dictionaryData = window.dictionaryData;

function fetchDictionaryData() {
    if (window.dictionaryData && window.dictionaryData.length > 0) {
        dictionaryData = window.dictionaryData;
        return;
    }
    fetch('/api/v1/dizionario')
        .then(r => r.json())
        .then(data => {
            const dbWords = Array.isArray(data) ? data : (data.data || []);
            dictionaryData = dbWords.map(dbItem => ({
                word: dbItem.italian || dbItem.word || '',
                bn: dbItem.bangla || dbItem.bn || '',
                desc_it: dbItem.definition || dbItem.desc_it || '',
                desc_bn: dbItem.bangla || dbItem.desc_bn || '',
                image: dbItem.image || '',
                audio: dbItem.audio || null,
                video: dbItem.video || null,
            })).filter(item => item.word !== '');
            window.dictionaryData = dictionaryData;
        })
        .catch(() => { });
}
if (!window.dictionaryData || window.dictionaryData.length === 0) {
    fetchDictionaryData();
}

function initDictionary() {
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;
    const existing = listContainer.querySelectorAll('.dictionary-item');
    if (existing.length > 0) return; // Keep server-rendered items!

    listContainer.innerHTML = '';

    dictionaryData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card dictionary-item';
        card.innerHTML = `
            <div class="dict-word">${item.word}</div>
            <div class="dict-meaning">${item.bn}</div>
            <div class="dict-desc">${item.desc_it}<br><span style="color: var(--accent-green); font-weight:700;">${item.desc_bn}</span></div>
        `;
        listContainer.appendChild(card);
    });
}

function filterDictionary() {
    const query = document.getElementById('dictionary-search').value.toLowerCase();
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const filtered = dictionaryData.filter(item =>
        item.word.toLowerCase().includes(query) ||
        item.bn.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-secondary);">à¦•à§‹à¦¨à§‹ à¦«à¦²à¦¾à¦«à¦² à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿!</div>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card dictionary-item';
        card.innerHTML = `
            <div class="dict-word">${item.word}</div>
            <div class="dict-meaning">${item.bn}</div>
            <div class="dict-desc">${item.desc_it}<br><span style="color: var(--accent-green); font-weight:700;">${item.desc_bn}</span></div>
        `;
        listContainer.appendChild(card);
    });
}


// --- 11. App Settings & Sound Systems ---
let soundEnabled = true;

function toggleSound(checked) {
    soundEnabled = checked;
    showToast(soundEnabled ? 'à¦¶à¦¬à§à¦¦ à¦¸à¦‚à¦•à§‡à¦¤ à¦šà¦¾à¦²à§ à¦¹à§Ÿà§‡à¦›à§‡' : 'à¦¶à¦¬à§à¦¦ à¦¸à¦‚à¦•à§‡à¦¤ à¦¬à¦¨à§à¦§ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function playAppSound(isCorrect) {
    // Sound effect completely removed as requested
    return;
}

function resetAppData() {
    if (confirm("à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤à¦­à¦¾à¦¬à§‡ à¦¸à¦¬ à¦¡à§‡à¦Ÿà¦¾ à¦°à¦¿à¦¸à§‡à¦Ÿ à¦•à¦°à¦¤à§‡ à¦šà¦¾à¦¨?")) {
        const examsEl = document.getElementById('stats-exams');
        const errorsEl = document.getElementById('stats-errors');
        if (examsEl) examsEl.innerText = '0';
        if (errorsEl) errorsEl.innerText = '0.0';
        showToast('à¦¸à¦¬ à¦¡à§‡à¦Ÿà¦¾ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦°à¦¿à¦¸à§‡à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
    }
}
// --- 12. Guest Chat System AJAX Logic ---
let chatInterval = null;
let knownChatMessageIds = new Set();
let unreadChatMessageCount = 0;
let isFirstChatLoad = true;

function playChatNotificationSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
        console.log("Notification audio play skipped: ", e);
    }
}

function updateChatHeaderUnreadBadge() {
    const badge = document.getElementById('chat-header-unread-badge');
    if (!badge) return;
    if (unreadChatMessageCount > 0) {
        badge.textContent = unreadChatMessageCount > 99 ? '99+' : unreadChatMessageCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function toggleGuestChat(show) {
    const widget = document.getElementById('guest-chat-widget');
    if (!widget) return;
    widget.style.display = show ? 'flex' : 'none';

    if (show) {
        unreadChatMessageCount = 0;
        updateChatHeaderUnreadBadge();
        const savedPhone = localStorage.getItem('app_client_phone');
        if (savedPhone && currentClientVerified) {
            setChatWidgetView('normal');
        } else {
            setChatWidgetView('verify');
        }
        checkClientActivation();
        fetchGuestChatMessages();
    }
}

function fetchGuestChatMessages() {
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;
    let url = '/api/chat/messages';
    if (savedSessionId) {
        url += '?session_id=' + encodeURIComponent(savedSessionId);
    }

    fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(res => res.json())
        .then(messages => {
            if (Array.isArray(messages)) {
                let hasNewAdminMsg = false;

                messages.forEach(msg => {
                    if (msg.id && !knownChatMessageIds.has(msg.id)) {
                        knownChatMessageIds.add(msg.id);
                        if (!isFirstChatLoad && msg.sender === 'admin') {
                            hasNewAdminMsg = true;
                            unreadChatMessageCount++;
                        }
                    }
                });

                if (isFirstChatLoad) {
                    isFirstChatLoad = false;
                } else if (hasNewAdminMsg) {
                    const widget = document.getElementById('guest-chat-widget');
                    const isChatOpen = widget && widget.style.display !== 'none' && widget.style.display !== '';
                    if (!isChatOpen) {
                        updateChatHeaderUnreadBadge();
                        playChatNotificationSound();
                    } else {
                        unreadChatMessageCount = 0;
                        updateChatHeaderUnreadBadge();
                    }
                }

                renderGuestChatMessages(messages);
            }
        })
        .catch(err => console.error("Error fetching chat: ", err));
}

function renderGuestChatMessages(messages) {
    const container = document.getElementById('guest-chat-messages');
    if (!container) return;
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¾à¦°à§à¦¤à¦¾ à¦²à¦¿à¦–à§‡ à¦šà§à¦¯à¦¾à¦Ÿ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨à¥¤ à¦°à¦¹à¦®à¦¾à¦¨ à¦¸à§à¦¯à¦¾à¦° à¦–à§à¦¬ à¦¶à§€à¦˜à§à¦°à¦‡ à¦‰à¦¤à§à¦¤à¦° à¦¦à§‡à¦¬à§‡à¦¨!</div>`;
        return;
    }

    messages.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.is_license_card || (msg.message && msg.message.includes('[LICENSE_CARD:'))) {
            const matchSec = msg.message.match(/(?:seconds|sec)=(\d+)/);
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=([0-9a-zA-Z_-]+)/);
            const key = (matchKey ? matchKey[1] : (msg.license_key || '')).trim();

            let durationStr = '';
            let days = 365;
            if (matchSec) {
                const sec = parseInt(matchSec[1], 10);
                days = Math.max(1, Math.ceil(sec / 86400));
                if (sec < 60) durationStr = `${sec} Seconds (${sec} à¦¸à§‡à¦•à§‡à¦¨à§à¦¡)`;
                else if (sec < 3600) durationStr = `${Math.round(sec / 60)} Minutes (${Math.round(sec / 60)} à¦®à¦¿à¦¨à¦¿à¦Ÿ)`;
                else if (sec < 86400) durationStr = `${Math.round(sec / 3600)} Hours (${Math.round(sec / 3600)} à¦˜à¦£à§à¦Ÿà¦¾)`;
                else {
                    const d = Math.round(sec / 86400);
                    durationStr = `${d} Days (${d} à¦¦à¦¿à¦¨)`;
                }
            } else {
                days = matchDays ? parseInt(matchDays[1], 10) : 365;
                durationStr = `${days} Days`;
                if (days === 365 || days === 366) durationStr = '1 Year (à§§ à¦¬à¦›à¦°)';
                else if (days === 730 || days === 732) durationStr = '2 Years (à§¨ à¦¬à¦›à¦°)';
                else if (days === 180) durationStr = '6 Months (à§¬ à¦®à¦¾à¦¸)';
                else if (days === 90) durationStr = '3 Months (à§© à¦®à¦¾à¦¸)';
                else if (days === 30) durationStr = '1 Month (à§§ à¦®à¦¾à¦¸)';
            }

            bubble.className = `license-card-bubble`;
            let buttonHTML = `<button class="license-card-btn" onclick="activateLicenseFromCard(${days})">Attiva Licenza (à¦à¦•à§à¦Ÿà¦¿à¦­ à¦•à¦°à§à¦¨)</button>`;
            if (currentClientActive) {
                buttonHTML = `<div style="text-align:center; padding: 6px; background:#dcfce7; color:#15803d; border-radius:8px; font-weight:bold; font-size:12px;">Licenza Attivata âœ“ (à¦à¦•à§à¦Ÿà¦¿à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡)</div>`;
            }

            bubble.innerHTML = `
                <div class="license-card-title">Chiave Licenza ${key}</div>
                <div class="license-card-duration" style="font-weight: 700; color: #ffffff; background: rgba(0, 0, 0, 0.25); padding: 7px 12px; border-radius: 8px; margin: 10px 0; font-size: 13.5px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.28); display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);">
                    <i class="fa-solid fa-clock" style="color: #fde047; font-size: 14px;"></i> <span>মেয়াদ: <strong>${durationStr}</strong></span>
                </div>
                ${buttonHTML}
            `;
        } else {
            bubble.className = `chat-bubble ${msg.sender === 'user' ? 'user' : 'admin'}`;
            const attachUrl = msg.attachment_path || msg.image_url || msg.image || msg.attachment;
            if (attachUrl) {
                let cleanSrc = attachUrl;
                if (!cleanSrc.startsWith('http') && !cleanSrc.startsWith('/') && !cleanSrc.startsWith('data:')) {
                    cleanSrc = '/' + cleanSrc;
                }
                const img = document.createElement('img');
                img.src = cleanSrc;
                img.alt = 'à¦›à¦¬à¦¿';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '240px';
                img.style.borderRadius = '12px';
                img.style.display = 'block';
                img.style.cursor = 'pointer';
                img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                img.onclick = () => window.open(cleanSrc, '_blank');
                img.onerror = function () {
                    this.style.display = 'none';
                };
                bubble.appendChild(img);

                if (msg.message && msg.message !== 'à¦›à¦¬à¦¿ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡' && msg.message !== 'Photo sent') {
                    const text = document.createElement('div');
                    text.innerText = msg.message;
                    text.style.marginTop = '6px';
                    bubble.appendChild(text);
                }
            } else {
                bubble.innerText = msg.message || '';
            }
        }

        container.appendChild(bubble);
    });

    if (scrollAtBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight;
    }
}

function activateLicenseFromCard(days) {
    showToast('à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡...');

    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    fetch('/api/client/activate', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            days: days,
            phone: savedPhone,
            session_id: savedSessionId
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentClientActive = true;
                localStorage.setItem('app_client_active', 'true');

                const lockEl = document.getElementById('app-activation-lock');
                if (lockEl) {
                    lockEl.style.display = 'none';
                }

                if (typeof closeAllModals === 'function') {
                    closeAllModals();
                }

                showToast(`ðŸŽ‰ à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡! (${days} à¦¦à¦¿à¦¨)`);
                checkClientActivation();
                fetchGuestChatMessages();
            } else {
                showToast('à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            }
        })
        .catch(err => {
            console.error("Error activating license: ", err);
            showToast('à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function triggerChatAttachment() {
    const fileInput = document.getElementById('guest-chat-file');
    if (fileInput) fileInput.click();
}

function uploadChatAttachment(input) {
    if (!input.files || !input.files[0]) return;

    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    if (!savedPhone && !currentClientVerified) {
        showToast('à¦²à¦¾à¦‡à¦­ à¦¸à¦¾à¦ªà§‹à¦°à§à¦Ÿ à¦ªà§‡à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¾à¦® à¦“ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦¾à¦®à§à¦¬à¦¾à¦° à¦¦à¦¿à¦¨');
        setChatWidgetView('verify');
        input.value = '';
        return;
    }

    const file = input.files[0];
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', '');
    if (savedSessionId) formData.append('session_id', savedSessionId);

    showToast('à¦«à¦¾à¦‡à¦² à¦†à¦ªà¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...');

    fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: formData
    })
        .then(res => {
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        })
        .then(msg => {
            input.value = '';
            fetchGuestChatMessages();
            showToast('à¦«à¦¾à¦‡à¦² à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡');
        })
        .catch(err => {
            console.error("Error uploading attachment: ", err);
            showToast('à¦«à¦¾à¦‡à¦² à¦ªà¦¾à¦ à¦¾à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function sendGuestChatMessage() {
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    if (!savedPhone && !currentClientVerified) {
        showToast('à¦²à¦¾à¦‡à¦­ à¦¸à¦¾à¦ªà§‹à¦°à§à¦Ÿ à¦ªà§‡à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¾à¦® à¦“ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦¾à¦®à§à¦¬à¦¾à¦° à¦¦à¦¿à¦¨');
        setChatWidgetView('verify');
        return;
    }

    const input = document.getElementById('guest-chat-input');
    if (!input) return;
    const messageText = input.value.trim();
    if (!messageText) return;

    input.value = '';
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({
            message: messageText,
            session_id: savedSessionId
        })
    })
        .then(res => res.json())
        .then(msg => {
            fetchGuestChatMessages();
        })
        .catch(err => console.error("Error sending message: ", err));
}

// Start continuous background polling for live chat messages
setInterval(fetchGuestChatMessages, 3000);

window.openTeacherHelpModal = function () {
    toggleGuestChat(true);
};
// --- 13. Mobile Exam Simulator (TEST) AJAX Logic ---
let testQuestions = [];
let currentTestIndex = 0;
let testAnswers = Array(30).fill(null);

function getExamDurationSeconds() {
    let mins = 20;
    if (window.APP_SETTINGS && window.APP_SETTINGS.exam_time_minutes) {
        mins = parseInt(window.APP_SETTINGS.exam_time_minutes);
    }
    return (mins > 0 ? mins : 20) * 60;
}

let testTimerSeconds = getExamDurationSeconds();
let testTimerInterval = null;
let testTranslationActive = false;
let currentTestTab = 1;
let audioProgressInterval = null;

function loadDynamicAppSettings() {
    fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
            if (data) {
                window.APP_SETTINGS = data;
                if (data.exam_time_minutes) {
                    const timerPill = document.getElementById('test-timer');
                    if (timerPill && !testTimerInterval) {
                        const mins = data.exam_time_minutes || 20;
                        timerPill.innerText = `${mins.toString().padStart(2, '0')}:00`;
                    }
                }
                if (data.font_family && typeof applyAppFontFamily === 'function') {
                    applyAppFontFamily(data.font_family, data.font_weight || 'normal');
                }
            }
        })
        .catch(err => console.error("Error loading app settings:", err));
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDynamicAppSettings);
} else {
    loadDynamicAppSettings();
}

function startTestMode(mode) {
    if (mode === 'random') {
        const selEl = document.getElementById('test-mode-selection-container');
        const quizEl = document.getElementById('test-quiz-ui-container');
        if (selEl) selEl.style.display = 'none';
        if (quizEl) quizEl.style.display = 'block';

        practiceMode = 'exam';
        initRandomTestQuiz();
    } else if (mode === 'argomenti') {
        openScreen('argomenti', 'Argomenti');
    } else if (mode === 'cartelli') {
        openScreen('cartelli', 'Cartelli');
    }
}

function initRandomTestQuiz() {
    if (testTimerInterval) {
        clearInterval(testTimerInterval);
    }
    testQuestions = [];
    currentTestIndex = 0;
    testAnswers = Array(30).fill(null);
    testTimerSeconds = getExamDurationSeconds();
    testTranslationActive = false;
    currentTestTab = 1;

    const testIt = document.getElementById('test-question-it');
    const testBn = document.getElementById('test-question-bn');
    const optBar = document.getElementById('test-options-bar');

    if (testIt) testIt.innerText = 'Caricamento delle domande...';
    if (testBn) {
        testBn.innerText = 'à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...';
        testBn.style.display = 'none';
    }
    if (optBar) optBar.style.display = 'none';

    fetch('/api/questions/random-test?_t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            const rawList = Array.isArray(data) ? data : (data.data || []);
            testQuestions = rawList.slice(0, 30);
            testAnswers = Array(testQuestions.length || 30).fill(null);
            if (testQuestions.length === 0) {
                if (testIt) testIt.innerText = 'Nessuna domanda trovata nel database.';
                return;
            }

            switchTestQuestionTab(1);
            showTestQuestion();
            startTestTimer();
        })
        .catch(err => {
            console.error("Error loading random test questions: ", err);
            showToast('à¦ªà§à¦°à¦¶à§à¦¨ à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function startTestTimer() {
    if (testTimerInterval) {
        clearInterval(testTimerInterval);
    }
    if (typeof testTimerSeconds === 'undefined' || testTimerSeconds <= 0) {
        testTimerSeconds = getExamDurationSeconds();
    }
    updateTestTimerDisplay();
    testTimerInterval = setInterval(() => {
        testTimerSeconds--;
        updateTestTimerDisplay();
        if (testTimerSeconds <= 0) {
            clearInterval(testTimerInterval);
            showToast('à¦¸à¦®à¦¯à¦¼ à¦¶à§‡à¦·! à¦ªà¦°à§€à¦•à§à¦·à¦¾à¦Ÿà¦¿ à¦œà¦®à¦¾ à¦¹à¦šà§à¦›à§‡à¥¤');
            submitTestExam();
        }
    }, 1000);
}

function updateTestTimerDisplay() {
    const minutes = Math.floor(testTimerSeconds / 60);
    const seconds = testTimerSeconds % 60;
    const timer = document.getElementById('test-timer');
    if (timer) {
        timer.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function switchTestQuestionTab(tab) {
    currentTestTab = tab;

    // Update active tab button highlight
    for (let t = 1; t <= 3; t++) {
        const tabBtn = document.getElementById(`test-tab-btn-${t}`);
        if (tabBtn) {
            if (t === tab) {
                tabBtn.classList.add('active');
            } else {
                tabBtn.classList.remove('active');
            }
        }
    }

    const tabHeader = document.querySelector('.test-pagination-tabs');
    if (tabHeader) {
        tabHeader.style.display = 'flex';
    }

    let startNum = (tab - 1) * 10 + 1;
    let endNum = tab * 10;

    const container = document.getElementById('test-num-grid');
    if (container) {
        container.innerHTML = '';
        const userStats = getUserQuestionStats();

        for (let i = startNum; i <= endNum; i++) {
            if (i - 1 >= testQuestions.length) break;

            const box = document.createElement('span');
            box.className = 'test-num-box';
            box.id = `test-num-${i - 1}`;
            box.innerText = i;
            box.onclick = () => jumpToTestQuestion(i - 1);

            if (i - 1 === currentTestIndex) {
                box.classList.add('active');
            } else {
                if (practiceMode === 'sheet') {
                    const qId = testQuestions[i - 1].id;
                    const record = userStats[qId];
                    const stState = (typeof record === 'object') ? record.state : record;
                    if (stState === 'correct') {
                        box.classList.add('answered-vero');
                    } else if (stState === 'wrong') {
                        box.classList.add('answered-falso');
                    }
                } else {
                    const ans = testAnswers[i - 1];
                    if (ans === true) {
                        box.classList.add('answered-vero');
                    } else if (ans === false) {
                        box.classList.add('answered-falso');
                    }
                }
            }
            container.appendChild(box);
        }
    }

    renderAll30MiniGrid();
}

function renderAll30MiniGrid() {
    const container = document.getElementById('test-all-30-grid');
    if (!container) return;
    container.innerHTML = '';

    const totalCount = Math.min(30, testQuestions.length);
    const userStats = getUserQuestionStats();

    for (let i = 0; i < totalCount; i++) {
        const box = document.createElement('span');
        box.className = 'test-mini-box';
        box.id = `test-mini-num-${i}`;
        box.innerText = i + 1;
        box.onclick = () => jumpToTestQuestion(i);

        if (i === currentTestIndex) {
            box.classList.add('active');
        } else {
            if (practiceMode === 'sheet' && testQuestions[i]) {
                const qId = testQuestions[i].id;
                const record = userStats[qId];
                const stState = (typeof record === 'object') ? record.state : record;
                if (stState === 'correct') {
                    box.classList.add('answered-vero');
                } else if (stState === 'wrong') {
                    box.classList.add('answered-falso');
                }
            } else {
                const ans = testAnswers[i];
                if (ans === true) {
                    box.classList.add('answered-vero');
                } else if (ans === false) {
                    box.classList.add('answered-falso');
                }
            }
        }
        container.appendChild(box);
    }
}

function jumpToTestQuestion(index) {
    if (index >= testQuestions.length) return;
    currentTestIndex = index;

    if (practiceMode === 'sheet') {
        switchTestQuestionTab(1);
    } else {
        const expectedTab = Math.floor(index / 10) + 1;
        if (expectedTab !== currentTestTab) {
            switchTestQuestionTab(expectedTab);
        } else {
            switchTestQuestionTab(currentTestTab);
        }
    }
    showTestQuestion();
}

function showTestQuestion() {
    if (testQuestions.length === 0) return;

    const q = testQuestions[currentTestIndex];

    const imgContainer = document.getElementById('test-question-img-container');
    const imgEl = document.getElementById('test-question-img');
    let imgSrc = q ? (q.image || q.figure || q.img || q.image_url || '') : '';

    if (imgContainer && imgEl) {
        if (imgSrc) {
            let finalSrc = imgSrc;
            if (!finalSrc.startsWith('http') && !finalSrc.startsWith('/') && !finalSrc.startsWith('data:')) {
                finalSrc = '/' + finalSrc;
            }
            imgEl.src = finalSrc;
            imgEl.onerror = function () {
                this.style.display = 'none';
                if (imgContainer) {
                    imgContainer.style.visibility = 'hidden';
                    imgContainer.style.border = 'none';
                    imgContainer.style.background = 'transparent';
                    imgContainer.style.boxShadow = 'none';
                }
            };
            imgEl.style.display = 'block';
            imgContainer.style.display = 'flex';
            imgContainer.style.visibility = 'visible';
            imgContainer.style.border = '1px solid var(--border-card)';
            imgContainer.style.background = '#ffffff';
            imgContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        } else {
            imgEl.src = '';
            imgEl.style.display = 'none';
            imgContainer.style.display = 'flex';
            imgContainer.style.visibility = 'hidden';
            imgContainer.style.border = 'none';
            imgContainer.style.background = 'transparent';
            imgContainer.style.boxShadow = 'none';
        }
    }

    if (typeof switchTestQuestionTab === 'function') {
        const expectedTab = Math.floor(currentTestIndex / 10) + 1;
        switchTestQuestionTab(expectedTab);
    }

    if (typeof stopAllTestAudio === 'function') {
        stopAllTestAudio();
    }

    const veroBtn = document.getElementById('test-vero-btn');
    const falsoBtn = document.getElementById('test-falso-btn');

    if (veroBtn) veroBtn.classList.remove('correct-highlight', 'wrong-highlight', 'active');
    if (falsoBtn) falsoBtn.classList.remove('correct-highlight', 'wrong-highlight', 'active');

    const testIt = document.getElementById('test-question-it');
    const testBn = document.getElementById('test-question-bn');

    const italianText = q ? (q.italian || q.question || '') : '';
    const banglaText = q ? (q.bangla || q.bn_question || '') : '';

    if (testIt) testIt.innerHTML = highlightDictionaryTerms(italianText, q ? q.vocabulary : []);
    if (testBn) {
        testBn.innerText = banglaText;
        testBn.style.display = 'none';
    }

    const currentAns = testAnswers[currentTestIndex];
    if (currentAns === true && veroBtn) {
        veroBtn.classList.add('active');
    } else if (currentAns === false && falsoBtn) {
        falsoBtn.classList.add('active');
    }

    const slider = document.getElementById('test-audio-slider');
    if (slider) slider.value = 0;
    if (audioProgressInterval) {
        clearInterval(audioProgressInterval);
    }

    // Sync test bookmark icon
    const testBookmarkIcon = document.getElementById('test-bookmark-icon');
    if (testBookmarkIcon && q) {
        const qType = (q.chapter_name && q.chapter_name.toLowerCase().includes('cartell')) ||
            (q.image && q.image.toLowerCase().includes('cartell')) ? 'cartelli' : 'argomenti';
        const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
        let isSaved = false;
        try {
            const bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
            isSaved = bookmarks.includes(q.id) || bookmarks.includes(String(q.id));
        } catch (_) { }
        testBookmarkIcon.className = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        testBookmarkIcon.style.color = isSaved ? 'var(--accent-green, #22c55e)' : '';
    }
}

function selectTestAnswer(ans) {
    if (testQuestions.length === 0) return;
    testAnswers[currentTestIndex] = ans;

    const q = testQuestions[currentTestIndex];
    const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;
    const isCorrect = (ans === databaseIsVero);

    if (isSfidaMode) {
        saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong', q.type || 'argomenti');
        const veroBtn = document.getElementById('test-vero-btn');
        const falsoBtn = document.getElementById('test-falso-btn');

        if (ans === true && veroBtn) {
            veroBtn.classList.add(isCorrect ? 'correct-highlight' : 'wrong-highlight');
        } else if (ans === false && falsoBtn) {
            falsoBtn.classList.add(isCorrect ? 'correct-highlight' : 'wrong-highlight');
        }

        if (isCorrect) {
            sfidaStreak++;
            playAppSound(true);
            const currentHighScore = parseInt(localStorage.getItem('sfida_high_score') || '0');
            if (sfidaStreak > currentHighScore) {
                localStorage.setItem('sfida_high_score', sfidaStreak);
            }
            setTimeout(() => {
                if (currentTestIndex < testQuestions.length - 1) {
                    jumpToTestQuestion(currentTestIndex + 1);
                } else {
                    startSfidaChallenge();
                }
            }, 700);
        } else {
            playAppSound(false);
            const currentHighScore = parseInt(localStorage.getItem('sfida_high_score') || '0');
            if (sfidaStreak > currentHighScore) {
                localStorage.setItem('sfida_high_score', sfidaStreak);
            }
            const finalStreak = sfidaStreak;
            isSfidaMode = false;
            sfidaStreak = 0;
            setTimeout(() => {
                showToast(`à¦­à§à¦² à¦‰à¦¤à§à¦¤à¦°! à¦–à§‡à¦²à¦¾ à¦¶à§‡à¦·à¥¤ à¦…à¦°à§à¦œà¦¿à¦¤ à¦ªà§Ÿà§‡à¦¨à§à¦Ÿ: ${finalStreak}`);
                openScreen('sfida', 'Sfida');
            }, 900);
        }
        return;
    }

    if (isImmediateCorrectionActive) {
        saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong', q.type || 'argomenti');
        playAppSound(isCorrect);

        const veroBtn = document.getElementById('test-vero-btn');
        const falsoBtn = document.getElementById('test-falso-btn');

        if (ans === true && veroBtn) {
            if (isCorrect) {
                veroBtn.classList.add('correct-highlight');
            } else {
                veroBtn.classList.add('wrong-highlight');
            }
        } else if (ans === false && falsoBtn) {
            if (isCorrect) {
                falsoBtn.classList.add('correct-highlight');
            } else {
                falsoBtn.classList.add('wrong-highlight');
            }
        }

        switchTestQuestionTab(currentTestTab);

        if (testTimerInterval && window.testAdvanceTimer) {
            clearTimeout(window.testAdvanceTimer);
        }
        window.testAdvanceTimer = setTimeout(() => {
            if (currentTestIndex < testQuestions.length - 1) {
                jumpToTestQuestion(currentTestIndex + 1);
            } else {
                if (practiceMode === 'sheet') {
                    finishSheetPractice();
                } else {
                    submitTestExam();
                }
            }
        }, 800);

    } else {
        // No immediate feedback, just highlight selection and auto-advance after 400ms
        const veroBtn = document.getElementById('test-vero-btn');
        const falsoBtn = document.getElementById('test-falso-btn');

        if (veroBtn) veroBtn.classList.remove('active');
        if (falsoBtn) falsoBtn.classList.remove('active');

        if (ans === true && veroBtn) {
            veroBtn.classList.add('active');
        } else if (ans === false && falsoBtn) {
            falsoBtn.classList.add('active');
        }

        if (window.testAdvanceTimer) {
            clearTimeout(window.testAdvanceTimer);
        }
        window.testAdvanceTimer = setTimeout(() => {
            nextTestQuestion();
        }, 400);
    }
}

function prevTestQuestion() {
    if (window.testAdvanceTimer) {
        clearTimeout(window.testAdvanceTimer);
        window.testAdvanceTimer = null;
    }
    if (currentTestIndex > 0) {
        jumpToTestQuestion(currentTestIndex - 1);
    }
}

function nextTestQuestion() {
    if (window.testAdvanceTimer) {
        clearTimeout(window.testAdvanceTimer);
        window.testAdvanceTimer = null;
    }
    if (currentTestIndex < testQuestions.length - 1) {
        jumpToTestQuestion(currentTestIndex + 1);
    } else {
        if (practiceMode === 'sheet') {
            finishSheetPractice();
        } else {
            const answeredCount = testAnswers.slice(0, testQuestions.length).filter(a => a !== null).length;
            const totalCount = testQuestions.length;
            if (answeredCount < totalCount) {
                if (confirm(`à¦†à¦ªà¦¨à¦¿ ${totalCount}à¦Ÿà¦¿à¦° à¦®à¦§à§à¦¯à§‡ ${answeredCount}à¦Ÿà¦¿ à¦ªà§à¦°à¦¶à§à¦¨à§‡à¦° à¦‰à¦¤à§à¦¤à¦° à¦¦à¦¿à§Ÿà§‡à¦›à§‡à¦¨à¥¤ à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦œà¦®à¦¾ à¦¦à¦¿à¦¤à§‡ à¦šà¦¾à¦¨?`)) {
                    submitTestExam();
                }
            } else {
                submitTestExam();
            }
        }
    }
}

function finishSheetPractice() {
    let correctCount = 0;
    const userStats = getUserQuestionStats();

    testQuestions.forEach(q => {
        const record = userStats[q.id];
        const stState = (typeof record === 'object') ? record.state : record;
        if (stState === 'correct') {
            correctCount++;
        }
    });

    alert(`à¦ªà§à¦°à§à¦¯à¦¾à¦•à¦Ÿà¦¿à¦¸ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦¹à§Ÿà§‡à¦›à§‡!\nà¦¸à¦ à¦¿à¦• à¦‰à¦¤à§à¦¤à¦°: ${correctCount}/à§§à§¦\nà¦­à§à¦² à¦‰à¦¤à§à¦¤à¦°: ${10 - correctCount}/à§§à§¦`);
    openChapterSheetsScreen(activeChapterId);
}

function toggleTestOptions() {
    const bar = document.getElementById('test-options-bar');
    if (bar) bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
}

function toggleTestTranslation() {
    const bar = document.getElementById('test-options-bar');
    if (bar) bar.style.display = 'none';

    let q = null;
    if (typeof testQuestions !== 'undefined' && testQuestions.length > 0 && typeof currentTestIndex !== 'undefined' && testQuestions[currentTestIndex]) {
        q = testQuestions[currentTestIndex];
    } else if (typeof quizData !== 'undefined' && quizData.length > 0 && typeof currentQuizIndex !== 'undefined' && quizData[currentQuizIndex]) {
        q = quizData[currentQuizIndex];
    }

    if (q) {
        const itText = q.italian || q.question || '';
        const bnText = q.bangla || q.bn_question || '';
        const vocab = q.vocabulary || [];
        const qImg = q.image || q.img || '';
        openQuestionTranslationModal(itText, bnText, vocab, qImg);
    } else {
        showToast('à¦…à¦¨à§à¦¬à¦¾à¦¦ à¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¸à¦®à§à¦­à¦¬ à¦¹à§Ÿà¦¨à¦¿');
    }
}

function populateSpeedOptions() {
    const container = document.getElementById('test-speed-popover');
    if (!container) return;
    container.innerHTML = '';

    speedOptionsList.forEach(rate => {
        const item = document.createElement('div');
        item.className = `speed-option-item ${rate === testAudioSpeed ? 'selected' : ''}`;
        item.onclick = () => selectAudioSpeed(rate);
        item.innerHTML = `
            <span>${rate}</span>
            ${rate === testAudioSpeed ? '<i class="fa-solid fa-check" style="font-size:10px;"></i>' : ''}
        `;
        container.appendChild(item);
    });
}

function toggleSpeedDropdown() {
    const popover = document.getElementById('test-speed-popover');
    if (popover) {
        const isHidden = popover.style.display === 'none' || popover.style.display === '';
        if (isHidden) {
            populateSpeedOptions();
            popover.style.display = 'flex';
        } else {
            popover.style.display = 'none';
        }
    }
}

function selectAudioSpeed(rate) {
    testAudioSpeed = rate;
    populateSpeedOptions();
    const popover = document.getElementById('test-speed-popover');
    if (popover) popover.style.display = 'none';
    showToast(`à¦—à¦¤à¦¿ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡: ${rate}x`);

    if (isSpeechSpeaking) {
        readItalianQuestionOutLoud();
    }
}

let testNativeAudio = null;
let isTestAudioPlaying = false;
let testAudioInterval = null;

function stopAllTestAudio() {
    if (testNativeAudio) {
        testNativeAudio.pause();
        testNativeAudio.currentTime = 0;
    }
    if (testAudioInterval) {
        clearInterval(testAudioInterval);
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isTestAudioPlaying = false;
    isSpeechSpeaking = false;

    const playBtn = document.getElementById('test-audio-play-btn');
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
    const slider = document.getElementById('test-audio-slider');
    if (slider) slider.value = 0;
}

// ðŸŽ¤ Speaker Button (Pure TTS) - Pronunciation of displayed Italian text only
function readItalianQuestionOutLoud() {
    if (testQuestions.length === 0) return;
    const q = testQuestions[currentTestIndex];
    const rawText = q ? (q.italian || q.question || '') : '';
    const cleanText = rawText.replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦° à¦Ÿà§‡à¦•à§à¦¸à¦Ÿ-à¦Ÿà§-à¦¸à§à¦ªà¦¿à¦š à¦¸à¦®à¦°à§à¦¥à¦¨ à¦•à¦°à§‡ à¦¨à¦¾');
    }
}

// â–¶ï¸ Play Button - MP3 Voiceover Audio File (or TTS with slider progress)
function togglePlayPauseSpeech() {
    if (testQuestions.length === 0) return;
    const q = testQuestions[currentTestIndex];
    const audioUrl = q ? (q.audio || q.voice) : null;

    if (isTestAudioPlaying || isSpeechSpeaking) {
        stopAllTestAudio();
        return;
    }

    if (audioUrl) {
        stopAllTestAudio();
        if (!testNativeAudio) {
            testNativeAudio = new Audio();
        }
        testNativeAudio.src = audioUrl;

        const playBtn = document.getElementById('test-audio-play-btn');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause" style="color: var(--text-primary);"></i>';
        isTestAudioPlaying = true;

        testNativeAudio.play().then(() => {
            const slider = document.getElementById('test-audio-slider');
            testAudioInterval = setInterval(() => {
                if (testNativeAudio.paused || testNativeAudio.ended) {
                    clearInterval(testAudioInterval);
                    return;
                }
                if (slider && testNativeAudio.duration) {
                    slider.value = (testNativeAudio.currentTime / testNativeAudio.duration) * 100;
                }
            }, 100);
        }).catch(err => {
            console.error("Error playing MP3 voiceover: ", err);
            stopAllTestAudio();
            readItalianQuestionOutLoudWithSlider();
        });

        testNativeAudio.onended = () => {
            stopAllTestAudio();
        };
    } else {
        readItalianQuestionOutLoudWithSlider();
    }
}

function readItalianQuestionOutLoudWithSlider() {
    if (testQuestions.length === 0) return;
    const q = testQuestions[currentTestIndex];
    const rawText = q ? (q.italian || q.question || '') : '';
    const cleanText = rawText.replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        isSpeechSpeaking = true;
        const playBtn = document.getElementById('test-audio-play-btn');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause" style="color: var(--text-primary);"></i>';

        let slider = document.getElementById('test-audio-slider');
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((cleanText.length / 3) / testAudioSpeed));

        if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
        }

        audioProgressInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) slider.value = prg;
            if (prg >= 100) {
                clearInterval(audioProgressInterval);
            }
        }, 200);

        utterance.onend = () => {
            clearInterval(audioProgressInterval);
            if (slider) slider.value = 100;
            isSpeechSpeaking = false;
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
        };

        utterance.onerror = () => {
            clearInterval(audioProgressInterval);
            isSpeechSpeaking = false;
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
        };

        window.speechSynthesis.speak(utterance);
    }
}

function changeAudioProgress(val) {
    if (testNativeAudio && testNativeAudio.duration) {
        testNativeAudio.currentTime = (val / 100) * testNativeAudio.duration;
    }
}

function closeTestExam() {
    if (confirm("à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à§‡ à¦¹à§‹à¦® à¦¸à§à¦•à§à¦°à¦¿à¦¨à§‡ à¦«à¦¿à¦°à§‡ à¦¯à§‡à¦¤à§‡ à¦šà¦¾à¦¨?")) {
        if (testTimerInterval) {
            clearInterval(testTimerInterval);
        }
        if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        testQuestions = [];
        practiceMode = 'exam';
        openScreen('home', 'mbanglapatenteb');
    }
}

function submitTestExam() {
    if (testQuestions.length === 0) return;
    if (testTimerInterval) {
        clearInterval(testTimerInterval);
    }
    if (audioProgressInterval) {
        clearInterval(audioProgressInterval);
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredAnswers = 0;

    const totalQuestions = testQuestions.length;
    for (let i = 0; i < totalQuestions; i++) {
        const databaseIsVero = testQuestions[i].is_vero === 1 || testQuestions[i].is_vero === true || testQuestions[i].is_vero === '1' || testQuestions[i].correct_answer === 'vero' || testQuestions[i].correct_answer === '1' || testQuestions[i].correct_answer === 1;
        if (testAnswers[i] === null) {
            unansweredAnswers++;
        } else if (testAnswers[i] === databaseIsVero) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    }

    const maxAllowedErrors = totalQuestions >= 30 ? 3 : Math.floor(totalQuestions * 0.1);
    const passed = (wrongAnswers <= maxAllowedErrors) && (correctAnswers > 0 || totalQuestions === 0);

    const txtGiusto = document.getElementById('txt-giusto');
    const txtSbagliato = document.getElementById('txt-sbagliato');
    const txtNondate = document.getElementById('txt-nondate');
    const barGiusto = document.getElementById('bar-giusto');
    const barSbagliato = document.getElementById('bar-sbagliato');
    const barNondate = document.getElementById('bar-nondate');
    const resultEmoji = document.getElementById('test-result-emoji');

    if (txtGiusto) txtGiusto.innerText = correctAnswers;
    if (txtSbagliato) txtSbagliato.innerText = wrongAnswers;
    if (txtNondate) txtNondate.innerText = unansweredAnswers;

    if (barGiusto) barGiusto.style.width = `${totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0}%`;
    if (barSbagliato) barSbagliato.style.width = `${totalQuestions > 0 ? (wrongAnswers / totalQuestions) * 100 : 0}%`;
    if (barNondate) barNondate.style.width = `${totalQuestions > 0 ? (unansweredAnswers / totalQuestions) * 100 : 0}%`;

    const happySvg = `<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" stroke="#22c55e" stroke-width="7" fill="#f0fdf4"/><circle cx="35" cy="40" r="5" fill="#22c55e"/><circle cx="65" cy="40" r="5" fill="#22c55e"/><path d="M32 58 C40 74 60 74 68 58" stroke="#22c55e" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
    const sadSvg = `<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" stroke="#ef4444" stroke-width="7" fill="#fef2f2"/><circle cx="35" cy="40" r="5" fill="#ef4444"/><circle cx="65" cy="40" r="5" fill="#ef4444"/><path d="M32 68 C40 52 60 52 68 68" stroke="#ef4444" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;

    if (resultEmoji) resultEmoji.innerHTML = passed ? happySvg : sadSvg;

    const modal = document.getElementById('exam-result-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
    }

    const examsEl = document.getElementById('stats-exams');
    if (examsEl) {
        let completedExamsCount = parseInt(examsEl.innerText) || 0;
        examsEl.innerText = completedExamsCount + 1;
    }

    // Two-way synchronization: Submit results to server database
    try {
        const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
        const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        const loggedAnswers = [];
        for (let i = 0; i < totalQuestions; i++) {
            const q = testQuestions[i];
            if (!q) continue;
            const qId = q.id;
            const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;
            const userSelected = testAnswers[i];
            const isAttempted = userSelected !== null && userSelected !== undefined;
            const isCorrect = isAttempted && (userSelected === databaseIsVero);
            const userAnswerStr = isAttempted ? (userSelected ? 'V' : 'F') : null;
            const qType = (q.chapter_name && q.chapter_name.toLowerCase().includes('cartell')) ||
                (q.image && q.image.toLowerCase().includes('cartell')) ? 'cartelli' : 'argomenti';

            loggedAnswers.push({
                question_id: qId,
                id: qId,
                question_type: qType,
                type: qType,
                user_answer: userAnswerStr,
                is_correct: isCorrect,
                correct: isCorrect ? 1 : 0,
                is_attempted: isAttempted
            });
        }

        const durationTotal = typeof getExamDurationSeconds === 'function' ? getExamDurationSeconds() : 1200;
        const timeSpent = Math.max(0, durationTotal - (testTimerSeconds || 0));

        const examPayload = {
            total_questions: totalQuestions,
            correct_count: correctAnswers,
            wrong_count: wrongAnswers,
            non_risposte_count: unansweredAnswers,
            duration_seconds: timeSpent,
            time_spent_seconds: timeSpent,
            answers: loggedAnswers,
            results: loggedAnswers,
            phone: savedPhone,
            session_id: savedSessionId
        };

        fetch('/api/v1/scheda-esame/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Client-Phone': savedPhone,
                'X-Session-ID': savedSessionId
            },
            body: JSON.stringify(examPayload)
        }).catch(err => console.warn('Scheda submit sync error:', err));
    } catch (e) {
        console.warn('Error syncing exam test results to server:', e);
    }
}

function restartCurrentTest() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';
    if (typeof stopAllTestAudio === 'function') stopAllTestAudio();
    if (typeof activeExamSession !== 'undefined' && activeExamSession && activeExamSession.id && typeof startSchedaExamSimulation === 'function') {
        startSchedaExamSimulation(activeExamSession.id);
        return;
    }
    if (typeof initRandomTestQuiz === 'function') {
        initRandomTestQuiz();
    } else if (typeof restartCurrentQuiz === 'function') {
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);
        if (typeof switchTestQuestionTab === 'function') switchTestQuestionTab(1);
        if (typeof showTestQuestion === 'function') showTestQuestion();
    }
    if (typeof openScreen === 'function') {
        openScreen('test', 'Test');
    }
}

function goHomeFromTestModal() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';
    if (typeof stopAllTestAudio === 'function') stopAllTestAudio();
    if (typeof testTimerInterval !== 'undefined' && testTimerInterval) {
        clearInterval(testTimerInterval);
    }
    if (typeof schedaExamTimerInterval !== 'undefined' && schedaExamTimerInterval) {
        clearInterval(schedaExamTimerInterval);
    }
    if (typeof openScreen === 'function') {
        openScreen('home', 'mbanglabatenteb');
    }
}

function closeResultModal() {
    goHomeFromTestModal();
}

function restartCurrentQuiz() {
    restartCurrentTest();
}

// --- 14. Detailed Results Card List Operations ---
let currentDetailFilter = 'all';
let playingDetailSpeechIndex = null;
let detailSpeechInterval = null;

function openTestDetailsView() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';

    let totalDuration = getExamDurationSeconds();
    let timeSpent = totalDuration - testTimerSeconds;
    if (timeSpent < 0) timeSpent = 0;

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredAnswers = 0;
    const totalQuestions = testQuestions.length;

    for (let i = 0; i < totalQuestions; i++) {
        const q = testQuestions[i];
        const userAnswer = testAnswers[i];
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;

        if (userAnswer === null) {
            unansweredAnswers++;
        } else if (userAnswer === databaseIsVero) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    }

    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('saved_test_detail_questions', JSON.stringify(testQuestions));
            sessionStorage.setItem('saved_test_detail_answers', JSON.stringify(testAnswers));
            sessionStorage.setItem('saved_test_detail_time_spent', timeSpent.toString());
        }
    } catch (e) {
        console.error("Error saving test detail data:", e);
    }

    openScreen('test-results-detail', 'Test Details');
}

function loadTestResultsDetailScreen() {
    if ((!testQuestions || testQuestions.length === 0) && typeof sessionStorage !== 'undefined') {
        try {
            const storedQ = sessionStorage.getItem('saved_test_detail_questions');
            const storedA = sessionStorage.getItem('saved_test_detail_answers');
            if (storedQ) {
                testQuestions = JSON.parse(storedQ);
                testAnswers = storedA ? JSON.parse(storedA) : [];
            }
        } catch (e) {
            console.error("Error restoring test details from sessionStorage:", e);
        }
    }

    if (!testQuestions || testQuestions.length === 0) {
        const container = document.getElementById('detail-cards-list-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary); font-weight: 700;">Nessun dettaglio del test disponibile.</div>';
        }
        return;
    }

    let savedTimeSpent = 0;
    try {
        if (typeof sessionStorage !== 'undefined') {
            const t = sessionStorage.getItem('saved_test_detail_time_spent');
            if (t) savedTimeSpent = parseInt(t) || 0;
        }
    } catch (e) { }

    let mins = Math.floor(savedTimeSpent / 60);
    let secs = savedTimeSpent % 60;
    const outcomeTime = document.getElementById('detail-outcome-time');
    if (outcomeTime) outcomeTime.innerText = `Tempo: ${mins} minuti ${secs} secondi`;

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredAnswers = 0;
    const totalQuestions = testQuestions.length;

    for (let i = 0; i < totalQuestions; i++) {
        const q = testQuestions[i];
        const userAnswer = testAnswers[i];
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;

        if (userAnswer === null) {
            unansweredAnswers++;
        } else if (userAnswer === databaseIsVero) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    }

    const passed = wrongAnswers <= 4;
    const emojiEl = document.getElementById('detail-outcome-emoji');
    const titleEl = document.getElementById('detail-outcome-title');
    const statusEl = document.getElementById('detail-outcome-status');
    const scoreEl = document.getElementById('detail-outcome-score');

    if (passed) {
        if (emojiEl) emojiEl.innerText = 'ðŸ˜Š';
        if (titleEl) {
            titleEl.innerText = 'Idoneo (Pass)';
            titleEl.style.color = '#4CAF50';
        }
        if (statusEl) {
            statusEl.innerHTML = 'Result: Pass <i class="fa-solid fa-check-circle" style="color: #4CAF50;"></i>';
            statusEl.style.color = '#4CAF50';
        }
    } else {
        if (emojiEl) emojiEl.innerText = 'ðŸ™„';
        if (titleEl) {
            titleEl.innerText = 'Bocciato (Fail)';
            titleEl.style.color = '#ef4444';
        }
        if (statusEl) {
            statusEl.innerHTML = 'Result: Fail <i class="fa-solid fa-times-circle" style="color: #ef4444;"></i>';
            statusEl.style.color = '#ef4444';
        }
    }

    const scorePct = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    if (scoreEl) scoreEl.innerText = `Score: ${scorePct}%`;

    const countCorrette = document.getElementById('detail-count-corrette');
    const countErrori = document.getElementById('detail-count-errori');
    const countNondate = document.getElementById('detail-count-nondate');

    if (countCorrette) countCorrette.innerText = correctAnswers;
    if (countErrori) countErrori.innerText = wrongAnswers;
    if (countNondate) countNondate.innerText = unansweredAnswers;

    const summaryTotalVal = document.getElementById('summary-total-val');
    const summaryAttemptedVal = document.getElementById('summary-attempted-val');
    const summaryCorrectVal = document.getElementById('summary-correct-val');
    const summaryIncorrectVal = document.getElementById('summary-incorrect-val');
    const summaryUnansweredVal = document.getElementById('summary-unanswered-val');

    if (summaryTotalVal) summaryTotalVal.innerText = totalQuestions;
    if (summaryAttemptedVal) summaryAttemptedVal.innerText = correctAnswers + wrongAnswers;
    if (summaryCorrectVal) summaryCorrectVal.innerText = correctAnswers;
    if (summaryIncorrectVal) summaryIncorrectVal.innerText = wrongAnswers;
    if (summaryUnansweredVal) summaryUnansweredVal.innerText = unansweredAnswers;

    const splitGiusto = document.getElementById('split-bar-giusto');
    const splitSbagliato = document.getElementById('split-bar-sbagliato');
    const splitNondate = document.getElementById('split-bar-nondate');

    if (splitGiusto) splitGiusto.style.width = `${totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0}%`;
    if (splitSbagliato) splitSbagliato.style.width = `${totalQuestions > 0 ? (wrongAnswers / totalQuestions) * 100 : 0}%`;
    if (splitNondate) splitNondate.style.width = `${totalQuestions > 0 ? (unansweredAnswers / totalQuestions) * 100 : 0}%`;

    // Populate Topic Performance Analysis
    const topicsContainer = document.getElementById('test-results-topics-analysis');
    if (topicsContainer) {
        topicsContainer.innerHTML = '';
        const topicsMap = {};
        for (let i = 0; i < totalQuestions; i++) {
            const q = testQuestions[i];
            const topicName = q.chapter_name || q.page_title || q.title || (q.italian ? (q.italian.length > 40 ? q.italian.substring(0, 40) + '...' : q.italian) : 'Argomento Generale');
            if (!topicsMap[topicName]) {
                topicsMap[topicName] = { total: 0, correct: 0 };
            }
            topicsMap[topicName].total++;
            const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;
            if (testAnswers[i] === databaseIsVero) {
                topicsMap[topicName].correct++;
            }
        }

        for (let tName in topicsMap) {
            const t = topicsMap[tName];
            const pct = Math.round((t.correct / t.total) * 100);
            const item = document.createElement('div');
            item.style.cssText = 'background-color: var(--bg-page); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-card); display: flex; flex-direction: column; gap: 6px;';
            const isNeedReview = pct < 70;
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <span style="font-weight: 800; font-size: 13px; color: var(--text-primary); flex: 1;">${tName}</span>
                    ${isNeedReview ? '<span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 12px;"><i class="fa-solid fa-triangle-exclamation"></i> Rivedere Argomento</span>' : '<span style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2); font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 12px;"><i class="fa-solid fa-circle-check"></i> Ottimo</span>'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: var(--text-secondary);">
                    <span>Risposte Corrette: <strong>${t.correct}/${t.total}</strong></span>
                    <span style="color: ${pct >= 70 ? '#4CAF50' : '#ef4444'}; font-weight: 800;">${pct}%</span>
                </div>
            `;
            topicsContainer.appendChild(item);
        }
    }

    filterDetailResults(typeof currentDetailFilter !== 'undefined' ? currentDetailFilter : 'all');
}

function filterDetailResults(filterType) {
    currentDetailFilter = filterType;
    document.querySelectorAll('.detail-toggle-btn').forEach(btn => btn.classList.remove('active'));

    const btnCorrette = document.getElementById('btn-toggle-corrette');
    const btnErrori = document.getElementById('btn-toggle-errori');
    const btnNondate = document.getElementById('btn-toggle-nondate');
    const btnAll = document.getElementById('btn-toggle-all');

    if (filterType === 'correct' && btnCorrette) {
        btnCorrette.classList.add('active');
    } else if (filterType === 'incorrect' && btnErrori) {
        btnErrori.classList.add('active');
    } else if (filterType === 'unanswered' && btnNondate) {
        btnNondate.classList.add('active');
    } else if (btnAll) {
        btnAll.classList.add('active');
    }
    renderDetailResultsList();
}

function renderDetailResultsList() {
    const container = document.getElementById('detail-cards-list-container');
    if (!container) return;
    container.innerHTML = '';

    let shownCount = 0;
    const totalQuestions = testQuestions.length;

    for (let i = 0; i < totalQuestions; i++) {
        const q = testQuestions[i];
        const userAnswer = testAnswers[i];
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;
        const isCorrect = (userAnswer === databaseIsVero);

        if (currentDetailFilter === 'correct' && (!isCorrect || userAnswer === null)) continue;
        if (currentDetailFilter === 'incorrect' && (isCorrect || userAnswer === null)) continue;
        if (currentDetailFilter === 'unanswered' && userAnswer !== null) continue;

        shownCount++;
        const card = document.createElement('div');
        card.className = `detail-q-card ${userAnswer === null ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect')}`;

        let badgeHtml = '';
        let optionVeroStyle = `border: 1px solid var(--border-card); background-color: var(--bg-page); color: var(--text-secondary);`;
        let optionFalsoStyle = `border: 1px solid var(--border-card); background-color: var(--bg-page); color: var(--text-secondary);`;

        let veroIcon = '';
        let falsoIcon = '';

        // If Vero is correct
        if (databaseIsVero) {
            optionVeroStyle += ` border-color: #4CAF50 !important; color: #4CAF50; font-weight: 900;`;
            veroIcon = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>`;

            if (userAnswer === true) {
                optionVeroStyle += ` background-color: rgba(76, 175, 80, 0.12);`;
            } else if (userAnswer === false) {
                optionFalsoStyle += ` border-color: #ef4444 !important; color: #ef4444; background-color: rgba(239, 68, 68, 0.12); font-weight: 900;`;
                falsoIcon = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>`;
            }
        } else {
            // If Falso is correct
            optionFalsoStyle += ` border-color: #4CAF50 !important; color: #4CAF50; font-weight: 900;`;
            falsoIcon = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>`;

            if (userAnswer === false) {
                optionFalsoStyle += ` background-color: rgba(76, 175, 80, 0.12);`;
            } else if (userAnswer === true) {
                optionVeroStyle += ` border-color: #ef4444 !important; color: #ef4444; background-color: rgba(239, 68, 68, 0.12); font-weight: 900;`;
                veroIcon = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>`;
            }
        }

        if (userAnswer === null) {
            badgeHtml = `<span style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.2);"><i class="fa-solid fa-circle-question"></i> No Response</span>`;
        } else if (isCorrect) {
            badgeHtml = `<span style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(76, 175, 80, 0.2);"><i class="fa-solid fa-circle-check"></i> Correct âœ”</span>`;
        } else {
            badgeHtml = `<span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.2);"><i class="fa-solid fa-circle-xmark"></i> Incorrect âœ˜</span>`;
        }

        const isArgSaved = (JSON.parse(localStorage.getItem('argomenti_bookmarks') || '[]')).includes(q.id);
        const isCartSaved = (JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]')).includes(q.id);
        const isSaved = isArgSaved || isCartSaved;

        const argNotes = JSON.parse(localStorage.getItem('argomenti_notes') || '{}');
        const cartNotes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
        const isNoted = Boolean(argNotes[q.id] || cartNotes[q.id]);

        card.id = `argomenti-q-card-${q.id}`;
        card.dataset.qid = q.id;
        card.dataset.qtype = 'argomenti';

        const rawThumb = q.image || q.img || null;
        const cleanThumb = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawThumb) : (rawThumb && !rawThumb.includes('/data/user/') && !rawThumb.includes('scaled_IMG') ? rawThumb : '');
        const qThumbImage = cleanThumb || null;

        const statKey = (q.type === 'cartelli' || String(q.id).startsWith('cartelli_')) ? `cartelli_${q.id}` : q.id;
        const qStat = (typeof getUserQuestionStats === 'function') ? (getUserQuestionStats()[statKey] || null) : null;

        card.innerHTML = `
            <div style="font-size: var(--mcq-num-font-mob, 13px); font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">${i + 1}</div>

            <div class="detail-q-header-row">
                <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 0;">
                    <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center;">
                        ${qThumbImage ? `<img src="${qThumbImage}" class="detail-q-img" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qThumbImage}')" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" title="Zoom Image">` : ''}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div class="detail-q-text-it" style="font-weight: 700; color: var(--text-primary); line-height: 1.4;">${highlightDictionaryTerms(q.italian || q.question || '', q.vocabulary)}</div>
                        <div class="detail-q-text-bn" id="detail-q-bn-${i}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || q.bn_question || ''}</div>
                    </div>
                </div>

                <div class="detail-q-action-row">
                    <button class="test-speaker-btn" onclick="readDetailQuestionSpeechTTS(${i})" title="Italiano TTS">
                        <i class="fa-solid fa-volume-high" style="font-size: 12px; color: #fff;"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #fff;">italiano</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this, 'argomenti')" style="${isSaved ? 'background: #10b981; border: 1px solid #10b981; color: #ffffff;' : 'background: #ecfdf5; border: 1px solid #10b981; color: #10b981;'}" title="Bookmark">
                        <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="font-size: 12px; ${isSaved ? 'color: #ffffff;' : 'color: #10b981;'}"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: ${isSaved ? '#ffffff' : '#10b981'};">à¦¸à§‡à¦­</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '', 'argomenti')" style="${isNoted ? 'background: #2563eb; border: 1px solid #2563eb; color: #ffffff;' : 'background: #eff6ff; border: 1px solid #3b82f6; color: #3b82f6;'}" title="Add Note">
                        <i class="${isNoted ? 'fa-solid' : 'fa-regular'} fa-note-sticky" style="font-size: 12px; ${isNoted ? 'color: #ffffff;' : ''}"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: ${isNoted ? '#ffffff' : '#3b82f6'};">à¦¨à§‹à¦Ÿ</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="toggleGuestChat(true)" style="background: #fff8f0; border: 1.5px solid #d97706;" title="Live Chat Support">
                        <i class="fa-solid fa-user-tie" style="font-size: 12px; color: #d97706;"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #d97706;">à¦²à¦¾à¦‡à¦­ à¦šà§à¦¯à¦¾à¦Ÿ</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="toggleDetailTranslation(${i})" style="background: #f0fdf4; border: 1px solid #22c55e; color: #22c55e;" title="Translate">
                        <div style="border: 1.5px solid #22c55e; border-radius: 3px; padding: 0 2px; font-size: 7.5px; font-weight: 900; line-height: 1.1;">A Z</div>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #22c55e;">à¦…à¦¨à§à¦¬à¦¾à¦¦</span>
                    </button>
                </div>
            </div>

            <div style="background: #e2e8f0; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; box-sizing: border-box; margin-bottom: 12px;">
                <button class="test-ctrl-btn" id="detail-play-btn-${i}" onclick="playDetailQuestionAudioOrSpeech(${i})" style="height: 32px; padding: 0 12px; border-radius: 16px; background: #1e293b; border: none; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" title="à¦¬à¦¾à¦‚à¦²à¦¾ à¦…à¦¡à¦¿à¦“ à¦¶à§à¦¨à§à¦¨">
                    <i class="fa-solid fa-play" style="font-size: 11px;"></i>
                    <span style="font-size: 11px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>
                </button>

                <input type="range" class="test-slider" id="detail-audio-slider-${i}" min="0" max="100" value="0" style="flex: 1; min-width: 0; width: 100%; accent-color: #22c55e; margin: 0 2px;" readonly>

                <div style="position: relative; display: flex; align-items: center; flex-shrink: 0; margin-left: auto;">
                    <button onclick="toggleDetailSpeedDropdown(event, ${i})" id="detail-speed-btn-${i}" style="height: 28px; padding: 0 8px; border-radius: 14px; background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; display: flex; align-items: center; gap: 4px; cursor: pointer; flex-shrink: 0; font-size: 11px; font-weight: 800; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="à¦…à¦¡à¦¿à¦“ à¦¸à§à¦ªà¦¿à¦¡">
                        <i class="fa-solid fa-gauge-high" style="font-size: 11px; color: #4CAF50;"></i>
                        <span id="detail-speed-lbl-${i}">${getDetailQuestionSpeed(i)}x</span>
                    </button>
                    <div id="detail-speed-popover-${i}" class="detail-speed-popover-menu" style="display: none;">
                    </div>
                </div>
            </div>

            <div style="text-align: center; font-size: 14px; font-weight: 800; display: flex; flex-direction: column; gap: 4px;">
                <div style="color: var(--text-primary);">Risposta Corretta: <span style="color: #1e293b;">${databaseIsVero ? 'V' : 'F'}</span></div>
                <div style="color: var(--text-primary);">${userAnswer === null ? '<span style="color: #f59e0b;">(TU) Non hai risposto</span>' : `(TU) Hai risposto: <span style="color: ${isCorrect ? '#4CAF50' : '#ef4444'};">${userAnswer ? 'V' : 'F'}</span>`}</div>
                ${(qStat && ((qStat.correct || 0) > 0 || (qStat.wrong || 0) > 0)) ? `
                <div style="display: flex; justify-content: center; gap: 16px; font-size: 12px; font-weight: 700; margin-top: 4px;">
                    <span style="color: #4CAF50;">Giusto ${qStat.correct || 0} volte</span>
                    <span style="color: #ef4444;">Sbagliato ${qStat.wrong || 0} volte</span>
                </div>` : ''}
            </div>
        `;
        container.appendChild(card);
    }

    if (shownCount === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda in questo filtro</div>`;
    }
}

let detailQuestionSpeeds = {};

function getDetailQuestionSpeed(index) {
    return detailQuestionSpeeds[index] || 1.0;
}

function toggleDetailSpeedDropdown(event, index) {
    if (event) event.stopPropagation();

    document.querySelectorAll('.detail-speed-popover-menu').forEach(el => {
        if (el.id !== `detail-speed-popover-${index}`) {
            el.style.display = 'none';
        }
    });

    const popover = document.getElementById(`detail-speed-popover-${index}`);
    if (!popover) return;

    const isHidden = popover.style.display === 'none' || popover.style.display === '';
    if (isHidden) {
        renderSpeedPopoverItems(index);
        popover.style.display = 'block';
    } else {
        popover.style.display = 'none';
    }
}

function renderSpeedPopoverItems(index) {
    const popover = document.getElementById(`detail-speed-popover-${index}`);
    if (!popover) return;

    const currentSpeed = getDetailQuestionSpeed(index);
    const options = [0.5, 0.75, 0.85, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

    popover.innerHTML = options.map(rate => {
        const isSelected = rate === currentSpeed;
        return `
            <div onclick="selectDetailQuestionSpeed(event, ${index}, ${rate})" style="padding: 6px 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; color: ${isSelected ? '#16a34a' : 'var(--text-primary, #1e293b)'}; background: ${isSelected ? 'rgba(34, 197, 94, 0.12)' : 'transparent'}; border-radius: 6px; user-select: none;" onmouseover="this.style.background='var(--border-card, #f1f5f9)'" onmouseout="this.style.background='${isSelected ? 'rgba(34, 197, 94, 0.12)' : 'transparent'}'">
                <span style="width: 12px; font-weight: 900; color: #16a34a;">${isSelected ? 'âœ“' : ''}</span>
                <span>${rate}</span>
            </div>
        `;
    }).join('');
}

function selectDetailQuestionSpeed(event, index, rate) {
    if (event) event.stopPropagation();
    detailQuestionSpeeds[index] = rate;

    const lbl = document.getElementById(`detail-speed-lbl-${index}`);
    if (lbl) lbl.innerText = `${rate}x`;

    const popover = document.getElementById(`detail-speed-popover-${index}`);
    if (popover) popover.style.display = 'none';

    if (activeDetailAudioIndex === index && activeDetailAudioPlayer) {
        activeDetailAudioPlayer.playbackRate = rate;
    }

    if (typeof showToast === 'function') {
        showToast(`à¦¸à§à¦ªà¦¿à¦¡: ${rate}x`);
    }
}

window.addEventListener('click', () => {
    document.querySelectorAll('.detail-speed-popover-menu').forEach(el => el.style.display = 'none');
});

function toggleDetailTranslation(index) {
    if (!testQuestions || !testQuestions[index]) return;
    const q = testQuestions[index];
    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || [], q.image || q.img || '');
}

// ðŸŽ¤ Speaker Microphone Button - Pronunciation TTS Only
function readDetailQuestionSpeechTTS(index) {
    if (!testQuestions || !testQuestions[index]) return;
    const q = testQuestions[index];
    const rawText = q.italian || q.question || '';
    const cleanText = rawText.replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = getDetailQuestionSpeed(index);
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦° à¦Ÿà§‡à¦•à§à¦¸à¦Ÿ-à¦Ÿà§-à¦¸à§à¦ªà¦¿à¦š à¦¸à¦®à¦°à§à¦¥à¦¨ à¦•à¦°à§‡ à¦¨à¦¾');
    }
}

let activeDetailAudioPlayer = null;
let activeDetailAudioIndex = null;
let detailAudioInterval = null;

function updateAudioSliderProgress(slider, val) {
    if (!slider) return;
    slider.value = val;
    slider.style.background = `linear-gradient(to right, #22c55e 0%, #22c55e ${val}%, #cbd5e1 ${val}%, #cbd5e1 100%)`;
}

function stopDetailAudioPlayer() {
    if (activeDetailAudioPlayer) {
        activeDetailAudioPlayer.pause();
        activeDetailAudioPlayer.currentTime = 0;
    }
    if (detailAudioInterval) {
        clearInterval(detailAudioInterval);
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (activeDetailAudioIndex !== null) {
        const oldBtn = document.getElementById(`detail-play-btn-${activeDetailAudioIndex}`);
        const oldSlider = document.getElementById(`detail-audio-slider-${activeDetailAudioIndex}`);
        if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';
        if (oldSlider) updateAudioSliderProgress(oldSlider, 0);
    }
    activeDetailAudioIndex = null;
}

// â–¶ï¸ Play Button - Uploaded MP3 Audio Voiceover (or TTS with slider progress)
function playDetailQuestionAudioOrSpeech(index) {
    if (!testQuestions || !testQuestions[index]) return;
    const q = testQuestions[index];
    const audioUrl = q.audio || q.voice;

    if (activeDetailAudioIndex === index) {
        stopDetailAudioPlayer();
        return;
    }

    stopDetailAudioPlayer();
    activeDetailAudioIndex = index;

    const pBtn = document.getElementById(`detail-play-btn-${index}`);
    const slider = document.getElementById(`detail-audio-slider-${index}`);

    if (audioUrl) {
        if (!activeDetailAudioPlayer) {
            activeDetailAudioPlayer = new Audio();
        }
        activeDetailAudioPlayer.src = audioUrl;
        activeDetailAudioPlayer.playbackRate = getDetailQuestionSpeed(index);

        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 11px; color: #ef4444;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';

        activeDetailAudioPlayer.play().then(() => {
            detailAudioInterval = setInterval(() => {
                if (activeDetailAudioPlayer.paused || activeDetailAudioPlayer.ended) {
                    clearInterval(detailAudioInterval);
                    return;
                }
                if (slider && activeDetailAudioPlayer.duration) {
                    let prg = (activeDetailAudioPlayer.currentTime / activeDetailAudioPlayer.duration) * 100;
                    updateAudioSliderProgress(slider, prg);
                }
            }, 100);
        }).catch(err => {
            console.error("Error playing detail MP3 audio: ", err);
            stopDetailAudioPlayer();
            readDetailQuestionSpeech(index);
        });

        activeDetailAudioPlayer.onended = () => {
            stopDetailAudioPlayer();
        };
    } else {
        readDetailQuestionSpeech(index);
    }
}

function readDetailQuestionSpeech(index) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        if (playingDetailSpeechIndex === index) {
            playingDetailSpeechIndex = null;
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            const pBtn = document.getElementById(`detail-play-btn-${index}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';
            const slider = document.getElementById(`detail-audio-slider-${index}`);
            if (slider) updateAudioSliderProgress(slider, 0);
            return;
        }

        if (playingDetailSpeechIndex !== null) {
            const oldBtn = document.getElementById(`detail-play-btn-${playingDetailSpeechIndex}`);
            const oldSlider = document.getElementById(`detail-audio-slider-${playingDetailSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';
            if (oldSlider) updateAudioSliderProgress(oldSlider, 0);
        }

        playingDetailSpeechIndex = index;
        if (detailSpeechInterval) clearInterval(detailSpeechInterval);

        const q = testQuestions[index];
        const qSpeed = getDetailQuestionSpeed(index);
        const utterance = new SpeechSynthesisUtterance(q.italian);
        utterance.lang = 'it-IT';
        utterance.rate = qSpeed;

        const pBtn = document.getElementById(`detail-play-btn-${index}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 11px; color: #ef4444;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';

        let slider = document.getElementById(`detail-audio-slider-${index}`);
        if (slider) updateAudioSliderProgress(slider, 0);
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / qSpeed));

        detailSpeechInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) updateAudioSliderProgress(slider, prg);
            if (prg >= 100) {
                clearInterval(detailSpeechInterval);
            }
        }, 200);

        utterance.onend = () => {
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            if (slider) updateAudioSliderProgress(slider, 100);
            const btn = document.getElementById(`detail-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';
            playingDetailSpeechIndex = null;
        };

        utterance.onerror = () => {
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            if (slider) updateAudioSliderProgress(slider, 0);
            const btn = document.getElementById(`detail-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">à¦¬à¦¾à¦‚à¦²à¦¾</span>';
            playingDetailSpeechIndex = null;
        };

        window.speechSynthesis.speak(utterance);
    }
}
// ==========================================
// Argomenti Page Details, Bookmarks, and Notes Features
// ==========================================

let activePageDetails = null;
let pageAudioPlaying = false;
let playingPageSpeechIndex = null;
let pageSpeechInterval = null;
let isPlayAllActive = false;

window.pageDetailsCache = window.pageDetailsCache || {};
window.cachedSavedIds = window.cachedSavedIds || [];
window.cachedNotesList = window.cachedNotesList || [];

function renderPageDetailsUI(page) {
    if (!page || !page.id) return;
    activePageDetails = page;

    const container = document.getElementById('page-questions-list-container');
    const chapterName = page.chapter?.name || '';
    const chapterNum = page.chapter?.chapter_number || page.chapter?.id || page.chapter_id;
    const chapterLabel = chapterName ? `Capitolo ${chapterNum}) ${chapterName}` : `Capitolo ${chapterNum}`;
    const chapLblEl = document.getElementById('page-details-chapter-label');
    if (chapLblEl) chapLblEl.innerText = chapterLabel;

    const pageNum = page.sort_order || page.page_number || page.id;
    const pageLblEl = document.getElementById('page-details-page-label');
    if (pageLblEl) pageLblEl.innerText = `Pagina ${pageNum}) ${page.title || ''}`;

    const descEl = document.getElementById('page-details-content-text');
    if (descEl) descEl.innerText = page.content || '';

    const mediaCont = document.getElementById('page-details-media-container');
    if (mediaCont) mediaCont.style.display = 'none';

    // Video display logic
    const videoContainer = document.getElementById('page-details-video-container');
    const videoWrapper = document.getElementById('page-video-player-wrapper');

    if (videoContainer && videoWrapper) {
        if (page.video) {
            videoContainer.style.display = 'block';

            if (page.video.includes('youtube.com') || page.video.includes('youtu.be')) {
                let videoId = '';
                if (page.video.includes('youtu.be/')) {
                    videoId = page.video.split('youtu.be/')[1].split(/[?#]/)[0];
                } else if (page.video.includes('v=')) {
                    videoId = page.video.split('v=')[1].split(/[&?#]/)[0];
                } else if (page.video.includes('embed/')) {
                    videoId = page.video.split('embed/')[1].split(/[?#]/)[0];
                }

                videoWrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius: 16px;" allowfullscreen></iframe>`;
            } else {
                videoWrapper.innerHTML = `
                    <video id="page-details-video" src="${page.video}" style="width: 100%; height: 100%; object-fit: contain;" playsinline></video>
                    
                    <div id="video-play-overlay" onclick="togglePageVideoPlay()" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); cursor: pointer; transition: background 0.3s;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white;">
                            <i class="fa-solid fa-play" id="video-overlay-icon" style="font-size: 20px; margin-left: 4px;"></i>
                        </div>
                    </div>
                    
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 10px 16px; display: flex; align-items: center; gap: 12px; color: white; z-index: 10;">
                        <i class="fa-solid fa-rotate-left" onclick="seekPageVideo(-15)" style="cursor: pointer; font-size: 14px;"></i>
                        <i class="fa-solid fa-play" id="video-ctrl-play" onclick="togglePageVideoPlay()" style="cursor: pointer; font-size: 14px; width: 14px;"></i>
                        <i class="fa-solid fa-rotate-right" onclick="seekPageVideo(15)" style="cursor: pointer; font-size: 14px;"></i>
                        
                        <span id="video-time-current" style="font-size: 11px; font-weight: bold;">00:00</span>
                        <input type="range" id="video-seek-slider" min="0" max="100" value="0" style="flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.3); outline: none; cursor: pointer;" oninput="onVideoSeekSliderInput(this.value)">
                        <span id="video-time-duration" style="font-size: 11px; font-weight: bold;">00:00</span>
                        
                        <i class="fa-solid fa-volume-high" id="video-ctrl-volume" onclick="togglePageVideoMute()" style="cursor: pointer; font-size: 14px;"></i>
                    </div>
                `;

                setTimeout(() => {
                    const video = document.getElementById('page-details-video');
                    const slider = document.getElementById('video-seek-slider');
                    const currentTxt = document.getElementById('video-time-current');
                    const durationTxt = document.getElementById('video-time-duration');

                    if (video) {
                        video.addEventListener('loadedmetadata', () => {
                            durationTxt.innerText = formatVideoTime(video.duration);
                        });
                        video.addEventListener('timeupdate', () => {
                            currentTxt.innerText = formatVideoTime(video.currentTime);
                            if (video.duration) {
                                slider.value = (video.currentTime / video.duration) * 100;
                            }
                            if (video.ended) {
                                const overlayIcon = document.getElementById('video-overlay-icon');
                                if (overlayIcon) overlayIcon.className = 'fa-solid fa-play';
                                const playOverlay = document.getElementById('video-play-overlay');
                                if (playOverlay) playOverlay.style.display = 'flex';
                                const ctrlPlay = document.getElementById('video-ctrl-play');
                                if (ctrlPlay) ctrlPlay.className = 'fa-solid fa-play';
                            }
                        });
                    }
                }, 50);
            }
        } else {
            videoContainer.style.display = 'none';
            videoWrapper.innerHTML = '';
        }
    }

    const pageAudio = document.getElementById('page-native-audio');
    if (page.audio) {
        if (pageAudio) pageAudio.src = page.audio;
    } else {
        if (pageAudio) pageAudio.src = '';
    }

    const slider = document.getElementById('page-audio-slider');
    if (slider) slider.value = 0;
    const timeLbl = document.getElementById('page-audio-time-label');
    if (timeLbl) timeLbl.innerText = '0:00 / 0:00';

    // Render questions immediately (0 delay)
    renderPageQuestionsList(page.questions || [], window.cachedSavedIds || [], window.cachedNotesList || []);
}

function openPageDetailsScreen(pageId) {
    const container = document.getElementById('page-questions-list-container');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (pageSpeechInterval) clearInterval(pageSpeechInterval);
    playingPageSpeechIndex = null;
    pageAudioPlaying = false;
    isPlayAllActive = false;

    const playBtn = document.getElementById('page-audio-play-btn');
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 12px; color: var(--accent-green);"></i>';
    const pageAudio = document.getElementById('page-native-audio');
    if (pageAudio) {
        pageAudio.pause();
        pageAudio.src = '';
    }

    const playAllBtn = document.getElementById('page-play-all-btn');
    if (playAllBtn) {
        playAllBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
        playAllBtn.style.backgroundColor = 'var(--accent-green)';
    }

    openScreen('page-details', 'Vere e False');

    // Save state for F5 reload restore
    try { sessionStorage.setItem('activePageDetailsId', pageId); } catch (e) { }

    // 1. Instant Cache Path: Render immediately if previously loaded
    if (window.pageDetailsCache[pageId]) {
        renderPageDetailsUI(window.pageDetailsCache[pageId]);
    } else if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 22px; margin-bottom: 8px;"></i><br>Caricamento domande...</div>`;
    }

    // 2. Fast single-endpoint fetch for page data
    fetch(`/api/pages/${pageId}?_t=` + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
            const page = (resData && resData.data) ? resData.data : resData;
            if (!page || !page.id) {
                if (container) container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Pagina non trovata.</div>`;
                return;
            }

            window.pageDetailsCache[pageId] = page;
            renderPageDetailsUI(page);

            // 3. Refresh user bookmarks & notes in background without blocking
            Promise.all([
                fetch('/api/saved-mcqs').then(r => r.json()).catch(() => []),
                fetch(`/api/notes?page_id=${page.id}`).then(r => r.json()).catch(() => [])
            ]).then(([savedList, notesList]) => {
                const savedArr = Array.isArray(savedList) ? savedList : (savedList && Array.isArray(savedList.data) ? savedList.data : []);
                window.cachedSavedIds = savedArr.map(s => s.question_id || s.id);
                const notesArr = Array.isArray(notesList) ? notesList : (notesList && Array.isArray(notesList.data) ? notesList.data : []);
                window.cachedNotesList = notesArr;

                // Seamlessly update bookmark icons on rendered cards
                if (Array.isArray(page.questions)) {
                    page.questions.forEach(q => {
                        const isSaved = window.cachedSavedIds.includes(q.id);
                        const card = document.getElementById(`argomenti-q-card-${q.id}`);
                        if (card) {
                            const bookmarkIcon = card.querySelector('.fa-bookmark');
                            if (bookmarkIcon) {
                                bookmarkIcon.className = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                                bookmarkIcon.style.color = isSaved ? 'var(--accent-green)' : '';
                                const span = bookmarkIcon.closest('button')?.querySelector('span');
                                if (span) span.style.color = isSaved ? 'var(--accent-green)' : 'var(--text-secondary)';
                            }
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.error("Error fetching page details: ", err);
            if (!window.pageDetailsCache[pageId] && container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si Ã¨ verificato un errore nel caricamento.</div>`;
            }
        });
}

function renderPageQuestionsList(questions, savedIds, notesList) {
    const container = document.getElementById('page-questions-list-container');
    if (!container) return;
    container.innerHTML = '';

    if (!Array.isArray(questions)) return;

    const userStats = getUserQuestionStats();

    questions.forEach((q, index) => {
        const isSaved = savedIds.includes(q.id);
        const userNote = notesList.find(n => n.question_id === q.id);
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

        const record = userStats[q.id];
        const hasDbStats = typeof q.correct_count === 'number' && typeof q.wrong_count === 'number';
        let correctCount = hasDbStats ? q.correct_count : 0;
        let wrongCount = hasDbStats ? q.wrong_count : 0;

        if (!hasDbStats && record && typeof record === 'object') {
            correctCount = (typeof record.correct === 'number') ? record.correct : 0;
            wrongCount = (typeof record.wrong === 'number') ? record.wrong : 0;
        }

        let isAnswered = (correctCount > 0 || wrongCount > 0 || (q.user_answer !== null && q.user_answer !== undefined && q.user_answer !== '') || (record && record.state));

        const card = document.createElement('div');
        const isCorrect = isAnswered && ((record && record.state === 'correct') || q.is_correct === true || correctCount > wrongCount);
        card.className = `detail-q-card ${!isAnswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect')}`;
        card.id = `argomenti-q-card-${q.id}`;
        card.setAttribute('data-qid', q.id);
        card.style.position = 'relative';

        card.onclick = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) return;
            if (window.isArgomentiSelectionMode) {
                card.classList.toggle('selected-q-card');
                updateArgomentiSelectionPills();
            }
        };

        const saveIconClass = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const saveIconColor = isSaved ? 'color: var(--accent-green);' : '';

        const statsHtml = isAnswered ? `
            <div style="flex: 1; font-size: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 6px 12px; background: rgba(241, 245, 249, 0.6); border: 1px solid var(--border-card); border-radius: 12px;">
                <div style="color: #475569; font-weight: 600; font-size: 12px;">(TU) Hai risposto:</div>
                <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 600;">
                    <span style="color: #16a34a;">Giusto ${correctCount} volte</span>
                    <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                </div>
            </div>
        ` : '<div style="flex: 1;"></div>';

        const rawQImage = q.image || q.img || null;
        const cleanQImage = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawQImage) : (rawQImage && !rawQImage.includes('/data/user/') && !rawQImage.includes('scaled_IMG') ? rawQImage : '');

        const hasImage = !!cleanQImage;
        const imgPos = q.image_position || 'left';
        const showTopImg = hasImage && (imgPos === 'top' || imgPos === 'both');
        const showLeftImg = hasImage && (imgPos === 'left' || imgPos === 'both');

        if (showTopImg) {
            const topImgCard = document.createElement('div');
            topImgCard.className = 'detail-q-top-image-card';
            topImgCard.style.cssText = 'padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; margin-top: 16px; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.03);';
            topImgCard.innerHTML = `<img src="${cleanQImage}" onerror="this.parentElement.style.display='none'" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${cleanQImage}')" style="max-width: 100%; height: auto; max-height: 450px; object-fit: contain; border-radius: 8px; cursor: pointer;" title="à¦‡à¦®à§‡à¦œ à¦¦à§‡à¦–à§à¦¨">`;
            container.appendChild(topImgCard);
        }

        card.innerHTML = `
            <div class="detail-q-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                <div class="detail-q-num" style="margin-bottom: 0; flex-shrink: 0;">${index + 1}</div>
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; justify-content: flex-end; margin-left: auto;">
                    <button class="test-ctrl-btn" onclick="toggleArgomentiQuestionAnswer(${q.id})" id="page-eye-btn-${q.id}" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Show Answer">
                        <i class="fa-regular fa-eye" id="page-eye-icon-${q.id}" style="font-size: 13px; color: var(--text-secondary);"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¦à§‡à¦–à§à¦¨</span>
                    </button>
                    <span id="page-ans-text-${q.id}" style="display: none; font-size: 14px; font-weight: 900; color: ${databaseIsVero ? '#4CAF50' : '#ef4444'}; flex-shrink: 0;">${databaseIsVero ? 'VERO âœ“' : 'FALSO âœ—'}</span>
                </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px; width: 100%;">
                <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center;">
                    ${hasImage ? `<img src="${cleanQImage}" onerror="this.style.display='none'" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${cleanQImage}')" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" title="à¦‡à¦®à§‡à¦œ à¦¦à§‡à¦–à§à¦¨">` : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian || q.question || '', q.vocabulary) : (q.italian || q.question || '')}</div>
                    <div class="detail-q-text-bn" id="page-q-bn-${q.id}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || q.bn_question || ''}</div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;">
                    <button class="test-ctrl-btn" id="page-play-btn-${index}" onclick="playQuestionAudioOrSpeechOnPage(${index})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Play Audio Voiceover">
                        <i class="fa-solid fa-play" style="font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¬à¦¾à¦‚à¦²à¦¾</span>
                    </button>
                    <input type="range" class="test-slider" id="page-audio-slider-${index}" min="0" max="100" value="0" style="flex: 1;" readonly>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="test-speaker-btn" onclick="readQuestionSpeechOnPage(${index})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; background-color: var(--bg-page); border: 1px solid var(--border-card); cursor: pointer;" title="Listen TTS Pronunciation">
                        <i class="fa-solid fa-microphone" style="font-size: 13px; color: var(--accent-green);"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">Italiano</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="showQuestionSpeedPopover(this, false)" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Speech Speed">
                        <i class="fa-solid fa-gauge-high" style="color: var(--accent-green); font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¸à§à¦ªà¦¿à¦¡</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="togglePageTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Translate">
                        <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦…à¦¨à§à¦¬à¦¾à¦¦</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Bookmark">
                        <i class="${saveIconClass}" style="${saveIconColor} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¸à§‡à¦­</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Add Note">
                        <i class="fa-regular fa-note-sticky" style="${userNote ? 'color: var(--accent-green);' : ''} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: ${userNote ? 'var(--accent-green)' : 'var(--text-secondary)'}; white-space: nowrap;">à¦¨à§‹à¦Ÿ</span>
                    </button>
                </div>
            </div>

            ${isAnswered ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); display: flex; justify-content: center; align-items: center;">
                ${statsHtml}
            </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function toggleArgomentiQuestionAnswer(qId) {
    const textEl = document.getElementById(`page-ans-text-${qId}`);
    const iconEl = document.getElementById(`page-eye-icon-${qId}`);
    if (!textEl || !iconEl) return;

    if (textEl.style.display === 'none') {
        textEl.style.display = 'inline';
        iconEl.className = 'fa-regular fa-eye-slash';
        iconEl.style.color = 'var(--accent-green)';
    } else {
        textEl.style.display = 'none';
        iconEl.className = 'fa-regular fa-eye';
        iconEl.style.color = 'var(--text-secondary)';
    }
}

// ðŸŽ¤ Microphone (TTS Only) - Pronunciation of displayed question text
function readQuestionSpeechOnPage(index) {
    if (!activePageDetails || !activePageDetails.questions || !activePageDetails.questions[index]) return;
    const q = activePageDetails.questions[index];
    const textToRead = (q.italian || q.question || '').replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;
        window.speechSynthesis.speak(utterance);
    }
}

// â–¶ï¸ Play Button - MP3 Voiceover Audio File or TTS fallback
let pageNativeAudio = null;
let playingPageAudioIndex = null;
let pageAudioProgressInterval = null;

function playQuestionAudioOrSpeechOnPage(index) {
    if (!activePageDetails || !activePageDetails.questions || !activePageDetails.questions[index]) return;
    const q = activePageDetails.questions[index];
    const audioUrl = q.audio || q.voice;

    if (playingPageAudioIndex === index) {
        stopAllPageAudio();
        return;
    }

    stopAllPageAudio();

    if (audioUrl) {
        playingPageAudioIndex = index;
        if (!pageNativeAudio) {
            pageNativeAudio = new Audio();
        }
        pageNativeAudio.src = audioUrl;

        const pBtn = document.getElementById(`page-play-btn-${index}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        pageNativeAudio.play().then(() => {
            const slider = document.getElementById(`page-audio-slider-${index}`);
            pageAudioProgressInterval = setInterval(() => {
                if (pageNativeAudio.paused || pageNativeAudio.ended) {
                    clearInterval(pageAudioProgressInterval);
                    return;
                }
                if (slider && pageNativeAudio.duration) {
                    slider.value = (pageNativeAudio.currentTime / pageNativeAudio.duration) * 100;
                }
            }, 100);
        }).catch(err => {
            console.error("Error playing question MP3 audio file: ", err);
            stopAllPageAudio();
            readQuestionSpeechOnPage(index);
        });

        pageNativeAudio.onended = () => {
            stopAllPageAudio();
        };
    } else {
        readQuestionSpeechOnPage(index);
    }
}

function stopAllPageAudio() {
    if (pageNativeAudio) {
        pageNativeAudio.pause();
        pageNativeAudio.currentTime = 0;
    }
    if (pageAudioProgressInterval) {
        clearInterval(pageAudioProgressInterval);
    }
    if (playingPageAudioIndex !== null) {
        const pBtn = document.getElementById(`page-play-btn-${playingPageAudioIndex}`);
        const slider = document.getElementById(`page-audio-slider-${playingPageAudioIndex}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (slider) slider.value = 0;
        playingPageAudioIndex = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

let activeSpeedControllerButton = null;

function showQuestionSpeedPopover(btn, isCartelli = false) {
    let popover = document.getElementById('global-question-speed-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'global-question-speed-popover';
        popover.className = 'speed-popover';
        popover.style.position = 'absolute';
        popover.style.zIndex = '999999';
        popover.style.display = 'none';
        document.body.appendChild(popover);
    }

    if (activeSpeedControllerButton === btn && popover.style.display === 'flex') {
        popover.style.display = 'none';
        return;
    }

    activeSpeedControllerButton = btn;
    popover.innerHTML = '';

    const speeds = [0.85, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    speeds.forEach(rate => {
        const item = document.createElement('div');
        item.className = `speed-option-item ${rate === testAudioSpeed ? 'selected' : ''}`;
        item.style.cursor = 'pointer';
        item.style.padding = '8px 16px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.fontSize = '13px';
        item.style.fontWeight = 'bold';
        item.style.color = 'var(--text-primary)';

        item.onclick = (e) => {
            e.stopPropagation();
            testAudioSpeed = rate;
            popover.style.display = 'none';
            showToast(`à¦—à¦¤à¦¿ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡: ${rate}x`);

            if (isCartelli) {
                if (typeof playingCartelliAudioIndex !== 'undefined' && playingCartelliAudioIndex !== null && typeof cartelliNativeAudio !== 'undefined' && cartelliNativeAudio) {
                    cartelliNativeAudio.playbackRate = rate;
                }
            }
        };

        if (rate === testAudioSpeed) {
            item.innerHTML = `<span>âœ“ ${rate === 1.0 ? '1.0' : rate}</span>`;
        } else {
            item.innerHTML = `<span>${rate === 1.0 ? '1.0' : rate}</span>`;
        }

        popover.appendChild(item);
    });

    const rect = btn.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    popover.style.display = 'flex';
    popover.style.flexDirection = 'column';
    popover.style.background = 'var(--bg-card)';
    popover.style.border = '1.5px solid var(--border-card)';
    popover.style.borderRadius = '12px';
    popover.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    popover.style.minWidth = '90px';
    popover.style.padding = '4px 0';
    popover.style.maxHeight = 'none';
    popover.style.height = 'auto';
    popover.style.overflow = 'hidden';

    const popoverHeight = popover.getBoundingClientRect().height || popover.offsetHeight || 300;
    const popoverWidth = popover.getBoundingClientRect().width || popover.offsetWidth || 90;

    let left = rect.left + scrollLeft + (rect.width / 2) - (popoverWidth / 2);
    let top = rect.top + scrollTop - popoverHeight - 8;

    if (top < scrollTop) {
        top = rect.bottom + scrollTop + 8;
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;

    const hidePopover = (e) => {
        if (!popover.contains(e.target) && e.target !== btn) {
            popover.style.display = 'none';
            document.removeEventListener('click', hidePopover);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', hidePopover);
    }, 50);
}

function togglePlayAllPageQuestions() {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    isPlayAllActive = !isPlayAllActive;
    const playAllBtn = document.getElementById('page-play-all-btn');
    if (!playAllBtn) return;

    if (isPlayAllActive) {
        playAllBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> <span>Stop</span>';
        playAllBtn.style.backgroundColor = 'var(--accent-red)';
        readQuestionSpeechOnPage(0);
    } else {
        playAllBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
        playAllBtn.style.backgroundColor = 'var(--accent-green)';
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (pageSpeechInterval) clearInterval(pageSpeechInterval);
        if (playingPageSpeechIndex !== null) {
            const btn = document.getElementById(`page-play-btn-${playingPageSpeechIndex}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const slider = document.getElementById(`page-audio-slider-${playingPageSpeechIndex}`);
            if (slider) slider.value = 0;
            playingPageSpeechIndex = null;
        }
    }
}

function togglePageTranslation(qId) {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    if (!activePageDetails || !activePageDetails.questions) return;
    const q = activePageDetails.questions.find(item => item.id === qId);
    if (!q) return;

    if (typeof openQuestionTranslationModal === 'function') {
        const rawQImage = q.image || q.img || '';
        const cleanQImage = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawQImage) : rawQImage;
        openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || [], cleanQImage);
    }
}

function startPageQuiz() {
    if (!activePageDetails || !activePageDetails.questions || activePageDetails.questions.length === 0) {
        showToast('à¦à¦‡ à¦ªà§ƒà¦·à§à¦ à¦¾à§Ÿ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦¨à§‡à¦‡');
        return;
    }
    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        const rawList = activePageDetails.questions || [];
        testQuestions = rawList.slice(0, 30).map(q => ({
            id: q.id,
            italian: q.italian || q.question || '',
            bangla: q.bangla || q.bn_question || '',
            is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
            image: typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(q.image || q.img) : (q.image || q.img),
            audio: q.audio || q.voice,
            video: q.video,
            vocabulary: q.vocabulary || []
        }));
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `PAGINA ${activePageDetails.id}`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'ModalitÃ  Esercitazione';
        }

        openScreen('test', 'Practice Quiz');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}

function togglePageMainAudio() {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    const pageAudio = document.getElementById('page-native-audio');
    const playBtn = document.getElementById('page-audio-play-btn');
    if (!pageAudio || !pageAudio.src || !playBtn) {
        showToast('à¦à¦‡ à¦ªà§ƒà¦·à§à¦ à¦¾à¦° à¦œà¦¨à§à¦¯ à¦•à§‹à¦¨à§‹ à¦…à¦¡à¦¿à¦“ à¦†à¦ªà¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¨à§‡à¦‡');
        return;
    }

    if (pageAudio.paused) {
        pageAudio.play().then(() => {
            pageAudioPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 12px; color: var(--accent-red);"></i>';
            updatePageAudioProgress();
        }).catch(err => {
            console.error("Error playing audio: ", err);
            showToast('à¦…à¦¡à¦¿à¦“ à¦ªà§à¦²à§‡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
    } else {
        pageAudio.pause();
        pageAudioPlaying = false;
        playBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 12px; color: var(--accent-green);"></i>';
    }
}

function seekPageMainAudio(val) {
    const pageAudio = document.getElementById('page-native-audio');
    if (pageAudio && pageAudio.duration) {
        pageAudio.currentTime = (val / 100) * pageAudio.duration;
    }
}

function updatePageAudioProgress() {
    const pageAudio = document.getElementById('page-native-audio');
    const slider = document.getElementById('page-audio-slider');
    const timeLbl = document.getElementById('page-audio-time-label');

    if (!pageAudio || !slider || !timeLbl) return;

    const interval = setInterval(() => {
        if (pageAudio.paused || pageAudio.ended) {
            clearInterval(interval);
            if (pageAudio.ended) {
                const playBtn = document.getElementById('page-audio-play-btn');
                if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 12px; color: var(--accent-green);"></i>';
                slider.value = 100;
            }
            return;
        }

        const prg = Math.floor((pageAudio.currentTime / pageAudio.duration) * 100);
        slider.value = prg;

        const curMin = Math.floor(pageAudio.currentTime / 60);
        const curSec = Math.floor(pageAudio.currentTime % 60).toString().padStart(2, '0');
        const durMin = Math.floor(pageAudio.duration / 60) || 0;
        const durSec = Math.floor(pageAudio.duration % 60 || 0).toString().padStart(2, '0');

        timeLbl.innerText = `${curMin}:${curSec} / ${durMin}:${durSec}`;
    }, 250);
}

function togglePageDetailsChapterDropdown() {
    const dropdown = document.getElementById('page-details-chapter-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.style.display === 'none';
    dropdown.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        dropdown.innerHTML = '';
        fetch('/api/chapters?_t=' + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(chapters => {
                chapters.forEach(ch => {
                    const item = document.createElement('div');
                    item.className = `chapter-dropdown-item ${ch.id === activePageDetails.chapter_id ? 'active' : ''}`;
                    item.onclick = () => {
                        dropdown.style.display = 'none';
                        fetch(`/api/chapters/${ch.id}/pages?_t=` + Date.now(), { cache: 'no-store' })
                            .then(r => r.json())
                            .then(pages => {
                                if (pages.length > 0) {
                                    openPageDetailsScreen(pages[0].id);
                                } else {
                                    showToast('à¦à¦‡ à¦…à¦§à§à¦¯à¦¾à§Ÿà§‡ à¦•à§‹à¦¨à§‹ à¦ªà§‡à¦œ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
                                }
                            });
                    };
                    const italianName = ch.name || '';
                    item.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${italianName}`;
                    dropdown.appendChild(item);
                });
            });
    }
}

function togglePageDetailsPageDropdown() {
    const dropdown = document.getElementById('page-details-page-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.style.display === 'none';
    dropdown.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        dropdown.innerHTML = '';
        fetch(`/api/chapters/${activePageDetails.chapter_id}/pages?_t=` + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(pages => {
                pages.forEach(p => {
                    const item = document.createElement('div');
                    item.className = `chapter-dropdown-item ${p.id === activePageDetails.id ? 'active' : ''}`;
                    item.onclick = () => {
                        dropdown.style.display = 'none';
                        openPageDetailsScreen(p.id);
                    };
                    const pNum = p.sort_order || p.page_number || p.id;
                    item.innerText = `Pagina ${pNum}) ${p.title}`;
                    dropdown.appendChild(item);
                });
            });
    }
}

window.isArgomentiSelectionMode = window.isArgomentiSelectionMode || false;

function updateArgomentiSelectionPills() {
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    const selectedCards = document.querySelectorAll('#page-questions-list-container .detail-q-card.selected-q-card');
    const selectBtn = document.getElementById('page-details-select-toggle-btn');
    const selectAllBtn = document.getElementById('page-details-select-all-btn');
    const unselectAllBtn = document.getElementById('page-details-unselect-all-btn');

    if (selectAllBtn) selectAllBtn.classList.remove('active');
    if (unselectAllBtn) unselectAllBtn.classList.remove('active');
    if (selectBtn) selectBtn.classList.remove('active');

    if (window.isArgomentiSelectionMode) {
        if (selectBtn) selectBtn.style.display = 'none';
        if (cards.length > 0 && selectedCards.length === cards.length) {
            if (selectAllBtn) selectAllBtn.classList.add('active');
        }
    } else {
        if (selectBtn) selectBtn.style.display = 'inline-block';
        if (selectedCards.length === 0) {
            if (unselectAllBtn) unselectAllBtn.classList.add('active');
        }
    }
}

function toggleCurrentPageSelection() {
    window.isArgomentiSelectionMode = true;
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    const selectedCount = document.querySelectorAll('#page-questions-list-container .detail-q-card.selected-q-card').length;
    if (selectedCount === 0 && cards.length > 0) {
        cards[0].classList.add('selected-q-card');
    }
    updateArgomentiSelectionPills();
    showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦®à§‹à¦¡ à¦šà¦¾à¦²à§ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à§‡ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à§à¦¨');
}

function selectAllPagesInDetails() {
    window.isArgomentiSelectionMode = true;
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    updateArgomentiSelectionPills();
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

function unselectAllPagesInDetails() {
    window.isArgomentiSelectionMode = false;
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    updateArgomentiSelectionPills();
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦†à¦¨à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}

window.openPageDetailsScreen = openPageDetailsScreen;
window.renderPageQuestionsList = renderPageQuestionsList;
window.toggleArgomentiQuestionAnswer = toggleArgomentiQuestionAnswer;
window.readQuestionSpeechOnPage = readQuestionSpeechOnPage;
window.playQuestionAudioOrSpeechOnPage = playQuestionAudioOrSpeechOnPage;
window.stopAllPageAudio = stopAllPageAudio;
window.showQuestionSpeedPopover = showQuestionSpeedPopover;
window.togglePlayAllPageQuestions = togglePlayAllPageQuestions;
window.togglePageTranslation = togglePageTranslation;
window.startPageQuiz = startPageQuiz;
window.togglePageMainAudio = togglePageMainAudio;
window.seekPageMainAudio = seekPageMainAudio;
window.updatePageAudioProgress = updatePageAudioProgress;
window.updateArgomentiSelectionPills = updateArgomentiSelectionPills;
window.toggleCurrentPageSelection = toggleCurrentPageSelection;
window.selectAllPagesInDetails = selectAllPagesInDetails;
window.unselectAllPagesInDetails = unselectAllPagesInDetails;
window.togglePageDetailsChapterDropdown = togglePageDetailsChapterDropdown;
window.togglePageDetailsPageDropdown = togglePageDetailsPageDropdown;

window.addEventListener('click', (e) => {
    if (!e.target.closest('.chapter-selector-trigger')) {
        const pDropdown = document.getElementById('page-details-page-dropdown');
        if (pDropdown) pDropdown.style.display = 'none';
        const cDropdown = document.getElementById('page-details-chapter-dropdown');
        if (cDropdown) cDropdown.style.display = 'none';
    }
});
// ==========================================
// Saved MCQs Screen Logic
// ==========================================

let selectedSavedMcqIds = [];
let isSavedMcqSelectMode = false;

function loadSavedMcqsScreen() {
    const container = document.getElementById('saved-mcqs-list-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande salvate...</div>`;

    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    updateSavedMcqsPillStates();

    fetch(`/api/v1/saved-mcqs?phone=${encodeURIComponent(savedPhone)}&session_id=${encodeURIComponent(savedSessionId)}`, {
        headers: { 'X-Client-Phone': savedPhone }
    })
        .then(res => res.json())
        .then(resData => {
            const savedArr = Array.isArray(resData) ? resData : (resData.data || []);
            activeSavedMcqs = savedArr.map(item => item.question || item).filter(q => q && q.id);
            container.innerHTML = '';
            const countEl = document.getElementById('saved-mcqs-count');
            if (countEl) countEl.innerText = `${savedArr.length} Domande`;

            if (savedArr.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda salvata.</div>`;
                updateSavedMcqsQuizButtonVisibility();
                return;
            }

            savedArr.forEach((item, index) => {
                const q = item.question || item;
                if (!q || !q.id || (!q.italian && !q.question)) return;

                const page = q.page || null;
                const chapter = (page && page.chapter) ? page.chapter : null;

                const qType = q.type || item.type || 'argomenti';
                const typeBadge = qType === 'cartelli' ? 'Cartelli' : 'Argomenti';

                const chapNum = chapter ? (chapter.chapter_number || chapter.id) : (q.chapter || '');
                const chapName = chapter ? (chapter.name || '') : '';
                const pageTitle = page ? (page.title || '') : '';
                const pageNum = page ? (page.sort_order || page.id) : '';

                let locationBadgeHtml = '';

                const rawQImage = q.image || q.img;
                const cleanQImg = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawQImage) : (rawQImage && !rawQImage.includes('/data/user/') && !rawQImage.includes('scaled_IMG') ? rawQImage : '');

                const leftThumbHtml = `
                    <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        ${cleanQImg ? `<img src="${cleanQImg}" onerror="this.parentElement.style.display='none'" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${cleanQImg}')" title="Zoom Image">` : ''}
                    </div>
                `;

                const isSelected = selectedSavedMcqIds.includes(q.id);

                const card = document.createElement('div');
                card.className = `detail-q-card unanswered ${isSelected ? 'selected-q-card' : ''}`;
                card.id = `saved-card-${q.id}`;
                card.setAttribute('data-qid', q.id);
                card.setAttribute('data-qtype', qType);
                card.style.position = 'relative';

                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('img')) return;
                    toggleSavedMcqCardSelection(q.id, card);
                };

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div>
                            <div class="detail-q-num" style="margin-bottom: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">${index + 1}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
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
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                                <i class="fa fa-eye" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    ${locationBadgeHtml}

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian, q.vocabulary, q.id) : (q.italian || '')}</div>
                            <div class="detail-q-text-bn" id="saved-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || ''}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-end; width: 100%; flex-wrap: wrap;">
                        <button class="test-ctrl-btn" id="saved-play-btn-${q.id}" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play Audio">
                            <i class="fa-solid fa-play" style="font-size:12px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¬à¦¾à¦‚à¦²à¦¾</span>
                        </button>
                        <input type="range" class="test-slider" id="saved-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; cursor: pointer;" readonly>
                        <button class="test-speaker-btn" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Listen Pronunciation">
                            <i class="fa-solid fa-volume-high" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦…à¦¨à§à¦¬à¦¾à¦¦</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this, '${qType}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Remove Bookmark">
                            <i class="fa-solid fa-bookmark" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--accent-green); white-space: nowrap;">à¦¸à§‡à¦­</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¨à§‹à¦Ÿ</span>
                        </button>
                    </div>
                `;

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const statKey = (qType === 'cartelli' || String(q.id).startsWith('cartelli_')) ? `cartelli_${q.id}` : q.id;
                const record = userStatsMap[statKey] || {};
                const correctCount = typeof record.correct === 'number' ? record.correct : (q.correct_count || 0);
                const wrongCount = typeof record.wrong === 'number' ? record.wrong : (q.wrong_count || 0);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 14px; padding: 8px 14px; background: rgba(241, 245, 249, 0.6); border: 1px solid var(--border-card); border-radius: 12px; font-size: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;';
                    statsDiv.innerHTML = `
                        <div style="color: #475569; font-weight: 600; font-size: 12px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 600;">
                            <span style="color: #16a34a;">Giusto ${correctCount} volte</span>
                            <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                        </div>
                    `;
                    card.appendChild(statsDiv);
                }

                container.appendChild(card);
            });
            updateSavedMcqsPillStates();
            updateSavedMcqsQuizButtonVisibility();
        })
        .catch(err => {
            console.error("Error loading saved MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si Ã¨ verificato un errore nel caricamento delle domande salvate.</div>`;
        });
}

function toggleSavedMcqCardSelection(qId, cardEl) {
    const idx = selectedSavedMcqIds.indexOf(qId);
    if (idx > -1) {
        selectedSavedMcqIds.splice(idx, 1);
        if (cardEl) cardEl.classList.remove('selected-q-card');
    } else {
        selectedSavedMcqIds.push(qId);
        if (cardEl) cardEl.classList.add('selected-q-card');
    }
    if (selectedSavedMcqIds.length > 0) {
        isSavedMcqSelectMode = true;
    } else {
        isSavedMcqSelectMode = false;
    }
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
}

function toggleSavedMcqsSelectMode() {
    isSavedMcqSelectMode = true;
    if (selectedSavedMcqIds.length === 0 && activeSavedMcqs.length > 0) {
        selectedSavedMcqIds = [activeSavedMcqs[0].id];
    }
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦®à§‹à¦¡ à¦šà¦¾à¦²à§ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à§‡ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à§à¦¨');
    }
}

function selectAllSavedMcqs() {
    selectedSavedMcqIds = activeSavedMcqs.map(q => q.id);
    isSavedMcqSelectMode = true;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('à¦¸à¦¬ à¦¸à§‡à¦­à¦¡ à¦ªà§à¦°à¦¶à§à¦¨ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
    }
}

function unselectAllSavedMcqs() {
    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    if (typeof showToast === 'function') {
        showToast('à¦¸à¦¬ à¦†à¦¨-à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
    }
}

function renderSavedMcqsSelectionUI() {
    activeSavedMcqs.forEach(q => {
        const card = document.getElementById(`saved-card-${q.id}`);
        if (card) {
            if (selectedSavedMcqIds.includes(q.id)) {
                card.classList.add('selected-q-card');
            } else {
                card.classList.remove('selected-q-card');
            }
        }
    });
}

function updateSavedMcqsPillStates() {
    const btnSelect = document.getElementById('saved-select-toggle-btn');
    const btnAll = document.getElementById('saved-select-all-btn');
    const btnUnselect = document.getElementById('saved-unselect-all-btn');

    if (btnSelect) btnSelect.classList.remove('active');
    if (btnAll) btnAll.classList.remove('active');
    if (btnUnselect) btnUnselect.classList.remove('active');

    if (isSavedMcqSelectMode || selectedSavedMcqIds.length > 0) {
        if (btnSelect) btnSelect.style.display = 'none';
        if (activeSavedMcqs.length > 0 && selectedSavedMcqIds.length === activeSavedMcqs.length) {
            if (btnAll) btnAll.classList.add('active');
        }
    } else {
        if (btnSelect) btnSelect.style.display = 'inline-block';
        if (btnUnselect) btnUnselect.classList.add('active');
    }
}

function updateSavedMcqsQuizButtonVisibility() {
    const container = document.getElementById('saved-mcqs-quiz-btn-container');
    if (!container) return;
    container.style.display = (activeSavedMcqs && activeSavedMcqs.length > 0) ? 'block' : 'none';
}

function startSavedMcqsQuiz() {
    const questionsToQuiz = (selectedSavedMcqIds && selectedSavedMcqIds.length > 0)
        ? activeSavedMcqs.filter(q => selectedSavedMcqIds.includes(q.id))
        : activeSavedMcqs;

    if (!questionsToQuiz || questionsToQuiz.length === 0) {
        showToast('à¦•à§‹à¦¨à§‹ à¦¸à§‡à¦­à¦¡ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }
    testQuestions = questionsToQuiz.sort(() => Math.random() - 0.5);
    currentTestIndex = 0;
    testAnswers = Array(testQuestions.length).fill(null);
    practiceMode = 'exam';

    const timerPill = document.getElementById('test-timer');
    if (timerPill) {
        timerPill.innerText = `SAVED MCQS QUIZ`;
        timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        timerPill.style.borderColor = 'var(--accent-green)';
        timerPill.style.color = 'var(--accent-green)';
    }
    const timerLabel = document.querySelector('.test-timer-label');
    if (timerLabel) {
        timerLabel.innerText = `${testQuestions.length} Saved MCQs`;
    }

    openScreen('test', 'Saved MCQs Quiz');
    switchTestQuestionTab(1);
    showTestQuestion();
    startTestTimer();
}

let playingSavedSpeechIndex = null;
let savedSpeechInterval = null;

function readSavedQuestionSpeech(qId, text) {
    if (!text && typeof window.cachedQuestionsMap !== 'undefined' && window.cachedQuestionsMap[qId]) {
        const q = window.cachedQuestionsMap[qId];
        text = q.italian || q.question || '';
    } else if (!text && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
        const q = activeSavedMcqs.find(item => item.id == qId || (item.question && item.question.id == qId));
        if (q) text = (q.question ? (q.question.italian || q.question.question) : (q.italian || q.question)) || '';
    }
    if (!text) text = '';
    if ('speechSynthesis' in window) {
        if (playingSavedSpeechIndex === qId) {
            playingSavedSpeechIndex = null;
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            const pBtn = document.getElementById(`saved-play-btn-${qId}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const slider = document.getElementById(`saved-audio-slider-${qId}`);
            if (slider) slider.value = 0;
            return;
        }

        if (playingSavedSpeechIndex !== null) {
            const oldBtn = document.getElementById(`saved-play-btn-${playingSavedSpeechIndex}`);
            const oldSlider = document.getElementById(`saved-audio-slider-${playingSavedSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (oldSlider) oldSlider.value = 0;
        }

        playingSavedSpeechIndex = qId;
        if (savedSpeechInterval) clearInterval(savedSpeechInterval);

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        const pBtn = document.getElementById(`saved-play-btn-${qId}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        let slider = document.getElementById(`saved-audio-slider-${qId}`);
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((text.length / 3) / testAudioSpeed));

        savedSpeechInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) slider.value = prg;
            if (prg >= 100) {
                clearInterval(savedSpeechInterval);
            }
        }, 200);

        utterance.onend = () => {
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            if (slider) slider.value = 100;
            const btn = document.getElementById(`saved-play-btn-${qId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingSavedSpeechIndex = null;
        };

        utterance.onerror = () => {
            if (savedSpeechInterval) clearInterval(savedSpeechInterval);
            if (slider) slider.value = 0;
            const btn = document.getElementById(`saved-play-btn-${qId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingSavedSpeechIndex = null;
        };

        window.speechSynthesis.speak(utterance);
    }
}

function toggleSavedTranslation(qId) {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    if (!activeSavedMcqs) return;
    const q = activeSavedMcqs.find(item => item.id === qId);
    if (!q) return;

    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || [], q.image || q.img || '');
}

function toggleSavedMcq(questionId, btnElement, type) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
    const qType = type || 'argomenti';

    const payload = {
        question_id: questionId,
        type: qType,
        phone: savedPhone,
        session_id: savedSessionId
    };

    fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': token,
            'X-Client-Phone': savedPhone
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            const isNowSaved = data.saved ?? (data.status === 'saved' || data.is_saved);
            showToast(data.message || (isNowSaved ? 'à¦ªà§à¦°à¦¶à§à¦¨à¦Ÿà¦¿ à¦¸à§‡à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡' : 'à¦¸à§‡à¦­ à¦¥à§‡à¦•à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡'));

            // Sync with local storage bookmarks
            const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
            let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const idx = bookmarks.indexOf(questionId);
            if (isNowSaved && idx === -1) bookmarks.push(questionId);
            else if (!isNowSaved && idx > -1) bookmarks.splice(idx, 1);
            localStorage.setItem(storageKey, JSON.stringify(bookmarks));

            // Sync all matching card icons strictly by qType
            const selector = qType === 'cartelli'
                ? `#cartelli-mcq-card-${questionId} .fa-bookmark, #cartelli-card-${questionId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-bookmark`
                : `#argomenti-q-card-${questionId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-bookmark`;

            const cardBookmarks = document.querySelectorAll(selector);
            cardBookmarks.forEach(icon => {
                icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                icon.style.color = isNowSaved ? 'var(--accent-green)' : '';
            });

            if (btnElement) {
                const icon = btnElement.querySelector('i');
                if (icon) {
                    icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    icon.style.color = isNowSaved ? '#ffffff' : '#10b981';
                }
                const span = btnElement.querySelector('span');
                if (span) {
                    span.style.color = isNowSaved ? '#ffffff' : '#10b981';
                }
                btnElement.style.background = isNowSaved ? '#10b981' : 'var(--bg-page)';
                btnElement.style.borderColor = isNowSaved ? '#10b981' : 'var(--border-card)';
                btnElement.style.color = isNowSaved ? '#ffffff' : '#10b981';
            }

            // Update modal bookmark icon if open for this exact question and type
            if (typeof currentDictTerm !== 'undefined' && currentDictTerm && currentDictTerm.questionId == questionId && (currentDictTerm.questionType || 'argomenti') === qType) {
                const saveBtn = document.getElementById('dict-modal-save-btn');
                if (saveBtn) {
                    saveBtn.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    saveBtn.style.color = isNowSaved ? '#4CAF50' : 'var(--text-primary, #1e293b)';
                }
            }

            const activeScreen = typeof screenHistory !== 'undefined' && screenHistory.length > 0 ? screenHistory[screenHistory.length - 1] : '';
            if (activeScreen === 'saved-mcqs') {
                loadSavedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error toggling bookmark: ", err);
            showToast('à¦¬à§à¦•à¦®à¦¾à¦°à§à¦• à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

// ==========================================
// User Notes Modal Dialog Operations
// ==========================================

function openNotesModal(pageId, questionId, noteId, existingText, type) {
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    let qType = type;
    if (!qType && questionId) {
        if (typeof extractTargetQuestionType === 'function') {
            qType = extractTargetQuestionType(null, questionId);
        } else {
            const currentActive = (typeof screenHistory !== 'undefined' && screenHistory.length > 0) ? screenHistory[screenHistory.length - 1] : (typeof activeScreen !== 'undefined' ? activeScreen : '');
            qType = (currentActive.includes('cartelli')) ? 'cartelli' : 'argomenti';
        }
    }
    qType = qType || 'argomenti';

    document.getElementById('notes-form-page-id').value = pageId || '';
    document.getElementById('notes-form-question-id').value = questionId || '';
    document.getElementById('notes-form-note-id').value = noteId || '';
    const typeInput = document.getElementById('notes-form-type');
    if (typeInput) typeInput.value = qType;

    let localText = existingText || '';
    if (!localText && questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        const localNotes = JSON.parse(localStorage.getItem(storeKey) || '{}');
        if (localNotes[questionId]) localText = localNotes[questionId];
    }
    document.getElementById('notes-textarea').value = localText;

    if (!localText && (questionId || pageId)) {
        const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
        const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
        let query = questionId ? `question_id=${questionId}&type=${qType}` : `page_id=${pageId}`;
        if (userPhone) query += `&phone=${encodeURIComponent(userPhone)}`;
        if (userSessionId) query += `&session_id=${encodeURIComponent(userSessionId)}`;

        fetch(`/api/notes?${query}`)
            .then(res => res.json())
            .then(resData => {
                const list = (resData && Array.isArray(resData.data)) ? resData.data : (Array.isArray(resData) ? resData : []);
                if (list.length > 0) {
                    document.getElementById('notes-form-note-id').value = list[0].id;
                    document.getElementById('notes-textarea').value = list[0].note_text || '';
                    document.getElementById('notes-delete-btn').style.display = 'block';
                } else {
                    document.getElementById('notes-delete-btn').style.display = 'none';
                }
            })
            .catch(err => {
                console.error("Error loading note: ", err);
            });
    } else if (localText) {
        document.getElementById('notes-delete-btn').style.display = 'block';
    } else {
        document.getElementById('notes-delete-btn').style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal');
    if (modal) modal.style.display = 'none';
}

function saveUserNote() {
    const pageId = document.getElementById('notes-form-page-id').value;
    const questionId = document.getElementById('notes-form-question-id').value;
    const noteText = document.getElementById('notes-textarea').value;
    const typeInput = document.getElementById('notes-form-type');
    const qType = (typeInput ? typeInput.value : null) || 'argomenti';
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteText.trim()) {
        showToast('à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦¨à§‹à¦Ÿà§‡à¦° à¦¬à¦¿à¦¬à¦°à¦£ à¦²à¦¿à¦–à§à¦¨');
        return;
    }

    if (questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        let notesObj = JSON.parse(localStorage.getItem(storeKey) || '{}');
        notesObj[questionId] = noteText.trim();
        localStorage.setItem(storeKey, JSON.stringify(notesObj));

        // Sync card Note button icons
        const selector = qType === 'cartelli'
            ? `#cartelli-mcq-card-${questionId} .fa-note-sticky, #cartelli-card-${questionId} .fa-note-sticky, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-note-sticky`
            : `#argomenti-q-card-${questionId} .fa-note-sticky, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-note-sticky`;

        const noteIcons = document.querySelectorAll(selector);
        noteIcons.forEach(icon => {
            icon.className = 'fa-solid fa-note-sticky';
            icon.style.color = '#10B981';
            const span = icon.closest('button')?.querySelector('span');
            if (span) span.style.color = '#10B981';
        });

        // Sync modal note button icon if open
        const dictNoteBtn = document.getElementById('dict-modal-note-btn');
        if (dictNoteBtn) {
            dictNoteBtn.style.color = '#4CAF50';
        }
    }

    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
            page_id: pageId || null,
            question_id: questionId || null,
            type: qType,
            note_text: noteText,
            session_id: localStorage.getItem('app_client_session_id') || '',
            user_phone: localStorage.getItem('app_client_phone') || ''
        })
    })
        .then(res => res.json())
        .then(data => {
            showToast('à¦¨à§‹à¦Ÿ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            closeNotesModal();

            if (typeof loadNotedMcqsScreen === 'function') {
                loadNotedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error saving note: ", err);
            showToast('à¦¨à§‹à¦Ÿ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            closeNotesModal();
        });
}

function deleteUserNote() {
    const questionId = document.getElementById('notes-form-question-id').value;
    const noteId = document.getElementById('notes-form-note-id').value;
    const typeInput = document.getElementById('notes-form-type');
    const qType = (typeInput ? typeInput.value : null) || 'argomenti';
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (questionId) {
        const storeKey = qType === 'cartelli' ? 'cartelli_notes' : 'argomenti_notes';
        let notesObj = JSON.parse(localStorage.getItem(storeKey) || '{}');
        delete notesObj[questionId];
        localStorage.setItem(storeKey, JSON.stringify(notesObj));

        // Reset card Note button icons
        const selector = qType === 'cartelli'
            ? `#cartelli-mcq-card-${questionId} .fa-note-sticky, #cartelli-card-${questionId} .fa-note-sticky, [data-qtype="cartelli"][data-qid="${questionId}"] .fa-note-sticky`
            : `#argomenti-q-card-${questionId} .fa-note-sticky, [data-qtype="argomenti"][data-qid="${questionId}"] .fa-note-sticky`;

        const noteIcons = document.querySelectorAll(selector);
        noteIcons.forEach(icon => {
            icon.className = 'fa-regular fa-note-sticky';
            icon.style.color = '';
            const span = icon.closest('button')?.querySelector('span');
            if (span) span.style.color = '';
        });

        // Reset modal note button icon
        const dictNoteBtn = document.getElementById('dict-modal-note-btn');
        if (dictNoteBtn) {
            dictNoteBtn.style.color = 'var(--text-primary, #1e293b)';
        }
    }

    if (!noteId) {
        showToast('à¦¨à§‹à¦Ÿà¦Ÿà¦¿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        closeNotesModal();
        if (typeof loadNotedMcqsScreen === 'function') loadNotedMcqsScreen();
        return;
    }

    fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': token
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast('à¦¨à§‹à¦Ÿà¦Ÿà¦¿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            closeNotesModal();
            if (typeof loadNotedMcqsScreen === 'function') {
                loadNotedMcqsScreen();
            }
        })
        .catch(err => {
            console.error("Error deleting note: ", err);
            showToast('à¦¨à§‹à¦Ÿà¦Ÿà¦¿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            closeNotesModal();
        });
}

function saveQuestionAnswerStat(questionId, chapterId, state, questionType = 'argomenti') {
    if (!questionId) return;
    const qIdNum = parseInt(questionId);
    const key = (questionType === 'cartelli' || String(questionId).startsWith('cartelli_'))
        ? `cartelli_${qIdNum}`
        : qIdNum;

    const stats = getUserQuestionStats();
    const existing = stats[key] || { correct: 0, wrong: 0 };

    let correctCount = typeof existing.correct === 'number' ? existing.correct : 0;
    let wrongCount = typeof existing.wrong === 'number' ? existing.wrong : 0;
    const isCorrect = (state === 'correct');

    if (isCorrect) {
        correctCount += 1;
        wrongCount = 0; // Reset wrong count so it leaves Wrong MCQs list
        if (window.selectedWrongMcqIds && window.selectedWrongMcqIds.has(qIdNum)) {
            window.selectedWrongMcqIds.delete(qIdNum);
            if (typeof updateWrongMcqSelectionUI === 'function') {
                updateWrongMcqSelectionUI();
            }
        }
    } else {
        wrongCount += 1;
    }

    stats[key] = {
        state: isCorrect ? 'correct' : 'wrong',
        correct: correctCount,
        wrong: wrongCount,
        chapter: chapterId || null,
        updated_at: new Date().toISOString()
    };
    saveUserQuestionStats(stats);

    // Save/log to Database via API
    const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    fetch('/api/user-mcq-results/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            'X-Client-Phone': userPhone
        },
        body: JSON.stringify({
            phone: userPhone,
            session_id: userSessionId,
            results: [{
                question_id: qIdNum,
                question_type: questionType,
                user_answer: isCorrect ? 'correct' : 'wrong',
                is_correct: isCorrect
            }]
        })
    }).catch(err => console.error("Error logging MCQ result to database:", err));
}
// ==========================================
// Exam Simulation (Scheda Esame) Module
// ==========================================
let activeExamTab = 'new';
let allExamsData = [];
let activeExamSession = null;
let schedaExamQuestions = [];
let currentExamQuestionIndex = 0;
let examUserAnswers = {}; // question_id => true/false/null
let schedaExamTimerInterval = null;
let examTimeLeft = 1800; // 30 minutes in seconds

function loadExamSheets() {
    const container = document.getElementById('exam-cards-list');
    if (allExamsData && allExamsData.length > 0) {
        renderExamSheets();
    } else if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede esame...</div>`;
    }

    fetch('/api/exams')
        .then(res => res.json())
        .then(data => {
            allExamsData = data;
            renderExamSheets();
        })
        .catch(err => {
            console.error("Error loading exams: ", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si Ã¨ verificato un errore durante il caricamento delle schede.</div>`;
            }
        });
}

function switchExamTab(tabName) {
    activeExamTab = tabName;

    const tabNew = document.getElementById('exam-tab-new');
    const tabCompleted = document.getElementById('exam-tab-completed');

    if (tabName === 'new') {
        if (tabNew) {
            tabNew.style.borderBottom = '3px solid white';
            tabNew.style.color = 'white';
        }
        if (tabCompleted) {
            tabCompleted.style.borderBottom = 'none';
            tabCompleted.style.color = 'rgba(255,255,255,0.7)';
        }
    } else {
        if (tabCompleted) {
            tabCompleted.style.borderBottom = '3px solid white';
            tabCompleted.style.color = 'white';
        }
        if (tabNew) {
            tabNew.style.borderBottom = 'none';
            tabNew.style.color = 'rgba(255,255,255,0.7)';
        }
    }

    renderExamSheets();
}

function filterExamCards() {
    renderExamSheets();
}

function renderExamSheets() {
    const container = document.getElementById('exam-cards-list');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('exam-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter by tab status and search text
    const filtered = allExamsData.filter(ex => {
        const matchesStatus = (ex.status === activeExamTab);
        const matchesSearch = !searchVal ||
            ex.student_name.toLowerCase().includes(searchVal) ||
            ex.motorizzazione.toLowerCase().includes(searchVal) ||
            ex.id.toString().includes(searchVal);
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-weight: bold; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">Nessuna scheda trovata in questa sezione.</div>`;
        return;
    }

    filtered.forEach(ex => {
        const card = document.createElement('div');
        card.style.backgroundColor = 'var(--bg-card)';
        card.style.border = '1px solid var(--border-color)';
        card.style.borderRadius = '16px';
        card.style.padding = '18px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '16px';
        card.style.position = 'relative';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
        card.style.cursor = 'pointer';

        // Handle click event to start or review
        card.onclick = () => {
            if (ex.status === 'new') {
                startSchedaExamSimulation(ex.id);
            } else {
                openCompletedExamDetails(ex.id);
            }
        };

        const isCompleted = ex.status === 'completed';

        let scoreHtml = '';
        let progressBarHtml = '';

        if (isCompleted) {
            scoreHtml = `
                <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-top: 4px; display: flex; justify-content: space-between;">
                    <span>Corrette: <strong style="color: #4CAF50;">${ex.correct_count}</strong></span>
                    <span>Errori: <strong style="color: #ef4444;">${ex.wrong_count}</strong></span>
                    <span>Non risposte: <strong style="color: #f59e0b;">${ex.unanswered_count}</strong></span>
                    <span>Totale: <strong>${ex.total_count}</strong></span>
                </div>
            `;
            progressBarHtml = `
                <div style="height: 6px; background-color: var(--border-card); border-radius: 3px; display: flex; overflow: hidden; margin-top: 8px;">
                    <div style="background-color: #4CAF50; width: ${(ex.correct_count / ex.total_count) * 100}%;"></div>
                    <div style="background-color: #ef4444; width: ${(ex.wrong_count / ex.total_count) * 100}%;"></div>
                    <div style="background-color: #f59e0b; width: ${(ex.unanswered_count / ex.total_count) * 100}%;"></div>
                </div>
            `;
        }

        // Circular Icon
        const circleIcon = `
            <div style="width: 60px; height: 60px; border-radius: 50%; background-color: rgba(76,175,80,0.08); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(76,175,80,0.15); flex-shrink: 0;">
                <i class="fa-solid fa-file-signature" style="color: var(--accent-green); font-size: 24px;"></i>
            </div>
        `;

        card.innerHTML = `
            ${circleIcon}
            <div style="flex: 1; min-width: 0;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">Nome: ${ex.id} ${ex.student_name}</h4>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-weight: 600;">
                    <div>Motorizzazione: ${ex.motorizzazione}</div>
                    <div style="margin-top: 2px;">Exam date: ${ex.exam_date}</div>
                </div>
                ${scoreHtml}
                ${progressBarHtml}
            </div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-secondary); font-size: 16px; margin-left: auto;"></i>
        `;
        container.appendChild(card);
    });
}

function startSchedaExamSimulation(examId) {
    showTestOptionsDialog(() => {
        const container = document.getElementById('exam-dots-container');
        if (container) {
            container.innerHTML = '';
        }

        fetch(`/api/exams/${examId}`)
            .then(res => res.json())
            .then(exam => {
                activeExamSession = exam;
                schedaExamQuestions = exam.answers; // Contains populated questions
                currentExamQuestionIndex = 0;
                examUserAnswers = {};
                examTimeLeft = 1800; // 30 minutes

                // Populate previous answers if any
                schedaExamQuestions.forEach(q => {
                    examUserAnswers[q.id] = q.user_answer;
                });

                // Start Timer
                if (schedaExamTimerInterval) clearInterval(schedaExamTimerInterval);
                schedaExamTimerInterval = setInterval(() => {
                    examTimeLeft--;
                    updateSchedaExamTimerDisplay();
                    if (examTimeLeft <= 0) {
                        clearInterval(schedaExamTimerInterval);
                        alert('à¦¸à¦®à§Ÿ à¦¶à§‡à¦·! à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦°à§€à¦•à§à¦·à¦¾à¦Ÿà¦¿ à¦¸à§à¦¬à§Ÿà¦‚à¦•à§à¦°à¦¿à§Ÿà¦­à¦¾à¦¬à§‡ à¦œà¦®à¦¾ à¦¹à§Ÿà§‡ à¦¯à¦¾à¦¬à§‡à¥¤');
                        submitSchedaExam();
                    }
                }, 1000);

                updateSchedaExamTimerDisplay();
                openScreen('exam-simulation', 'Exam Simulation');
                renderSchedaExamQuestion();
            })
            .catch(err => {
                console.error("Error loading exam details: ", err);
                showToast('à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¶à§à¦°à§ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            });
    });
}

function updateSchedaExamTimerDisplay() {
    const timerBadge = document.getElementById('exam-timer');
    if (!timerBadge) return;

    let minutes = Math.floor(examTimeLeft / 60);
    let seconds = examTimeLeft % 60;

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    timerBadge.innerText = `${minutes}:${seconds}`;

    // Alert colors if low time
    if (examTimeLeft < 300) {
        timerBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        timerBadge.style.color = 'var(--accent-red)';
        timerBadge.style.borderColor = 'var(--accent-red)';
    } else {
        timerBadge.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        timerBadge.style.color = 'var(--accent-green)';
        timerBadge.style.borderColor = 'var(--accent-green)';
    }
}

function renderSchedaExamQuestion() {
    if (schedaExamQuestions.length === 0) return;

    const q = schedaExamQuestions[currentExamQuestionIndex];

    // Set question number label
    const numLabel = document.getElementById('exam-question-number');
    if (numLabel) {
        numLabel.innerText = `à¦ªà§à¦°à¦¶à§à¦¨ ${currentExamQuestionIndex + 1}`;
    }

    // Set Text
    const textIt = document.getElementById('exam-question-it');
    const textBn = document.getElementById('exam-question-bn');

    if (textIt) textIt.innerHTML = highlightDictionaryTerms(q.italian, q.vocabulary);
    if (textBn) {
        textBn.innerText = q.bangla;
        textBn.style.display = isTranslationDisabled ? 'none' : 'block';
    }

    // Reset button states
    const veroBtn = document.getElementById('exam-vero-btn');
    const falsoBtn = document.getElementById('exam-falso-btn');

    if (veroBtn) {
        veroBtn.classList.remove('active');
        veroBtn.style.backgroundColor = '';
        veroBtn.style.color = '';
    }
    if (falsoBtn) {
        falsoBtn.classList.remove('active');
        falsoBtn.style.backgroundColor = '';
        falsoBtn.style.color = '';
    }

    // Highlight user selection if already made
    const selection = examUserAnswers[q.id];
    if (selection === true) {
        if (veroBtn) {
            veroBtn.classList.add('active');
            veroBtn.style.backgroundColor = '#4CAF50';
            veroBtn.style.color = 'white';
        }
    } else if (selection === false) {
        if (falsoBtn) {
            falsoBtn.classList.add('active');
            falsoBtn.style.backgroundColor = '#ef4444';
            falsoBtn.style.color = 'white';
        }
    }

    // Generate Dots grid
    renderSchedaExamDots();
}

function renderSchedaExamDots() {
    const dotsContainer = document.getElementById('exam-dots-container');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    for (let i = 0; i < schedaExamQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.innerText = i + 1;
        dot.style.cursor = 'pointer';

        const qId = schedaExamQuestions[i].id;
        const answer = examUserAnswers[qId];

        // Style states
        if (i === currentExamQuestionIndex) {
            dot.style.backgroundColor = 'var(--accent-orange)';
            dot.style.color = 'white';
            dot.style.borderColor = 'var(--accent-orange)';
            dot.style.fontWeight = 'bold';
        } else if (answer !== undefined && answer !== null) {
            dot.style.backgroundColor = 'var(--text-primary)';
            dot.style.color = 'var(--bg-card)';
            dot.style.borderColor = 'var(--text-primary)';
        } else {
            dot.style.backgroundColor = 'var(--bg-card)';
            dot.style.color = 'var(--text-primary)';
            dot.style.borderColor = 'var(--border-color)';
        }

        dot.onclick = () => {
            currentExamQuestionIndex = i;
            renderSchedaExamQuestion();
        };

        dotsContainer.appendChild(dot);
    }
}

// vocabCache: stores per-question vocabulary by word (for modal lookup)
const vocabCache = {};

function highlightDictionaryTerms(text, questionVocabulary, questionId, questionType) {
    if (!text) return '';
    let resultText = text;

    // Cache question vocabulary for popup lookup
    if (Array.isArray(questionVocabulary) && questionVocabulary.length > 0) {
        questionVocabulary.forEach(item => {
            const word = item.italian || item.word || item.italian_word || '';
            if (word) {
                vocabCache[word.toLowerCase()] = item;
            }
        });
    }

    const qIdVal = questionId ? questionId : null;
    const qTypeVal = questionType ? questionType : 'argomenti';
    const qIdArg = qIdVal ? qIdVal : 'null';
    const qTypeArg = `'${qTypeVal}'`;

    const hasExplicitUnderlines = /<u>[\s\S]*?<\/u>/i.test(resultText);

    // Process <u>word</u> HTML tags (admin-underlined terms in questions)
    if (hasExplicitUnderlines) {
        resultText = resultText.replace(/<u>([\s\S]*?)<\/u>/gi, (match, innerWord) => {
            const cleanWord = innerWord.replace(/<[^>]*>/g, '').trim();
            const lowerClean = cleanWord.toLowerCase();
            return `<span class="dict-term-link" data-qid="${qIdVal || ''}" data-qtype="${qTypeVal}" onclick="event.stopPropagation(); if(typeof openVocabModal === 'function' && typeof vocabCache !== 'undefined' && vocabCache['${lowerClean}']){ openVocabModal('${cleanWord.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg}); } else if(typeof openDictionaryTermModal === 'function'){ openDictionaryTermModal('${cleanWord.replace(/'/g, "\\'")}', this, ${qIdArg}, ${qTypeArg}); }">${innerWord}</span>`;
        });
    }

    return resultText;
}

let currentDictTerm = null;
let currentDictModalLang = 'bn';
let savedDictWords = JSON.parse(localStorage.getItem('saved_dict_words') || '[]');

function extractTargetQuestionId(elOrQId) {
    if (typeof elOrQId === 'number') return elOrQId;
    if (typeof elOrQId === 'string' && /^\d+$/.test(elOrQId.trim())) return parseInt(elOrQId.trim());

    let card = null;
    if (elOrQId && typeof elOrQId.closest === 'function') {
        card = elOrQId.closest('.detail-q-card, [id*="-card-"], [id*="argomenti-q-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="saved-card-"], [id*="wrong-card-"], [id*="correct-card-"]');
    }
    if (!card && typeof window !== 'undefined' && window.event && window.event.target) {
        card = window.event.target.closest('.detail-q-card, [id*="-card-"], [id*="argomenti-q-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="saved-card-"], [id*="wrong-card-"], [id*="correct-card-"]');
    }
    if (card) {
        if (card.getAttribute('data-qid')) return parseInt(card.getAttribute('data-qid'));
        if (card.getAttribute('data-question-id')) return parseInt(card.getAttribute('data-question-id'));
        const match = (card.id || '').match(/\d+/);
        if (match) return parseInt(match[0]);
    }
    return null;
}

function extractTargetQuestionType(elOrQId, fallbackQId) {
    if (elOrQId && typeof elOrQId === 'object' && elOrQId.getAttribute) {
        const directType = elOrQId.getAttribute('data-qtype');
        if (directType) return directType;
    }
    let card = null;
    if (elOrQId && typeof elOrQId.closest === 'function') {
        card = elOrQId.closest('.detail-q-card, [id*="-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="argomenti-q-card-"]');
    }
    if (!card && typeof window !== 'undefined' && window.event && window.event.target) {
        card = window.event.target.closest('.detail-q-card, [id*="-card-"], [id*="cartelli-mcq-card-"], [id*="cartelli-card-"], [id*="argomenti-q-card-"]');
    }
    if (card) {
        const type = card.getAttribute('data-qtype');
        if (type) return type;
        if ((card.id || '').includes('cartelli')) return 'cartelli';
    }
    const currentActive = (typeof screenHistory !== 'undefined' && screenHistory.length > 0) ? screenHistory[screenHistory.length - 1] : (typeof activeScreen !== 'undefined' ? activeScreen : '');
    if (currentActive === 'cartelli-page' || currentActive === 'cartelli' || currentActive === 'cartelli-schede') {
        return 'cartelli';
    }
    return 'argomenti';
}

function updateDictSaveIconState() {
    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (!saveBtn || !currentDictTerm) return;

    let isSaved = false;
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';
    const wordKey = currentDictTerm.word ? currentDictTerm.word.toLowerCase() : '';

    if (qId) {
        if (qType === 'cartelli') {
            const cBookmarks = JSON.parse(localStorage.getItem('cartelli_bookmarks') || '[]');
            isSaved = cBookmarks.includes(qId) || cBookmarks.includes(String(qId)) || cBookmarks.includes(parseInt(qId));

            if (!isSaved && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
                isSaved = activeSavedMcqs.some(q => {
                    const type = q.type || (q.question && q.question.type);
                    const id = (q.question && q.question.id) || q.id;
                    return type === 'cartelli' && id == qId;
                });
            }

            if (!isSaved) {
                const cardBookmark = document.querySelector(`#cartelli-mcq-card-${qId} .fa-bookmark, #cartelli-card-${qId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${qId}"] .fa-bookmark`);
                if (cardBookmark && (cardBookmark.classList.contains('fa-solid') || (cardBookmark.style.color && cardBookmark.style.color.includes('green')))) {
                    isSaved = true;
                }
            }
        } else {
            const aBookmarks = JSON.parse(localStorage.getItem('argomenti_bookmarks') || '[]');
            isSaved = aBookmarks.includes(qId) || aBookmarks.includes(String(qId)) || aBookmarks.includes(parseInt(qId));

            if (!isSaved && typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
                isSaved = activeSavedMcqs.some(q => {
                    const type = q.type || (q.question && q.question.type) || 'argomenti';
                    const id = (q.question && q.question.id) || q.id;
                    return type !== 'cartelli' && id == qId;
                });
            }

            if (!isSaved) {
                const cardBookmark = document.querySelector(`#argomenti-q-card-${qId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${qId}"] .fa-bookmark`);
                if (cardBookmark && (cardBookmark.classList.contains('fa-solid') || (cardBookmark.style.color && cardBookmark.style.color.includes('green')))) {
                    isSaved = true;
                }
            }
        }
    } else if (wordKey) {
        isSaved = savedDictWords.includes(wordKey);
    }

    if (isSaved) {
        saveBtn.className = 'fa-solid fa-bookmark';
        saveBtn.style.color = '#4CAF50';
    } else {
        saveBtn.className = 'fa-regular fa-bookmark';
        saveBtn.style.color = 'var(--text-primary, #1e293b)';
    }

    // Also update Note icon state in modal
    const noteBtn = document.getElementById('dict-modal-note-btn');
    if (noteBtn && qId) {
        const cNotes = JSON.parse(localStorage.getItem('cartelli_notes') || '{}');
        const aNotes = JSON.parse(localStorage.getItem('argomenti_notes') || '{}');
        const hasNote = qType === 'cartelli'
            ? (cNotes[qId] && cNotes[qId].trim() !== '')
            : (aNotes[qId] && aNotes[qId].trim() !== '');
        noteBtn.style.color = hasNote ? '#4CAF50' : 'var(--text-primary, #1e293b)';
    }
}

function saveDictWord() {
    if (!currentDictTerm) return;
    const wordKey = currentDictTerm.word ? currentDictTerm.word.toLowerCase() : '';
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';

    if (qId) {
        const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
        const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        fetch('/api/v1/saved-mcqs/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Client-Phone': savedPhone
            },
            body: JSON.stringify({
                question_id: qId,
                type: qType,
                phone: savedPhone,
                session_id: savedSessionId
            })
        })
            .then(res => res.json())
            .then(data => {
                const isNowSaved = data.saved ?? (data.status === 'saved' || data.is_saved);
                const saveBtn = document.getElementById('dict-modal-save-btn');
                if (saveBtn) {
                    saveBtn.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    saveBtn.style.color = isNowSaved ? '#4CAF50' : 'var(--text-primary, #1e293b)';
                }

                // Sync with local storage bookmarks
                const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
                let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const idx = bookmarks.indexOf(qId);
                if (isNowSaved && idx === -1) bookmarks.push(qId);
                else if (!isNowSaved && idx > -1) bookmarks.splice(idx, 1);
                localStorage.setItem(storageKey, JSON.stringify(bookmarks));

                // Sync card bookmark icons on current screen
                const selector = qType === 'cartelli'
                    ? `#cartelli-mcq-card-${qId} .fa-bookmark, #cartelli-card-${qId} .fa-bookmark, [data-qtype="cartelli"][data-qid="${qId}"] .fa-bookmark`
                    : `#argomenti-q-card-${qId} .fa-bookmark, [data-qtype="argomenti"][data-qid="${qId}"] .fa-bookmark`;

                const cardBookmarks = document.querySelectorAll(selector);
                cardBookmarks.forEach(icon => {
                    icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    icon.style.color = isNowSaved ? 'var(--accent-green)' : '';
                });

                if (typeof showToast === 'function') {
                    showToast(data.message || (isNowSaved ? 'à¦ªà§à¦°à¦¶à§à¦¨à¦Ÿà¦¿ à¦¸à§‡à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡ (Saved)' : 'à¦¸à§‡à¦­ à¦¥à§‡à¦•à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡ (Removed)'));
                }

                // Refresh saved screen if active or reload cached saved MCQs
                if (typeof loadSavedMcqsScreen === 'function') {
                    loadSavedMcqsScreen();
                }
            })
            .catch(err => {
                console.error('Error toggling save MCQ from modal:', err);
                toggleLocalDictWordSave(wordKey);
            });
    } else if (wordKey) {
        toggleLocalDictWordSave(wordKey);
    }
}

function toggleLocalDictWordSave(wordKey) {
    if (!wordKey) return;
    const index = savedDictWords.indexOf(wordKey);
    if (index > -1) {
        savedDictWords.splice(index, 1);
        if (typeof showToast === 'function') showToast('à¦¶à¦¬à§à¦¦à¦Ÿà¦¿ à¦¬à§à¦•à¦®à¦¾à¦°à§à¦• à¦¥à§‡à¦•à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡');
    } else {
        savedDictWords.push(wordKey);
        if (typeof showToast === 'function') showToast('à¦¶à¦¬à§à¦¦à¦Ÿà¦¿ à¦¬à§à¦•à¦®à¦¾à¦°à§à¦•à§‡ à¦¸à§‡à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
    }
    localStorage.setItem('saved_dict_words', JSON.stringify(savedDictWords));
    updateDictSaveIconState();
}

function openDictWordNote() {
    if (!currentDictTerm || !currentDictTerm.questionId) {
        if (typeof showToast === 'function') showToast('à¦¨à§‹à¦Ÿ à¦¯à§‹à¦— à¦•à¦°à¦¾à¦° à¦œà¦¨à§à¦¯ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }
    const qId = currentDictTerm.questionId;
    const qType = currentDictTerm.questionType || 'argomenti';
    closeDictTermModal();
    if (typeof openNotesModal === 'function') {
        openNotesModal(null, qId, null, '', qType);
    } else if (typeof openCartelliNotesModal === 'function') {
        openCartelliNotesModal(qId);
    }
}
window.openDictWordNote = openDictWordNote;

function closeDictTermModal() {
    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function openDictionaryTermModal(wordText, elOrQId, explicitQId, explicitType) {
    const cleanWord = (wordText || '').trim();
    if (!cleanWord) return;
    const questionId = explicitQId || extractTargetQuestionId(elOrQId);
    const questionType = explicitType || extractTargetQuestionType(elOrQId, questionId);

    if (typeof vocabCache !== 'undefined' && vocabCache[cleanWord.toLowerCase()]) {
        openVocabModal(cleanWord, elOrQId, questionId, questionType);
        return;
    }

    let item = (typeof dictionaryData !== 'undefined' && Array.isArray(dictionaryData))
        ? dictionaryData.find(d => (d.word || '').toLowerCase() === cleanWord.toLowerCase())
        : null;

    if (!item) {
        fetch(`/api/v1/dizionario?search=${encodeURIComponent(cleanWord)}`)
            .then(res => res.json())
            .then(resData => {
                let termData = null;
                if (resData && resData.data && resData.data.length > 0) {
                    termData = resData.data.find(d => (d.word || '').toLowerCase() === cleanWord.toLowerCase()) || resData.data[0];
                }
                displayDictTermModal(termData || { word: cleanWord, desc_it: cleanWord, desc_bn: '' }, questionId, questionType);
            })
            .catch(err => {
                displayDictTermModal({ word: cleanWord, desc_it: cleanWord, desc_bn: '' }, questionId, questionType);
            });
        return;
    }

    displayDictTermModal(item, questionId, questionType);
}

function displayDictTermModal(item, questionId, questionType) {
    if (!item) return;

    currentDictTerm = {
        word: item.word || '',
        desc_it: item.desc_it || item.word || '',
        desc_bn: item.desc_bn || item.bn || '',
        image: item.image || '',
        video: item.video || null,
        questionId: questionId || null,
        questionType: questionType || 'argomenti'
    };
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = (item.word || '').toUpperCase();

    const imgContainer = document.getElementById('dict-modal-image-container');
    const imgEl = document.getElementById('dict-modal-image');
    if (imgEl && imgContainer) {
        if (item.image) {
            imgEl.src = item.image;
            imgContainer.style.display = 'flex';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    const videoContainer = document.getElementById('dict-modal-video-container');
    const videoEl = document.getElementById('dict-modal-video');
    if (videoContainer && videoEl) {
        if (item.video) {
            videoEl.src = item.video;
            videoContainer.style.display = 'flex';
        } else {
            videoContainer.style.display = 'none';
        }
    }

    const textItEl = document.getElementById('dict-modal-text-it');
    if (textItEl) textItEl.innerText = item.desc_it || item.word || '';

    const textBnEl = document.getElementById('dict-modal-text-bn');
    if (textBnEl) {
        textBnEl.innerText = item.desc_bn || item.bn || '';
        textBnEl.style.display = 'block';
    }

    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (saveBtn) saveBtn.style.display = 'block';

    updateDictSaveIconState();

    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'flex';
}

function openVocabModal(wordText, elOrQId, explicitQId, explicitType) {
    const item = vocabCache ? vocabCache[wordText.toLowerCase()] : null;
    const questionId = explicitQId || extractTargetQuestionId(elOrQId);
    const questionType = explicitType || extractTargetQuestionType(elOrQId, questionId);

    if (!item) {
        openDictionaryTermModal(wordText, elOrQId, questionId, questionType);
        return;
    }

    currentDictTerm = {
        word: item.italian || wordText,
        desc_it: item.italian || wordText,
        desc_bn: item.bangla || '',
        image: item.image || '',
        questionId: questionId || null,
        questionType: questionType || 'argomenti'
    };
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = (item.italian || wordText).toUpperCase();

    const imgContainer = document.getElementById('dict-modal-image-container');
    const imgEl = document.getElementById('dict-modal-image');
    if (imgEl && imgContainer) {
        if (item.image) {
            imgEl.src = item.image;
            imgContainer.style.display = 'flex';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    const videoContainer = document.getElementById('dict-modal-video-container');
    if (videoContainer) videoContainer.style.display = 'none';

    const textItEl = document.getElementById('dict-modal-text-it');
    if (textItEl) textItEl.innerText = item.italian || wordText || '';

    const textBnEl = document.getElementById('dict-modal-text-bn');
    if (textBnEl) {
        textBnEl.innerText = item.bangla || '';
        textBnEl.style.display = 'block';
    }

    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (saveBtn) saveBtn.style.display = 'block';

    updateDictSaveIconState();

    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'flex';
}

function answerSchedaExamQuestion(choice) {
    if (schedaExamQuestions.length === 0) return;

    const q = schedaExamQuestions[currentExamQuestionIndex];
    examUserAnswers[q.id] = choice;

    // Trigger visual updates immediately
    renderSchedaExamQuestion();

    // Auto-advance after a brief delay
    setTimeout(() => {
        if (currentExamQuestionIndex < schedaExamQuestions.length - 1) {
            currentExamQuestionIndex++;
            renderSchedaExamQuestion();
        }
    }, 200);
}

function prevSchedaExamQuestion() {
    if (currentExamQuestionIndex > 0) {
        currentExamQuestionIndex--;
        renderSchedaExamQuestion();
    }
}

function nextSchedaExamQuestion() {
    if (currentExamQuestionIndex < schedaExamQuestions.length - 1) {
        currentExamQuestionIndex++;
        renderSchedaExamQuestion();
    }
}

function submitSchedaExam() {
    if (!activeExamSession) return;
    if (examTimeLeft > 0) {
        if (!confirm('à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤à¦­à¦¾à¦¬à§‡ à¦–à¦¾à¦¤à¦¾ à¦œà¦®à¦¾ à¦¦à¦¿à¦¤à§‡ à¦šà¦¾à¦¨?')) {
            return;
        }
    }

    if (schedaExamTimerInterval) clearInterval(schedaExamTimerInterval);

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const curPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '') || '';
    const curSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '') || '';

    fetch(`/api/exams/${activeExamSession.id}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
            'X-Client-Phone': curPhone,
            'X-Session-ID': curSessionId
        },
        body: JSON.stringify({
            answers: examUserAnswers,
            phone: curPhone,
            user_phone: curPhone,
            session_id: curSessionId
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error);
                openScreen('scheda-esame', 'Scheda Esame');
                return;
            }

            window.dispatchEvent(new CustomEvent('user-stats-updated'));
            if (typeof loadUserProfileStats === 'function') {
                loadUserProfileStats();
            }

            // Show result popup modal
            showSchedaExamResultModal(data.correct, data.wrong, data.unanswered, data.total);
        })
        .catch(err => {
            console.error("Error submitting exam: ", err);
            showToast('à¦–à¦¾à¦¤à¦¾ à¦œà¦®à¦¾ à¦¦à¦¿à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤');
            openScreen('scheda-esame', 'Scheda Esame');
        });
}

function showSchedaExamResultModal(correct, wrong, unanswered, total) {
    const passed = wrong <= 4;

    const txtGiusto = document.getElementById('txt-giusto');
    const txtSbagliato = document.getElementById('txt-sbagliato');
    const txtNondate = document.getElementById('txt-nondate');
    const barGiusto = document.getElementById('bar-giusto');
    const barSbagliato = document.getElementById('bar-sbagliato');
    const barNondate = document.getElementById('bar-nondate');
    const resultEmoji = document.getElementById('test-result-emoji');

    if (txtGiusto) txtGiusto.innerText = correct;
    if (txtSbagliato) txtSbagliato.innerText = wrong;
    if (txtNondate) txtNondate.innerText = unanswered;

    if (barGiusto) barGiusto.style.width = `${total > 0 ? (correct / total) * 100 : 0}%`;
    if (barSbagliato) barSbagliato.style.width = `${total > 0 ? (wrong / total) * 100 : 0}%`;
    if (barNondate) barNondate.style.width = `${total > 0 ? (unanswered / total) * 100 : 0}%`;

    const happySvg = `<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" stroke="#22c55e" stroke-width="7" fill="#f0fdf4"/><circle cx="35" cy="40" r="5" fill="#22c55e"/><circle cx="65" cy="40" r="5" fill="#22c55e"/><path d="M32 58 C40 74 60 74 68 58" stroke="#22c55e" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
    const sadSvg = `<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" stroke="#ef4444" stroke-width="7" fill="#fef2f2"/><circle cx="35" cy="40" r="5" fill="#ef4444"/><circle cx="65" cy="40" r="5" fill="#ef4444"/><path d="M32 68 C40 52 60 52 68 68" stroke="#ef4444" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;

    if (resultEmoji) resultEmoji.innerHTML = passed ? happySvg : sadSvg;

    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'flex';
}
// --- 16. Client Verification & Activation Lock System ---
function checkClientActivation() {
    const isTabUnlocked = sessionStorage.getItem('tab_qr_unlocked') === 'true';
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    let url = '/api/v1/client/status';
    const params = new URLSearchParams();
    if (savedPhone) params.append('phone', savedPhone);
    if (savedSessionId) params.append('session_id', savedSessionId);
    if (isTabUnlocked) params.append('qr_unlocked', '1');
    if (params.toString()) url += '?' + params.toString();

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const isUnlockedNow = Boolean(data.is_active || (data.qr_unlocked && isTabUnlocked) || (isTabUnlocked && data.free_access_mode === false));
            currentClientVerified = Boolean(data.verified || isUnlockedNow || savedPhone);

            const wasActive = currentClientActive;

            currentClientActive = isUnlockedNow;

            if (currentClientActive) {
                sessionStorage.setItem('tab_qr_unlocked', 'true');
                localStorage.setItem('app_client_active', 'true');
                document.cookie = "qr_tab_unlocked=1; path=/; SameSite=Lax";
            }

            if (data.phone) {
                const prevPhone = savedPhone;
                currentClientPhone = data.phone;
                localStorage.setItem('app_client_phone', data.phone);
                document.cookie = "app_client_phone=" + encodeURIComponent(data.phone) + "; path=/; SameSite=Lax";
                if (!prevPhone && prevPhone !== data.phone) {
                    const activeScreenId = (typeof screenHistory !== 'undefined' && screenHistory.length > 0) ? screenHistory[screenHistory.length - 1] : null;
                    if (activeScreenId === 'noted-mcqs' && typeof loadNotedMcqsScreen === 'function') loadNotedMcqsScreen();
                    else if (activeScreenId === 'saved-mcqs' && typeof loadSavedMcqsScreen === 'function') loadSavedMcqsScreen();
                    else if (activeScreenId === 'wrong-mcqs' && typeof loadWrongMcqsList === 'function') loadWrongMcqsList();
                    else if (activeScreenId === 'correct-mcqs' && typeof loadCorrectMcqsList === 'function') loadCorrectMcqsList();
                }
            }
            if (data.session_id) {
                currentClientSessionId = data.session_id;
                localStorage.setItem('app_client_session_id', data.session_id);
                document.cookie = "app_client_session_id=" + encodeURIComponent(data.session_id) + "; path=/; SameSite=Lax";
            }
            if (data.first_name) {
                localStorage.setItem('app_client_first_name', data.first_name);
            }
            if (data.last_name) {
                localStorage.setItem('app_client_last_name', data.last_name);
            }

            if (currentClientActive) {
                syncUserQuestionStatsFromBackend();
            }

            const lockEl = document.getElementById('app-activation-lock');

            // Set chat widget view strictly based on client verification state
            if (!currentClientVerified && !savedPhone && !currentClientActive) {
                setChatWidgetView('verify');
            } else {
                setChatWidgetView('normal');
            }

            if (!currentClientActive) {
                // Start polling if not already started
                if (!activationStatusInterval) {
                    activationStatusInterval = setInterval(checkClientActivation, 5000);
                }
            } else {
                // Unlock app!
                if (lockEl) lockEl.style.display = 'none';

                // Restore active screen based on URL if needed
                if (typeof restoreScreenFromUrl === 'function') {
                    restoreScreenFromUrl();
                }

                // Stop polling
                if (activationStatusInterval) {
                    clearInterval(activationStatusInterval);
                    activationStatusInterval = null;
                }

                // If just unlocked, notify user
                if (wasActive === false) {
                    showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦ªà§à¦²à¦¿à¦•à§‡à¦¶à¦¨à¦Ÿà¦¿ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡!');
                    fetchGuestChatMessages();
                }
            }
        })
        .catch(err => console.error("Error checking client status: ", err));
}

function closeActivationLock() {
    const lockEl = document.getElementById('app-activation-lock');
    if (lockEl) lockEl.style.display = 'none';
}

function setChatWidgetView(view) {
    const verifyForm = document.getElementById('guest-chat-verify-form');
    const waitingMsg = document.getElementById('guest-chat-waiting-msg');
    const chatMessages = document.getElementById('guest-chat-messages');
    const inputArea = document.getElementById('guest-chat-input-area');

    if (!verifyForm || !waitingMsg || !chatMessages || !inputArea) return;

    if (view === 'verify') {
        verifyForm.style.display = 'flex';
        waitingMsg.style.display = 'none';
        chatMessages.style.display = 'none';
        inputArea.style.display = 'none';
    } else if (view === 'waiting') {
        verifyForm.style.display = 'none';
        waitingMsg.style.display = 'flex';
        chatMessages.style.display = 'none';
        inputArea.style.display = 'none';
    } else if (view === 'normal') {
        verifyForm.style.display = 'none';
        waitingMsg.style.display = 'none';
        chatMessages.style.display = 'flex';
        inputArea.style.display = 'flex';
    }
}

function submitClientVerification() {
    const firstName = document.getElementById('verify-first-name').value.trim();
    const lastName = document.getElementById('verify-last-name').value.trim();
    const phone = document.getElementById('verify-phone').value.trim();

    if (!firstName || !lastName || !phone) {
        showToast('à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦¸à¦¬ à¦¤à¦¥à§à¦¯ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦•à¦°à§à¦¨');
        return;
    }

    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    fetch('/api/client/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            session_id: savedSessionId
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.client) {
                    if (data.client.phone) {
                        currentClientPhone = data.client.phone;
                        localStorage.setItem('app_client_phone', data.client.phone);
                    }
                    if (data.client.session_id) {
                        currentClientSessionId = data.client.session_id;
                        localStorage.setItem('app_client_session_id', data.client.session_id);
                    }
                }

                currentClientVerified = true;
                setChatWidgetView('normal');

                if (data.is_active || data.already_active) {
                    showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿà¦Ÿà¦¿ à¦…à¦¨à¦²à¦¾à¦‡à¦¨à§‡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦†à¦›à§‡à¥¤ à¦à¦¬à¦¾à¦° QR à¦¸à§à¦•à§à¦¯à¦¾à¦¨ à¦•à¦°à§à¦¨à¥¤');
                } else {
                    showToast('à¦¤à¦¥à§à¦¯ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦†à¦ªà¦¨à¦¾à¦° à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦•à¦¿ à¦¨à§‡à¦“à§Ÿà¦¾à¦° à¦œà¦¨à§à¦¯ à¦®à§‡à¦¸à§‡à¦œ à¦¦à¦¿à¦¨à¥¤');
                }

                syncUserQuestionStatsFromBackend().then(() => {
                    if (typeof renderArgomentiList === 'function') renderArgomentiList();
                    if (typeof renderSheetsList === 'function') renderSheetsList();
                });
                checkClientActivation();
            } else {
                showToast('à¦­à§‡à¦°à¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨ à¦¸à¦¾à¦¬à¦®à¦¿à¦Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
            }
        })
        .catch(err => {
            console.error("Error submitting verification: ", err);
            showToast('à¦­à§‡à¦°à¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨ à¦¸à¦¾à¦¬à¦®à¦¿à¦Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function showChatAfterVerification() {
    setChatWidgetView('normal');
}

// Initialize activation lock check
checkClientActivation();


// --- 17. QR Code Scanner Integration ---
let html5QrScanner = null;

function openQrScanner() {
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.style.display = 'flex';

    if (typeof Html5Qrcode === 'undefined') {
        showToast('QR Scanner à¦²à¦¾à¦‡à¦¬à§à¦°à§‡à¦°à¦¿ à¦²à§‹à¦¡ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¦¿à¥¤ à¦ªà§‡à¦œ à¦°à¦¿à¦«à§à¦°à§‡à¦¶ à¦•à¦°à§à¦¨à¥¤');
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦°à§‡ à¦•à§à¦¯à¦¾à¦®à§‡à¦°à¦¾ à¦…à§à¦¯à¦¾à¦•à§à¦¸à§‡à¦¸ à¦¸à¦¾à¦ªà§‹à¦°à§à¦Ÿ à¦•à¦°à¦›à§‡ à¦¨à¦¾ à¦…à¦¥à¦¬à¦¾ HTTP à¦ à¦¬à§à¦²à¦• à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤');
    }

    if (!html5QrScanner) {
        try {
            html5QrScanner = new Html5Qrcode("qr-reader");
        } catch (e) {
            console.error("Html5Qrcode initialization error:", e);
            showToast('QR Scanner à¦šà¦¾à¦²à§ à¦•à¦°à¦¤à§‡ à¦¬à§à¦¯à¦°à§à¦¥ à¦¹à§Ÿà§‡à¦›à§‡!');
            return;
        }
    }

    const qrSuccessCallback = (decodedText, decodedResult) => {
        console.log(`Scan result: ${decodedText}`);
        const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
        const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

        fetch('/api/qr-unlock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify({
                qr_code: decodedText,
                phone: savedPhone,
                session_id: savedSessionId
            })
        })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    sessionStorage.setItem('tab_qr_unlocked', 'true');
                    currentClientActive = true;
                    showToast(resData.message || 'à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦†à¦¨à¦²à¦• à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡!');
                    closeQrScanner();
                    closeActivationLock();
                    checkClientActivation();

                    const match = decodedText.match(/pages?\/(\d+)/) || decodedText.match(/page_details?\/(\d+)/);
                    if (match && typeof openPageDetailsScreen === 'function') {
                        openPageDetailsScreen(parseInt(match[1]));
                    }
                } else {
                    showToast(resData.message || 'à¦†à¦ªà¦¨à¦¾à¦° à¦²à¦¾à¦‡à¦¸à§‡à¦¨à§à¦¸ à¦Ÿà¦¿ à¦à¦–à¦¨à¦“ à¦…à§à¦¯à¦¾à¦•à§à¦Ÿà¦¿à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿!');
                }
            })
            .catch(err => {
                console.error("QR Unlock API error:", err);
                showToast('QR à¦­à§‡à¦°à¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨à§‡ à¦¨à§‡à¦Ÿà¦“à§Ÿà¦¾à¦°à§à¦• à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦˜à¦Ÿà§‡à¦›à§‡!');
            });
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrScanner.start({ facingMode: "environment" }, config, qrSuccessCallback)
        .catch(err => {
            console.error("Camera start error: ", err);
            showToast('à¦•à§à¦¯à¦¾à¦®à§‡à¦°à¦¾ à¦šà¦¾à¦²à§ à¦•à¦°à¦¤à§‡ à¦¬à§à¦¯à¦°à§à¦¥ à¦¹à§Ÿà§‡à¦›à§‡!');
        });
}

function closeQrScanner() {
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.style.display = 'none';

    if (html5QrScanner && html5QrScanner.isScanning) {
        html5QrScanner.stop().then(() => {
            console.log("Scanner stopped successfully.");
        }).catch(err => console.error("Scanner stop error: ", err));
    }
}

// --- 18. Custom Video Player Controls ---
function togglePageVideoPlay() {
    const video = document.getElementById('page-details-video');
    const overlay = document.getElementById('video-play-overlay');
    const overlayIcon = document.getElementById('video-overlay-icon');
    const ctrlPlay = document.getElementById('video-ctrl-play');

    if (!video) return;

    if (video.paused) {
        video.play();
        if (overlay) overlay.style.display = 'none';
        if (ctrlPlay) ctrlPlay.className = 'fa-solid fa-pause';
    } else {
        video.pause();
        if (overlay) {
            overlay.style.display = 'flex';
            if (overlayIcon) overlayIcon.className = 'fa-solid fa-play';
        }
        if (ctrlPlay) ctrlPlay.className = 'fa-solid fa-play';
    }
}

function seekPageVideo(sec) {
    const video = document.getElementById('page-details-video');
    if (video) {
        video.currentTime += sec;
    }
}

function togglePageVideoMute() {
    const video = document.getElementById('page-details-video');
    const volIcon = document.getElementById('video-ctrl-volume');
    if (!video) return;

    video.muted = !video.muted;
    if (volIcon) {
        volIcon.className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
}

function onVideoSeekSliderInput(val) {
    const video = document.getElementById('page-details-video');
    if (video && video.duration) {
        video.currentTime = (val / 100) * video.duration;
    }
}

function formatVideoTime(secs) {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- 19. Test Options Modal System ---
let pendingTestLaunchCallback = null;
let isImmediateCorrectionActive = true;
let isTranslationDisabled = false;

function showTestOptionsDialog(callback) {
    pendingTestLaunchCallback = callback;

    const toggle = document.getElementById('test-disable-translation-toggle');
    if (toggle) {
        toggle.checked = false;
        const slider = toggle.parentElement.querySelector('.slider-toggle');
        if (slider) slider.style.backgroundColor = '';
    }

    const modal = document.getElementById('test-options-modal');
    if (modal) modal.style.display = 'flex';
}

function confirmTestOptions(wantsImmediateCorrection) {
    isImmediateCorrectionActive = wantsImmediateCorrection;

    const toggle = document.getElementById('test-disable-translation-toggle');
    isTranslationDisabled = toggle ? toggle.checked : false;

    const modal = document.getElementById('test-options-modal');
    if (modal) modal.style.display = 'none';

    if (pendingTestLaunchCallback) {
        pendingTestLaunchCallback();
        pendingTestLaunchCallback = null;
    }
}

// --- 20. Question Translation Popover Modal System ---
let currentTranslationTextToRead = '';

function formatBanglaMarkdown(text) {
    if (!text) return '';
    let formatted = String(text)
        .replace(/###\s*(.*)/g, '<div style="font-weight: 700; color: #2563eb; margin: 8px 0 4px 0; font-size: 14px;">$1</div>')
        .replace(/##\s*(.*)/g, '<div style="font-weight: 700; color: #2563eb; margin: 10px 0 6px 0; font-size: 15px;">$1</div>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong style="color: #0284c7;">$1</strong>')
        .replace(/\n/g, '<br>');
    return formatted;
}

function openQuestionTranslationModal(itText, bnText, vocabularyList, imageUrl) {
    currentTranslationTextToRead = (itText || '').replace(/<[^>]*>/g, '');
    const itEl = document.getElementById('q-translation-it');
    const bnEl = document.getElementById('q-translation-bn');
    const imgContainer = document.getElementById('q-translation-img-container');
    const imgEl = document.getElementById('q-translation-img');

    if (itEl) {
        itEl.innerHTML = typeof highlightDictionaryTerms === 'function'
            ? highlightDictionaryTerms(itText || '', vocabularyList || [])
            : (itText || '');
    }
    // Determine image: main question image
    let targetImg = imageUrl || '';

    if (targetImg && imgContainer && imgEl) {
        imgEl.src = targetImg;
        imgContainer.style.display = 'block';
    } else if (imgContainer) {
        imgContainer.style.display = 'none';
    }
    if (bnEl) {
        bnEl.innerHTML = formatBanglaMarkdown(bnText);
    }

    const modal = document.getElementById('q-translation-modal');
    if (modal) {
        modal.style.display = 'flex';
        const card = modal.querySelector('.lock-card');
        if (card) card.scrollTop = 0;
    }
}

function closeTranslationModal() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    const modal = document.getElementById('q-translation-modal');
    if (modal) modal.style.display = 'none';
}

function readTranslationModalText() {
    if ('speechSynthesis' in window && currentTranslationTextToRead) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentTranslationTextToRead);
        utterance.lang = 'it-IT';
        utterance.rate = parseFloat(localStorage.getItem('app_speech_rate') || '0.85');
        window.speechSynthesis.speak(utterance);
    }
}

function speakTextTTS(text) {
    if (typeof text === 'number') {
        const qId = text;
        let foundText = '';
        if (typeof window.cachedQuestionsMap !== 'undefined' && window.cachedQuestionsMap[qId]) {
            foundText = window.cachedQuestionsMap[qId].italian || window.cachedQuestionsMap[qId].question || '';
        } else if (typeof activeSavedMcqs !== 'undefined' && Array.isArray(activeSavedMcqs)) {
            const q = activeSavedMcqs.find(item => item.id == qId || (item.question && item.question.id == qId));
            if (q) foundText = (q.question ? (q.question.italian || q.question.question) : (q.italian || q.question)) || '';
        }
        text = foundText || String(text);
    }
    if (!text) return;
    const cleanText = String(text).replace(/<[^>]*>/g, '');
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = typeof testAudioSpeed !== 'undefined' ? testAudioSpeed : 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦° à¦Ÿà§‡à¦•à§à¦¸à¦Ÿ-à¦Ÿà§-à¦¸à§à¦ªà¦¿à¦š à¦¸à¦®à¦°à§à¦¥à¦¨ à¦•à¦°à§‡ à¦¨à¦¾');
    }
}

let activeListMp3Player = null;
let activeListMp3Id = null;
let listMp3Interval = null;

function stopListMp3Player() {
    if (activeListMp3Player) {
        activeListMp3Player.pause();
        activeListMp3Player.currentTime = 0;
    }
    if (listMp3Interval) {
        clearInterval(listMp3Interval);
    }
    if (activeListMp3Id !== null) {
        const oldBtn = document.getElementById(`list-play-btn-${activeListMp3Id}`);
        const oldSlider = document.getElementById(`list-audio-slider-${activeListMp3Id}`);
        if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (oldSlider) oldSlider.value = 0;
    }
    activeListMp3Id = null;
}

function playQuestionMp3(audioUrl, qId) {
    if (!audioUrl) return;

    if (activeListMp3Id === qId) {
        stopListMp3Player();
        return;
    }

    stopListMp3Player();
    activeListMp3Id = qId;

    const pBtn = document.getElementById(`list-play-btn-${qId}`);
    const slider = document.getElementById(`list-audio-slider-${qId}`);

    if (!activeListMp3Player) {
        activeListMp3Player = new Audio();
    }
    activeListMp3Player.src = audioUrl;

    if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

    activeListMp3Player.play().then(() => {
        listMp3Interval = setInterval(() => {
            if (activeListMp3Player && activeListMp3Player.duration) {
                const prg = (activeListMp3Player.currentTime / activeListMp3Player.duration) * 100;
                if (slider) slider.value = prg;
            }
        }, 200);

        activeListMp3Player.onended = () => {
            stopListMp3Player();
        };
    }).catch(err => {
        console.error("Error playing MP3 voiceover:", err);
        stopListMp3Player();
    });
}

function populateFilterPages(prefix) {
    const chapId = document.getElementById(`${prefix}-filter-chapter`)?.value;
    const pageSelect = document.getElementById(`${prefix}-filter-page`);
    if (!pageSelect) return;

    const url = chapId ? `/api/chapters/${chapId}/pages` : '/api/all-pages';

    fetch(url)
        .then(res => res.json())
        .then(resData => {
            const pages = Array.isArray(resData) ? resData : (resData.data || []);
            pageSelect.innerHTML = '<option value="">All Pages (à¦¸à¦¬ à¦ªà§‡à¦‡à¦œ)</option>';
            pages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = (p.sort_order || p.page_number)
                    ? `Pagina ${p.sort_order || p.page_number}) ${p.title || ''}`
                    : (p.title || `Pagina ${p.id}`);
                pageSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error loading pages: ", err));
}

function populateFilterChapters(prefix) {
    const chapSelect = document.getElementById(`${prefix}-filter-chapter`);
    if (!chapSelect) return;

    fetch('/api/chapters')
        .then(res => res.json())
        .then(resData => {
            const chapters = Array.isArray(resData) ? resData : (resData.data || []);
            chapSelect.innerHTML = '<option value="">All Chapters (à¦¸à¦¬ à¦…à¦§à§à¦¯à¦¾à§Ÿ)</option>';
            chapters.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.sort_order ? `Capitolo ${c.sort_order}) ${c.name}` : (c.chapter_number ? `Capitolo ${c.chapter_number}) ${c.name}` : c.name);
                chapSelect.appendChild(opt);
            });
            populateFilterPages(prefix);
        })
        .catch(err => console.error("Error populating chapters: ", err));
}

function onCorrectChapterChange() {
    populateFilterPages('correct');
    loadCorrectMcqsList();
}
window.onCorrectChapterChange = onCorrectChapterChange;

function onWrongChapterChange() {
    populateFilterPages('wrong');
    loadWrongMcqsList();
}
window.onWrongChapterChange = onWrongChapterChange;

function toggleCorrectMcqsSelectMode() {
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card');
    const selectedCount = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card.selected-q-card').length;
    if (selectedCount === 0 && cards.length > 0) {
        cards[0].classList.add('selected-q-card');
    }
    showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦®à§‹à¦¡ à¦šà¦¾à¦²à§ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à§‡ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à§à¦¨');
}
window.toggleCorrectMcqsSelectMode = toggleCorrectMcqsSelectMode;

function selectAllCorrectMcqs() {
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}
window.selectAllCorrectMcqs = selectAllCorrectMcqs;

function unselectAllCorrectMcqs() {
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'inline-block';
    const cards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦†à¦¨à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}
window.unselectAllCorrectMcqs = unselectAllCorrectMcqs;

function toggleCorrectMcqCardSelection(qId, card) {
    card.classList.toggle('selected-q-card');
    const selectedCount = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card.selected-q-card').length;
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectedCount > 0 && selectBtn) {
        selectBtn.style.display = 'none';
    }
}
window.toggleCorrectMcqCardSelection = toggleCorrectMcqCardSelection;

function startSelectedCorrectMcqsQuiz() {
    const selectedCards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card.selected-q-card');
    let selectedQuestions = [];
    if (selectedCards.length > 0) {
        selectedCards.forEach(c => {
            const id = parseInt(c.getAttribute('data-qid'));
            const q = (window.cachedQuestionsMap && window.cachedQuestionsMap[id]) ||
                (window.currentCorrectQuestions && window.currentCorrectQuestions.find(item => item.id === id));
            if (q) selectedQuestions.push(q);
        });
    } else if (window.currentCorrectQuestions && window.currentCorrectQuestions.length > 0) {
        selectedQuestions = window.currentCorrectQuestions;
    }

    if (selectedQuestions.length === 0) {
        showToast('à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }

    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        testQuestions = selectedQuestions.map(q => ({
            id: q.id,
            italian: q.italian || q.question || '',
            bangla: q.bangla || q.bn_question || '',
            is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
            image: q.image,
            audio: q.audio || q.voice,
            video: q.video,
            vocabulary: q.vocabulary || []
        }));
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `CORRECT MCQs (${testQuestions.length})`;
            timerPill.style.backgroundColor = 'rgba(34, 197, 94, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'ModalitÃ  Esercitazione (Correct MCQs)';
        }

        openScreen('test', 'Correct MCQs Quiz');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}
window.startSelectedCorrectMcqsQuiz = startSelectedCorrectMcqsQuiz;

function loadCorrectMcqsList() {
    const container = document.getElementById('correct-mcqs-list-container');
    const countEl = document.getElementById('correct-mcqs-count');
    if (!container) return;

    const chapSelect = document.getElementById('correct-filter-chapter');
    if (chapSelect && chapSelect.options.length <= 1) {
        populateFilterChapters('correct');
    }

    const selectedChapter = document.getElementById('correct-filter-chapter')?.value;
    const selectedPage = document.getElementById('correct-filter-page')?.value;
    const searchQuery = document.getElementById('correct-search-input')?.value?.toLowerCase()?.trim() || '';

    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande corrette...</div>`;

    const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    const correctQueryParams = new URLSearchParams({
        chapter_id: selectedChapter || '',
        page_id: selectedPage || '',
        search: searchQuery || '',
        phone: userPhone,
        session_id: userSessionId
    });

    fetch(`/api/v1/correct-mcqs?${correctQueryParams.toString()}`, {
        headers: { 'X-Client-Phone': userPhone }
    })
        .then(res => res.json())
        .then(resData => {
            let questions = resData.data || resData || [];
            if (!Array.isArray(questions)) questions = [];

            if (questions.length === 0 && !selectedChapter && !selectedPage && !searchQuery) {
                const userStats = getUserQuestionStats();
                const correctIds = [];
                Object.keys(userStats).forEach(idStr => {
                    const item = userStats[idStr];
                    if (item && typeof item === 'object') {
                        const cCount = typeof item.correct === 'number' ? item.correct : (item.state === 'correct' ? 1 : 0);
                        const wCount = typeof item.wrong === 'number' ? item.wrong : 0;
                        if (cCount > wCount || item.state === 'correct') {
                            correctIds.push(parseInt(idStr));
                        }
                    }
                });

                if (correctIds.length > 0) {
                    return fetch(`/api/questions/by-ids?ids=${correctIds.join(',')}`).then(r => r.json());
                }
            }
            return questions;
        })
        .then(questions => {
            let filtered = Array.isArray(questions) ? questions : (questions.data || []);
            if (selectedChapter) {
                filtered = filtered.filter(q => String(q.chapter) === String(selectedChapter) || String(q.chapter_id) === String(selectedChapter));
            }
            if (selectedPage) {
                filtered = filtered.filter(q => String(q.page_id) === String(selectedPage) || String(q.page) === String(selectedPage));
            }
            if (searchQuery) {
                filtered = filtered.filter(q => (q.italian && q.italian.toLowerCase().includes(searchQuery)) || (q.bangla && q.bangla.toLowerCase().includes(searchQuery)));
            }

            if (countEl) countEl.innerText = `${filtered.length} Domande`;
            if (filtered.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">à¦•à§‹à¦¨à§‹ à¦¸à¦ à¦¿à¦• à¦‰à¦¤à§à¦¤à¦° à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤</div>`;
                return;
            }

            window.currentCorrectQuestions = filtered;
            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            container.innerHTML = '';
            filtered.forEach((q, index) => {
                if (!q || !q.id || (!q.italian && !q.question)) return;
                window.cachedQuestionsMap[q.id] = q;
                const card = document.createElement('div');
                card.className = `detail-q-card correct`;
                card.setAttribute('data-qid', q.id);
                card.style.position = 'relative';
                card.style.cursor = 'pointer';

                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) return;
                    toggleCorrectMcqCardSelection(q.id, card);
                };

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                const safeItalian = (q.italian || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
                const rawQImg = q.image || q.img;
                const qImage = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawQImg) : (rawQImg && !rawQImg.includes('/data/user/') && !rawQImg.includes('scaled_IMG') ? rawQImg : '');

                const leftThumbHtml = `
                    <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        ${qImage ? `<img src="${qImage}" onerror="this.style.display='none'" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">` : ''}
                    </div>
                `;

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
                                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; background-color: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1.5px solid #ef4444;">
                                        <i class="fa-solid fa-circle-xmark" style="font-size: 10px;"></i> FALSO
                                    </span>
                                `}
                            </div>
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                                <i class="fa fa-eye" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian, q.vocabulary) : (q.italian || '')}</div>
                            <div class="detail-q-text-bn" id="correct-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || ''}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-end; width: 100%; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS('${safeItalian}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play" style="font-size:12px;"></i>
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¬à¦¾à¦‚à¦²à¦¾</span>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
                        ` : ''}
                        <button class="test-ctrl-btn" onclick="openCachedQuestionTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦…à¦¨à§à¦¬à¦¾à¦¦</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Bookmark">
                            <i class="fa-regular fa-bookmark" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¸à§‡à¦­</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¨à§‹à¦Ÿ</span>
                        </button>
                    </div>
                `;

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const qType = q.type || (q.cartello_id !== undefined ? 'cartelli' : (q.correct_answer ? 'cartelli' : 'argomenti'));
                const statKey = (qType === 'cartelli' || String(q.id).startsWith('cartelli_')) ? `cartelli_${q.id}` : q.id;
                const record = userStatsMap[statKey] || {};
                const correctCount = (typeof q.correct_count === 'number' && q.correct_count > 0) ? q.correct_count : (typeof record.correct === 'number' ? record.correct : 0);
                const wrongCount = (typeof q.wrong_count === 'number' && q.wrong_count > 0) ? q.wrong_count : (typeof record.wrong === 'number' ? record.wrong : 0);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 14px; padding: 8px 14px; background: rgba(241, 245, 249, 0.6); border: 1px solid var(--border-card); border-radius: 12px; font-size: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;';
                    statsDiv.innerHTML = `
                        <div style="color: #475569; font-weight: 600; font-size: 12px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 600;">
                            <span style="color: #16a34a;">Giusto ${correctCount} volte</span>
                            <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                        </div>
                    `;
                    card.appendChild(statsDiv);
                }

                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error loading correct MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">à¦¸à¦ à¦¿à¦• à¦‰à¦¤à§à¦¤à¦° à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤</div>`;
        });
}

function openCachedQuestionTranslation(qId) {
    const q = window.cachedQuestionsMap ? window.cachedQuestionsMap[qId] : null;
    if (q) {
        const itText = q.italian || q.question || '';
        const bnText = q.bangla || q.bn_question || '';
        const vocab = q.vocabulary || [];
        const img = q.image || q.img || (q.page && q.page.image ? q.page.image : '');
        openQuestionTranslationModal(itText, bnText, vocab, img);
    } else {
        showToast('à¦…à¦¨à§à¦¬à¦¾à¦¦ à¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¸à¦®à§à¦­à¦¬ à¦¹à§Ÿà¦¨à¦¿');
    }
}
window.openCachedQuestionTranslation = openCachedQuestionTranslation;

function toggleWrongMcqsSelectMode() {
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card');
    const selectedCount = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card.selected-q-card').length;
    if (selectedCount === 0 && cards.length > 0) {
        cards[0].classList.add('selected-q-card');
    }
    showToast('à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦®à§‹à¦¡ à¦šà¦¾à¦²à§ à¦¹à§Ÿà§‡à¦›à§‡à¥¤ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à§‡ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à§à¦¨');
}
window.toggleWrongMcqsSelectMode = toggleWrongMcqsSelectMode;

function selectAllWrongMcqs() {
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}
window.selectAllWrongMcqs = selectAllWrongMcqs;

function unselectAllWrongMcqs() {
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'inline-block';
    const cards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('à¦¸à¦¬ à¦ªà§à¦°à¦¶à§à¦¨ à¦†à¦¨à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
}
window.unselectAllWrongMcqs = unselectAllWrongMcqs;

function toggleWrongMcqCardSelection(qId, card) {
    card.classList.toggle('selected-q-card');
    updateWrongMcqSelectionUI();
}
window.toggleWrongMcqCardSelection = toggleWrongMcqCardSelection;

function updateWrongMcqSelectionUI() {
    const selectedCount = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card.selected-q-card').length;
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) {
        selectBtn.style.display = (selectedCount > 0) ? 'none' : 'inline-block';
    }
}
window.updateWrongMcqSelectionUI = updateWrongMcqSelectionUI;

function updateCorrectMcqSelectionUI() {
    const selectedCount = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card.selected-q-card').length;
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) {
        selectBtn.style.display = (selectedCount > 0) ? 'none' : 'inline-block';
    }
}
window.updateCorrectMcqSelectionUI = updateCorrectMcqSelectionUI;

function startSelectedWrongMcqsQuiz() {
    const selectedCards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card.selected-q-card');
    let selectedQuestions = [];
    if (selectedCards.length > 0) {
        selectedCards.forEach(c => {
            const id = parseInt(c.getAttribute('data-qid'));
            const q = (window.cachedQuestionsMap && window.cachedQuestionsMap[id]) ||
                (window.currentWrongQuestions && window.currentWrongQuestions.find(item => item.id === id));
            if (q) selectedQuestions.push(q);
        });
    } else if (window.currentWrongQuestions && window.currentWrongQuestions.length > 0) {
        selectedQuestions = window.currentWrongQuestions;
    }

    if (selectedQuestions.length === 0) {
        showToast('à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }

    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        testQuestions = selectedQuestions.map(q => ({
            id: q.id,
            italian: q.italian || q.question || '',
            bangla: q.bangla || q.bn_question || '',
            is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
            image: q.image,
            audio: q.audio || q.voice,
            video: q.video,
            vocabulary: q.vocabulary || []
        }));
        currentTestIndex = 0;
        testAnswers = Array(testQuestions.length).fill(null);

        const timerPill = document.getElementById('test-timer');
        if (timerPill) {
            timerPill.innerText = `WRONG MCQs (${testQuestions.length})`;
            timerPill.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
            timerPill.style.borderColor = 'var(--accent-red)';
            timerPill.style.color = 'var(--accent-red)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'ModalitÃ  Esercitazione (Wrong MCQs)';
        }

        openScreen('test', 'Wrong MCQs Quiz');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}
window.startSelectedWrongMcqsQuiz = startSelectedWrongMcqsQuiz;

function loadWrongMcqsList() {
    const container = document.getElementById('wrong-mcqs-list-container');
    const countEl = document.getElementById('wrong-mcqs-count');
    if (!container) return;

    const chapSelect = document.getElementById('wrong-filter-chapter');
    if (chapSelect && chapSelect.options.length <= 1) {
        populateFilterChapters('wrong');
    }

    const selectedChapter = document.getElementById('wrong-filter-chapter')?.value || '';
    const selectedPage = document.getElementById('wrong-filter-page')?.value || '';
    const selectedDate = document.getElementById('wrong-filter-date')?.value || '';
    const searchQuery = document.getElementById('wrong-search-input')?.value?.toLowerCase()?.trim() || '';

    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande errate...</div>`;

    const userPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const userSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');

    const queryParams = new URLSearchParams({
        chapter_id: selectedChapter,
        page_id: selectedPage,
        date: selectedDate,
        search: searchQuery,
        phone: userPhone,
        session_id: userSessionId
    });

    fetch(`/api/v1/wrong-mcqs?${queryParams.toString()}`, {
        headers: { 'X-Client-Phone': userPhone }
    })
        .then(res => res.json())
        .then(resData => {
            let questions = resData.data || resData || [];
            if (!Array.isArray(questions)) questions = [];

            if (questions.length === 0 && !selectedChapter && !selectedPage && !selectedDate && !searchQuery) {
                const userStats = getUserQuestionStats();
                const wrongIds = [];
                Object.keys(userStats).forEach(idStr => {
                    const item = userStats[idStr];
                    if (item && typeof item === 'object') {
                        const wCount = typeof item.wrong === 'number' ? item.wrong : (item.state === 'wrong' ? 1 : 0);
                        const cCount = typeof item.correct === 'number' ? item.correct : 0;
                        if (item.state !== 'correct' && (item.state === 'wrong' || (wCount >= cCount && wCount > 0))) {
                            wrongIds.push(parseInt(idStr));
                        }
                    }
                });

                if (wrongIds.length > 0) {
                    return fetch(`/api/questions/by-ids?ids=${wrongIds.join(',')}`)
                        .then(r => r.json())
                        .then(qs => Array.isArray(qs) ? qs : [])
                        .catch(() => []);
                }
            }

            return questions;
        })
        .then(filtered => {
            if (countEl) countEl.innerText = `${filtered.length} Domande`;
            if (!filtered || filtered.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">à¦†à¦ªà¦¨à¦¾à¦° à¦•à§‹à¦¨à§‹ à¦­à§à¦² à¦‰à¦¤à§à¦¤à¦°à§‡à¦° à¦°à§‡à¦•à¦°à§à¦¡ à¦¨à§‡à¦‡!</div>`;
                window.currentWrongQuestions = [];
                return;
            }

            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            window.currentWrongQuestions = filtered;

            container.innerHTML = '';
            filtered.forEach((q, index) => {
                if (!q || !q.id || (!q.italian && !q.question)) return;
                window.cachedQuestionsMap[q.id] = q;

                const card = document.createElement('div');
                card.className = `detail-q-card incorrect`;
                card.setAttribute('data-qid', q.id);
                card.style.position = 'relative';
                card.style.cursor = 'pointer';

                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) return;
                    toggleWrongMcqCardSelection(q.id, card);
                };

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                const safeItalian = (q.italian || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
                const rawQImg = q.image || q.img;
                const qImage = typeof window.sanitizeAppImageUrl === 'function' ? window.sanitizeAppImageUrl(rawQImg) : (rawQImg && !rawQImg.includes('/data/user/') && !rawQImg.includes('scaled_IMG') ? rawQImg : '');

                const leftThumbHtml = `
                    <div style="width: 100px; min-width: 100px; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        ${qImage ? `<img src="${qImage}" onerror="this.style.display='none'" style="width: 100px; max-width: 100px; height: auto; max-height: 100px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">` : ''}
                    </div>
                `;

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
                                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; background-color: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1.5px solid #ef4444;">
                                        <i class="fa-solid fa-circle-xmark" style="font-size: 10px;"></i> FALSO
                                    </span>
                                `}
                            </div>
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Mostra Risposta Corretta">
                                <i class="fa fa-eye" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian, q.vocabulary) : (q.italian || '')}</div>
                            <div class="detail-q-text-bn" id="wrong-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || ''}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: flex-end; width: 100%; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS('${safeItalian}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play" style="font-size:12px;"></i>
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¬à¦¾à¦‚à¦²à¦¾</span>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
                        ` : ''}
                        <button class="test-ctrl-btn" onclick="openCachedQuestionTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦…à¦¨à§à¦¬à¦¾à¦¦</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Bookmark">
                            <i class="fa-regular fa-bookmark" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¸à§‡à¦­</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">à¦¨à§‹à¦Ÿ</span>
                        </button>
                    </div>
                `;

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const qType = q.type || (q.cartello_id !== undefined ? 'cartelli' : (q.correct_answer ? 'cartelli' : 'argomenti'));
                const statKey = (qType === 'cartelli' || String(q.id).startsWith('cartelli_')) ? `cartelli_${q.id}` : q.id;
                const record = userStatsMap[statKey] || {};
                const correctCount = (typeof q.correct_count === 'number' && q.correct_count > 0) ? q.correct_count : (typeof record.correct === 'number' ? record.correct : 0);
                const wrongCount = (typeof q.wrong_count === 'number' && q.wrong_count > 0) ? q.wrong_count : (typeof record.wrong === 'number' ? record.wrong : 0);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 14px; padding: 8px 14px; background: rgba(241, 245, 249, 0.6); border: 1px solid var(--border-card); border-radius: 12px; font-size: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;';
                    statsDiv.innerHTML = `
                        <div style="color: #475569; font-weight: 600; font-size: 12px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 600;">
                            <span style="color: #16a34a;">Giusto ${correctCount} volte</span>
                            <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                        </div>
                    `;
                    card.appendChild(statsDiv);
                }

                container.appendChild(card);
            });
            updateWrongMcqSelectionUI();
        })
        .catch(err => {
            console.error("Error loading wrong MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">à¦­à§à¦² à¦‰à¦¤à§à¦¤à¦° à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤</div>`;
        });
}



function toggleCurrentTestBookmark() {
    let currentQ = null;
    let qType = 'argomenti';

    if (typeof testQuestions !== 'undefined' && Array.isArray(testQuestions) && testQuestions.length > 0 && typeof currentTestIndex !== 'undefined' && testQuestions[currentTestIndex]) {
        currentQ = testQuestions[currentTestIndex];
    } else if (typeof quizData !== 'undefined' && Array.isArray(quizData) && quizData.length > 0 && typeof currentQuizIndex !== 'undefined' && quizData[currentQuizIndex]) {
        currentQ = quizData[currentQuizIndex];
    }

    if (!currentQ || !currentQ.id) {
        showToast('à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
        return;
    }

    if ((currentQ.chapter_name && currentQ.chapter_name.toLowerCase().includes('cartell')) ||
        (currentQ.image && currentQ.image.toLowerCase().includes('cartell'))) {
        qType = 'cartelli';
    }

    const savedPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '');
    const savedSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Client-Phone': savedPhone,
            'X-Session-ID': savedSessionId
        },
        body: JSON.stringify({
            question_id: currentQ.id,
            type: qType,
            phone: savedPhone,
            session_id: savedSessionId,
            italian: currentQ.italian || currentQ.question || ''
        })
    })
        .then(res => res.json())
        .then(data => {
            const isNowSaved = data.saved ?? (data.status === 'saved' || data.is_saved);
            const icon = document.getElementById('test-bookmark-icon');
            if (icon) {
                icon.className = isNowSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                icon.style.color = isNowSaved ? 'var(--accent-green, #22c55e)' : '';
            }

            // Update local storage bookmarks array
            const storageKey = qType === 'cartelli' ? 'cartelli_bookmarks' : 'argomenti_bookmarks';
            try {
                let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const idx = bookmarks.indexOf(currentQ.id);
                if (isNowSaved && idx === -1) bookmarks.push(currentQ.id);
                else if (!isNowSaved && idx > -1) bookmarks.splice(idx, 1);
                localStorage.setItem(storageKey, JSON.stringify(bookmarks));
            } catch (_) { }

            showToast(data.message || (isNowSaved ? 'à¦ªà§à¦°à¦¶à§à¦¨à¦Ÿà¦¿ à¦¸à§‡à¦­ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡ (Saved)' : 'à¦¸à§‡à¦­ à¦¥à§‡à¦•à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡ (Removed)'));
        })
        .catch(err => {
            console.error('Error toggling test bookmark:', err);
            showToast('à¦¬à§à¦•à¦®à¦¾à¦°à§à¦• à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡');
        });
}

function openCurrentTestNoteModal() {
    let currentQ = null;
    let qType = 'argomenti';

    if (typeof testQuestions !== 'undefined' && Array.isArray(testQuestions) && testQuestions.length > 0 && typeof currentTestIndex !== 'undefined' && testQuestions[currentTestIndex]) {
        currentQ = testQuestions[currentTestIndex];
    } else if (typeof quizData !== 'undefined' && Array.isArray(quizData) && quizData.length > 0 && typeof currentQuizIndex !== 'undefined' && quizData[currentQuizIndex]) {
        currentQ = quizData[currentQuizIndex];
    }

    const qId = (currentQ && currentQ.id) ? currentQ.id : null;
    if (currentQ && ((currentQ.chapter_name && currentQ.chapter_name.toLowerCase().includes('cartell')) || (currentQ.image && currentQ.image.toLowerCase().includes('cartell')))) {
        qType = 'cartelli';
    }
    openNotesModal(null, qId, qType, currentQ ? (currentQ.user_note || '') : '');
}

// --- 9. Sfida (Challenge Mode) & Leaderboard Logic ---
let isSfidaMode = false;
let sfidaStreak = 0;

function startSfidaChallenge() {
    isSfidaMode = true;
    sfidaStreak = 0;
    showToast('à¦šà§à¦¯à¦¾à¦²à§‡à¦žà§à¦œ à¦¶à§à¦°à§ à¦¹à¦šà§à¦›à§‡! à¦­à§à¦² à¦•à¦°à¦²à§‡à¦‡ à¦–à§‡à¦²à¦¾ à¦¶à§‡à¦·...');

    fetch('/api/questions/exam')
        .then(r => r.json())
        .then(data => {
            if (data && data.length > 0) {
                practiceMode = 'sfida';
                testQuestions = data.map(q => ({
                    id: q.id,
                    italian: q.italian || q.question || '',
                    bangla: q.bangla || q.bn_question || '',
                    is_vero: q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1,
                    image: q.image,
                    audio: q.audio || q.voice,
                    video: q.video,
                    vocabulary: q.vocabulary || []
                }));
                currentTestIndex = 0;
                testAnswers = Array(testQuestions.length).fill(null);
                openScreen('test', 'Sfida Mode');
                switchTestQuestionTab(1);
                showTestQuestion();
                startTestTimer();
            } else {
                showToast('à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿');
            }
        })
        .catch(() => showToast('à¦šà§à¦¯à¦¾à¦²à§‡à¦žà§à¦œ à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡'));
}

function loadLeaderboardData() {
    const highScores = localStorage.getItem('sfida_high_score') || 0;
    const highScoreEl = document.getElementById('sfida-user-high-score');
    if (highScoreEl) {
        highScoreEl.innerText = `à¦†à¦ªà¦¨à¦¾à¦° à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à¦¸à§à¦•à§‹à¦°: ${highScores} à¦ªà§Ÿà§‡à¦¨à§à¦Ÿ`;
    }

    fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                renderLeaderboardUI(data.data);
            }
        })
        .catch(err => {
            console.error('Error fetching leaderboard:', err);
        });
}

function renderLeaderboardUI(list) {
    const podiumContainer = document.getElementById('sfida-podium-container');
    const listContainer = document.getElementById('sfida-leaderboard-list');

    if (!podiumContainer || !listContainer) return;

    podiumContainer.innerHTML = '';
    listContainer.innerHTML = '';

    if (!list || list.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">à¦•à§‹à¦¨à§‹ à¦¡à¦¾à¦Ÿà¦¾ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿</div>';
        return;
    }

    const top3 = list.slice(0, 3);
    const rest = list.slice(3);

    const podiumColors = [
        { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', badge: 'ðŸ¥‡', label: '1st' },
        { border: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)', badge: 'ðŸ¥ˆ', label: '2nd' },
        { border: '#D97706', bg: 'rgba(217, 119, 6, 0.08)', badge: 'ðŸ¥‰', label: '3rd' }
    ];

    top3.forEach((user, index) => {
        const styleInfo = podiumColors[index] || podiumColors[0];
        const cardHtml = `
            <div style="background: var(--bg-card); border: 2px solid ${styleInfo.border}; border-radius: 16px; padding: 14px 8px; text-align: center; box-shadow: var(--shadow-card); position: relative; display: flex; flex-direction: column; align-items: center;">
                <span style="position: absolute; top: -10px; font-size: 18px;">${styleInfo.badge}</span>
                <img src="${user.avatar}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; margin-top: 6px; margin-bottom: 6px; border: 2px solid ${styleInfo.border};" alt="${user.name}">
                <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name}</div>
                <div style="font-size: 11px; font-weight: 900; color: #6366F1; margin-top: 4px;">${user.points} pts</div>
                <div style="font-size: 9px; color: var(--text-secondary); margin-top: 4px; display: flex; gap: 4px; align-items: center;">
                    <span style="color:#4CAF50; font-weight:700;">âœ“ ${user.correct_count}</span>
                    <span style="color:#EF4444; font-weight:700;">âœ— ${user.wrong_count}</span>
                </div>
            </div>
        `;
        podiumContainer.innerHTML += cardHtml;
    });

    list.forEach((user, idx) => {
        const rankNum = idx + 1;
        const itemHtml = `
            <div style="background: var(--bg-card); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-card); border: 1px solid var(--border-card);">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                    <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--bg-page); border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--text-primary); flex-shrink: 0;">
                        #${rankNum}
                    </div>
                    <img src="${user.avatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="${user.name}">
                    <div style="min-width: 0;">
                        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name}</div>
                        <div style="font-size: 10px; color: var(--text-secondary); display: flex; gap: 8px; margin-top: 2px;">
                            <span>à¦®à§‹à¦Ÿ: <b>${user.total_attempted}</b></span>
                            <span style="color:#4CAF50;">à¦¸à¦ à¦¿à¦•: <b>${user.correct_count}</b></span>
                            <span style="color:#EF4444;">à¦­à§à¦²: <b>${user.wrong_count}</b></span>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(99, 102, 241, 0.1); color: #6366F1; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 12px; flex-shrink: 0; margin-left: 8px;">
                    ${user.points} pts
                </div>
            </div>
        `;
        listContainer.innerHTML += itemHtml;
    });
}

// --- 10. User Profile & Avatar Edit Logic ---
let uploadedAvatarBase64 = null;

function loadUserProfileData() {
    fetch('/api/user/profile')
        .then(r => r.json())
        .then(res => {
            if (res.status === 'success' && res.data) {
                const nameInput = document.getElementById('profile-name-input');
                const phoneInput = document.getElementById('profile-phone-input');
                const avatarImg = document.getElementById('profile-avatar-img');
                const examsEl = document.getElementById('stats-exams');
                const errorsEl = document.getElementById('stats-errors');

                const name = res.data.name || localStorage.getItem('user_profile_name') || '';
                const phone = res.data.phone || localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '') || '';
                const avatar = res.data.avatar || localStorage.getItem('user_profile_avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366F1&color=fff`;

                if (nameInput) nameInput.value = name;
                if (phoneInput) phoneInput.value = phone;
                if (avatarImg) avatarImg.src = avatar;
                if (examsEl) examsEl.innerText = res.data.completed_exams !== undefined ? res.data.completed_exams : '0';
                if (errorsEl) errorsEl.innerText = res.data.avg_errors !== undefined ? res.data.avg_errors : '0.0';

                localStorage.setItem('user_profile_name', name);
                localStorage.setItem('user_profile_avatar', avatar);
                if (phone) {
                    localStorage.setItem('app_client_phone', phone);
                }
            }
        })
        .catch(() => {
            const nameInput = document.getElementById('profile-name-input');
            const phoneInput = document.getElementById('profile-phone-input');
            const avatarImg = document.getElementById('profile-avatar-img');
            const name = localStorage.getItem('user_profile_name') || '';
            const phone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '') || '';
            const avatar = localStorage.getItem('user_profile_avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366F1&color=fff`;

            if (nameInput) nameInput.value = name;
            if (phoneInput) phoneInput.value = phone;
            if (avatarImg) avatarImg.src = avatar;
        });
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('à¦›à¦¬à¦¿ à¦…à¦¬à¦¶à§à¦¯à¦‡ à§« MB à¦à¦° à¦›à§‹à¦Ÿ à¦¹à¦¤à§‡ à¦¹à¦¬à§‡');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedAvatarBase64 = e.target.result;
        const avatarImg = document.getElementById('profile-avatar-img');
        if (avatarImg) avatarImg.src = uploadedAvatarBase64;
    };
    reader.readAsDataURL(file);
}

function validateProfileNameInput() {
    const hint = document.getElementById('profile-name-hint');
    if (hint) {
        hint.innerText = '';
        hint.style.color = 'var(--text-secondary)';
    }
}

function saveUserProfile() {
    const nameInput = document.getElementById('profile-name-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const hint = document.getElementById('profile-name-hint');
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name) {
        if (hint) {
            hint.innerText = 'âš ï¸ à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨à¥¤';
            hint.style.color = '#ef4444';
        }
        showToast('à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¾à¦® à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨');
        return;
    }

    // Persist phone for cross-device two-way sync
    if (phone) {
        localStorage.setItem('app_client_phone', phone);
        document.cookie = "app_client_phone=" + encodeURIComponent(phone) + "; path=/; SameSite=Lax";
        if (typeof currentClientPhone !== 'undefined') {
            currentClientPhone = phone;
        }

        // Verify/register client identity with backend
        fetch('/api/v1/client/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                phone: phone,
                first_name: name,
                session_id: localStorage.getItem('app_client_session_id') || ''
            })
        }).catch(err => console.warn('Sync client verify note:', err));
    }

    const payload = {
        name: name,
        phone: phone,
        avatar: uploadedAvatarBase64
    };

    fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('user_profile_name', data.data.name);
                if (data.data.avatar) {
                    localStorage.setItem('user_profile_avatar', data.data.avatar);
                }
                if (hint) {
                    hint.innerText = 'âœ“ ' + data.message;
                    hint.style.color = '#4CAF50';
                }
                showToast('à¦ªà§à¦°à§‹à¦«à¦¾à¦‡à¦² à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡!');
                if (typeof loadLeaderboardData === 'function') {
                    loadLeaderboardData();
                }
            } else {
                if (hint) {
                    hint.innerText = 'âŒ ' + (data.message || 'à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤');
                    hint.style.color = '#ef4444';
                }
                showToast(data.message || 'à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à¦°à¦¤à§‡ à¦¬à§à¦¯à¦°à§à¦¥ à¦¹à§Ÿà§‡à¦›à§‡');
            }
        })
        .catch(err => {
            if (hint) {
                hint.innerText = 'âŒ à¦•à§‹à¦¨à§‹ à¦¨à§‡à¦Ÿà¦“à§Ÿà¦¾à¦°à§à¦• à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤';
                hint.style.color = '#ef4444';
            }
        });
}

// --- 11. Manuale (Theory Guidebook) Logic ---
let allManualeTopics = [];

function loadManualeTopics() {
    const container = document.getElementById('manuale-topics-container');
    if (container) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:8px;"></i><br>à¦®à§à¦¯à¦¾à¦¨à§à¦¯à¦¼à¦¾à¦² à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...</div>';
    }
    fetch('/api/v1/manuale/chapters')
        .then(res => res.json())
        .then(data => {
            const chapters = (data.status === 'success' && data.data) ? data.data : (Array.isArray(data) ? data : []);
            allManualeTopics = chapters;
            renderManualeTopics(allManualeTopics);
        })
        .catch(err => {
            console.error('Error fetching manuale topics:', err);
            const container = document.getElementById('manuale-topics-container');
            if (container) {
                container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--accent-red); font-weight:bold;">à¦®à§à¦¯à¦¾à¦¨à§à¦¯à¦¼à¦¾à¦² à¦²à§‹à¦¡ à¦•à¦°à¦¤à§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡</div>';
            }
        });
}

function renderManualeTopics(topics) {
    const container = document.getElementById('manuale-topics-container');
    if (!container) return;

    container.innerHTML = '';

    if (!topics || topics.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-secondary);">à¦•à§‹à¦¨à§‹ à¦®à§à¦¯à¦¾à¦¨à§à¦¯à¦¼à¦¾à¦² à¦¥à¦¿à¦“à¦°à¦¿ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿</div>';
        return;
    }

    topics.forEach((item, index) => {
        const chapNum = item.chapter_number || item.sort_order || (index + 1);
        const titleText = item.title || item.name || `Capitolo ${chapNum}`;
        const imgUrl = item.image_path || item.image || '';
        const contentText = item.content || 'Nessuna spiegazione teorica inserita.';

        let vocabs = item.vocabulary || [];
        if (typeof vocabs === 'string') {
            try { vocabs = JSON.parse(vocabs); } catch (e) { vocabs = []; }
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
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0;">
                    ${chapNum}
                </div>
                <div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 0.5px;">Capitolo ${chapNum}</div>
                    <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${titleText}</div>
                </div>
            </div>

            ${imgUrl ? `
                <div style="text-align: center; margin-bottom: 16px; background: var(--bg-primary); padding: 12px; border-radius: 16px; border: 1px solid var(--border-card);">
                    <img src="${imgUrl}" style="max-height: 320px; width: auto; max-width: 100%; object-fit: contain; border-radius: 12px; cursor: pointer;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)">
                </div>
            ` : ''}

            <div style="background: var(--bg-primary); border: 1px solid var(--border-card); border-radius: 14px; padding: 16px 18px; color: var(--text-primary); font-size: 15px; line-height: 1.8; font-weight: 500;">
                ${contentText}
            </div>

            ${vocabHtml}
        `;
        container.appendChild(card);
    });
}

function filterManualeTopics() {
    const input = document.getElementById('manuale-search-input');
    const query = input ? input.value.trim().toLowerCase() : '';

    if (!query) {
        renderManualeTopics(allManualeTopics);
        return;
    }

    const filtered = allManualeTopics.filter(item => {
        const nameMatch = (item.name || item.title || '').toLowerCase().includes(query);
        const contentMatch = (item.content || '').toLowerCase().includes(query);
        const chapMatch = String(item.sort_order || item.chapter_number || '').includes(query);
        return nameMatch || contentMatch || chapMatch;
    });

    renderManualeTopics(filtered);
}

window.loadUserProfileData = loadUserProfileData;
window.loadManualeTopics = loadManualeTopics;
window.renderManualeTopics = renderManualeTopics;
window.filterManualeTopics = filterManualeTopics;
window.loadLeaderboardData = typeof loadLeaderboardData === 'function' ? loadLeaderboardData : undefined;
window.loadCorrectMcqsList = typeof loadCorrectMcqsList === 'function' ? loadCorrectMcqsList : undefined;
window.loadWrongMcqsList = typeof loadWrongMcqsList === 'function' ? loadWrongMcqsList : undefined;
