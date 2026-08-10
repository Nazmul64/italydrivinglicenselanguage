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
    if (typeof currentClientActive !== 'undefined' && !currentClientActive && localStorage.getItem('app_client_active') !== 'true') {
        return Promise.resolve();
    }

    return fetch('/api/user-mcq-results?per_page=5000')
        .then(res => {
            if (!res.ok) return null;
            return res.json();
        })
        .then(data => {
            if (!data) return;
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

// --- 4. Chapters List Metadata & Dynamic Rendering ---
const chaptersList = [
    { id: 1, name: "Definizioni stradali e doveri dell'uso della strada", bn: "রাস্তা ও ট্রাফিকের সাধারণ সংজ্ঞা এবং চালকের দায়িত্ব" },
    { id: 2, name: "Segnali di pericolo", bn: "বিপদজনক সংকেত" },
    { id: 3, name: "Segnali di divieto", bn: "নিষেধাজ্ঞা সংকেত" },
    { id: 4, name: "Segnali di obbligo", bn: "বাধ্যতামূলক সংকেত" },
    { id: 5, name: "Segnali orizzontali e segni sulla strada", bn: "রাস্তার অনুভূমিক দাগ এবং সংকেত" },
    { id: 6, name: "Segnalazioni semaforiche e degli agenti del traffico", bn: "ট্রাফিক লাইট এবং ট্রাফিক পুলিশের সংকেত" },
    { id: 7, name: "Pericolo e intralcio, limiti di velocità, distanza di sicurezza", bn: "বিপদ ও প্রতিবন্ধকতা, গতিসীমা, নিরাপদ দূরত্ব" },
    { id: 8, name: "Norme sulla circolazione dei veicoli (precedenze)", bn: "যানবাহন চলাচেলের নিয়ম (অগ্রাধিকার)" },
    { id: 9, name: "Esempi di precedenza (rappresentazioni grafiche)", bn: "অগ্রাধিকারের চিত্রভিত্তিক উদাহরণ" },
    { id: 10, name: "Norme sul sorpasso", bn: "ওভারটেকিংয়ের নিয়মাবলি" },
    { id: 11, name: "Fermata, sosta, partenza e ingombro della carreggiata", bn: "থামা, পার্কিং, যাত্রা শুরু এবং প্রতিবন্ধকতা সৃষ্টি" },
    { id: 12, name: "Norme sull'uso delle luci, dispositivi acustici, spie", bn: "লাইট, হর্ন এবং ইন্ডিকেটর ব্যবহারের নিয়ম" },
    { id: 13, name: "Cinture di sicurezza, sistemi di ritenuta, casco", bn: "সিটবেল্ট, হেলমেট এবং চাইল্ড সিট ব্যবহারের নিয়ম" },
    { id: 14, name: "Patenti di guida, documenti, punti patente", bn: "ড্রাইভিং লাইসেন্স, নথিপত্র এবং পেনাল্টি পয়েন্ট" },
    { id: 15, name: "Incidenti stradali e primo soccorso", bn: "সড়ক দুর্ঘটনা এবং প্রাথমিক চিকিৎসা" },
    { id: 16, name: "Guida in relazione alle condizioni ambientali", bn: "প্রাকৃতিক বৈরী পরিবেশে গাড়ি চালানো" },
    { id: 17, name: "Responsabilità civile, penale, amministrativa, assicurazione", bn: "আইনি ও ফৌজদারি দায়বদ্ধতা এবং ইনস্যুরেন্স" },
    { id: 18, name: "Limitazione dei consumi, inquinamento, elementi del veicolo", bn: "জ্বালানি সাশ্রয়, পরিবেশ দূষণ এবং গাড়ির পার্টস" },
    { id: 19, name: "Dispositivi di equipaggiamento e specchietti retrovisori", bn: "গাড়ির অভ্যন্তরীণ যন্ত্রপাতি ও লুকিং গ্লাস" },
    { id: 20, name: "Uso ed efficienza dei dispositivi del veicolo", bn: "গাড়ির গুরুত্বপূর্ণ পার্টসের ব্যবহার ও কার্যকারিতা" },
    { id: 21, name: "Comportamenti alla guida in autostrada e strade extraurbane", bn: "এক্সপ্রেসওয়ে এবং হাইওয়েতে গাড়ি চালানোর নিয়ম" },
    { id: 22, name: "Segnali di indicazione, pannelli integrativi, segnali turistici", bn: "নির্দেশনামূলক এবং পর্যটন সাইনবোর্ড" },
    { id: 23, name: "Uso corretto della strada e comportamenti precauzionali", bn: "রাস্তার সঠিক ব্যবহার এবং সতর্কতামূলক আচরণ" },
    { id: 24, name: "Segnali luminosi e indicazioni degli agenti di polizia", bn: "পুলিশের হাতের ইশারা এবং বিশেষ লাইট সংকেত" },
    { id: 25, name: "Definizioni generali e classificazione dei veicoli", bn: "যানবাহনের প্রকারভেদ এবং সাধারণ পরিচিতি" }
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
                <text x="200" y="110" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI D’OBBLIGO</text>
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

    if (!isSchedeSelectMode && selectedSheets.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
    } else if (activeChapterPages.length > 0 && selectedSheets.length === activeChapterPages.length) {
        if (selectAllPill) selectAllPill.classList.add('active');
    } else if (isSchedeSelectMode) {
        if (selectPill) selectPill.classList.add('active');
    }
}

function unselectAllSheets() {
    selectedSheets = [];
    isSchedeSelectMode = false;
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
    showToast('সব পৃষ্ঠা আন-সিলেক্ট করা হয়েছে');
}

function selectAllSheets() {
    selectedSheets = Array.from({ length: activeChapterPages.length }, (_, i) => i);
    isSchedeSelectMode = true;
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
    showToast('সব পৃষ্ঠা সিলেক্ট করা হয়েছে');
}

function toggleSelectSheets() {
    isSchedeSelectMode = true;
    if (selectedSheets.length === 0 && activeChapterPages.length > 0) {
        selectedSheets = [0];
    }
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
}

function toggleSheetSelection(sheetIndex) {
    const idx = selectedSheets.indexOf(sheetIndex);
    if (idx > -1) {
        selectedSheets.splice(idx, 1);
    } else {
        selectedSheets.push(sheetIndex);
    }
    if (selectedSheets.length > 0) {
        isSchedeSelectMode = true;
    } else {
        isSchedeSelectMode = false;
    }
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    updateArgomentiPillStates();
}

function updateSheetsQuizButtonVisibility() {
    const btn = document.getElementById('sheets-quiz-btn');
    if (!btn) return;
    if (selectedSheets.length > 0) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

function startCustomSheetsQuiz() {
    if (selectedSheets.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি পৃষ্ঠা সিলেক্ট করুন');
        return;
    }

    let pool = [];
    selectedSheets.forEach(sheetIndex => {
        const chunk = activeChapterQuestions.slice(sheetIndex * 10, (sheetIndex + 1) * 10);
        pool = pool.concat(chunk);
    });

    if (pool.length === 0) {
        showToast('সিলেক্ট করা পৃষ্ঠাসমূহে কোনো প্রশ্ন পাওয়া যায়নি');
        return;
    }

    showToast('কুইজ প্রশ্ন তৈরি হচ্ছে...');

    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    showTestOptionsDialog(() => {
        testQuestions = shuffledPool.slice(0, Math.min(30, shuffledPool.length));
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
            timerLabel.innerText = `${selectedSheets.length} Selected Sheets`;
        }

        openScreen('test', 'Sheets Exam');
        switchTestQuestionTab(1);
        showTestQuestion();
        startTestTimer();
    });
}

let allArgomentiChapters = [];
let isArgomentiSelectMode = false;

function toggleChapterSelection(id) {
    const idx = selectedChapters.indexOf(id);
    if (idx > -1) {
        selectedChapters.splice(idx, 1);
    } else {
        selectedChapters.push(id);
    }
    if (selectedChapters.length > 0) {
        isArgomentiSelectMode = true;
    } else {
        isArgomentiSelectMode = false;
    }
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
}

function unselectAllArgomentiChapters() {
    selectedChapters = [];
    isArgomentiSelectMode = false;
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
    showToast('সব অধ্যায় আন-সিলেক্ট করা হয়েছে');
}

function selectAllArgomentiChapters() {
    selectedChapters = allArgomentiChapters.map(c => c.id);
    isArgomentiSelectMode = true;
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
    showToast('সব অধ্যায় সিলেক্ট করা হয়েছে');
}

function toggleSelectArgomentiChapters() {
    isArgomentiSelectMode = true;
    if (selectedChapters.length === 0 && allArgomentiChapters.length > 0) {
        selectedChapters = [allArgomentiChapters[0].id];
    }
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    updateArgomentiChapterPillStates();
}

function updateCategoryQuizButtonVisibility() {
    const btn = document.getElementById('argomenti-category-quiz-btn');
    if (!btn) return;
    btn.style.display = selectedChapters.length > 0 ? 'block' : 'none';
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

    if (!isArgomentiSelectMode && selectedChapters.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
    } else if (allArgomentiChapters.length > 0 && selectedChapters.length === allArgomentiChapters.length) {
        if (selectAllPill) selectAllPill.classList.add('active');
    } else if (isArgomentiSelectMode) {
        if (selectPill) selectPill.classList.add('active');
    }
}

function startArgomentiCategoryQuiz() {
    if (selectedChapters.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি অধ্যায় সিলেক্ট করুন');
        return;
    }
    showToast('কুইজ প্রশ্ন তৈরি হচ্ছে...');

    Promise.all(selectedChapters.map(chapId =>
        fetch(`/api/questions/chapter/${chapId}`).then(res => res.json())
    ))
        .then(results => {
            let allMcqs = [];
            results.forEach(list => {
                if (Array.isArray(list)) {
                    list.forEach(q => allMcqs.push(q));
                }
            });

            if (allMcqs.length === 0) {
                showToast('কোনো কুইজ প্রশ্ন পাওয়া যায়নি');
                return;
            }

            testQuestions = allMcqs.sort(() => Math.random() - 0.5).slice(0, Math.min(30, allMcqs.length));
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
                timerLabel.innerText = `${selectedChapters.length} Selected Chapters`;
            }

            openScreen('test', 'Argomenti Exam');
            switchTestQuestionTab(1);
            showTestQuestion();
            startTestTimer();
        })
        .catch(err => {
            console.error("Error creating category quiz: ", err);
            showToast('কুইজ শুরু করতে সমস্যা হয়েছে');
        });
}

function renderArgomentiList() {
    const container = document.getElementById('argomenti-list');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento capitoli...</div>`;

    const userStats = getUserQuestionStats();

    fetch('/api/chapters')
        .then(res => res.json())
        .then(chapters => {
            allArgomentiChapters = Array.isArray(chapters) ? chapters : [];
            const countBadge = document.getElementById('argomenti-chapters-count-badge');
            if (countBadge) {
                countBadge.innerText = `${chapters ? chapters.length : 0} Capitoli`;
            }
            container.innerHTML = '';
            chapters.forEach(ch => {
                let correct = 0;
                let wrong = 0;
                let total = ch.question_count || 0;

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
                const isSelected = selectedChapters.includes(ch.id);

                const card = document.createElement('div');
                card.className = `chapter-image-card ${isSelected ? 'selected-chapter-card' : ''}`;
                card.onclick = () => {
                    if (isArgomentiSelectMode) {
                        toggleChapterSelection(ch.id);
                    } else {
                        openChapterSheetsScreen(ch.id);
                    }
                };

                const coverImage = ch.cover_image || ch.image || `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60`;

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                            ${ch.chapter_number || ch.id}) ${ch.name}
                        </div>
                        <div class="chapter-card-img-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                            <img src="${coverImage}" class="chapter-card-img" alt="${ch.name}" style="max-height: 140px; max-width: 90%; width: auto; height: auto; object-fit: contain; border-radius: 8px;">
                        </div>
                        <div style="text-align: center; font-size: 16px; font-weight: 800; color: var(--text-secondary); margin-top: auto; padding-top: 10px;">
                            Progresso
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
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento dei capitoli.</div>`;
        });
}

