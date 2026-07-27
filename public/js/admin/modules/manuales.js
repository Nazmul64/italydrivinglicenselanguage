// MBanglaPatente Admin Panel - Manuale (Theory Guidebook) Module

let manualeAdminData = [];

function fetchManualeAdminData() {
    const tbody = document.getElementById('manuale-table-body');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading theory topics...</td></tr>';
    }

    fetch('/api/admin/manuale')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                manualeAdminData = data.data;
                renderManualeAdminTable(manualeAdminData);
            } else {
                if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">No theory topics found</td></tr>';
            }
        })
        .catch(err => {
            console.error('Error fetching manuale data:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">Failed to load theory topics</td></tr>';
        });
}

function renderManualeAdminTable(data) {
    const tbody = document.getElementById('manuale-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">No theory topics found</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const imgHtml = item.image_path ? `
            <img src="${item.image_path}" style="max-height: 40px; max-width: 60px; border-radius: 6px; object-fit: contain; border: 1px solid var(--border-card);" alt="Illustration">
        ` : '<span style="color: var(--text-secondary);">-</span>';

        const statusBadge = item.status ? `
            <span class="status-badge active" onclick="toggleManualeStatus(${item.id})" style="cursor: pointer;" title="Click to disable">Active</span>
        ` : `
            <span class="status-badge inactive" onclick="toggleManualeStatus(${item.id})" style="cursor: pointer;" title="Click to enable">Inactive</span>
        `;

        const contentSnippet = item.content ? (item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content) : '-';

        row.innerHTML = `
            <td>#${item.id}</td>
            <td><strong>Capitolo ${item.chapter_number || (index + 1)}</strong></td>
            <td><strong>${item.title || ''}</strong></td>
            <td style="font-size: 12px; color: var(--text-secondary); max-width: 250px;">${contentSnippet}</td>
            <td style="text-align: center;">${imgHtml}</td>
            <td style="text-align: center;">${statusBadge}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-sm btn-secondary" onclick="editManuale(${item.id})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteManuale(${item.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addManualeVocabRow(word = '', bangla = '', imagePath = '') {
    const container = document.getElementById('manuale-vocab-list');
    if (!container) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'manuale-vocab-row-item';
    itemDiv.style.cssText = 'display: flex; gap: 8px; align-items: center; background: var(--bg-card); padding: 8px; border-radius: 8px; border: 1px solid var(--border-card); flex-wrap: wrap; margin-bottom: 4px;';

    const itDiv = document.createElement('div');
    itDiv.style.cssText = 'flex: 1; min-width: 120px;';
    const itInput = document.createElement('input');
    itInput.type = 'text';
    itInput.className = 'form-control form-control-sm manuale-vocab-it';
    itInput.placeholder = 'Italian Word';
    itInput.value = word;
    itDiv.appendChild(itInput);

    const bnDiv = document.createElement('div');
    bnDiv.style.cssText = 'flex: 1; min-width: 120px;';
    const bnInput = document.createElement('input');
    bnInput.type = 'text';
    bnInput.className = 'form-control form-control-sm manuale-vocab-bn';
    bnInput.placeholder = 'Bangla Translation';
    bnInput.value = bangla;
    bnDiv.appendChild(bnInput);

    const imgDiv = document.createElement('div');
    imgDiv.style.cssText = 'flex: 1; min-width: 140px; display: flex; align-items: center; gap: 6px;';

    const hiddenImgInput = document.createElement('input');
    hiddenImgInput.type = 'hidden';
    hiddenImgInput.className = 'manuale-vocab-existing-img';
    hiddenImgInput.value = imagePath;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.className = 'form-control form-control-sm manuale-vocab-img-file';
    fileInput.accept = 'image/*';
    fileInput.style.cssText = 'font-size: 11px; max-width: 130px;';

    const imgPreview = document.createElement('img');
    imgPreview.className = 'manuale-vocab-img-preview';
    imgPreview.style.cssText = 'max-height: 32px; max-width: 40px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border-card); display: ' + (imagePath ? 'block' : 'none') + ';';
    if (imagePath) imgPreview.src = imagePath;

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    imgDiv.appendChild(hiddenImgInput);
    imgDiv.appendChild(fileInput);
    imgDiv.appendChild(imgPreview);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn-sm btn-danger';
    delBtn.title = 'Delete Word';
    delBtn.style.cssText = 'padding: 4px 8px;';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.addEventListener('click', function () {
        itemDiv.remove();
    });

    itemDiv.appendChild(itDiv);
    itemDiv.appendChild(bnDiv);
    itemDiv.appendChild(imgDiv);
    itemDiv.appendChild(delBtn);

    container.appendChild(itemDiv);
}

function updateManualeUnderlinedWordsList() {
    const listContainer = document.getElementById('manuale-vocab-list');
    if (!listContainer) return;

    const content = document.getElementById('form-manuale-content')?.value || '';
    const regex = /<u>([\s\S]*?)<\/u>/gi;
    let match;
    const detectedWords = new Set();
    while ((match = regex.exec(content)) !== null) {
        const word = match[1].trim();
        if (word) {
            detectedWords.add(word);
        }
    }

    const currentRows = listContainer.querySelectorAll('.manuale-vocab-row-item');
    const currentWordsMap = new Map();
    currentRows.forEach(row => {
        const wordInput = row.querySelector('.manuale-vocab-it');
        if (wordInput) {
            const val = wordInput.value.trim();
            if (val) currentWordsMap.set(val, row);
        }
    });

    currentWordsMap.forEach((row, word) => {
        if (!detectedWords.has(word)) {
            row.remove();
        }
    });

    detectedWords.forEach(word => {
        if (!currentWordsMap.has(word)) {
            addManualeVocabRow(word, '', '');
        }
    });
}

function openAddManualeModal() {
    document.getElementById('form-manuale-id').value = '';
    document.getElementById('form-manuale-title').value = '';
    document.getElementById('form-manuale-chapter').value = '1';
    document.getElementById('form-manuale-content').value = '';
    document.getElementById('form-manuale-image').value = '';
    document.getElementById('manuale-image-preview-container').style.display = 'none';
    const vocabList = document.getElementById('manuale-vocab-list');
    if (vocabList) vocabList.innerHTML = '';
    document.getElementById('manuale-modal-title').innerText = 'Add Theory Topic (Manuale)';
    document.getElementById('manuale-modal').style.display = 'flex';
}

function closeManualeModal() {
    document.getElementById('manuale-modal').style.display = 'none';
}

function insertUnderlineTag() {
    const textarea = document.getElementById('form-manuale-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
        const replacement = `<u>${selectedText}</u>`;
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    } else {
        const replacement = `<u>underlined_word</u>`;
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    }
    updateManualeUnderlinedWordsList();
}

function editManuale(id) {
    const item = manualeAdminData.find(m => m.id === id);
    if (!item) return;

    document.getElementById('form-manuale-id').value = item.id;
    document.getElementById('form-manuale-title').value = item.title || '';
    document.getElementById('form-manuale-chapter').value = item.chapter_number || 1;
    document.getElementById('form-manuale-content').value = item.content || '';
    document.getElementById('form-manuale-image').value = '';

    const previewContainer = document.getElementById('manuale-image-preview-container');
    const previewImg = document.getElementById('manuale-image-preview');
    if (item.image_path) {
        previewImg.src = item.image_path;
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }

    const vocabList = document.getElementById('manuale-vocab-list');
    if (vocabList) {
        vocabList.innerHTML = '';
        if (item.vocabulary) {
            let vocabs = item.vocabulary;
            if (typeof vocabs === 'string') {
                try { vocabs = JSON.parse(vocabs); } catch (e) { vocabs = []; }
            }
            if (Array.isArray(vocabs)) {
                vocabs.forEach(v => {
                    const w = v.italian || v.word || '';
                    const b = v.bangla || v.meaning || '';
                    const i = v.image || '';
                    addManualeVocabRow(w, b, i);
                });
            }
        }
    }

    document.getElementById('manuale-modal-title').innerText = 'Edit Theory Topic (Manuale)';
    document.getElementById('manuale-modal').style.display = 'flex';
}

function saveManuale(event) {
    event.preventDefault();
    const id = document.getElementById('form-manuale-id').value;
    const title = document.getElementById('form-manuale-title').value;
    const chapterNumber = document.getElementById('form-manuale-chapter').value;
    const content = document.getElementById('form-manuale-content').value;
    const imageInput = document.getElementById('form-manuale-image');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('chapter_number', chapterNumber);
    formData.append('content', content);

    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    const vocabRows = document.querySelectorAll('.manuale-vocab-row-item');
    vocabRows.forEach((row, idx) => {
        const itWord = row.querySelector('.manuale-vocab-it')?.value || '';
        const bnWord = row.querySelector('.manuale-vocab-bn')?.value || '';
        const existingImg = row.querySelector('.manuale-vocab-existing-img')?.value || '';
        const imgFileInput = row.querySelector('.manuale-vocab-img-file');

        formData.append(`vocab_italian[${idx}]`, itWord);
        formData.append(`vocab_bangla[${idx}]`, bnWord);
        formData.append(`vocab_existing_image[${idx}]`, existingImg);

        if (imgFileInput && imgFileInput.files.length > 0) {
            formData.append(`vocab_image_${idx}`, imgFileInput.files[0]);
        }
    });

    const url = id ? `/api/admin/manuale/update/${id}` : '/api/admin/manuale/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message || 'Saved successfully');
                closeManualeModal();
                fetchManualeAdminData();
            } else {
                showToast(data.message || 'Error saving theory topic');
            }
        })
        .catch(err => {
            console.error('Error saving manuale:', err);
            showToast('Save failed');
        });
}

function deleteManuale(id) {
    if (!confirm('Are you sure you want to delete this theory topic?')) return;

    fetch(`/api/admin/manuale/delete/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message || 'Deleted');
            fetchManualeAdminData();
        });
}

function toggleManualeStatus(id) {
    fetch(`/api/admin/manuale/toggle-status/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message || 'Status updated');
            fetchManualeAdminData();
        });
}
