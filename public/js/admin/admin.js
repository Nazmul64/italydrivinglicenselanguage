// MBanglaPatente Admin Panel v2.1
// Set CSRF Token header for AJAX requests
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Sidebar drop-down logic
let currentPanel = 'dashboard';
let currentPage = 1;

// Toggle Dark/Light Mode Theme
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = document.getElementById('theme-toggle');
    if (isDark) {
        themeIcon.className = 'fa-solid fa-sun action-icon';
        localStorage.setItem('admin-theme', 'dark');
        showToast('ডার্ক মোড সক্রিয় হয়েছে');
    } else {
        themeIcon.className = 'fa-solid fa-moon action-icon';
        localStorage.setItem('admin-theme', 'light');
        showToast('লাইট মোড সক্রিয় হয়েছে');
    }
}

// Initialize Theme from Storage
if (localStorage.getItem('admin-theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').className = 'fa-solid fa-sun action-icon';
}

// Display panels switching
function switchPanel(panelId) {
    stopAdminChatPolling();
    currentPanel = panelId;
    document.querySelectorAll('.crud-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) targetPanel.classList.add('active');

    let menuSuffix = panelId;
    if (panelId === 'mcq-questions') menuSuffix = 'questions';
    else if (panelId === 'mcq-chapters') menuSuffix = 'chapters';
    else if (panelId === 'mcq-exams') menuSuffix = 'exams';

    const activeMenu = document.getElementById(`menu-${menuSuffix}`);
    if (activeMenu) activeMenu.classList.add('active');

    if (panelId === 'dashboard') {
        fetchStats();
    } else if (panelId === 'mcq-questions') {
        currentPage = 1;
        fetchQuestions();
    } else if (panelId === 'mcq-chapters') {
        fetchChaptersAdmin();
    } else if (panelId === 'chat-room') {
        startAdminChatPolling();
    } else if (panelId === 'categories') {
        fetchCategories();
    } else if (panelId === 'mcq-exams') {
        loadAdminExamsList();
    } else if (panelId === 'sliders') {
        fetchSliders();
    } else if (panelId === 'popup-promo') {
        fetchPopupPromo();
    } else if (panelId === 'home-cards') {
        fetchHomeCards();
    } else if (panelId === 'classes') {
        fetchLectureClasses();
    } else if (panelId === 'live-classes') {
        fetchLiveClasses();
    } else if (panelId === 'file-manager') {
        fetchMediaFiles();
    } else if (panelId === 'sys-errors') {
        fetchSystemErrors(1);
    } else if (panelId === 'sys-health') {
        fetchDatabaseStatus();
        fetchQueueStatus();
        fetchSchedulerStatus();
    } else if (panelId === 'sys-api') {
        fetchApiLogs(1);
    } else if (panelId === 'sys-logs') {
        fetchLaravelLogEntries(1);
    } else if (panelId === 'sys-env') {
        fetchServerInfo();
        fetchSecurityChecks();
    } else if (panelId === 'sys-backups') {
        fetchBackupArchives();
    } else if (panelId === 'cartelli-categories') {
        initCartelloCategories();
    } else if (panelId === 'cartelli-chapters') {
        switchCartelloAdminSubTab('chapters');
    } else if (panelId === 'cartelli-pages') {
        initCartelloPages();
    } else if (panelId === 'cartelli-mcqs') {
        initCartelloMcqs();
    } else if (panelId === 'dizionario') {
        fetchDizionario();
    } else if (panelId === 'general-settings') {
        fetchGeneralSettings();
    }
}

// Toast Messages
let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text-content');
    toastText.innerText = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Trigger search globally
function triggerGlobalSearch(value) {
    if (currentPanel === 'mcq-questions') {
        document.getElementById('search-question').value = value;
        fetchQuestions();
    }
}

// Fetch Dashboard overall stats
function fetchStats() {
    fetch('/admin/api/stats')
        .then(res => res.json())
        .then(data => {
            if (document.getElementById('stat-chapters')) {
                document.getElementById('stat-chapters').innerText = data.total_chapters;
                document.getElementById('stat-pages').innerText = data.total_pages;
                document.getElementById('stat-questions').innerText = data.total_questions;
                document.getElementById('stat-videos').innerText = data.total_videos;
                document.getElementById('stat-live-sessions').innerText = data.total_live_sessions;
                document.getElementById('stat-sliders').innerText = data.total_sliders;
                document.getElementById('stat-users').innerText = data.total_users;
            }
            if (document.getElementById('dash-total-sales')) {
                document.getElementById('dash-total-sales').innerText = data.total_questions + ' questions';
            }
        })
        .catch(err => console.error(err));
}
fetchStats();

// Dynamic Chapters dictionary to sync option lists
let chaptersDict = {};

// Populate Chapter dropdown selection lists
function populateChaptersSelectors() {
    const filterCh = document.getElementById('filter-chapter');
    const formCh = document.getElementById('form-chapter');
    if (!filterCh || !formCh) return;

    filterCh.innerHTML = '<option value="">সকল অধ্যায় (All Chapters)</option>';
    formCh.innerHTML = '';

    for (let id in chaptersDict) {
        filterCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
        formCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
    }
}

// Function to fetch chapters and update dropdowns dynamically
function loadChaptersData(onComplete = null) {
    return fetch('/admin/api/chapters')
        .then(res => res.json())
        .then(data => {
            chaptersDict = {};
            data.forEach(ch => {
                chaptersDict[ch.id] = ch.name;
            });
            populateChaptersSelectors();

            const sel = document.getElementById('admin-page-chapter-select');
            if (sel) {
                const prevVal = sel.value;
                sel.innerHTML = '';
                data.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.textContent = `Ch#${ch.id} - ${ch.name}`;
                    sel.appendChild(opt);
                });

                if (data.length > 0) {
                    if (prevVal && data.some(ch => ch.id == prevVal)) {
                        sel.value = prevVal;
                    } else {
                        sel.value = data[0].id;
                        loadAdminPagesForSelectedChapter(data[0].id);
                    }
                }
            }

            const modalSel = document.getElementById('form-page-chapter-id');
            if (modalSel) {
                modalSel.innerHTML = '';
                data.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.textContent = `Ch#${ch.id} - ${ch.name}`;
                    modalSel.appendChild(opt);
                });
            }

            // Sync MCQ question modal select chapter if it's set
            const formCh = document.getElementById('form-chapter');
            if (formCh && formCh.value) {
                syncChapterName(formCh.value);
            } else if (formCh && Object.keys(chaptersDict).length > 0) {
                const firstId = Object.keys(chaptersDict)[0];
                formCh.value = firstId;
                syncChapterName(firstId);
            }

            if (onComplete) onComplete(data);
        })
        .catch(err => console.error("Error loading chapters data:", err));
}

function syncChapterName(val) {
    document.getElementById('form-chapter-name').value = chaptersDict[val] || '';
    fetchPagesForChapterSelect(val);
}

function fetchPagesForChapterSelect(chapterId, selectedPageId = null) {
    const pageSelect = document.getElementById('form-page-id');
    if (!pageSelect) return;

    pageSelect.innerHTML = '<option value="">Loading pages...</option>';

    fetch(`/admin/api/chapters/${chapterId}/pages`)
        .then(res => res.json())
        .then(pages => {
            pageSelect.innerHTML = '<option value="">Select Page...</option>';
            if (Array.isArray(pages)) {
                pages.forEach(p => {
                    const selectedAttr = (selectedPageId && parseInt(selectedPageId) === p.id) ? 'selected' : '';
                    pageSelect.innerHTML += `<option value="${p.id}" ${selectedAttr}>${p.id}. ${p.title} (${p.bn_title || ''})</option>`;
                });
            }
        })
        .catch(err => {
            console.error(err);
            pageSelect.innerHTML = '<option value="">Error loading pages</option>';
        });
}
syncChapterName(1);

function onFilterChapterChange(chapterId) {
    const pageSelect = document.getElementById('filter-page');
    if (!pageSelect) return;

    if (!chapterId) {
        pageSelect.style.display = 'none';
        pageSelect.value = '';
        pageSelect.innerHTML = '<option value="">সকল পেজ (All Pages)</option>';
        fetchQuestions();
        return;
    }

    pageSelect.innerHTML = '<option value="">Loading pages...</option>';
    pageSelect.style.display = 'block';

    fetch(`/admin/api/chapters/${chapterId}/pages`)
        .then(res => res.json())
        .then(pages => {
            pageSelect.innerHTML = '<option value="">সকল পেজ (All Pages)</option>';
            if (Array.isArray(pages)) {
                pages.forEach(p => {
                    pageSelect.innerHTML += `<option value="${p.id}">${p.id}. ${p.title}</option>`;
                });
            }
            fetchQuestions();
        })
        .catch(err => {
            console.error(err);
            pageSelect.innerHTML = '<option value="">Error loading pages</option>';
            fetchQuestions();
        });
}

// Fetch Questions paginated list via AJAX
function fetchQuestions() {
    const chapter = document.getElementById('filter-chapter').value;
    const pageSelect = document.getElementById('filter-page');
    const pageId = pageSelect ? pageSelect.value : '';
    const search = document.getElementById('search-question').value;

    let url = `/admin/api/questions?page=${currentPage}`;
    if (chapter) url += `&chapter=${chapter}`;
    if (pageId) url += `&page_id=${pageId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (typeof selectAllAcrossPagesFlag !== 'undefined') {
                selectAllAcrossPagesFlag['questions'] = false;
            }
            questionsTotalCount = data.total || 0;
            renderQuestionsTable(data.data);
            updatePaginationControls(data);
        })
        .catch(err => {
            console.error(err);
            showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
        });
}

// Render table records
function renderQuestionsTable(questions) {
    const tbody = document.getElementById('questions-table-body');
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-questions');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('questions');

    if (!questions || questions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি</td></tr>';
        return;
    }

    questions.forEach(q => {
        const tr = document.createElement('tr');
        const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
        const pageTitle = q.page ? `${q.page.id}. ${q.page.title}` : '<span style="opacity: 0.5;">Not Assigned</span>';

        tr.innerHTML = `
                    <td style="text-align: center;"><input type="checkbox" class="select-question-checkbox" value="${q.id}" onchange="updateBulkDeleteButton('questions')"></td>
                    <td style="text-align: center; font-weight: bold; color: var(--text-secondary);">${q.sort_order || 0}</td>
                    <td style="text-align: center; font-weight: 700; color: var(--accent-teal);">${q.chapter}</td>
                    <td style="font-size: 11px; font-weight: 600; color: var(--text-primary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${q.page ? q.page.title : ''}">${pageTitle}</td>
                    <td style="font-weight: 500;">${q.italian}</td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${q.bangla}</td>
                    <td style="text-align: center;">
                        <span class="badge ${isVero ? 'badge-vero' : 'badge-falso'}">
                            ${isVero ? 'VERO' : 'FALSO'}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        <div class="table-actions" style="justify-content: center;">
                            <button class="action-btn edit" onclick="openEditQuestionModal(${JSON.stringify(q).replace(/"/g, '&quot;')})" title="Edit question"><i class="fa-solid fa-pencil"></i></button>
                            <button class="action-btn delete" onclick="deleteQuestion(${q.id})" title="Delete question"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

// Update pagination numbers
function updatePaginationControls(data) {
    document.getElementById('pagination-status').innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;

    document.getElementById('btn-prev-page').disabled = !data.prev_page_url;
    document.getElementById('btn-next-page').disabled = !data.next_page_url;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchQuestions();
    }
}

function nextPage() {
    currentPage++;
    fetchQuestions();
}

function previewQuestionImage(input) {
    const preview = document.getElementById('question-img-preview-img');
    const container = document.getElementById('question-img-preview-container');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            container.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        container.style.display = 'none';
    }
}

function previewQuestionAudio(input) {
    const preview = document.getElementById('question-audio-preview-player');
    const container = document.getElementById('question-audio-preview-container');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            container.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        container.style.display = 'none';
    }
}

function previewQuestionVideo(input) {
    const preview = document.getElementById('question-video-preview-player');
    const container = document.getElementById('question-video-preview-container');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            container.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        container.style.display = 'none';
    }
}

function toggleQuestionVideoInput(enabled) {
    const wrapper = document.getElementById('question-video-inputs-wrapper');
    const labelContainer = document.getElementById('question-video-toggle-label');
    const statusIcon = document.getElementById('question-video-status-icon');
    const toggleText = document.getElementById('question-video-toggle-text');
    const previewContainer = document.getElementById('question-video-preview-container');
    const toggleSpan = document.getElementById('question-video-toggle-span');

    if (enabled) {
        if (wrapper) wrapper.style.display = 'flex';
        if (statusIcon) statusIcon.className = 'fa-solid fa-video';
        if (toggleText) toggleText.innerText = 'ON (ফ্রন্টে দেখাবে)';
        if (labelContainer) labelContainer.style.color = '#4CAF50';
        if (toggleSpan) toggleSpan.style.backgroundColor = '#4CAF50';
    } else {
        if (wrapper) wrapper.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';
        if (statusIcon) statusIcon.className = 'fa-solid fa-eye-slash';
        if (toggleText) toggleText.innerText = 'OFF (ফ্রন্টে দেখাবে না)';
        if (labelContainer) labelContainer.style.color = '#EF4444';
        if (toggleSpan) toggleSpan.style.backgroundColor = '#EF4444';
    }
}

// Add / Edit Question Modals logic
function openAddQuestionModal() {
    document.getElementById('question-modal-title').innerText = 'Add New Question';
    document.getElementById('form-question-id').value = '';
    document.getElementById('form-question-sort-order').value = '0';
    document.getElementById('form-italian').value = '';
    document.getElementById('form-bangla').value = '';
    document.getElementById('form-is-vero').value = '1';
    document.getElementById('question-vocab-tbody').innerHTML = '';

    document.getElementById('form-question-img-file').value = '';
    document.getElementById('form-question-audio-file').value = '';
    document.getElementById('form-question-video-file').value = '';
    document.getElementById('form-question-video-url').value = '';
    document.getElementById('question-img-preview-container').style.display = 'none';
    document.getElementById('question-audio-preview-container').style.display = 'none';
    document.getElementById('question-video-preview-container').style.display = 'none';

    const videoToggle = document.getElementById('form-question-video-toggle');
    if (videoToggle) {
        videoToggle.checked = true;
        toggleQuestionVideoInput(true);
    }

    const firstChapter = Object.keys(chaptersDict)[0];
    document.getElementById('form-chapter').value = firstChapter;
    syncChapterName(firstChapter);

    const itInput = document.getElementById('form-italian');
    const bnInput = document.getElementById('form-bangla');
    if (itInput && !itInput.dataset.listenerAttached) {
        itInput.addEventListener('input', updateQuestionUnderlinedWordsList);
        itInput.dataset.listenerAttached = 'true';
    }
    if (bnInput && !bnInput.dataset.listenerAttached) {
        bnInput.addEventListener('input', updateQuestionUnderlinedWordsList);
        bnInput.dataset.listenerAttached = 'true';
    }

    document.getElementById('question-modal').style.display = 'flex';
}

function openEditQuestionModal(q) {
    document.getElementById('question-modal-title').innerText = 'Edit Question';
    document.getElementById('form-question-id').value = q.id;
    document.getElementById('form-question-sort-order').value = q.sort_order || 0;
    document.getElementById('form-chapter').value = q.chapter;
    document.getElementById('form-chapter-name').value = q.chapter_name || '';
    document.getElementById('form-italian').value = q.italian;
    document.getElementById('form-bangla').value = q.bangla;
    document.getElementById('question-vocab-tbody').innerHTML = '';

    document.getElementById('form-question-img-file').value = '';
    document.getElementById('form-question-audio-file').value = '';
    document.getElementById('form-question-video-file').value = '';
    document.getElementById('form-question-video-url').value = '';

    if (q.image) {
        document.getElementById('question-img-preview-img').src = q.image;
        document.getElementById('question-img-preview-container').style.display = 'block';
    } else {
        document.getElementById('question-img-preview-container').style.display = 'none';
    }

    if (q.audio) {
        document.getElementById('question-audio-preview-player').src = q.audio;
        document.getElementById('question-audio-preview-container').style.display = 'block';
    } else {
        document.getElementById('question-audio-preview-container').style.display = 'none';
    }

    const videoToggle = document.getElementById('form-question-video-toggle');
    if (q.video && q.video.trim() !== '') {
        if (videoToggle) videoToggle.checked = true;
        toggleQuestionVideoInput(true);
        if (q.video.startsWith('http') || q.video.includes('youtube.com') || q.video.includes('youtu.be')) {
            document.getElementById('form-question-video-url').value = q.video;
            document.getElementById('question-video-preview-container').style.display = 'none';
        } else {
            document.getElementById('form-question-video-url').value = '';
            document.getElementById('question-video-preview-player').src = q.video;
            document.getElementById('question-video-preview-container').style.display = 'block';
        }
    } else {
        if (videoToggle) videoToggle.checked = false;
        toggleQuestionVideoInput(false);
        document.getElementById('question-video-preview-container').style.display = 'none';
    }

    let vocabArr = [];
    try {
        vocabArr = typeof q.vocabulary === 'string' ? JSON.parse(q.vocabulary) : q.vocabulary;
    } catch (e) { }
    if (Array.isArray(vocabArr)) {
        vocabArr.forEach(item => addQuestionVocabRow(item.italian, item.bangla, item.image));
    }

    const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
    document.getElementById('form-is-vero').value = isVero ? '1' : '0';

    fetchPagesForChapterSelect(q.chapter, q.page_id);

    const itInput = document.getElementById('form-italian');
    const bnInput = document.getElementById('form-bangla');
    if (itInput && !itInput.dataset.listenerAttached) {
        itInput.addEventListener('input', updateQuestionUnderlinedWordsList);
        itInput.dataset.listenerAttached = 'true';
    }
    if (bnInput && !bnInput.dataset.listenerAttached) {
        bnInput.addEventListener('input', updateQuestionUnderlinedWordsList);
        bnInput.dataset.listenerAttached = 'true';
    }

    document.getElementById('question-modal').style.display = 'flex';
}

function closeQuestionModal() {
    document.getElementById('question-modal').style.display = 'none';
}

// AJAX Save Question (Create or Update)
function saveQuestion(e) {
    e.preventDefault();
    const id = document.getElementById('form-question-id').value;
    const chapter = document.getElementById('form-chapter').value;
    const chapter_name = document.getElementById('form-chapter-name').value;
    const page_id = document.getElementById('form-page-id').value;
    const sort_order = document.getElementById('form-question-sort-order').value;
    const italian = document.getElementById('form-italian').value;
    const bangla = document.getElementById('form-bangla').value;
    const is_vero = document.getElementById('form-is-vero').value === '1';

    const isVideoToggleOn = document.getElementById('form-question-video-toggle') ? document.getElementById('form-question-video-toggle').checked : true;
    const imgFile = document.getElementById('form-question-img-file').files[0];
    const audioFile = document.getElementById('form-question-audio-file').files[0];
    const videoFile = document.getElementById('form-question-video-file').files[0];
    const videoUrl = document.getElementById('form-question-video-url').value.trim();

    const vocabRows = document.querySelectorAll('#question-vocab-tbody tr');
    const vocabulary = [];
    const formData = new FormData();

    vocabRows.forEach((row, index) => {
        const itInput = row.querySelector('.vocab-it');
        const bnInput = row.querySelector('.vocab-bn');
        const fileInput = row.querySelector('.vocab-img-file');
        const pathInput = row.querySelector('.vocab-img-path');
        const it = itInput ? itInput.value.trim() : '';
        const bn = bnInput ? bnInput.value.trim() : '';
        const existingPath = pathInput ? pathInput.value : '';

        if (it && bn) {
            const item = { italian: it, bangla: bn, image: existingPath };
            if (fileInput && fileInput.files && fileInput.files[0]) {
                formData.append(`vocab_image_${index}`, fileInput.files[0]);
                item.image_index = index;
            }
            vocabulary.push(item);
        }
    });

    formData.append('chapter', chapter);
    formData.append('chapter_name', chapter_name);
    formData.append('page_id', page_id);
    formData.append('sort_order', sort_order);
    formData.append('italian', italian);
    formData.append('bangla', bangla);
    formData.append('is_vero', is_vero ? '1' : '0');
    formData.append('vocabulary', JSON.stringify(vocabulary));

    if (imgFile) formData.append('image', imgFile);
    if (audioFile) formData.append('audio', audioFile);

    if (isVideoToggleOn) {
        if (videoFile) formData.append('video', videoFile);
        else if (videoUrl) formData.append('video', videoUrl);
    } else {
        formData.append('clear_video', '1');
        formData.append('video', '');
    }

    const url = id ? `/admin/api/questions/update/${id}` : '/admin/api/questions/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            closeQuestionModal();
            showToast(id ? 'প্রশ্নটি সফলভাবে আপডেট করা হয়েছে' : 'নতুন প্রশ্নটি সফলভাবে যোগ করা হয়েছে');
            fetchQuestions();
        })
        .catch(err => {
            console.error(err);
            showToast('প্রশ্নটি সংরক্ষণ করতে ব্যর্থ হয়েছে');
        });
}

