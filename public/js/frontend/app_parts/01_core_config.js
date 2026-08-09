// --- Global Fetch Interceptor for Client License Headers ---
(function () {
    const originalFetch = window.fetch;
    window.fetch = function (resource, init = {}) {
        const phone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : null);
        const sessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : null);

        if (phone || sessionId) {
            init = init || {};
            init.headers = init.headers || {};

            if (init.headers instanceof Headers) {
                if (phone && !init.headers.has('X-Client-Phone')) init.headers.append('X-Client-Phone', phone);
                if (sessionId && !init.headers.has('X-Client-Session-ID')) init.headers.append('X-Client-Session-ID', sessionId);
            } else if (Array.isArray(init.headers)) {
                if (phone) init.headers.push(['X-Client-Phone', phone]);
                if (sessionId) init.headers.push(['X-Client-Session-ID', sessionId]);
            } else {
                if (phone && !init.headers['X-Client-Phone']) init.headers['X-Client-Phone'] = phone;
                if (sessionId && !init.headers['X-Client-Session-ID']) init.headers['X-Client-Session-ID'] = sessionId;
            }
        }
        return originalFetch.call(this, resource, init);
    };
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
let currentClientActive = localStorage.getItem('app_client_active') !== 'false';
let currentClientPhone = null;
let currentClientSessionId = null;

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
    return fetch('/api/user-mcq-results?per_page=5000')
        .then(res => res.json())
        .then(data => {
            const items = data.data || (Array.isArray(data) ? data : []);
            if (!items || !Array.isArray(items)) return;

            const stats = getUserQuestionStats();
            items.forEach(item => {
                const qId = item.question_id;
                if (!qId) return;
                const isCorrect = item.is_correct === 1 || item.is_correct === true || item.is_correct === '1';

                if (!stats[qId] || new Date(item.updated_at || 0) >= new Date(stats[qId].updated_at || 0)) {
                    stats[qId] = {
                        state: isCorrect ? 'correct' : 'wrong',
                        correct: isCorrect ? 1 : 0,
                        wrong: isCorrect ? 0 : 1,
                        chapter: item.chapter_id || null,
                        updated_at: item.updated_at
                    };
                }
            });
            saveUserQuestionStats(stats);
        })
        .catch(err => console.error("Error syncing user question stats: ", err));
}

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
            showToast('ডার্ক মোড সক্রিয় হয়েছে');
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'light');
            showToast('লাইট মোড সক্রিয় হয়েছে');
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
