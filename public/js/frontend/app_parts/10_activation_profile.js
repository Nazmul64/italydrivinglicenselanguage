// --- 16. Client Verification & Activation Lock System ---
function checkClientActivation() {
    const isTabUnlocked = sessionStorage.getItem('tab_qr_unlocked') === 'true' || window.location.search.includes('qr_unlocked=1') || localStorage.getItem('app_client_active') === 'true';
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
            }

            if (data.phone) {
                currentClientPhone = data.phone;
                localStorage.setItem('app_client_phone', data.phone);
            }
            if (data.session_id) {
                currentClientSessionId = data.session_id;
                localStorage.setItem('app_client_session_id', data.session_id);
            }
            if (data.first_name) {
                localStorage.setItem('app_client_first_name', data.first_name);
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
                    showToast('আপনার অ্যাকাউন্টটি অনলাইনে সক্রিয় করা আছে। এবার QR স্ক্যান করুন।');
                } else {
                    showToast('তথ্য পাঠানো হয়েছে। আপনার লাইসেন্স কি নেওয়ার জন্য মেসেজ দিন।');
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
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.style.display = 'flex';

    if (typeof Html5Qrcode === 'undefined') {
        showToast('QR Scanner লাইব্রেরি লোড হতে পারেনি। পেজ রিফ্রেশ করুন।');
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('আপনার ব্রাউজারে ক্যামেরা অ্যাক্সেস সাপোর্ট করছে না অথবা HTTP এ ব্লক করা হয়েছে।');
    }

    if (!html5QrScanner) {
        try {
            html5QrScanner = new Html5Qrcode("qr-reader");
        } catch (e) {
            console.error("Html5Qrcode initialization error:", e);
            showToast('QR Scanner চালু করতে ব্যর্থ হয়েছে!');
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
                    showToast(resData.message || 'সফলভাবে আনলক করা হয়েছে!');
                    closeQrScanner();
                    closeActivationLock();
                    checkClientActivation();

                    const match = decodedText.match(/pages?\/(\d+)/) || decodedText.match(/page_details?\/(\d+)/);
                    if (match && typeof openPageDetailsScreen === 'function') {
                        openPageDetailsScreen(parseInt(match[1]));
                    }
                } else {
                    showToast(resData.message || 'আপনার লাইসেন্স টি এখনও অ্যাক্টিভ করা হয়নি!');
                }
            })
            .catch(err => {
                console.error("QR Unlock API error:", err);
                showToast('QR ভেরিফিকেশনে নেটওয়ার্ক সমস্যা ঘটেছে!');
            });
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
    // Determine image: main question image or fallback to vocabulary image if present
    let targetImg = imageUrl || '';
    if (!targetImg && Array.isArray(vocabularyList) && vocabularyList.length > 0) {
        const vocabWithImg = vocabularyList.find(v => v && (v.image || v.img));
        if (vocabWithImg) {
            targetImg = vocabWithImg.image || vocabWithImg.img;
        }
    }

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