// Delete Question
function deleteQuestion(id) {
    if (confirm('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি ডিলিট করতে চান?')) {
        fetch(`/admin/api/questions/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('প্রশ্নটি ডিলিট করা হয়েছে');
                fetchQuestions();
            })
            .catch(err => {
                console.error(err);
                showToast('প্রশ্নটি ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// Chapters Management Panel AJAX Operations
function fetchChapters() {
    fetch('/admin/api/chapters')
        .then(res => res.json())
        .then(data => {
            renderChaptersGrid(data);
        })
        .catch(err => {
            console.error(err);
            showToast('অধ্যায় তালিকা লোড করতে ব্যর্থ হয়েছে');
        });
}

function renderChaptersGrid(chapters) {
    const container = document.getElementById('chapters-grid-container');
    if (!container) return;
    container.innerHTML = '';

    chapters.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.borderRadius = '12px';
        card.style.overflow = 'hidden';
        card.style.backgroundColor = 'var(--bg-card)';
        card.style.border = '1px solid var(--border-color)';

        const cover = ch.image ? ch.image : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60';

        card.innerHTML = `
                    <div style="height: 120px; overflow: hidden; position: relative;">
                        <img src="${cover}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; font-size: 10px; font-weight: 800; border-radius: 4px;">Ch #${ch.id}</span>
                    </div>
                    <div style="padding: 14px; display: flex; flex-direction: column; gap: 8px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h4 class="chapter-title" style="margin: 0; font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.4;">${ch.name}</h4>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; font-weight: 700;">${ch.bn_name || ''}</div>
                            </div>
                            <button class="action-btn edit" onclick="openEditChapterModal(${ch.id}, '${ch.name.replace(/'/g, "\\'")}', '${(ch.bn_name || '').replace(/'/g, "\\'")}')" title="Edit chapter" style="margin: 0; padding: 6px; width: 28px; height: 28px; min-width: 28px;"><i class="fa-solid fa-pencil" style="font-size: 10px;"></i></button>
                        </div>
                        <div class="chapter-count" style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-top: auto; display: flex; align-items: center;">
                            <i class="fa-solid fa-layer-group" style="margin-right: 6px; color: var(--accent-orange);"></i>
                            ${ch.question_count} Patente questions
                        </div>
                    </div>
                `;
        container.appendChild(card);
    });
}


// ==========================================
// Admin Pages Management Operations
// ==========================================
let activeAdminChapterId = 1;
let adminPagesData = [];

function switchAdminSubTab(tabName) {
    const btnChapters = document.getElementById('tab-btn-chapters');
    const btnPages = document.getElementById('tab-btn-pages');
    const panelChapters = document.getElementById('admin-sub-panel-chapters');
    const panelPages = document.getElementById('admin-sub-panel-pages');

    if (tabName === 'chapters') {
        btnChapters.style.backgroundColor = 'var(--accent-orange)';
        btnChapters.style.color = 'white';
        btnChapters.classList.remove('btn-secondary');

        btnPages.style.backgroundColor = 'transparent';
        btnPages.style.color = 'var(--text-secondary)';
        btnPages.classList.add('btn-secondary');

        panelChapters.style.display = 'block';
        panelPages.style.display = 'none';

        fetchChapters();
    } else if (tabName === 'pages') {
        btnPages.style.backgroundColor = 'var(--accent-orange)';
        btnPages.style.color = 'white';
        btnPages.classList.remove('btn-secondary');

        btnChapters.style.backgroundColor = 'transparent';
        btnChapters.style.color = 'var(--text-secondary)';
        btnChapters.classList.add('btn-secondary');

        panelChapters.style.display = 'none';
        panelPages.style.display = 'block';

        populateAdminChapterSelectDropdown();
    }
}

function populateAdminChapterSelectDropdown() {
    const select = document.getElementById('admin-page-chapter-select');
    if (!select) return;
    select.innerHTML = '';

    fetch('/admin/api/chapters')
        .then(res => res.json())
        .then(chapters => {
            chapters.forEach(ch => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                opt.innerText = `Capitolo ${ch.id}) ${ch.name}`;
                select.appendChild(opt);
            });

            // Populate the modal's chapter select dropdown
            const modalSelect = document.getElementById('form-page-chapter-id');
            if (modalSelect) {
                modalSelect.innerHTML = '';
                chapters.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.innerText = `Capitolo ${ch.id}) ${ch.name}`;
                    modalSelect.appendChild(opt);
                });
            }

            if (chapters.length > 0) {
                select.value = activeAdminChapterId;
                loadAdminPagesForSelectedChapter(activeAdminChapterId);
            }
        });
}

function loadAdminPagesForSelectedChapter(chapterId) {
    activeAdminChapterId = parseInt(chapterId);
    const tbody = document.getElementById('admin-pages-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading pages...</td></tr>`;

    fetch(`/admin/api/chapters/${chapterId}/pages`)
        .then(res => res.json())
        .then(pages => {
            adminPagesData = pages;
            tbody.innerHTML = '';

            if (pages.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No pages found under this chapter. Add a new page!</td></tr>`;
                return;
            }

            pages.forEach(p => {
                const tr = document.createElement('tr');
                const imageBadge = p.image
                    ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2);">Yes</span>`
                    : `<span class="badge" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">No</span>`;

                const audioBadge = p.audio
                    ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2);">Yes</span>`
                    : `<span class="badge" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">No</span>`;

                tr.innerHTML = `
                            <td><strong>#${p.id}</strong></td>
                            <td>
                                <div style="font-weight: bold; color: var(--text-primary);">${p.title}</div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${p.bn_title || ''}</div>
                            </td>
                            <td style="text-align: center;">${imageBadge}</td>
                            <td style="text-align: center;">${audioBadge}</td>
                            <td style="text-align: center;"><span style="font-weight:bold; background-color: var(--bg-content); padding: 2px 8px; border-radius: 10px; font-size:11px; border:1px solid var(--border-color);">${p.questions_count || 0} MCQs</span></td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                    <button class="btn btn-secondary btn-sm" onclick="openEditPageModal(${p.id}, '${p.title.replace(/'/g, "\\'")}', '${(p.bn_title || '').replace(/'/g, "\\'")}', '${(p.content || '').replace(/'/g, "\\'").replace(/\n/g, "\\n")}')" title="Edit Page" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-pencil"></i></button>
                                    <button class="btn btn-danger btn-sm" onclick="deletePage(${p.id})" title="Delete Page" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading chapter pages: ", err);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading pages.</td></tr>`;
        });
}


// Toggle user profile dropdown menu
function toggleUserDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    }
}

// Close dropdown when user clicks elsewhere
window.addEventListener('click', () => {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
});

// --- 8. Admin Chat Room Operations ---
let adminChatInterval = null;
let activeChatSessionId = null;

function startAdminChatPolling() {
    fetchConversations();
    if (!adminChatInterval) {
        adminChatInterval = setInterval(() => {
            fetchConversations();
            if (activeChatSessionId) {
                fetchConversationMessages(activeChatSessionId, false);
            }
        }, 3000);
    }
}

function stopAdminChatPolling() {
    if (adminChatInterval) {
        clearInterval(adminChatInterval);
        adminChatInterval = null;
    }
}

let allConversationsList = [];

function fetchConversations() {
    fetch('/admin/api/chat/conversations')
        .then(res => res.json())
        .then(conversations => {
            allConversationsList = conversations;
            renderConversationsList(conversations);
        })
        .catch(err => console.error("Error fetching conversations: ", err));
}

function renderConversationsList(conversations) {
    const listContainer = document.getElementById('admin-chat-list');
    listContainer.innerHTML = '';

    if (conversations.length === 0) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px;">কোনো চ্যাট উপলব্ধ নেই</div>`;
        return;
    }

    conversations.forEach(convo => {
        const item = document.createElement('div');
        item.className = `conversation-item ${activeChatSessionId === convo.session_id ? 'active' : ''}`;
        item.setAttribute('data-session-id', convo.session_id);
        item.onclick = () => selectConversation(convo.session_id);

        let avatarHTML = '<div class="conversation-avatar">GU</div>';
        let nameHTML = `<div class="conversation-name">Guest #${convo.session_id.substring(0, 8)}</div>`;
        let statusHTML = '';
        let progressHTML = '';

        if (convo.client) {
            const client = convo.client;
            const initials = `${client.first_name[0] || 'U'}${client.last_name[0] || 'S'}`.toUpperCase();
            avatarHTML = `<div class="conversation-avatar">${initials}</div>`;

            let starsHTML = '<span class="client-stars-display" style="color: #fbbf24; margin-left: 6px; font-size: 11px;">';
            for (let i = 1; i <= 5; i++) {
                starsHTML += i <= client.stars ? '★' : '☆';
            }
            starsHTML += '</span>';

            nameHTML = `
                        <div class="conversation-name" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <span>${client.first_name} ${client.last_name}</span>
                            ${starsHTML}
                        </div>
                    `;

            progressHTML = `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; width: 100%;">
                            <span style="font-size: 9px; color: var(--text-secondary); white-space: nowrap;">${client.phone}</span>
                            <div class="client-progress-bar-bg" style="flex: 1; height: 5px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; position: relative;">
                                <div class="client-progress-bar-fill" style="width: ${client.progress}%; height: 100%; background-color: #4CAF50; border-radius: 3px;"></div>
                            </div>
                        </div>
                    `;

            statusHTML = `
                        <div class="client-status-box ${client.is_active ? 'active' : 'inactive'}" 
                             onclick="event.stopPropagation(); toggleClientActivation(${client.id})"
                             title="${client.is_active ? 'Deactivate Client' : 'Activate Client'}"
                             style="width: 14px; height: 14px; border-radius: 3px; cursor: pointer; display: inline-block; margin-left: 10px; transition: background-color 0.2s;">
                        </div>
                    `;
        }

        item.innerHTML = `
                    ${avatarHTML}
                    <div class="conversation-meta" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        ${nameHTML}
                        <div class="conversation-last-msg" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; margin-top: 2px;">${convo.last_message}</div>
                        ${progressHTML}
                    </div>
                    ${statusHTML}
                `;
        listContainer.appendChild(item);
    });
}

function toggleClientActivation(clientId) {
    fetch(`/admin/api/clients/toggle-active/${clientId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.client.is_active ? 'গ্রাহক অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'গ্রাহক অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে');
            fetchConversations();
        })
        .catch(err => {
            console.error("Error toggling client activation: ", err);
            showToast('অ্যাক্টিভেশন স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        });
}

function selectConversation(sessionId) {
    activeChatSessionId = sessionId;

    document.getElementById('admin-chat-fallback').style.display = 'none';
    document.getElementById('admin-chat-main-area').style.display = 'flex';

    const convo = allConversationsList.find(c => c.session_id === sessionId);
    if (convo && convo.client) {
        const client = convo.client;
        document.getElementById('active-chat-name').innerText = `${client.first_name} ${client.last_name} (${client.phone})`;
        document.getElementById('active-chat-avatar').innerText = `${client.first_name[0] || 'U'}${client.last_name[0] || 'S'}`.toUpperCase();
    } else {
        document.getElementById('active-chat-name').innerText = `Guest User #${sessionId.substring(0, 8)}`;
        document.getElementById('active-chat-avatar').innerText = `GU`;
    }

    fetchConversationMessages(sessionId, true);

    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.conversation-item[data-session-id="${sessionId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function fetchConversationMessages(sessionId, forceScroll = false) {
    fetch(`/admin/api/chat/messages/${sessionId}`)
        .then(res => res.json())
        .then(messages => {
            renderConversationMessages(messages, forceScroll);
        })
        .catch(err => console.error("Error loading messages: ", err));
}

function renderConversationMessages(messages, forceScroll) {
    const container = document.getElementById('admin-chat-messages');
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    messages.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.message && msg.message.startsWith('[LICENSE_CARD:') && msg.message.endsWith(']')) {
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=(\d+)/);
            const days = matchDays ? matchDays[1] : 365;
            const key = matchKey ? matchKey[1] : '';

            bubble.className = `license-card-bubble`;
            bubble.style.alignSelf = 'flex-end';
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
                        <button class="license-card-btn" disabled style="opacity: 0.7; cursor: not-allowed;">Attiva Licenza (Inviata)</button>
                    `;
        } else {
            bubble.className = `chat-message-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`;
            if (msg.attachment_path) {
                const img = document.createElement('img');
                img.src = msg.attachment_path;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '250px';
                img.style.borderRadius = '8px';
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

    if (forceScroll || scrollAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

function sendAdminChatMessage() {
    const input = document.getElementById('admin-chat-input');
    const messageText = input.value.trim();
    if (!messageText || !activeChatSessionId) return;

    input.value = '';

    fetch('/admin/api/chat/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            session_id: activeChatSessionId,
            message: messageText
        })
    })
        .then(res => res.json())
        .then(msg => {
            fetchConversationMessages(activeChatSessionId, true);
        })
        .catch(err => console.error("Error sending message: ", err));
}

function openAdminChatSettings() {
    if (!activeChatSessionId) {
        showToast('দয়া করে প্রথমে একটি চ্যাট নির্বাচন করুন');
        return;
    }
    const modal = document.getElementById('admin-chat-settings-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAdminChatSettings() {
    const modal = document.getElementById('admin-chat-settings-modal');
    if (modal) modal.style.display = 'none';
}

function executeChatMacro(macroKey) {
    if (!activeChatSessionId) return;

    closeAdminChatSettings();
    showToast('অনুরোধ পাঠানো হচ্ছে...');

    fetch('/admin/api/chat/macro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            session_id: activeChatSessionId,
            macro: macroKey
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Macro execution failed');
            return res.json();
        })
        .then(msg => {
            showToast('অ্যাকশন সফলভাবে সম্পন্ন হয়েছে');
            fetchConversationMessages(activeChatSessionId, true);
            fetchConversations();
        })
        .catch(err => {
            console.error("Error running chat macro: ", err);
            showToast('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
        });
}

// --- 9. Category Management Operations ---
let categoriesData = [];

function fetchCategories() {
    fetch('/admin/api/categories')
        .then(res => res.json())
        .then(data => {
            categoriesData = data;
            renderCategoriesTable();
        })
        .catch(err => {
            console.error("Error loading categories: ", err);
            showToast('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
        });
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categories-table-body');
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-categories');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('categories');

    if (categoriesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ক্যাটাগরি পাওয়া যায়নি। নতুন ক্যাটাগরি তৈরি করুন!</td></tr>`;
        return;
    }

    categoriesData.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td style="text-align: center;"><input type="checkbox" class="select-category-checkbox" value="${cat.id}" onchange="updateBulkDeleteButton('categories')"></td>
                    <td><strong>#${cat.id}</strong></td>
                    <td><strong>${cat.name}</strong></td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${cat.description || 'No description provided'}</td>
                    <td>
                        <div class="table-actions" style="justify-content: flex-end;">
                            <button class="action-btn edit" onclick="openEditCategoryModal(${cat.id}, '${cat.name.replace(/'/g, "\\'")}', '${(cat.description || '').replace(/'/g, "\\'")}')" title="Edit Category">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteCategory(${cat.id})" title="Delete Category">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function openAddCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('form-category-id').value = '';
    document.getElementById('category-modal-title').innerText = 'Add New Category';
    document.getElementById('category-modal').style.display = 'flex';
}

function openEditCategoryModal(id, name, desc) {
    document.getElementById('form-category-id').value = id;
    document.getElementById('form-category-name').value = name;
    document.getElementById('form-category-desc').value = desc;
    document.getElementById('category-modal-title').innerText = 'Edit Category';
    document.getElementById('category-modal').style.display = 'flex';
}

function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
}

function saveCategoryData(e) {
    e.preventDefault();
    const id = document.getElementById('form-category-id').value;
    const name = document.getElementById('form-category-name').value;
    const desc = document.getElementById('form-category-desc').value;

    const url = id ? `/admin/api/categories/update/${id}` : '/admin/api/categories/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ name: name, description: desc })
    })
        .then(res => res.json())
        .then(data => {
            closeCategoryModal();
            showToast(id ? 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে' : 'নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে');
            fetchCategories();
        })
        .catch(err => {
            console.error("Error saving category: ", err);
            showToast('ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteCategory(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?")) {
        fetch(`/admin/api/categories/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে');
                fetchCategories();
            })
            .catch(err => {
                console.error("Error deleting category: ", err);
                showToast('ক্যাটাগরি মুছতে সমস্যা হয়েছে');
            });
    }
}

// ==========================================
// Admin Exam Scheduling (Scheda Esame) CRUD
// ==========================================
let adminExamsData = [];

function loadAdminExamsList() {
    const tbody = document.getElementById('admin-exams-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading exams list...</td></tr>`;

    const searchInput = document.getElementById('admin-exam-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    fetch('/api/exams')
        .then(res => res.json())
        .then(data => {
            adminExamsData = data;
            tbody.innerHTML = '';

            const filtered = data.filter(ex => {
                return !searchVal ||
                    ex.student_name.toLowerCase().includes(searchVal) ||
                    ex.motorizzazione.toLowerCase().includes(searchVal) ||
                    ex.id.toString().includes(searchVal);
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No scheduled exams found.</td></tr>`;
                return;
            }

            filtered.forEach(ex => {
                const tr = document.createElement('tr');

                const statusBadge = ex.status === 'completed'
                    ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2);">Completed</span>`
                    : `<span class="badge" style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">Scheduled</span>`;

                const scoresText = ex.status === 'completed'
                    ? `C: <strong style="color: #4CAF50;">${ex.correct_count}</strong> | W: <strong style="color: #ef4444;">${ex.wrong_count}</strong> | U: <strong style="color: #f59e0b;">${ex.unanswered_count}</strong>`
                    : `<span style="color: var(--text-secondary); font-size:11px;">Not taken yet</span>`;

                tr.innerHTML = `
                            <td><strong>#${ex.id}</strong></td>
                            <td><strong>${ex.student_name}</strong></td>
                            <td>${ex.motorizzazione}</td>
                            <td>${ex.exam_date}</td>
                            <td style="text-align: center;">${statusBadge}</td>
                            <td style="text-align: center;">${scoresText}</td>
                            <td style="text-align: right;">
                                <button class="btn btn-danger btn-sm" onclick="deleteScheduledExam(${ex.id})" title="Delete Exam" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading admin exams: ", err);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading exams.</td></tr>`;
        });
}

function openAddExamModal() {
    document.getElementById('form-exam-student-name').value = '';
    document.getElementById('form-exam-motorizzazione').value = '';
    document.getElementById('form-exam-date').value = '';
    document.getElementById('exam-sched-modal').style.display = 'flex';
}

function closeExamModal() {
    document.getElementById('exam-sched-modal').style.display = 'none';
}

function saveScheduledExam(e) {
    e.preventDefault();
    const name = document.getElementById('form-exam-student-name').value;
    const center = document.getElementById('form-exam-motorizzazione').value;
    const dateVal = document.getElementById('form-exam-date').value;

    fetch('/admin/api/exams/store', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            student_name: name,
            motorizzazione: center,
            exam_date: dateVal
        })
    })
        .then(res => res.json())
        .then(data => {
            closeExamModal();
            showToast('নতুন প্রার্থীর পরীক্ষা সফলভাবে শিডিউল করা হয়েছে');
            loadAdminExamsList();
        })
        .catch(err => {
            console.error("Error saving scheduled exam: ", err);
            showToast('পরীক্ষা শিডিউল করতে সমস্যা হয়েছে');
        });
}

function deleteScheduledExam(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রার্থীর পরীক্ষা ডিলিট করতে চান?")) {
        fetch(`/admin/api/exams/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('প্রার্থীর পরীক্ষা সফলভাবে ডিলিট করা হয়েছে');
                loadAdminExamsList();
            })
            .catch(err => {
                console.error("Error deleting exam: ", err);
                showToast('পরীক্ষা ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// ==============================
// Banner Sliders Management CRUD
// ==============================
function fetchSliders() {
    const tbody = document.getElementById('sliders-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading sliders...</td></tr>`;

    fetch('/admin/api/sliders')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No sliders found.</td></tr>`;
                return;
            }

            data.forEach(slider => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${slider.id}</td>
                            <td style="text-align: center;">
                                <img src="${slider.image_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 6px;">
                            </td>
                            <td style="font-weight: bold; color: var(--text-primary);">${slider.title}</td>
                            <td>${slider.subtitle || ''}</td>
                            <td><code>${slider.link_url || ''}</code></td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditSliderModal(${JSON.stringify(slider).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteSlider(${slider.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading sliders: ", err);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading sliders.</td></tr>`;
        });
}

function openAddSliderModal() {
    document.getElementById('slider-modal-title').textContent = 'Add Banner Slider';
    document.getElementById('form-slider-id').value = '';
    document.getElementById('form-slider-title').value = '';
    document.getElementById('form-slider-subtitle').value = '';
    document.getElementById('form-slider-link').value = '';
    document.getElementById('form-slider-image').value = '';
    document.getElementById('slider-image-preview').style.display = 'none';
    document.getElementById('slider-modal').style.display = 'flex';
}

function openEditSliderModal(slider) {
    document.getElementById('slider-modal-title').textContent = 'Edit Banner Slider';
    document.getElementById('form-slider-id').value = slider.id;
    document.getElementById('form-slider-title').value = slider.title;
    document.getElementById('form-slider-subtitle').value = slider.subtitle || '';
    document.getElementById('form-slider-link').value = slider.link_url || '';
    document.getElementById('form-slider-image').value = '';

    if (slider.image_url) {
        document.getElementById('slider-preview-img').src = slider.image_url;
        document.getElementById('slider-image-preview').style.display = 'block';
    } else {
        document.getElementById('slider-image-preview').style.display = 'none';
    }
    document.getElementById('slider-modal').style.display = 'flex';
}

function closeSliderModal() {
    document.getElementById('slider-modal').style.display = 'none';
}

function saveSlider(e) {
    e.preventDefault();
    const id = document.getElementById('form-slider-id').value;
    const title = document.getElementById('form-slider-title').value;
    const subtitle = document.getElementById('form-slider-subtitle').value;
    const linkUrl = document.getElementById('form-slider-link').value;
    const imageFile = document.getElementById('form-slider-image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('link_url', linkUrl);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const url = id ? `/admin/api/sliders/update/${id}` : '/admin/api/sliders/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            closeSliderModal();
            showToast(id ? 'স্লাইডার সফলভাবে আপডেট করা হয়েছে' : 'নতুন স্লাইডার সফলভাবে তৈরি করা হয়েছে');
            fetchSliders();
        })
        .catch(err => {
            console.error("Error saving slider: ", err);
            showToast('স্লাইডার সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteSlider(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই স্লাইডারটি মুছে ফেলতে চান?")) {
        fetch(`/admin/api/sliders/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('স্লাইডার সফলভাবে ডিলিট করা হয়েছে');
                fetchSliders();
            })
            .catch(err => {
                console.error("Error deleting slider: ", err);
                showToast('স্লাইডার ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// ==============================
// Home Navigation Cards CRUD
// ==============================
function fetchHomeCards() {
    const tbody = document.getElementById('home-cards-table-body');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Loading cards...</td></tr>`;

    fetch('/admin/api/home-cards')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No cards found.</td></tr>`;
                return;
            }

            data.forEach(card => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${card.id}</td>
                            <td style="text-align: center; font-weight: 800; color: var(--accent-orange);">${card.order_index}</td>
                            <td style="text-align: center;">
                                <div style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background-color: ${card.icon_color}1a; color: ${card.icon_color}; font-size: 16px;">
                                    <i class="${card.icon_class}"></i>
                                </div>
                            </td>
                            <td style="font-weight: bold; color: var(--text-primary);">${card.title}</td>
                            <td>${card.subtitle || ''}</td>
                            <td><span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); border: 1px solid var(--border-color); font-weight: bold;">${card.screen_key}</span></td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditHomeCardModal(${JSON.stringify(card).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteHomeCard(${card.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading cards: ", err);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading cards.</td></tr>`;
        });
}

function openAddHomeCardModal() {
    document.getElementById('home-card-modal-title').textContent = 'Add Home Card';
    document.getElementById('form-home-card-id').value = '';
    document.getElementById('form-home-card-title').value = '';
    document.getElementById('form-home-card-subtitle').value = '';
    document.getElementById('form-home-card-screen').value = 'lezioni';
    document.getElementById('form-home-card-icon').value = 'fa-solid fa-video';
    document.getElementById('form-home-card-color').value = '#3B82F6';
    document.getElementById('form-home-card-order').value = '0';
    document.getElementById('home-card-modal').style.display = 'flex';
}

function openEditHomeCardModal(card) {
    document.getElementById('home-card-modal-title').textContent = 'Edit Home Card';
    document.getElementById('form-home-card-id').value = card.id;
    document.getElementById('form-home-card-title').value = card.title;
    document.getElementById('form-home-card-subtitle').value = card.subtitle || '';
    document.getElementById('form-home-card-screen').value = card.screen_key;
    document.getElementById('form-home-card-icon').value = card.icon_class;
    document.getElementById('form-home-card-color').value = card.icon_color || '#3B82F6';
    document.getElementById('form-home-card-order').value = card.order_index;
    document.getElementById('home-card-modal').style.display = 'flex';
}

function closeHomeCardModal() {
    document.getElementById('home-card-modal').style.display = 'none';
}

function saveHomeCard(e) {
    e.preventDefault();
    const id = document.getElementById('form-home-card-id').value;
    const title = document.getElementById('form-home-card-title').value;
    const subtitle = document.getElementById('form-home-card-subtitle').value;
    const screenKey = document.getElementById('form-home-card-screen').value;
    const iconClass = document.getElementById('form-home-card-icon').value;
    const iconColor = document.getElementById('form-home-card-color').value;
    const orderIndex = document.getElementById('form-home-card-order').value;

    const url = id ? `/admin/api/home-cards/update/${id}` : '/admin/api/home-cards/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            title: title,
            subtitle: subtitle,
            screen_key: screenKey,
            icon_class: iconClass,
            icon_color: iconColor,
            order_index: orderIndex
        })
    })
        .then(res => res.json())
        .then(data => {
            closeHomeCardModal();
            showToast(id ? 'কার্ড সফলভাবে আপডেট করা হয়েছে' : 'নতুন কার্ড সফলভাবে তৈরি করা হয়েছে');
            fetchHomeCards();
        })
        .catch(err => {
            console.error("Error saving card: ", err);
            showToast('কার্ড সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteHomeCard(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই কার্ডটি মুছে ফেলতে চান?")) {
        fetch(`/admin/api/home-cards/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('কার্ড সফলভাবে ডিলিট করা হয়েছে');
                fetchHomeCards();
            })
            .catch(err => {
                console.error("Error deleting card: ", err);
                showToast('কার্ড ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// ==============================
// Lecture Videos Management CRUD
// ==============================
function fetchLectureClasses() {
    const tbody = document.getElementById('classes-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading video lectures...</td></tr>`;

    fetch('/admin/api/classes')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No video lectures found.</td></tr>`;
                return;
            }

            data.forEach(cls => {
                const thumbHtml = cls.thumbnail_url
                    ? `<img src="${cls.thumbnail_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 6px;">`
                    : `<div style="width: 80px; height: 45px; background: var(--bg-page); display: flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 6px; border: 1px dashed var(--border-color); color: var(--text-secondary);">No thumb</div>`;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${cls.id}</td>
                            <td style="text-align: center;">${thumbHtml}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${cls.title}</td>
                            <td>${cls.duration || ''}</td>
                            <td><code>${cls.video_url || ''}</code></td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditClassModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLectureClass(${cls.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading classes: ", err);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading video lectures.</td></tr>`;
        });
}

function openAddClassModal() {
    document.getElementById('class-modal-title').textContent = 'Add Lecture Video';
    document.getElementById('form-class-id').value = '';
    document.getElementById('form-class-title').value = '';
    document.getElementById('form-class-duration').value = '';
    document.getElementById('form-class-url').value = '';
    document.getElementById('form-class-thumb').value = '';
    document.getElementById('class-thumb-preview').style.display = 'none';
    document.getElementById('class-modal').style.display = 'flex';
}

function openEditClassModal(cls) {
    document.getElementById('class-modal-title').textContent = 'Edit Lecture Video';
    document.getElementById('form-class-id').value = cls.id;
    document.getElementById('form-class-title').value = cls.title;
    document.getElementById('form-class-duration').value = cls.duration || '';
    document.getElementById('form-class-url').value = cls.video_url || '';
    document.getElementById('form-class-thumb').value = '';

    if (cls.thumbnail_url) {
        document.getElementById('class-preview-img').src = cls.thumbnail_url;
        document.getElementById('class-thumb-preview').style.display = 'block';
    } else {
        document.getElementById('class-thumb-preview').style.display = 'none';
    }
    document.getElementById('class-modal').style.display = 'flex';
}

function closeClassModal() {
    document.getElementById('class-modal').style.display = 'none';
}

function saveClass(e) {
    e.preventDefault();
    const id = document.getElementById('form-class-id').value;
    const title = document.getElementById('form-class-title').value;
    const duration = document.getElementById('form-class-duration').value;
    const videoUrl = document.getElementById('form-class-url').value;
    const thumbFile = document.getElementById('form-class-thumb').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('duration', duration);
    formData.append('video_url', videoUrl);
    if (thumbFile) {
        formData.append('thumbnail', thumbFile);
    }

    const url = id ? `/admin/api/classes/update/${id}` : '/admin/api/classes/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            closeClassModal();
            showToast(id ? 'ভিডিও লেকচার সফলভাবে আপডেট করা হয়েছে' : 'নতুন ভিডিও লেকচার সফলভাবে তৈরি করা হয়েছে');
            fetchLectureClasses();
        })
        .catch(err => {
            console.error("Error saving class: ", err);
            showToast('ভিডিও লেকচার সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteLectureClass(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই ভিডিও লেকচারটি মুছে ফেলতে চান?")) {
        fetch(`/admin/api/classes/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('ভিডিও লেকচার সফলভাবে ডিলিট করা হয়েছে');
                fetchLectureClasses();
            })
            .catch(err => {
                console.error("Error deleting class: ", err);
                showToast('ভিডিও লেকচার ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// ==============================
// Live Sessions Management CRUD
// ==============================
function fetchLiveClasses() {
    const tbody = document.getElementById('live-classes-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading live sessions...</td></tr>`;

    fetch('/admin/api/live-classes')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No live sessions scheduled.</td></tr>`;
                return;
            }

            data.forEach(cls => {
                const dateStr = new Date(cls.scheduled_at).toLocaleString('bn-BD', { hour12: true });
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${cls.id}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${cls.title}</td>
                            <td>${cls.subtitle || ''}</td>
                            <td style="font-weight: 700; color: var(--accent-teal);">${dateStr}</td>
                            <td><a href="${cls.room_link || '#'}" target="_blank" style="color: var(--accent-blue); text-decoration: underline; font-size: 11px;"><code>${cls.room_link || 'No Link'}</code></a></td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditLiveClassModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLiveClass(${cls.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading live classes: ", err);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading live sessions.</td></tr>`;
        });
}

function openAddLiveClassModal() {
    document.getElementById('live-class-modal-title').textContent = 'Schedule Live Session';
    document.getElementById('form-live-class-id').value = '';
    document.getElementById('form-live-class-title').value = '';
    document.getElementById('form-live-class-subtitle').value = '';
    document.getElementById('form-live-class-date').value = '';
    document.getElementById('form-live-class-link').value = '';
    document.getElementById('live-class-modal').style.display = 'flex';
}

function openEditLiveClassModal(cls) {
    document.getElementById('live-class-modal-title').textContent = 'Edit Live Session';
    document.getElementById('form-live-class-id').value = cls.id;
    document.getElementById('form-live-class-title').value = cls.title;
    document.getElementById('form-live-class-subtitle').value = cls.subtitle || '';

    // Format datetime-local input value (YYYY-MM-DDTHH:MM)
    let d = new Date(cls.scheduled_at);
    let formattedDate = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
    document.getElementById('form-live-class-date').value = formattedDate;
    document.getElementById('form-live-class-link').value = cls.room_link || '';
    document.getElementById('live-class-modal').style.display = 'flex';
}

// Global variables for pagination
let chapterPage = 1;
let pageTabCurrentPage = 1;
let mediaPage = 1;
let slidersPage = 1;
let homeCardsPage = 1;
let classesPage = 1;
let liveClassesPage = 1;

// CKEditor instances
let pageEditorInstance = null;
let chapterEditorInstance = null;

// Helper to check user permission
function verifyPermission(module) {
    // Can be expanded if checking role-based gates on frontend.
    // Backend handles gating securely via checkPermission middleware.
    return true;
}

// Initialize Editors and Dropdowns
document.addEventListener("DOMContentLoaded", () => {
    // Keep form-page-content as a normal textarea to support selection underlining and Ctrl+U
    if (document.querySelector('#form-chapter-desc')) {
        ClassicEditor.create(document.querySelector('#form-chapter-desc'))
            .then(editor => { chapterEditorInstance = editor; })
            .catch(err => console.error(err));
    }
    // Populate chapter select dropdowns dynamically
    loadChaptersData();

    // Listen for inputs changes to auto-update underlined words list
    const inputsToWatch = [
        'form-page-title-it',
        'form-page-title-bn',
        'form-page-content',
        'form-page-content-bn'
    ];
    inputsToWatch.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateUnderlinedWordsList);
            el.addEventListener('change', updateUnderlinedWordsList);
        }
    });
});