// --- Scegli Scheda (Sheets Selection Screen) Operations ---
let activeChapterId = null;
let activeChapterQuestions = [];
let activeChapterPages = [];
let activeSheetIndex = null;

function openChapterSheetsScreen(chapterId) {
    activeChapterId = chapterId;

    const labelEl = document.getElementById('selected-chapter-display-label');
    if (labelEl) labelEl.innerText = `Caricamento...`;

    populateChapterDropdownOptions();

    const container = document.getElementById('argomenti-schede-list');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento pagine...</div>`;
    }

    openScreen('argomenti-schede', 'Scegli Scheda');

    Promise.all([
        fetch(`/api/questions/chapter/${chapterId}`).then(res => res.json()),
        fetch(`/api/chapters/${chapterId}/pages`).then(res => res.json())
    ])
        .then(([questions, pages]) => {
            activeChapterQuestions = questions;
            activeChapterPages = pages;

            fetch('/api/chapters')
                .then(r => r.json())
                .then(chapters => {
                    const ch = chapters.find(c => c.id === chapterId);
                    if (ch && labelEl) {
                        labelEl.innerText = `Capitolo ${chapterId}) ${ch.name}`;
                    }
                });

            if (pages.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Nessuna pagina trovata per questo capitolo.</div>`;
                return;
            }

            selectedSheets = [];
            isSchedeSelectMode = false;
            updateSheetsQuizButtonVisibility();
            updateArgomentiPillStates();

            renderSheetsList();
        })
        .catch(err => {
            console.error("Error loading chapter pages: ", err);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento delle pagine.</div>`;
            }
        });
}

function renderSheetsList() {
    const container = document.getElementById('argomenti-schede-list');
    if (!container) return;
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
        const unanswered = Math.max(0, total - correct - wrong);
        const isSelected = selectedSheets.includes(index);

        const pageTitleText = page.title || page.bn_title || getSheetName(activeChapterId, index);
        const displaySheetTitle = pageTitleText.startsWith(`${index + 1}`) ? pageTitleText : `${index + 1}) ${pageTitleText}`;

        const card = document.createElement('div');
        card.className = `content-card ${isSelected ? 'selected-sheet-card' : ''}`;
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '10px';
        card.style.padding = '16px';
        card.onclick = () => {
            if (isSchedeSelectMode) {
                toggleSheetSelection(index);
            } else {
                openPageDetailsScreen(page.id);
            }
        };

        const safeTotal = total || 1;

        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="schede-page-title" style="font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                    ${displaySheetTitle}
                </span>
                <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary);"></i>
            </div>

            <div class="schede-card-footer" style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-secondary);">
                <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                <span>Totale: <strong>${total}</strong></span>
            </div>

            <div style="height: 8px; background-color: var(--border-card); border-radius: 4px; display: flex; overflow: hidden;">
                <div style="background-color: #4CAF50; width: ${(correct / safeTotal) * 100}%;"></div>
                <div style="background-color: #ef4444; width: ${(wrong / safeTotal) * 100}%;"></div>
                <div style="background-color: #f59e0b; width: ${(unanswered / safeTotal) * 100}%;"></div>
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

    fetch('/api/chapters')
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
            timerLabel.innerText = 'Modalità Esercitazione';
        }

        openScreen('test', 'Scheda Practice');
        switchTestQuestionTab(1);
        showTestQuestion();
    });
}

// --- 5. Navigation Logic ---
let screenHistory = ['home'];

function openScreen(screenId, headerTitle) {
    if (!currentClientActive && screenId !== 'home') {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }

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
    } else {
        if (appHeaderTitle) appHeaderTitle.innerText = headerTitle;
        if (backBtn) backBtn.style.display = 'flex';
        if (screenHistory[screenHistory.length - 1] !== screenId) {
            screenHistory.push(screenId);
        }
    }

    syncBottomNav(screenId);

    if (screenId === 'test') {
        if (!testQuestions || testQuestions.length === 0) {
            const testIt = document.getElementById('test-question-it');
            if (testIt) testIt.innerText = 'Caricamento delle domande...';
            fetch('/api/questions/random-test')
                .then(r => r.json())
                .then(data => {
                    if (data && data.length > 0) {
                        practiceMode = 'exam';
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
                        switchTestQuestionTab(1);
                        showTestQuestion();
                        startTestTimer();
                    } else {
                        if (testIt) testIt.innerText = 'ডাটাবেসে কোনো প্রশ্ন পাওয়া যায়নি। এডমিন প্যানেল থেকে প্রশ্ন যোগ করুন।';
                    }
                })
                .catch(() => {
                    if (testIt) testIt.innerText = 'প্রশ্ন লোড করতে সমস্যা হয়েছে';
                });
        } else {
            switchTestQuestionTab(1);
            showTestQuestion();
            startTestTimer();
        }
    } else if (screenId === 'argomenti') {
        renderArgomentiList();
    } else if (screenId === 'social') {
        if (typeof initSocialModule === 'function') initSocialModule();
    } else if (screenId === 'translation') {
        if (typeof initTranslationModule === 'function') initTranslationModule();
    } else if (screenId === 'scheda-esame') {
        if (typeof loadSchedaEsameModule === 'function') loadSchedaEsameModule();
    } else if (screenId === 'dizionario') {
        initDictionary();
    } else if (screenId === 'cartelli') {
        renderCartelliChaptersGrid();
    } else if (screenId === 'saved-mcqs') {
        loadSavedMcqsScreen();
    } else if (screenId === 'correct-mcqs') {
        loadCorrectMcqsList();
    } else if (screenId === 'wrong-mcqs') {
        loadWrongMcqsList();
    } else if (screenId === 'scheda-esame') {
        loadExamSheets();
    } else if (screenId === 'sfida') {
        loadLeaderboardData();
    } else if (screenId === 'profilo') {
        loadUserProfileData();
    } else if (screenId === 'manuale') {
        loadManualeTopics();
    } else if (screenId === 'test-results-detail') {
        if (typeof loadTestResultsDetailScreen === 'function') {
            loadTestResultsDetailScreen();
        }
    }
}

function navigateBack() {
    if (screenHistory.length > 0) {
        const activeScreen = screenHistory[screenHistory.length - 1];
        if (activeScreen === 'test-results-detail') {
            openScreen('home', 'mbanglapatenteb');
            return;
        }
        if (activeScreen === 'exam-simulation') {
            if (confirm("আপনি কি পরীক্ষা বাতিল করে ফিরে যেতে চান?")) {
                if (examTimerInterval) clearInterval(examTimerInterval);
                openScreen('scheda-esame', 'Scheda Esame');
            }
            return;
        }
        if (activeScreen === 'test') {
            submitTestExam();
            return;
        }
        if (activeScreen === 'argomenti-schede') {
            openScreen('argomenti', 'Argomenti');
            return;
        }
        if (activeScreen === 'page-details') {
            openScreen('argomenti-schede', 'Scegli Scheda');
            return;
        }
        if (activeScreen === 'cartelli-schede') {
            openScreen('cartelli', 'Cartelli');
            return;
        }
        if (activeScreen === 'cartelli-page') {
            if (typeof stopAllCartelliAudio === 'function') stopAllCartelliAudio();
            openScreen('cartelli-schede', 'Scegli Scheda');
            return;
        }
        if (activeScreen === 'saved-mcqs') {
            openScreen('home', 'mbanglapatenteb');
            return;
        }
    }
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const prevScreen = screenHistory[screenHistory.length - 1];

        let title = 'mbanglapatenteb';
        if (prevScreen === 'lezioni') title = 'Lezioni';
        else if (prevScreen === 'test') title = 'Test Practice';
        else if (prevScreen === 'argomenti') title = 'Argomenti';
        else if (prevScreen === 'argomenti-schede') title = 'Scegli Scheda';
        else if (prevScreen === 'page-details') title = 'Vere e False';
        else if (prevScreen === 'saved-mcqs') title = 'Saved MCQs';
        else if (prevScreen === 'eclass') title = 'E-Class';
        else if (prevScreen === 'sfida') title = 'Sfida';
        else if (prevScreen === 'scheda-esame') title = 'Scheda Esame';
        else if (prevScreen === 'exam-simulation') title = 'Exam Simulation';
        else if (prevScreen === 'dizionario') title = 'Dizionario';
        else if (prevScreen === 'cartelli') title = 'Cartelli';
        else if (prevScreen === 'profilo') title = 'Profilo';

        openScreen(prevScreen, title);
    } else {
        openScreen('home', 'mbanglapatenteb');
    }
}

function clickBottomNav(screenId) {
    let title = 'mbanglapatenteb';
    if (screenId === 'scheda-esame') title = 'Scheda Esame';
    else if (screenId === 'dizionario') title = 'Dizionario';
    else if (screenId === 'profilo') title = 'Profilo';

    openScreen(screenId, title);
}

function syncBottomNav(screenId) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const navHome = document.getElementById('nav-home');
    const navQuiz = document.getElementById('nav-quiz');
    const navScanner = document.getElementById('nav-scanner');
    const navDictionary = document.getElementById('nav-dictionary');
    const navProfile = document.getElementById('nav-profile');

    if (screenId === 'home' && navHome) {
        navHome.classList.add('active');
    } else if (screenId === 'scheda-esame' && navQuiz) {
        navQuiz.classList.add('active');
    } else if (screenId === 'qr-scanner' && navScanner) {
        navScanner.classList.add('active');
    } else if (screenId === 'dizionario' && navDictionary) {
        navDictionary.classList.add('active');
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

// --- 7. Lezioni (Video Player) Logic ---
function getEmbedVideoHTML(url) {
    if (!url) return '<div style="color:white; font-weight:bold; padding:20px; text-align:center;">ভিডিও লিঙ্ক পাওয়া যায়নি</div>';

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

    if (modalTitle) modalTitle.innerText = title || 'ভিডিও লেকচার';
    if (modalSub) modalSub.innerText = duration ? `${duration} • বাংলা ব্যাখ্যা` : 'ভিডিও লেকচার';

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
    showToast('প্রশ্ন লোড হচ্ছে...');
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
                showToast('এই অধ্যায়ে কোনো প্রশ্ন পাওয়া যায়নি');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('প্রশ্ন লোড করতে ব্যর্থ হয়েছে');
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

    if (progressText) progressText.innerText = `প্রশ্ন: ${currentQuizIndex + 1}/${quizData.length}`;
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
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> সঠিক উত্তর!';
        playAppSound(true);
        updateChapterProgressLocally();
    } else {
        feedback.className = 'feedback-box incorrect';
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ভুল উত্তর! সঠিক উত্তর: ${databaseIsVero ? 'VERO' : 'FALSO'}`;
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
    showToast('পরীক্ষার প্রশ্ন লোড হচ্ছে...');
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
            showToast('পরীক্ষা শুরু করতে সমস্যা হয়েছে');
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

    if (examQNum) examQNum.innerText = `প্রশ্ন ${currentExamIndex + 1}/৩০`;
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

    if (errorsCount) errorsCount.innerText = `${errors} টি ভুল`;

    if (passed) {
        if (statusBadge) {
            statusBadge.className = 'result-badge passed';
            statusBadge.innerText = 'উত্তীর্ণ (IDONEO)';
        }
        if (resultMsg) resultMsg.innerHTML = `অভিনন্দন! আপনি ডেমো পরীক্ষায় উত্তীর্ণ হয়েছেন।<br><small>মোট প্রশ্ন ৩০টি • অনুত্তরিত: ${unanswered}টি</small>`;
        playAppSound(true);
    } else {
        if (statusBadge) {
            statusBadge.className = 'result-badge failed';
            statusBadge.innerText = 'অকৃতকার্য (RESPINTO)';
        }
        if (resultMsg) resultMsg.innerHTML = `দুঃখিত! আপনি পরীক্ষায় পাস করতে পারেননি। সর্বোচ্চ ৪টি ভুল গ্রহণযোগ্য ছিল।<br><small>মোট ভুল: ${errors}টি (অনুত্তরিত সহ)</small>`;
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
let dictionaryData = [];

function fetchDictionaryData() {
    fetch('/api/dizionario')
        .then(r => r.json())
        .then(data => {
            const dbWords = Array.isArray(data) ? data : (data.data || []);
            dictionaryData = dbWords.map(dbItem => ({
                word: dbItem.word || '',
                bn: dbItem.bn || '',
                desc_it: dbItem.desc_it || '',
                desc_bn: dbItem.desc_bn || '',
                image: dbItem.image || '',
                audio: dbItem.audio || null,
                video: dbItem.video || null,
            })).filter(item => item.word !== '');
        })
        .catch(() => { });
}
fetchDictionaryData();

function initDictionary() {
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;
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
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-secondary);">কোনো ফলাফল পাওয়া যায়নি!</div>';
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
    showToast(soundEnabled ? 'শব্দ সংকেত চালু হয়েছে' : 'শব্দ সংকেত বন্ধ করা হয়েছে');
}

function playAppSound(isCorrect) {
    if (!soundEnabled) return;
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.connect(gain);
        gain.connect(context.destination);

        if (isCorrect) {
            osc.frequency.setValueAtTime(523.25, context.currentTime);
            osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            osc.start();
            osc.stop(context.currentTime + 0.3);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, context.currentTime);
            osc.frequency.setValueAtTime(110, context.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
            osc.start();
            osc.stop(context.currentTime + 0.4);
        }
    } catch (e) {
        console.error("Audio error: ", e);
    }
}

