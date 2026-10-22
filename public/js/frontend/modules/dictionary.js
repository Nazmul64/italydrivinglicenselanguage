/**
 * MBanglaPatente - Dictionary (MCQ Vocabulary & Definitions Search)
 */

let mcqDictionaryAllTerms = [];
let mcqDictCurrentSearch = '';
let mcqDictCurrentLetter = '';
let mcqDictSearchDebounceTimer = null;
let isMcqDictLoading = false;

/**
 * Initialize / Pre-fetch dictionary data in background silently
 */
function initMcqDictionary() {
    if (mcqDictionaryAllTerms && mcqDictionaryAllTerms.length > 0) {
        return;
    }

    if (isMcqDictLoading) return;
    isMcqDictLoading = true;

    fetch('/api/dictionary/search')
        .then(res => res.json())
        .then(data => {
            isMcqDictLoading = false;
            if (data && data.status === 'success' && Array.isArray(data.results)) {
                mcqDictionaryAllTerms = data.results;
            } else {
                mcqDictionaryAllTerms = [];
            }
        })
        .catch(err => {
            isMcqDictLoading = false;
            console.error('Error prefetching dictionary vocabulary:', err);
        });
}

/**
 * Filter loaded terms locally for ultra-fast instant UI responsiveness
 */
function filterLocalDictionaryTerms() {
    // If no search query and no letter selected, return null (indicating idle/initial state)
    if (!mcqDictCurrentSearch && !mcqDictCurrentLetter) {
        return null;
    }

    let filtered = [...mcqDictionaryAllTerms];

    // 1. Filter by letter
    if (mcqDictCurrentLetter) {
        const targetLetter = mcqDictCurrentLetter.toUpperCase();
        filtered = filtered.filter(item => {
            const word = (item.word || '').trim();
            return word.length > 0 && word.charAt(0).toUpperCase() === targetLetter;
        });
    }

    // 2. Filter by search query
    if (mcqDictCurrentSearch) {
        const q = mcqDictCurrentSearch.toLowerCase().trim();
        filtered = filtered.filter(item => {
            const w = (item.word || '').toLowerCase();
            const bn = (item.bn || '').toLowerCase();
            const isMcq = !emptyOrFalse(item.is_mcq);

            if (isMcq) {
                const chap = (item.chapter || '').toLowerCase();
                return w.includes(q) || bn.includes(q) || chap.includes(q);
            } else {
                return w.includes(q) || bn.includes(q);
            }
        });

        // Smart sort:
        // 1. Exact word matches first
        // 2. Word starts with query
        // 3. Vocab words (is_mcq false) before full questions
        // 4. Alphabetical
        filtered.sort((a, b) => {
            const aWord = (a.word || '').toLowerCase();
            const bWord = (b.word || '').toLowerCase();

            const aExact = (aWord === q);
            const bExact = (bWord === q);
            if (aExact !== bExact) return aExact ? -1 : 1;

            const aStarts = aWord.startsWith(q);
            const bStarts = bWord.startsWith(q);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;

            const aIsMcq = !emptyOrFalse(a.is_mcq);
            const bIsMcq = !emptyOrFalse(b.is_mcq);
            if (aIsMcq !== bIsMcq) return aIsMcq ? 1 : -1;

            return aWord.localeCompare(bWord);
        });
    }

    return filtered;
}

function emptyOrFalse(val) {
    return !val || val === '0' || val === false;
}

/**
 * Render dictionary cards to DOM
 */