// Tab switching inside Chapters & Pages settings
function switchAdminSubTab(tab) {
    const btnChapters = document.getElementById('tab-btn-chapters');
    const btnPages = document.getElementById('tab-btn-pages');
    const subPanelChapters = document.getElementById('admin-sub-panel-chapters');
    const subPanelPages = document.getElementById('admin-sub-panel-pages');

    if (tab === 'chapters') {
        btnChapters.style.backgroundColor = 'var(--accent-orange)';
        btnChapters.style.color = 'white';
        btnChapters.classList.remove('btn-secondary');
        btnPages.classList.add('btn-secondary');
        btnPages.style.backgroundColor = 'transparent';
        btnPages.style.color = 'var(--text-secondary)';

        subPanelChapters.style.display = 'block';
        subPanelPages.style.display = 'none';
        fetchChaptersAdmin(1);
    } else {
        btnPages.style.backgroundColor = 'var(--accent-orange)';
        btnPages.style.color = 'white';
        btnPages.classList.remove('btn-secondary');
        btnChapters.classList.add('btn-secondary');
        btnChapters.style.backgroundColor = 'transparent';
        btnChapters.style.color = 'var(--text-secondary)';

        subPanelChapters.style.display = 'none';
        subPanelPages.style.display = 'block';
        const chapterId = document.getElementById('admin-page-chapter-select').value;
        if (chapterId) {
            loadAdminPagesForSelectedChapter(chapterId, 1);
        }
    }
}

// ==============================
// 1. CHAPTERS CRUD FUNCTIONS
// ==============================
function fetchChaptersAdmin(page = 1) {
    chapterPage = page;
    const search = document.getElementById('chapter-search').value;
    const perPage = document.getElementById('chapter-per-page').value;
    const tbody = document.getElementById('admin-chapters-table-body');

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px;">Loading chapters...</td></tr>`;

    const masterSelect = document.getElementById('bulk-select-chapters');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('chapters');

    fetch(`/admin/api/chapters/list?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            if (typeof selectAllAcrossPagesFlag !== 'undefined') {
                selectAllAcrossPagesFlag['chapters'] = false;
            }
            chaptersTotalCount = data.total || 0;
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No chapters found.</td></tr>`;
                return;
            }

            data.data.forEach(ch => {
                const coverUrl = ch.cover_image || ch.image;
                const thumb = coverUrl
                    ? `<img src="${coverUrl}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;" onerror="this.src='/images/signs/generic_pericolo.png'">`
                    : `<div style="width: 50px; height: 35px; background: var(--bg-page); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--text-secondary);">None</div>`;

                const statusChecked = ch.status ? 'checked' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td style="text-align: center;"><input type="checkbox" class="select-chapter-checkbox" value="${ch.id}" onchange="updateBulkDeleteButton('chapters')"></td>
                            <td>${ch.id}</td>
                            <td style="text-align: center; font-weight: bold; color: var(--accent-orange);">${ch.chapter_number || ch.id}</td>
                            <td style="text-align: center;">${thumb}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${ch.name}</td>
                            <td>${ch.bn_name || ''}</td>
                            <td style="text-align: center; font-weight: bold;">${ch.question_count || 0}</td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="toggleChapterStatus(${ch.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditChapterModal(${ch.id}, ${JSON.stringify(ch).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-primary btn-sm" onclick="viewChapterPages(${ch.id})" style="padding: 4px 8px; font-size: 11px; background-color: var(--accent-teal); border-color: var(--accent-teal);"><i class="fa-solid fa-file-lines"></i> Pages</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteChapter(${ch.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                // Switch checked toggle styling
                const switchSlider = tr.querySelector('.slider');
                if (ch.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('chapter-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-chapter-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-chapter-next').disabled = !data.next_page_url;
        });
}

function prevChapterPage() {
    if (chapterPage > 1) fetchChaptersAdmin(chapterPage - 1);
}

function nextChapterPage() {
    fetchChaptersAdmin(chapterPage + 1);
}

function viewChapterPages(chapterId) {
    document.getElementById('admin-page-chapter-select').value = chapterId;
    switchAdminSubTab('pages');
}

function toggleChapterStatus(id) {
    fetch(`/admin/api/chapters/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('অধ্যায়ের স্ট্যাটাস পরিবর্তন করা হয়েছে');
            fetchChaptersAdmin(chapterPage);
        });
}

function openAddChapterModal() {
    document.getElementById('chapter-modal-title').textContent = 'Add New Chapter';
    document.getElementById('form-chapter-crud-id').value = '';
    document.getElementById('form-chapter-category-id').value = '2';
    document.getElementById('form-chapter-number').value = '';
    document.getElementById('form-chapter-name-it').value = '';
    document.getElementById('form-chapter-name-bn').value = '';
    document.getElementById('form-chapter-cover-file').value = '';
    document.getElementById('chapter-cover-preview-container').style.display = 'none';
    if (chapterEditorInstance) chapterEditorInstance.setData('');
    document.getElementById('chapter-modal').style.display = 'flex';
}

function openEditChapterModal(id, ch) {
    document.getElementById('chapter-modal-title').textContent = 'Edit Chapter';
    document.getElementById('form-chapter-crud-id').value = ch.id;
    document.getElementById('form-chapter-category-id').value = ch.category_id || '2';
    document.getElementById('form-chapter-number').value = ch.chapter_number || ch.id;
    document.getElementById('form-chapter-name-it').value = ch.name;
    document.getElementById('form-chapter-name-bn').value = ch.bn_name || '';
    document.getElementById('form-chapter-cover-file').value = '';

    if (ch.cover_image) {
        document.getElementById('chapter-cover-preview-img').src = ch.cover_image;
        document.getElementById('chapter-cover-preview-container').style.display = 'block';
    } else {
        document.getElementById('chapter-cover-preview-container').style.display = 'none';
    }

    if (chapterEditorInstance) {
        chapterEditorInstance.setData(ch.description || '');
    }

    document.getElementById('chapter-modal').style.display = 'flex';
}

function closeChapterModal() {
    document.getElementById('chapter-modal').style.display = 'none';
}

function saveChapter(e) {
    e.preventDefault();
    const id = document.getElementById('form-chapter-crud-id').value;
    const categoryId = document.getElementById('form-chapter-category-id').value;
    const number = document.getElementById('form-chapter-number').value;
    const nameIt = document.getElementById('form-chapter-name-it').value;
    const nameBn = document.getElementById('form-chapter-name-bn').value;

    const coverFile = document.getElementById('form-chapter-cover-file').files[0];

    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('name', nameIt);
    formData.append('bn_name', nameBn);
    formData.append('chapter_number', number);

    if (coverFile) formData.append('cover_image', coverFile);

    const url = id ? `/admin/api/chapters/update/${id}` : '/admin/api/chapters/store';

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Validation error');
                });
            }
            return res.json();
        })
        .then(data => {
            closeChapterModal();
            Swal.fire({
                title: 'Success!',
                text: id ? 'Chapter has been updated successfully.' : 'New chapter created successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            fetchChaptersAdmin(chapterPage);
            loadChaptersData();
            fetchStats();
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: err.message || 'অধ্যায় সংরক্ষণ করতে সমস্যা হয়েছে',
                icon: 'error'
            });
        });
}

function deleteChapter(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Deleting this chapter will also delete all of its pages! This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/chapters/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Chapter and its pages have been deleted.', 'success');
                    fetchChaptersAdmin(chapterPage);
                    loadChaptersData();
                    fetchStats();
                })
                .catch(err => showToast('অধ্যায় ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// ==============================
// 2. PAGES CRUD FUNCTIONS
// ==============================
function loadAdminPagesForSelectedChapter(chapterId, page = 1) {
    if (!chapterId) return;
    pageTabCurrentPage = page;
    const search = document.getElementById('page-search').value;
    const perPage = document.getElementById('page-per-page').value;
    const tbody = document.getElementById('admin-pages-table-body');

    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 30px;">Loading pages...</td></tr>`;

    const masterSelect = document.getElementById('bulk-select-pages');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('pages');

    fetch(`/admin/api/chapters/${chapterId}/pages/list?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            if (typeof selectAllAcrossPagesFlag !== 'undefined') {
                selectAllAcrossPagesFlag['pages'] = false;
            }
            pagesTotalCount = data.total || 0;
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-secondary); padding: 30px;">No pages found in this chapter.</td></tr>`;
                return;
            }

            data.data.forEach(p => {
                const hasImg = p.image
                    ? `<i class="fa-solid fa-image" style="color: var(--accent-teal);" title="Image included"></i>`
                    : `<i class="fa-solid fa-minus" style="opacity: 0.3;"></i>`;
                const hasAudio = p.audio
                    ? `<i class="fa-solid fa-volume-high" style="color: var(--accent-blue);" title="Audio voiceover available"></i>`
                    : `<i class="fa-solid fa-minus" style="opacity: 0.3;"></i>`;
                const hasPdf = p.pdf_path
                    ? `<a href="${p.pdf_path}" target="_blank" style="color: var(--accent-red);"><i class="fa-solid fa-file-pdf"></i></a>`
                    : `<i class="fa-solid fa-minus" style="opacity: 0.3;"></i>`;

                const statusChecked = p.status ? 'checked' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td style="text-align: center;"><input type="checkbox" class="select-page-checkbox" value="${p.id}" onchange="updateBulkDeleteButton('pages')"></td>
                            <td>${p.id}</td>
                            <td style="text-align: center; font-weight: bold; color: var(--text-secondary);">${p.sort_order}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${p.title}</td>
                            <td>${p.bn_title || ''}</td>
                            <td style="text-align: center;">${hasImg}</td>
                            <td style="text-align: center;">${hasAudio}</td>
                            <td style="text-align: center;">${hasPdf}</td>
                            <td style="text-align: center; font-weight: bold; color: var(--accent-teal);">${p.questions_count || 0}</td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="togglePageStatus(${p.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditPageModal(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deletePage(${p.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                const switchSlider = tr.querySelector('.slider');
                if (p.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('page-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-page-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-page-next').disabled = !data.next_page_url;
        });
}

function prevPageTab() {
    const chapterId = document.getElementById('admin-page-chapter-select').value;
    if (pageTabCurrentPage > 1 && chapterId) {
        loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage - 1);
    }
}

function nextPageTab() {
    const chapterId = document.getElementById('admin-page-chapter-select').value;
    if (chapterId) {
        loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage + 1);
    }
}

function togglePageStatus(id) {
    fetch(`/admin/api/pages/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('পেইজের স্ট্যাটাস পরিবর্তন করা হয়েছে');
            const chapterId = document.getElementById('admin-page-chapter-select').value;
            loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
        });
}

function openAddPageModal() {
    const chapterSelect = document.getElementById('admin-page-chapter-select');
    if (!chapterSelect || chapterSelect.selectedIndex < 0) {
        Swal.fire('Error', 'Please select a chapter first.', 'error');
        return;
    }
    const chapterId = chapterSelect.value;
    const chapterName = chapterSelect.options[chapterSelect.selectedIndex].text;

    document.getElementById('page-modal-title').textContent = 'Add New Page';
    document.getElementById('form-page-crud-id').value = '';
    document.getElementById('form-page-chapter-id').value = chapterId;
    document.getElementById('form-page-chapter-name-display').value = chapterName;
    document.getElementById('form-page-order').value = '0';
    const titleItEl = document.getElementById('form-page-title-it');
    if (titleItEl) titleItEl.value = '';
    const titleBnEl = document.getElementById('form-page-title-bn');
    if (titleBnEl) titleBnEl.value = '';

    document.getElementById('page-modal').style.display = 'flex';
}

function openEditPageModal(p) {
    const chapterSelect = document.getElementById('admin-page-chapter-select');
    const chapterName = chapterSelect.querySelector(`option[value="${p.chapter_id}"]`)?.text || (chapterSelect.selectedIndex >= 0 ? chapterSelect.options[chapterSelect.selectedIndex].text : '');

    document.getElementById('page-modal-title').textContent = 'Edit Page Details';
    document.getElementById('form-page-crud-id').value = p.id;
    document.getElementById('form-page-chapter-id').value = p.chapter_id;
    document.getElementById('form-page-chapter-name-display').value = chapterName;
    document.getElementById('form-page-order').value = p.sort_order || 0;
    const titleItEl2 = document.getElementById('form-page-title-it');
    if (titleItEl2) titleItEl2.value = p.title;
    const titleBnEl2 = document.getElementById('form-page-title-bn');
    if (titleBnEl2) titleBnEl2.value = p.bn_title || '';

    document.getElementById('page-modal').style.display = 'flex';
}

function closePageModal() {
    document.getElementById('page-modal').style.display = 'none';
}

function savePage(e) {
    e.preventDefault();
    const id = document.getElementById('form-page-crud-id').value;
    const chapterId = document.getElementById('form-page-chapter-id').value;
    const order = document.getElementById('form-page-order').value;
    const titleIt = document.getElementById('form-page-title-it')?.value?.trim() || 'Page';
    const titleBn = document.getElementById('form-page-title-bn')?.value?.trim() || titleIt;

    const formData = new FormData();
    formData.append('chapter_id', chapterId);
    formData.append('sort_order', order);
    formData.append('title', titleIt);
    formData.append('bn_title', titleBn);
    formData.append('mcqs', '[]');

    const url = id ? `/admin/api/pages/update/${id}` : '/admin/api/pages/store';

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Validation error');
                });
            }
            return res.json();
        })
        .then(data => {
            closePageModal();
            Swal.fire({
                title: 'Success!',
                text: id ? 'Page details updated successfully.' : 'New page added successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
            fetchStats();
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: err.message || 'পেইজ সংরক্ষণ করতে সমস্যা হয়েছে',
                icon: 'error'
            });
        });
}

function deletePage(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this page and its uploaded files?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/pages/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Page has been deleted.', 'success');
                    const chapterId = document.getElementById('admin-page-chapter-select').value;
                    loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
                    fetchStats();
                })
                .catch(err => showToast('পেইজ ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// Assign Questions Map modal trigger helper
function openAssignQuestionsModal(pageId) {
    // Simple mockup interaction since question mappings can be extensive
    Swal.fire({
        title: 'Assign MCQ Questions',
        text: 'This links MCQ database questions to this page for structured study.',
        input: 'text',
        inputPlaceholder: 'Enter comma separated question IDs (e.g. 104, 105, 230)',
        showCancelButton: true,
        confirmButtonText: 'Assign Mapping',
        showLoaderOnConfirm: true,
        preConfirm: (qIdsStr) => {
            if (!qIdsStr) return;
            const ids = qIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            return fetch(`/admin/api/pages/${pageId}/assign-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ question_ids: ids })
            })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    return res.json();
                })
                .catch(error => {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Mapped!', 'Questions assigned to page successfully.', 'success');
            const chapterId = document.getElementById('admin-page-chapter-select').value;
            loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
        }
    });
}

