// MBanglaPatente Admin Panel - Cartelli (Road Signs) Module

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
let adminCartelloChaptersList = [];

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
        .catch(() => showToast('ক্যাটাগরি তথ্য লোড করতে সমস্যা হয়েছে'));
}

function renderCartelloCategoriesTable(cats) {
    const tbody = document.getElementById('cartello-cats-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-categories');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('cartello-categories');

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

// ===== CHAPTERS =====
function fetchCartelloChapters() {
    const searchInput = document.getElementById('cartello-chapter-search');
    const search = searchInput ? searchInput.value : '';
    let url = `/admin/api/cartello-chapters?search=${encodeURIComponent(search)}`;

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
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('cartello-chapters');

    if (chaps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">কোনো চ্যাপ্টার পাওয়া যায়নি</td></tr>';
        return;
    }
    chaps.forEach((ch, index) => {
        const serialNo = index + 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-chapter-checkbox" value="${ch.id}" onchange="updateBulkDeleteButton('cartello-chapters')"></td>
            <td><strong>#${serialNo}</strong></td>
            <td><span style="background:var(--accent-orange); color:#000; padding:2px 8px; border-radius:4px; font-weight:700;">Ch ${ch.chapter_number}</span></td>
            <td><div style="font-weight:700;">${ch.name}</div></td>
            <td><div style="font-weight:600; color:var(--text-primary);">${ch.bn_name || ''}</div></td>
            <td style="text-align: right; white-space: nowrap;">
                <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0;" onclick="openEditCartelloChapterModal(${ch.id})" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm" style="background:var(--accent-red); color:#fff; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0;" onclick="deleteCartelloChapter(${ch.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddCartelloChapterModal() {
    editingCartelloChapterId = null;
    document.getElementById('cartello-chapter-modal-title').textContent = 'নতুন চ্যাপ্টার তৈরি করুন';
    document.getElementById('cartello-chapter-form').reset();
    const catInput = document.getElementById('cch-category-id');
    if (catInput) catInput.value = '1';
    document.getElementById('cartello-chapter-modal').style.display = 'flex';
}

function openEditCartelloChapterModal(id) {
    const ch = cartelloChaptersCache.find(c => c.id === id);
    if (!ch) return;
    editingCartelloChapterId = id;
    document.getElementById('cartello-chapter-modal-title').textContent = 'চ্যাপ্টার সম্পাদনা করুন';
    const catInput = document.getElementById('cch-category-id');
    if (catInput) catInput.value = ch.category_id || 1;
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

// ===== PAGES =====
function fetchCartelloPages() {
    const chapSelect = document.getElementById('filter-page-chapter-id');
    const chapId = chapSelect ? chapSelect.value : '';
    const searchInput = document.getElementById('cartello-page-search');
    const search = searchInput ? searchInput.value : '';
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
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('cartello-pages');

    if (pages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">কোনো পেজ পাওয়া যায়নি</td></tr>';
        return;
    }
    pages.forEach((p, index) => {
        const serialNo = index + 1;
        let mediaSrc = p.image || '';
        if (mediaSrc && !mediaSrc.startsWith('/') && !mediaSrc.startsWith('http')) {
            mediaSrc = '/' + mediaSrc;
        }
        const mediaHtml = mediaSrc ? `<img src="${mediaSrc}" style="width:50px; height:35px; object-fit:contain; border-radius:4px;" onerror="this.src='/images/signs/generic_pericolo.png'">` : 'N/A';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-page-checkbox" value="${p.id}" onchange="updateBulkDeleteButton('cartello-pages')"></td>
            <td><strong>#${serialNo}</strong></td>
            <td><span style="background:var(--accent-teal); color:#fff; padding:2px 8px; border-radius:4px; font-weight:700;">Page ${p.page_number}</span></td>
            <td><div style="font-weight:700;">${p.title}</div></td>
            <td><div style="font-weight:600; color:var(--text-primary);">${p.bn_title || ''}</div></td>
            <td style="text-align:center;">${mediaHtml}</td>
            <td style="text-align: right; white-space: nowrap;">
                <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-sm" style="background:var(--accent-blue); color:#fff; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0;" onclick="openEditCartelloPageModal(${p.id})" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm" style="background:var(--accent-red); color:#fff; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0;" onclick="deleteCartelloPage(${p.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
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

let cartelloMcqsPaginationData = null;

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
            if (typeof cartelloMcqsTotalCount !== 'undefined') {
                cartelloMcqsTotalCount = data.total || 0;
            }
            cartelloMcqsPaginationData = data;
            cartelloMcqsCache = data.data || [];
            renderCartelloMcqsTable(cartelloMcqsCache, data);
            renderCartelloMcqPagination(data);
        })
        .catch(() => showToast('MCQ প্রশ্ন তালিকা লোড করতে সমস্যা হয়েছে'));
}

function renderCartelloMcqsTable(mcqs, paginationData = null) {
    const tbody = document.getElementById('cartello-mcqs-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-cartello-mcqs');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('cartello-mcqs');

    if (mcqs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">কোনো MCQ পাওয়া যায়নি</td></tr>';
        return;
    }

    const pData = paginationData || cartelloMcqsPaginationData;
    const fromIndex = (pData && pData.from) ? pData.from : 1;

    mcqs.forEach((q, index) => {
        const serialNo = fromIndex + index;
        const catName = q.page && q.page.chapter && q.page.chapter.category ? (q.page.chapter.category.bn_name || q.page.chapter.category.name) : 'N/A';
        const chapName = q.page && q.page.chapter ? q.page.chapter.name : 'N/A';
        const pageNum = q.page ? (q.page.page_number || q.page.sort_order || '1') : 'N/A';
        const createdDate = q.created_at ? q.created_at.substring(0, 10) : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="select-cartello-mcq-checkbox" value="${q.id}" onchange="updateBulkDeleteButton('cartello-mcqs')"></td>
            <td style="text-align: center; font-weight: bold; color: var(--text-secondary);">#${serialNo}</td>
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
            <td style="text-align: right; white-space: nowrap;">
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
        .catch(err => console.error("Error loading cartello pages for chapter: ", err));
}

function previewCartelloChapterImage(input) {
    const previewContainer = document.getElementById('cch-image-preview');
    const previewImg = document.getElementById('cch-preview-img');
    if (!previewContainer || !previewImg) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
    }
}

function previewCartelloPageImage(input) {
    const previewContainer = document.getElementById('cpage-image-preview');
    const previewImg = document.getElementById('cpage-preview-img');
    if (!previewContainer || !previewImg) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
    }
}

function previewCartelloMcqQuestionImage(input) {
    const previewContainer = document.getElementById('cmcq-image-preview');
    if (!previewContainer) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" style="max-height:120px; border-radius:8px; object-fit:contain; border: 1px solid var(--border-color); margin-top: 6px;">`;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
    }
}

function openAddCartelloMcqModal() {
    editingCartelloMcqId = null;
    document.getElementById('cartello-mcq-modal-title').textContent = 'Add New Question';
    document.getElementById('cartello-mcq-form').reset();
    if (document.getElementById('cmcq-image-position')) document.getElementById('cmcq-image-position').value = 'left';
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
    if (document.getElementById('cmcq-image-position')) document.getElementById('cmcq-image-position').value = q.image_position || 'left';
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
