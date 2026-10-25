// MBanglaPatente Admin Panel - Live Passed Exams (Official Student Sheets PDF) Module

let adminLiveExamsData = [];

function loadLivePassedExamsList() {
    const tbody = document.getElementById('admin-live-exams-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading live passed exams...</td></tr>`;

    const searchInput = document.getElementById('admin-live-exam-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    fetch('/admin/api/live-passed-exams?search=' + encodeURIComponent(searchVal))
        .then(res => res.json())
        .then(resData => {
            const list = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
            adminLiveExamsData = list;
            tbody.innerHTML = '';

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">No live passed exams found.</td></tr>`;
                return;
            }

            list.forEach(ex => {
                const tr = document.createElement('tr');

                const statusBadge = ex.status === 'completato'
                    ? `<span class="badge" style="background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.2); font-weight: bold;">Completato</span>`
                    : `<span class="badge" style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); font-weight: bold;">Nuove</span>`;

                const scoresText = `C: <strong style="color: #4CAF50;">${ex.corrette ?? 29}</strong> | E: <strong style="color: #ef4444;">${ex.errori ?? 1}</strong> | N: <strong style="color: #f59e0b;">${ex.non_risposte ?? 0}</strong> | T: <strong>${ex.totale ?? 30}</strong>`;

                const pdfBtn = ex.pdf_url
                    ? `<a href="${ex.pdf_url}" target="_blank" class="btn btn-sm" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); font-weight: bold; padding: 4px 10px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-file-pdf"></i> View PDF
                       </a>`
                    : `<span style="color: var(--text-secondary); font-size: 11px;">No PDF</span>`;

                tr.innerHTML = `
                    <td><strong>#${ex.id}</strong></td>
                    <td><strong style="color: #0f172a;">${ex.nome || ''}</strong></td>
                    <td><span style="font-weight: 600; color: #475569;">${ex.motorizzazione || 'N/A'}</span></td>
                    <td>${ex.exam_date || ''}</td>
                    <td style="text-align: center;">${statusBadge}</td>
                    <td style="text-align: center;">${scoresText}</td>
                    <td style="text-align: center;">${pdfBtn}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditLivePassedExamModal(${ex.id})" title="Edit" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteLivePassedExam(${ex.id})" title="Delete" style="padding: 4px 8px; font-size: 11px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading live passed exams:", err);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading live passed exams.</td></tr>`;
        });
}

function openAddLivePassedExamModal() {
    document.getElementById('live-passed-exam-modal-title').innerText = 'Add Live Passed Exam';
    document.getElementById('form-live-exam-id').value = '';
    document.getElementById('form-live-exam-nome').value = '';
    document.getElementById('form-live-exam-motorizzazione').value = 'MODENA';
    document.getElementById('form-live-exam-date').value = new Date().toLocaleDateString('en-GB');
    document.getElementById('form-live-exam-status').value = 'completato';
    document.getElementById('form-live-exam-corrette').value = 29;
    document.getElementById('form-live-exam-errori').value = 1;
    document.getElementById('form-live-exam-non-risposte').value = 0;
    document.getElementById('form-live-exam-totale').value = 30;
    document.getElementById('form-live-exam-pdf').value = '';
    document.getElementById('form-live-exam-pdf-preview').style.display = 'none';

    document.getElementById('live-passed-exam-modal').style.display = 'flex';
}

function openEditLivePassedExamModal(id) {
    const ex = adminLiveExamsData.find(item => item.id == id);
    if (!ex) return;

    document.getElementById('live-passed-exam-modal-title').innerText = 'Edit Live Passed Exam #' + ex.id;
    document.getElementById('form-live-exam-id').value = ex.id;
    document.getElementById('form-live-exam-nome').value = ex.nome || '';
    document.getElementById('form-live-exam-motorizzazione').value = ex.motorizzazione || '';
    document.getElementById('form-live-exam-date').value = ex.exam_date || '';
    document.getElementById('form-live-exam-status').value = ex.status || 'completato';
    document.getElementById('form-live-exam-corrette').value = ex.corrette ?? 29;
    document.getElementById('form-live-exam-errori').value = ex.errori ?? 1;
    document.getElementById('form-live-exam-non-risposte').value = ex.non_risposte ?? 0;
    document.getElementById('form-live-exam-totale').value = ex.totale ?? 30;
    document.getElementById('form-live-exam-pdf').value = '';

    const preview = document.getElementById('form-live-exam-pdf-preview');
    const link = document.getElementById('form-live-exam-pdf-link');
    if (ex.pdf_url) {
        link.href = ex.pdf_url;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('live-passed-exam-modal').style.display = 'flex';
}

function closeLivePassedExamModal() {
    document.getElementById('live-passed-exam-modal').style.display = 'none';
}

function saveLivePassedExam(e) {
    e.preventDefault();
    const id = document.getElementById('form-live-exam-id').value;
    const isEdit = !!id;

    const formData = new FormData();
    formData.append('nome', document.getElementById('form-live-exam-nome').value);
    formData.append('motorizzazione', document.getElementById('form-live-exam-motorizzazione').value);
    formData.append('exam_date', document.getElementById('form-live-exam-date').value);
    formData.append('status', document.getElementById('form-live-exam-status').value);
    formData.append('corrette', document.getElementById('form-live-exam-corrette').value);
    formData.append('errori', document.getElementById('form-live-exam-errori').value);
    formData.append('non_risposte', document.getElementById('form-live-exam-non-risposte').value);
    formData.append('totale', document.getElementById('form-live-exam-totale').value);

    const pdfInput = document.getElementById('form-live-exam-pdf');
    if (pdfInput && pdfInput.files && pdfInput.files[0]) {
        formData.append('pdf_file', pdfInput.files[0]);
    }

    const url = isEdit ? `/admin/api/live-passed-exams/update/${id}` : '/admin/api/live-passed-exams/store';
    const btn = document.getElementById('btn-save-live-exam');
    if (btn) btn.disabled = true;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (btn) btn.disabled = false;
            closeLivePassedExamModal();
            showToast(isEdit ? 'লাইভ এক্সাম শিট আপডেট হয়েছে' : 'নতুন লাইভ এক্সাম শিট যুক্ত হয়েছে');
            loadLivePassedExamsList();
        })
        .catch(err => {
            if (btn) btn.disabled = false;
            console.error("Error saving live exam:", err);
            showToast('সংরক্ষণ করতে সমস্যা হয়েছে');
        });
}

function deleteLivePassedExam(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই পাস করা প্রার্থীর এক্সাম শিট মুছে ফেলতে চান?")) {
        fetch(`/admin/api/live-passed-exams/delete/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(res => res.json())
            .then(data => {
                showToast('লাইভ এক্সাম শিট সফলভাবে মুছে ফেলা হয়েছে');
                loadLivePassedExamsList();
            })
            .catch(err => {
                console.error("Error deleting live exam:", err);
                showToast('মুছতে সমস্যা হয়েছে');
            });
    }
}

// Auto calculate errors when correct score changes
document.addEventListener('DOMContentLoaded', function() {
    const corretteInput = document.getElementById('form-live-exam-corrette');
    const erroriInput = document.getElementById('form-live-exam-errori');
    const totaleInput = document.getElementById('form-live-exam-totale');
    if (corretteInput && erroriInput && totaleInput) {
        corretteInput.addEventListener('input', function() {
            const tot = parseInt(totaleInput.value) || 30;
            const corr = parseInt(corretteInput.value);
            if (!isNaN(corr) && corr <= tot && corr >= 0) {
                erroriInput.value = Math.max(0, tot - corr);
            }
        });
    }
});