// ==============================
// 3. FILE MANAGER FUNCTIONS
// ==============================
function fetchMediaFiles(page = 1) {
    mediaPage = page;
    const search = document.getElementById('media-search').value;
    const type = document.getElementById('media-filter-type').value;
    const perPage = document.getElementById('media-per-page').value;
    const tbody = document.getElementById('media-table-body');

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Scanning media directory...</td></tr>`;

    fetch(`/admin/api/media?page=${page}&search=${search}&type=${type}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No media files uploaded yet.</td></tr>`;
                return;
            }

            data.data.forEach(file => {
                let previewHtml = '';
                if (file.filetype === 'image') {
                    previewHtml = `<img src="${file.filepath}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;" onclick="previewMediaAsset('${file.filepath}', 'image')">`;
                } else if (file.filetype === 'pdf') {
                    previewHtml = `<i class="fa-solid fa-file-pdf" style="font-size: 24px; color: var(--accent-red);" onclick="previewMediaAsset('${file.filepath}', 'pdf')"></i>`;
                } else if (file.filetype === 'audio') {
                    previewHtml = `<i class="fa-solid fa-volume-high" style="font-size: 24px; color: var(--accent-blue);" onclick="previewMediaAsset('${file.filepath}', 'audio')"></i>`;
                } else if (file.filetype === 'video') {
                    previewHtml = `<i class="fa-solid fa-circle-play" style="font-size: 24px; color: var(--accent-teal);" onclick="previewMediaAsset('${file.filepath}', 'video')"></i>`;
                } else {
                    previewHtml = `<i class="fa-solid fa-file" style="font-size: 24px; color: var(--text-secondary);"></i>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${file.id}</td>
                            <td style="text-align: center;">${previewHtml}</td>
                            <td style="font-weight: bold; color: var(--text-primary); word-break: break-all;">${file.filename}</td>
                            <td style="text-align: center;"><span class="badge" style="background-color: var(--bg-page); color: var(--text-secondary);">${file.filetype.toUpperCase()}</span></td>
                            <td>${(file.filesize / 1024 / 1024).toFixed(2)} MB</td>
                            <td>${new Date(file.created_at).toLocaleDateString()}</td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="copyMediaLink('${file.filepath}')" style="padding: 4px 8px; font-size: 11px;" title="Copy path to clipboard"><i class="fa-solid fa-copy"></i> Copy Link</button>
                                <button class="btn btn-secondary btn-sm" onclick="openRenameMediaModal(${file.id}, '${file.filename}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Rename</button>
                                <a href="/admin/api/media/download/${file.id}" class="btn btn-primary btn-sm" style="padding: 4px 8px; font-size: 11px; background-color: var(--accent-teal); border-color: var(--accent-teal);"><i class="fa-solid fa-download"></i></a>
                                <button class="btn btn-danger btn-sm" onclick="deleteMedia(${file.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('media-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-media-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-media-next').disabled = !data.next_page_url;
        });
}

function prevMediaPage() {
    if (mediaPage > 1) fetchMediaFiles(mediaPage - 1);
}

function nextMediaPage() {
    fetchMediaFiles(mediaPage + 1);
}

// Drag & Drop Upload
function handleMediaDrop(e) {
    e.preventDefault();
    document.getElementById('media-dropzone').style.borderColor = 'var(--border-color)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFilesSequentially(files);
    }
}

function handleMediaBrowse(e) {
    const files = e.target.files;
    if (files.length > 0) {
        uploadFilesSequentially(files);
    }
}

function uploadFilesSequentially(files) {
    let index = 0;

    function nextUpload() {
        if (index < files.length) {
            uploadMediaFile(files[index], () => {
                index++;
                nextUpload();
            });
        } else {
            fetchMediaFiles(mediaPage);
            fetchStats();
            showToast('ফাইল আপলোড সম্পূর্ণ হয়েছে');
        }
    }

    nextUpload();
}

function uploadMediaFile(file, callback) {
    const progressContainer = document.getElementById('upload-progress-container');
    const filenameEl = document.getElementById('upload-filename');
    const percentageEl = document.getElementById('upload-percentage');
    const progressBar = document.getElementById('upload-progress-bar');

    progressContainer.style.display = 'block';
    filenameEl.textContent = file.name;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/api/media/store');

    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            percentageEl.textContent = percent + '%';
        }
    });

    xhr.onload = function () {
        progressBar.style.width = '0%';
        percentageEl.textContent = '0%';
        progressContainer.style.display = 'none';
        if (callback) callback();
    };

    xhr.onerror = function () {
        showToast('ফাইল আপলোড করতে সমস্যা হয়েছে');
        progressContainer.style.display = 'none';
        if (callback) callback();
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('_token', csrfToken);

    xhr.send(formData);
}

function openRenameMediaModal(id, currentName) {
    document.getElementById('form-rename-media-id').value = id;
    document.getElementById('form-rename-media-name').value = currentName;
    document.getElementById('rename-media-modal').style.display = 'flex';
}

function closeRenameMediaModal() {
    document.getElementById('rename-media-modal').style.display = 'none';
}

function saveRenameMedia(e) {
    e.preventDefault();
    const id = document.getElementById('form-rename-media-id').value;
    const newName = document.getElementById('form-rename-media-name').value;

    fetch(`/admin/api/media/rename/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ filename: newName })
    })
        .then(res => res.json())
        .then(data => {
            closeRenameMediaModal();
            showToast('ফাইলের নাম পরিবর্তন করা হয়েছে');
            fetchMediaFiles(mediaPage);
        });
}

function deleteMedia(id) {
    Swal.fire({
        title: 'Delete Asset?',
        text: "Are you sure you want to permanently delete this media file from disk storage?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete permanently'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/media/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'File removed from library.', 'success');
                    fetchMediaFiles(mediaPage);
                    fetchStats();
                })
                .catch(err => showToast('ফাইল ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

function copyMediaLink(path) {
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url).then(() => {
        showToast('লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
    });
}

function previewMediaAsset(filepath, type) {
    if (type === 'image') {
        Swal.fire({
            imageUrl: filepath,
            imageAlt: 'Preview image',
            showConfirmButton: false
        });
    } else if (type === 'pdf') {
        window.open(filepath, '_blank');
    } else if (type === 'audio') {
        Swal.fire({
            title: 'Audio Preview',
            html: `<audio src="${filepath}" controls style="width: 100%; margin-top: 10px;"></audio>`,
            showConfirmButton: false
        });
    } else if (type === 'video') {
        Swal.fire({
            title: 'Video Preview',
            html: `<video src="${filepath}" controls style="width: 100%; border-radius: 8px; margin-top: 10px;"></video>`,
            showConfirmButton: false
        });
    }
}

// ==============================
// 4. SLIDERS CRUD FUNCTIONS
// ==============================
function fetchSliders(page = 1) {
    slidersPage = page;
    const search = document.getElementById('sliders-search').value;
    const perPage = document.getElementById('sliders-per-page').value;
    const tbody = document.getElementById('sliders-table-body');

    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">Loading sliders...</td></tr>`;

    fetch(`/admin/api/sliders?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">No sliders found.</td></tr>`;
                return;
            }

            data.data.forEach(sl => {
                const img = sl.image_url
                    ? `<img src="${sl.image_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 6px;">`
                    : `<div style="width: 80px; height: 45px; background: var(--bg-page); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px;">No Image</div>`;

                const statusChecked = sl.status ? 'checked' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${sl.id}</td>
                            <td style="text-align: center;">${img}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${sl.title}</td>
                            <td>${sl.subtitle || ''}</td>
                            <td><code>${sl.link_url || ''}</code></td>
                            <td style="text-align: center; font-weight: bold;">${sl.order_index}</td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="toggleSliderStatus(${sl.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditSliderModal(${JSON.stringify(sl).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteSlider(${sl.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                const switchSlider = tr.querySelector('.slider');
                if (sl.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('sliders-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-sliders-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-sliders-next').disabled = !data.next_page_url;
        });
}

function prevSlidersPage() {
    if (slidersPage > 1) fetchSliders(slidersPage - 1);
}

function nextSlidersPage() {
    fetchSliders(slidersPage + 1);
}

function toggleSliderStatus(id) {
    fetch(`/admin/api/sliders/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('স্লাইডার সক্রিয়তা পরিবর্তন করা হয়েছে');
            fetchSliders(slidersPage);
        });
}

function deleteSlider(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete this slider slide?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/sliders/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Slider has been deleted.', 'success');
                    fetchSliders(slidersPage);
                    fetchStats();
                })
                .catch(err => showToast('স্লাইডার ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// ==============================
// 5. HOME CARDS CRUD FUNCTIONS
// ==============================
function fetchHomeCards(page = 1) {
    homeCardsPage = page;
    const search = document.getElementById('home-cards-search').value;
    const perPage = document.getElementById('home-cards-per-page').value;
    const tbody = document.getElementById('home-cards-table-body');

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px;">Loading navigation cards...</td></tr>`;

    fetch(`/admin/api/home-cards?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No home cards found.</td></tr>`;
                return;
            }

            data.data.forEach(card => {
                let iconHtml = '';
                if (card.icon_url) {
                    iconHtml = `<img src="${card.icon_url}" style="width: 30px; height: 30px; object-fit: contain; border-radius: 4px;">`;
                } else {
                    iconHtml = `<i class="${card.icon_class}" style="color: ${card.color || '#3B82F6'}; font-size: 20px;"></i>`;
                }

                const statusChecked = card.status ? 'checked' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${card.id}</td>
                            <td style="text-align: center; font-weight: bold;">${card.order_index}</td>
                            <td style="text-align: center;">${iconHtml}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${card.title}</td>
                            <td>${card.subtitle || card.description || ''}</td>
                            <td><code>${card.link || card.screen_key}</code></td>
                            <td style="text-align: center;"><div style="width: 20px; height: 20px; border-radius: 4px; background-color: ${card.color || '#3B82F6'}; margin: 0 auto; border: 1px solid var(--border-color);"></div></td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="toggleHomeCardStatus(${card.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditHomeCardModal(${JSON.stringify(card).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteHomeCard(${card.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                const switchSlider = tr.querySelector('.slider');
                if (card.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('home-cards-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-home-cards-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-home-cards-next').disabled = !data.next_page_url;
        });
}

function prevHomeCardsPage() {
    if (homeCardsPage > 1) fetchHomeCards(homeCardsPage - 1);
}

function nextHomeCardsPage() {
    fetchHomeCards(homeCardsPage + 1);
}

function toggleHomeCardStatus(id) {
    fetch(`/admin/api/home-cards/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('কার্ড স্ট্যাটাস পরিবর্তন করা হয়েছে');
            fetchHomeCards(homeCardsPage);
        });
}

function deleteHomeCard(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete this home navigation card?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/home-cards/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Home card deleted successfully.', 'success');
                    fetchHomeCards(homeCardsPage);
                })
                .catch(err => showToast('কার্ড ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// ==============================
// 6. LECTURE VIDEOS FUNCTIONS
// ==============================
function fetchLectureClasses(page = 1) {
    classesPage = page;
    const search = document.getElementById('classes-search').value;
    const perPage = document.getElementById('classes-per-page').value;
    const tbody = document.getElementById('classes-table-body');

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Loading video lectures...</td></tr>`;

    fetch(`/admin/api/classes?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No video lectures found.</td></tr>`;
                return;
            }

            data.data.forEach(cls => {
                const thumbHtml = cls.thumbnail_url
                    ? `<img src="${cls.thumbnail_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 6px;">`
                    : `<div style="width: 80px; height: 45px; background: var(--bg-page); display: flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 6px; border: 1px dashed var(--border-color); color: var(--text-secondary);">No thumb</div>`;

                const statusChecked = cls.status ? 'checked' : '';
                const pathString = cls.video_path || cls.video_url || '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${cls.id}</td>
                            <td style="text-align: center;">${thumbHtml}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${cls.title}</td>
                            <td>${cls.duration || ''}</td>
                            <td><code>${pathString}</code></td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="toggleLectureClassStatus(${cls.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditClassModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLectureClass(${cls.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                const switchSlider = tr.querySelector('.slider');
                if (cls.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('classes-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-classes-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-classes-next').disabled = !data.next_page_url;
        });
}

function prevClassesPage() {
    if (classesPage > 1) fetchLectureClasses(classesPage - 1);
}

function nextClassesPage() {
    fetchLectureClasses(classesPage + 1);
}

function toggleLectureClassStatus(id) {
    fetch(`/admin/api/classes/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('ভিডিও সক্রিয়তা পরিবর্তন করা হয়েছে');
            fetchLectureClasses(classesPage);
        });
}

function deleteLectureClass(id) {
    Swal.fire({
        title: 'Delete Video Lecture?',
        text: "Do you want to delete this lecture video permanently?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/classes/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Lecture video has been deleted.', 'success');
                    fetchLectureClasses(classesPage);
                    fetchStats();
                })
                .catch(err => showToast('ভিডিও ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// ==============================
// 7. LIVE SESSION FUNCTIONS
// ==============================
function fetchLiveClasses(page = 1) {
    liveClassesPage = page;
    const search = document.getElementById('live-classes-search').value;
    const perPage = document.getElementById('live-classes-per-page').value;
    const tbody = document.getElementById('live-classes-table-body');

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Loading live sessions...</td></tr>`;

    fetch(`/admin/api/live-classes?page=${page}&search=${search}&per_page=${perPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No live sessions scheduled.</td></tr>`;
                return;
            }

            data.data.forEach(cls => {
                const dateStr = new Date(cls.scheduled_at).toLocaleString('bn-BD', { hour12: true });
                const statusChecked = cls.status ? 'checked' : '';
                const linkStr = cls.room_link || cls.zoom_link || cls.meet_link || '#';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${cls.id}</td>
                            <td style="font-weight: bold; color: var(--text-primary);">${cls.title}</td>
                            <td>${cls.speaker_name || cls.subtitle || 'General Instructor'}</td>
                            <td style="font-weight: 700; color: var(--accent-teal);">${dateStr}</td>
                            <td><a href="${linkStr}" target="_blank" style="color: var(--accent-blue); text-decoration: underline; font-size: 11px;"><code>Room Link</code></a></td>
                            <td style="text-align: center;">
                                <label class="status-switch" style="display: inline-block; width: 40px; height: 20px; position: relative;">
                                    <input type="checkbox" ${statusChecked} onclick="toggleLiveClassStatus(${cls.id})" style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </td>
                            <td style="text-align: right;">
                                <button class="btn btn-secondary btn-sm" onclick="openEditLiveClassModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLiveClass(${cls.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                const switchSlider = tr.querySelector('.slider');
                if (cls.status) {
                    switchSlider.style.backgroundColor = 'var(--accent-teal)';
                }
                tbody.appendChild(tr);
            });

            // Pagination status
            document.getElementById('live-classes-pagination-status').textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            document.getElementById('btn-live-classes-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-live-classes-next').disabled = !data.next_page_url;
        });
}

function prevLiveClassesPage() {
    if (liveClassesPage > 1) fetchLiveClasses(liveClassesPage - 1);
}

function nextLiveClassesPage() {
    fetchLiveClasses(liveClassesPage + 1);
}

function toggleLiveClassStatus(id) {
    fetch(`/admin/api/live-classes/toggle-status/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast('লাইভ সেশন সক্রিয়তা পরিবর্তন করা হয়েছে');
            fetchLiveClasses(liveClassesPage);
        });
}

function openAddLiveClassModal() {
    document.getElementById('live-class-modal-title').textContent = 'Schedule Live Session';
    document.getElementById('form-live-class-id').value = '';
    document.getElementById('form-live-class-title').value = '';
    document.getElementById('form-live-class-subtitle').value = '';
    document.getElementById('form-live-class-speaker').value = '';
    document.getElementById('form-live-class-desc').value = '';
    document.getElementById('form-live-class-date').value = '';
    document.getElementById('form-live-class-link').value = '';
    document.getElementById('form-live-class-zoom').value = '';
    document.getElementById('form-live-class-meet').value = '';
    document.getElementById('form-live-class-live').value = '';
    document.getElementById('form-live-class-thumb').value = '';
    document.getElementById('live-thumb-preview-container').style.display = 'none';
    document.getElementById('live-class-modal').style.display = 'flex';
}

function openEditLiveClassModal(cls) {
    document.getElementById('live-class-modal-title').textContent = 'Edit Live Session';
    document.getElementById('form-live-class-id').value = cls.id;
    document.getElementById('form-live-class-title').value = cls.title;
    document.getElementById('form-live-class-subtitle').value = cls.subtitle || '';
    document.getElementById('form-live-class-speaker').value = cls.speaker_name || '';
    document.getElementById('form-live-class-desc').value = cls.description || '';

    let d = new Date(cls.scheduled_at);
    let formattedDate = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
    document.getElementById('form-live-class-date').value = formattedDate;
    document.getElementById('form-live-class-link').value = cls.room_link || '';
    document.getElementById('form-live-class-zoom').value = cls.zoom_link || '';
    document.getElementById('form-live-class-meet').value = cls.meet_link || '';
    document.getElementById('form-live-class-live').value = cls.live_url || '';

    if (cls.thumbnail_url) {
        document.getElementById('live-thumb-preview-img').src = cls.thumbnail_url;
        document.getElementById('live-thumb-preview-container').style.display = 'block';
    } else {
        document.getElementById('live-thumb-preview-container').style.display = 'none';
    }

    document.getElementById('live-class-modal').style.display = 'flex';
}

function closeLiveClassModal() {
    document.getElementById('live-class-modal').style.display = 'none';
}

function saveLiveClass(e) {
    e.preventDefault();
    const id = document.getElementById('form-live-class-id').value;
    const title = document.getElementById('form-live-class-title').value;
    const subtitle = document.getElementById('form-live-class-subtitle').value;
    const speaker = document.getElementById('form-live-class-speaker').value;
    const desc = document.getElementById('form-live-class-desc').value;
    const scheduledAt = document.getElementById('form-live-class-date').value;
    const roomLink = document.getElementById('form-live-class-link').value;
    const zoomLink = document.getElementById('form-live-class-zoom').value;
    const meetLink = document.getElementById('form-live-class-meet').value;
    const liveUrl = document.getElementById('form-live-class-live').value;
    const thumbFile = document.getElementById('form-live-class-thumb').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('speaker_name', speaker);
    formData.append('description', desc);
    formData.append('scheduled_at', scheduledAt);
    formData.append('room_link', roomLink);
    formData.append('zoom_link', zoomLink);
    formData.append('meet_link', meetLink);
    formData.append('live_url', liveUrl);

    if (thumbFile) formData.append('thumbnail', thumbFile);

    const url = id ? `/admin/api/live-classes/update/${id}` : '/admin/api/live-classes/store';

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            closeLiveClassModal();
            Swal.fire({
                title: 'Success!',
                text: id ? 'Live class has been updated successfully.' : 'New live class scheduled successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            fetchLiveClasses(liveClassesPage);
            fetchStats();
        })
        .catch(err => {
            console.error(err);
            showToast('লাইভ সেশন সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteLiveClass(id) {
    Swal.fire({
        title: 'Cancel Live Session?',
        text: "Do you want to delete this live class session?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/live-classes/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Live session has been deleted.', 'success');
                    fetchLiveClasses(liveClassesPage);
                    fetchStats();
                })
                .catch(err => showToast('লাইভ সেশন ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

// ==========================================
// SYSTEM DIAGNOSTICS & MONITORING JAVASCRIPT
// ==========================================

let sysErrorsPage = 1;
let sysApiPage = 1;
let sysLogsPage = 1;

// --- 1. ERROR LOGS MODULE ---
function fetchSystemErrors(page = 1) {
    sysErrorsPage = page;
    const search = document.getElementById('sys-errors-search').value;
    const perPage = document.getElementById('sys-errors-per-page').value;

    let url = `/admin/api/system/errors?page=${sysErrorsPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderSystemErrorsTable(data.data);

            // Update pagination controls
            document.getElementById('sys-errors-pagination-status').textContent =
                `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;

            document.getElementById('btn-sys-errors-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-sys-errors-next').disabled = !data.next_page_url;
        })
        .catch(err => {
            console.error("Error loading system errors:", err);
            showToast('সিস্টেম এরর লগ লোড করতে সমস্যা হয়েছে');
        });
}

function prevSysErrorsPage() {
    if (sysErrorsPage > 1) fetchSystemErrors(sysErrorsPage - 1);
}

function nextSysErrorsPage() {
    fetchSystemErrors(sysErrorsPage + 1);
}

function renderSystemErrorsTable(errors) {
    const tbody = document.getElementById('sys-errors-table-body');
    tbody.innerHTML = '';

    if (!errors || errors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No system errors logged.</td></tr>`;
        return;
    }

    errors.forEach(err => {
        const tr = document.createElement('tr');
        const dateStr = new Date(err.created_at).toLocaleString();
        const shortMsg = err.message.length > 80 ? err.message.substring(0, 80) + '...' : err.message;
        const shortFile = err.file.substring(err.file.lastIndexOf('\\') + 1);

        tr.innerHTML = `
                    <td><code style="font-weight: 700; color: #38bdf8;">${err.reference_id}</code></td>
                    <td>
                        <div style="font-weight: bold; color: var(--accent-red); font-family: monospace; font-size: 11px;">${err.exception_type}</div>
                        <div style="color: var(--text-primary); font-size: 12px; margin-top: 4px;">${shortMsg}</div>
                    </td>
                    <td><code style="font-size: 11px;">${shortFile}:${err.line}</code></td>
                    <td style="text-align: center;"><span class="badge" style="background-color: #334155; color: white;">${err.method}</span></td>
                    <td style="font-size: 12px;">${dateStr}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="openSysErrorDetailModal(${err.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-eye"></i> View</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSystemError(${err.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

let currentActiveError = null;

function openSysErrorDetailModal(id) {
    fetch(`/admin/api/system/errors/${id}`)
        .then(res => res.json())
        .then(err => {
            currentActiveError = err;
            document.getElementById('lbl-sys-error-ref').textContent = err.reference_id;
            document.getElementById('lbl-sys-error-type').textContent = err.exception_type;
            document.getElementById('lbl-sys-error-file').textContent = `${err.file} (Line: ${err.line})`;
            document.getElementById('lbl-sys-error-route').textContent = `Route: ${err.route || 'N/A'} @ ${err.controller || 'Closure'}`;
            document.getElementById('lbl-sys-error-url').textContent = `[${err.method}] ${err.url}`;
            document.getElementById('lbl-sys-error-agent').textContent = err.browser + ' on ' + err.os;
            document.getElementById('lbl-sys-error-ip').textContent = err.ip_address;
            document.getElementById('lbl-sys-error-user').textContent = err.user_name ? `${err.user_name} (ID: ${err.user_id})` : 'Guest / Anonymous';
            document.getElementById('lbl-sys-error-time').textContent = new Date(err.created_at).toLocaleString();
            document.getElementById('lbl-sys-error-message').textContent = err.message;
            document.getElementById('lbl-sys-error-trace').textContent = err.stack_trace;

            // SQL error check
            const sqlBox = document.getElementById('sys-error-sql-box');
            if (err.sql_error) {
                sqlBox.style.display = 'block';
                document.getElementById('lbl-sys-sql-state').textContent = err.sql_error.sqlstate || 'N/A';
                document.getElementById('lbl-sys-sql-query').textContent = err.sql_error.query || '';
                document.getElementById('lbl-sys-sql-bindings').textContent = JSON.stringify(err.sql_error.bindings || []);
            } else {
                sqlBox.style.display = 'none';
            }

            document.getElementById('sys-error-detail-modal').style.display = 'flex';
        })
        .catch(e => showToast('এরর বিস্তারিত লোড করতে ব্যর্থ হয়েছে'));
}

function closeSysErrorDetailModal() {
    document.getElementById('sys-error-detail-modal').style.display = 'none';
    currentActiveError = null;
}

function copyModalErrorDetails() {
    if (!currentActiveError) return;
    const err = currentActiveError;
    let sqlInfo = '';
    if (err.sql_error) {
        sqlInfo = `\nSQLSTATE: ${err.sql_error.sqlstate}\nSQL Query: ${err.sql_error.query}\nBindings: ${JSON.stringify(err.sql_error.bindings)}`;
    }
    const txt = `Error Log Report\n===================\nReference ID: ${err.reference_id}\nType: ${err.exception_type}\nMessage: ${err.message}\nFile: ${err.file}:${err.line}\nURL: ${err.url}\nMethod: ${err.method}${sqlInfo}\nStack Trace:\n${err.stack_trace.substring(0, 1000)}...`;

    navigator.clipboard.writeText(txt).then(() => {
        showToast('অনুলিপি ক্লিপবোর্ডে কপি করা হয়েছে');
    });
}

function deleteSystemError(id) {
    Swal.fire({
        title: 'Delete Log?',
        text: "Are you sure you want to remove this system error entry?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, remove'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/system/errors/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(() => {
                    Swal.fire('Deleted!', 'Error log entry has been removed.', 'success');
                    fetchSystemErrors(sysErrorsPage);
                    fetchStats();
                });
        }
    });
}

// --- 2. SYSTEM HEALTH & DIAGNOSTICS MODULE ---
function fetchDatabaseStatus() {
    const card = document.getElementById('db-health-check-card');
    fetch('/admin/api/system/database')
        .then(res => res.json())
        .then(db => {
            if (db.connected) {
                card.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <i class="fa-solid fa-circle-check" style="color: var(--accent-teal); font-size: 16px;"></i>
                                <span class="badge" style="background-color: var(--accent-teal); color: white; font-weight: bold;">Healthy</span>
                            </div>
                            <div style="line-height: 1.8;">
                                <div><strong>DB Name:</strong> <code>${db.database_name}</code></div>
                                <div><strong>MySQL Version:</strong> ${db.mysql_version}</div>
                                <div><strong>Size (Storage):</strong> ${db.storage_used}</div>
                                <div><strong>Total Tables:</strong> ${db.tables_count}</div>
                                <div><strong>Total Rows:</strong> ${db.total_rows}</div>
                                <div><strong>Charset:</strong> ${db.charset} (${db.collation})</div>
                            </div>
                        `;
            } else {
                card.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <i class="fa-solid fa-circle-xmark" style="color: var(--accent-red); font-size: 16px;"></i>
                                <span class="badge" style="background-color: var(--accent-red); color: white; font-weight: bold;">Problem Found</span>
                            </div>
                            <div style="line-height: 1.8; color: var(--accent-red);">
                                <strong>Reason:</strong> Connection Failed<br>
                                <strong>Host/Port:</strong> ${db.host}:${db.port}<br>
                                <strong>Username:</strong> ${db.username}<br>
                                <strong>Code:</strong> ${db.sqlstate}<br>
                                <strong>Details:</strong> ${db.reason}
                            </div>
                        `;
            }
        })
        .catch(err => {
            card.innerHTML = `<div style="color: var(--accent-red);">Failed to read database state.</div>`;
        });
}

function fetchQueueStatus() {
    fetch('/admin/api/system/queue')
        .then(res => res.json())
        .then(q => {
            document.getElementById('sys-health-queue-connection').textContent = q.connection;
            document.getElementById('sys-health-queue-pending').textContent = q.pending_jobs;
        });
}

function retryFailedQueueJobs() {
    fetch('/admin/api/system/queue/retry', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message);
            fetchQueueStatus();
        });
}

function fetchSchedulerStatus() {
    fetch('/admin/api/system/scheduler')
        .then(res => res.json())
        .then(sch => {
            document.getElementById('sys-health-scheduler-tz').textContent = sch.timezone;
        });
}

function clearSystemCache(type) {
    Swal.fire({
        title: 'Clear Cache?',
        text: `Clear system ${type} cache parameters?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/system/cache/clear/${type}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Cleared!', data.message, 'success');
                    } else {
                        Swal.fire('Failed!', data.message, 'error');
                    }
                });
        }
    });
}

function sendTestSMTPMail() {
    const email = document.getElementById('test-smtp-email').value;
    if (!email) {
        showToast('অনুগ্রহ করে একটি ইমেইল টাইপ করুন');
        return;
    }

    Swal.fire({
        title: 'Sending Test Email...',
        text: 'Please wait while SMTP checks connection...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('/admin/api/system/mail/test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ email: email })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Sent!', data.message, 'success');
            } else {
                Swal.fire('SMTP Error!', data.message, 'error');
            }
        })
        .catch(err => {
            Swal.fire('Failed!', 'outbound test failed. Check connection.', 'error');
        });
}