function resetAppData() {
    if (confirm("আপনি কি নিশ্চিতভাবে সব ডেটা রিসেট করতে চান?")) {
        const examsEl = document.getElementById('stats-exams');
        const errorsEl = document.getElementById('stats-errors');
        if (examsEl) examsEl.innerText = '0';
        if (errorsEl) errorsEl.innerText = '0.0';
        showToast('সব ডেটা সফলভাবে রিসেট করা হয়েছে');
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
        if (savedPhone || currentClientVerified) {
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

    fetch(url)
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
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">আপনার বার্তা লিখে চ্যাট শুরু করুন। খুব শীঘ্রই উত্তর দেওয়া হবে!</div>`;
        return;
    }


    messages.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.message && msg.message.startsWith('[LICENSE_CARD:') && msg.message.endsWith(']')) {
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=(\d+)/);
            const days = matchDays ? matchDays[1] : 365;
            const key = matchKey ? matchKey[1] : '';

            bubble.className = `license-card-bubble`;
            let buttonHTML = `<button class="license-card-btn" onclick="activateLicenseFromCard(${days})">Attiva Licenza</button>`;
            if (currentClientActive) {
                buttonHTML = '';
            }

            bubble.innerHTML = `
                <div class="license-card-title">Chiave Licenza ${key}</div>
                <div class="license-card-features">
                    <div>Traduzione Testi</div>
                    <div>Audio</div>
                    <div>Lezioni Video</div>
                    <div>Live class video registarti</div>
                    <div>Web App</div>
                    <div>SUPPORTO</div>
                    <div>Giorni ${days}</div>
                </div>
                ${buttonHTML}
            `;
        } else {
            bubble.className = `chat-bubble ${msg.sender === 'user' ? 'user' : 'admin'}`;
            if (msg.attachment_path) {
                const img = document.createElement('img');
                img.src = msg.attachment_path;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '200px';
                img.style.borderRadius = '12px';
                img.style.display = 'block';
                img.style.cursor = 'pointer';
                img.onclick = () => window.open(msg.attachment_path, '_blank');
                bubble.appendChild(img);

                if (msg.message) {
                    const text = document.createElement('div');
                    text.innerText = msg.message;
                    text.style.marginTop = '6px';
                    bubble.appendChild(text);
                }
            } else {
                bubble.innerText = msg.message;
            }
        }

        container.appendChild(bubble);
    });

    if (scrollAtBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight;
    }
}

function activateLicenseFromCard(days) {
    showToast('লাইসেন্স সক্রিয় করা হচ্ছে...');

    fetch('/api/client/activate', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: days })
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

                showToast(`🎉 লাইসেন্স সফলভাবে সক্রিয় করা হয়েছে! (${days} দিন)`);
                checkClientActivation();
                fetchGuestChatMessages();
            } else {
                showToast('সক্রিয় করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error("Error activating license: ", err);
            showToast('সক্রিয় করতে সমস্যা হয়েছে');
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
        showToast('চ্যাট শুরু করতে আপনার নাম ও মোবাইল নম্বর দিয়ে ভেরিফাই করুন।');
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

    showToast('ফাইল আপলোড হচ্ছে...');

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
            showToast('ফাইল পাঠানো হয়েছে');
        })
        .catch(err => {
            console.error("Error uploading attachment: ", err);
            showToast('ফাইল আপলোড করতে সমস্যা হয়েছে');
        });
}

