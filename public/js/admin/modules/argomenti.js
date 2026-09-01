// MBanglaPatente Admin Panel - Argomenti Module (Questions, Chapters, Pages & Vocabulary)

// ==========================================
// MCQ QUESTIONS MANAGEMENT OPERATIONS
// ==========================================

// Fetch Questions paginated list via AJAX
function fetchQuestions() {
    const filterCh = document.getElementById('filter-chapter');
    const chapter = filterCh ? filterCh.value : '';
    const pageSelect = document.getElementById('filter-page');
    const pageId = pageSelect ? pageSelect.value : '';
    const searchInput = document.getElementById('search-question');
    const search = searchInput ? searchInput.value : '';

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
            if (typeof questionsTotalCount !== 'undefined') {
                questionsTotalCount = data.total || 0;
            }
            renderQuestionsTable(data.data, data);
            updatePaginationControls(data);
        })
        .catch(err => {
            console.error(err);
            showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
        });
}

// Render table records
function renderQuestionsTable(questions, paginationData = null) {
    const tbody = document.getElementById('questions-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-questions');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('questions');

    if (!questions || questions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি</td></tr>';
        return;
    }

    const fromIndex = (paginationData && paginationData.from) ? paginationData.from : 1;

    questions.forEach((q, index) => {
        const tr = document.createElement('tr');
        const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
        const serialNo = q.sort_order && q.sort_order > 0 ? q.sort_order : (fromIndex + index);
        const chapObj = (typeof chaptersDict !== 'undefined' && chaptersDict[q.chapter]) ? chaptersDict[q.chapter] : null;
        const chapNum = chapObj ? (chapObj.chapter_number || q.chapter) : q.chapter;
        const pageTitle = q.page ? `Page ${q.page.sort_order || q.page.page_number || 1}: ${q.page.title}` : '<span style="opacity: 0.5;">Not Assigned</span>';

        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-question-checkbox" value="${q.id}" onchange="updateBulkDeleteButton('questions')"></td>
            <td style="text-align: center; font-weight: bold; color: var(--text-secondary);">${serialNo}</td>
            <td style="text-align: center; font-weight: 700; color: var(--accent-teal);">Ch ${chapNum}</td>
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
    const status = document.getElementById('pagination-status');
    if (status) {
        status.innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;
    }

    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    if (prevBtn) prevBtn.disabled = !data.prev_page_url;
    if (nextBtn) nextBtn.disabled = !data.next_page_url;
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
    if (!preview || !container) return;
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
    if (!preview || !container) return;
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
    if (!preview || !container) return;
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

function previewArgomentiPageImage(input) {
    const previewContainer = document.getElementById('form-page-image-preview-container');
    const previewImg = document.getElementById('form-page-image-preview');
    if (!previewContainer || !previewImg) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
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

    const populateAndSelectFirstChapter = () => {
        if (typeof chaptersDict !== 'undefined' && Object.keys(chaptersDict).length > 0) {
            const firstChapter = Object.keys(chaptersDict)[0];
            const formCh = document.getElementById('form-chapter');
            if (formCh) {
                formCh.value = firstChapter;
                syncChapterName(firstChapter);
            }
        }
    };

    if (typeof loadChaptersData === 'function' && (typeof chaptersDict === 'undefined' || Object.keys(chaptersDict).length === 0)) {
        loadChaptersData(populateAndSelectFirstChapter);
    } else {
        populateAndSelectFirstChapter();
    }

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
    document.getElementById('form-chapter-name').value = q.chapter_name || '';
    document.getElementById('form-italian').value = q.italian;
    document.getElementById('form-bangla').value = q.bangla;
    document.getElementById('question-vocab-tbody').innerHTML = '';

    const setupEditChapterDropdown = () => {
        const formCh = document.getElementById('form-chapter');
        if (formCh) formCh.value = q.chapter;
        syncChapterName(q.chapter);
        fetchPagesForChapterSelect(q.chapter, q.page_id);
    };

    if (typeof loadChaptersData === 'function' && (typeof chaptersDict === 'undefined' || Object.keys(chaptersDict).length === 0)) {
        loadChaptersData(setupEditChapterDropdown);
    } else {
        setupEditChapterDropdown();
    }

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
    if (Array.isArray(vocabArr) && vocabArr.length > 0) {
        vocabArr.forEach(item => {
            if (item) {
                const it = item.italian || item.word || item.italian_word || '';
                const bn = item.bangla || item.meaning || item.bangla_meaning || item.translation || '';
                const img = item.image || item.image_path || item.img || '';
                addQuestionVocabRow(it, bn, img);
            }
        });
    }

    // Auto-detect and populate any <u>...</u> tagged words from the Italian statement
    updateQuestionUnderlinedWordsList();

    const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
    document.getElementById('form-is-vero').value = isVero ? '1' : '0';
    if (document.getElementById('form-image-position')) {
        document.getElementById('form-image-position').value = q.image_position || 'left';
    }

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
    const image_position = document.getElementById('form-image-position') ? document.getElementById('form-image-position').value : 'left';
    formData.append('image_position', image_position);
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

// ==========================================
// MCQ CHAPTERS MANAGEMENT PANEL OPERATIONS
// ==========================================
let chapterAdminCurrentPage = 1;
let chapterAdminLastPage = 1;

function fetchChaptersAdmin(page = 1) {
    chapterAdminCurrentPage = page;
    const searchInput = document.getElementById('chapter-search');
    const perPageSelect = document.getElementById('chapter-per-page');
    const search = searchInput ? searchInput.value.trim() : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    const tbody = document.getElementById('admin-chapters-table-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading chapters...</td></tr>`;
    }

    const processChapterData = (data) => {
        let normalized = data;
        if (Array.isArray(data)) {
            normalized = {
                data: data,
                total: data.length,
                from: 1,
                to: data.length,
                current_page: 1,
                last_page: 1
            };
        }
        if (typeof selectAllAcrossPagesFlag !== 'undefined') {
            selectAllAcrossPagesFlag['chapters'] = false;
        }
        if (typeof chaptersTotalCount !== 'undefined') {
            chaptersTotalCount = normalized.total || 0;
        }
        chapterAdminLastPage = normalized.last_page || 1;

        renderChaptersTable(normalized.data || [], normalized.from || 1);
        updateChapterPaginationControls(normalized);
    };

    let url = `/admin/api/chapters/list?page=${page}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const fetchPromise = window.safeFetchJson ? safeFetchJson(url) : fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.json());

    fetchPromise
        .then(processChapterData)
        .catch(err => {
            // Fallback to legacy endpoint /admin/api/chapters
            let fallbackUrl = `/admin/api/chapters?page=${page}&per_page=${perPage}`;
            if (search) fallbackUrl += `&search=${encodeURIComponent(search)}`;
            (window.safeFetchJson ? safeFetchJson(fallbackUrl) : fetch(fallbackUrl, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.json()))
                .then(processChapterData)
                .catch(fallbackErr => {
                    console.error("Error loading chapters:", fallbackErr);
                    if (tbody) {
                        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--accent-red); padding: 30px;">অধ্যায় তালিকা লোড করতে সমস্যা হয়েছে</td></tr>`;
                    }
                });
        });
}