function runDiagnosticsAudit() {
    Swal.fire({
        title: 'Auditing System...',
        text: 'Running DB, routes, storage, and models checksum audits...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('/admin/api/system/diagnostics')
        .then(res => res.json())
        .then(data => {
            Swal.close();
            document.getElementById('diagnostics-audit-results-card').style.display = 'block';
            const container = document.getElementById('diagnostics-audit-checklist-body');
            container.innerHTML = '';

            const audits = [
                { name: 'Database Status', val: data.database.status, desc: data.database.connected ? 'Connected' : 'Failed' },
                { name: 'Storage Permissions', val: data.storage_permissions.status, desc: 'Writable validation' },
                { name: 'Routes Auditor', val: data.routes.status, desc: `Checked ${data.routes.total_routes} routes` },
                { name: 'Controller Integrity', val: data.controllers.status, desc: `Checked controller linkages` },
                { name: 'Models Auditor', val: data.models.status, desc: 'Model schemas verified' },
                { name: 'Blade Views Auditor', val: data.views.status, desc: 'Critical templates verified' },
                { name: 'Security Baseline', val: data.security.status, desc: 'Debug off / env protection checked' },
                { name: 'PHP Extensions', val: data.php_extensions.status, desc: 'Required libraries verified' }
            ];

            audits.forEach(aud => {
                const isHealthy = aud.val === 'Healthy';
                const color = isHealthy ? 'var(--accent-teal)' : 'var(--accent-red)';
                const icon = isHealthy ? 'fa-circle-check' : 'fa-circle-exclamation';

                container.innerHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color);">
                                <div>
                                    <strong>${aud.name}</strong>
                                    <span style="display:block; font-size:11px; color: var(--text-secondary);">${aud.desc}</span>
                                </div>
                                <span class="badge" style="background-color: ${color}; color: white; display: flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid ${icon}"></i> ${aud.val}
                                </span>
                            </div>
                        `;
            });
        })
        .catch(err => {
            Swal.fire('Error!', 'System diagnostic check failed.', 'error');
        });
}

// --- 3. API MONITOR LOGS ---
function fetchApiLogs(page = 1) {
    sysApiPage = page;
    const search = document.getElementById('sys-api-search').value;
    const perPage = document.getElementById('sys-api-per-page').value;

    let url = `/admin/api/system/api-logs?page=${sysApiPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderApiLogsTable(data.data);

            document.getElementById('sys-api-pagination-status').textContent =
                `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;

            document.getElementById('btn-sys-api-prev').disabled = !data.prev_page_url;
            document.getElementById('btn-sys-api-next').disabled = !data.next_page_url;
        });
}

function prevSysApiPage() {
    if (sysApiPage > 1) fetchApiLogs(sysApiPage - 1);
}

function nextSysApiPage() {
    fetchApiLogs(sysApiPage + 1);
}

function renderApiLogsTable(logs) {
    const tbody = document.getElementById('sys-api-table-body');
    tbody.innerHTML = '';

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No API logs monitored.</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        const dateStr = new Date(log.created_at).toLocaleString();
        const statusColor = log.status_code >= 400 ? 'var(--accent-red)' : 'var(--accent-teal)';

        tr.innerHTML = `
                    <td>${log.id}</td>
                    <td><span class="badge" style="background-color: #334155; color: white;">${log.method}</span></td>
                    <td style="font-family: monospace; font-size: 12px; color: var(--text-primary);">${log.url}</td>
                    <td style="text-align: center;"><span class="badge" style="background-color: ${statusColor}; color: white;">${log.status_code}</span></td>
                    <td><code style="font-weight: 700; color: var(--accent-teal);">${log.execution_time_ms} ms</code></td>
                    <td style="font-size: 12px;">${dateStr}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="openSysApiPayloadModal(${log.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-code"></i> Payload</button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function openSysApiPayloadModal(id) {
    const perPage = document.getElementById('sys-api-per-page').value;
    fetch(`/admin/api/system/api-logs?page=1&per_page=1000`)
        .then(res => res.json())
        .then(data => {
            const log = (data.data || []).find(l => l.id === id);
            if (log) {
                try {
                    const reqObj = JSON.parse(log.request_data);
                    document.getElementById('lbl-sys-api-request').textContent = JSON.stringify(reqObj, null, 2);
                } catch (e) {
                    document.getElementById('lbl-sys-api-request').textContent = log.request_data || '{}';
                }
                try {
                    const resObj = JSON.parse(log.response_data);
                    document.getElementById('lbl-sys-api-response').textContent = JSON.stringify(resObj, null, 2);
                } catch (e) {
                    document.getElementById('lbl-sys-api-response').textContent = log.response_data || '';
                }
                document.getElementById('sys-api-payload-modal').style.display = 'flex';
            } else {
                showToast('Payload data not found for this log entry');
            }
        })
        .catch(() => showToast('API log payload লোড করতে সমস্যা হয়েছে'));
}

function closeSysApiPayloadModal() {
    document.getElementById('sys-api-payload-modal').style.display = 'none';
}

// --- 4. LOG FILE VIEWER ---
function fetchLaravelLogEntries(page = 1) {
    sysLogsPage = page;
    const search = document.getElementById('sys-logs-search').value;
    const level = document.getElementById('sys-logs-filter-level').value;
    const perPage = document.getElementById('sys-logs-per-page').value;

    let url = `/admin/api/system/logs?page=${sysLogsPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (level) url += `&level=${level}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderLaravelLogEntries(data.data);

            document.getElementById('sys-logs-count-info').textContent = `${data.total} records found`;

            const from = (data.current_page - 1) * perPage + 1;
            const to = Math.min(data.current_page * perPage, data.total);
            document.getElementById('sys-logs-pagination-status').textContent =
                `Showing ${data.total > 0 ? from : 0} to ${to} of ${data.total} entries`;

            document.getElementById('btn-sys-logs-prev').disabled = data.current_page === 1;
            document.getElementById('btn-sys-logs-next').disabled = data.current_page >= data.last_page;
        });
}

function prevSysLogsPage() {
    if (sysLogsPage > 1) fetchLaravelLogEntries(sysLogsPage - 1);
}

function nextSysLogsPage() {
    fetchLaravelLogEntries(sysLogsPage + 1);
}

function renderLaravelLogEntries(entries) {
    const consoleBox = document.getElementById('sys-logs-console-body');
    consoleBox.innerHTML = '';

    if (!entries || entries.length === 0) {
        consoleBox.innerHTML = '<span style="color: var(--text-secondary);">No log entries found matching criteria.</span>';
        return;
    }

    entries.forEach(ent => {
        let color = '#94a3b8'; // Default info
        if (ent.level === 'CRITICAL') color = '#f43f5e';
        else if (ent.level === 'ERROR') color = '#ef4444';
        else if (ent.level === 'WARNING') color = '#f59e0b';
        else if (ent.level === 'NOTICE') color = '#38bdf8';

        const logSpan = document.createElement('div');
        logSpan.style.marginBottom = '8px';
        logSpan.innerHTML = `<span style="color: #64748b;">[${ent.timestamp}]</span> <span style="color: ${color}; font-weight: bold;">${ent.level}</span>: ${ent.message}`;
        consoleBox.appendChild(logSpan);
    });
}

function deleteLaravelLogs() {
    Swal.fire({
        title: 'Clear Logs?',
        text: "Empty laravel.log file permanently?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, clear'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/admin/api/system/logs/delete', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(() => {
                    Swal.fire('Cleared!', 'Log file emptied successfully.', 'success');
                    fetchLaravelLogEntries(1);
                });
        }
    });
}

// --- 5. ENVIRONMENT & SECURITY ---
function fetchServerInfo() {
    const body = document.getElementById('sys-env-server-info-body');
    fetch('/admin/api/system/diagnostics')
        .then(res => res.json())
        .then(data => {
            const s = data.server;
            body.innerHTML = `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>Laravel Version:</span>
                            <span style="font-weight: 500;">${s.laravel_version}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>PHP Version:</span>
                            <span style="font-weight: 500;">${s.php_version}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>Web Server:</span>
                            <span style="font-weight: 500; font-size: 11px;">${s.server_software}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>Memory Limit:</span>
                            <code>${s.memory_limit}</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>Max Execution Time:</span>
                            <code>${s.max_execution_time}</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                            <span>Upload Max Size:</span>
                            <code>${s.upload_max_filesize}</code>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Post Max Size:</span>
                            <code>${s.post_max_size}</code>
                        </div>
                    `;
        });
}

function fetchSecurityChecks() {
    const body = document.getElementById('sys-env-security-checklist-body');
    fetch('/admin/api/system/security')
        .then(res => res.json())
        .then(sec => {
            const checks = [
                { label: 'Application Debug Mode turned OFF (APP_DEBUG=false)', passed: sec.app_debug_off, rec: 'Turn off APP_DEBUG in production env' },
                { label: 'Secure Transport Layer (HTTPS Enabled)', passed: sec.https_enabled, rec: 'Redirect all HTTP requests to HTTPS via SSL' },
                { label: 'Environment Variables Safe Protection (.env secured)', passed: sec.env_protected, rec: 'Restrict .env access permission flags' },
                { label: 'Global Cryptographic Key Set (APP_KEY active)', passed: sec.app_key_set, rec: 'Run php artisan key:generate' },
                { label: 'Cross-Site Request Forgery Protection (CSRF enabled)', passed: sec.csrf_enabled, rec: 'Always include csrf directives' }
            ];

            body.innerHTML = '';
            checks.forEach(chk => {
                const badgeColor = chk.passed ? 'var(--accent-teal)' : 'var(--accent-red)';
                const badgeText = chk.passed ? 'Passed' : 'Action Required';
                const icon = chk.passed ? 'fa-shield-halved' : 'fa-triangle-exclamation';

                body.innerHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);">
                                <div>
                                    <strong>${chk.label}</strong>
                                    ${!chk.passed ? `<span style="display:block; font-size:11px; color: var(--accent-red); margin-top:2px;">Recommendation: ${chk.rec}</span>` : ''}
                                </div>
                                <span class="badge" style="background-color: ${badgeColor}; color: white;">${badgeText}</span>
                            </div>
                        `;
            });
        });
}

// --- 6. BACKUP & DIAGNOSTICS ARCHIVE ---
function fetchBackupArchives() {
    const tbody = document.getElementById('sys-backups-table-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">Loading backups list...</td></tr>';

    fetch('/admin/api/system/backups')
        .then(res => res.json())
        .then(backups => {
            tbody.innerHTML = '';
            if (!backups || backups.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">No backups stored.</td></tr>';
                return;
            }

            backups.forEach(bk => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td><code style="font-weight: bold; color: var(--text-primary);">${bk.filename}</code></td>
                            <td style="text-align: center;"><span class="badge" style="background-color: ${bk.type === 'Database' ? 'var(--accent-teal)' : 'var(--accent-blue)'}; color: white;">${bk.type}</span></td>
                            <td>${bk.size}</td>
                            <td>${bk.created_at}</td>
                            <td style="text-align: right;">
                                <a href="/admin/api/system/backups/download/${bk.filename}" class="btn btn-secondary btn-sm" style="display: inline-flex; padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-download"></i> Download</a>
                                ${bk.type === 'Database' ? `<button class="btn btn-primary btn-sm" onclick="restoreBackupArchive('${bk.filename}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-window-restore"></i> Restore</button>` : ''}
                                <button class="btn btn-danger btn-sm" onclick="deleteBackupArchive('${bk.filename}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        });
}

function createBackupArchive(type) {
    Swal.fire({
        title: 'Creating backup archive...',
        text: 'Exporting system data, please wait...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('/admin/api/system/backups/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ type: type })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Created!', 'Backup file saved: ' + data.filename, 'success');
                fetchBackupArchives();
            } else {
                Swal.fire('Failed!', data.message, 'error');
            }
        })
        .catch(err => {
            Swal.fire('Failed!', 'Could not execute data serialization.', 'error');
        });
}

function deleteBackupArchive(filename) {
    Swal.fire({
        title: 'Delete Backup?',
        text: "Permanently delete this backup archive from storage?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/system/backups/delete/${filename}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(() => {
                    Swal.fire('Deleted!', 'Archive has been deleted.', 'success');
                    fetchBackupArchives();
                });
        }
    });
}

function restoreBackupArchive(filename) {
    Swal.fire({
        title: 'Restore Database?',
        text: "Warning: This will overwrite the current database tables with data from the backup file!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--accent-orange)',
        confirmButtonText: 'Yes, restore'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Restoring Database...',
                text: 'Parsing SQL queries, please wait...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            fetch('/admin/api/system/backups/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ filename: filename })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Restored!', data.message, 'success');
                        fetchDatabaseStatus();
                        fetchStats();
                    } else {
                        Swal.fire('Failed!', data.message, 'error');
                    }
                })
                .catch(err => {
                    Swal.fire('Failed!', 'Could not execute database parsing.', 'error');
                });
        }
    });
}

// ==============================
// POPUP PROMO MANAGEMENT
// ==============================
function fetchPopupPromo() {
    fetch('/admin/api/popup-promo')
        .then(res => res.json())
        .then(data => {
            document.getElementById('popup-promo-active').checked = data.is_active ? true : false;
            document.getElementById('popup-promo-link').value = data.link_url || '';
            if (data.image_path) {
                document.getElementById('popup-promo-preview-img').src = data.image_path;
                document.getElementById('popup-promo-preview-container').style.display = 'block';
            } else {
                document.getElementById('popup-promo-preview-container').style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Error loading popup promo settings: ", err);
            showToast('পপআপ প্রমো সেটিংস লোড করতে সমস্যা হয়েছে');
        });
}

document.getElementById('popup-promo-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.set('is_active', document.getElementById('popup-promo-active').checked ? 1 : 0);

    fetch('/admin/api/popup-promo/save', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.error || errData.message || 'Error occurred');
                });
            }
            return res.json();
        })
        .then(data => {
            showToast('পপআপ প্রমো সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে');
            fetchPopupPromo();
        })
        .catch(err => {
            console.error("Error saving popup promo settings: ", err);
            showToast(err.message || 'পপআপ প্রমো সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
        });
});

// ================================================================
// CARTELLI (Road Signs) ADMIN PANEL - Full CRUD
// ================================================================

// ----------  State  ----------
let cartelloCategoriesCache = [];
let cartelloChaptersCache = [];
let cartelloPagesCache = [];
let cartelloMcqsCache = [];

let editingCartelloCategoryId = null;
let editingCartelloChapterId = null;
let editingCartelloPageId = null;
let editingCartelloMcqId = null;

let cartelloCurrentPage = 1;
let cartelloQCurrentPage = 1;

// 1. Init Categories Panel
function initCartelloCategories() {
    fetchCartelloCategories();
}

// 2. Init Chapters Panel
function initCartelloChapters() {
    loadCategoryDropdown('filter-chapter-category-id');
    fetchCartelloChapters();
}

function switchCartelloAdminSubTab(tab) {
    const btnChapters = document.getElementById('cartello-tab-btn-chapters');
    const btnPages = document.getElementById('cartello-tab-btn-pages');
    const subChapters = document.getElementById('cartello-sub-panel-chapters');
    const subPages = document.getElementById('cartello-sub-panel-pages');

    if (tab === 'chapters') {
        if (btnChapters) {
            btnChapters.style.backgroundColor = 'var(--accent-orange)';
            btnChapters.style.color = 'white';
            btnChapters.classList.remove('btn-secondary');
        }
        if (btnPages) {
            btnPages.classList.add('btn-secondary');
            btnPages.style.backgroundColor = 'transparent';
            btnPages.style.color = 'var(--text-secondary)';
        }
        if (subChapters) subChapters.style.display = 'block';
        if (subPages) subPages.style.display = 'none';
        initCartelloChapters();
    } else {
        if (btnPages) {
            btnPages.style.backgroundColor = 'var(--accent-orange)';
            btnPages.style.color = 'white';
            btnPages.classList.remove('btn-secondary');
        }
        if (btnChapters) {
            btnChapters.classList.add('btn-secondary');
            btnChapters.style.backgroundColor = 'transparent';
            btnChapters.style.color = 'var(--text-secondary)';
        }
        if (subPages) subPages.style.display = 'block';
        if (subChapters) subChapters.style.display = 'none';
        initCartelloPages();
    }
}

// 3. Init Pages Panel
function initCartelloPages() {
    loadCategoryDropdown('filter-page-category-id');
    const chSelect = document.getElementById('filter-page-chapter-id');
    if (chSelect) chSelect.innerHTML = '<option value="">সব চ্যাপ্টার</option>';
    fetchCartelloPages();
}

// 4. Init MCQs Panel
function initCartelloMcqs() {
    loadCategoryDropdown('filter-mcq-category-id');
    const chSelect = document.getElementById('filter-mcq-chapter-id');
    if (chSelect) chSelect.innerHTML = '<option value="">সব চ্যাপ্টার</option>';
    const pgSelect = document.getElementById('filter-mcq-page-id');
    if (pgSelect) pgSelect.innerHTML = '<option value="">সব পেজ</option>';
    fetchCartelloMcqs(1);
}

// ---------- Dropdown Populators & Change Handlers ----------

function loadCategoryDropdown(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    fetch('/admin/api/cartello-categories', { headers: { 'X-CSRF-TOKEN': csrfToken } })
        .then(r => r.json())
        .then(data => {
            let html = selectId.includes('filter')
                ? '<option value="">সব ক্যাটাগরি</option>'
                : '<option value="">ক্যাটাগরি নির্বাচন করুন...</option>';

            data.forEach(cat => {
                html += `<option value="${cat.id}">${cat.name} (${cat.bn_name})</option>`;
            });
            select.innerHTML = html;
            if (selectedId) {
                select.value = selectedId;
            }
        })
        .catch(() => console.error('Error loading category dropdown'));
}

function handleCategoryChange(categorySelectId, chapterSelectId, selectedChapterId = null) {
    const catSelect = document.getElementById(categorySelectId);
    const chapSelect = document.getElementById(chapterSelectId);
    if (!catSelect || !chapSelect) return;

    const catId = catSelect.value;
    if (!catId) {
        chapSelect.innerHTML = chapterSelectId.includes('filter')
            ? '<option value="">সব চ্যাপ্টার</option>'
            : '<option value="">প্রথমে ক্যাটাগরি সিলেক্ট করুন...</option>';
        return;
    }

    chapSelect.innerHTML = '<option value="">লোড হচ্ছে...</option>';

    fetch(`/api/cartello-categories/${catId}/chapters`)
        .then(r => r.json())
        .then(chapters => {
            let html = chapterSelectId.includes('filter')
                ? '<option value="">সব চ্যাপ্টার</option>'
                : '<option value="">চ্যাপ্টার নির্বাচন করুন...</option>';

            chapters.forEach(ch => {
                html += `<option value="${ch.id}">Ch ${ch.chapter_number}: ${ch.name} (${ch.bn_name || ''})</option>`;
            });
            chapSelect.innerHTML = html;
            if (selectedChapterId) {
                chapSelect.value = selectedChapterId;
            }
        })
        .catch(() => {
            chapSelect.innerHTML = '<option value="">চ্যাপ্টার লোড করা যায়নি</option>';
        });
}

function handleChapterChange(chapterSelectId, pageSelectId, selectedPageId = null) {
    const chapSelect = document.getElementById(chapterSelectId);
    const pageSelect = document.getElementById(pageSelectId);
    if (!chapSelect || !pageSelect) return;

    const chapId = chapSelect.value;
    if (!chapId) {
        pageSelect.innerHTML = pageSelectId.includes('filter')
            ? '<option value="">সব পেজ</option>'
            : '<option value="">প্রথমে চ্যাপ্টার সিলেক্ট করুন...</option>';
        return;
    }

    pageSelect.innerHTML = '<option value="">লোড হচ্ছে...</option>';

    fetch(`/api/cartello-chapters/${chapId}/pages`)
        .then(r => r.json())
        .then(pages => {
            let html = pageSelectId.includes('filter')
                ? '<option value="">সব পেজ</option>'
                : '<option value="">পেজ নির্বাচন করুন...</option>';

            pages.forEach(pg => {
                html += `<option value="${pg.id}">Page ${pg.page_number}: ${pg.title} (${pg.bn_title})</option>`;
            });
            pageSelect.innerHTML = html;
            if (selectedPageId) {
                pageSelect.value = selectedPageId;
            }
        })
        .catch(() => {
            pageSelect.innerHTML = '<option value="">পেজ লোড করা যায়নি</option>';
        });
}

// ===== CATEGORIES =====
function fetchCartelloCategories() {
    fetch('/admin/api/cartello-categories', { headers: { 'X-CSRF-TOKEN': csrfToken } })
        .then(r => r.json())
        .then(data => { cartelloCategoriesCache = data; renderCartelloCategoriesTable(data); })
        .catch(() => showToast('????????? ??? ???? ?????? ??????'));
}

function renderCartelloCategoriesTable(cats) {
    const tbody = document.getElementById('cartello-cats-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-categories');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('cartello-categories');

    if (cats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো ক্যাটাগরি পাওয়া যায়নি</td></tr>';
        return;
    }
    cats.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-category-checkbox" value="${cat.id}" onchange="updateBulkDeleteButton('cartello-categories')"></td>
            <td><strong>#${cat.id}</strong></td>
            <td>
                <div style="font-weight:700;">${cat.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${cat.bn_name}</div>
            </td>
            <td>${cat.chapters_count || 0} টি চ্যাপ্টার</td>
            <td>
                <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; margin-right:5px;" onclick="openEditCartelloCatModal(${cat.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm" style="background:var(--accent-red); color:#fff;" onclick="deleteCartelloCategory(${cat.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddCartelloCatModal() {
    editingCartelloCategoryId = null;
    document.getElementById('cartello-cat-modal-title').textContent = 'নতুন ক্যাটাগরি তৈরি করুন';
    document.getElementById('cartello-cat-form').reset();
    document.getElementById('cartello-cat-modal').style.display = 'flex';
}

function openEditCartelloCatModal(id) {
    const cat = cartelloCategoriesCache.find(c => c.id === id);
    if (!cat) return;
    editingCartelloCategoryId = id;
    document.getElementById('cartello-cat-modal-title').textContent = 'ক্যাটাগরি সম্পাদনা করুন';
    document.getElementById('ccat-name').value = cat.name;
    document.getElementById('ccat-bn-name').value = cat.bn_name;
    document.getElementById('ccat-description').value = cat.description || '';
    document.getElementById('ccat-bn-description').value = cat.bn_description || '';
    document.getElementById('ccat-sort-order').value = cat.sort_order || 0;
    document.getElementById('cartello-cat-modal').style.display = 'flex';
}

function closeCartelloCatModal() {
    document.getElementById('cartello-cat-modal').style.display = 'none';
}

function saveCartelloCategory(e) {
    e.preventDefault();
    const isEdit = !!editingCartelloCategoryId;
    const url = isEdit ? `/admin/api/cartello-categories/update/${editingCartelloCategoryId}` : '/admin/api/cartello-categories/store';

    const formData = new FormData(document.getElementById('cartello-cat-form'));
    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            if (data.success || data.id) {
                showToast(isEdit ? 'ক্যাটাগরি আপডেট করা হয়েছে' : 'ক্যাটাগরি তৈরি করা হয়েছে');
                closeCartelloCatModal();
                fetchCartelloCategories();
            } else {
                showToast(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
            }
        })
        .catch(() => showToast('নেটওয়ার্ক সমস্যা'));
}

function deleteCartelloCategory(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি ডিলিট করতে চান?')) return;
    fetch(`/admin/api/cartello-categories/delete/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast('ক্যাটাগরি ডিলিট করা হয়েছে');
                fetchCartelloCategories();
            } else {
                showToast(data.message || 'ডিলিট করা যায়নি');
            }
        })
        .catch(err => showToast('ডিলিট করা যায়নি। অনুগ্রহ করে ডিপেন্ডেন্ট ডাটা চেক করুন।'));
}

// ================================================================
// 2. CHAPTER METHODS
// ================================================================
function fetchCartelloChapters() {
    const catId = document.getElementById('filter-chapter-category-id')?.value || '';
    const search = document.getElementById('cartello-chapter-search')?.value || '';
    let url = `/admin/api/cartello-chapters?search=${encodeURIComponent(search)}`;
    if (catId) url += `&category_id=${catId}`;

    fetch(url, { headers: { 'X-CSRF-TOKEN': csrfToken } })
        .then(r => r.json())
        .then(data => {
            cartelloChaptersCache = data;
            renderCartelloChaptersTable(data);
        })
        .catch(() => showToast('চ্যাপ্টার তালিকা লোড করতে সমস্যা হয়েছে'));
}

function renderCartelloChaptersTable(chaps) {
    const tbody = document.getElementById('cartello-chapters-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-chapters');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('cartello-chapters');

    if (chaps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">কোনো চ্যাপ্টার পাওয়া যায়নি</td></tr>';
        return;
    }
    chaps.forEach(ch => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-chapter-checkbox" value="${ch.id}" onchange="updateBulkDeleteButton('cartello-chapters')"></td>
            <td><strong>#${ch.id}</strong></td>
            <td><span style="background:var(--accent-orange); color:#000; padding:2px 8px; border-radius:4px; font-weight:700;">Ch ${ch.chapter_number}</span></td>
            <td>
                <div style="font-weight:700;">${ch.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${ch.bn_name || ''}</div>
            </td>
            <td>${ch.category ? ch.category.name : 'N/A'}</td>
            <td>
                <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; margin-right:5px;" onclick="openEditCartelloChapterModal(${ch.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm" style="background:var(--accent-red); color:#fff;" onclick="deleteCartelloChapter(${ch.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddCartelloChapterModal() {
    editingCartelloChapterId = null;
    document.getElementById('cartello-chapter-modal-title').textContent = 'নতুন চ্যাপ্টার তৈরি করুন';
    document.getElementById('cartello-chapter-form').reset();
    loadCategoryDropdown('cch-category-id');
    document.getElementById('cartello-chapter-modal').style.display = 'flex';
}

function openEditCartelloChapterModal(id) {
    const ch = cartelloChaptersCache.find(c => c.id === id);
    if (!ch) return;
    editingCartelloChapterId = id;
    document.getElementById('cartello-chapter-modal-title').textContent = 'চ্যাপ্টার সম্পাদনা করুন';
    loadCategoryDropdown('cch-category-id', ch.category_id);
    document.getElementById('cch-name').value = ch.name;
    document.getElementById('cch-bn-name').value = ch.bn_name || '';
    document.getElementById('cch-chapter-number').value = ch.chapter_number;
    const sortOrderEl = document.getElementById('cch-sort-order');
    if (sortOrderEl) sortOrderEl.value = ch.sort_order || 0;
    document.getElementById('cartello-chapter-modal').style.display = 'flex';
}

function closeCartelloChapterModal() {
    document.getElementById('cartello-chapter-modal').style.display = 'none';
}

function saveCartelloChapter(e) {
    e.preventDefault();
    const isEdit = !!editingCartelloChapterId;
    const url = isEdit ? `/admin/api/cartello-chapters/update/${editingCartelloChapterId}` : '/admin/api/cartello-chapters/store';

    const formData = new FormData(document.getElementById('cartello-chapter-form'));
    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast(isEdit ? 'চ্যাপ্টার আপডেট করা হয়েছে' : 'চ্যাপ্টার তৈরি করা হয়েছে');
                closeCartelloChapterModal();
                fetchCartelloChapters();
            } else {
                showToast(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
            }
        })
        .catch(() => showToast('নেটওয়ার্ক সমস্যা বা ক্যাটাগরি চ্যাপ্টার লিমিট পূর্ণ হয়েছে'));
}

function deleteCartelloChapter(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই চ্যাপ্টার ডিলিট করতে চান?')) return;
    fetch(`/admin/api/cartello-chapters/delete/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast('চ্যাপ্টার ডিলিট করা হয়েছে');
                fetchCartelloChapters();
            } else {
                showToast(data.message || 'ডিলিট করা যায়নি');
            }
        })
        .catch(() => showToast('ডিলিট করা যায়নি। অনুগ্রহ করে ডিপেন্ডেন্ট পেজ চেক করুন।'));
}

// ================================================================
// 3. PAGE METHODS
// ================================================================
function fetchCartelloPages() {
    const chapId = document.getElementById('filter-page-chapter-id')?.value || '';
    const search = document.getElementById('cartello-page-search')?.value || '';
    let url = `/admin/api/cartello-pages?search=${encodeURIComponent(search)}`;
    if (chapId) url += `&chapter_id=${chapId}`;

    fetch(url, { headers: { 'X-CSRF-TOKEN': csrfToken } })
        .then(r => r.json())
        .then(data => {
            cartelloPagesCache = data;
            renderCartelloPagesTable(data);
        })
        .catch(() => showToast('পেজ তালিকা লোড করতে সমস্যা হয়েছে'));
}

function renderCartelloPagesTable(pages) {
    const tbody = document.getElementById('cartello-pages-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-pages');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('cartello-pages');

    if (pages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">কোনো পেজ পাওয়া যায়নি</td></tr>';
        return;
    }
    pages.forEach(p => {
        let mediaSrc = p.image || '';
        if (mediaSrc && !mediaSrc.startsWith('/') && !mediaSrc.startsWith('http')) {
            mediaSrc = '/' + mediaSrc;
        }
        const mediaHtml = mediaSrc ? `<img src="${mediaSrc}" style="width:50px; height:35px; object-fit:contain; border-radius:4px;" onerror="this.src='/images/signs/generic_pericolo.png'">` : 'N/A';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-page-checkbox" value="${p.id}" onchange="updateBulkDeleteButton('cartello-pages')"></td>
            <td><strong>#${p.id}</strong></td>
            <td><span style="background:var(--accent-teal); color:#fff; padding:2px 8px; border-radius:4px; font-weight:700;">Page ${p.page_number}</span></td>
            <td>
                <div style="font-weight:700;">${p.title}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${p.bn_title}</div>
            </td>
            <td>${p.chapter ? p.chapter.name : 'N/A'}</td>
            <td style="text-align:center;">${mediaHtml}</td>
            <td>
                <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; margin-right:5px;" onclick="openEditCartelloPageModal(${p.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm" style="background:var(--accent-red); color:#fff;" onclick="deleteCartelloPage(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadCartelloPageChaptersDropdown(selectedChapterId = null) {
    const selectEl = document.getElementById('cpage-chapter-id');
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Loading chapters...</option>';

    fetch('/api/cartello-chapters')
        .then(res => res.json())
        .then(chapters => {
            selectEl.innerHTML = '<option value="">Select Chapter...</option>';
            if (!Array.isArray(chapters) || chapters.length === 0) {
                selectEl.innerHTML = '<option value="">No Chapters Found (Create Chapter First)</option>';
                return;
            }

            chapters.forEach((ch, idx) => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                const displayNum = ch.chapter_number || (idx + 1);
                opt.textContent = `Ch#${displayNum} - ${ch.name}`;
                if (selectedChapterId && ch.id == selectedChapterId) {
                    opt.selected = true;
                }
                selectEl.appendChild(opt);
            });
        })
        .catch(err => {
            console.error("Error loading chapters for page modal: ", err);
            selectEl.innerHTML = '<option value="">Error loading chapters</option>';
        });
}

function openAddCartelloPageModal() {
    editingCartelloPageId = null;
    document.getElementById('cartello-page-modal-title').textContent = 'নতুন পেজ তৈরি করুন';
    document.getElementById('cartello-page-form').reset();
    const imgPreviewCont = document.getElementById('cpage-current-image-preview-container');
    if (imgPreviewCont) imgPreviewCont.style.display = 'none';

    loadCartelloPageChaptersDropdown();
    document.getElementById('cartello-page-modal').style.display = 'flex';
}

function openEditCartelloPageModal(id) {
    const p = cartelloPagesCache.find(pg => pg.id === id);
    if (!p) return;
    editingCartelloPageId = id;
    document.getElementById('cartello-page-modal-title').textContent = 'পেজ সম্পাদনা করুন';
    loadCartelloPageChaptersDropdown(p.chapter_id);

    const imgPreviewCont = document.getElementById('cpage-current-image-preview-container');
    const imgPreview = document.getElementById('cpage-current-image-preview');
    if (p.image && imgPreview && imgPreviewCont) {
        let mediaSrc = p.image;
        if (!mediaSrc.startsWith('/') && !mediaSrc.startsWith('http')) {
            mediaSrc = '/' + mediaSrc;
        }
        imgPreview.src = mediaSrc;
        imgPreviewCont.style.display = 'block';
    } else if (imgPreviewCont) {
        imgPreviewCont.style.display = 'none';
    }

    if (document.getElementById('cpage-page-number')) document.getElementById('cpage-page-number').value = p.page_number || 1;
    document.getElementById('cpage-title').value = p.title;
    document.getElementById('cpage-bn-title').value = p.bn_title;
    if (document.getElementById('cpage-description')) document.getElementById('cpage-description').value = p.description || '';
    if (document.getElementById('cpage-bn-description')) document.getElementById('cpage-bn-description').value = p.bn_description || '';
    if (document.getElementById('cpage-translation')) document.getElementById('cpage-translation').value = p.translation || '';
    if (document.getElementById('cpage-is-vero')) document.getElementById('cpage-is-vero').value = p.is_vero ? "1" : "0";
    document.getElementById('cpage-sort-order').value = p.sort_order || 0;
    document.getElementById('cartello-page-modal').style.display = 'flex';
}

function closeCartelloPageModal() {
    document.getElementById('cartello-page-modal').style.display = 'none';
}

function saveCartelloPage(e) {
    e.preventDefault();
    const isEdit = !!editingCartelloPageId;
    const url = isEdit ? `/admin/api/cartello-pages/update/${editingCartelloPageId}` : '/admin/api/cartello-pages/store';

    const formData = new FormData(document.getElementById('cartello-page-form'));
    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast(isEdit ? 'পেজ আপডেট করা হয়েছে' : 'পেজ তৈরি করা হয়েছে');
                closeCartelloPageModal();
                fetchCartelloPages();
            } else {
                showToast(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
            }
        })
        .catch(() => showToast('নেটওয়ার্ক সমস্যা বা ফাইল আপলোড সাইজ বেশি'));
}