function sendGuestChatMessage() {
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    if (!savedPhone && !currentClientVerified) {
        showToast('চ্যাট শুরু করতে আপনার নাম ও মোবাইল নম্বর দিয়ে ভেরিফাই করুন।');
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
            if (data && data.exam_time_minutes) {
                window.APP_SETTINGS = data;
                const timerPill = document.getElementById('test-timer');
                if (timerPill && !testTimerInterval) {
                    const mins = data.exam_time_minutes || 20;
                    timerPill.innerText = `${mins.toString().padStart(2, '0')}:00`;
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
        testBn.innerText = 'প্রশ্ন লোড হচ্ছে...';
        testBn.style.display = 'none';
    }
    if (optBar) optBar.style.display = 'none';

    fetch('/api/questions/random-test')
        .then(res => res.json())
        .then(data => {
            testQuestions = data;
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
            showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
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
            showToast('সময় শেষ! পরীক্ষাটি জমা হচ্ছে।');
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

    const totalCount = Math.max(30, testQuestions.length || 30);
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
    const pageImgFallback = (typeof activePageDetails !== 'undefined' && activePageDetails && activePageDetails.image) ? activePageDetails.image : '';
    let imgSrc = q ? (q.image || q.figure || q.img || q.image_url || pageImgFallback || '') : pageImgFallback;

    if (imgContainer && imgEl) {
        if (imgSrc) {
            let finalSrc = imgSrc;
            if (!finalSrc.startsWith('http') && !finalSrc.startsWith('/') && !finalSrc.startsWith('data:')) {
                finalSrc = '/' + finalSrc;
            }
            imgEl.src = finalSrc;
            imgEl.onerror = function () {
                if (pageImgFallback && !this.src.includes(pageImgFallback)) {
                    let fbSrc = (pageImgFallback.startsWith('/') || pageImgFallback.startsWith('http')) ? pageImgFallback : '/' + pageImgFallback;
                    this.src = fbSrc;
                } else {
                    this.src = '/images/signs/generic_pericolo.png';
                }
            };
            imgEl.style.display = 'block';
            imgContainer.style.display = 'flex';
        } else {
            imgEl.src = '/images/signs/generic_pericolo.png';
            imgEl.style.display = 'block';
            imgContainer.style.display = 'flex';
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
}

function selectTestAnswer(ans) {
    if (testQuestions.length === 0) return;
    testAnswers[currentTestIndex] = ans;

    const q = testQuestions[currentTestIndex];
    const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;
    const isCorrect = (ans === databaseIsVero);

    if (isSfidaMode) {
        saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong');
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
                showToast(`ভুল উত্তর! খেলা শেষ। অর্জিত পয়েন্ট: ${finalStreak}`);
                openScreen('sfida', 'Sfida');
            }, 900);
        }
        return;
    }

    if (isImmediateCorrectionActive) {
        saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong');
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

        setTimeout(() => {
            if (currentTestIndex < testQuestions.length - 1) {
                jumpToTestQuestion(currentTestIndex + 1);
            } else {
                if (practiceMode === 'sheet') {
                    finishSheetPractice();
                } else {
                    nextTestQuestion();
                }
            }
        }, 1000);

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

        setTimeout(() => {
            nextTestQuestion();
        }, 400);
    }
}

function prevTestQuestion() {
    if (currentTestIndex > 0) {
        jumpToTestQuestion(currentTestIndex - 1);
    }
}

function nextTestQuestion() {
    if (currentTestIndex < testQuestions.length - 1) {
        jumpToTestQuestion(currentTestIndex + 1);
    } else {
        if (practiceMode === 'sheet') {
            finishSheetPractice();
        } else {
            submitTestExam();
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

    alert(`প্র্যাকটিস সম্পন্ন হয়েছে!\nসঠিক উত্তর: ${correctCount}/১০\nভুল উত্তর: ${10 - correctCount}/১০`);
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
        openQuestionTranslationModal(itText, bnText, vocab);
    } else {
        showToast('অনুবাদ লোড করা সম্ভব হয়নি');
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
    showToast(`গতি নির্ধারণ করা হয়েছে: ${rate}x`);

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

// 🎤 Speaker Button (Pure TTS) - Pronunciation of displayed Italian text only
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
        showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
    }
}

// ▶️ Play Button - MP3 Voiceover Audio File (or TTS with slider progress)
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
    if (confirm("আপনি কি পরীক্ষা বাতিল করে হোম স্ক্রিনে ফিরে যেতে চান?")) {
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

    const passed = wrongAnswers <= 4;

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

    if (resultEmoji) resultEmoji.innerText = passed ? '😊' : '😢';

    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'flex';

    const examsEl = document.getElementById('stats-exams');
    if (examsEl) {
        let completedExamsCount = parseInt(examsEl.innerText) || 0;
        examsEl.innerText = completedExamsCount + 1;
    }
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

    const stats = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
    const logBatchPayload = [];

    for (let i = 0; i < totalQuestions; i++) {
        const q = testQuestions[i];
        const userAnswer = testAnswers[i];
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1' || q.correct_answer === 'vero' || q.correct_answer === '1' || q.correct_answer === 1;

        if (userAnswer === null) {
            unansweredAnswers++;
        } else if (userAnswer === databaseIsVero) {
            correctAnswers++;
            if (q && q.id) {
                if (!stats[q.id]) stats[q.id] = { correct: 0, wrong: 0, state: 'correct' };
                stats[q.id].correct = (stats[q.id].correct || 0) + 1;
                stats[q.id].state = 'correct';
                logBatchPayload.push({ question_id: q.id, is_correct: true });
            }
        } else {
            wrongAnswers++;
            if (q && q.id) {
                if (!stats[q.id]) stats[q.id] = { correct: 0, wrong: 0, state: 'wrong' };
                stats[q.id].wrong = (stats[q.id].wrong || 0) + 1;
                stats[q.id].state = 'wrong';
                logBatchPayload.push({ question_id: q.id, is_correct: false });
            }
        }
    }

    if (typeof saveUserQuestionStats === 'function') {
        saveUserQuestionStats(stats);
    }

    if (logBatchPayload.length > 0) {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch('/api/user-mcq-results/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
            body: JSON.stringify({ results: logBatchPayload })
        }).catch(err => console.error("Error logging exam results: ", err));
    }

    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('saved_test_detail_questions', JSON.stringify(testQuestions));
            sessionStorage.setItem('saved_test_detail_answers', JSON.stringify(testAnswers));
            sessionStorage.setItem('saved_test_detail_time_spent', timeSpent.toString());
        }
    } catch(e) {
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
    } catch(e) {}

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
        if (emojiEl) emojiEl.innerText = '😊';
        if (titleEl) {
            titleEl.innerText = 'Idoneo (Pass)';
            titleEl.style.color = '#4CAF50';
        }
        if (statusEl) {
            statusEl.innerHTML = 'Result: Pass <i class="fa-solid fa-check-circle" style="color: #4CAF50;"></i>';
            statusEl.style.color = '#4CAF50';
        }
    } else {
        if (emojiEl) emojiEl.innerText = '🙄';
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

        const qThumbImage = q.image || (typeof activePageDetails !== 'undefined' && activePageDetails && (activePageDetails.image || activePageDetails.img)) || (typeof cartelliActivePageMainImage !== 'undefined' ? cartelliActivePageMainImage : null);

        card.innerHTML = `
            <div style="font-size: var(--mcq-num-font-mob, 13px); font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">${i + 1}</div>

            <div class="detail-q-header-row">
                <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 0;">
                    ${qThumbImage ? `<img src="${qThumbImage}" class="detail-q-img" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qThumbImage}')" style="border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" title="Zoom Image">` : ''}
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

                    <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="background: #ecfdf5; border: 1px solid #10b981; color: #10b981;" title="Bookmark">
                        <i class="fa-regular fa-bookmark" style="font-size: 12px;"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #10b981;">শীট</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="background: #eff6ff; border: 1px solid #3b82f6; color: #3b82f6;" title="Add Note">
                        <i class="fa-regular fa-note-sticky" style="font-size: 12px;"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #3b82f6;">নোট</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="toggleGuestChat(true)" style="background: #fff8f0; border: 1.5px solid #d97706;" title="Live Chat Support">
                        <i class="fa-solid fa-user-tie" style="font-size: 12px; color: #d97706;"></i>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #d97706;">লাইভ চ্যাট</span>
                    </button>

                    <button class="test-ctrl-btn" onclick="toggleDetailTranslation(${i})" style="background: #f0fdf4; border: 1px solid #22c55e; color: #22c55e;" title="Translate">
                        <div style="border: 1.5px solid #22c55e; border-radius: 3px; padding: 0 2px; font-size: 7.5px; font-weight: 900; line-height: 1.1;">A Z</div>
                        <span style="font-size: 8px; font-weight: 800; line-height: 1; white-space: nowrap; color: #22c55e;">অনুবাদ</span>
                    </button>
                </div>
            </div>

            <div style="background: #e2e8f0; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; box-sizing: border-box; margin-bottom: 12px;">
                <button class="test-ctrl-btn" id="detail-play-btn-${i}" onclick="playDetailQuestionAudioOrSpeech(${i})" style="height: 32px; padding: 0 12px; border-radius: 16px; background: #1e293b; border: none; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" title="বাংলা অডিও শুনুন">
                    <i class="fa-solid fa-play" style="font-size: 11px;"></i>
                    <span style="font-size: 11px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>
                </button>

                <input type="range" class="test-slider" id="detail-audio-slider-${i}" min="0" max="100" value="0" style="flex: 1; min-width: 0; width: 100%; accent-color: #22c55e; margin: 0 2px;" readonly>

                <div style="position: relative; display: flex; align-items: center; flex-shrink: 0; margin-left: auto;">
                    <button onclick="toggleDetailSpeedDropdown(event, ${i})" id="detail-speed-btn-${i}" style="height: 28px; padding: 0 8px; border-radius: 14px; background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; display: flex; align-items: center; gap: 4px; cursor: pointer; flex-shrink: 0; font-size: 11px; font-weight: 800; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="অডিও স্পিড">
                        <i class="fa-solid fa-gauge-high" style="font-size: 11px; color: #4CAF50;"></i>
                        <span id="detail-speed-lbl-${i}">${getDetailQuestionSpeed(i)}x</span>
                    </button>
                    <div id="detail-speed-popover-${i}" class="detail-speed-popover-menu" style="display: none; position: absolute; bottom: 34px; right: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); padding: 4px; z-index: 100; min-width: 90px; max-height: 220px; overflow-y: auto;">
                    </div>
                </div>
            </div>

            <div style="text-align: center; font-size: 14px; font-weight: 800; display: flex; flex-direction: column; gap: 4px;">
                <div style="color: var(--text-primary);">Risposta Corretta: <span style="color: #1e293b;">${databaseIsVero ? 'V' : 'F'}</span></div>
                <div style="color: var(--text-primary);">${userAnswer === null ? '<span style="color: #f59e0b;">(TU) Non hai risposto</span>' : `(TU) Hai risposto: <span style="color: ${isCorrect ? '#4CAF50' : '#ef4444'};">${userAnswer ? 'V' : 'F'}</span>`}</div>
            </div>
        `;
        container.appendChild(card);
    }

    if (shownCount === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda in questo filtro</div>`;
    }
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
            <div onclick="selectDetailQuestionSpeed(event, ${index}, ${rate})" style="padding: 6px 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; color: ${isSelected ? '#16a34a' : '#1e293b'}; background: ${isSelected ? '#f0fdf4' : 'transparent'}; border-radius: 6px; user-select: none;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='${isSelected ? '#f0fdf4' : 'transparent'}'">
                <span style="width: 12px; font-weight: 900; color: #16a34a;">${isSelected ? '✓' : ''}</span>
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
        showToast(`স্পিড: ${rate}x`);
    }
}

window.addEventListener('click', () => {
    document.querySelectorAll('.detail-speed-popover-menu').forEach(el => el.style.display = 'none');
});

function toggleDetailTranslation(index) {
    if (!testQuestions || !testQuestions[index]) return;
    const q = testQuestions[index];
    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '');
}

// 🎤 Speaker Microphone Button - Pronunciation TTS Only
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
        showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
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
        if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';
        if (oldSlider) updateAudioSliderProgress(oldSlider, 0);
    }
    activeDetailAudioIndex = null;
}