function renderMcqDictionaryResults(results) {
    const listEl = document.getElementById('dictionary-results-list');
    const notFoundEl = document.getElementById('dictionary-not-found');
    const initialStateEl = document.getElementById('dictionary-initial-state');
    const statusRowEl = document.getElementById('dictionary-results-status');
    const countTextEl = document.getElementById('dictionary-results-count-text');
    const filterTagEl = document.getElementById('dictionary-filter-tag');

    if (!listEl) return;

    // 1. If results is null -> Initial idle state (no search performed yet)
    if (results === null) {
        listEl.innerHTML = '';
        if (initialStateEl) initialStateEl.style.display = 'block';
        if (notFoundEl) notFoundEl.style.display = 'none';
        if (statusRowEl) statusRowEl.style.display = 'none';
        return;
    }

    // 2. We have a search action -> hide initial prompt
    if (initialStateEl) initialStateEl.style.display = 'none';
    if (statusRowEl) statusRowEl.style.display = 'flex';

    // Update status text
    if (countTextEl) {
        countTextEl.innerText = `${results.length}টি ফলাফল পাওয়া গেছে`;
    }

    // Update filter tag
    if (filterTagEl) {
        let tagText = '';
        if (mcqDictCurrentLetter) tagText += `অক্ষর: ${mcqDictCurrentLetter} `;
        if (mcqDictCurrentSearch) tagText += `সার্চ: "${mcqDictCurrentSearch}"`;
        if (tagText) {
            filterTagEl.innerText = tagText.trim();
            filterTagEl.style.display = 'inline-block';
        } else {
            filterTagEl.style.display = 'none';
        }
    }

    // 3. No results found
    if (!results || results.length === 0) {
        listEl.innerHTML = '';
        if (notFoundEl) notFoundEl.style.display = 'block';
        return;
    }

    if (notFoundEl) notFoundEl.style.display = 'none';

    const html = results.map(item => {
        const word = item.word || '';
        const bn = item.bn || '';
        const descIt = item.desc_it || '';
        const descBn = item.desc_bn || '';
        const img = item.image || '';
        const audio = item.audio || '';
        const source = item.source || 'MCQ Vocab';
        const targetType = item.target_type || 'argomenti';
        const pageId = item.page_id || null;
        const questionId = item.question_id || null;
        const chapter = item.chapter || '';
        const isMcq = !emptyOrFalse(item.is_mcq);

        // Highlight matched word if searching
        let highlightedWord = escapeHtml(word);
        if (mcqDictCurrentSearch) {
            const regex = new RegExp(`(${escapeRegex(mcqDictCurrentSearch)})`, 'gi');
            highlightedWord = highlightedWord.replace(regex, '<span style="background: #fef08a; color: #854d0e; padding: 0 3px; border-radius: 4px; font-weight: 800;">$1</span>');
        }

        let imgHtml = '';
        if (img) {
            imgHtml = `
                <div onclick="event.stopPropagation(); openDictImageZoom('${escapeHtml(word).replace(/'/g, "\\'")}', '${img}')" style="flex-shrink: 0; width: 72px; height: 72px; border-radius: 12px; overflow: hidden; background: var(--bg-page, #f1f5f9); border: 1px solid var(--border-card, #e2e8f0); cursor: pointer; position: relative;">
                    <img src="${img}" alt="${escapeHtml(word)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.style.display='none'">
                    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.15s ease;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
                        <i class="fa-solid fa-expand" style="color: #fff; font-size: 13px;"></i>
                    </div>
                </div>
            `;
        }

        // Distinct card for MCQ Question sentence
        if (isMcq) {
            return `
                <div class="dict-card dict-mcq-card" style="background: var(--bg-card, #ffffff); border: 1.5px solid rgba(2, 132, 199, 0.22); border-left: 4px solid #0284c7; border-radius: 16px; padding: 15px 16px; box-shadow: 0 3px 12px rgba(2, 132, 199, 0.05); transition: transform 0.15s ease, box-shadow 0.15s ease;">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;">
                        <div style="flex: 1; min-width: 0;">
                            <!-- Header Badges -->
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                                <span style="background: rgba(2, 132, 199, 0.12); color: #0284c7; padding: 3px 10px; border-radius: 16px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid fa-file-circle-question"></i> এমসিকিউ প্রশ্ন (${escapeHtml(source)})
                                </span>
                                ${chapter ? `
                                    <span style="background: var(--bg-page, #f1f5f9); color: var(--text-secondary, #64748b); padding: 3px 10px; border-radius: 16px; font-size: 11px; font-weight: 700; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        <i class="fa-solid fa-book-open" style="margin-right: 4px; font-size: 10px;"></i>${escapeHtml(chapter)}
                                    </span>
                                ` : ''}
                                <button type="button" onclick="event.stopPropagation(); speakItalianWord('${escapeHtml(word).replace(/'/g, "\\'")}', '${audio}')" style="background: rgba(2, 132, 199, 0.1); border: none; width: 28px; height: 28px; border-radius: 50%; color: #0284c7; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-left: auto;" title="Listen Italian Audio">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>

                            <!-- Italian Question Text -->
                            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary, #0f172a); line-height: 1.5; margin-bottom: 6px;">
                                ${highlightedWord}
                            </div>

                            <!-- Bengali Translation -->
                            <div style="font-size: 14px; font-weight: 600; color: #059669; line-height: 1.5; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 6px;">
                                <i class="fa-solid fa-language" style="margin-top: 3px; font-size: 13px; opacity: 0.85; flex-shrink: 0;"></i>
                                <span>${escapeHtml(bn || 'বাংলা অনুবাদ')}</span>
                            </div>

                            <!-- Go to MCQ page button -->
                            ${pageId ? `
                                <div>
                                    <button type="button" onclick="navigateToMcqFromDict('${targetType}', ${pageId}, ${questionId || 'null'})" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; border: none; padding: 7px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.28);">
                                        <i class="fa-solid fa-graduation-cap"></i>
                                        <span>এই এমসিকিউ পেজে যান</span>
                                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 11px;"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>

                        ${imgHtml}
                    </div>
                </div>
            `;
        }

        // Color theme based on source for Vocabulary Card
        let sourceBadgeBg = 'rgba(2, 132, 199, 0.1)';
        let sourceBadgeColor = '#0284c7';
        if (source.includes('Cartelli')) {
            sourceBadgeBg = 'rgba(249, 115, 22, 0.1)';
            sourceBadgeColor = '#ea580c';
        } else if (source.includes('Manuale')) {
            sourceBadgeBg = 'rgba(139, 92, 246, 0.1)';
            sourceBadgeColor = '#7c3aed';
        } else if (source.includes('Dizionario')) {
            sourceBadgeBg = 'rgba(16, 185, 129, 0.1)';
            sourceBadgeColor = '#059669';
        }

        return `
            <div class="dict-card dict-vocab-card" style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-card, #e2e8f0); border-radius: 16px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: transform 0.15s ease, box-shadow 0.15s ease;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text-primary, #0f172a); text-transform: uppercase; letter-spacing: 0.3px;">
                                ${highlightedWord}
                            </h3>
                            <button type="button" onclick="event.stopPropagation(); speakItalianWord('${escapeHtml(word).replace(/'/g, "\\'")}', '${audio}')" style="background: rgba(2, 132, 199, 0.1); border: none; width: 28px; height: 28px; border-radius: 50%; color: #0284c7; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;" title="Listen Italian Pronunciation">
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                            <span style="background: ${sourceBadgeBg}; color: ${sourceBadgeColor}; padding: 2px 8px; border-radius: 12px; font-size: 10.5px; font-weight: 700; margin-left: auto;">
                                ${escapeHtml(source)}
                            </span>
                        </div>

                        <div style="font-size: 15px; font-weight: 700; color: #10b981; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-arrow-right" style="font-size: 12px; opacity: 0.7;"></i>
                            <span>${escapeHtml(bn || 'বাংলা অর্থ')}</span>
                        </div>

                        ${(descIt && descIt.toLowerCase() !== word.toLowerCase()) ? `
                            <div style="margin-top: 8px; padding: 8px 10px; background: var(--bg-page, #f8fafc); border-radius: 8px; font-size: 12.5px; border-left: 3px solid #0284c7;">
                                <div style="color: var(--text-primary, #1e293b); font-weight: 600;">
                                    <strong style="color: #0284c7;">এমসিকিউ উদাহরণ:</strong> ${escapeHtml(descIt)}
                                </div>
                                ${descBn ? `<div style="color: #059669; font-weight: 600; margin-top: 3px;"><strong>বাংলা:</strong> ${escapeHtml(descBn)}</div>` : ''}
                            </div>
                        ` : ''}

                        ${pageId ? `
                            <div style="margin-top: 10px;">
                                <button type="button" onclick="navigateToMcqFromDict('${targetType}', ${pageId}, ${questionId || 'null'})" style="background: #0284c7; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>এই এমসিকিউ পেজে যান</span>
                                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 11px;"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    ${imgHtml}
                </div>
            </div>
        `;
    }).join('');

    listEl.innerHTML = html;
}