function deleteCartelloPage(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই পেজ ডিলিট করতে চান?')) return;
    fetch(`/admin/api/cartello-pages/delete/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast('পেজ ডিলিট করা হয়েছে');
                fetchCartelloPages();
            } else {
                showToast(data.message || 'ডিলিট করা যায়নি');
            }
        })
        .catch(() => showToast('ডিলিট করা যায়নি। অনুগ্রহ করে ডিপেন্ডেন্ট MCQ চেক করুন।'));
}

// ================================================================
// 4. MCQ METHODS
// ================================================================
function fetchCartelloMcqs(page = 1) {
    cartelloQCurrentPage = page;
    const catId = document.getElementById('filter-mcq-category-id')?.value || '';
    const chapId = document.getElementById('filter-mcq-chapter-id')?.value || '';
    const pageId = document.getElementById('filter-mcq-page-id')?.value || '';
    const search = document.getElementById('cartello-mcq-search')?.value || '';

    let url = `/admin/api/cartello-mcqs?page=${page}`;
    if (pageId) url += `&page_id=${pageId}`;
    else if (chapId) url += `&chapter_id=${chapId}`;
    else if (catId) url += `&category_id=${catId}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, { headers: { 'X-CSRF-TOKEN': csrfToken } })
        .then(r => r.json())
        .then(data => {
            if (typeof selectAllAcrossPagesFlag !== 'undefined') {
                selectAllAcrossPagesFlag['cartello-mcqs'] = false;
            }
            cartelloMcqsTotalCount = data.total || 0;
            cartelloMcqsCache = data.data || [];
            renderCartelloMcqsTable(cartelloMcqsCache);
            renderCartelloMcqPagination(data);
        })
        .catch(() => showToast('MCQ প্রশ্ন তালিকা লোড করতে সমস্যা হয়েছে'));
}