// ▶️ Play Button - Uploaded MP3 Audio Voiceover (or TTS with slider progress)
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

        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 11px; color: #ef4444;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';

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
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';
            const slider = document.getElementById(`detail-audio-slider-${index}`);
            if (slider) updateAudioSliderProgress(slider, 0);
            return;
        }

        if (playingDetailSpeechIndex !== null) {
            const oldBtn = document.getElementById(`detail-play-btn-${playingDetailSpeechIndex}`);
            const oldSlider = document.getElementById(`detail-audio-slider-${playingDetailSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';
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
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 11px; color: #ef4444;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';

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
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';
            playingDetailSpeechIndex = null;
        };

        utterance.onerror = () => {
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            if (slider) updateAudioSliderProgress(slider, 0);
            const btn = document.getElementById(`detail-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 11px;"></i><span style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1;">বাংলা</span>';
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

function openPageDetailsScreen(pageId) {
    const container = document.getElementById('page-questions-list-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento dettagli pagina...</div>`;
    }

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

    fetch(`/api/pages/${pageId}`)
        .then(res => res.json())
        .then(page => {
            activePageDetails = page;

            const chapterName = page.chapter?.name || '';
            const chapterNum = page.chapter?.chapter_number || page.chapter?.id || page.chapter_id;
            const chapterLabel = chapterName ? `Capitolo ${chapterNum}) ${chapterName}` : `Capitolo ${chapterNum}`;
            document.getElementById('page-details-chapter-label').innerText = chapterLabel;
            const pageNum = page.sort_order || page.page_number || page.id;
            document.getElementById('page-details-page-label').innerText = `Pagina ${pageNum}) ${page.title}`;

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
                        }, 100);
                    }
                } else {
                    videoContainer.style.display = 'none';
                    videoWrapper.innerHTML = '';
                }
            }

            if (page.audio) {
                if (pageAudio) pageAudio.src = page.audio;
            } else {
                if (pageAudio) pageAudio.src = '';
            }

            const slider = document.getElementById('page-audio-slider');
            if (slider) slider.value = 0;
            const timeLbl = document.getElementById('page-audio-time-label');
            if (timeLbl) timeLbl.innerText = '0:00 / 0:00';

            Promise.all([
                fetch('/api/saved-mcqs').then(r => r.json()),
                fetch(`/api/notes?page_id=${page.id}`).then(r => r.json())
            ])
                .then(([savedList, notesList]) => {
                    const savedIds = savedList.map(s => s.question_id);
                    renderPageQuestionsList(page.questions, savedIds, notesList);
                })
                .catch(err => {
                    console.error("Error fetching bookmarks or notes: ", err);
                    renderPageQuestionsList(page.questions, [], []);
                });
        })
        .catch(err => {
            console.error("Error fetching page details: ", err);
            if (container) container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore.</div>`;
        });
}

function renderPageQuestionsList(questions, savedIds, notesList) {
    const container = document.getElementById('page-questions-list-container');
    if (!container) return;
    container.innerHTML = '';

    const userStats = getUserQuestionStats();

    questions.forEach((q, index) => {
        const isSaved = savedIds.includes(q.id);
        const userNote = notesList.find(n => n.question_id === q.id);
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

        const record = userStats[q.id];
        let correctCount = 0;
        let wrongCount = 0;
        let isAnswered = false;

        if (record && typeof record === 'object') {
            correctCount = typeof record.correct === 'number' ? record.correct : 0;
            wrongCount = typeof record.wrong === 'number' ? record.wrong : 0;
            if (correctCount > 0 || wrongCount > 0) {
                isAnswered = true;
            }
        }

        const card = document.createElement('div');
        const isCorrect = isAnswered && (record.state === 'correct' || correctCount > wrongCount);
        card.className = `detail-q-card ${!isAnswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect')}`;
        card.style.position = 'relative';

        const saveIconClass = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const saveIconColor = isSaved ? 'color: var(--accent-green);' : '';

        const statsHtml = isAnswered ? `
            <div style="flex: 1; font-size: 13px; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 10px;">
                <div style="color: var(--text-primary); font-weight: 800; font-size: 13px;">(TU) Hai risposto:</div>
                <div style="display: flex; gap: 16px; font-size: 13px; font-weight: 700;">
                    <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
                    <span style="color: #ef4444;">Sbagliato ${wrongCount} volte</span>
                </div>
            </div>
        ` : '<div style="flex: 1;"></div>';

        const qImage = q.image || q.img || (typeof activePageDetails !== 'undefined' && activePageDetails && activePageDetails.image ? activePageDetails.image : null);

        const topHeaderImageHtml = qImage ? `
            <div class="detail-q-top-image-wrap">
                <img src="${qImage}" class="detail-q-top-image" onclick="openImageZoomModal('${qImage}')" title="Zoom Image">
            </div>
        ` : '';

        const leftThumbHtml = qImage ? `
            <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                <img src="${qImage}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 6px; border: 1px solid var(--border-card); background: #fff; cursor: pointer;" onclick="openImageZoomModal('${qImage}')" title="Zoom Image">
            </div>
        ` : '';

        if (q.image || q.img) {
            const topImgCard = document.createElement('div');
            topImgCard.className = 'detail-q-top-image-card';
            topImgCard.style.cssText = 'padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; margin-top: 16px; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.03);';
            topImgCard.innerHTML = `<img src="${q.image || q.img}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${q.image || q.img}')" style="max-width: 100%; height: auto; max-height: 450px; object-fit: contain; border-radius: 8px; cursor: pointer;" title="ইমেজ দেখুন">`;
            container.appendChild(topImgCard);
        }

        card.innerHTML = `
            <div class="detail-q-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                <div class="detail-q-num" style="margin-bottom: 0; flex-shrink: 0;">${index + 1}</div>
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; justify-content: flex-end; margin-left: auto;">
                    <button class="test-ctrl-btn" onclick="toggleArgomentiQuestionAnswer(${q.id})" id="page-eye-btn-${q.id}" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Show Answer">
                        <i class="fa-regular fa-eye" id="page-eye-icon-${q.id}" style="font-size: 13px; color: var(--text-secondary);"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">দেখুন</span>
                    </button>
                    <span id="page-ans-text-${q.id}" style="display: none; font-size: 14px; font-weight: 900; color: ${databaseIsVero ? '#4CAF50' : '#ef4444'}; flex-shrink: 0;">${databaseIsVero ? 'VERO ✓' : 'FALSO ✗'}</span>
                </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px; width: 100%;">
                ${(q.image || q.img) ? `<img src="${q.image || q.img}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${q.image || q.img}')" style="width: var(--argomenti-q-img-size-desk, 110px); min-width: var(--argomenti-q-img-size-desk, 110px); max-width: 250px; height: auto; max-height: var(--argomenti-q-img-size-desk, 110px); object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" title="ইমেজ দেখুন">` : ''}
                <div style="flex: 1; min-width: 0;">
                    <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian, q.vocabulary)}</div>
                    <div class="detail-q-text-bn" id="page-q-bn-${q.id}" style="display: none; font-size: 13px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;">
                    <button class="test-ctrl-btn" id="page-play-btn-${index}" onclick="playQuestionAudioOrSpeechOnPage(${index})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Play Audio Voiceover">
                        <i class="fa-solid fa-play" style="font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
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
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">স্পিড</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="togglePageTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Translate">
                        <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Bookmark">
                        <i class="${saveIconClass}" style="${saveIconColor} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">সেভ</span>
                    </button>
                    <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 5px 8px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="Add Note">
                        <i class="fa-regular fa-note-sticky" style="${userNote ? 'color: var(--accent-green);' : ''} font-size: 13px;"></i>
                        <span style="font-size: 9px; font-weight: 800; color: ${userNote ? 'var(--accent-green)' : 'var(--text-secondary)'}; white-space: nowrap;">নোট</span>
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

// 🎤 Microphone (TTS Only) - Pronunciation of displayed question text
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

// ▶️ Play Button - MP3 Voiceover Audio File or TTS fallback
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
            showToast(`গতি নির্ধারণ করা হয়েছে: ${rate}x`);

            if (isCartelli) {
                if (playingCartelliAudioIndex !== null && cartelliNativeAudio) {
                    cartelliNativeAudio.playbackRate = rate;
                }
            }
        };

        if (rate === testAudioSpeed) {
            item.innerHTML = `<span>✓ ${rate === 1.0 ? '1.0' : rate}</span>`;
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
    popover.style.border = '1px solid var(--border-card)';
    popover.style.borderRadius = '8px';
    popover.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    popover.style.minWidth = '85px';

    const popoverHeight = popover.offsetHeight || 220;
    const popoverWidth = popover.offsetWidth || 85;

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

    openQuestionTranslationModal(q.italian, q.bangla);
}

function startPageQuiz() {
    if (!activePageDetails || !activePageDetails.questions || activePageDetails.questions.length === 0) {
        showToast('এই পৃষ্ঠায় কোনো প্রশ্ন নেই');
        return;
    }
    showTestOptionsDialog(() => {
        practiceMode = 'sheet';
        testQuestions = (activePageDetails.questions || []).map(q => ({
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
            timerPill.innerText = `PAGINA ${activePageDetails.id}`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
        }
        const timerLabel = document.querySelector('.test-timer-label');
        if (timerLabel) {
            timerLabel.innerText = 'Modalità Esercitazione';
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
        showToast('এই পৃষ্ঠার জন্য কোনো অডিও আপলোড করা নেই');
        return;
    }

    if (pageAudio.paused) {
        pageAudio.play().then(() => {
            pageAudioPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 12px; color: var(--accent-red);"></i>';
            updatePageAudioProgress();
        }).catch(err => {
            console.error("Error playing audio: ", err);
            showToast('অডিও প্লে করতে সমস্যা হয়েছে');
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
        fetch('/api/chapters')
            .then(res => res.json())
            .then(chapters => {
                chapters.forEach(ch => {
                    const item = document.createElement('div');
                    item.className = `chapter-dropdown-item ${ch.id === activePageDetails.chapter_id ? 'active' : ''}`;
                    item.onclick = () => {
                        dropdown.style.display = 'none';
                        fetch(`/api/chapters/${ch.id}/pages`)
                            .then(r => r.json())
                            .then(pages => {
                                if (pages.length > 0) {
                                    openPageDetailsScreen(pages[0].id);
                                } else {
                                    showToast('এই অধ্যায়ে কোনো পেজ পাওয়া যায়নি');
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
        fetch(`/api/chapters/${activePageDetails.chapter_id}/pages`)
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

function toggleCurrentPageSelection() {
    const btn = document.getElementById('page-details-select-toggle-btn');
    if (!btn) return;
    const isSelected = btn.classList.contains('active');
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    if (isSelected) {
        btn.classList.remove('active');
        btn.innerText = 'Select Page';
        cards.forEach(c => c.classList.remove('selected-q-card'));
        showToast('পেজ সিলেক্ট মুক্ত করা হয়েছে');
    } else {
        btn.classList.add('active');
        btn.innerText = 'Selected Page';
        cards.forEach(c => c.classList.add('selected-q-card'));
        showToast('পেজ সিলেক্ট করা হয়েছে');
    }
}

function selectAllPagesInDetails() {
    const btnAll = document.getElementById('page-details-select-all-btn');
    const btnUnselect = document.getElementById('page-details-unselect-all-btn');
    if (btnAll) btnAll.classList.add('active');
    if (btnUnselect) btnUnselect.classList.remove('active');
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('সব পেজ সিলেক্ট করা হয়েছে');
}

function unselectAllPagesInDetails() {
    const btnAll = document.getElementById('page-details-select-all-btn');
    const btnUnselect = document.getElementById('page-details-unselect-all-btn');
    if (btnAll) btnAll.classList.remove('active');
    if (btnUnselect) btnUnselect.classList.add('active');
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('সব পেজ আনসিলেক্ট করা হয়েছে');
}

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

    fetch('/api/saved-mcqs')
        .then(res => res.json())
        .then(resData => {
            const savedArr = Array.isArray(resData) ? resData : (resData.data || []);
            activeSavedMcqs = savedArr.map(item => item.question || item).filter(Boolean);
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
                if (!q) return;

                const page = q.page || null;
                const chapter = (page && page.chapter) ? page.chapter : null;

                const chapNum = chapter ? (chapter.chapter_number || chapter.id) : (q.chapter || '');
                const chapName = chapter ? (chapter.name || '') : '';
                const pageTitle = page ? (page.title || '') : '';
                const pageNum = page ? (page.sort_order || page.id) : '';

                let locationBadgeHtml = '';
                if (chapNum || pageTitle) {
                    locationBadgeHtml = `
                        <div style="font-size: 11px; font-weight: 700; color: var(--accent-green); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; background-color: rgba(76, 175, 80, 0.08); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(76, 175, 80, 0.18); width: fit-content;">
                            <i class="fa-solid fa-folder-open" style="font-size: 10px;"></i>
                            <span>${chapNum ? `Capitolo ${chapNum}` : ''}${chapName ? `: ${chapName}` : ''}${pageTitle ? ` · Pagina ${pageNum}: ${pageTitle}` : ''}</span>
                        </div>
                    `;
                }

                const qImage = q.image || q.img || (page && page.image ? page.image : null);

                const topImageCardHtml = qImage ? `
                    <div style="text-align: center; padding: 20px; margin-bottom: 12px; background: var(--bg-card, #fff); border-radius: 16px; border: 1px solid var(--border-card); box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <img src="${qImage}" style="max-height: 150px; width: auto; max-width: 100%; object-fit: contain; border-radius: 8px; cursor: pointer;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const isSelected = selectedSavedMcqIds.includes(q.id);

                const itemWrapper = document.createElement('div');
                itemWrapper.className = 'saved-mcq-item-wrapper';
                itemWrapper.style.marginBottom = '16px';
                if (topImageCardHtml) {
                    itemWrapper.innerHTML = topImageCardHtml;
                }

                const card = document.createElement('div');
                card.className = `detail-q-card unanswered ${isSelected ? 'selected-q-card' : ''}`;
                card.id = `saved-card-${q.id}`;
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
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 18px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" title="Mostra Risposta Corretta">
                                <i class="fa fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 6px; width: 100%;">
                        ${leftThumbHtml}
                        <div style="flex: 1; min-width: 0;">
                            <div class="detail-q-text-it">${typeof highlightDictionaryTerms === 'function' ? highlightDictionaryTerms(q.italian, q.vocabulary) : (q.italian || '')}</div>
                            <div class="detail-q-text-bn" id="saved-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla || ''}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; width: 100%;">
                        <button class="test-ctrl-btn" id="saved-play-btn-${q.id}" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play Audio">
                            <i class="fa-solid fa-play" style="font-size:12px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                        </button>
                        <input type="range" class="test-slider" id="saved-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; cursor: pointer;" readonly>
                        <button class="test-speaker-btn" onclick="readSavedQuestionSpeech(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Listen Pronunciation">
                            <i class="fa-solid fa-volume-high" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Remove Bookmark">
                            <i class="fa-solid fa-bookmark" style="color: var(--accent-green); font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--accent-green); white-space: nowrap;">সেভ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
            updateSavedMcqsPillStates();
            updateSavedMcqsQuizButtonVisibility();
        })
        .catch(err => {
            console.error("Error loading saved MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento delle domande salvate.</div>`;
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
}

function selectAllSavedMcqs() {
    selectedSavedMcqIds = activeSavedMcqs.map(q => q.id);
    isSavedMcqSelectMode = true;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    showToast('সব সেভড প্রশ্ন সিলেক্ট করা হয়েছে');
}

function unselectAllSavedMcqs() {
    selectedSavedMcqIds = [];
    isSavedMcqSelectMode = false;
    renderSavedMcqsSelectionUI();
    updateSavedMcqsPillStates();
    updateSavedMcqsQuizButtonVisibility();
    showToast('সব আন-সিলেক্ট করা হয়েছে');
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

    if (selectedSavedMcqIds.length === 0) {
        if (btnUnselect) btnUnselect.classList.add('active');
    } else if (activeSavedMcqs.length > 0 && selectedSavedMcqIds.length === activeSavedMcqs.length) {
        if (btnAll) btnAll.classList.add('active');
    } else if (isSavedMcqSelectMode) {
        if (btnSelect) btnSelect.classList.add('active');
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
        showToast('কোনো সেভড প্রশ্ন পাওয়া যায়নি');
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
        window.speechSynthesis.cancel();

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

    openQuestionTranslationModal(q.italian || q.question || '', q.bangla || q.bn_question || '', q.vocabulary || []);
}

function toggleSavedMcq(questionId, btnElement) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    fetch('/api/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({ question_id: questionId })
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message);
            if (data.saved) {
                btnElement.innerHTML = '<i class="fa-solid fa-bookmark" style="color: var(--accent-green);"></i>';
            } else {
                btnElement.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
            }

            const activeScreen = screenHistory[screenHistory.length - 1];
            if (activeScreen === 'saved-mcqs') {
                loadSavedMcqsScreen();
            } else if (activeScreen === 'page-details' && activePageDetails) {
                openPageDetailsScreen(activePageDetails.id);
            }
        })
        .catch(err => {
            console.error("Error toggling bookmark: ", err);
            showToast('বুকমার্ক করতে সমস্যা হয়েছে');
        });
}

// ==========================================
// User Notes Modal Dialog Operations
// ==========================================

function openNotesModal(pageId, questionId, noteId, existingText) {
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    document.getElementById('notes-form-page-id').value = pageId || '';
    document.getElementById('notes-form-question-id').value = questionId || '';
    document.getElementById('notes-form-note-id').value = noteId || '';
    document.getElementById('notes-textarea').value = existingText || '';

    if (!existingText && (questionId || pageId)) {
        const query = questionId ? `question_id=${questionId}` : `page_id=${pageId}`;
        fetch(`/api/notes?${query}`)
            .then(res => res.json())
            .then(notes => {
                if (notes && notes.length > 0) {
                    document.getElementById('notes-form-note-id').value = notes[0].id;
                    document.getElementById('notes-textarea').value = notes[0].note_text;
                    document.getElementById('notes-delete-btn').style.display = 'block';
                } else {
                    document.getElementById('notes-delete-btn').style.display = 'none';
                }
            })
            .catch(err => {
                console.error("Error loading note: ", err);
            });
    } else if (existingText) {
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
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteText.trim()) {
        showToast('অনুগ্রহ করে নোটের বিবরণ লিখুন');
        return;
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
            note_text: noteText
        })
    })
        .then(res => res.json())
        .then(data => {
            showToast('নোট সফলভাবে সংরক্ষণ করা হয়েছে');
            closeNotesModal();

            // Reload details screen if note was added to it
            if (activePageDetails) {
                openPageDetailsScreen(activePageDetails.id);
            }
        })
        .catch(err => {
            console.error("Error saving note: ", err);
            showToast('নোট সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteUserNote() {
    const noteId = document.getElementById('notes-form-note-id').value;
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!noteId) {
        closeNotesModal();
        return;
    }

    if (confirm('আপনি কি নোটটি মুছে ফেলতে চান?')) {
        fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': token
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('নোটটি মুছে ফেলা হয়েছে');
                closeNotesModal();
                if (activePageDetails) {
                    openPageDetailsScreen(activePageDetails.id);
                }
            })
            .catch(err => {
                console.error("Error deleting note: ", err);
                showToast('নোটটি মুছে ফেলতে সমস্যা হয়েছে');
            });
    }
}