function populateFilterPages(prefix) {
    const chapId = document.getElementById(`${prefix}-filter-chapter`)?.value;
    const pageSelect = document.getElementById(`${prefix}-filter-page`);
    if (!pageSelect) return;

    const url = chapId ? `/api/chapters/${chapId}/pages` : '/api/all-pages';

    fetch(url)
        .then(res => res.json())
        .then(resData => {
            const pages = Array.isArray(resData) ? resData : (resData.data || []);
            pageSelect.innerHTML = '<option value="">All Pages (সব পেইজ)</option>';
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
            chapSelect.innerHTML = '<option value="">All Chapters (সব অধ্যায়)</option>';
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
    showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
}
window.toggleCorrectMcqsSelectMode = toggleCorrectMcqsSelectMode;

function selectAllCorrectMcqs() {
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('সব প্রশ্ন সিলেক্ট করা হয়েছে');
}
window.selectAllCorrectMcqs = selectAllCorrectMcqs;

function unselectAllCorrectMcqs() {
    const selectBtn = document.getElementById('correct-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'inline-block';
    const cards = document.querySelectorAll('#correct-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('সব প্রশ্ন আনসিলেক্ট করা হয়েছে');
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
        showToast('কোনো প্রশ্ন পাওয়া যায়নি');
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
            timerLabel.innerText = 'Modalità Esercitazione (Correct MCQs)';
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
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">কোনো সঠিক উত্তর পাওয়া যায়নি।</div>`;
                return;
            }

            window.currentCorrectQuestions = filtered;
            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            container.innerHTML = '';
            filtered.forEach((q, index) => {
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
                const qImage = q.image || q.img || (q.page && q.page.image ? q.page.image : null);

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

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
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
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

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const record = userStatsMap[q.id] || {};
                const correctCount = typeof record.correct === 'number' ? record.correct : (q.correct_count || 0);
                const wrongCount = typeof record.wrong === 'number' ? record.wrong : (q.wrong_count || 0);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;';
                    statsDiv.innerHTML = `
                        <div style="color: var(--text-primary); font-weight: 800; font-size: 13px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 13px; font-weight: 700;">
                            <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
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
            container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">সঠিক উত্তর লোড করতে সমস্যা হয়েছে।</div>`;
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
        showToast('অনুবাদ লোড করা সম্ভব হয়নি');
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
    showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
}
window.toggleWrongMcqsSelectMode = toggleWrongMcqsSelectMode;

function selectAllWrongMcqs() {
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'none';
    const cards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    showToast('সব প্রশ্ন সিলেক্ট করা হয়েছে');
}
window.selectAllWrongMcqs = selectAllWrongMcqs;

function unselectAllWrongMcqs() {
    const selectBtn = document.getElementById('wrong-select-toggle-btn');
    if (selectBtn) selectBtn.style.display = 'inline-block';
    const cards = document.querySelectorAll('#wrong-mcqs-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    showToast('সব প্রশ্ন আনসিলেক্ট করা হয়েছে');
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
        showToast('কোনো প্রশ্ন পাওয়া যায়নি');
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
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">আপনার কোনো ভুল উত্তরের রেকর্ড নেই!</div>`;
                window.currentWrongQuestions = [];
                return;
            }

            window.cachedQuestionsMap = window.cachedQuestionsMap || {};
            window.currentWrongQuestions = filtered;

            container.innerHTML = '';
            filtered.forEach((q, index) => {
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
                const qImage = q.image || q.img || (q.page && q.page.image ? q.page.image : null);

                const leftThumbHtml = qImage ? `
                    <div style="flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 2px;">
                        <img src="${qImage}" style="width: auto; max-width: 120px; height: auto; max-height: 100px; min-width: 48px; min-height: 48px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-card); background: #fff; cursor: pointer; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${qImage}')" title="Zoom Image">
                    </div>
                ` : '';

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
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">বাংলা</span>
                            </button>
                            <input type="range" class="test-slider" id="list-audio-slider-${q.id}" min="0" max="100" value="0" style="flex: 1; min-width: 30px; max-width: 140px;" readonly>
                        ` : ''}
                        <button class="test-ctrl-btn" onclick="openCachedQuestionTranslation(${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Translate">
                            <div style="border: 2px solid var(--accent-green); border-radius: 4px; padding: 1px 3px; font-size: 9px; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: sans-serif;">A Z</div>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">অনুবাদ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="toggleSavedMcq(${q.id}, this)" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Bookmark">
                            <i class="fa-regular fa-bookmark" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">সেভ</span>
                        </button>
                        <button class="test-ctrl-btn" onclick="openNotesModal(null, ${q.id}, null, '')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Add Note">
                            <i class="fa-regular fa-note-sticky" style="font-size: 13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">নোট</span>
                        </button>
                    </div>
                `;

                const userStatsMap = (typeof getUserQuestionStats === 'function') ? getUserQuestionStats() : {};
                const record = userStatsMap[q.id] || {};
                const correctCount = typeof record.correct === 'number' ? record.correct : (q.correct_count || 0);
                const wrongCount = typeof record.wrong === 'number' ? record.wrong : (q.wrong_count || 1);

                if (correctCount > 0 || wrongCount > 0) {
                    const statsDiv = document.createElement('div');
                    statsDiv.style.cssText = 'margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;';
                    statsDiv.innerHTML = `
                        <div style="color: var(--text-primary); font-weight: 800; font-size: 13px;">(TU) Hai risposto:</div>
                        <div style="display: flex; gap: 16px; font-size: 13px; font-weight: 700;">
                            <span style="color: #4CAF50;">Giusto ${correctCount} volte</span>
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
    const container = document.getElementById('manuale-topics-container');
    if (container) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:8px;"></i><br>ম্যানুয়াল লোড হচ্ছে...</div>';
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
                container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--accent-red); font-weight:bold;">ম্যানুয়াল লোড করতে সমস্যা হয়েছে</div>';
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






