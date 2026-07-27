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
