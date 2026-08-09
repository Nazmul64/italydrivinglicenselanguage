// MBanglaPatente Admin Panel - System Diagnostics, Monitoring, Settings & Utilities Module

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
            const filterCh = document.getElementById('filter-chapter');
            const searchQ = document.getElementById('search-question');
            bodyData.chapter = filterCh ? filterCh.value : '';
            bodyData.search = searchQ ? searchQ.value : '';
        } else if (type === 'chapters') {
            const searchCh = document.getElementById('chapter-search');
            bodyData.search = searchCh ? searchCh.value : '';
        } else if (type === 'pages') {
            const pageChapSel = document.getElementById('admin-page-chapter-select');
            const searchPg = document.getElementById('page-search');
            bodyData.chapter_id = pageChapSel ? pageChapSel.value : '';
            bodyData.search = searchPg ? searchPg.value : '';
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

                if (type === 'questions' && typeof fetchQuestions === 'function') fetchQuestions();
                else if (type === 'chapters' && typeof fetchChaptersAdmin === 'function') fetchChaptersAdmin(chapterAdminCurrentPage);
                else if (type === 'pages') {
                    const select = document.getElementById('admin-page-chapter-select');
                    const chapterId = select ? select.value : 1;
                    if (typeof loadAdminPagesForSelectedChapter === 'function') loadAdminPagesForSelectedChapter(chapterId, pageTabCurrentPage);
                }
                else if (type === 'categories' && typeof fetchCategories === 'function') fetchCategories();
                else if (type === 'cartello-categories' && typeof fetchCartelloCategories === 'function') fetchCartelloCategories();
                else if (type === 'cartello-chapters' && typeof fetchCartelloChapters === 'function') fetchCartelloChapters();
                else if (type === 'cartello-pages' && typeof fetchCartelloPages === 'function') fetchCartelloPages();
                else if (type === 'cartello-mcqs' && typeof fetchCartelloMcqs === 'function') fetchCartelloMcqs(cartelloQCurrentPage);
            } else {
                showToast(data.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('ডিলিট করা যায়নি। অনুগ্রহ করে ডিপেন্ডেন্ট ডাটা চেক করুন।');
        });
}

