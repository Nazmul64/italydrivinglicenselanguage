// MBanglaPatente Admin Panel - Scheduled Exams (Scheda Esame) Module

let adminExamsData = [];

function loadAdminExamsList() {
    const tbody = document.getElementById('admin-exams-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px; margin-bottom:8px;"></i><br>Loading exams list...</td></tr>`;

    const searchInput = document.getElementById('admin-exam-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    fetch('/admin/api/exams')
        .then(res => res.json())
        .then(data => {
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            adminExamsData = list;
            tbody.innerHTML = '';

            const filtered = list.filter(ex => {
                return !searchVal ||
                    (ex.student_name && ex.student_name.toLowerCase().includes(searchVal)) ||
                    (ex.motorizzazione && ex.motorizzazione.toLowerCase().includes(searchVal)) ||
                    (ex.id && ex.id.toString().includes(searchVal));
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