/**
 * Navigate to exact MCQ Page from Dictionary search
 */
function navigateToMcqFromDict(targetType, pageId, questionId = null) {
    if (!pageId) return;

    if (targetType === 'cartelli') {
        if (typeof openCartelliPageScreen === 'function') {
            openCartelliPageScreen(pageId);
        } else {
            window.location.href = '/cartelli-schede?page=' + pageId;
        }
    } else if (targetType === 'manuale') {
        if (typeof openScreen === 'function') {
            openScreen('manuale', 'Manuale');
        } else {
            window.location.href = '/manuale';
        }
    } else {
        // Argomenti / Questions Page
        if (typeof openPageDetailsScreen === 'function') {
            openPageDetailsScreen(pageId);
            if (questionId) {
                setTimeout(() => {
                    const el = document.getElementById('question-item-' + questionId) ||
                               document.querySelector(`[data-question-id="${questionId}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.boxShadow = '0 0 0 3px #0284c7';
                        setTimeout(() => { el.style.boxShadow = ''; }, 2500);
                    }
                }, 450);
            }
        } else {
            window.location.href = '/argomenti-schede?page=' + pageId;
        }
    }
}

/**
 * Handle Search Input change with instant local filter + debounced server fetch
 */
function onMcqDictSearchInput(e) {
    const val = e.target.value;
    mcqDictCurrentSearch = val;

    const clearBtn = document.getElementById('mcq-dict-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = val.trim().length > 0 ? 'flex' : 'none';
    }

    // 1. Instant local filter
    renderMcqDictionaryResults(filterLocalDictionaryTerms());

    // 2. Debounced live server search query
    if (mcqDictSearchDebounceTimer) clearTimeout(mcqDictSearchDebounceTimer);
    mcqDictSearchDebounceTimer = setTimeout(() => {
        const query = val.trim();
        if (!query && !mcqDictCurrentLetter) {
            return;
        }

        const url = `/api/dictionary/search?q=${encodeURIComponent(query)}&letter=${encodeURIComponent(mcqDictCurrentLetter)}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.results)) {
                    // Merge any newly returned items into local cache
                    const knownKeys = new Set(mcqDictionaryAllTerms.map(t => (t.word || '').toLowerCase()));
                    data.results.forEach(item => {
                        const k = (item.word || '').toLowerCase();
                        if (!knownKeys.has(k)) {
                            mcqDictionaryAllTerms.push(item);
                            knownKeys.add(k);
                        }
                    });

                    // If user is still searching for this query, render server results directly
                    if (mcqDictCurrentSearch === val) {
                        renderMcqDictionaryResults(data.results);
                    }
                }
            })
            .catch(err => {
                console.warn('Live dictionary search error:', err);
            });
    }, 250);
}

