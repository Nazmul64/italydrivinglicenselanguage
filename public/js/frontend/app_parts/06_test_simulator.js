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
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
    }

    const examsEl = document.getElementById('stats-exams');
    if (examsEl) {
        let completedExamsCount = parseInt(examsEl.innerText) || 0;
        examsEl.innerText = completedExamsCount + 1;
    }
}

function closeResultModal() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';
    if (typeof openScreen === 'function') {
        openScreen('home', 'mbanglapatenteb');
    }
}

function restartCurrentQuiz() {
    const modal = document.getElementById('exam-result-modal');
    if (modal) modal.style.display = 'none';
    currentTestIndex = 0;
    testAnswers = Array(testQuestions.length).fill(null);
    if (typeof switchTestQuestionTab === 'function') switchTestQuestionTab(1);
    if (typeof showTestQuestion === 'function') showTestQuestion();
    if (typeof openScreen === 'function') openScreen('test', 'Practice Quiz');
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
    let mins = Math.floor(timeSpent / 60);
    let secs = timeSpent % 60;
    const outcomeTime = document.getElementById('detail-outcome-time');
    if (outcomeTime) outcomeTime.innerText = `Tempo: ${mins} minuti ${secs} secondi`;

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
            badgeHtml = `<span style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(76, 175, 80, 0.2);"><i class="fa-solid fa-circle-check"></i> Correct ✔</span>`;
        } else {
            badgeHtml = `<span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.2);"><i class="fa-solid fa-circle-xmark"></i> Incorrect ✘</span>`;
        }

        const qThumbImage = q.image || (typeof activePageDetails !== 'undefined' && activePageDetails && (activePageDetails.image || activePageDetails.img)) || (typeof cartelliActivePageMainImage !== 'undefined' ? cartelliActivePageMainImage : null);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${i + 1}</div>
                ${badgeHtml}
            </div>
            <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian || q.question || '', q.vocabulary)}</div>
            <div class="detail-q-text-bn" id="detail-q-bn-${i}" style="display: none;">${q.bangla || q.bn_question || ''}</div>

            <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; margin-top: 10px; margin-bottom: 8px;">
                <div style="padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; ${optionVeroStyle}">
                    <span>VERO (True)</span>
                    ${veroIcon}
                </div>
                <div style="padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; ${optionFalsoStyle}">
                    <span>FALSO (False)</span>
                    ${falsoIcon}
                </div>
            </div>

            <div class="detail-q-actions-row" style="display: flex; gap: 8px; margin-top: 12px; align-items: center; width: 100%; box-sizing: border-box;">
                ${qThumbImage ? `<img src="${qThumbImage}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qThumbImage}')" style="width: 68px; height: 68px; object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" title="ইমেজ দেখুন">` : ''}
                <button class="test-speaker-btn" onclick="readDetailQuestionSpeechTTS(${i})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Listen Pronunciation (TTS)">
                    <i class="fa-solid fa-microphone" style="font-size:14px;"></i>
                    <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">উচ্চারণ</span>
                </button>
                <button class="test-ctrl-btn" id="detail-play-btn-${i}" onclick="playDetailQuestionAudioOrSpeech(${i})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play Audio Voiceover">
                    <i class="fa-solid fa-play" style="font-size:13px;"></i>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">শুনুন</span>
                </button>
                <input type="range" class="test-slider" id="detail-audio-slider-${i}" min="0" max="100" value="0" style="flex: 1;" readonly>
                <button class="test-ctrl-btn" onclick="toggleDetailTranslation(${i})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                    <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                </button>
                <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Bookmark">
                    <i class="fa-regular fa-bookmark" style="font-size: 14px;"></i>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">সেভ</span>
                </button>
                <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                    <i class="fa-regular fa-note-sticky" style="font-size: 14px;"></i>
                    <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                </button>
            </div>

            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; display: flex; flex-direction: column; gap: 4px;">
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
        utterance.rate = testAudioSpeed;
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
    }
}

let activeDetailAudioPlayer = null;
let activeDetailAudioIndex = null;
let detailAudioInterval = null;

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
        if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (oldSlider) oldSlider.value = 0;
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

        if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

        activeDetailAudioPlayer.play().then(() => {
            detailAudioInterval = setInterval(() => {
                if (activeDetailAudioPlayer.paused || activeDetailAudioPlayer.ended) {
                    clearInterval(detailAudioInterval);
                    return;
                }
                if (slider && activeDetailAudioPlayer.duration) {
                    slider.value = (activeDetailAudioPlayer.currentTime / activeDetailAudioPlayer.duration) * 100;
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