function saveQuestionAnswerStat(questionId, chapterId, state) {
    if (!questionId) return;
    const qIdNum = parseInt(questionId);
    const stats = getUserQuestionStats();
    const existing = stats[qIdNum] || { correct: 0, wrong: 0 };

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

    stats[qIdNum] = {
        state: isCorrect ? 'correct' : 'wrong',
        correct: correctCount,
        wrong: wrongCount,
        chapter: chapterId || null,
        updated_at: new Date().toISOString()
    };
    saveUserQuestionStats(stats);

    // Save/log to Database via API
    fetch('/api/user-mcq-results/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
            results: [{
                question_id: qIdNum,
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
    if (container) {
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
                container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore durante il caricamento delle schede.</div>`;
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
                        alert('সময় শেষ! আপনার পরীক্ষাটি স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।');
                        submitSchedaExam();
                    }
                }, 1000);

                updateSchedaExamTimerDisplay();
                openScreen('exam-simulation', 'Exam Simulation');
                renderSchedaExamQuestion();
            })
            .catch(err => {
                console.error("Error loading exam details: ", err);
                showToast('পরীক্ষা শুরু করতে সমস্যা হয়েছে');
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
        numLabel.innerText = `প্রশ্ন ${currentExamQuestionIndex + 1}`;
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

function highlightDictionaryTerms(text, questionVocabulary) {
    if (!text) return '';
    let resultText = text;

    // 1. Highlight per-question vocabulary words (admin-added underlines)
    if (Array.isArray(questionVocabulary) && questionVocabulary.length > 0) {
        const sortedVocab = [...questionVocabulary].sort((a, b) =>
            (b.italian || '').length - (a.italian || '').length
        );
        sortedVocab.forEach(item => {
            const word = item.italian || '';
            if (!word) return;
            // Cache for modal lookup
            vocabCache[word.toLowerCase()] = item;
            const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp('(' + escapedWord + ')', 'gi');
            resultText = resultText.replace(regex, (match) => {
                return `<span class="dict-term-link" onclick="event.stopPropagation(); openVocabModal('${word.replace(/'/g, "\\'")}')">` + match + `</span>`;
            });
        });
    }

    // 2. Highlight global dictionary words from database
    const sortedTerms = [...dictionaryData].sort((a, b) => b.word.length - a.word.length);
    sortedTerms.forEach(term => {
        const escapedWord = term.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b(' + escapedWord + ')\\b', 'gi');
        resultText = resultText.replace(regex, (match) => {
            // Don't double-wrap already-highlighted spans
            return `<span class="dict-term-link" onclick="event.stopPropagation(); openDictionaryTermModal('${term.word.replace(/'/g, "\\'")}')">` + match + `</span>`;
        });
    });

    return resultText;
}

let currentDictTerm = null;
let currentDictModalLang = 'bn';
let savedDictWords = JSON.parse(localStorage.getItem('saved_dict_words') || '[]');

function updateDictSaveIconState() {
    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (!saveBtn || !currentDictTerm || !currentDictTerm.word) return;

    const saved = savedDictWords.includes(currentDictTerm.word.toLowerCase());
    if (saved) {
        saveBtn.className = 'fa-solid fa-bookmark';
        saveBtn.style.color = '#4CAF50';
    } else {
        saveBtn.className = 'fa-regular fa-bookmark';
        saveBtn.style.color = 'var(--text-primary, #1e293b)';
    }
}

function saveDictWord() {
    if (!currentDictTerm || !currentDictTerm.word) return;
    const wordKey = currentDictTerm.word.toLowerCase();
    const index = savedDictWords.indexOf(wordKey);

    if (index > -1) {
        savedDictWords.splice(index, 1);
        if (typeof showToast === 'function') showToast('শব্দটি বুকমার্ক থেকে সরানো হয়েছে');
    } else {
        savedDictWords.push(wordKey);
        if (typeof showToast === 'function') showToast('শব্দটি বুকমার্কে সংরক্ষণ করা হয়েছে');
    }

    localStorage.setItem('saved_dict_words', JSON.stringify(savedDictWords));
    updateDictSaveIconState();
}

function closeDictTermModal() {
    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function toggleDictModalLang() {
    const textBnEl = document.getElementById('dict-modal-text-bn');
    const langTextEl = document.getElementById('dict-modal-lang-text');
    if (!textBnEl) return;

    if (textBnEl.style.display === 'none') {
        textBnEl.style.display = 'block';
        if (langTextEl) langTextEl.innerText = 'Bangla';
    } else {
        textBnEl.style.display = 'none';
        if (langTextEl) langTextEl.innerText = 'Italian';
    }
}

function searchDictWord() {
    if (!currentDictTerm || !currentDictTerm.word) return;
    const word = currentDictTerm.word;
    closeDictTermModal();
    if (typeof openScreen === 'function') {
        openScreen('dizionario', 'Dizionario');
    }
    const searchInput = document.getElementById('dictionary-search');
    if (searchInput) {
        searchInput.value = word;
        if (typeof filterDictionary === 'function') filterDictionary();
    }
}

function speakDictWord() {
    if (!currentDictTerm) return;
    const wordToSpeak = currentDictTerm.word || currentDictTerm.desc_it || '';
    if ('speechSynthesis' in window && wordToSpeak) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordToSpeak);
        utterance.lang = 'it-IT';
        utterance.rate = parseFloat(localStorage.getItem('app_speech_rate') || '0.85');
        window.speechSynthesis.speak(utterance);
    }
}

