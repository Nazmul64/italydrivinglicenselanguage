// --- Global Simulation & Speech Variables ---
const speedOptionsList = [0.65, 0.75, 0.85, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
let testAudioSpeed = 1.0;
let isSpeechSpeaking = false;
let practiceMode = 'exam';
let activeSavedMcqs = [];

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

    if (chapterId === 1 && chapter1Sheets[sheetIndex]) {
        return chapter1Sheets[sheetIndex];
    }
    return `Scheda Practice ${sheetIndex + 1}`;
}

function unselectAllChapters() {
    selectedChapters = [];
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    showToast('সব অধ্যায় আন-সিলেক্ট করা হয়েছে');
}

function selectAllChapters() {
    selectedChapters = chaptersList.map(ch => ch.id);
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
    showToast('সব অধ্যায় সিলেক্ট করা হয়েছে');
}

function toggleChapterSelection(chapterId) {
    const idx = selectedChapters.indexOf(chapterId);
    if (idx > -1) {
        selectedChapters.splice(idx, 1);
    } else {
        selectedChapters.push(chapterId);
    }
    renderArgomentiList();
    updateCategoryQuizButtonVisibility();
}

function updateCategoryQuizButtonVisibility() {
    const btn = document.getElementById('category-quiz-btn');
    if (!btn) return;
    if (selectedChapters.length > 0) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

function startCustomChaptersQuiz() {
    if (selectedChapters.length === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি অধ্যায় সিলেক্ট করুন');
        return;
    }
    showToast('কুইজ প্রশ্ন তৈরি হচ্ছে...');

    const chaptersParam = selectedChapters.join(',');
    fetch(`/api/questions/custom-quiz?chapters=${chaptersParam}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                showTestOptionsDialog(() => {
                    practiceMode = 'exam';
                    testQuestions = data;
                    currentTestIndex = 0;
                    testAnswers = Array(testQuestions.length).fill(null);

                    const timerPill = document.getElementById('test-timer');
                    if (timerPill) {
                        timerPill.innerText = `CUSTOM QUIZ`;
                        timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
                        timerPill.style.borderColor = 'var(--accent-green)';
                        timerPill.style.color = 'var(--accent-green)';
                    }
                    const timerLabel = document.querySelector('.test-timer-label');
                    if (timerLabel) {
                        timerLabel.innerText = `${selectedChapters.length} Selected Chapters`;
                    }

                    openScreen('test', 'Custom Exam');
                    switchTestQuestionTab(1);
                    showTestQuestion();
                    startTestTimer();
                });
            } else {
                showToast('সিলেক্ট করা অধ্যায়গুলোতে কোনো প্রশ্ন পাওয়া যায়নি');
            }
        })
        .catch(err => {
            console.error("Error creating custom chapter quiz: ", err);
            showToast('কুইজ শুরু করতে সমস্যা হয়েছে');
        });
}

function unselectAllSheets() {
    selectedSheets = [];
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    showToast('সব পৃষ্ঠা আন-সিলেক্ট করা হয়েছে');
}

function selectAllSheets() {
    selectedSheets = Array.from({ length: activeChapterPages.length }, (_, i) => i);
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
    showToast('সব পৃষ্ঠা সিলেক্ট করা হয়েছে');
}

function toggleSheetSelection(sheetIndex) {
    const idx = selectedSheets.indexOf(sheetIndex);
    if (idx > -1) {
        selectedSheets.splice(idx, 1);
    } else {
        selectedSheets.push(sheetIndex);
    }
    renderSheetsList();
    updateSheetsQuizButtonVisibility();
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

function renderArgomentiList() {
    const container = document.getElementById('argomenti-list');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento capitoli...</div>`;

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

    fetch('/api/chapters')
        .then(res => res.json())
        .then(chapters => {
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
                card.onclick = () => openChapterSheetsScreen(ch.id);

                const checkboxIcon = isSelected
                    ? `<i class="fa-solid fa-circle-check" style="font-size: 22px; color: var(--accent-green); position: absolute; top: 12px; right: 12px; z-index: 5;" onclick="event.stopPropagation(); toggleChapterSelection(${ch.id})"></i>`
                    : `<i class="fa-regular fa-circle" style="font-size: 22px; color: rgba(255,255,255,0.8); position: absolute; top: 12px; right: 12px; z-index: 5; text-shadow: 0 1px 4px rgba(0,0,0,0.4);" onclick="event.stopPropagation(); toggleChapterSelection(${ch.id})"></i>`;

                const coverImage = ch.cover_image || ch.image || `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60`;

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        ${checkboxIcon}
                        <div class="chapter-card-title" style="text-align: center; font-size: 15px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px; padding-right: 24px;">
                            ${ch.chapter_number || ch.id}) ${ch.name}
                        </div>
                        <div class="chapter-card-img-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                            <img src="${coverImage}" class="chapter-card-img" alt="${ch.name}" style="max-height: 140px; max-width: 90%; width: auto; height: auto; object-fit: contain; border-radius: 8px;">
                        </div>
                        <div style="text-align: center; font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-top: auto; padding-top: 10px;">
                            Progresso
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            updateCategoryQuizButtonVisibility();
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

            selectedSheets = Array.from({ length: pages.length }, (_, idx) => idx);
            updateSheetsQuizButtonVisibility();

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

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

    activeChapterPages.forEach((page, index) => {
        const pageQuestions = activeChapterQuestions.slice(index * 10, (index + 1) * 10);
        let correct = 0;
        let wrong = 0;
        pageQuestions.forEach(q => {
            let record = userStats[q.id];
            let stState = (typeof record === 'object') ? record.state : record;
            if (stState === 'correct') correct++;
            else if (stState === 'wrong') wrong++;
        });

        const total = pageQuestions.length || 10;
        const unanswered = total - correct - wrong;
        const isSelected = selectedSheets.includes(index);

        const card = document.createElement('div');
        card.className = `content-card ${isSelected ? 'selected-sheet-card' : ''}`;
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '10px';
        card.style.padding = '16px';
        card.onclick = () => openPageDetailsScreen(page.id);

        const checkboxIcon = isSelected
            ? `<i class="fa-solid fa-circle-check" style="font-size: 18px; color: var(--accent-green); position: absolute; top: 14px; right: 14px; z-index: 5;" onclick="event.stopPropagation(); toggleSheetSelection(${index})"></i>`
            : `<i class="fa-regular fa-circle" style="font-size: 18px; color: var(--text-secondary); position: absolute; top: 14px; right: 14px; z-index: 5;" onclick="event.stopPropagation(); toggleSheetSelection(${index})"></i>`;

        card.innerHTML = `
            ${checkboxIcon}
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 13px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; padding-right: 28px;">
                    <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                    ${index + 1}) ${getSheetName(activeChapterId, index)}
                </span>
                <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary); padding-right: 20px;"></i>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: var(--text-secondary);">
                <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                <span>Totale: <strong>${total}</strong></span>
            </div>

            <div style="height: 8px; background-color: var(--border-card); border-radius: 4px; display: flex; overflow: hidden;">
                <div style="background-color: #4CAF50; width: ${(correct / total) * 100}%;"></div>
                <div style="background-color: #ef4444; width: ${(wrong / total) * 100}%;"></div>
                <div style="background-color: #f59e0b; width: ${(unanswered / total) * 100}%;"></div>
            </div>
        `;
        container.appendChild(card);
    });
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
        if (typeof practiceMode === 'undefined' || practiceMode !== 'sheet') {
            practiceMode = 'exam';
            initRandomTestQuiz();
        }
    } else if (screenId === 'argomenti') {
        renderArgomentiList();
    } else if (screenId === 'dizionario') {
        initDictionary();
    } else if (screenId === 'cartelli') {
        setSignCategory('pericolo');
    } else if (screenId === 'saved-mcqs') {
        loadSavedMcqsScreen();
    } else if (screenId === 'scheda-esame') {
        loadExamSheets();
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
        if (activeScreen === 'test' && typeof practiceMode !== 'undefined' && practiceMode === 'sheet') {
            if (confirm("আপনি কি প্র্যাকটিস বাতিল করে ফিরে যেতে চান?")) {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                if (activePageDetails) {
                    openScreen('page-details', 'Vere e False');
                } else {
                    openScreen('argomenti-schede', 'Scegli Scheda');
                }
            }
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
function playLesson(title, duration) {
    const modal = document.getElementById('video-player-modal');
    const modalTitle = document.getElementById('video-player-title');
    const modalSub = document.getElementById('video-player-sub');
    if (!modal || !modalTitle || !modalSub) return;

    modalTitle.innerText = title;
    modalSub.innerText = `${duration} • চাপুন প্লে করতে`;
    modal.style.display = 'flex';
}

function simulateVideoPlaying() {
    const playBtn = document.querySelector('.video-control-play');
    const modalSub = document.getElementById('video-player-sub');
    if (!playBtn || !modalSub) return;

    playBtn.className = 'fa-solid fa-spinner fa-spin video-control-play';
    modalSub.innerText = 'ভিডিও লোড হচ্ছে...';

    setTimeout(() => {
        playBtn.className = 'fa-solid fa-pause video-control-play';
        modalSub.innerText = 'ভিডিও প্লে হচ্ছে (সিমুলেশন)...';
        showToast('ভিডিও চলাকালীন সাউন্ড চেক করুন');
    }, 1500);
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const playBtn = document.querySelector('.video-control-play');
    if (modal) modal.style.display = 'none';
    if (playBtn) playBtn.className = 'fa-solid fa-play video-control-play';
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
    if (quizIt) quizIt.innerHTML = highlightDictionaryTerms(currentQ.italian);
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
    if (examQIt) examQIt.innerHTML = highlightDictionaryTerms(currentQ.italian);
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
    openScreen('home', 'mbanglapatenteb');
}

// --- 10. Dictionary Logic ---
const dictionaryData = [
    {
        word: "Carreggiata",
        bn: "ক্যারিজওয়ে / মূল রাস্তা",
        desc_it: "La parte della strada destinata normalmente alla circolazione dei veicoli. Non comprende le piste ciclabili e le banchine.",
        desc_bn: "\"Carreggiata\" রাস্তার অংশ যা ব্যবহার হয় গাড়ি চলার জন্য। এটা হতে পারে ওয়ান ওয়ে, টু ওয়ে বা দুইভাগে আলাদা corsia তে মানে ওখানে corsia ও থাকতে পারে।",
        image: "/images/dictionary/carreggiata.png"
    },
    {
        word: "Carreggiate",
        bn: "ক্যারিজওয়ে সমূহ / মূল রাস্তা সমূহ",
        desc_it: "Plurale di carreggiata. Le parti della strada destinate al transito dei veicoli.",
        desc_bn: "\"Carreggiate\" হলো carreggiata (মূল রাস্তা)-এর বহুবচন। রাস্তার যে অংশগুলোতে গাড়ি চলাচল করে।",
        image: "/images/dictionary/carreggiata.png"
    },
    {
        word: "Suddivisa in",
        bn: "বিভক্ত করা",
        desc_it: "Divisa o separata in più parti (es. la strada divisa in più carreggiate o corsie).",
        desc_bn: "কয়েকটি অংশে ভাগ করা বা পৃথক করা (যেমন: রাস্তাটি একাধিক মূল রাস্তা বা লেনে বিভক্ত)।",
        image: "/images/dictionary/strada.png"
    },
    {
        word: "Piste ciclabili",
        bn: "সাইকেল লেন / সাইকেল চলার পথ",
        desc_it: "Parti della strada, opportunamente delimitate, destinate alla circolazione delle biciclette.",
        desc_bn: "রাস্তার চিহ্নিত করা অংশ যা শুধুমাত্র বাইসাইকেল চলাচেলের জন্য সংরক্ষিত।",
        image: "/images/dictionary/pista_ciclabile.png"
    },
    {
        word: "Pista ciclabile",
        bn: "সাইকেল লেন",
        desc_it: "Parte della strada destinata alla circolazione delle biciclette.",
        desc_bn: "রাস্তার নির্দিষ্ট লেন যা কেবল সাইকেল চালানোর জন্য প্রস্তুত করা হয়েছে।",
        image: "/images/dictionary/pista_ciclabile.png"
    },
    {
        word: "Strada",
        bn: "রাস্তা",
        desc_it: "L'area ad uso pubblico destinata alla circolazione dei pedoni, dei veicoli e degli animali.",
        desc_bn: "রাস্তা হলো জনসাধারণের ব্যবহারের জন্য উন্মুক্ত জায়গা যা পথচারী, যানবাহন এবং পশু চলাচেলের জন্য ব্যবহৃত হয়।",
        image: "/images/dictionary/strada.png"
    },
    {
        word: "Comprendere",
        bn: "ধারণ করা / অন্তর্ভুক্ত করা",
        desc_it: "Includere o contenere al proprio interno (es. la strada può comprendere le piste ciclabili).",
        desc_bn: "নিজের ভেতরে কোনো কিছু ধারণ করা বা অন্তর্ভুক্ত করা (যেমন: রাস্তার মধ্যে বাইসাইকেল লেনও থাকতে পারে)।",
        image: "/images/dictionary/strada.png"
    },
    {
        word: "Corsia",
        bn: "লেন",
        desc_it: "Suddivisione della carreggiata destinata alla circolazione di una sola fila di veicoli.",
        desc_bn: "একটিমাত্র সারির যানবাহন চলাচলের উপযোগী রাস্তার বিভাজন।",
        image: "/images/dictionary/carreggiata.png"
    },
    {
        word: "Precedenza",
        bn: "অগ্রাধিকার",
        desc_it: "Regola che stabilisce quale veicolo ha il diritto di passare per primo in un incrocio.",
        desc_bn: "মোড়ে কোন গাড়িটি আগে যাবে তা নির্ধারণের নিয়ম।",
        image: "/images/dictionary/strada.png"
    },
    {
        word: "Sorpasso",
        bn: "ওভারটেকিং",
        desc_it: "Manovra con cui un veicolo supera un altro veicolo o ostacolo in movimento.",
        desc_bn: "একটি গাড়ি যখন আরেকটি চলন্ত গাড়ির আগে চলে যায়।",
        image: "/images/dictionary/strada.png"
    },
    {
        word: "Sosta",
        bn: "পার্কিং / দীর্ঘ বিরতি",
        desc_it: "La sospensione della marcia del veicolo prolungata nel tempo con spegnimento del motore.",
        desc_bn: "ইঞ্জিন বন্ধ করে গাড়িকে দীর্ঘদিন এক স্থানে পার্ক করে রাখা।",
        image: "/images/dictionary/strada.png"
    }
];

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

// --- 11. Traffic Signs Logic ---
let activeCartelliPages = [];
let activeCartelliQuestions = [];

function setSignCategory(category) {
    const tab = document.getElementById(`tab-${category}`);
    if (tab) {
        document.querySelectorAll('.sign-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    }

    const container = document.getElementById('signs-grid-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento segnali...</div>`;

    const chapterId = category === 'pericolo' ? 2 : (category === 'divieto' ? 3 : 4);

    Promise.all([
        fetch(`/api/questions/chapter/${chapterId}`).then(res => res.json()),
        fetch(`/api/chapters/${chapterId}/pages`).then(res => res.json())
    ])
        .then(([questions, pages]) => {
            activeCartelliPages = pages;
            activeCartelliQuestions = questions;
            renderCartelliList(category);
        })
        .catch(err => {
            console.error("Error loading cartelli signs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px; grid-column: 1 / -1;">Si è verificato un errore nel caricamento.</div>`;
        });
}

function renderCartelliList(category, searchQuery = '') {
    const container = document.getElementById('signs-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');
    const query = searchQuery.toLowerCase().trim();

    activeCartelliPages.forEach((page, index) => {
        let signImage = '';
        if (category === 'pericolo') {
            if (index === 0) signImage = '/images/signs/strada_deformata.png';
            else if (index === 3) signImage = '/images/signs/curva_pericolosa_destra.png';
            else signImage = '/images/signs/generic_pericolo.png';
        } else if (category === 'divieto') {
            if (index === 0) signImage = '/images/signs/divieto_transito.png';
            else if (index === 3) signImage = '/images/signs/divieto_sorpasso.png';
            else signImage = '/images/signs/generic_divieto.png';
        } else if (category === 'obbligo') {
            if (index === 0) signImage = '/images/signs/direzione_obbligatoria_diritto.png';
            else if (index === 1) signImage = '/images/signs/passaggio_obbligatorio_destra.png';
            else signImage = '/images/signs/generic_obbligo.png';
        }

        const displayTitle = `Figura: ${index + 1}`;
        const displayName = page.title
            .replace('Segnali di pericolo: ', '')
            .replace('Segnali di divieto: ', '')
            .replace('Segnali di obbligo: ', '');
        const displayNameCapitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        if (query && !displayTitle.toLowerCase().includes(query) && !displayNameCapitalized.toLowerCase().includes(query)) {
            return;
        }

        const pageQuestions = activeCartelliQuestions.slice(index * 10, (index + 1) * 10);
        let correct = 0;
        let wrong = 0;
        pageQuestions.forEach(q => {
            let record = userStats[q.id];
            let stState = (typeof record === 'object') ? record.state : record;
            if (stState === 'correct') correct++;
            else if (stState === 'wrong') wrong++;
        });

        const total = pageQuestions.length || 10;
        const unanswered = total - correct - wrong;

        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '10px';
        card.style.padding = '16px';
        card.onclick = () => openPageDetailsScreen(page.id);

        card.innerHTML = `
            <div style="text-align: center; font-weight: 800; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">
                ${displayTitle}
            </div>
            <div style="text-align: center; margin-bottom: 8px;">
                <img src="${signImage}" alt="${displayNameCapitalized}" style="width: 100px; height: 100px; object-fit: contain;">
            </div>
            <div style="text-align: center; font-weight: 700; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${displayNameCapitalized}
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-top: auto;">
                <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                <span>Totale: <strong>${total}</strong></span>
            </div>

            <div style="height: 8px; background-color: var(--border-card); border-radius: 4px; display: flex; overflow: hidden;">
                <div style="background-color: #4CAF50; width: ${(correct / total) * 100}%;"></div>
                <div style="background-color: #ef4444; width: ${(wrong / total) * 100}%;"></div>
                <div style="background-color: #f59e0b; width: ${(unanswered / total) * 100}%;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterCartelliSigns() {
    const input = document.getElementById('cartelli-search-input');
    if (!input) return;
    const activeTab = document.querySelector('.sign-tab.active');
    let category = 'pericolo';
    if (activeTab) {
        if (activeTab.id.includes('divieto')) category = 'divieto';
        else if (activeTab.id.includes('obbligo')) category = 'obbligo';
    }
    renderCartelliList(category, input.value);
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

function toggleGuestChat(show) {
    const widget = document.getElementById('guest-chat-widget');
    if (!widget) return;
    widget.style.display = show ? 'flex' : 'none';

    if (show) {
        checkClientActivation();
        fetchGuestChatMessages();
        if (!chatInterval) {
            chatInterval = setInterval(fetchGuestChatMessages, 3000);
        }
    } else {
        if (chatInterval) {
            clearInterval(chatInterval);
            chatInterval = null;
        }
    }
}

function fetchGuestChatMessages() {
    fetch('/api/chat/messages')
        .then(res => res.json())
        .then(messages => {
            renderGuestChatMessages(messages);
        })
        .catch(err => console.error("Error fetching chat: ", err));
}

function renderGuestChatMessages(messages) {
    const container = document.getElementById('guest-chat-messages');
    if (!container) return;
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">আপনার বার্তা লিখে চ্যাট শুরু করুন। রহমান স্যার খুব শীঘ্রই উত্তর দেবেন!</div>`;
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
                buttonHTML = `<div style="text-align: center; font-size: 13px; font-weight: 800; color: #4CAF50; border: 1.5px solid #4CAF50; border-radius: 12px; padding: 10px; margin-top: 12px; font-family: inherit;">Licenza Attivata ✓</div>`;
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
                showToast(`লাইসেন্স সফলভাবে সক্রিয় করা হয়েছে! (${days} দিন)`);
                checkClientActivation();
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

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', '');

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
    const input = document.getElementById('guest-chat-input');
    if (!input) return;
    const messageText = input.value.trim();
    if (!messageText) return;

    input.value = '';

    fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({ message: messageText })
    })
        .then(res => res.json())
        .then(msg => {
            fetchGuestChatMessages();
        })
        .catch(err => console.error("Error sending message: ", err));
}

// --- 13. Mobile Exam Simulator (TEST) AJAX Logic ---
let testQuestions = [];
let currentTestIndex = 0;
let testAnswers = Array(30).fill(null);
let testTimerSeconds = 1200;
let testTimerInterval = null;
let testTranslationActive = false;
let currentTestTab = 1;
let audioProgressInterval = null;

function initRandomTestQuiz() {
    if (testTimerInterval) {
        clearInterval(testTimerInterval);
    }
    testQuestions = [];
    currentTestIndex = 0;
    testAnswers = Array(30).fill(null);
    testTimerSeconds = 1200;
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

    const tabHeader = document.querySelector('.test-pagination-tabs');
    if (tabHeader) {
        tabHeader.style.display = (practiceMode === 'sheet') ? 'none' : 'flex';
    }

    let startNum = (tab - 1) * 10 + 1;
    let endNum = tab * 10;

    if (practiceMode === 'sheet') {
        startNum = 1;
        endNum = 10;
    }

    const container = document.getElementById('test-num-grid');
    if (!container) return;
    container.innerHTML = '';

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

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

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isSpeechSpeaking = false;

    const playBtn = document.getElementById('test-audio-play-btn');
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';

    const veroBtn = document.getElementById('test-vero-btn');
    const falsoBtn = document.getElementById('test-falso-btn');

    if (veroBtn) veroBtn.classList.remove('correct-highlight', 'wrong-highlight', 'active');
    if (falsoBtn) falsoBtn.classList.remove('correct-highlight', 'wrong-highlight', 'active');

    const q = testQuestions[currentTestIndex];
    const testIt = document.getElementById('test-question-it');
    const testBn = document.getElementById('test-question-bn');

    if (testIt) testIt.innerHTML = highlightDictionaryTerms(q.italian);
    if (testBn) {
        testBn.innerText = q.bangla;
        testBn.style.display = (testTranslationActive && !isTranslationDisabled) ? 'block' : 'none';
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
    const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
    const isCorrect = (ans === databaseIsVero);

    if (isImmediateCorrectionActive) {
        saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong');
        playAppSound(isCorrect);

        const veroBtn = document.getElementById('test-vero-btn');
        const falsoBtn = document.getElementById('test-falso-btn');

        if (ans === true && veroBtn && falsoBtn) {
            if (isCorrect) {
                veroBtn.classList.add('correct-highlight');
            } else {
                veroBtn.classList.add('wrong-highlight');
                falsoBtn.classList.add('correct-highlight');
            }
        } else if (ans === false && veroBtn && falsoBtn) {
            if (isCorrect) {
                falsoBtn.classList.add('correct-highlight');
            } else {
                falsoBtn.classList.add('wrong-highlight');
                veroBtn.classList.add('correct-highlight');
            }
        }

        switchTestQuestionTab(1);

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

// Next Question advances or prompts submit
function nextTestQuestion() {
    if (currentTestIndex < testQuestions.length - 1) {
        jumpToTestQuestion(currentTestIndex + 1);
    } else {
        if (practiceMode === 'sheet') {
            if (confirm("আপনি কি প্র্যাকটিস শেষ করে সাবমিট করতে চান?")) {
                finishSheetPractice();
            }
        } else {
            if (confirm("আপনি কি পরীক্ষা সমাপ্ত করে জমা দিতে চান?")) {
                submitTestExam();
            }
        }
    }
}

function finishSheetPractice() {
    let correctCount = 0;
    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

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
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    if (isTranslationDisabled) {
        showToast('Traduzioni disabilitate / অনুবাদ নিষ্ক্রিয় করা আছে');
        return;
    }
    testTranslationActive = !testTranslationActive;
    const testBn = document.getElementById('test-question-bn');
    if (testBn) testBn.style.display = testTranslationActive ? 'block' : 'none';
    if (testTranslationActive) {
        readItalianQuestionOutLoud();
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

function togglePlayPauseSpeech() {
    if (isSpeechSpeaking) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        isSpeechSpeaking = false;
        const playBtn = document.getElementById('test-audio-play-btn');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
        if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
        }
    } else {
        readItalianQuestionOutLoud();
    }
}

function readItalianQuestionOutLoud() {
    if (testQuestions.length === 0) return;
    const q = testQuestions[currentTestIndex];

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(q.italian);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        isSpeechSpeaking = true;
        const playBtn = document.getElementById('test-audio-play-btn');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause" style="color: var(--text-primary);"></i>';

        let slider = document.getElementById('test-audio-slider');
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / testAudioSpeed));

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
    } else {
        showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
    }
}

function changeAudioProgress(val) { }

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
        const databaseIsVero = testQuestions[i].is_vero === 1 || testQuestions[i].is_vero === true || testQuestions[i].is_vero === '1';
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

    let timeSpent = 1200 - testTimerSeconds;
    let mins = Math.floor(timeSpent / 60);
    let secs = timeSpent % 60;
    const outcomeTime = document.getElementById('detail-outcome-time');
    if (outcomeTime) outcomeTime.innerText = `Tempo: ${mins} minuti ${secs} secondi`;

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredAnswers = 0;
    const totalQuestions = testQuestions.length;

    for (let i = 0; i < totalQuestions; i++) {
        const databaseIsVero = testQuestions[i].is_vero === 1 || testQuestions[i].is_vero === true || testQuestions[i].is_vero === '1';
        if (testAnswers[i] === null) {
            unansweredAnswers++;
        } else if (testAnswers[i] === databaseIsVero) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    }

    const passed = wrongAnswers <= 4;
    const emojiEl = document.getElementById('detail-outcome-emoji');
    const titleEl = document.getElementById('detail-outcome-title');

    if (passed) {
        if (emojiEl) emojiEl.innerText = '😊';
        if (titleEl) {
            titleEl.innerText = 'Idoneo';
            titleEl.style.color = '#4CAF50';
        }
    } else {
        if (emojiEl) emojiEl.innerText = '🙄';
        if (titleEl) {
            titleEl.innerText = 'Bocciato';
            titleEl.style.color = '#ef4444';
        }
    }

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

    openScreen('test-results-detail', 'Test Details');
    filterDetailResults('all');
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
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
        const isCorrect = (userAnswer === databaseIsVero);

        if (currentDetailFilter === 'correct' && (!isCorrect || userAnswer === null)) continue;
        if (currentDetailFilter === 'incorrect' && (isCorrect || userAnswer === null)) continue;
        if (currentDetailFilter === 'unanswered' && userAnswer !== null) continue;

        shownCount++;
        const card = document.createElement('div');
        card.className = `detail-q-card ${userAnswer === null ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect')}`;

        let badgeHtml = '';
        let optionVeroStyle = `padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between; flex: 1; font-weight: bold; background-color: var(--bg-page); color: var(--text-primary);`;
        let optionFalsoStyle = `padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between; flex: 1; font-weight: bold; background-color: var(--bg-page); color: var(--text-primary);`;

        let veroIcon = '';
        let falsoIcon = '';

        // If Vero is correct
        if (databaseIsVero) {
            optionVeroStyle += ` border-color: #4CAF50 !important; color: #4CAF50;`;
            veroIcon = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>`;

            if (userAnswer === true) {
                optionVeroStyle += ` background-color: rgba(76, 175, 80, 0.08);`;
            } else if (userAnswer === false) {
                optionFalsoStyle += ` border-color: #ef4444 !important; color: #ef4444; background-color: rgba(239, 68, 68, 0.08);`;
                falsoIcon = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>`;
            }
        } else {
            // If Falso is correct
            optionFalsoStyle += ` border-color: #4CAF50 !important; color: #4CAF50;`;
            falsoIcon = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>`;

            if (userAnswer === false) {
                optionFalsoStyle += ` background-color: rgba(76, 175, 80, 0.08);`;
            } else if (userAnswer === true) {
                optionVeroStyle += ` border-color: #ef4444 !important; color: #ef4444; background-color: rgba(239, 68, 68, 0.08);`;
                veroIcon = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>`;
            }
        }

        if (userAnswer === null) {
            badgeHtml = `<span style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.2);"><i class="fa-solid fa-circle-question"></i> No Response</span>`;
        } else if (isCorrect) {
            badgeHtml = `<span style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(76, 175, 80, 0.2);"><i class="fa-solid fa-circle-check"></i> Correct ✔</span>`;
        } else {
            badgeHtml = `<span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.2);"><i class="fa-solid fa-circle-xmark"></i> Incorrect ✘</span>`;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${i + 1}</div>
                ${badgeHtml}
            </div>
            <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian)}</div>
            <div class="detail-q-text-bn" id="detail-q-bn-${i}" style="display: none;">${q.bangla}</div>

            <div style="display: flex; gap: 12px; margin-top: 14px;">
                <div style="${optionVeroStyle}">
                    <span>VERO (True)</span>
                    ${veroIcon}
                </div>
                <div style="${optionFalsoStyle}">
                    <span>FALSO (False)</span>
                    ${falsoIcon}
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center;">
                <button class="test-speaker-btn" onclick="readDetailQuestionSpeech(${i})" style="width: 38px; height: 38px; min-width:38px; border-width: 2px;">
                    <i class="fa-solid fa-volume-high" style="font-size:11px;"></i>
                </button>
                <button class="test-ctrl-btn" id="detail-play-btn-${i}" onclick="readDetailQuestionSpeech(${i})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;">
                    <i class="fa-solid fa-play"></i>
                </button>
                <input type="range" class="test-slider" id="detail-audio-slider-${i}" min="0" max="100" value="0" style="flex: 1;" readonly>
                <button class="test-ctrl-btn" onclick="toggleDetailTranslation(${i})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Translate">
                    <i class="fa-solid fa-language" style="color: var(--accent-green);"></i>
                </button>
                <button class="test-ctrl-btn" style="width:34px; height:34px; min-width:34px; font-size:12px; opacity:0.6; pointer-events:none;"><i class="fa-regular fa-bookmark"></i></button>
                <button class="test-ctrl-btn" style="width:34px; height:34px; min-width:34px; font-size:12px; opacity:0.6; pointer-events:none;"><i class="fa-regular fa-note-sticky"></i></button>
            </div>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; display: flex; flex-direction: column; gap: 4px;">
                <div style="color: var(--text-primary);">Risposta Corretta: <span style="color:#4CAF50;">${databaseIsVero ? 'V' : 'F'}</span></div>
                <div style="color: ${userAnswer === null ? '#f59e0b' : (isCorrect ? '#4CAF50' : '#ef4444')};">
                    (TU) Hai risposto: ${userAnswer === null ? 'Non hai risposto (No Response)' : (userAnswer ? 'V' : 'F')}
                </div>
            </div>
        `;
        container.appendChild(card);
    }

    if (shownCount === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda in questo filtro</div>`;
    }
}

function toggleDetailTranslation(index) {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    if (!activeExamSession || !activeExamSession.answers || !activeExamSession.answers[index]) return;
    const item = activeExamSession.answers[index];
    const q = item.question || item; // Handle if nested or direct
    if (!q) return;

    openQuestionTranslationModal(q.italian, q.bangla);
}

function readDetailQuestionSpeech(index) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        if (playingDetailSpeechIndex === index) {
            playingDetailSpeechIndex = null;
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            const pBtn = document.getElementById(`detail-play-btn-${index}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const slider = document.getElementById(`detail-audio-slider-${index}`);
            if (slider) slider.value = 0;
            return;
        }

        if (playingDetailSpeechIndex !== null) {
            const oldBtn = document.getElementById(`detail-play-btn-${playingDetailSpeechIndex}`);
            const oldSlider = document.getElementById(`detail-audio-slider-${playingDetailSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (oldSlider) oldSlider.value = 0;
        }

        playingDetailSpeechIndex = index;
        if (detailSpeechInterval) clearInterval(detailSpeechInterval);

        const q = testQuestions[index];
        const utterance = new SpeechSynthesisUtterance(q.italian);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        const pBtn = document.getElementById(`detail-play-btn-${index}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        let slider = document.getElementById(`detail-audio-slider-${index}`);
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / testAudioSpeed));

        detailSpeechInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) slider.value = prg;
            if (prg >= 100) {
                clearInterval(detailSpeechInterval);
            }
        }, 200);

        utterance.onend = () => {
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            if (slider) slider.value = 100;
            const btn = document.getElementById(`detail-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingDetailSpeechIndex = null;
        };

        utterance.onerror = () => {
            if (detailSpeechInterval) clearInterval(detailSpeechInterval);
            if (slider) slider.value = 0;
            const btn = document.getElementById(`detail-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
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

            const chapterName = page.chapter?.name || chaptersList.find(c => c.id === page.chapter_id)?.name || 'DOVERI NELL\'USO';
            const chapterNum = page.chapter?.chapter_number || page.chapter_id;
            document.getElementById('page-details-chapter-label').innerText = `Capitolo ${chapterNum}) ${chapterName}`;
            document.getElementById('page-details-page-label').innerText = `Pagina ${page.id}) ${page.title}`;

            const descEl = document.getElementById('page-details-content-text');
            if (descEl) descEl.innerText = page.content || 'Definizioni generali del traffico e delle parti della strada pubblica.';

            const mediaCont = document.getElementById('page-details-media-container');
            const imgEl = document.getElementById('page-details-image');
            if (page.image) {
                if (imgEl) imgEl.src = page.image;
                if (mediaCont) mediaCont.style.display = 'block';
            } else {
                if (mediaCont) mediaCont.style.display = 'none';
            }

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

    const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

    questions.forEach((q, index) => {
        const isSaved = savedIds.includes(q.id);
        const userNote = notesList.find(n => n.question_id === q.id);
        const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

        const record = userStats[q.id];
        let correctCount = 0;
        let wrongCount = 0;
        if (record && typeof record === 'object') {
            if (record.state === 'correct') correctCount = 1;
            else if (record.state === 'wrong') wrongCount = 1;
        }

        const card = document.createElement('div');
        const isAnswered = record !== undefined;
        const isCorrect = isAnswered && (record.state === 'correct');
        card.className = `detail-q-card ${!isAnswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect')}`;
        card.style.position = 'relative';

        const saveIconClass = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const saveIconColor = isSaved ? 'color: var(--accent-green);' : '';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${index + 1}</div>
                <span style="font-size: 14px; font-weight: 900; color: ${databaseIsVero ? '#4CAF50' : '#ef4444'};">${databaseIsVero ? 'VERO' : 'FALSO'}</span>
            </div>
            <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian)}</div>
            <div class="detail-q-text-bn" id="page-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>

            <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center;">
                <button class="test-speaker-btn" onclick="readQuestionSpeechOnPage(${index})" style="width: 38px; height: 38px; min-width:38px; border-width: 2px;">
                    <i class="fa-solid fa-volume-high" style="font-size:11px;"></i>
                </button>
                <button class="test-ctrl-btn" id="page-play-btn-${index}" onclick="readQuestionSpeechOnPage(${index})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;">
                    <i class="fa-solid fa-play"></i>
                </button>
                <input type="range" class="test-slider" id="page-audio-slider-${index}" min="0" max="100" value="0" style="flex: 1;" readonly>
                <button class="test-ctrl-btn" onclick="togglePageTranslation(${q.id})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Translate">
                    <i class="fa-solid fa-language" style="color: var(--accent-green);"></i>
                </button>
                <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Bookmark">
                    <i class="${saveIconClass}" style="${saveIconColor}"></i>
                </button>
                <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Add Note">
                    <i class="fa-regular fa-note-sticky" style="${userNote ? 'color: var(--accent-green);' : ''}"></i>
                </button>
            </div>

            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-card); font-size: 11px; font-weight: 700; color: var(--text-secondary); display: flex; justify-content: space-between;">
                <span>(TU) Hai risposto: Giusto ${correctCount} volte, Sbagliato ${wrongCount} volte</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function readQuestionSpeechOnPage(index) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        if (playingPageSpeechIndex === index) {
            playingPageSpeechIndex = null;
            if (pageSpeechInterval) clearInterval(pageSpeechInterval);
            const pBtn = document.getElementById(`page-play-btn-${index}`);
            if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const slider = document.getElementById(`page-audio-slider-${index}`);
            if (slider) slider.value = 0;
            return;
        }

        if (playingPageSpeechIndex !== null) {
            const oldBtn = document.getElementById(`page-play-btn-${playingPageSpeechIndex}`);
            const oldSlider = document.getElementById(`page-audio-slider-${playingPageSpeechIndex}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (oldSlider) oldSlider.value = 0;
        }

        playingPageSpeechIndex = index;
        if (pageSpeechInterval) clearInterval(pageSpeechInterval);

        const q = activePageDetails.questions[index];
        const utterance = new SpeechSynthesisUtterance(q.italian);
        utterance.lang = 'it-IT';
        utterance.rate = testAudioSpeed;

        const pBtn = document.getElementById(`page-play-btn-${index}`);
        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        let slider = document.getElementById(`page-audio-slider-${index}`);
        if (slider) slider.value = 0;
        let stepCount = 0;
        let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / testAudioSpeed));

        pageSpeechInterval = setInterval(() => {
            stepCount++;
            let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
            if (slider) slider.value = prg;
            if (prg >= 100) {
                clearInterval(pageSpeechInterval);
            }
        }, 200);

        utterance.onend = () => {
            if (pageSpeechInterval) clearInterval(pageSpeechInterval);
            if (slider) slider.value = 100;
            const btn = document.getElementById(`page-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingPageSpeechIndex = null;

            if (isPlayAllActive && index < activePageDetails.questions.length - 1) {
                setTimeout(() => {
                    readQuestionSpeechOnPage(index + 1);
                }, 500);
            } else if (isPlayAllActive) {
                isPlayAllActive = false;
                const playAllBtn = document.getElementById('page-play-all-btn');
                if (playAllBtn) {
                    playAllBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> <span>Play All</span>';
                    playAllBtn.style.backgroundColor = 'var(--accent-green)';
                }
            }
        };

        utterance.onerror = () => {
            if (pageSpeechInterval) clearInterval(pageSpeechInterval);
            if (slider) slider.value = 0;
            const btn = document.getElementById(`page-play-btn-${index}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playingPageSpeechIndex = null;
            isPlayAllActive = false;
        };

        window.speechSynthesis.speak(utterance);
    }
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
        testQuestions = activePageDetails.questions;
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
                    item.innerText = `Capitolo ${ch.id}) ${ch.name}`;
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
                    item.innerText = `Pagina ${p.id}) ${p.title}`;
                    dropdown.appendChild(item);
                });
            });
    }
}

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

function loadSavedMcqsScreen() {
    const container = document.getElementById('saved-mcqs-list-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande salvate...</div>`;

    fetch('/api/saved-mcqs')
        .then(res => res.json())
        .then(saved => {
            activeSavedMcqs = saved.map(item => item.question).filter(Boolean);
            container.innerHTML = '';
            document.getElementById('saved-mcqs-count').innerText = `${saved.length} Domande`;

            if (saved.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda salvata.</div>`;
                return;
            }

            saved.forEach((item, index) => {
                const q = item.question;
                if (!q) return;

                const card = document.createElement('div');
                card.className = `detail-q-card unanswered`;
                card.style.position = 'relative';

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div class="detail-q-num" style="margin-bottom: 0;">Capitolo ${q.chapter} • Domanda #${index + 1}</div>
                        <span style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(76, 175, 80, 0.2);"><i class="fa-solid fa-circle-info"></i> Risposta: ${databaseIsVero ? 'V' : 'F'}</span>
                    </div>
                    <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian)}</div>
                    <div class="detail-q-text-bn" id="saved-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>

                    <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center;">
                        <button class="test-speaker-btn" onclick="readSavedQuestionSpeech(${q.id}, '${q.italian.replace(/'/g, "\\'")}')" style="width: 38px; height: 38px; min-width:38px; border-width: 2px;">
                            <i class="fa-solid fa-volume-high" style="font-size:11px;"></i>
                        </button>
                        <button class="test-ctrl-btn" id="saved-play-btn-${q.id}" onclick="readSavedQuestionSpeech(${q.id}, '${q.italian.replace(/'/g, "\\'")}')" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <input type="range" class="test-slider" id="saved-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1;" readonly>
                        <button class="test-ctrl-btn" onclick="toggleSavedTranslation(${q.id})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green);"></i>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Remove Bookmark">
                            <i class="fa-solid fa-bookmark" style="color: var(--accent-green);"></i>
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
            console.error("Error loading saved MCQs: ", err);
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento delle domande salvate.</div>`;
        });
}

let playingSavedSpeechIndex = null;
let savedSpeechInterval = null;

function readSavedQuestionSpeech(qId, text) {
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

    openQuestionTranslationModal(q.italian, q.bangla);
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
    const stats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');
    stats[questionId] = {
        state: state,
        chapter: chapterId,
        updated_at: new Date().toISOString()
    };
    localStorage.setItem('user_question_stats', JSON.stringify(stats));
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

    if (textIt) textIt.innerHTML = highlightDictionaryTerms(q.italian);
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

    if (barGiusto) barGiusto.style.width = `${(correct / total) * 100}%`;
    if (barSbagliato) barSbagliato.style.width = `${(wrong / total) * 100}%`;
    if (barNondate) barNondate.style.width = `${(unanswered / total) * 100}%`;

    if (resultEmoji) resultEmoji.innerText = passed ? '😊' : '😢';

    // Hook modal close to return to scheda esame list screen instead of default homepage
    const closeBtn = document.querySelector('#exam-result-modal .modal-card button, #exam-result-modal .close-btn');

    const modal = document.getElementById('exam-result-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Intercept close click
        const origOnclick = modal.onclick;

        // Find close buttons inside the modal and hook them
        const btns = modal.querySelectorAll('button');
        btns.forEach(btn => {
            if (btn.innerText.includes('Review') || btn.innerText.includes('Conferma') || btn.innerText.includes('Close') || btn.innerText.includes('বন্ধ করুন')) {
                btn.onclick = (e) => {
                    modal.style.display = 'none';
                    loadExamSheets();
                    openScreen('scheda-esame', 'Scheda Esame');
                };
            }
        });
    }
}

function openCompletedExamDetails(examId) {
    fetch(`/api/exams/${examId}`)
        .then(res => res.json())
        .then(exam => {
            // Load this specific exam questions list into standard practice variables
            testQuestions = exam.answers;
            testAnswers = exam.answers.map(q => q.user_answer);

            // Set testTimerSeconds so the spent time is calculated correctly (mocked or static)
            testTimerSeconds = 1200; // static full time remaining display

            // Open standard review details screen!
            openTestDetailsView();
        })
        .catch(err => {
            console.error("Error opening completed exam details: ", err);
            showToast('পরীক্ষার ফলাফল লোড করতে সমস্যা হয়েছে');
        });
}

// ==========================================
// Interactive Dictionary Highlight & Modal Helpers
// ==========================================
let currentDictTerm = null;
let currentDictModalLang = 'bn';

function highlightDictionaryTerms(text) {
    if (!text) return '';
    const sortedTerms = [...dictionaryData].sort((a, b) => b.word.length - a.word.length);
    let resultText = text;
    sortedTerms.forEach(term => {
        const escapedWord = term.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b(' + escapedWord + ')\\b', 'gi');
        resultText = resultText.replace(regex, (match) => {
            return `<span class="dict-term-link" onclick="event.stopPropagation(); openDictionaryTermModal('${term.word.replace(/'/g, "\\'")}')">${match}</span>`;
        });
    });
    return resultText;
}

function openDictionaryTermModal(wordText) {
    if (!currentClientActive) {
        const lockEl = document.getElementById('app-activation-lock');
        if (lockEl) lockEl.style.display = 'flex';
        return;
    }
    const term = dictionaryData.find(item => item.word.toLowerCase() === wordText.toLowerCase());
    if (!term) return;

    currentDictTerm = term;
    currentDictModalLang = 'bn';

    const titleEl = document.getElementById('dict-modal-title');
    if (titleEl) titleEl.innerText = term.word;

    const imgEl = document.getElementById('dict-modal-image');
    if (imgEl) imgEl.src = term.image;

    updateDictModalText();
    updateDictSaveIconState();

    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'flex';
}

function closeDictTermModal() {
    const modal = document.getElementById('dict-term-modal');
    if (modal) modal.style.display = 'none';
}

function updateDictModalText() {
    if (!currentDictTerm) return;

    const textItEl = document.getElementById('dict-modal-text-it');
    const textBnEl = document.getElementById('dict-modal-text-bn');

    if (textItEl) textItEl.innerText = currentDictTerm.desc_it;

    if (textBnEl) {
        if (currentDictModalLang === 'bn') {
            textBnEl.innerText = currentDictTerm.desc_bn;
            textBnEl.style.display = 'block';
        } else {
            textBnEl.style.display = 'none';
        }
    }

    const circle = document.getElementById('dict-modal-lang-circle');
    const text = document.getElementById('dict-modal-lang-text');

    if (circle && text) {
        if (currentDictModalLang === 'bn') {
            circle.style.backgroundColor = '#4CAF50';
            text.innerText = 'Bangla';
        } else {
            circle.style.backgroundColor = '#EF4444';
            text.innerText = 'Italian';
        }
    }
}

function toggleDictModalLang() {
    currentDictModalLang = currentDictModalLang === 'bn' ? 'it' : 'bn';
    updateDictModalText();
}

function updateDictSaveIconState() {
    const saveBtn = document.getElementById('dict-modal-save-btn');
    if (!saveBtn || !currentDictTerm) return;

    const savedWords = JSON.parse(localStorage.getItem('saved_dict_words') || '[]');
    const isSaved = savedWords.includes(currentDictTerm.word);

    if (isSaved) {
        saveBtn.className = 'fa-solid fa-bookmark';
        saveBtn.style.color = 'var(--accent-green)';
    } else {
        saveBtn.className = 'fa-regular fa-bookmark';
        saveBtn.style.color = 'var(--text-secondary)';
    }
}

function saveDictWord() {
    if (!currentDictTerm) return;

    let savedWords = JSON.parse(localStorage.getItem('saved_dict_words') || '[]');
    const index = savedWords.indexOf(currentDictTerm.word);

    if (index > -1) {
        savedWords.splice(index, 1);
        showToast('শব্দটি বুকমার্ক থেকে মুছে ফেলা হয়েছে');
    } else {
        savedWords.push(currentDictTerm.word);
        showToast('শব্দটি সফলভাবে বুকমার্ক করা হয়েছে');
    }

    localStorage.setItem('saved_dict_words', JSON.stringify(savedWords));
    updateDictSaveIconState();
}

function searchDictWord() {
    if (!currentDictTerm) return;

    closeDictTermModal();
    openScreen('dizionario', 'Dizionario');

    const searchInput = document.getElementById('dictionary-search');
    if (searchInput) {
        searchInput.value = currentDictTerm.word;
        filterDictionary();
    }
}

function speakDictWord() {
    if (!currentDictTerm || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentDictTerm.word);
    utterance.lang = 'it-IT';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// --- 16. Client Verification & Activation Lock System ---
let activationStatusInterval = null;
let currentClientVerified = false;
let currentClientActive = false;

function checkClientActivation() {
    fetch('/api/client/status')
        .then(res => res.json())
        .then(data => {
            currentClientVerified = data.verified;
            const wasActive = currentClientActive;
            currentClientActive = data.is_active;

            const lockEl = document.getElementById('app-activation-lock');

            if (!currentClientActive) {
                // Display appropriate view in Chat widget
                if (!currentClientVerified) {
                    setChatWidgetView('verify');
                } else {
                    setChatWidgetView('waiting');
                }

                // Start polling if not already started
                if (!activationStatusInterval) {
                    activationStatusInterval = setInterval(checkClientActivation, 5000);
                }
            } else {
                // Unlock app!
                if (lockEl) lockEl.style.display = 'none';

                // Normal chat view
                setChatWidgetView('normal');

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

    fetch('/api/client/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone: phone
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('তথ্য পাঠানো হয়েছে। অ্যাক্টিভেশনের জন্য অপেক্ষা করুন।');
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

    // Initialize scanner
    if (!html5QrScanner) {
        html5QrScanner = new Html5Qrcode("qr-reader");
    }

    const qrSuccessCallback = (decodedText, decodedResult) => {
        console.log(`Scan result: ${decodedText}`);

        // Try to extract page ID
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

    // Reset toggle to false (translations active) on start
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

function openQuestionTranslationModal(itText, bnText) {
    currentTranslationTextToRead = itText;
    const itEl = document.getElementById('q-translation-it');
    const bnEl = document.getElementById('q-translation-bn');

    if (itEl) itEl.innerText = itText;
    if (bnEl) bnEl.innerText = bnText;

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