/**
 * Clear Search Input and return to initial state
 */
function clearMcqDictSearch() {
    const input = document.getElementById('mcq-dict-search-input');
    if (input) input.value = '';
    mcqDictCurrentSearch = '';
    mcqDictCurrentLetter = '';

    const clearBtn = document.getElementById('mcq-dict-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    // Reset alphabet buttons
    document.querySelectorAll('.dict-alpha-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'var(--bg-card, #ffffff)';
        btn.style.color = 'var(--text-primary, #1e293b)';
    });

    renderMcqDictionaryResults(filterLocalDictionaryTerms());
}

/**
 * Filter by Alphabet A-Z
 */
function filterByAlphabet(letter) {
    mcqDictCurrentLetter = letter;

    document.querySelectorAll('.dict-alpha-btn').forEach(btn => {
        const btnLetter = btn.getAttribute('data-letter');
        if (btnLetter === letter && letter !== '') {
            btn.classList.add('active');
            btn.style.background = '#0284c7';
            btn.style.color = '#fff';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'var(--bg-card, #ffffff)';
            btn.style.color = 'var(--text-primary, #1e293b)';
        }
    });

    if (!mcqDictionaryAllTerms || mcqDictionaryAllTerms.length === 0) {
        const loadingEl = document.getElementById('dictionary-loading-spinner');
        if (loadingEl) loadingEl.style.display = 'block';

        fetch('/api/dictionary/search')
            .then(res => res.json())
            .then(data => {
                if (loadingEl) loadingEl.style.display = 'none';
                if (data && data.status === 'success' && Array.isArray(data.results)) {
                    mcqDictionaryAllTerms = data.results;
                }
                renderMcqDictionaryResults(filterLocalDictionaryTerms());
            })
            .catch(() => {
                if (loadingEl) loadingEl.style.display = 'none';
                renderMcqDictionaryResults(filterLocalDictionaryTerms());
            });
    } else {
        renderMcqDictionaryResults(filterLocalDictionaryTerms());
    }
}

/**
 * Text-to-Speech audio pronunciation (Italian Voice)
 */
function speakItalianWord(word, customAudioUrl = '') {
    if (customAudioUrl) {
        const aud = new Audio(customAudioUrl);
        aud.play().catch(() => {
            speakWithWebSpeech(word);
        });
        return;
    }
    speakWithWebSpeech(word);
}

function speakWithWebSpeech(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'it-IT';
        utterance.rate = 0.85;

        const voices = window.speechSynthesis.getVoices();
        const italianVoice = voices.find(v => v.lang.includes('it') || v.lang.includes('IT'));
        if (italianVoice) utterance.voice = italianVoice;

        window.speechSynthesis.speak(utterance);
    }
}

/**
 * Open Image Zoom Modal
 */
function openDictImageZoom(word, imgUrl) {
    const modal = document.getElementById('dict-image-zoom-modal');
    const titleEl = document.getElementById('dict-zoom-word-title');
    const imgEl = document.getElementById('dict-zoom-img-el');

    if (modal && imgEl) {
        if (titleEl) titleEl.innerText = word;
        imgEl.src = imgUrl;
        modal.style.display = 'flex';
    }
}

function closeDictImageZoom() {
    const modal = document.getElementById('dict-image-zoom-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Helper string escape utilities
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Screen lifecycle listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('mcq-dict-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', onMcqDictSearchInput);
    }

    // Modal background click to close
    const zoomModal = document.getElementById('dict-image-zoom-modal');
    if (zoomModal) {
        zoomModal.addEventListener('click', (e) => {
            if (e.target === zoomModal) closeDictImageZoom();
        });
    }

    // Pre-fetch vocabulary data silently in background
    setTimeout(() => {
        initMcqDictionary();
    }, 1000);
});
