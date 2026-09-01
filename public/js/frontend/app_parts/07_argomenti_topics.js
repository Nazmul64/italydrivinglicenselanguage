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

    // Save state for F5 reload restore
    try { sessionStorage.setItem('activePageDetailsId', pageId); } catch(e) {}

    fetch(`/api/pages/${pageId}`)
        .then(res => res.json())
        .then(resData => {
            const page = (resData && resData.data) ? resData.data : resData;
            activePageDetails = page;

            if (!page || !page.id) {
                if (container) container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Pagina non trovata.</div>`;
                return;
            }

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
                    const savedArr = Array.isArray(savedList) ? savedList : (savedList && Array.isArray(savedList.data) ? savedList.data : []);
                    const savedIds = savedArr.map(s => s.question_id || s.id);
                    const notesArr = Array.isArray(notesList) ? notesList : (notesList && Array.isArray(notesList.data) ? notesList.data : []);
                    renderPageQuestionsList(page.questions, savedIds, notesArr);
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
        card.id = `argomenti-q-card-${q.id}`;
        card.setAttribute('data-qid', q.id);
        card.setAttribute('data-qtype', 'argomenti');
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.test-ctrl-btn') || e.target.closest('.test-speaker-btn') || e.target.closest('.dict-term') || e.target.closest('img')) {
                return;
            }
            if (typeof isArgomentiSelectionMode !== 'undefined' && !isArgomentiSelectionMode) {
                return; // Selection mode is inactive. Do not select on card click.
            }
            card.classList.toggle('selected-q-card');
            if (typeof updateArgomentiSelectionPills === 'function') {
                updateArgomentiSelectionPills();
            }
        };

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

        let effectiveImg = q.image || q.img || '';
        if (!effectiveImg && Array.isArray(q.vocabulary) && q.vocabulary.length > 0) {
            const vImg = q.vocabulary.find(v => v && (v.image || v.img));
            if (vImg) effectiveImg = vImg.image || vImg.img;
        }

        const hasImage = !!effectiveImg;
        const imgPos = q.image_position || 'left';
        const showTopImg = hasImage && (imgPos === 'top' || imgPos === 'both');
        const showLeftImg = hasImage && (imgPos === 'left' || imgPos === 'both');

        if (showTopImg) {
            const topImgCard = document.createElement('div');
            topImgCard.className = 'detail-q-top-image-card';
            topImgCard.style.cssText = 'padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; margin-top: 16px; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.03);';
            topImgCard.innerHTML = `<img src="${effectiveImg}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${effectiveImg}')" style="max-width: 100%; height: auto; max-height: 450px; object-fit: contain; border-radius: 8px; cursor: pointer;" title="ইমেজ দেখুন">`;
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
                ${showLeftImg ? `<img src="${effectiveImg}" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal('${effectiveImg}')" style="width: var(--argomenti-q-img-size-desk, 110px); min-width: var(--argomenti-q-img-size-desk, 110px); max-width: 250px; height: auto; max-height: var(--argomenti-q-img-size-desk, 110px); object-fit: contain; border-radius: 10px; border: 1.5px solid var(--border-card); cursor: pointer; flex-shrink: 0; background: #fff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" title="ইমেজ দেখুন">` : ''}
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
        card.setAttribute('data-q-img', q.image || q.img || '');
        container.appendChild(card);
    });
}

function toggleArgomentiQuestionAnswer(qId) {
    const textEl = document.getElementById(`page-ans-text-${qId}`);
    const iconEl = document.getElementById(`page-eye-icon-${qId}`);
    const btnEl = document.getElementById(`page-eye-btn-${qId}`);
    if (!textEl || !iconEl) return;

    if (textEl.style.display === 'none') {
        textEl.style.display = 'inline';
        iconEl.className = 'fa-regular fa-eye-slash';
        iconEl.style.color = 'var(--accent-green)';
        // Update label text inside the button
        const labelEl = btnEl ? btnEl.querySelector('span') : null;
        if (labelEl) { labelEl.innerText = 'লুকান'; labelEl.style.color = 'var(--accent-green)'; }
    } else {
        textEl.style.display = 'none';
        iconEl.className = 'fa-regular fa-eye';
        iconEl.style.color = 'var(--text-secondary)';
        const labelEl = btnEl ? btnEl.querySelector('span') : null;
        if (labelEl) { labelEl.innerText = 'প্রশ্ন দেখুন'; labelEl.style.color = 'var(--text-secondary)'; }
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

    openQuestionTranslationModal(q.italian, q.bangla, q.vocabulary || [], q.image || q.img || '');
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
    showToast('সিলেক্ট মোড চালু হয়েছে। যেকোনো প্রশ্নে ক্লিক করে সিলেক্ট করুন');
}

function selectAllPagesInDetails() {
    window.isArgomentiSelectionMode = true;
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.add('selected-q-card'));
    updateArgomentiSelectionPills();
    showToast('সব প্রশ্ন সিলেক্ট করা হয়েছে');
}

function unselectAllPagesInDetails() {
    window.isArgomentiSelectionMode = false;
    const cards = document.querySelectorAll('#page-questions-list-container .detail-q-card');
    cards.forEach(c => c.classList.remove('selected-q-card'));
    updateArgomentiSelectionPills();
    showToast('সব প্রশ্ন আনসিলেক্ট করা হয়েছে');
}
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
