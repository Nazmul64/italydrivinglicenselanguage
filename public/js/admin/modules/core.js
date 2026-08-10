// MBanglaPatente Admin Panel - Core Module
// Set CSRF Token header for AJAX requests
const csrfToken = document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').getAttribute('content') : '';

// Sidebar drop-down logic
let currentPanel = 'dashboard';
let currentPage = 1;

// Toggle Dark/Light Mode Theme
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = document.getElementById('theme-toggle');
    if (themeIcon) {
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
}

// Initialize Theme from Storage
if (localStorage.getItem('admin-theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const themeIcon = document.getElementById('theme-toggle');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun action-icon';
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('show-mobile');
    if (overlay) overlay.classList.toggle('show');
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('show-mobile');
    if (overlay) overlay.classList.remove('show');
}

// Display panels switching
function switchPanel(panelId) {
    closeMobileSidebar();
    if (typeof stopAdminChatPolling === 'function') {
        stopAdminChatPolling();
    }

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
        if (typeof fetchQuestions === 'function') fetchQuestions();
    } else if (panelId === 'mcq-chapters') {
        if (typeof fetchChaptersAdmin === 'function') fetchChaptersAdmin();
    } else if (panelId === 'chat-room') {
        if (typeof startAdminChatPolling === 'function') startAdminChatPolling();
    } else if (panelId === 'categories') {
        if (typeof fetchCategories === 'function') fetchCategories();
    } else if (panelId === 'mcq-exams') {
        if (typeof loadAdminExamsList === 'function') loadAdminExamsList();
    } else if (panelId === 'sliders') {
        if (typeof fetchSliders === 'function') fetchSliders();
    } else if (panelId === 'popup-promo') {
        if (typeof fetchPopupPromo === 'function') fetchPopupPromo();
    } else if (panelId === 'home-cards') {
        if (typeof fetchHomeCards === 'function') fetchHomeCards();
    } else if (panelId === 'classes') {
        if (typeof fetchLectureClasses === 'function') fetchLectureClasses();
    } else if (panelId === 'live-classes') {
        if (typeof fetchLiveClasses === 'function') fetchLiveClasses();
    } else if (panelId === 'file-manager') {
        if (typeof fetchMediaFiles === 'function') fetchMediaFiles();
    } else if (panelId === 'sys-errors') {
        if (typeof fetchSystemErrors === 'function') fetchSystemErrors(1);
    } else if (panelId === 'sys-health') {
        if (typeof fetchDatabaseStatus === 'function') fetchDatabaseStatus();
        if (typeof fetchQueueStatus === 'function') fetchQueueStatus();
        if (typeof fetchSchedulerStatus === 'function') fetchSchedulerStatus();
    } else if (panelId === 'sys-api') {
        if (typeof fetchApiLogs === 'function') fetchApiLogs(1);
    } else if (panelId === 'sys-logs') {
        if (typeof fetchLaravelLogEntries === 'function') fetchLaravelLogEntries(1);
    } else if (panelId === 'sys-env') {
        if (typeof fetchServerInfo === 'function') fetchServerInfo();
        if (typeof fetchSecurityChecks === 'function') fetchSecurityChecks();
    } else if (panelId === 'admin-profile') {
        if (typeof fetchAdminProfilePanelData === 'function') fetchAdminProfilePanelData();
    } else if (panelId === 'customers') {
        if (typeof fetchCustomersList === 'function') fetchCustomersList();
    } else if (panelId === 'sys-backups') {
        if (typeof fetchBackupArchives === 'function') fetchBackupArchives();
    } else if (panelId === 'cartelli-categories') {
        if (typeof initCartelloCategories === 'function') initCartelloCategories();
    } else if (panelId === 'cartelli-chapters') {
        if (typeof switchCartelloAdminSubTab === 'function') switchCartelloAdminSubTab('chapters');
    } else if (panelId === 'cartelli-pages') {
        if (typeof initCartelloPages === 'function') initCartelloPages();
    } else if (panelId === 'cartelli-mcqs') {
        if (typeof initCartelloMcqs === 'function') initCartelloMcqs();
    } else if (panelId === 'dizionario') {
        if (typeof fetchDizionario === 'function') fetchDizionario();
    } else if (panelId === 'manuale') {
        if (typeof fetchManualeAdminData === 'function') fetchManualeAdminData();
    } else if (panelId === 'general-settings') {
        if (typeof fetchGeneralSettings === 'function') fetchGeneralSettings();
    } else if (panelId === 'server-mode') {
        if (typeof fetchServerModeSettings === 'function') fetchServerModeSettings();
    }
}