function openDictionaryTermModal(wordText) {
    const item = dictionaryData.find(d => (d.word || '').toLowerCase() === (wordText || '').toLowerCase());
    if (!item) return;

    currentDictTerm = {
        word: item.word || wordText,
        desc_it: item.desc_it || item.word || wordText,
        desc_bn: item.desc_bn || item.bn || '',
        image: item.image || '',
        video: item.video || null
    };
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = (item.word || wordText).toUpperCase();

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

function closeVocabTermModal() {
    const modal = document.getElementById('vocab-term-modal');
    if (modal) modal.style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function closeTranslationPopupModal() {
    const modal = document.getElementById('translation-popup-modal');
    if (modal) modal.style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakTranslationModalText() {
    const itEl = document.getElementById('trans-modal-italian');
    if (!itEl) return;
    const textToSpeak = itEl.innerText || itEl.textContent || '';
    if ('speechSynthesis' in window && textToSpeak) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'it-IT';
        utterance.rate = parseFloat(localStorage.getItem('app_speech_rate') || '0.85');
        window.speechSynthesis.speak(utterance);
    }
}

// Open popup for per-question vocabulary words
function openVocabModal(wordText) {
    const item = vocabCache[wordText.toLowerCase()];
    if (!item) return;

    currentDictTerm = {
        word: item.italian || wordText,
        desc_it: item.italian || wordText,
        desc_bn: item.bangla || '',
        image: item.image || ''
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
        if (!confirm('আপনি কি নিশ্চিতভাবে খাতা জমা দিতে চান?')) {
            return;
        }
    }

    if (schedaExamTimerInterval) clearInterval(schedaExamTimerInterval);

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    fetch(`/api/exams/${activeExamSession.id}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({ answers: examUserAnswers })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error);
                openScreen('scheda-esame', 'Scheda Esame');
                return;
            }

            // Show result popup modal
            showSchedaExamResultModal(data.correct, data.wrong, data.unanswered, data.total);
        })
        .catch(err => {
            console.error("Error submitting exam: ", err);
            showToast('খাতা জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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

    if (resultEmoji) resultEmoji.innerText = passed ? '😊' : '😢';

    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'flex';
}

// --- 16. Client Verification & Activation Lock System ---
function checkClientActivation() {
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    let url = '/api/client/status';
    const params = new URLSearchParams();
    if (savedPhone) params.append('phone', savedPhone);
    if (savedSessionId) params.append('session_id', savedSessionId);
    if (params.toString()) url += '?' + params.toString();

    fetch(url)
        .then(res => res.json())
        .then(data => {
            currentClientVerified = data.verified;

            const wasActive = currentClientActive;
            currentClientActive = data.is_active;
            localStorage.setItem('app_client_active', data.is_active ? 'true' : 'false');

            if (data.phone) {
                currentClientPhone = data.phone;
                localStorage.setItem('app_client_phone', data.phone);
            }
            if (data.session_id) {
                currentClientSessionId = data.session_id;
                localStorage.setItem('app_client_session_id', data.session_id);
            }

            if (currentClientActive) {
                syncUserQuestionStatsFromBackend();
            }


            const lockEl = document.getElementById('app-activation-lock');

            // Set chat widget view strictly based on client verification state
            if (!currentClientVerified && !savedPhone) {
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
                    showToast('আপনার অ্যাপ্লিকেশনটি সফলভাবে সক্রিয় করা হয়েছে!');
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
        showToast('অনুগ্রহ করে সব তথ্য প্রদান করুন');
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
                    showToast('আপনার অ্যাকাউন্টটি ইতোমধ্যে সক্রিয় রয়েছে! ধন্যবাদ।');
                    closeActivationLock();
                } else {
                    showToast('তথ্য পাঠানো হয়েছে। আপনি লাইভ চ্যাট করতে পারেন।');
                }

                syncUserQuestionStatsFromBackend().then(() => {
                    if (typeof renderArgomentiList === 'function') renderArgomentiList();
                    if (typeof renderSheetsList === 'function') renderSheetsList();
                });
                checkClientActivation();
            } else {
                showToast('ভেরিফিকেশন সাবমিট করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error("Error submitting verification: ", err);
            showToast('ভেরিফিকেশন সাবমিট করতে সমস্যা হয়েছে');
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
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }

    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.style.display = 'flex';

    if (!html5QrScanner) {
        html5QrScanner = new Html5Qrcode("qr-reader");
    }

    const qrSuccessCallback = (decodedText, decodedResult) => {
        console.log(`Scan result: ${decodedText}`);

        const match = decodedText.match(/pages?\/(\d+)/) || decodedText.match(/page_details?\/(\d+)/) || decodedText.match(/^(\d+)$/);
        if (match) {
            const pageId = parseInt(match[1]);
            showToast('স্ক্যান সফল হয়েছে! কুইজ ওপেন হচ্ছে...');
            closeQrScanner();
            openPageDetailsScreen(pageId);
        } else {
            showToast('বৈধ QR কোড নয়!');
        }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrScanner.start({ facingMode: "environment" }, config, qrSuccessCallback)
        .catch(err => {
            console.error("Camera start error: ", err);
            showToast('ক্যামেরা চালু করতে ব্যর্থ হয়েছে!');
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

function openQuestionTranslationModal(itText, bnText, vocabularyList) {
    currentTranslationTextToRead = (itText || '').replace(/<[^>]*>/g, '');
    const itEl = document.getElementById('q-translation-it');
    const bnEl = document.getElementById('q-translation-bn');

    if (itEl) {
        itEl.innerHTML = typeof highlightDictionaryTerms === 'function'
            ? highlightDictionaryTerms(itText || '', vocabularyList || [])
            : (itText || '');
    }
    if (bnEl) {
        let formattedBn = (bnText || '').replace(/\n/g, '<br>');
        bnEl.innerHTML = formattedBn;
    }

    const modal = document.getElementById('q-translation-modal');
    if (modal) modal.style.display = 'flex';
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
        showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
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

function populateFilterChapters(prefix) {
    const chapSelect = document.getElementById(`${prefix}-filter-chapter`);
    if (!chapSelect) return;

    fetch('/api/chapters')
        .then(res => res.json())
        .then(chapters => {
            chapSelect.innerHTML = '<option value="">All Chapters</option>';
            chapters.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.sort_order ? `Capitolo ${c.sort_order}) ${c.name}` : (c.chapter_number ? `Capitolo ${c.chapter_number}) ${c.name}` : c.name);
                chapSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error populating chapters: ", err));
}

function onCorrectCategoryChange() {
    loadCorrectMcqsList();
}

function onCorrectChapterChange() {
    const chapId = document.getElementById('correct-filter-chapter')?.value;
    const pageSelect = document.getElementById('correct-filter-page');
    if (!pageSelect) return;

    if (!chapId) {
        pageSelect.innerHTML = '<option value="">All Pages</option>';
        loadCorrectMcqsList();
        return;
    }

    fetch(`/api/chapters/${chapId}/pages`)
        .then(res => res.json())
        .then(pages => {
            pageSelect.innerHTML = '<option value="">All Pages</option>';
            pages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `Pagina ${p.sort_order || p.page_number}) ${p.title || ''}`;
                pageSelect.appendChild(opt);
            });
            loadCorrectMcqsList();
        })
        .catch(err => {
            console.error("Error loading pages: ", err);
            loadCorrectMcqsList();
        });
}

function onWrongCategoryChange() {
    loadWrongMcqsList();
}

function onWrongChapterChange() {
    const chapId = document.getElementById('wrong-filter-chapter')?.value;
    const pageSelect = document.getElementById('wrong-filter-page');
    if (!pageSelect) return;

    if (!chapId) {
        pageSelect.innerHTML = '<option value="">All Pages</option>';
        loadWrongMcqsList();
        return;
    }

    fetch(`/api/chapters/${chapId}/pages`)
        .then(res => res.json())
        .then(pages => {
            pageSelect.innerHTML = '<option value="">All Pages</option>';
            pages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `Pagina ${p.sort_order || p.page_number}) ${p.title || ''}`;
                pageSelect.appendChild(opt);
            });
            loadWrongMcqsList();
        })
        .catch(err => {
            console.error("Error loading pages: ", err);
            loadWrongMcqsList();
        });
}

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

    if (correctIds.length === 0) {
        if (countEl) countEl.innerText = '0 Domande';
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">আপনি এখনও কোনো প্রশ্নের সঠিক উত্তর দেননি। টেস্ট/কুইজ প্র্যাকটিস করুন!</div>`;
        return;
    }

    fetch(`/api/questions/by-ids?ids=${correctIds.join(',')}`)
        .then(res => res.json())
        .then(questions => {
            let filtered = questions;
            if (selectedChapter) {
                filtered = filtered.filter(q => String(q.chapter) === String(selectedChapter) || String(q.chapter_id) === String(selectedChapter));
            }
            if (searchQuery) {
                filtered = filtered.filter(q => (q.italian && q.italian.toLowerCase().includes(searchQuery)) || (q.bangla && q.bangla.toLowerCase().includes(searchQuery)));
            }

            if (countEl) countEl.innerText = `${filtered.length} Domande`;
            if (filtered.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">কোনো সঠিক উত্তর পাওয়া যায়নি।</div>`;
                return;
            }

            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            container.innerHTML = '';
            filtered.forEach((q, index) => {
                window.cachedQuestionsMap[q.id] = q;
                const card = document.createElement('div');
                card.className = `detail-q-card correct`;
                card.style.position = 'relative';

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                const safeItalian = (q.italian || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${index + 1}</div>
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-right: 2px;">Risposta Corretta:</span>
                            <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                <i class="fa-solid ${databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> VERO
                            </span>
                            <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${!databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                <i class="fa-solid ${!databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> FALSO
                            </span>
                        </div>
                    </div>
                    <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian, q.vocabulary)}</div>
                    <div class="detail-q-text-bn" id="correct-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>

                    <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS(${q.id})" style="width: 38px; height: 38px; min-width:38px; border-width: 2px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:11px;"></i>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; max-width: 200px;" readonly>
                        ` : ''}
                        <button class="test-ctrl-btn" onclick="openCachedQuestionTranslation(${q.id})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Translate">
                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 2px; font-size: 8px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Bookmark">
                            <i class="fa-regular fa-bookmark"></i>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Add Note">
                            <i class="fa-regular fa-note-sticky"></i>
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error loading correct MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">সঠিক উত্তর লোড করতে সমস্যা হয়েছে।</div>`;
        });
}

function openCachedQuestionTranslation(qId) {
    const q = window.cachedQuestionsMap ? window.cachedQuestionsMap[qId] : null;
    if (q) {
        const itText = q.italian || q.question || '';
        const bnText = q.bangla || q.bn_question || '';
        const vocab = q.vocabulary || [];
        openQuestionTranslationModal(itText, bnText, vocab);
    } else {
        showToast('অনুবাদ লোড করা সম্ভব হয়নি');
    }
}
window.openCachedQuestionTranslation = openCachedQuestionTranslation;

window.selectedWrongMcqIds = window.selectedWrongMcqIds || new Set();
window.currentWrongQuestions = window.currentWrongQuestions || [];

function toggleWrongMcqSelection(qId, forceState) {
    if (!window.selectedWrongMcqIds) window.selectedWrongMcqIds = new Set();
    const id = parseInt(qId);
    if (typeof forceState === 'boolean') {
        if (forceState) {
            window.selectedWrongMcqIds.add(id);
        } else {
            window.selectedWrongMcqIds.delete(id);
        }
    } else {
        if (window.selectedWrongMcqIds.has(id)) {
            window.selectedWrongMcqIds.delete(id);
        } else {
            window.selectedWrongMcqIds.add(id);
        }
    }

    const checkbox = document.getElementById(`wrong-mcq-check-${id}`);
    if (checkbox) {
        checkbox.checked = window.selectedWrongMcqIds.has(id);
    }
    updateWrongMcqSelectionUI();
}
window.toggleWrongMcqSelection = toggleWrongMcqSelection;

function selectAllWrongMcqs() {
    if (!window.selectedWrongMcqIds) window.selectedWrongMcqIds = new Set();
    if (window.currentWrongQuestions && window.currentWrongQuestions.length > 0) {
        window.currentWrongQuestions.forEach(q => {
            window.selectedWrongMcqIds.add(q.id);
            const checkbox = document.getElementById(`wrong-mcq-check-${q.id}`);
            if (checkbox) checkbox.checked = true;
        });
    }
    updateWrongMcqSelectionUI();
}
window.selectAllWrongMcqs = selectAllWrongMcqs;

function unselectAllWrongMcqs() {
    if (!window.selectedWrongMcqIds) window.selectedWrongMcqIds = new Set();
    window.selectedWrongMcqIds.clear();
    if (window.currentWrongQuestions && window.currentWrongQuestions.length > 0) {
        window.currentWrongQuestions.forEach(q => {
            const checkbox = document.getElementById(`wrong-mcq-check-${q.id}`);
            if (checkbox) checkbox.checked = false;
        });
    }
    updateWrongMcqSelectionUI();
}
window.unselectAllWrongMcqs = unselectAllWrongMcqs;

function updateWrongMcqSelectionUI() {
    const count = window.selectedWrongMcqIds ? window.selectedWrongMcqIds.size : 0;
    const badge = document.getElementById('wrong-selected-count-badge');
    const quizCount = document.getElementById('wrong-quiz-btn-count');
    const quizBtn = document.getElementById('wrong-start-quiz-btn');

    if (badge) badge.innerText = `Selected: ${count}`;
    if (quizCount) quizCount.innerText = count;

    if (quizBtn) {
        if (count > 0) {
            quizBtn.style.opacity = '1';
            quizBtn.style.cursor = 'pointer';
        } else {
            quizBtn.style.opacity = '0.8';
        }
    }
}
window.updateWrongMcqSelectionUI = updateWrongMcqSelectionUI;

function startSelectedWrongMcqsQuiz() {
    if (!window.selectedWrongMcqIds || window.selectedWrongMcqIds.size === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি প্রশ্ন সিলেক্ট করুন');
        return;
    }
    const selectedQuestions = [];
    window.selectedWrongMcqIds.forEach(id => {
        const q = (window.cachedQuestionsMap && window.cachedQuestionsMap[id]) ||
            (window.currentWrongQuestions && window.currentWrongQuestions.find(item => item.id === id));
        if (q) selectedQuestions.push(q);
    });

    if (selectedQuestions.length === 0) {
        showToast('সিলেক্ট করা কোনো প্রশ্ন পাওয়া যায়নি');
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
            timerLabel.innerText = 'Modalità Esercitazione (Wrong MCQs)';
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

    const queryParams = new URLSearchParams({
        chapter_id: selectedChapter,
        page_id: selectedPage,
        date: selectedDate,
        search: searchQuery
    });

    fetch(`/api/v1/wrong-mcqs?${queryParams.toString()}`)
        .then(res => res.json())
        .then(resData => {
            let questions = resData.data || resData || [];
            if (!Array.isArray(questions)) questions = [];

            // Fallback: Check local user stats if backend array is empty (e.g. offline mode)
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
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">আপনার কোনো ভুল উত্তরের রেকর্ড নেই!</div>`;
                window.currentWrongQuestions = [];
                updateWrongMcqSelectionUI();
                return;
            }

            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            window.currentWrongQuestions = filtered;
            window.selectedWrongMcqIds = window.selectedWrongMcqIds || new Set();

            container.innerHTML = '';
            filtered.forEach((q, index) => {
                window.cachedQuestionsMap[q.id] = q;
                const isSelected = window.selectedWrongMcqIds.has(q.id);

                const row = document.createElement('div');
                row.className = 'wrong-mcq-item-row';
                row.style.display = 'flex';
                row.style.alignItems = 'stretch';
                row.style.gap = '10px';

                const checkboxCol = document.createElement('div');
                checkboxCol.style.display = 'flex';
                checkboxCol.style.alignItems = 'center';
                checkboxCol.style.justifyContent = 'center';
                checkboxCol.style.padding = '0 6px 0 2px';
                checkboxCol.style.cursor = 'pointer';
                checkboxCol.onclick = (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        toggleWrongMcqSelection(q.id);
                    }
                };

                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.id = `wrong-mcq-check-${q.id}`;
                checkboxInput.className = 'wrong-mcq-select-checkbox';
                checkboxInput.checked = isSelected;
                checkboxInput.style.width = '20px';
                checkboxInput.style.height = '20px';
                checkboxInput.style.accentColor = 'var(--accent-red)';
                checkboxInput.style.cursor = 'pointer';
                checkboxInput.onchange = (e) => toggleWrongMcqSelection(q.id, e.target.checked);

                checkboxCol.appendChild(checkboxInput);

                const card = document.createElement('div');
                card.className = `detail-q-card incorrect`;
                card.style.flex = '1';
                card.style.position = 'relative';

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                const safeItalian = (q.italian || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
                const qImage = q.image || q.img || (q.page && q.page.image ? q.page.image : null);

                const topImageCardHtml = qImage ? `
                    <div style="text-align: center; padding: 20px; margin-bottom: 12px; background: var(--bg-card, #fff); border-radius: 16px; border: 1px solid var(--border-card); box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <img src="${qImage}" style="max-height: 150px; width: auto; max-width: 100%; object-fit: contain; border-radius: 8px; cursor: pointer;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

                const itemWrapper = document.createElement('div');
                itemWrapper.className = 'wrong-mcq-item-wrapper';
                itemWrapper.style.flex = '1';
                if (topImageCardHtml) {
                    itemWrapper.innerHTML = topImageCardHtml;
                }

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div class="detail-q-num" style="margin-bottom: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">${index + 1}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div id="q-correct-badge-${q.id}" style="display: none; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-right: 2px;">Risposta Corretta:</span>
                                <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                    <i class="fa-solid ${databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> VERO
                                </span>
                                <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; ${!databaseIsVero ? 'background-color: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1.5px solid #22c55e;' : 'background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); opacity: 0.6;'}">
                                    <i class="fa-solid ${!databaseIsVero ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size: 10px;"></i> FALSO
                                </span>
                            </div>
                            <button onclick="toggleQCorrectAnswerInfo(${q.id})" style="background: none; border: none; padding: 4px 6px; cursor: pointer; color: var(--accent-blue, #3b82f6); font-size: 20px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" title="Info">
                                <i class="fa-solid fa-circle-info"></i>
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

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">Italiano</span>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play" style="font-size:12px;"></i>
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 200px;" readonly>
                        ` : ''}
                        <button class="test-ctrl-btn" onclick="openCachedQuestionTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Bookmark">
                            <i class="fa-regular fa-bookmark" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">সেভ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                        </button>
                    </div>
                `;

                row.appendChild(checkboxCol);
                row.appendChild(card);
                container.appendChild(row);
            });
            updateWrongMcqSelectionUI();
        })
        .catch(err => {
            console.error("Error loading wrong MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">ভুল উত্তর লোড করতে সমস্যা হয়েছে।</div>`;
        });
}



function toggleCurrentTestBookmark() {
    if (typeof quizData === 'undefined' || quizData.length === 0) {
        showToast('বুকমার্ক সংরক্ষণ করা হয়েছে');
        return;
    }
    const currentQ = quizData[currentQuizIndex];
    if (!currentQ || !currentQ.id) {
        showToast('বুকমার্ক সংরক্ষণ করা হয়েছে');
        return;
    }

    fetch('/api/v1/saved-mcqs/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({ question_id: currentQ.id })
    })
        .then(res => res.json())
        .then(data => {
            const icon = document.getElementById('test-bookmark-icon');
            if (data.saved) {
                if (icon) icon.className = 'fa-solid fa-bookmark';
                showToast('প্রশ্ন বুকমার্কে সংরক্ষণ করা হয়েছে');
            } else {
                if (icon) icon.className = 'fa-regular fa-bookmark';
                showToast('প্রশ্ন বুকমার্ক থেকে সরানো হয়েছে');
            }
        })
        .catch(err => {
            showToast('প্রশ্ন বুকমার্কে সংরক্ষণ করা হয়েছে');
        });
}

function openCurrentTestNoteModal() {
    if (typeof quizData === 'undefined' || quizData.length === 0) {
        openNotesModal(null, null, null, '');
        return;
    }
    const currentQ = quizData[currentQuizIndex];
    const qId = (currentQ && currentQ.id) ? currentQ.id : null;
    openNotesModal(null, qId, null, '');
}

// --- 9. Sfida (Challenge Mode) & Leaderboard Logic ---
let isSfidaMode = false;
let sfidaStreak = 0;

function startSfidaChallenge() {
    isSfidaMode = true;
    sfidaStreak = 0;
    showToast('চ্যালেঞ্জ শুরু হচ্ছে! ভুল করলেই খেলা শেষ...');

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
                showToast('কোনো প্রশ্ন পাওয়া যায়নি');
            }
        })
        .catch(() => showToast('চ্যালেঞ্জ লোড করতে সমস্যা হয়েছে'));
}

