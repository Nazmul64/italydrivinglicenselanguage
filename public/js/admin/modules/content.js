// MBanglaPatente Admin Panel - Content Management Module (Sliders, Popup Promo, Home Cards, Videos & Categories)

// ==============================
// BANNER SLIDERS MANAGEMENT CRUD
// ==============================
function fetchSliders() {
    const tbody = document.getElementById('sliders-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading sliders...</td></tr>`;

    fetch('/admin/api/sliders')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No sliders found.</td></tr>`;
                return;
            }

            list.forEach(slider => {
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
// HOME NAVIGATION CARDS CRUD
let homeCardsCurrentPage = 1;

function fetchHomeCards(page = 1) {
    homeCardsCurrentPage = page;
    const tbody = document.getElementById('home-cards-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px;">Loading cards...</td></tr>`;

    const searchInput = document.getElementById('home-cards-search');
    const perPageSelect = document.getElementById('home-cards-per-page');
    const search = searchInput ? searchInput.value : '';
    const perPage = perPageSelect ? perPageSelect.value : 10;

    let url = `/admin/api/home-cards?page=${homeCardsCurrentPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const items = Array.isArray(data) ? data : (data.data || []);

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No cards found.</td></tr>`;
                return;
            }

            items.forEach(card => {
                const tr = document.createElement('tr');
                const colorVal = card.color || card.icon_color || '#3B82F6';
                const statusBadge = card.status ? '<span class="status-badge active">Active</span>' : '<span class="status-badge inactive">Inactive</span>';

                tr.innerHTML = `
                    <td>${card.id}</td>
                    <td style="text-align: center; font-weight: 800; color: var(--accent-orange);">${card.order_index}</td>
                    <td style="text-align: center;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background-color: ${colorVal}1a; color: ${colorVal}; font-size: 16px;">
                            <i class="${card.icon_class || 'fa-solid fa-shapes'}"></i>
                        </div>
                    </td>
                    <td style="font-weight: bold; color: var(--text-primary);">${card.title}</td>
                    <td>${card.subtitle || ''}</td>
                    <td><span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); border: 1px solid var(--border-color); font-weight: bold;">${card.screen_key}</span></td>
                    <td style="text-align: center;"><div style="width: 24px; height: 24px; border-radius: 6px; background-color: ${colorVal}; margin: 0 auto;"></div></td>
                    <td style="text-align: center;">${statusBadge}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditHomeCardModal(${JSON.stringify(card).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteHomeCard(${card.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            if (!Array.isArray(data)) {
                const total = data.total || items.length;
                const from = (data.current_page - 1) * perPage + 1;
                const to = Math.min(data.current_page * perPage, total);
                const status = document.getElementById('home-cards-pagination-status');
                if (status) status.textContent = `Showing ${total > 0 ? from : 0} to ${to} of ${total} entries`;

                const prevBtn = document.getElementById('btn-home-cards-prev');
                const nextBtn = document.getElementById('btn-home-cards-next');
                if (prevBtn) prevBtn.disabled = data.current_page === 1;
                if (nextBtn) nextBtn.disabled = data.current_page >= data.last_page;
            }
        })
        .catch(err => {
            console.error("Error loading cards: ", err);
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading cards.</td></tr>`;
        });
}

function prevHomeCardsPage() {
    if (homeCardsCurrentPage > 1) fetchHomeCards(homeCardsCurrentPage - 1);
}

function nextHomeCardsPage() {
    fetchHomeCards(homeCardsCurrentPage + 1);
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
// LECTURE VIDEOS MANAGEMENT CRUD
// ==============================
function fetchLectureClasses() {
    const tbody = document.getElementById('classes-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px;">Loading video lectures...</td></tr>`;

    fetch('/admin/api/classes')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 30px;">No video lectures found.</td></tr>`;
                return;
            }

            list.forEach(cls => {
                const vUrl = cls.video_url || cls.youtube_url || '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cls.id}</td>
                    <td><code style="background: rgba(16, 185, 129, 0.1); color: var(--accent-teal); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">${vUrl}</code></td>
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
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading video lectures.</td></tr>`;
        });
}

function openAddClassModal() {
    document.getElementById('class-modal-title').textContent = 'Add Lecture Video';
    document.getElementById('form-class-id').value = '';
    document.getElementById('form-class-url').value = '';
    document.getElementById('class-modal').style.display = 'flex';
}

function openEditClassModal(cls) {
    document.getElementById('class-modal-title').textContent = 'Edit Lecture Video';
    document.getElementById('form-class-id').value = cls.id;
    document.getElementById('form-class-url').value = cls.video_url || cls.youtube_url || '';
    document.getElementById('class-modal').style.display = 'flex';
}

function closeClassModal() {
    document.getElementById('class-modal').style.display = 'none';
}

function saveClass(e) {
    e.preventDefault();
    const id = document.getElementById('form-class-id').value;
    const videoUrl = document.getElementById('form-class-url').value;

    const formData = new FormData();
    formData.append('title', 'Lecture Video');
    formData.append('video_url', videoUrl);
    formData.append('youtube_url', videoUrl);

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
// LIVE SESSIONS MANAGEMENT CRUD
// ==============================
function fetchLiveClasses() {
    const tbody = document.getElementById('live-classes-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading live sessions...</td></tr>`;

    fetch('/admin/api/live-classes')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No live sessions scheduled.</td></tr>`;
                return;
            }

            list.forEach(cls => {
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

// ==============================
// CATEGORY MANAGEMENT OPERATIONS
// ==============================
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
    if (!tbody) return;
    tbody.innerHTML = '';

    const masterSelect = document.getElementById('bulk-select-categories');
    if (masterSelect) masterSelect.checked = false;
    if (typeof updateBulkDeleteButton === 'function') updateBulkDeleteButton('categories');

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

// ==============================
// POPUP PROMO MANAGEMENT
// ==============================
function fetchPopupPromo() {
    fetch('/admin/api/popup-promo')
        .then(res => res.json())
        .then(data => {
            const activeCheckbox = document.getElementById('popup-promo-active');
            const linkInput = document.getElementById('popup-promo-link');
            const previewImg = document.getElementById('popup-promo-preview-img');
            const previewCont = document.getElementById('popup-promo-preview-container');

            if (activeCheckbox) activeCheckbox.checked = data.is_active ? true : false;
            if (linkInput) linkInput.value = data.link_url || '';
            if (data.image_path && previewImg && previewCont) {
                previewImg.src = data.image_path;
                previewCont.style.display = 'block';
            } else if (previewCont) {
                previewCont.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Error loading popup promo settings: ", err);
            showToast('পপআপ প্রমো সেটিংস লোড করতে সমস্যা হয়েছে');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const popupPromoForm = document.getElementById('popup-promo-form');
    if (popupPromoForm) {
        popupPromoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const activeCheckbox = document.getElementById('popup-promo-active');
            formData.set('is_active', (activeCheckbox && activeCheckbox.checked) ? 1 : 0);

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
    }
});