// Toast Messages
let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text-content');
    if (!toast || !toastText) return;
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
        const searchInput = document.getElementById('search-question');
        if (searchInput) searchInput.value = value;
        if (typeof fetchQuestions === 'function') fetchQuestions();
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
function populateChaptersSelectors(dataList = null) {
    const filterCh = document.getElementById('filter-chapter');
    const formCh = document.getElementById('form-chapter');
    if (!filterCh || !formCh) return;

    filterCh.innerHTML = '<option value="">সকল অধ্যায় (All Chapters)</option>';
    formCh.innerHTML = '';

    let list = [];
    if (Array.isArray(dataList) && dataList.length > 0) {
        list = [...dataList];
    } else {
        list = Object.values(chaptersDict);
    }

    list.sort((a, b) => {
        const numA = parseInt(a.chapter_number || a.id || 0);
        const numB = parseInt(b.chapter_number || b.id || 0);
        return numA - numB;
    });

    list.forEach(ch => {
        const num = ch.chapter_number || ch.id;
        const name = ch.name || '';
        filterCh.innerHTML += `<option value="${ch.id}">${num}. ${name}</option>`;
        formCh.innerHTML += `<option value="${ch.id}">${num}. ${name}</option>`;
    });
}

// Function to fetch chapters and update dropdowns dynamically
function loadChaptersData(onComplete = null) {
    return fetch('/admin/api/chapters')
        .then(res => res.json())
        .then(data => {
            chaptersDict = {};
            if (Array.isArray(data)) {
                data.sort((a, b) => {
                    const numA = parseInt(a.chapter_number || a.id || 0);
                    const numB = parseInt(b.chapter_number || b.id || 0);
                    return numA - numB;
                });

                data.forEach(ch => {
                    chaptersDict[ch.id] = {
                        id: ch.id,
                        chapter_number: ch.chapter_number || ch.id,
                        name: ch.name,
                        bn_name: ch.bn_name || ''
                    };
                });
            }

            populateChaptersSelectors(data);

            const sel = document.getElementById('admin-page-chapter-select');
            if (sel) {
                const prevVal = sel.value;
                sel.innerHTML = '';
                data.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.textContent = `Ch ${ch.chapter_number || ch.id} - ${ch.name}`;
                    sel.appendChild(opt);
                });

                if (data.length > 0) {
                    if (prevVal && data.some(ch => ch.id == prevVal)) {
                        sel.value = prevVal;
                    } else {
                        sel.value = data[0].id;
                        if (typeof loadAdminPagesForSelectedChapter === 'function') {
                            loadAdminPagesForSelectedChapter(data[0].id);
                        }
                    }
                }
            }

            const modalSel = document.getElementById('form-page-chapter-id');
            if (modalSel) {
                modalSel.innerHTML = '';
                data.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.textContent = `Ch ${ch.chapter_number || ch.id} - ${ch.name}`;
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
loadChaptersData();
document.addEventListener('DOMContentLoaded', () => {
    loadChaptersData();
});

function syncChapterName(val) {
    const nameInput = document.getElementById('form-chapter-name');
    if (nameInput) {
        const item = chaptersDict[val];
        if (item && typeof item === 'object') {
            nameInput.value = item.name || '';
        } else {
            nameInput.value = item || '';
        }
    }
    fetchPagesForChapterSelect(val);
}

function fetchPagesForChapterSelect(chapterId, selectedPageId = null) {
    const pageSelect = document.getElementById('form-page-id');
    if (!pageSelect) return;

    if (!chapterId) {
        pageSelect.innerHTML = '<option value="">Select Page / Subchapter...</option>';
        return;
    }

    pageSelect.innerHTML = '<option value="">Loading pages...</option>';

    fetch(`/admin/api/chapters/${chapterId}/pages`)
        .then(res => res.json())
        .then(pages => {
            pageSelect.innerHTML = '<option value="">Select Page / Subchapter...</option>';
            if (Array.isArray(pages)) {
                pages.forEach((p, idx) => {
                    const pageNum = p.sort_order || (idx + 1);
                    const selectedAttr = (selectedPageId && parseInt(selectedPageId) === p.id) ? 'selected' : '';
                    const titleStr = p.title || '';
                    const bnTitleStr = p.bn_title ? ` (${p.bn_title})` : '';
                    pageSelect.innerHTML += `<option value="${p.id}" ${selectedAttr}>Page ${pageNum}: ${titleStr}${bnTitleStr}</option>`;
                });
            }
        })
        .catch(err => {
            console.error("Error fetching chapter pages:", err);
            pageSelect.innerHTML = '<option value="">Error loading pages</option>';
        });
}

function onFilterChapterChange(chapterId) {
    const pageSelect = document.getElementById('filter-page');
    if (!pageSelect) return;

    if (!chapterId) {
        pageSelect.style.display = 'none';
        pageSelect.value = '';
        pageSelect.innerHTML = '<option value="">সকল পেজ (All Pages)</option>';
        if (typeof fetchQuestions === 'function') fetchQuestions();
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
            if (typeof fetchQuestions === 'function') fetchQuestions();
        })
        .catch(err => {
            console.error(err);
            pageSelect.innerHTML = '<option value="">Error loading pages</option>';
            if (typeof fetchQuestions === 'function') fetchQuestions();
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

// Admin Edit Profile & Password Functions
function openAdminEditProfileModal() {
    fetch('/admin/api/profile')
        .then(res => res.json())
        .then(data => {
            document.getElementById('admin-profile-name').value = data.name || '';
            document.getElementById('admin-profile-email').value = data.email || '';
            document.getElementById('admin-profile-password').value = '';
            
            const preview = document.getElementById('admin-avatar-preview');
            if (preview) {
                if (data.avatar) {
                    preview.innerHTML = `<img src="${data.avatar}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color); margin-top: 4px;">`;
                } else {
                    preview.innerHTML = '<span style="font-size: 11px; color: var(--text-secondary);">No avatar uploaded</span>';
                }
            }
            
            const modal = document.getElementById('admin-edit-profile-modal');
            if (modal) modal.style.display = 'flex';
        })
        .catch(err => {
            console.error("Error fetching admin profile: ", err);
            showToast('প্রোফাইল ডাটা লোড করতে ব্যর্থ হয়েছে');
        });
}

function closeAdminEditProfileModal() {
    const modal = document.getElementById('admin-edit-profile-modal');
    if (modal) modal.style.display = 'none';
}

function saveAdminProfileSettings(e) {
    e.preventDefault();
    const name = document.getElementById('admin-profile-name').value;
    const email = document.getElementById('admin-profile-email').value;
    const password = document.getElementById('admin-profile-password').value;
    const avatarInput = document.getElementById('admin-profile-avatar');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (avatarInput.files && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }

    showToast('প্রোফাইল আপডেট করা হচ্ছে...');

    fetch('/admin/api/profile/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeAdminEditProfileModal();
                showToast(data.message || 'প্রোফাইল সফলভাবে আপডেট হয়েছে');
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(data.error || 'প্রোফাইল সেভ করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error("Error saving profile: ", err);
            showToast('প্রোফাইল সেভ করতে সমস্যা হয়েছে');
        });
}

function fetchAdminProfilePanelData() {
    fetch('/admin/api/profile')
        .then(res => res.json())
        .then(data => {
            const nameEl = document.getElementById('panel-admin-profile-name');
            const emailEl = document.getElementById('panel-admin-profile-email');
            const passEl = document.getElementById('panel-admin-profile-password');
            const previewEl = document.getElementById('panel-admin-avatar-preview');

            if (nameEl) nameEl.value = data.name || '';
            if (emailEl) emailEl.value = data.email || '';
            if (passEl) passEl.value = '';

            if (previewEl) {
                if (data.avatar) {
                    previewEl.innerHTML = `<img src="${data.avatar}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border-color); box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`;
                } else {
                    previewEl.innerHTML = '<span style="font-size: 12px; color: var(--text-secondary);">No avatar uploaded</span>';
                }
            }
        })
        .catch(err => {
            console.error("Error loading panel profile: ", err);
            showToast('প্রোফাইল তথ্য লোড করতে ব্যর্থ হয়েছে');
        });
}

function saveAdminProfileSettingsFromPanel(e) {
    e.preventDefault();
    const name = document.getElementById('panel-admin-profile-name').value;
    const email = document.getElementById('panel-admin-profile-email').value;
    const password = document.getElementById('panel-admin-profile-password').value;
    const avatarInput = document.getElementById('panel-admin-profile-avatar');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (avatarInput.files && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }

    showToast('প্রোফাইল সেভ করা হচ্ছে...');

    fetch('/admin/api/profile/update', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'প্রোফাইল সফলভাবে আপডেট হয়েছে');
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(data.error || 'প্রোফাইল সেভ করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error("Error saving profile panel: ", err);
            showToast('প্রোফাইল সেভ করতে সমস্যা হয়েছে');
        });
}

// --- Customer Management (App Clients) JS Module ---
let customerSearchTimeout = null;

function debounceFetchCustomers() {
    clearTimeout(customerSearchTimeout);
    customerSearchTimeout = setTimeout(() => {
        fetchCustomersList();
    }, 300);
}

function fetchCustomersList() {
    const tbody = document.getElementById('customers-table-body');
    const searchInput = document.getElementById('search-customer-input');
    const searchVal = searchInput ? searchInput.value.trim() : '';

    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Loading customer list...</td></tr>';
    }

    const url = `/admin/api/clients?search=${encodeURIComponent(searchVal)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const clients = data.clients || [];
            if (document.getElementById('stat-cust-total')) document.getElementById('stat-cust-total').textContent = data.total_count || 0;
            if (document.getElementById('stat-cust-active')) document.getElementById('stat-cust-active').textContent = data.active_count || 0;
            if (document.getElementById('stat-cust-pending')) document.getElementById('stat-cust-pending').textContent = data.pending_count || 0;
            if (document.getElementById('stat-cust-blocked')) document.getElementById('stat-cust-blocked').textContent = data.blocked_count || 0;

            if (!tbody) return;
            tbody.innerHTML = '';

            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 25px;">No customers found.</td></tr>';
                return;
            }

            clients.forEach(c => {
                const tr = document.createElement('tr');
                const fullName = `${c.first_name || 'Guest'} ${c.last_name || 'User'}`.trim();
                const phone = c.phone || 'N/A';
                const regDate = c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : 'N/A';

                // Avatar rendering: Custom avatar or default styled avatar
                let avatarHTML = '';
                if (c.avatar) {
                    avatarHTML = `<img src="${c.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);">`;
                } else {
                    const initials = (c.first_name ? c.first_name[0] : 'G') + (c.last_name ? c.last_name[0] : 'U');
                    avatarHTML = `<div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(59, 130, 246, 0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; margin: 0 auto;">${initials.toUpperCase()}</div>`;
                }

                // License status badge
                let licenseBadge = '';
                if (c.is_blocked) {
                    licenseBadge = '<span class="badge" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">Disabled</span>';
                } else if (c.is_active) {
                    let daysLeftStr = '';
                    if (c.expires_at) {
                        const exp = new Date(c.expires_at);
                        const diffTime = exp - new Date();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        daysLeftStr = diffDays > 0 ? ` (${diffDays}d left)` : ' (Expired)';
                    }
                    licenseBadge = `<span class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">Active${daysLeftStr}</span>`;
                } else {
                    licenseBadge = '<span class="badge" style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">Pending</span>';
                }

                // Block status badge
                let blockBadge = c.is_blocked
                    ? '<span class="badge" style="background-color: #ef4444; color: #ffffff;">Blocked 🚫</span>'
                    : '<span class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #10b981;">Normal ✓</span>';

                // Actions buttons
                const blockBtnText = c.is_blocked ? '<i class="fa-solid fa-unlock"></i> Unblock' : '<i class="fa-solid fa-user-slash"></i> Block';
                const blockBtnClass = c.is_blocked ? 'btn-success' : 'btn-danger';

                tr.innerHTML = `
                    <td style="text-align: center;">${avatarHTML}</td>
                    <td style="font-weight: 700;">${fullName}</td>
                    <td><i class="fa-solid fa-phone" style="font-size: 11px; color: var(--text-secondary); margin-right: 4px;"></i> ${phone}</td>
                    <td style="text-align: center;">${licenseBadge}</td>
                    <td style="text-align: center;">${blockBadge}</td>
                    <td>${regDate}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-sm btn-primary" onclick="openGrantLicenseModal(${JSON.stringify(c).replace(/"/g, '&quot;')})" style="padding: 3px 8px; font-size: 11px; font-weight: bold; background-color: #10b981; border: none;"><i class="fa-solid fa-key"></i> License</button>
                        <button class="btn btn-sm ${blockBtnClass}" onclick="toggleCustomerBlocked(${c.id})" style="padding: 3px 8px; font-size: 11px; font-weight: bold;">${blockBtnText}</button>
                        <button class="btn btn-sm btn-secondary" onclick="deleteCustomer(${c.id})" style="padding: 3px 6px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error fetching customers: ", err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--accent-red); padding: 20px;">Error loading customer list.</td></tr>';
        });
}

function openGrantLicenseModal(client) {
    document.getElementById('license-form-client-id').value = client.id;
    document.getElementById('license-form-client-name').value = `${client.first_name || 'Guest'} ${client.last_name || 'User'} (${client.phone || 'N/A'})`;
    document.getElementById('license-form-preset-days').value = '365';
    document.getElementById('license-form-custom-days').value = '365';

    const modal = document.getElementById('assign-license-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAssignLicenseModal() {
    const modal = document.getElementById('assign-license-modal');
    if (modal) modal.style.display = 'none';
}

function submitAssignLicense(e) {
    e.preventDefault();
    const clientId = document.getElementById('license-form-client-id').value;
    const days = document.getElementById('license-form-custom-days').value;

    if (!clientId || !days) return;

    showToast('লাইসেন্স প্রদান করা হচ্ছে...');

    fetch(`/admin/api/clients/update-license/${clientId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ days: parseInt(days) })
    })
        .then(res => res.json())
        .then(data => {
            closeAssignLicenseModal();
            showToast(data.message || 'লাইসেন্স সফলভাবে আপডেট করা হয়েছে');
            fetchCustomersList();
        })
        .catch(err => {
            console.error("Error assigning license: ", err);
            showToast('লাইসেন্স প্রদান করতে সমস্যা হয়েছে');
        });
}

function toggleCustomerBlocked(clientId) {
    if (!confirm('আপনি কি এই কাস্টমারের স্ট্যাটাস (ব্লক/আনব্লক) পরিবর্তন করতে চান?')) return;

    fetch(`/admin/api/clients/toggle-blocked/${clientId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message || 'স্ট্যাটাস আপডেট করা হয়েছে');
            fetchCustomersList();
        })
        .catch(err => {
            console.error("Error toggling blocked status: ", err);
            showToast('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        });
}

function deleteCustomer(clientId) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই কাস্টমার রেকর্ডটি মুছে ফেলতে চান?')) return;

    fetch(`/admin/api/clients/delete/${clientId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.message || 'কাস্টমার ডাটা মুছে ফেলা হয়েছে');
            fetchCustomersList();
        })
        .catch(err => {
            console.error("Error deleting customer: ", err);
            showToast('কাস্টমার ডাটা মুছতে সমস্যা হয়েছে');
        });
}
