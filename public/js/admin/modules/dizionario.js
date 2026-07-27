// MBanglaPatente Admin Panel - Dictionary (Dizionario) Module

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

            const from = data.from || 0;
            const to = data.to || 0;
            const statusEl = document.getElementById('dizionario-pagination-status');
            if (statusEl) statusEl.innerText = `Showing ${from} to ${to} of ${data.total} entries`;
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

    document.getElementById('form-dizionario-image').value = '';
    document.getElementById('form-dizionario-audio').value = '';
    document.getElementById('form-dizionario-video').value = '';

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
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Success!',
                    text: id ? 'Word details updated successfully.' : 'New word added successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                showToast(id ? 'Word details updated successfully.' : 'New word added successfully.');
            }
            fetchDizionario(dizionarioCurrentPage);
            if (typeof fetchStats === 'function') fetchStats();
        })
        .catch(err => {
            console.error(err);
            showToast('শব্দটি সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteDizionarioWord(id) {
    if (typeof Swal !== 'undefined') {
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
                        if (typeof fetchStats === 'function') fetchStats();
                    })
                    .catch(err => showToast('শব্দটি ডিলিট করতে সমস্যা হয়েছে'));
            }
        });
    } else {
        if (confirm('Do you really want to delete this word?')) {
            fetch(`/admin/api/dizionario/delete/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken }
            })
                .then(res => res.json())
                .then(data => {
                    showToast('Word has been deleted.');
                    fetchDizionario(dizionarioCurrentPage);
                    if (typeof fetchStats === 'function') fetchStats();
                })
                .catch(err => showToast('শব্দটি ডিলিট করতে সমস্যা হয়েছে'));
        }
    }
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

    if (typeof Swal !== 'undefined') {
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
                            if (typeof fetchStats === 'function') fetchStats();
                        } else {
                            showToast(data.message || 'ডিলিট করতে সমস্যা হয়েছে');
                        }
                    })
                    .catch(err => showToast('ডিলিট করা যায়নি'));
            }
        });
    }
}