function fetchChapters() {
    fetchChaptersAdmin(1);
}

function renderChaptersTable(chapters, from = 1) {
    const tbody = document.getElementById('admin-chapters-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-chapters');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('chapters');

    if (!chapters || chapters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো অধ্যায় পাওয়া যায়নি</td></tr>';
        return;
    }

    chapters.forEach((ch, index) => {
        const serialNo = (from || 1) + index;
        const tr = document.createElement('tr');
        const coverImg = ch.image || ch.cover_image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&auto=format&fit=crop&q=60';
        const isStatusActive = ch.status === 1 || ch.status === true || ch.status === '1';

        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-chapter-checkbox" value="${ch.id}" onchange="updateBulkDeleteButton('chapters')"></td>
            <td><strong>#${serialNo}</strong></td>
            <td style="text-align: center;"><span style="font-weight: 800; color: var(--accent-orange);">Ch #${ch.chapter_number || ch.id}</span></td>
            <td style="text-align: center;"><img src="${coverImg}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&auto=format&fit=crop&q=60'"></td>
            <td><div style="font-weight: bold; color: var(--text-primary);">${ch.name}</div></td>
            <td><div style="font-weight: 500; color: var(--text-secondary);">${ch.bn_name || ''}</div></td>
            <td style="text-align: center;"><span style="font-weight:bold; background-color: var(--bg-content); padding: 2px 8px; border-radius: 10px; font-size:11px; border:1px solid var(--border-color);">${ch.question_count || 0} MCQs</span></td>
            <td style="text-align: center;">
                <button class="btn btn-sm" style="background-color: ${isStatusActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isStatusActive ? '#4CAF50' : '#ef4444'}; border: 1px solid ${isStatusActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; font-weight: bold; padding: 2px 8px; border-radius: 6px;" onclick="toggleChapterStatus(${ch.id})">
                    ${isStatusActive ? 'Active' : 'Disabled'}
                </button>
            </td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" onclick="openEditChapterModal(${ch.id}, ${ch.chapter_number || ch.id}, '${(ch.name || '').replace(/'/g, "\\'")}', '${(ch.bn_name || '').replace(/'/g, "\\'")}', ${ch.category_id || 2}, '${(ch.cover_image || ch.image || '').replace(/'/g, "\\'")}')" title="Edit Chapter" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteChapterAdmin(${ch.id})" title="Delete Chapter" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateChapterPaginationControls(data) {
    const status = document.getElementById('chapter-pagination-status');
    if (status) {
        status.innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;
    }

    const prevBtn = document.getElementById('btn-chapter-prev');
    const nextBtn = document.getElementById('btn-chapter-next');
    if (prevBtn) prevBtn.disabled = (data.current_page <= 1);
    if (nextBtn) nextBtn.disabled = (data.current_page >= data.last_page);
}

function prevChapterPage() {
    if (chapterAdminCurrentPage > 1) {
        fetchChaptersAdmin(chapterAdminCurrentPage - 1);
    }
}

function nextChapterPage() {
    if (chapterAdminCurrentPage < chapterAdminLastPage) {
        fetchChaptersAdmin(chapterAdminCurrentPage + 1);
    }
}

function openAddChapterModal() {
    const form = document.getElementById('chapter-form');
    if (form) form.reset();
    document.getElementById('form-chapter-crud-id').value = '';
    const title = document.getElementById('chapter-modal-title');
    if (title) title.innerText = 'Add New Chapter';
    const previewContainer = document.getElementById('chapter-cover-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const previewImg = document.getElementById('chapter-cover-preview-img');
    if (previewImg) previewImg.src = '';

    attachCoverFileListener();
    document.getElementById('chapter-modal').style.display = 'flex';
}

function openEditChapterModal(id, chapterNumber, nameIt, nameBn, categoryId, coverUrl) {
    const form = document.getElementById('chapter-form');
    if (form) form.reset();
    document.getElementById('form-chapter-crud-id').value = id;
    document.getElementById('form-chapter-number').value = chapterNumber || '';
    document.getElementById('form-chapter-name-it').value = nameIt || '';
    document.getElementById('form-chapter-name-bn').value = nameBn || '';

    const catSelect = document.getElementById('form-chapter-category-id');
    if (catSelect) catSelect.value = categoryId || 2;

    const title = document.getElementById('chapter-modal-title');
    if (title) title.innerText = 'Edit Chapter';

    const previewContainer = document.getElementById('chapter-cover-preview-container');
    const previewImg = document.getElementById('chapter-cover-preview-img');
    if (coverUrl && previewContainer && previewImg) {
        previewImg.src = coverUrl;
        previewContainer.style.display = 'block';
    } else if (previewContainer) {
        previewContainer.style.display = 'none';
    }

    attachCoverFileListener();
    document.getElementById('chapter-modal').style.display = 'flex';
}

function attachCoverFileListener() {
    const coverFileInput = document.getElementById('form-chapter-cover-file');
    if (coverFileInput && !coverFileInput.dataset.listenerAttached) {
        coverFileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.getElementById('chapter-cover-preview-img');
                    const container = document.getElementById('chapter-cover-preview-container');
                    if (img && container) {
                        img.src = e.target.result;
                        container.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        coverFileInput.dataset.listenerAttached = 'true';
    }
}

function closeChapterModal() {
    const modal = document.getElementById('chapter-modal');
    if (modal) modal.style.display = 'none';
}

function saveChapter(e) {
    e.preventDefault();
    const id = document.getElementById('form-chapter-crud-id').value;
    const chapterNumber = document.getElementById('form-chapter-number').value;
    const nameIt = document.getElementById('form-chapter-name-it').value.trim();
    const nameBn = document.getElementById('form-chapter-name-bn').value.trim();
    const catSelect = document.getElementById('form-chapter-category-id');
    const categoryId = catSelect ? catSelect.value : 2;
    const coverFile = document.getElementById('form-chapter-cover-file').files[0];

    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('name', nameIt);
    formData.append('bn_name', nameBn);
    formData.append('chapter_number', chapterNumber);

    if (coverFile) {
        formData.append('cover_image', coverFile);
    }

    const url = id ? `/admin/api/chapters/update/${id}` : '/admin/api/chapters/store';

    (window.safeFetchJson ? safeFetchJson(url, { method: 'POST', body: formData }) : fetch(url, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }, body: formData }).then(res => res.json()))
        .then(data => {
            closeChapterModal();
            showToast(id ? 'অধ্যায় সফলভাবে আপডেট করা হয়েছে' : 'নতুন অধ্যায় সফলভাবে যোগ করা হয়েছে');
            fetchChaptersAdmin(chapterAdminCurrentPage);
            if (typeof loadChaptersData === 'function') {
                loadChaptersData();
            }
        })
        .catch(err => {
            console.error("Error saving chapter:", err);
            showToast('অধ্যায় সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function toggleChapterStatus(id) {
    fetch(`/admin/api/chapters/toggle-status/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast('অধ্যায়ের স্ট্যাটাস পরিবর্তন করা হয়েছে');
            fetchChaptersAdmin(chapterAdminCurrentPage);
            if (typeof loadChaptersData === 'function') {
                loadChaptersData();
            }
        })
        .catch(err => {
            console.error(err);
            showToast('স্ট্যাটাস পরিবর্তন করা যায়নি');
        });
}

function deleteChapterAdmin(id) {
    if (confirm('আপনি কি নিশ্চিতভাবে এই অধ্যায়টি এবং এর সকল পেজ ডিলিট করতে চান?')) {
        fetch(`/admin/api/chapters/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('অধ্যায়টি সফলভাবে ডিলিট করা হয়েছে');
                fetchChaptersAdmin(chapterAdminCurrentPage);
                if (typeof loadChaptersData === 'function') {
                    loadChaptersData();
                }
            })
            .catch(err => {
                console.error(err);
                showToast('অধ্যায় ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

function deleteChapter(id) {
    deleteChapterAdmin(id);
}

// ==========================================
// ADMIN PAGES MANAGEMENT OPERATIONS
// ==========================================
let activeAdminChapterId = 1;
let adminPagesData = [];

function switchAdminSubTab(tabName) {
    const btnChapters = document.getElementById('tab-btn-chapters');
    const btnPages = document.getElementById('tab-btn-pages');
    const panelChapters = document.getElementById('admin-sub-panel-chapters');
    const panelPages = document.getElementById('admin-sub-panel-pages');

    if (tabName === 'chapters') {
        if (btnChapters) {
            btnChapters.style.backgroundColor = 'var(--accent-orange)';
            btnChapters.style.color = 'white';
            btnChapters.classList.remove('btn-secondary');
        }
        if (btnPages) {
            btnPages.style.backgroundColor = 'transparent';
            btnPages.style.color = 'var(--text-secondary)';
            btnPages.classList.add('btn-secondary');
        }
        if (panelChapters) panelChapters.style.display = 'block';
        if (panelPages) panelPages.style.display = 'none';

        fetchChaptersAdmin(chapterAdminCurrentPage);
    } else if (tabName === 'pages') {
        if (btnPages) {
            btnPages.style.backgroundColor = 'var(--accent-orange)';
            btnPages.style.color = 'white';
            btnPages.classList.remove('btn-secondary');
        }
        if (btnChapters) {
            btnChapters.style.backgroundColor = 'transparent';
            btnChapters.style.color = 'var(--text-secondary)';
            btnChapters.classList.add('btn-secondary');
        }
        if (panelChapters) panelChapters.style.display = 'none';
        if (panelPages) panelPages.style.display = 'block';

        populateAdminChapterSelectDropdown();
    }
}

function populateAdminChapterSelectDropdown() {
    const select = document.getElementById('admin-page-chapter-select');
    if (!select) return;

    fetch('/admin/api/chapters')
        .then(res => res.json())
        .then(chapters => {
            if (!Array.isArray(chapters) || chapters.length === 0) {
                select.innerHTML = '<option value="">No Chapters Available</option>';
                return;
            }

            select.innerHTML = '';
            chapters.forEach(ch => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                opt.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
                select.appendChild(opt);
            });

            // Populate the modal's chapter select dropdown
            const modalSelect = document.getElementById('form-page-chapter-id');
            if (modalSelect) {
                modalSelect.innerHTML = '';
                chapters.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.innerText = `Capitolo ${ch.chapter_number || ch.id}) ${ch.name}`;
                    modalSelect.appendChild(opt);
                });
            }

            if (!activeAdminChapterId || !chapters.some(c => c.id == activeAdminChapterId)) {
                activeAdminChapterId = chapters[0].id;
            }

            select.value = activeAdminChapterId;
            loadAdminPagesForSelectedChapter(activeAdminChapterId);
        })
        .catch(err => {
            console.error("Error fetching chapters for dropdown:", err);
        });
}

let pageTabCurrentPage = 1;
let pageTabLastPage = 1;

function loadAdminPagesForSelectedChapter(chapterId, page = 1) {
    let validChapId = parseInt(chapterId);
    if (!validChapId || isNaN(validChapId)) {
        const select = document.getElementById('admin-page-chapter-select');
        if (select && select.value) {
            validChapId = parseInt(select.value);
        }
    }
    if (!validChapId || isNaN(validChapId)) {
        if (typeof activeAdminChapterId !== 'undefined' && activeAdminChapterId) {
            validChapId = parseInt(activeAdminChapterId);
        }
    }
    if (!validChapId || isNaN(validChapId)) {
        console.warn("No valid chapter selected for pages.");
        return;
    }

    activeAdminChapterId = validChapId;
    pageTabCurrentPage = page;

    const tbody = document.getElementById('admin-pages-table-body');
    if (!tbody) return;

    const searchInput = document.getElementById('page-search');
    const perPageSelect = document.getElementById('page-per-page');
    const search = searchInput ? searchInput.value.trim() : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading pages...</td></tr>`;

    let url = `/admin/api/chapters/${activeAdminChapterId}/pages/list?page=${page}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (typeof selectAllAcrossPagesFlag !== 'undefined') {
                selectAllAcrossPagesFlag['pages'] = false;
            }
            if (typeof pagesTotalCount !== 'undefined') {
                pagesTotalCount = data.total || 0;
            }
            pageTabLastPage = data.last_page || 1;

            const pages = data.data || (Array.isArray(data) ? data : []);
            adminPagesData = pages;
            renderPagesTable(pages, data.from || 1);
            updatePagePaginationControls(data);
        })
        .catch(err => {
            console.error("Error loading chapter pages: ", err);
            tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading pages.</td></tr>`;
        });
}

function renderPagesTable(pages, from = 1) {
    const tbody = document.getElementById('admin-pages-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-pages');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('pages');

    if (!pages || pages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-secondary); padding: 30px;">No pages found under this chapter. Add a new page!</td></tr>`;
        return;
    }

    pages.forEach((p, index) => {
        const serialNo = (from || 1) + index;
        const tr = document.createElement('tr');
        const isStatusActive = p.status === 1 || p.status === true || p.status === '1';

        const imageBadge = p.image
            ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.15); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.3);">Yes</span>`
            : `<span class="badge" style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">No</span>`;

        const audioBadge = p.audio
            ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.15); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.3);">Yes</span>`
            : `<span class="badge" style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">No</span>`;

        const pdfBadge = p.pdf_path
            ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.15); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.3);">Yes</span>`
            : `<span class="badge" style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">No</span>`;

        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-page-checkbox" value="${p.id}" onchange="updateBulkDeleteButton('pages')"></td>
            <td><strong>#${serialNo}</strong></td>
            <td style="text-align: center;"><span style="font-weight: 800; color: var(--accent-orange);">Pagina ${p.sort_order || p.id}</span></td>
            <td><div style="font-weight: bold; color: var(--text-primary);">${p.title}</div></td>
            <td><div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${p.bn_title || ''}</div></td>
            <td style="text-align: center;">${imageBadge}</td>
            <td style="text-align: center;">${audioBadge}</td>
            <td style="text-align: center;">${pdfBadge}</td>
            <td style="text-align: center;"><span style="font-weight:bold; background-color: var(--bg-content); padding: 2px 8px; border-radius: 10px; font-size:11px; border:1px solid var(--border-color);">${p.questions_count || 0} MCQs</span></td>
            <td style="text-align: center;">
                <button class="btn btn-sm" style="background-color: ${isStatusActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isStatusActive ? '#4CAF50' : '#ef4444'}; border: 1px solid ${isStatusActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; font-weight: bold; padding: 2px 8px; border-radius: 6px;" onclick="togglePageStatus(${p.id})">
                    ${isStatusActive ? 'Active' : 'Disabled'}
                </button>
            </td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" onclick="openEditPageModal(${p.id}, '${(p.title || '').replace(/'/g, "\\'")}', '${(p.bn_title || '').replace(/'/g, "\\'")}', ${p.sort_order || 0}, '${(p.image || '').replace(/'/g, "\\'")}')" title="Edit Page" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deletePage(${p.id})" title="Delete Page" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePagePaginationControls(data) {
    const status = document.getElementById('page-pagination-status');
    if (status) {
        status.innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;
    }

    const prevBtn = document.getElementById('btn-page-prev');
    const nextBtn = document.getElementById('btn-page-next');
    if (prevBtn) prevBtn.disabled = (data.current_page <= 1);
    if (nextBtn) nextBtn.disabled = (data.current_page >= data.last_page);
}

function prevPageTab() {
    if (pageTabCurrentPage > 1) {
        loadAdminPagesForSelectedChapter(activeAdminChapterId, pageTabCurrentPage - 1);
    }
}

function nextPageTab() {
    if (pageTabCurrentPage < pageTabLastPage) {
        loadAdminPagesForSelectedChapter(activeAdminChapterId, pageTabCurrentPage + 1);
    }
}

function previewArgomentiPageImage(input) {
    const previewContainer = document.getElementById('form-page-image-preview-container');
    const previewImg = document.getElementById('form-page-image-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (previewImg) previewImg.src = e.target.result;
            if (previewContainer) previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function openAddPageModal() {
    const form = document.getElementById('page-form');
    if (form) form.reset();
    document.getElementById('form-page-crud-id').value = '';
    const title = document.getElementById('page-modal-title');
    if (title) title.innerText = 'Add Page';

    const modalSelect = document.getElementById('form-page-chapter-id');
    if (modalSelect && activeAdminChapterId) {
        modalSelect.value = activeAdminChapterId;
    }

    const orderInput = document.getElementById('form-page-order');
    if (orderInput) {
        orderInput.value = adminPagesData ? adminPagesData.length + 1 : 1;
    }

    const previewContainer = document.getElementById('form-page-image-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';

    document.getElementById('page-modal').style.display = 'flex';
}

function openEditPageModal(id, titleIt, titleBn, sortOrder, imagePath = '') {
    const form = document.getElementById('page-form');
    if (form) form.reset();
    document.getElementById('form-page-crud-id').value = id;
    document.getElementById('form-page-title-it').value = titleIt || '';
    document.getElementById('form-page-title-bn').value = titleBn || '';
    document.getElementById('form-page-order').value = sortOrder || 0;

    const modalSelect = document.getElementById('form-page-chapter-id');
    if (modalSelect && activeAdminChapterId) {
        modalSelect.value = activeAdminChapterId;
    }

    const previewContainer = document.getElementById('form-page-image-preview-container');
    const previewImg = document.getElementById('form-page-image-preview');
    if (imagePath && previewContainer && previewImg) {
        previewImg.src = imagePath;
        previewContainer.style.display = 'block';
    } else if (previewContainer) {
        previewContainer.style.display = 'none';
    }

    const title = document.getElementById('page-modal-title');
    if (title) title.innerText = 'Edit Page';

    document.getElementById('page-modal').style.display = 'flex';
}

function closePageModal() {
    const modal = document.getElementById('page-modal');
    if (modal) modal.style.display = 'none';
}

function savePage(e) {
    e.preventDefault();
    const id = document.getElementById('form-page-crud-id').value;
    const chapterId = document.getElementById('form-page-chapter-id').value || activeAdminChapterId;
    const sortOrder = document.getElementById('form-page-order').value;
    const titleIt = document.getElementById('form-page-title-it').value.trim();
    const titleBn = document.getElementById('form-page-title-bn').value.trim();
    const imageInput = document.getElementById('form-page-image');

    const formData = new FormData();
    formData.append('chapter_id', chapterId);
    formData.append('sort_order', sortOrder);
    formData.append('title', titleIt);
    formData.append('bn_title', titleBn);

    if (imageInput && imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    const url = id ? `/admin/api/pages/update/${id}` : '/admin/api/pages/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: formData
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok || data.status === 'error' || data.success === false) {
                const msg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'পেজ সংরক্ষণ করতে সমস্যা হয়েছে');
                showToast(msg, 'error');
                return;
            }
            closePageModal();
            showToast(id ? 'পেজ সফলভাবে আপডেট করা হয়েছে' : 'নতুন পেজ সফলভাবে যোগ করা হয়েছে');
            const targetChapId = (data && data.chapter_id) ? data.chapter_id : (chapterId || activeAdminChapterId);
            if (targetChapId) {
                activeAdminChapterId = parseInt(targetChapId);
                const select = document.getElementById('admin-page-chapter-select');
                if (select) select.value = activeAdminChapterId;
            }
            loadAdminPagesForSelectedChapter(activeAdminChapterId, pageTabCurrentPage);
            if (typeof loadChaptersData === 'function') {
                loadChaptersData();
            }
        })
        .catch(err => {
            console.error("Error saving page:", err);
            showToast('পেজ সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function togglePageStatus(id) {
    fetch(`/admin/api/pages/toggle-status/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast('পেজের স্ট্যাটাস পরিবর্তন করা হয়েছে');
            loadAdminPagesForSelectedChapter(activeAdminChapterId, pageTabCurrentPage);
        })
        .catch(err => {
            console.error(err);
            showToast('স্ট্যাটাস পরিবর্তন করা যায়নি');
        });
}

function deletePage(id) {
    if (confirm('আপনি কি নিশ্চিতভাবে এই পেজটি ডিলিট করতে চান?')) {
        fetch(`/admin/api/pages/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('পেজটি সফলভাবে ডিলিট করা হয়েছে');
                loadAdminPagesForSelectedChapter(activeAdminChapterId, pageTabCurrentPage);
            })
            .catch(err => {
                console.error(err);
                showToast('পেজ ডিলিট করতে সমস্যা হয়েছে');
            });
    }
}

// VOCABULARY & UNDERLINE HELPERS
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

    const currentRows = Array.from(tbody.querySelectorAll('tr'));
    const currentWordsMap = new Map();
    currentRows.forEach(row => {
        const it = row.querySelector('.vocab-it')?.value;
        if (it && it.trim()) currentWordsMap.set(it.trim().toLowerCase(), row);
    });

    detectedWords.forEach(word => {
        if (!currentWordsMap.has(word.trim().toLowerCase())) {
            addQuestionVocabRow(word.trim(), '', '');
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
    const card = input.closest('.vocab-card-item') || input.closest('tr');
    if (!card) return;
    const preview = card.querySelector('.vocab-img-preview');
    if (!preview) return;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        const pathInput = card.querySelector('.vocab-img-path');
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
    if (!preview) return;
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
    if (!preview) return;
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
    if (!preview) return;
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

        <div style="margin-top: 6px;">
            <button type="button" class="btn btn-sm btn-outline-secondary toggle-mcq-media" style="width: 100%; border-radius: 8px; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.02); border: 1px solid var(--border-card);" onclick="toggleMcqMediaSection(this)">
                <i class="fa-solid fa-photo-film" style="color: var(--accent-green);"></i>
                <span>Show Media & Vocabulary Details</span>
            </button>
        </div>

        <div class="mcq-media-vocab-container" style="display: none; flex-direction: column; gap: 10px; border-top: 1.5px dashed var(--border-card); margin-top: 10px; padding-top: 10px;">
            
            <div class="form-group">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px; display: block;">
                    Vocabulary Translation & Word Images
                </label>
                <div class="mcq-vocab-list" style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--border-card); border-radius: 8px; background: rgba(0,0,0,0.01); max-height: 150px; overflow-y: auto;">
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary);">Question Image</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="file" class="mcq-image-file form-control form-control-sm" accept="image/*" style="flex: 1;" onchange="previewMcqImage(this)">
                    <input type="hidden" class="mcq-image-path" value="${qImage}">
                    <img class="mcq-image-preview" src="${qImage}" style="width: 40px; height: 40px; border-radius: 6px; border: 1px solid var(--border-card); object-fit: cover; ${qImage ? 'display: block;' : 'display: none;'}">
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary);">Audio Voiceover File</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="file" class="mcq-audio-file form-control form-control-sm" accept="audio/*" style="flex: 1;" onchange="previewMcqAudio(this)">
                    <input type="hidden" class="mcq-audio-path" value="${qAudio}">
                    <audio class="mcq-audio-preview" src="${qAudio}" controls style="width: 120px; height: 28px; ${qAudio ? 'display: block;' : 'display: none;'}"></audio>
                </div>
            </div>

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

    const select = card.querySelector('.mcq-is-vero');
    if (select) updateMcqDropdownColor(select);

    const itBtn = card.querySelector('.btn-underline-it');
    const bnBtn = card.querySelector('.btn-underline-bn');
    const itInput = card.querySelector('.mcq-it');
    const bnInput = card.querySelector('.mcq-bn');
    const listContainer = card.querySelector('.mcq-vocab-list');

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
            if (typeof window.toggleUnderlineOnSelection === 'function') window.toggleUnderlineOnSelection(itInput);
            updateMcqVocabList(card);
        };
    }
    if (bnBtn && bnInput) {
        bnBtn.onclick = (e) => {
            e.preventDefault();
            if (typeof window.toggleUnderlineOnSelection === 'function') window.toggleUnderlineOnSelection(bnInput);
            updateMcqVocabList(card);
        };
    }

    itInput.addEventListener('input', () => updateMcqVocabList(card));
    bnInput.addEventListener('input', () => updateMcqVocabList(card));
}