function loadLeaderboardData() {
    const highScores = localStorage.getItem('sfida_high_score') || 0;
    const highScoreEl = document.getElementById('sfida-user-high-score');
    if (highScoreEl) {
        highScoreEl.innerText = `আপনার সর্বোচ্চ স্কোর: ${highScores} পয়েন্ট`;
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
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">কোনো ডাটা পাওয়া যায়নি</div>';
        return;
    }

    const top3 = list.slice(0, 3);
    const rest = list.slice(3);

    const podiumColors = [
        { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', badge: '🥇', label: '1st' },
        { border: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)', badge: '🥈', label: '2nd' },
        { border: '#D97706', bg: 'rgba(217, 119, 6, 0.08)', badge: '🥉', label: '3rd' }
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
                    <span style="color:#4CAF50; font-weight:700;">✓ ${user.correct_count}</span>
                    <span style="color:#EF4444; font-weight:700;">✗ ${user.wrong_count}</span>
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
                            <span>মোট: <b>${user.total_attempted}</b></span>
                            <span style="color:#4CAF50;">সঠিক: <b>${user.correct_count}</b></span>
                            <span style="color:#EF4444;">ভুল: <b>${user.wrong_count}</b></span>
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
                const avatarImg = document.getElementById('profile-avatar-img');
                const examsEl = document.getElementById('stats-exams');
                const errorsEl = document.getElementById('stats-errors');

                const name = res.data.name || localStorage.getItem('user_profile_name') || '';
                const avatar = res.data.avatar || localStorage.getItem('user_profile_avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366F1&color=fff`;

                if (nameInput) nameInput.value = name;
                if (avatarImg) avatarImg.src = avatar;
                if (examsEl) examsEl.innerText = res.data.completed_exams !== undefined ? res.data.completed_exams : '0';
                if (errorsEl) errorsEl.innerText = res.data.avg_errors !== undefined ? res.data.avg_errors : '0.0';

                localStorage.setItem('user_profile_name', name);
                localStorage.setItem('user_profile_avatar', avatar);
            }
        })
        .catch(() => {
            const nameInput = document.getElementById('profile-name-input');
            const avatarImg = document.getElementById('profile-avatar-img');
            const name = localStorage.getItem('user_profile_name') || '';
            const avatar = localStorage.getItem('user_profile_avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366F1&color=fff`;

            if (nameInput) nameInput.value = name;
            if (avatarImg) avatarImg.src = avatar;
        });
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('ছবি অবশ্যই ৫ MB এর ছোট হতে হবে');
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
    const hint = document.getElementById('profile-name-hint');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        if (hint) {
            hint.innerText = '⚠️ অনুগ্রহ করে আপনার নাম লিখুন।';
            hint.style.color = '#ef4444';
        }
        showToast('আপনার নাম প্রয়োজন');
        return;
    }

    const payload = {
        name: name,
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
                    hint.innerText = '✓ ' + data.message;
                    hint.style.color = '#4CAF50';
                }
                showToast('প্রোফাইল আপডেট করা হয়েছে!');
                if (typeof loadLeaderboardData === 'function') {
                    loadLeaderboardData();
                }
            } else {
                if (hint) {
                    hint.innerText = '❌ ' + (data.message || 'আপডেট করতে সমস্যা হয়েছে।');
                    hint.style.color = '#ef4444';
                }
                showToast(data.message || 'আপডেট করতে ব্যর্থ হয়েছে');
            }
        })
        .catch(err => {
            if (hint) {
                hint.innerText = '❌ কোনো নেটওয়ার্ক সমস্যা হয়েছে।';
                hint.style.color = '#ef4444';
            }
        });
}

// --- 11. Manuale (Theory Guidebook) Logic ---
let allManualeTopics = [];

function loadManualeTopics() {
    fetch('/api/manuale')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                allManualeTopics = data.data;
                renderManualeTopics(allManualeTopics);
            }
        })
        .catch(err => {
            console.error('Error fetching manuale topics:', err);
            const container = document.getElementById('manuale-topics-container');
            if (container) {
                container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">ম্যানুয়াল লোড করতে সমস্যা হয়েছে</div>';
            }
        });
}

function renderManualeTopics(topics) {
    const container = document.getElementById('manuale-topics-container');
    if (!container) return;

    container.innerHTML = '';

    if (!topics || topics.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-secondary);">কোনো ম্যানুয়াল থিওরি পাওয়া যায়নি</div>';
        return;
    }

    topics.forEach((item, index) => {
        const chapNum = item.chapter_number || item.sort_order || (index + 1);
        const titleText = item.title || item.name || `Capitolo ${chapNum}`;
        const imgUrl = item.image_path || item.image || '';
        const contentText = item.content || 'Nessuna spiegazione teorica inserita.';

        let vocabs = item.vocabulary || [];
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
        const titleMatch = item.title && item.title.toLowerCase().includes(query);
        const contentMatch = item.content && item.content.toLowerCase().includes(query);
        const chapMatch = item.chapter_number && item.chapter_number.toString().includes(query);
        return titleMatch || contentMatch || chapMatch;
    });

    renderManualeTopics(filtered);
}






