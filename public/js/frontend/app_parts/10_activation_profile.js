// --- 16. Client Verification & Activation Lock System ---
function checkClientActivation() {
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    let url = '/api/v1/client/status';
    const params = new URLSearchParams();
    if (savedPhone) params.append('phone', savedPhone);
    if (savedSessionId) params.append('session_id', savedSessionId);
    if (params.toString()) url += '?' + params.toString();

    fetch(url)
        .then(res => res.json())
        .then(data => {
            currentClientVerified = data.verified || !!savedPhone;
            const wasActive = currentClientActive;
            currentClientActive = data.is_active;

            if (data.phone) {
                currentClientPhone = data.phone;
                localStorage.setItem('app_client_phone', data.phone);
            }
            if (data.session_id) {
                currentClientSessionId = data.session_id;
                localStorage.setItem('app_client_session_id', data.session_id);
            }

            syncUserQuestionStatsFromBackend();

            const lockEl = document.getElementById('app-activation-lock');

            if (!currentClientActive) {
                // Display appropriate view in Chat widget
                if (!currentClientVerified && !savedPhone) {
                    setChatWidgetView('verify');
                } else {
                    setChatWidgetView('normal');
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
        .then(pages => {
            pageSelect.innerHTML = '<option value="">All Pages</option>';
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
        .then(chapters => {
            chapSelect.innerHTML = '<option value="">All Chapters</option>';
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

function onCorrectCategoryChange() {
    loadCorrectMcqsList();
}

function onCorrectChapterChange() {
    populateFilterPages('correct');
    loadCorrectMcqsList();
}

function onWrongCategoryChange() {
    loadWrongMcqsList();
}

function onWrongChapterChange() {
    populateFilterPages('wrong');
    loadWrongMcqsList();
}

window.selectedCorrectMcqIds = window.selectedCorrectMcqIds || new Set();
window.currentCorrectQuestions = window.currentCorrectQuestions || [];

function toggleCorrectMcqSelection(qId, forceState) {
    if (!window.selectedCorrectMcqIds) window.selectedCorrectMcqIds = new Set();
    const id = parseInt(qId);
    if (typeof forceState === 'boolean') {
        if (forceState) {
            window.selectedCorrectMcqIds.add(id);
        } else {
            window.selectedCorrectMcqIds.delete(id);
        }
    } else {
        if (window.selectedCorrectMcqIds.has(id)) {
            window.selectedCorrectMcqIds.delete(id);
        } else {
            window.selectedCorrectMcqIds.add(id);
        }
    }

    const checkbox = document.getElementById(`correct-mcq-check-${id}`);
    if (checkbox) {
        checkbox.checked = window.selectedCorrectMcqIds.has(id);
    }
    updateCorrectMcqSelectionUI();
}
window.toggleCorrectMcqSelection = toggleCorrectMcqSelection;

function selectAllCorrectMcqs() {
    if (!window.selectedCorrectMcqIds) window.selectedCorrectMcqIds = new Set();
    if (window.currentCorrectQuestions && window.currentCorrectQuestions.length > 0) {
        window.currentCorrectQuestions.forEach(q => {
            window.selectedCorrectMcqIds.add(q.id);
            const checkbox = document.getElementById(`correct-mcq-check-${q.id}`);
            if (checkbox) checkbox.checked = true;
        });
    }
    updateCorrectMcqSelectionUI();
}
window.selectAllCorrectMcqs = selectAllCorrectMcqs;

function unselectAllCorrectMcqs() {
    if (!window.selectedCorrectMcqIds) window.selectedCorrectMcqIds = new Set();
    window.selectedCorrectMcqIds.clear();
    if (window.currentCorrectQuestions && window.currentCorrectQuestions.length > 0) {
        window.currentCorrectQuestions.forEach(q => {
            const checkbox = document.getElementById(`correct-mcq-check-${q.id}`);
            if (checkbox) checkbox.checked = false;
        });
    }
    updateCorrectMcqSelectionUI();
}
window.unselectAllCorrectMcqs = unselectAllCorrectMcqs;

function updateCorrectMcqSelectionUI() {
    const count = window.selectedCorrectMcqIds ? window.selectedCorrectMcqIds.size : 0;
    const badge = document.getElementById('correct-selected-count-badge');
    const quizCount = document.getElementById('correct-quiz-btn-count');
    const quizBtn = document.getElementById('correct-start-quiz-btn');
    const floatingBtnContainer = document.getElementById('correct-mcqs-quiz-btn-container');
    const floatingCount = document.getElementById('correct-floating-quiz-count');

    if (badge) badge.innerText = `Selected: ${count}`;
    if (quizCount) quizCount.innerText = count;
    if (floatingCount) floatingCount.innerText = count;

    if (quizBtn) {
        if (count > 0) {
            quizBtn.style.opacity = '1';
            quizBtn.style.cursor = 'pointer';
        } else {
            quizBtn.style.opacity = '0.8';
        }
    }

    if (floatingBtnContainer) {
        floatingBtnContainer.style.display = count > 0 ? 'block' : 'none';
    }
}
window.updateCorrectMcqSelectionUI = updateCorrectMcqSelectionUI;

function startSelectedCorrectMcqsQuiz() {
    if (!window.selectedCorrectMcqIds || window.selectedCorrectMcqIds.size === 0) {
        showToast('অনুগ্রহ করে অন্তত একটি প্রশ্ন সিলেক্ট করুন');
        return;
    }

    const selectedQuestions = [];
    window.selectedCorrectMcqIds.forEach(id => {
        const q = (window.cachedQuestionsMap && window.cachedQuestionsMap[id]) ||
            (window.currentCorrectQuestions && window.currentCorrectQuestions.find(item => item.id === id));
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
                card.style.position = 'relative';

                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                const safeItalian = (q.italian || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
                const isChecked = window.selectedCorrectMcqIds && window.selectedCorrectMcqIds.has(q.id);

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="correct-mcq-check-${q.id}" onchange="toggleCorrectMcqSelection(${q.id}, this.checked)" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green);">
                            <div class="detail-q-num" style="margin-bottom: 0;">Domanda #${index + 1}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
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
                    </div>
                    <div class="detail-q-text-it">${highlightDictionaryTerms(q.italian, q.vocabulary)}</div>
                    <div class="detail-q-text-bn" id="correct-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS('${safeItalian}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">উচ্চারণ</span>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play" style="font-size:12px;"></i>
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">শুনুন</span>
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
                container.appendChild(card);
            });
            updateCorrectMcqSelectionUI();
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

    const selectedChapter = document.getElementById('wrong-filter-chapter')?.value;
    const selectedPage = document.getElementById('wrong-filter-page')?.value;
    const searchQuery = document.getElementById('wrong-search-input')?.value?.toLowerCase()?.trim() || '';

    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento domande errate...</div>`;

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

    if (wrongIds.length === 0) {
        if (countEl) countEl.innerText = '0 Domande';
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">আপনার কোনো ভুল উত্তরের রেকর্ড নেই!</div>`;
        window.currentWrongQuestions = [];
        updateWrongMcqSelectionUI();
        return;
    }

    fetch(`/api/questions/by-ids?ids=${wrongIds.join(',')}`)
        .then(res => res.json())
        .then(questions => {
            let filtered = questions;
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
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">কোনো ভুল উত্তর পাওয়া যায়নি।</div>`;
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
                    <div class="detail-q-text-bn" id="wrong-q-bn-${q.id}" style="display: none; font-size: 12px; margin-top: 8px; color: var(--text-secondary); font-weight: 600;">${q.bangla}</div>

                    <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                        <button class="test-speaker-btn" onclick="speakTextTTS('${safeItalian}')" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; border-radius: 10px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Pronunciation (TTS)">
                            <i class="fa-solid fa-microphone" style="font-size:13px;"></i>
                            <span style="font-size: 9px; font-weight: 800; white-space: nowrap;">উচ্চারণ</span>
                        </button>
                        ${q.audio ? `
                            <button class="test-ctrl-btn" id="list-play-btn-${q.id}" onclick="playQuestionMp3('${q.audio}', ${q.id})" style="width: auto; height: auto; min-width: 0; padding: 6px 10px; font-size: 11px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 10px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Play MP3 Voiceover">
                                <i class="fa-solid fa-play" style="font-size:12px;"></i>
                                <span style="font-size: 9px; font-weight: 800; color: var(--text-secondary); white-space: nowrap;">শুনুন</span>
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
        container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-secondary);">কোনো ম্যানুয়াল চ্যাপ্টার পাওয়া যায়নি</div>';
        return;
    }

    topics.forEach((item, index) => {
        const chapNum = item.sort_order || item.chapter_number || (index + 1);
        const chapName = item.name || item.title || '';
        const pagesCount = item.pages_count || item.question_count || 0;

        const card = document.createElement('div');
        card.className = 'content-card';
        card.style.cssText = 'padding: 16px 20px; border-radius: 16px; margin-bottom: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-card);';
        card.onclick = () => {
            if (typeof openArgomentiSchedeScreen === 'function') {
                openArgomentiSchedeScreen(item.id);
            }
        };
        card.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <span style="background: rgba(37, 99, 235, 0.12); color: #2563EB; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 10px; white-space: nowrap;">
                        Capitolo ${chapNum}
                    </span>
                </div>
                <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); line-height: 1.4; margin-top: 4px;">${chapName}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${pagesCount} Pagine &amp; Teoria</div>
            </div>
            <i class="fa-solid fa-book-open" style="color: #2563EB; font-size: 18px; flex-shrink: 0;"></i>
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
        const chapMatch = String(item.sort_order || item.chapter_number || '').includes(query);
        return nameMatch || chapMatch;
    });

    renderManualeTopics(filtered);
}






