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

    const currentBox = currentArgomentiChapId ? document.getElementById(`argomenti-chapter-schede-${currentArgomentiChapId}`) : null;
    const cards = currentBox ? currentBox.querySelectorAll('.scheda-item-card') : document.querySelectorAll('.scheda-item-card');
    const totalCount = cards.length;

    if (!isSchedeSelectMode && selectedSheets.length === 0) {
        if (unselectPill) unselectPill.classList.add('active');
    } else if (totalCount > 0 && selectedSheets.length >= totalCount) {
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
    showToast('সব পৃষ্ঠা আন-সিলেক্ট করা হয়েছে');
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
    showToast('সব পৃষ্ঠা সিলেক্ট করা হয়েছে');
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
        showToast('কোনো পৃষ্ঠা পাওয়া যায়নি');
        return;
    }

    showToast('কুইজ প্রশ্ন লোড হচ্ছে...');

    Promise.all(targetSheets.map(pageId =>
        fetch(`/api/questions/page/${pageId}`)
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
                showToast('সিলেক্ট করা পৃষ্ঠাসমূহে কোনো এমসিকিউ প্রশ্ন পাওয়া যায়নি');
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
            showToast('কুইজ লোড করতে সমস্যা হয়েছে');
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
    showToast('সব অধ্যায় আন-সিলেক্ট করা হয়েছে');
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
    showToast('সব অধ্যায় সিলেক্ট করা হয়েছে');
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
        showToast('কোনো অধ্যায় পাওয়া যায়নি');
        return;
    }
    showToast('কুইজ প্রশ্ন লোড হচ্ছে...');

    Promise.all(targetChapters.map(chapId =>
        fetch(`/api/questions/chapter/${chapId}`)
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
                showToast('সিলেক্ট করা অধ্যায়ের অধীনে কোনো এমসিকিউ প্রশ্ন পাওয়া যায়নি');
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
            showToast('কুইজ শুরু করতে সমস্যা হয়েছে');
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

    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento capitoli...</div>`;

    const userStats = getUserQuestionStats();

    fetch('/api/chapters')
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

                const coverImage = ch.cover_image || ch.image || `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60`;

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                            ${ch.chapter_number || ch.id}) ${ch.name}
                        </div>
                        <div class="chapter-card-img-wrapper" style="width: 100%; height: 250px; min-height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                            <img src="${coverImage}" class="chapter-card-img" alt="${ch.name}" style="height: 100%; width: 100%; max-height: 250px; max-width: 92%; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
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
        .then(([questionsData, pagesData]) => {
            const questions = Array.isArray(questionsData) ? questionsData : (questionsData && Array.isArray(questionsData.data) ? questionsData.data : []);
            const pages = Array.isArray(pagesData) ? pagesData : (pagesData && Array.isArray(pagesData.data) ? pagesData.data : []);

            activeChapterQuestions = questions;
            activeChapterPages = pages;

            fetch('/api/chapters')
                .then(r => r.json())
                .then(chData => {
                    const chaptersList = Array.isArray(chData) ? chData : (chData && Array.isArray(chData.data) ? chData.data : []);
                    const ch = chaptersList.find(c => c.id === chapterId || c.id == chapterId);
                    if (ch && labelEl) {
                        labelEl.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
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
        const safeTotal = total > 0 ? total : 1;
        const unanswered = Math.max(0, total - correct - wrong);
        const isSelected = selectedSheets.includes(page.id);

        const pageTitleText = page.title || page.bn_title || getSheetName(activeChapterId, index);
        const displaySheetTitle = pageTitleText.startsWith(`${index + 1}`) ? pageTitleText : `${index + 1}) ${pageTitleText}`;

        const card = document.createElement('div');
        card.className = `content-card scheda-item-card ${isSelected ? 'selected-sheet-card' : ''}`;
        card.setAttribute('data-page-id', page.id);
        card.setAttribute('data-chapter-id', activeChapterId);
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '10px';
        card.style.padding = '16px';
        card.onclick = () => {
            if (isSchedeSelectMode) {
                toggleSheetSelectionById(page.id);
            } else {
                openPageDetailsScreen(page.id);
            }
        };

        let pageImgHTML = '';
        if (page.image) {
            const imgSrc = (page.image.startsWith('http') || page.image.startsWith('/')) ? page.image : `/storage/${page.image}`;
            pageImgHTML = `
                <div class="page-image-frame" style="width: 100%; min-width: 100%; align-self: stretch; height: auto; display: block; margin: 10px 0; background: transparent; border-radius: 14px; padding: 0; box-shadow: none; overflow: hidden;">
                    <img src="${imgSrc}" class="schede-page-img" alt="${displaySheetTitle}" style="width: 100%; min-width: 100%; height: auto; border-radius: 14px; background: transparent; display: block; object-fit: cover;">
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="schede-page-title" style="font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                    ${displaySheetTitle}
                </span>
                <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary);"></i>
            </div>

            ${pageImgHTML}

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
    'cartelli': 'Cartelli',
    'cartelli-schede': 'Scegli Scheda',
    'cartelli-page': 'Vere e False',
    'saved-mcqs': 'Saved MCQs',
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
    if (screenHistory.length === 0) {
        openScreen('home', 'mbanglapatenteb');
        return;
    }

    const activeScreen = screenHistory[screenHistory.length - 1];

    // Special confirm cases
    if (activeScreen === 'exam-simulation') {
        if (confirm("আপনি কি পরীক্ষা বাতিল করে ফিরে যেতে চান?")) {
            if (typeof examTimerInterval !== 'undefined') clearInterval(examTimerInterval);
            screenHistory.pop();
            openScreen('scheda-esame', 'Scheda Esame');
        }
        return;
    }
    if (activeScreen === 'test') {
        submitTestExam();
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
        'correct-mcqs': 'Correct MCQs', 'wrong-mcqs': 'Wrong MCQs',
        'eclass': 'E-Class', 'sfida': 'Sfida', 'scheda-esame': 'Scheda Esame',
        'exam-simulation': 'Exam Simulation', 'dizionario': 'Dizionario',
        'cartelli': 'Cartelli', 'cartelli-schede': 'Scegli Scheda',
        'cartelli-page': 'Vere e False', 'profilo': 'Profilo',
        'manuale': 'Manuale', 'test-results-detail': 'Test Details'
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

window.openArgomentiSchedeScreen = function(chId) {
    if (typeof openChapterSheetsScreen === 'function') {
        openChapterSheetsScreen(chId);
    }
};

window.handleArgomentiChapterCardClick = function(chId) {
    chId = parseInt(chId);
    if (typeof isArgomentiSelectMode !== 'undefined' && isArgomentiSelectMode) {
        toggleChapterSelection(chId);
    } else {
        openChapterSheetsScreen(chId);
    }
};

window.handleArgomentiSchedaClick = function(chId, pageId) {
    pageId = parseInt(pageId);
    if (typeof isSchedeSelectMode !== 'undefined' && isSchedeSelectMode) {
        toggleSheetSelectionById(pageId);
    } else {
        openPageDetailsScreen(pageId);
    }
};

window.handleCartelliChapterCardClick = function(chId) {
    chId = parseInt(chId);
    if (typeof isCartelliChapterSelectMode !== 'undefined' && isCartelliChapterSelectMode) {
        if (typeof toggleCartelliChapterSelection === 'function') toggleCartelliChapterSelection(chId);
    } else {
        if (typeof openCartelliSchedeScreen === 'function') openCartelliSchedeScreen(chId);
    }
};

window.handleCartelliSchedaCardClick = function(chId, pageId) {
    pageId = parseInt(pageId);
    if (typeof isCartelliSchedeSelectMode !== 'undefined' && isCartelliSchedeSelectMode) {
        if (typeof toggleCartelliSchedaSelection === 'function') toggleCartelliSchedaSelection(pageId);
    } else {
        if (typeof openCartelliPageScreen === 'function') openCartelliPageScreen(pageId);
    }
};