function renderCartelloMcqsTable(mcqs) {
    const tbody = document.getElementById('cartello-mcqs-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-mcqs');
    if (masterSelect) masterSelect.checked = false;
    updateBulkDeleteButton('cartello-mcqs');

    if (mcqs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">কোনো MCQ পাওয়া যায়নি</td></tr>';
        return;
    }
    mcqs.forEach(q => {
        const catName = q.page && q.page.chapter && q.page.chapter.category ? q.page.chapter.category.bn_name : 'N/A';
        const chapName = q.page && q.page.chapter ? q.page.chapter.name : 'N/A';
        const pageNum = q.page ? q.page.page_number : 'N/A';
        const createdDate = q.created_at ? q.created_at.substring(0, 10) : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-mcq-checkbox" value="${q.id}" onchange="updateBulkDeleteButton('cartello-mcqs')"></td>
            <td><strong>#${q.id}</strong></td>
            <td>
                <div style="font-weight:700;">${catName}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${chapName} (Pg ${pageNum})</div>
            </td>
            <td style="font-size:13px; max-width:250px;">
                <div style="font-weight:600;">${q.question}</div>
                <div style="color:var(--text-secondary); font-size:12px; margin-top:2px;">${q.bn_question}</div>
            </td>
            <td style="font-weight:700; color:var(--accent-teal); text-align:center;">${q.correct_answer.toUpperCase()}</td>
            <td><span class="status-badge ${q.status ? 'active' : 'inactive'}">${q.status ? 'Active' : 'Inactive'}</span></td>
            <td>${createdDate}</td>
            <td>
                <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; margin-right:5px;" onclick="openEditCartelloMcqModal(${q.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm" style="background:var(--accent-red); color:#fff;" onclick="deleteCartelloMcq(${q.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCartelloMcqPagination(data) {
    const wrap = document.getElementById('cartello-mcq-pagination');
    if (!wrap) return;
    if (!data || data.last_page <= 1) {
        wrap.innerHTML = '';
        return;
    }
    let html = '';
    for (let i = 1; i <= data.last_page; i++) {
        html += `<button class="page-btn ${i === data.current_page ? 'active' : ''}" onclick="fetchCartelloMcqs(${i})">${i}</button>`;
    }
    wrap.innerHTML = html;
}

function addCartelloMcqVocabRow(italianWord = '', banglaTranslation = '', imagePath = '') {
    const tbody = document.getElementById('cartello-mcq-vocab-tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="form-control form-control-sm cartello-vocab-italian" name="vocab_italian[]" value="${italianWord}" placeholder="e.g. STRADA"></td>
        <td><input type="text" class="form-control form-control-sm cartello-vocab-bangla" name="vocab_bangla[]" value="${banglaTranslation}" placeholder="e.g. রাস্তা"></td>
        <td><input type="file" class="form-control form-control-sm cartello-vocab-image" name="vocab_image[]" accept="image/*"></td>
        <td style="text-align: center; vertical-align: middle;">
            <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()" style="padding: 2px 6px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
}

function updateCartelloMcqUnderlinedWordsList() {
    const qIt = document.getElementById('cmcq-question')?.value || '';
    const qBn = document.getElementById('cmcq-bn-question')?.value || '';
    const regex = /<u>(.*?)<\/u>/gi;
    const foundWords = new Set();
    let match;

    while ((match = regex.exec(qIt)) !== null) {
        if (match[1] && match[1].trim()) {
            foundWords.add(match[1].trim());
        }
    }
    while ((match = regex.exec(qBn)) !== null) {
        if (match[1] && match[1].trim()) {
            foundWords.add(match[1].trim());
        }
    }

    const tbody = document.getElementById('cartello-mcq-vocab-tbody');
    if (!tbody) return;

    const existingRows = Array.from(tbody.querySelectorAll('tr'));
    const existingWordsMap = new Map();
    existingRows.forEach(tr => {
        const itVal = tr.querySelector('.cartello-vocab-italian')?.value || '';
        const bnVal = tr.querySelector('.cartello-vocab-bangla')?.value || '';
        if (itVal) existingWordsMap.set(itVal.toLowerCase(), { bnVal, tr });
    });

    foundWords.forEach(word => {
        if (!existingWordsMap.has(word.toLowerCase())) {
            addCartelloMcqVocabRow(word, '');
        }
    });
}

let adminCartelloChaptersList = [];

function loadCartelloMcqChaptersDropdown(selectedChapId = null, targetPageId = null) {
    const selectEl = document.getElementById('cmcq-chapter-id-select');
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Select Chapter...</option>';

    fetch('/api/cartello-chapters')
        .then(res => res.json())
        .then(chapters => {
            adminCartelloChaptersList = chapters || [];
            chapters.forEach((ch, idx) => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                const displayNum = ch.chapter_number || (idx + 1);
                opt.textContent = `${displayNum}. ${ch.name}`;
                if (selectedChapId && ch.id == selectedChapId) {
                    opt.selected = true;
                }
                selectEl.appendChild(opt);
            });

            if (selectedChapId) {
                handleCartelloMcqChapterSelectChange(selectedChapId, targetPageId);
            } else if (chapters.length > 0) {
                selectEl.value = chapters[0].id;
                handleCartelloMcqChapterSelectChange(chapters[0].id);
            }
        })
        .catch(err => console.error("Error loading cartello chapters for modal: ", err));
}

function handleCartelloMcqChapterSelectChange(chapterId, targetPageId = null) {
    const nameInput = document.getElementById('cmcq-chapter-name-display');
    const pageSelect = document.getElementById('cmcq-page-id');

    if (!chapterId) {
        if (nameInput) nameInput.value = '';
        if (pageSelect) pageSelect.innerHTML = '<option value="">Select Page...</option>';
        return;
    }

    const ch = adminCartelloChaptersList.find(c => c.id == chapterId);
    if (ch && nameInput) {
        nameInput.value = ch.name;
    }

    if (pageSelect) {
        pageSelect.innerHTML = '<option value="">Loading pages...</option>';
    }

    fetch(`/api/cartello-chapters/${chapterId}/pages`)
        .then(res => res.json())
        .then(pages => {
            if (!pageSelect) return;
            pageSelect.innerHTML = '<option value="">Select Page...</option>';

            if (!Array.isArray(pages) || pages.length === 0) {
                pageSelect.innerHTML = '<option value="">No Pages Found (Create Pages First)</option>';
                return;
            }

            pages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `Page ${p.page_number}) ${p.title} (${p.bn_title || ''})`;
                if (targetPageId && p.id == targetPageId) {
                    opt.selected = true;
                }
                pageSelect.appendChild(opt);
            });
        })
        .catch(err => {
            console.error("Error loading cartello pages for chapter: ", err);
            if (pageSelect) pageSelect.innerHTML = '<option value="">Error loading pages</option>';
        });
}

function openAddCartelloMcqModal() {
    editingCartelloMcqId = null;
    document.getElementById('cartello-mcq-modal-title').textContent = 'Add New Question';
    document.getElementById('cartello-mcq-form').reset();
    const vocabTbody = document.getElementById('cartello-mcq-vocab-tbody');
    if (vocabTbody) vocabTbody.innerHTML = '';

    loadCartelloMcqChaptersDropdown();
    document.getElementById('cartello-mcq-modal').style.display = 'flex';
}

function toggleCartelloMcqVideoInput(enabled) {
    const wrapper = document.getElementById('cmcq-video-inputs-wrapper');
    const labelContainer = document.getElementById('cmcq-video-toggle-label');
    const statusIcon = document.getElementById('cmcq-video-status-icon');
    const toggleText = document.getElementById('cmcq-video-toggle-text');
    const toggleSpan = document.getElementById('cmcq-video-toggle-span');

    if (enabled) {
        if (wrapper) wrapper.style.display = 'flex';
        if (statusIcon) statusIcon.className = 'fa-solid fa-video';
        if (toggleText) toggleText.innerText = 'ON (ফ্রন্টে দেখাবে)';
        if (labelContainer) labelContainer.style.color = '#4CAF50';
        if (toggleSpan) toggleSpan.style.backgroundColor = '#4CAF50';
    } else {
        if (wrapper) wrapper.style.display = 'none';
        if (statusIcon) statusIcon.className = 'fa-solid fa-eye-slash';
        if (toggleText) toggleText.innerText = 'OFF (ফ্রন্টে দেখাবে না)';
        if (labelContainer) labelContainer.style.color = '#EF4444';
        if (toggleSpan) toggleSpan.style.backgroundColor = '#EF4444';
    }
}

function openEditCartelloMcqModal(id) {
    const q = cartelloMcqsCache.find(mcq => mcq.id === id);
    if (!q) return;
    editingCartelloMcqId = id;
    document.getElementById('cartello-mcq-modal-title').textContent = 'MCQ প্রশ্ন সম্পাদনা করুন';

    const chapId = q.page ? q.page.chapter_id : null;
    loadCartelloMcqChaptersDropdown(chapId, q.page_id);

    document.getElementById('cmcq-question').value = q.question;
    document.getElementById('cmcq-bn-question').value = q.bn_question;
    document.getElementById('cmcq-correct-answer').value = q.correct_answer;
    if (document.getElementById('cmcq-explanation')) document.getElementById('cmcq-explanation').value = q.explanation || '';
    if (document.getElementById('cmcq-bn-explanation')) document.getElementById('cmcq-bn-explanation').value = q.bn_explanation || '';
    document.getElementById('cartello-mcq-modal').style.display = 'flex';
}

function closeCartelloMcqModal() {
    document.getElementById('cartello-mcq-modal').style.display = 'none';
}

function saveCartelloMcq(e) {
    e.preventDefault();
    const isEdit = !!editingCartelloMcqId;
    const url = isEdit ? `/admin/api/cartello-mcqs/update/${editingCartelloMcqId}` : '/admin/api/cartello-mcqs/store';

    const formData = new FormData(document.getElementById('cartello-mcq-form'));
    const isVideoToggleOn = document.getElementById('cmcq-video-toggle') ? document.getElementById('cmcq-video-toggle').checked : true;
    if (!isVideoToggleOn) {
        formData.append('clear_video', '1');
    }

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast(isEdit ? 'MCQ আপডেট করা হয়েছে' : 'MCQ তৈরি করা হয়েছে');
                closeCartelloMcqModal();
                fetchCartelloMcqs(cartelloQCurrentPage);
            } else {
                showToast(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
            }
        })
        .catch(() => showToast('নেটওয়ার্ক সমস্যা'));
}

function deleteCartelloMcq(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই MCQ ডিলিট করতে চান?')) return;
    fetch(`/admin/api/cartello-mcqs/delete/${id}`, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast('MCQ ডিলিট করা হয়েছে');
                fetchCartelloMcqs(cartelloQCurrentPage);
            } else {
                showToast(data.message || 'ডিলিট করা যায়নি');
            }
        })
        .catch(() => showToast('ডিলিট করা যায়নি'));
}

// ==========================================
// BULK DELETE HELPER FUNCTIONS WITH CROSS-PAGE SELECT ALL SUPPORT
// ==========================================
let selectAllAcrossPagesFlag = {};
let questionsTotalCount = 0;
let chaptersTotalCount = 0;
let pagesTotalCount = 0;
let cartelloMcqsTotalCount = 0;

function toggleSelectAll(type, checked) {
    let checkboxClass = `select-${type.slice(0, -1)}-checkbox`;
    if (type === 'cartello-categories') checkboxClass = 'select-cartello-category-checkbox';
    else if (type === 'cartello-chapters') checkboxClass = 'select-cartello-chapter-checkbox';
    else if (type === 'cartello-pages') checkboxClass = 'select-cartello-page-checkbox';
    else if (type === 'cartello-mcqs') checkboxClass = 'select-cartello-mcq-checkbox';
    else if (type === 'dizionario') checkboxClass = 'select-dizionario-checkbox';

    const checkboxes = document.querySelectorAll('.' + checkboxClass);
    checkboxes.forEach(cb => cb.checked = checked);

    if (!checked) {
        selectAllAcrossPagesFlag[type] = false;
    }
    updateBulkDeleteButton(type);
}

function updateBulkDeleteButton(type) {
    let checkboxClass = `select-${type.slice(0, -1)}-checkbox`;
    if (type === 'cartello-categories') checkboxClass = 'select-cartello-category-checkbox';
    else if (type === 'cartello-chapters') checkboxClass = 'select-cartello-chapter-checkbox';
    else if (type === 'cartello-pages') checkboxClass = 'select-cartello-page-checkbox';
    else if (type === 'cartello-mcqs') checkboxClass = 'select-cartello-mcq-checkbox';
    else if (type === 'dizionario') checkboxClass = 'select-dizionario-checkbox';

    const checkboxes = document.querySelectorAll(`.${checkboxClass}`);
    const checkedCount = document.querySelectorAll(`.${checkboxClass}:checked`).length;
    const totalOnPage = checkboxes.length;

    const bulkBtn = document.getElementById(`btn-bulk-delete-${type}`);
    if (bulkBtn) {
        if (checkedCount > 0 || selectAllAcrossPagesFlag[type]) {
            bulkBtn.style.display = 'inline-block';
        } else {
            bulkBtn.style.display = 'none';
        }
    }

    const masterSelect = document.getElementById(`bulk-select-${type}`);
    if (masterSelect) {
        if (checkedCount === totalOnPage && totalOnPage > 0) {
            masterSelect.checked = true;
        } else {
            masterSelect.checked = false;
        }
    }

    // Paginated banners
    if (['questions', 'chapters', 'pages', 'cartello-mcqs'].includes(type)) {
        let totalCount = 0;
        if (type === 'questions') totalCount = questionsTotalCount;
        else if (type === 'chapters') totalCount = chaptersTotalCount;
        else if (type === 'pages') totalCount = pagesTotalCount;
        else if (type === 'cartello-mcqs') totalCount = cartelloMcqsTotalCount;

        const bannerNormal = document.getElementById(`bulk-select-all-banner-${type}`);
        const bannerActive = document.getElementById(`bulk-select-all-banner-active-${type}`);

        if (bannerNormal && bannerActive) {
            if (selectAllAcrossPagesFlag[type]) {
                bannerNormal.style.display = 'none';
                bannerActive.style.display = 'block';
                const countSpan = document.getElementById(`bulk-select-total-active-count-${type}`);
                if (countSpan) countSpan.textContent = totalCount;
            } else if (checkedCount === totalOnPage && totalCount > totalOnPage) {
                bannerNormal.style.display = 'block';
                bannerActive.style.display = 'none';
                const pageSpan = document.getElementById(`bulk-select-page-count-${type}`);
                const totalSpan = document.getElementById(`bulk-select-total-count-${type}`);
                if (pageSpan) pageSpan.textContent = totalOnPage;
                if (totalSpan) totalSpan.textContent = totalCount;
            } else {
                bannerNormal.style.display = 'none';
                bannerActive.style.display = 'none';
            }
        }
    }
}

function selectAllAcrossPages(type) {
    selectAllAcrossPagesFlag[type] = true;
    updateBulkDeleteButton(type);
}

function clearAllSelection(type) {
    selectAllAcrossPagesFlag[type] = false;
    toggleSelectAll(type, false);
}

function bulkDeleteItems(type) {
    let checkboxClass = `select-${type.slice(0, -1)}-checkbox`;
    if (type === 'cartello-categories') checkboxClass = 'select-cartello-category-checkbox';
    else if (type === 'cartello-chapters') checkboxClass = 'select-cartello-chapter-checkbox';
    else if (type === 'cartello-pages') checkboxClass = 'select-cartello-page-checkbox';
    else if (type === 'cartello-mcqs') checkboxClass = 'select-cartello-mcq-checkbox';

    const isAll = !!selectAllAcrossPagesFlag[type];
    let bodyData = {};

    if (isAll) {
        let totalCount = 0;
        if (type === 'questions') totalCount = questionsTotalCount;
        else if (type === 'chapters') totalCount = chaptersTotalCount;
        else if (type === 'pages') totalCount = pagesTotalCount;
        else if (type === 'cartello-mcqs') totalCount = cartelloMcqsTotalCount;

        if (!confirm(`আপনি কি নিশ্চিতভাবে এই তালিকার সবকয়টি (${totalCount}টি) আইটেম এক ক্লিকে ডিলিট করতে চান? এই কাজ আর ফেরত নেওয়া যাবে না!`)) return;

        bodyData.all = true;
        if (type === 'questions') {
            bodyData.chapter = document.getElementById('filter-chapter').value;
            bodyData.search = document.getElementById('search-question').value;
        } else if (type === 'chapters') {
            bodyData.search = document.getElementById('chapter-search').value;
        } else if (type === 'pages') {
            bodyData.chapter_id = document.getElementById('admin-page-chapter-select').value;
            bodyData.search = document.getElementById('page-search').value;
        } else if (type === 'cartello-mcqs') {
            bodyData.page_id = document.getElementById('filter-mcq-page-id')?.value || '';
            bodyData.chapter_id = document.getElementById('filter-mcq-chapter-id')?.value || '';
            bodyData.category_id = document.getElementById('filter-mcq-category-id')?.value || '';
            bodyData.search = document.getElementById('cartello-mcq-search')?.value || '';
        }
    } else {
        const checkedBoxes = document.querySelectorAll(`.${checkboxClass}:checked`);
        if (checkedBoxes.length === 0) return;
        const ids = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

        if (!confirm(`আপনি কি নিশ্চিতভাবে নির্বাচিত ${ids.length}টি আইটেম ডিলিট করতে চান?`)) return;

        bodyData.ids = ids;
    }

    const url = `/admin/api/${type}/bulk-delete`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(bodyData)
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showToast('আইটেমসমূহ সফলভাবে ডিলিট করা হয়েছে');
                selectAllAcrossPagesFlag[type] = false;

                // Reload corresponding table
                if (type === 'questions') fetchQuestions();
                else if (type === 'chapters') fetchChaptersAdmin(chapterPage);
                else if (type === 'pages') {
                    const chapterId = document.getElementById('admin-page-chapter-select').value;
                    loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
                }
                else if (type === 'categories') fetchCategories();
                else if (type === 'cartello-categories') fetchCartelloCategories();
                else if (type === 'cartello-chapters') fetchCartelloChapters();
                else if (type === 'cartello-pages') fetchCartelloPages();
                else if (type === 'cartello-mcqs') fetchCartelloMcqs(cartelloQCurrentPage);
            } else {
                showToast(data.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('ডিলিট করা যায়নি। অনুগ্রহ করে ডিপেন্ডেন্ট ডাটা চেক করুন।');
        });
}

// ==========================================
// 17. DICTIONARY (DIZIONARIO) CRUD ACTIONS
// ==========================================
let dizionarioCurrentPage = 1;
let dizionarioTotalCount = 0;