// Global text underline toggle helper
window.toggleUnderlineOnSelection = function (inputEl) {
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    if (start === end) {
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

    const uReg = /^<u>([\s\S]*)<\/u>$/i;
    let newValue;
    let newSelectionStart;
    let newSelectionEnd;

    if (uReg.test(selectedText)) {
        const unwrapped = selectedText.replace(uReg, '$1');
        newValue = value.substring(0, start) + unwrapped + value.substring(end);
        newSelectionStart = start;
        newSelectionEnd = start + unwrapped.length;
    } else {
        const wrapped = `<u>${selectedText}</u>`;
        newValue = value.substring(0, start) + wrapped + value.substring(end);
        newSelectionStart = start;
        newSelectionEnd = start + wrapped.length;
    }

    inputEl.value = newValue;
    inputEl.focus();
    inputEl.setSelectionRange(newSelectionStart, newSelectionEnd);

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

// ==========================================
// SYSTEM DIAGNOSTICS & MONITORING JAVASCRIPT
// ==========================================

let sysErrorsPage = 1;
let sysApiPage = 1;
let sysLogsPage = 1;

// --- 1. ERROR LOGS MODULE ---
function fetchSystemErrors(page = 1) {
    sysErrorsPage = page;
    const searchInput = document.getElementById('sys-errors-search');
    const perPageSelect = document.getElementById('sys-errors-per-page');
    const search = searchInput ? searchInput.value : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    let url = `/admin/api/system/errors?page=${sysErrorsPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderSystemErrorsTable(data.data);

            const status = document.getElementById('sys-errors-pagination-status');
            if (status) {
                status.textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;
            }

            const prevBtn = document.getElementById('btn-sys-errors-prev');
            const nextBtn = document.getElementById('btn-sys-errors-next');
            if (prevBtn) prevBtn.disabled = !data.prev_page_url;
            if (nextBtn) nextBtn.disabled = !data.next_page_url;
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
    if (!tbody) return;
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
    if (typeof Swal !== 'undefined') {
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
}

// --- 2. SYSTEM HEALTH & DIAGNOSTICS MODULE ---
function fetchDatabaseStatus() {
    const card = document.getElementById('db-health-check-card');
    if (!card) return;
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
            const conn = document.getElementById('sys-health-queue-connection');
            const pend = document.getElementById('sys-health-queue-pending');
            if (conn) conn.textContent = q.connection;
            if (pend) pend.textContent = q.pending_jobs;
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
            const tz = document.getElementById('sys-health-scheduler-tz');
            if (tz) tz.textContent = sch.timezone;
        });
}

function clearSystemCache(type) {
    if (typeof Swal !== 'undefined') {
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
}

function sendTestSMTPMail() {
    const emailInput = document.getElementById('test-smtp-email');
    const email = emailInput ? emailInput.value : '';
    if (!email) {
        showToast('অনুগ্রহ করে একটি ইমেইল টাইপ করুন');
        return;
    }

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Sending Test Email...',
            text: 'Please wait while SMTP checks connection...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
    }

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
            if (typeof Swal !== 'undefined') {
                if (data.success) {
                    Swal.fire('Sent!', data.message, 'success');
                } else {
                    Swal.fire('SMTP Error!', data.message, 'error');
                }
            } else {
                showToast(data.message);
            }
        })
        .catch(err => {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Failed!', 'outbound test failed. Check connection.', 'error');
            }
        });
}

function runDiagnosticsAudit() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Auditing System...',
            text: 'Running DB, routes, storage, and models checksum audits...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
    }

    fetch('/admin/api/system/diagnostics')
        .then(res => res.json())
        .then(data => {
            if (typeof Swal !== 'undefined') Swal.close();
            const card = document.getElementById('diagnostics-audit-results-card');
            const container = document.getElementById('diagnostics-audit-checklist-body');
            if (card) card.style.display = 'block';
            if (!container) return;
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
            if (typeof Swal !== 'undefined') Swal.fire('Error!', 'System diagnostic check failed.', 'error');
        });
}

// --- 3. API MONITOR LOGS ---
function fetchApiLogs(page = 1) {
    sysApiPage = page;
    const searchInput = document.getElementById('sys-api-search');
    const perPageSelect = document.getElementById('sys-api-per-page');
    const search = searchInput ? searchInput.value : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    let url = `/admin/api/system/api-logs?page=${sysApiPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderApiLogsTable(data.data);

            const status = document.getElementById('sys-api-pagination-status');
            if (status) status.textContent = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total} entries`;

            const prevBtn = document.getElementById('btn-sys-api-prev');
            const nextBtn = document.getElementById('btn-sys-api-next');
            if (prevBtn) prevBtn.disabled = !data.prev_page_url;
            if (nextBtn) nextBtn.disabled = !data.next_page_url;
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
    if (!tbody) return;
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
    const searchInput = document.getElementById('sys-logs-search');
    const levelSelect = document.getElementById('sys-logs-filter-level');
    const perPageSelect = document.getElementById('sys-logs-per-page');
    const search = searchInput ? searchInput.value : '';
    const level = levelSelect ? levelSelect.value : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    let url = `/admin/api/system/logs?page=${sysLogsPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (level) url += `&level=${level}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderLaravelLogEntries(data.data);

            const countInfo = document.getElementById('sys-logs-count-info');
            if (countInfo) countInfo.textContent = `${data.total} records found`;

            const from = (data.current_page - 1) * perPage + 1;
            const to = Math.min(data.current_page * perPage, data.total);
            const status = document.getElementById('sys-logs-pagination-status');
            if (status) status.textContent = `Showing ${data.total > 0 ? from : 0} to ${to} of ${data.total} entries`;

            const prevBtn = document.getElementById('btn-sys-logs-prev');
            const nextBtn = document.getElementById('btn-sys-logs-next');
            if (prevBtn) prevBtn.disabled = data.current_page === 1;
            if (nextBtn) nextBtn.disabled = data.current_page >= data.last_page;
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
    if (!consoleBox) return;
    consoleBox.innerHTML = '';

    if (!entries || entries.length === 0) {
        consoleBox.innerHTML = '<span style="color: var(--text-secondary);">No log entries found matching criteria.</span>';
        return;
    }

    entries.forEach(ent => {
        let color = '#94a3b8';
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
    if (typeof Swal !== 'undefined') {
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
}

// --- 5. ENVIRONMENT & SECURITY ---
function fetchServerInfo() {
    const body = document.getElementById('sys-env-server-info-body');
    if (!body) return;
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
    if (!body) return;
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
    if (!tbody) return;
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
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Creating backup archive...',
            text: 'Exporting system data, please wait...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
    }

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
            if (typeof Swal !== 'undefined') {
                if (data.success) {
                    Swal.fire('Created!', 'Backup file saved: ' + data.filename, 'success');
                    fetchBackupArchives();
                } else {
                    Swal.fire('Failed!', data.message, 'error');
                }
            }
        })
        .catch(err => {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Failed!', 'Could not execute data serialization.', 'error');
            }
        });
}

function deleteBackupArchive(filename) {
    if (typeof Swal !== 'undefined') {
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
}

function restoreBackupArchive(filename) {
    if (typeof Swal !== 'undefined') {
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
}

// General Settings Functions
function resetDefaultThemeColors() {
    const primaryInput = document.getElementById('settings-primary-color');
    const primaryPicker = document.getElementById('settings-primary-color-picker');
    const accentInput = document.getElementById('settings-accent-color');
    const accentPicker = document.getElementById('settings-accent-color-picker');
    const textInput = document.getElementById('settings-text-color');
    const textPicker = document.getElementById('settings-text-color-picker');

    if (primaryInput) primaryInput.value = '#F4F7FA';
    if (primaryPicker) primaryPicker.value = '#F4F7FA';
    if (accentInput) accentInput.value = '#4CAF50';
    if (accentPicker) accentPicker.value = '#4CAF50';
    if (textInput) textInput.value = '#1e293b';
    if (textPicker) textPicker.value = '#1e293b';

    if (typeof showToast === 'function') {
        showToast('থিম কালার ডিফল্ট মানে রিসেট করা হয়েছে');
    }
}

function safeParseAdminJson(res) {
    if (res.status === 419) {
        if (typeof showToast === 'function') showToast('সেশন বা CSRF টোকেন মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।', 'error');
        throw new Error('CSRF or Session expired');
    }
    if (res.status === 401) {
        if (typeof showToast === 'function') showToast('লগইন মেয়াদের শেষ হয়েছে, পুনরায় লগইন করুন।', 'error');
        setTimeout(() => { window.location.href = '/admin/login'; }, 1200);
        throw new Error('Unauthenticated');
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON');
    }
    return res.json();
}

function fetchGeneralSettings() {
    fetch('/admin/api/settings')
        .then(safeParseAdminJson)
        .then(settings => {
            if (!settings) return;
            const fieldsMap = {
                'settings-app-name': settings.app_name,
                'settings-exam-time': settings.exam_time_minutes,
                'settings-license-message': settings.license_message,
                'settings-home-desktop-columns': settings.home_desktop_columns,
                'settings-home-tablet-columns': settings.home_tablet_columns,
                'settings-home-mobile-columns': settings.home_mobile_columns,
                'settings-home-card-width': settings.home_card_width,
                'settings-home-card-height': settings.home_card_height,
                'settings-home-card-gap': settings.home_card_gap,
                'settings-schede-desktop-columns': settings.schede_desktop_columns,
                'settings-schede-mobile-columns': settings.schede_mobile_columns,
                'settings-icon-size-desktop': settings.icon_size_desktop,
                'settings-icon-size-mobile': settings.icon_size_mobile,
                'settings-title-font-size-desktop': settings.title_font_size_desktop,
                'settings-title-font-size-mobile': settings.title_font_size_mobile,
                'settings-subtitle-font-size-desktop': settings.subtitle_font_size_desktop,
                'settings-subtitle-font-size-mobile': settings.subtitle_font_size_mobile,
                'settings-cartelli-chapter-title-font-desktop': settings.cartelli_chapter_title_font_desktop,
                'settings-cartelli-chapter-title-font-mobile': settings.cartelli_chapter_title_font_mobile,
                'settings-cartelli-chapter-image-size-desktop': settings.cartelli_chapter_image_size_desktop,
                'settings-cartelli-chapter-image-size-mobile': settings.cartelli_chapter_image_size_mobile,
                'settings-cartelli-chapter-image-width-desktop': settings.cartelli_chapter_image_width_desktop,
                'settings-cartelli-chapter-image-width-mobile': settings.cartelli_chapter_image_width_mobile,
                'settings-cartelli-page-title-font-desktop': settings.cartelli_page_title_font_desktop,
                'settings-cartelli-page-title-font-mobile': settings.cartelli_page_title_font_mobile,
                'settings-cartelli-page-image-size-desktop': settings.cartelli_page_image_size_desktop,
                'settings-cartelli-page-image-size-mobile': settings.cartelli_page_image_size_mobile,
                'settings-cartelli-page-image-width-desktop': settings.cartelli_page_image_width_desktop,
                'settings-cartelli-page-image-width-mobile': settings.cartelli_page_image_width_mobile,
                'settings-argomenti-chapter-title-font-desktop': settings.argomenti_chapter_title_font_desktop,
                'settings-argomenti-chapter-title-font-mobile': settings.argomenti_chapter_title_font_mobile,
                'settings-argomenti-chapter-image-size-desktop': settings.argomenti_chapter_image_size_desktop,
                'settings-argomenti-chapter-image-size-mobile': settings.argomenti_chapter_image_size_mobile,
                'settings-argomenti-chapter-image-width-desktop': settings.argomenti_chapter_image_width_desktop,
                'settings-argomenti-chapter-image-width-mobile': settings.argomenti_chapter_image_width_mobile,
                'settings-argomenti-page-title-font-desktop': settings.argomenti_page_title_font_desktop,
                'settings-argomenti-page-title-font-mobile': settings.argomenti_page_title_font_mobile,
                'settings-argomenti-page-image-size-desktop': settings.argomenti_page_image_size_desktop,
                'settings-argomenti-page-image-size-mobile': settings.argomenti_page_image_size_mobile,
                'settings-argomenti-page-image-width-desktop': settings.argomenti_page_image_width_desktop,
                'settings-argomenti-page-image-width-mobile': settings.argomenti_page_image_width_mobile,
                'settings-argomenti-question-text-font-desktop': settings.argomenti_question_text_font_desktop,
                'settings-argomenti-question-text-font-mobile': settings.argomenti_question_text_font_mobile,
                'settings-argomenti-question-image-size-desktop': settings.argomenti_question_image_size_desktop,
                'settings-argomenti-question-image-size-mobile': settings.argomenti_question_image_size_mobile,
                'settings-qr-target-mode': settings.qr_target_mode || 'live',
                'settings-qr-live-url': settings.qr_live_url || 'http://mbanglapatenteb.com',
                'settings-qr-local-url': settings.qr_local_url || 'http://127.0.0.1:8000',
            };

            const qrCheckbox = document.getElementById('settings-qr-protection-enabled');
            if (qrCheckbox) {
                qrCheckbox.checked = settings.qr_protection_enabled == 1 || settings.qr_protection_enabled === true || settings.qr_protection_enabled === '1';
            }

            for (const [elemId, val] of Object.entries(fieldsMap)) {
                const elem = document.getElementById(elemId);
                if (elem && val !== undefined && val !== null) {
                    elem.value = val;
                }
            }

            if (document.getElementById('settings-primary-color')) {
                const pColor = settings.primary_color || '#F4F7FA';
                document.getElementById('settings-primary-color').value = pColor;
                if (document.getElementById('settings-primary-color-picker')) {
                    document.getElementById('settings-primary-color-picker').value = pColor;
                }
            }
            if (document.getElementById('settings-accent-color')) {
                const aColor = settings.accent_color || '#4CAF50';
                document.getElementById('settings-accent-color').value = aColor;
                if (document.getElementById('settings-accent-color-picker')) {
                    document.getElementById('settings-accent-color-picker').value = aColor;
                }
            }
            if (document.getElementById('settings-text-color')) {
                const tColor = settings.text_color || '#1e293b';
                document.getElementById('settings-text-color').value = tColor;
                if (document.getElementById('settings-text-color-picker')) {
                    document.getElementById('settings-text-color-picker').value = tColor;
                }
            }

            const logoPreview = document.getElementById('settings-logo-preview');
            const logoPlaceholder = document.getElementById('settings-logo-placeholder');
            if (logoPreview && logoPlaceholder) {
                if (settings.app_logo) {
                    logoPreview.src = settings.app_logo;
                    logoPreview.style.display = 'block';
                    logoPlaceholder.style.display = 'none';
                } else {
                    logoPreview.src = '';
                    logoPreview.style.display = 'none';
                    logoPlaceholder.style.display = 'block';
                }
            }

            const faviconPreview = document.getElementById('settings-favicon-preview');
            const faviconPlaceholder = document.getElementById('settings-favicon-placeholder');
            if (faviconPreview && faviconPlaceholder) {
                if (settings.favicon) {
                    faviconPreview.src = settings.favicon;
                    faviconPreview.style.display = 'block';
                    faviconPlaceholder.style.display = 'none';
                } else {
                    faviconPreview.src = '';
                    faviconPreview.style.display = 'none';
                    faviconPlaceholder.style.display = 'block';
                }
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
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    const form = document.getElementById('general-settings-form');
    const formData = new FormData(form);

    const qrCheckbox = document.getElementById('settings-qr-protection-enabled');
    if (qrCheckbox) {
        formData.set('qr_protection_enabled', qrCheckbox.checked ? '1' : '0');
    }

    fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(safeParseAdminJson)
        .then(res => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-save"></i> Save Settings';
            }
            if (res.success) {
                showToast("সেটিংস সফলভাবে সংরক্ষিত হয়েছে");
                fetchGeneralSettings();

                const brandText = document.querySelector('.sidebar-brand');
                if (brandText) {
                    brandText.innerHTML = `<span class="brand-logo"><i class="fa-solid fa-graduation-cap"></i> ${res.data.app_name}</span><i class="fa-solid fa-bars-staggered action-icon" style="color: white; font-size: 16px;"></i>`;
                }

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
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-save"></i> Save Settings';
            }
            console.error("Error saving general settings: ", err);
            showToast("সার্ভার ত্রুটি, আবার চেষ্টা করুন", "error");
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const appLogoInput = document.getElementById('settings-app-logo');
    if (appLogoInput) {
        appLogoInput.addEventListener('change', function () {
            const preview = document.getElementById('settings-logo-preview');
            const placeholder = document.getElementById('settings-logo-placeholder');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
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
        faviconInput.addEventListener('change', function () {
            const preview = document.getElementById('settings-favicon-preview');
            const placeholder = document.getElementById('settings-favicon-placeholder');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    const manualeContentEl = document.getElementById('form-manuale-content');
    if (manualeContentEl) {
        manualeContentEl.addEventListener('input', updateManualeUnderlinedWordsList);
        manualeContentEl.addEventListener('change', updateManualeUnderlinedWordsList);
    }

    const manualeImgInput = document.getElementById('form-manuale-image');
    if (manualeImgInput) {
        manualeImgInput.addEventListener('change', function () {
            const preview = document.getElementById('manuale-image-preview');
            const container = document.getElementById('manuale-image-preview-container');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    container.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});

// =========================================================================
// Server Mode Configuration JS Functions
// =========================================================================

function fetchServerModeSettings() {
    fetch('/admin/api/settings', {
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(safeParseAdminJson)
        .then(data => {
            const targetMode = data.qr_target_mode || data.server_mode || 'local';
            const liveUrl = data.qr_live_url || data.live_server_url || 'http://mbanglapatenteb.com';
            const localUrl = data.qr_local_url || data.local_server_url || 'http://10.0.2.2:8000';
            const activeUrl = data.active_base_url || (targetMode === 'live' ? liveUrl : localUrl);

            // Inputs
            const inputLive = document.getElementById('server-config-live-url');
            const inputLocal = document.getElementById('server-config-local-url');
            if (inputLive) inputLive.value = liveUrl;
            if (inputLocal) inputLocal.value = localUrl;

            // Update Radio selection and active mode visuals
            selectServerModeRadio(targetMode, activeUrl);
        })
        .catch(err => {
            console.error('Error fetching server mode settings:', err);
        });
}

function selectServerModeRadio(mode, activeUrl) {
    const radioLocal = document.getElementById('server-mode-radio-local');
    const radioLive = document.getElementById('server-mode-radio-live');
    const cardLocal = document.getElementById('card-option-local');
    const cardLive = document.getElementById('card-option-live');

    if (mode === 'live') {
        if (radioLive) radioLive.checked = true;
        if (radioLocal) radioLocal.checked = false;
        if (cardLive) {
            cardLive.style.borderColor = '#22c55e';
            cardLive.style.background = 'rgba(34, 197, 94, 0.05)';
        }
        if (cardLocal) {
            cardLocal.style.borderColor = 'var(--border-color, #cbd5e1)';
            cardLocal.style.background = 'var(--bg-card, #ffffff)';
        }
    } else {
        if (radioLocal) radioLocal.checked = true;
        if (radioLive) radioLive.checked = false;
        if (cardLocal) {
            cardLocal.style.borderColor = '#3b82f6';
            cardLocal.style.background = 'rgba(59, 130, 246, 0.05)';
        }
        if (cardLive) {
            cardLive.style.borderColor = 'var(--border-color, #cbd5e1)';
            cardLive.style.background = 'var(--bg-card, #ffffff)';
        }
    }

    updateActiveServerModeBanner(mode, activeUrl);
}

function updateActiveServerModeBanner(mode, activeUrl) {
    const banner = document.getElementById('active-server-mode-banner');
    const modeText = document.getElementById('active-server-mode-text');
    const icon = document.getElementById('active-server-icon');
    const displayUrl = document.getElementById('active-base-url-display');

    const liveUrlVal = document.getElementById('server-config-live-url')?.value || 'http://mbanglapatenteb.com';
    const localUrlVal = document.getElementById('server-config-local-url')?.value || 'http://10.0.2.2:8000';
    const currentActiveUrl = activeUrl || (mode === 'live' ? liveUrlVal : localUrlVal);

    if (displayUrl) {
        displayUrl.innerText = currentActiveUrl;
    }

    if (mode === 'live') {
        if (banner) {
            banner.style.background = '#dcfce7';
            banner.style.borderColor = '#22c55e';
        }
        if (modeText) {
            modeText.innerText = 'LIVE PRODUCTION SERVER MODE';
            modeText.style.color = '#15803d';
        }
        if (icon) {
            icon.className = 'fa-solid fa-globe';
            icon.style.color = '#15803d';
        }
    } else {
        if (banner) {
            banner.style.background = '#fef08a';
            banner.style.borderColor = '#eab308';
        }
        if (modeText) {
            modeText.innerText = 'LOCAL SERVER MODE';
            modeText.style.color = '#854d0e';
        }
        if (icon) {
            icon.className = 'fa-solid fa-server';
            icon.style.color = '#854d0e';
        }
    }
}

function quickSwitchServerMode(targetMode) {
    selectServerModeRadio(targetMode);

    const form = document.getElementById('server-mode-config-form');
    if (!form) return;
    const formData = new FormData(form);
    formData.set('qr_target_mode', targetMode);
    formData.set('app_name', 'mbanglapatenteb');

    fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(safeParseAdminJson)
        .then(data => {
            if (data.success) {
                showToast('\u2705 \u09b8\u09ab\u09b2! ' + (targetMode === 'live' ? '\ud83c\udf10 LIVE PRODUCTION SERVER' : '\ud83d\udda5\ufe0f LOCAL SERVER') + ' \u09ae\u09cb\u09a1\u09c7 \u09b8\u09c1\u0987\u099a \u09b9\u09af\u09bc\u09c7\u099b\u09c7!');
                fetchServerModeSettings();
            } else {
                showToast('\u274c ' + (data.message || '\u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0 \u09ae\u09cb\u09a1 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7'));
            }
        })
        .catch(err => {
            console.error('Error switching server mode:', err);
        });
}

function saveServerModeSettingsForm(e) {
    e.preventDefault();
    const btn = document.getElementById('save-server-config-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    const form = document.getElementById('server-mode-config-form');
    const formData = new FormData(form);
    formData.set('app_name', 'mbanglapatenteb');

    const selectedMode = document.querySelector('input[name="qr_target_mode"]:checked')?.value || 'local';
    formData.set('qr_target_mode', selectedMode);

    fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(safeParseAdminJson)
        .then(data => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-box-archive"></i> Save Server Settings';
            }
            if (data.success) {
                showToast('✅ সার্ভার সেটিংস সফলভাবে সংরক্ষিত হয়েছে! মোবাইল অ্যাপ রিস্টার্ট করলেই নতুন সেটিং কার্যকর হবে।');
                fetchServerModeSettings();
            } else {
                showToast('❌ ' + (data.message || 'সেটিংস সংরক্ষণ করা যায়নি'));
            }
        })
        .catch(err => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-box-archive"></i> Save Server Settings';
            }
            console.error('Error saving server settings:', err);
        });
}