function fetchDizionario(page = 1) {
    dizionarioCurrentPage = page;
    const searchInput = document.getElementById('dizionario-search-input');
    const search = searchInput ? searchInput.value.trim() : '';
    const perPageSelect = document.getElementById('dizionario-per-page');
    const perPage = perPageSelect ? perPageSelect.value : 10;

    const tbody = document.getElementById('dizionario-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/admin/api/dizionario/list?search=${encodeURIComponent(search)}&per_page=${perPage}&page=${page}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            dizionarioTotalCount = data.total;

            // Update bulk select checkbox status
            const bulkSelect = document.getElementById('bulk-select-dizionario');
            if (bulkSelect) bulkSelect.checked = false;
            const bulkBtn = document.getElementById('btn-bulk-delete-dizionario');
            if (bulkBtn) bulkBtn.style.display = 'none';

            if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">No dictionary words found.</td></tr>';
                document.getElementById('dizionario-pagination-status').innerText = 'Showing 0 of 0 entries';
                return;
            }

            data.data.forEach(item => {
                const tr = document.createElement('tr');

                // Media badges
                let mediaBadges = '';
                if (item.image) mediaBadges += '<span class="badge" style="background-color: #3b82f6; color: white; margin-right: 4px;">IMG</span>';
                if (item.audio) mediaBadges += '<span class="badge" style="background-color: #10b981; color: white; margin-right: 4px;">AUD</span>';
                if (item.video) mediaBadges += '<span class="badge" style="background-color: #ef4444; color: white; margin-right: 4px;">VID</span>';
                if (!mediaBadges) mediaBadges = '<span style="color: var(--text-secondary); font-size:11px;">None</span>';

                tr.innerHTML = `
                    <td style="text-align: center;"><input type="checkbox" class="select-dizionario-checkbox" value="${item.id}" onchange="updateDizionarioBulkDeleteButton()"></td>
                    <td>${item.id}</td>
                    <td style="font-weight: bold; color: var(--text-primary);">${item.word}</td>
                    <td>${item.bn}</td>
                    <td>
                        <div style="font-size:12px; color: var(--text-secondary); line-height: 1.4;">
                            <strong>IT:</strong> ${item.desc_it || ''}<br>
                            <strong>BN:</strong> ${item.desc_bn || ''}
                        </div>
                    </td>
                    <td style="text-align: center;">${mediaBadges}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick='openEditDizionarioModal(${JSON.stringify(item).replace(/'/g, "&apos;")})' style="margin-right: 4px;">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteDizionarioWord(${item.id})">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Update pagination status
            const from = data.from || 0;
            const to = data.to || 0;
            document.getElementById('dizionario-pagination-status').innerText = `Showing ${from} to ${to} of ${data.total} entries`;
        })
        .catch(err => {
            console.error("Error fetching dictionary:", err);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--accent-red);">Error loading dictionary.</td></tr>';
        });
}

function prevDizionarioPage() {
    if (dizionarioCurrentPage > 1) {
        fetchDizionario(dizionarioCurrentPage - 1);
    }
}

function nextDizionarioPage() {
    fetchDizionario(dizionarioCurrentPage + 1);
}

function openAddDizionarioModal() {
    document.getElementById('dizionario-modal-title').textContent = 'Add Dictionary Term';
    document.getElementById('form-dizionario-id').value = '';
    document.getElementById('form-dizionario-word').value = '';
    document.getElementById('form-dizionario-bn').value = '';
    document.getElementById('form-dizionario-desc-it').value = '';
    document.getElementById('form-dizionario-desc-bn').value = '';

    // Clear inputs & previews
    document.getElementById('form-dizionario-image').value = '';
    document.getElementById('form-dizionario-audio').value = '';
    document.getElementById('form-dizionario-video').value = '';
    document.getElementById('dizionario-image-preview-container').style.display = 'none';
    document.getElementById('dizionario-audio-preview-container').style.display = 'none';
    document.getElementById('dizionario-video-preview-container').style.display = 'none';

    document.getElementById('dizionario-modal').style.display = 'flex';
}

function openEditDizionarioModal(item) {
    document.getElementById('dizionario-modal-title').textContent = 'Edit Dictionary Term';
    document.getElementById('form-dizionario-id').value = item.id;
    document.getElementById('form-dizionario-word').value = item.word;
    document.getElementById('form-dizionario-bn').value = item.bn;
    document.getElementById('form-dizionario-desc-it').value = item.desc_it || '';
    document.getElementById('form-dizionario-desc-bn').value = item.desc_bn || '';

    // Clear file inputs
    document.getElementById('form-dizionario-image').value = '';
    document.getElementById('form-dizionario-audio').value = '';
    document.getElementById('form-dizionario-video').value = '';

    // Handle previews
    if (item.image) {
        document.getElementById('dizionario-image-preview').src = item.image;
        document.getElementById('dizionario-image-preview-container').style.display = 'block';
    } else {
        document.getElementById('dizionario-image-preview-container').style.display = 'none';
    }

    if (item.audio) {
        document.getElementById('dizionario-audio-preview').src = item.audio;
        document.getElementById('dizionario-audio-preview-container').style.display = 'block';
    } else {
        document.getElementById('dizionario-audio-preview-container').style.display = 'none';
    }

    if (item.video) {
        document.getElementById('dizionario-video-preview').src = item.video;
        document.getElementById('dizionario-video-preview-container').style.display = 'block';
    } else {
        document.getElementById('dizionario-video-preview-container').style.display = 'none';
    }

    document.getElementById('dizionario-modal').style.display = 'flex';
}

function closeDizionarioModal() {
    document.getElementById('dizionario-modal').style.display = 'none';
}

function saveDizionario(e) {
    e.preventDefault();
    const id = document.getElementById('form-dizionario-id').value;
    const word = document.getElementById('form-dizionario-word').value.trim();
    const bn = document.getElementById('form-dizionario-bn').value.trim();
    const descIt = document.getElementById('form-dizionario-desc-it').value.trim();
    const descBn = document.getElementById('form-dizionario-desc-bn').value.trim();

    const imgFile = document.getElementById('form-dizionario-image').files[0];
    const audioFile = document.getElementById('form-dizionario-audio').files[0];
    const videoFile = document.getElementById('form-dizionario-video').files[0];

    const formData = new FormData();
    formData.append('word', word);
    formData.append('bn', bn);
    formData.append('desc_it', descIt);
    formData.append('desc_bn', descBn);

    if (imgFile) formData.append('image', imgFile);
    if (audioFile) formData.append('audio', audioFile);
    if (videoFile) formData.append('video', videoFile);

    const url = id ? `/admin/api/dizionario/update/${id}` : '/admin/api/dizionario/store';

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            closeDizionarioModal();
            Swal.fire({
                title: 'Success!',
                text: id ? 'Word details updated successfully.' : 'New word added successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            fetchDizionario(dizionarioCurrentPage);
            fetchStats();
        })
        .catch(err => {
            console.error(err);
            showToast('শব্দটি সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteDizionarioWord(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this word and its uploaded media files?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/api/dizionario/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Deleted!', 'Word has been deleted.', 'success');
                    fetchDizionario(dizionarioCurrentPage);
                    fetchStats();
                })
                .catch(err => showToast('শব্দটি ডিলিট করতে সমস্যা হয়েছে'));
        }
    });
}

function updateDizionarioBulkDeleteButton() {
    const checkboxes = document.querySelectorAll('.select-dizionario-checkbox');
    const checkedCount = document.querySelectorAll('.select-dizionario-checkbox:checked').length;
    const totalOnPage = checkboxes.length;

    const bulkBtn = document.getElementById('btn-bulk-delete-dizionario');
    if (bulkBtn) {
        bulkBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
    }

    const masterSelect = document.getElementById('bulk-select-dizionario');
    if (masterSelect) {
        masterSelect.checked = (checkedCount === totalOnPage && totalOnPage > 0);
    }
}

function bulkDeleteDizionarioWords() {
    const checkedBoxes = document.querySelectorAll('.select-dizionario-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    const ids = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete the selected ${ids.length} words and their media files?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete them!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/admin/api/dizionario/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ ids: ids })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Deleted!', 'Selected words have been deleted.', 'success');
                        fetchDizionario(dizionarioCurrentPage);
                        fetchStats();
                    } else {
                        showToast(data.message || 'ডিলিট করতে সমস্যা হয়েছে');
                    }
                })
                .catch(err => showToast('ডিলিট করা যায়নি'));
        }
    });
}

function updateQuestionUnderlinedWordsList() {
    const tbody = document.getElementById('question-vocab-tbody');
    if (!tbody) return;

    const itVal = document.getElementById('form-italian')?.value || '';
    const bnVal = document.getElementById('form-bangla')?.value || '';
    const combinedText = `${itVal} ${bnVal}`;

    const regex = /<u>([\s\S]*?)<\/u>/gi;
    let match;
    const detectedWords = new Set();
    while ((match = regex.exec(combinedText)) !== null) {
        if (match[1] && match[1].trim()) {
            detectedWords.add(match[1].trim());
        }
    }

    // Keep existing items map
    const currentRows = Array.from(tbody.querySelectorAll('tr'));
    const currentWordsMap = new Map();
    currentRows.forEach(row => {
        const it = row.querySelector('.vocab-it')?.value;
        if (it) currentWordsMap.set(it, row);
    });

    // Delete removed ones
    currentRows.forEach(row => {
        const it = row.querySelector('.vocab-it')?.value;
        if (it && !detectedWords.has(it)) {
            row.remove();
        }
    });

    // Add new ones
    detectedWords.forEach(word => {
        if (!currentWordsMap.has(word)) {
            addQuestionVocabRow(word, '', '');
        }
    });
}

function addQuestionVocabRow(italian = '', bangla = '', image = '') {
    const tbody = document.getElementById('question-vocab-tbody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="vocab-it form-control form-control-sm" value="${italian.replace(/"/g, '&quot;')}" style="width: 100%; font-size: 12px; padding: 4px;" required placeholder="e.g. strada"></td>
        <td><input type="text" class="vocab-bn form-control form-control-sm" value="${bangla.replace(/"/g, '&quot;')}" style="width: 100%; font-size: 12px; padding: 4px;" required placeholder="e.g. রাস্তা"></td>
        <td>
            <div style="display: flex; align-items: center; gap: 6px;">
                <input type="file" class="vocab-img-file" accept="image/*" style="font-size: 11px; max-width: 120px;" onchange="previewVocabRowImage(this)">
                <input type="hidden" class="vocab-img-path" value="${image}">
                <img class="vocab-img-preview" src="${image}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; ${image ? 'display: block;' : 'display: none;'}">
            </div>
        </td>
        <td style="text-align: center; vertical-align: middle;"><button type="button" class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 10px;" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
}

function addPageVocabRow(italian = '', bangla = '', image = '') {
    const list = document.getElementById('page-vocab-list');
    if (!list) return;

    // Check if a row for this word already exists
    const existing = Array.from(list.querySelectorAll('.vocab-card-item')).find(row => {
        const valEl = row.querySelector('.vocab-it');
        return valEl && valEl.value === italian;
    });
    if (existing) {
        const bnInput = existing.querySelector('.vocab-bn');
        if (bnInput && bangla) bnInput.value = bangla;
        const pathInput = existing.querySelector('.vocab-img-path');
        if (pathInput && image) {
            pathInput.value = image;
            const previewImg = existing.querySelector('.vocab-img-preview');
            if (previewImg) {
                previewImg.src = image;
                previewImg.style.display = 'block';
            }
        }
        return;
    }

    const card = document.createElement('div');
    card.className = 'vocab-card-item';
    card.style.cssText = 'display: flex; gap: 12px; align-items: center; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 10px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition: all 0.2s; margin-bottom: 2px;';
    card.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="hidden" class="vocab-it" value="${italian.replace(/"/g, '&quot;')}">
                <span style="font-size: 13px; font-weight: bold; color: var(--accent-green); min-width: 100px; display: inline-block;">Word: <u>${italian}</u></span>
                <input type="text" class="vocab-bn form-control form-control-sm" value="${bangla.replace(/"/g, '&quot;')}" required placeholder="Translate / Definition" style="border-radius: 6px; font-size: 13px; font-weight: bold; background: var(--bg-page); color: var(--text-primary); border: 1px solid var(--border-card); padding: 6px 10px; flex: 1;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px;">
                <span style="font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                    <i class="fa-regular fa-image"></i> Image Upload (Optional)
                </span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="file" class="vocab-img-file" accept="image/*" style="font-size: 11px; max-width: 140px; cursor: pointer;" onchange="previewVocabRowImage(this)">
                    <input type="hidden" class="vocab-img-path" value="${image}">
                    <img class="vocab-img-preview" src="${image}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-card); ${image ? 'display: block;' : 'display: none;'}">
                </div>
            </div>
        </div>
    `;
    list.appendChild(card);
}

function updateUnderlinedWordsList() {
    const listContainer = document.getElementById('page-vocab-list');
    if (!listContainer) return;

    const titleIt = document.getElementById('form-page-title-it')?.value || '';
    const titleBn = document.getElementById('form-page-title-bn')?.value || '';
    const contentIt = document.getElementById('form-page-content')?.value || '';
    const contentBn = document.getElementById('form-page-content-bn')?.value || '';

    const combinedText = `${titleIt} ${titleBn} ${contentIt} ${contentBn}`;

    const regex = /<u>([\s\S]*?)<\/u>/gi;
    let match;
    const detectedWords = new Set();
    while ((match = regex.exec(combinedText)) !== null) {
        const word = match[1].trim();
        if (word) {
            detectedWords.add(word);
        }
    }

    const currentRows = listContainer.querySelectorAll('.vocab-card-item');
    const currentWordsMap = new Map();
    currentRows.forEach(row => {
        const wordInput = row.querySelector('.vocab-it');
        if (wordInput) {
            currentWordsMap.set(wordInput.value, row);
        }
    });

    currentWordsMap.forEach((row, word) => {
        if (!detectedWords.has(word)) {
            row.remove();
        }
    });

    detectedWords.forEach(word => {
        if (!currentWordsMap.has(word)) {
            addPageVocabRow(word, '', '');
        }
    });
}

function previewVocabRowImage(input) {
    const preview = input.closest('.vocab-card-item').querySelector('.vocab-img-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        const pathInput = input.closest('.vocab-card-item').querySelector('.vocab-img-path');
        if (pathInput && pathInput.value) {
            preview.src = pathInput.value;
            preview.style.display = 'block';
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    }
}

function updateMcqDropdownColor(select) {
    if (select.value === '1') {
        select.style.color = '#4CAF50';
        select.style.borderColor = 'rgba(76, 175, 80, 0.4)';
        select.style.backgroundColor = 'rgba(76, 175, 80, 0.05)';
    } else {
        select.style.color = '#ef4444';
        select.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        select.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
    }
}

function toggleMcqMediaSection(btn) {
    const container = btn.closest('.mcq-card-item').querySelector('.mcq-media-vocab-container');
    if (!container) return;
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'flex' : 'none';
    btn.querySelector('span').innerText = isHidden ? 'Hide Media & Vocabulary Details' : 'Show Media & Vocabulary Details';
}

function previewMcqImage(input) {
    const preview = input.closest('.mcq-card-item').querySelector('.mcq-image-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewMcqAudio(input) {
    const preview = input.closest('.mcq-card-item').querySelector('.mcq-audio-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewMcqVideo(input) {
    const preview = input.closest('.mcq-card-item').querySelector('.mcq-video-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateMcqVocabList(card) {
    const itInput = card.querySelector('.mcq-it');
    const bnInput = card.querySelector('.mcq-bn');
    const listContainer = card.querySelector('.mcq-vocab-list');
    if (!itInput || !listContainer) return;

    const itVal = itInput.value || '';
    const bnVal = bnInput ? bnInput.value || '' : '';
    const combinedText = `${itVal} ${bnVal}`;

    const regex = /<u>([\s\S]*?)<\/u>/gi;
    let match;
    const detectedWords = new Set();
    while ((match = regex.exec(combinedText)) !== null) {
        if (match[1] && match[1].trim()) {
            detectedWords.add(match[1].trim());
        }
    }

    const currentRows = Array.from(listContainer.querySelectorAll('.vocab-card-item'));
    const currentWordsMap = new Map();
    currentRows.forEach(row => {
        const it = row.querySelector('.vocab-it')?.value;
        if (it) currentWordsMap.set(it, row);
    });

    currentRows.forEach(row => {
        const it = row.querySelector('.vocab-it')?.value;
        if (it && !detectedWords.has(it)) {
            row.remove();
        }
    });

    detectedWords.forEach(word => {
        if (!currentWordsMap.has(word)) {
            addMcqVocabRow(listContainer, word, '', '');
        }
    });
}

function addMcqVocabRow(container, italian = '', bangla = '', image = '') {
    const card = document.createElement('div');
    card.className = 'vocab-card-item';
    card.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-bottom: 4px;';
    card.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; background: rgba(0,0,0,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 6px;">
            <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between;">
                <input type="hidden" class="vocab-it" value="${italian.replace(/"/g, '&quot;')}">
                <span style="font-size: 11px; font-weight: bold; color: var(--accent-green);">Word: <u>${italian}</u></span>
                <input type="text" class="vocab-bn form-control form-control-sm" value="${bangla.replace(/"/g, '&quot;')}" required placeholder="Translation" style="border-radius: 6px; font-size: 11px; font-weight: bold; background: var(--bg-page); color: var(--text-primary); border: 1px solid var(--border-card); padding: 2px 6px; max-width: 140px; height: 26px;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px;">
                <span style="font-size: 9px; color: var(--text-secondary);">Image (Optional)</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="file" class="vocab-img-file" accept="image/*" style="font-size: 9px; max-width: 100px; cursor: pointer;" onchange="previewVocabRowImage(this)">
                    <input type="hidden" class="vocab-img-path" value="${image}">
                    <img class="vocab-img-preview" src="${image}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-card); ${image ? 'display: block;' : 'display: none;'}">
                </div>
            </div>
        </div>
    `;
    container.appendChild(card);
}

function addPageMcqRow(id = '', italian = '', bangla = '', isVero = '1', sortOrder = 0, qImage = '', qAudio = '', qVideo = '', qVocab = null) {
    const list = document.getElementById('page-mcq-list');
    if (!list) return;
    const card = document.createElement('div');
    card.className = 'mcq-card-item';
    card.style.cssText = 'display: flex; flex-direction: column; gap: 8px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); position: relative; transition: all 0.2s; margin-bottom: 4px;';
    const isVeroVal = (isVero === true || isVero === 1 || isVero === '1' || isVero === 'true') ? '1' : '0';

    card.innerHTML = `
        <input type="hidden" class="mcq-id" value="${id}">
        
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-card); padding-bottom: 6px; margin-bottom: 4px;">
            <span style="font-size: 12px; font-weight: 800; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-question" style="color: var(--accent-orange);"></i>
                Question Statement
            </span>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" class="btn btn-sm btn-underline-it" style="background: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Underline selected Italian text (Ctrl+U)"><i class="fa-solid fa-underline"></i> IT</button>
                <button type="button" class="btn btn-sm btn-underline-bn" style="background: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Underline selected Bangla text (Ctrl+U)"><i class="fa-solid fa-underline"></i> BN</button>
                <button type="button" class="btn btn-sm" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; transition: all 0.2s;" onclick="this.closest('.mcq-card-item').remove()" title="Delete MCQ">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="position: relative; display: flex; align-items: center;">
                <input type="text" class="mcq-it form-control form-control-sm" value="${italian.replace(/"/g, '&quot;')}" required placeholder="Italian Statement" style="border-radius: 8px; font-size: 13px; font-weight: 600; background: var(--bg-page); color: var(--text-primary); border: 1px solid var(--border-card); height: 36px; width: 100%;">
            </div>
            <div style="position: relative; display: flex; align-items: center;">
                <input type="text" class="mcq-bn form-control form-control-sm" value="${bangla.replace(/"/g, '&quot;')}" placeholder="Bangla Translation" style="border-radius: 8px; font-size: 13px; font-weight: 600; background: var(--bg-page); color: var(--text-primary); border: 1px solid var(--border-card); height: 36px; width: 100%;">
            </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">Serial/Order:</span>
                <input type="number" class="mcq-sort-order form-control form-control-sm" value="${sortOrder}" style="width: 60px; height: 28px; border-radius: 6px; font-weight: 800; text-align: center; background: var(--bg-page); border: 1px solid var(--border-card);">
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-key" style="color: var(--accent-green);"></i> Correct Answer
                </span>
                <select class="mcq-is-vero form-control form-control-sm" style="border-radius: 8px; font-size: 12px; font-weight: bold; background: var(--bg-page); border: 1px solid var(--border-card); padding: 4px 10px; max-width: 140px; height: 32px; cursor: pointer; transition: all 0.2s;" onchange="updateMcqDropdownColor(this)">
                    <option value="1" ${isVeroVal === '1' ? 'selected' : ''}>VERO (সত্য)</option>
                    <option value="0" ${isVeroVal === '0' ? 'selected' : ''}>FALSO (মিথ্যা)</option>
                </select>
            </div>
        </div>

        <!-- Toggle for Media & Vocab -->
        <div style="margin-top: 6px;">
            <button type="button" class="btn btn-sm btn-outline-secondary toggle-mcq-media" style="width: 100%; border-radius: 8px; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.02); border: 1px solid var(--border-card);" onclick="toggleMcqMediaSection(this)">
                <i class="fa-solid fa-photo-film" style="color: var(--accent-green);"></i>
                <span>Show Media & Vocabulary Details</span>
            </button>
        </div>

        <!-- MCQ Media & Vocabulary Area (Hidden by default) -->
        <div class="mcq-media-vocab-container" style="display: none; flex-direction: column; gap: 10px; border-top: 1.5px dashed var(--border-card); margin-top: 10px; padding-top: 10px;">
            
            <!-- MCQ Vocabulary Underlines -->
            <div class="form-group">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px; display: block;">
                    Vocabulary Translation & Word Images
                </label>
                <div class="mcq-vocab-list" style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--border-card); border-radius: 8px; background: rgba(0,0,0,0.01); max-height: 150px; overflow-y: auto;">
                    <!-- Auto populated based on <u> tags -->
                </div>
            </div>

            <!-- MCQ Image -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary);">Question Image</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="file" class="mcq-image-file form-control form-control-sm" accept="image/*" style="flex: 1;" onchange="previewMcqImage(this)">
                    <input type="hidden" class="mcq-image-path" value="${qImage}">
                    <img class="mcq-image-preview" src="${qImage}" style="width: 40px; height: 40px; border-radius: 6px; border: 1px solid var(--border-card); object-fit: cover; ${qImage ? 'display: block;' : 'display: none;'}">
                </div>
            </div>

            <!-- MCQ Audio -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary);">Audio Voiceover File</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="file" class="mcq-audio-file form-control form-control-sm" accept="audio/*" style="flex: 1;" onchange="previewMcqAudio(this)">
                    <input type="hidden" class="mcq-audio-path" value="${qAudio}">
                    <audio class="mcq-audio-preview" src="${qAudio}" controls style="width: 120px; height: 28px; ${qAudio ? 'display: block;' : 'display: none;'}"></audio>
                </div>
            </div>

            <!-- MCQ Video -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary);">Video File or YouTube URL</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <input type="file" class="mcq-video-file form-control form-control-sm" accept="video/*" style="flex: 1; min-width: 140px;" onchange="previewMcqVideo(this)">
                    <input type="text" class="mcq-video-url form-control form-control-sm" value="${qVideo && qVideo.startsWith('http') ? qVideo : ''}" placeholder="Or YouTube Video URL..." style="flex: 1; min-width: 140px;">
                    <input type="hidden" class="mcq-video-path" value="${qVideo && !qVideo.startsWith('http') ? qVideo : ''}">
                </div>
                <video class="mcq-video-preview" src="${qVideo && !qVideo.startsWith('http') ? qVideo : ''}" controls style="width: 100%; max-height: 80px; border-radius: 6px; background: #000; margin-top: 4px; ${qVideo && !qVideo.startsWith('http') ? 'display: block;' : 'display: none;'}"></video>
            </div>

        </div>
    `;
    list.appendChild(card);

    // Style select initial state
    const select = card.querySelector('.mcq-is-vero');
    if (select) updateMcqDropdownColor(select);

    // Bind Underline helpers
    const itBtn = card.querySelector('.btn-underline-it');
    const bnBtn = card.querySelector('.btn-underline-bn');
    const itInput = card.querySelector('.mcq-it');
    const bnInput = card.querySelector('.mcq-bn');
    const listContainer = card.querySelector('.mcq-vocab-list');

    // Load initial vocabulary if any
    if (qVocab) {
        let vocabArr = [];
        try {
            vocabArr = typeof qVocab === 'string' ? JSON.parse(qVocab) : qVocab;
        } catch (e) { }
        if (Array.isArray(vocabArr)) {
            vocabArr.forEach(item => addMcqVocabRow(listContainer, item.italian, item.bangla, item.image));
        }
    }

    if (itBtn && itInput) {
        itBtn.onclick = (e) => {
            e.preventDefault();
            toggleUnderlineOnSelection(itInput);
            updateMcqVocabList(card);
        };
    }
    if (bnBtn && bnInput) {
        bnBtn.onclick = (e) => {
            e.preventDefault();
            toggleUnderlineOnSelection(bnInput);
            updateMcqVocabList(card);
        };
    }

    itInput.addEventListener('input', () => updateMcqVocabList(card));
    bnInput.addEventListener('input', () => updateMcqVocabList(card));
}

// Global text underline toggle helper
window.toggleUnderlineOnSelection = function (inputEl) {
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    if (start === end) {
        // If no text is selected, show toast
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'শব্দটি সিলেক্ট করে বাটন ক্লিক করুন!',
                showConfirmButton: false,
                timer: 3000
            });
        }
        return;
    }

    const value = inputEl.value;
    const selectedText = value.substring(start, end);

    // Check if selected text is already wrapped in <u>...</u>
    const uReg = /^<u>([\s\S]*)<\/u>$/i;
    let newValue;
    let newSelectionStart;
    let newSelectionEnd;

    if (uReg.test(selectedText)) {
        // Unwrap
        const unwrapped = selectedText.replace(uReg, '$1');
        newValue = value.substring(0, start) + unwrapped + value.substring(end);
        newSelectionStart = start;
        newSelectionEnd = start + unwrapped.length;
    } else {
        // Wrap
        const wrapped = `<u>${selectedText}</u>`;
        newValue = value.substring(0, start) + wrapped + value.substring(end);
        newSelectionStart = start;
        newSelectionEnd = start + wrapped.length;
    }

    inputEl.value = newValue;
    inputEl.focus();
    inputEl.setSelectionRange(newSelectionStart, newSelectionEnd);

    // Trigger input event
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
};

// Listen for Ctrl+U key shortcut globally on appropriate inputs
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            const isTargetInput = active.id === 'form-page-title-it' ||
                active.id === 'form-page-title-bn' ||
                active.id === 'form-page-content' ||
                active.id === 'form-page-content-bn' ||
                active.classList.contains('mcq-it') ||
                active.classList.contains('mcq-bn');
            if (isTargetInput) {
                e.preventDefault();
                toggleUnderlineOnSelection(active);
            }
        }
    }
});

// General Settings Functions
function fetchGeneralSettings() {
    fetch('/admin/api/settings')
        .then(response => response.json())
        .then(settings => {
            document.getElementById('settings-app-name').value = settings.app_name || '';

            // Logo preview
            const logoPreview = document.getElementById('settings-logo-preview');
            const logoPlaceholder = document.getElementById('settings-logo-placeholder');
            if (settings.app_logo) {
                logoPreview.src = settings.app_logo;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            } else {
                logoPreview.src = '';
                logoPreview.style.display = 'none';
                logoPlaceholder.style.display = 'block';
            }

            // Favicon preview
            const faviconPreview = document.getElementById('settings-favicon-preview');
            const faviconPlaceholder = document.getElementById('settings-favicon-placeholder');
            if (settings.favicon) {
                faviconPreview.src = settings.favicon;
                faviconPreview.style.display = 'block';
                faviconPlaceholder.style.display = 'none';
            } else {
                faviconPreview.src = '';
                faviconPreview.style.display = 'none';
                faviconPlaceholder.style.display = 'block';
            }
        })
        .catch(err => {
            console.error("Error fetching general settings: ", err);
            showToast("সেটিংস লোড করতে ব্যর্থ হয়েছে", "error");
        });
}

function saveGeneralSettingsForm(e) {
    e.preventDefault();
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const form = document.getElementById('general-settings-form');
    const formData = new FormData(form);

    fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(response => response.json())
        .then(res => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Save Settings';
            if (res.success) {
                showToast("সেটিংস সফলভাবে সংরক্ষিত হয়েছে");
                fetchGeneralSettings();
                
                // Live update the sidebar branding
                const brandText = document.querySelector('.sidebar-brand');
                if (brandText) {
                    brandText.innerHTML = `<span class="brand-logo"><i class="fa-solid fa-graduation-cap"></i> ${res.data.app_name}</span><i class="fa-solid fa-bars-staggered action-icon" style="color: white; font-size: 16px;"></i>`;
                }

                // If favicon updated, reload page to apply immediately
                if (res.data.favicon) {
                    const faviconLink = document.querySelector("link[rel*='icon']");
                    if (faviconLink) {
                        faviconLink.href = res.data.favicon + '?t=' + new Date().getTime();
                    }
                }
                document.title = res.data.app_name + ' - Admin Panel';
            } else {
                let errorMsg = res.message || "সেটিংস সংরক্ষণ করা যায়নি";
                if (res.errors) {
                    errorMsg = Object.values(res.errors).flat().join('\n');
                }
                showToast(errorMsg, "error");
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Save Settings';
            console.error("Error saving general settings: ", err);
            showToast("সার্ভার ত্রুটি, আবার চেষ্টা করুন", "error");
        });
}

// Hook up change listeners for image file inputs to show live preview before saving
document.addEventListener('DOMContentLoaded', () => {
    const appLogoInput = document.getElementById('settings-app-logo');
    if (appLogoInput) {
        appLogoInput.addEventListener('change', function() {
            const preview = document.getElementById('settings-logo-preview');
            const placeholder = document.getElementById('settings-logo-placeholder');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    const faviconInput = document.getElementById('settings-favicon');
    if (faviconInput) {
        faviconInput.addEventListener('change', function() {
            const preview = document.getElementById('settings-favicon-preview');
            const placeholder = document.getElementById('settings-favicon-placeholder');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});



