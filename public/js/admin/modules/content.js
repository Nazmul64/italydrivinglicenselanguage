// MBanglaPatente Admin Panel - Content Management Module (Sliders, Popup Promo, Home Cards, Videos & Categories)

// ==============================
// BANNER SLIDERS MANAGEMENT CRUD
// ==============================
function previewSliderImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('slider-preview-img');
            const previewContainer = document.getElementById('slider-image-preview');
            if (previewImg && previewContainer) {
                previewImg.src = e.target.result;
                previewContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}
window.previewSliderImage = previewSliderImage;

let slidersCurrentPage = 1;

function fetchSliders() {
    const tbody = document.getElementById('sliders-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">Loading sliders...</td></tr>`;

    const search = document.getElementById('sliders-search')?.value || '';
    const perPage = document.getElementById('sliders-per-page')?.value || 10;

    fetch(`/admin/api/sliders?search=${encodeURIComponent(search)}&per_page=${perPage}&page=${slidersCurrentPage}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            const paginationStatus = document.getElementById('sliders-pagination-status');
            if (paginationStatus) {
                const total = data.total !== undefined ? data.total : list.length;
                paginationStatus.textContent = `Showing ${list.length} of ${total} entries`;
            }

            const statSliders = document.getElementById('stat-sliders');
            if (statSliders) {
                statSliders.textContent = data.total !== undefined ? data.total : list.length;
            }

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No sliders found.</td></tr>`;
                return;
            }

            list.forEach(slider => {
                const tr = document.createElement('tr');
                const imgTag = slider.image_url
                    ? `<img src="${slider.image_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); background: #f1f5f9;" onerror="this.style.display='none'">`
                    : `<span style="font-size: 11px; color: var(--text-secondary);">No image</span>`;

                tr.innerHTML = `
                    <td><strong>#${slider.id}</strong></td>
                    <td style="text-align: center;">${imgTag}</td>
                    <td style="font-weight: bold; color: var(--text-primary);">${slider.title || 'Untitled'}</td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${slider.subtitle || '-'}</td>
                    <td><code style="font-size: 11px;">${slider.link_url || '-'}</code></td>
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

function prevSlidersPage() {
    if (slidersCurrentPage > 1) {
        slidersCurrentPage--;
        fetchSliders();
    }
}
window.prevSlidersPage = prevSlidersPage;

function nextSlidersPage() {
    slidersCurrentPage++;
    fetchSliders();
}
window.nextSlidersPage = nextSlidersPage;

function openAddSliderModal() {
    const titleEl = document.getElementById('slider-modal-title');
    if (titleEl) titleEl.textContent = 'Add Banner Slider';
    const idEl = document.getElementById('form-slider-id');
    if (idEl) idEl.value = '';
    const formTitle = document.getElementById('form-slider-title');
    if (formTitle) formTitle.value = '';
    const formSubtitle = document.getElementById('form-slider-subtitle');
    if (formSubtitle) formSubtitle.value = '';
    const formLink = document.getElementById('form-slider-link');
    if (formLink) formLink.value = '';
    const formImg = document.getElementById('form-slider-image');
    if (formImg) formImg.value = '';
    const previewEl = document.getElementById('slider-image-preview');
    if (previewEl) previewEl.style.display = 'none';
    const modalEl = document.getElementById('slider-modal');
    if (modalEl) modalEl.style.display = 'flex';
}

function openEditSliderModal(slider) {
    const titleEl = document.getElementById('slider-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Banner Slider';
    const idEl = document.getElementById('form-slider-id');
    if (idEl) idEl.value = slider.id;
    const formTitle = document.getElementById('form-slider-title');
    if (formTitle) formTitle.value = slider.title || '';
    const formSubtitle = document.getElementById('form-slider-subtitle');
    if (formSubtitle) formSubtitle.value = slider.subtitle || '';
    const formLink = document.getElementById('form-slider-link');
    if (formLink) formLink.value = slider.link_url || '';
    const formImg = document.getElementById('form-slider-image');
    if (formImg) formImg.value = '';

    const previewEl = document.getElementById('slider-image-preview');
    const previewImg = document.getElementById('slider-preview-img');
    if (slider.image_url && previewImg && previewEl) {
        previewImg.src = slider.image_url;
        previewEl.style.display = 'block';
    } else if (previewEl) {
        previewEl.style.display = 'none';
    }
    const modalEl = document.getElementById('slider-modal');
    if (modalEl) modalEl.style.display = 'flex';
}

function closeSliderModal() {
    const modalEl = document.getElementById('slider-modal');
    if (modalEl) modalEl.style.display = 'none';
}

function saveSlider(e) {
    e.preventDefault();
    const id = document.getElementById('form-slider-id')?.value || '';
    const title = document.getElementById('form-slider-title')?.value || '';
    const subtitle = document.getElementById('form-slider-subtitle')?.value || '';
    const linkUrl = document.getElementById('form-slider-link')?.value || '';
    const imageFile = document.getElementById('form-slider-image')?.files?.[0];

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
// HOME NAVIGATION CARDS CRUD & DRAG & DROP
let homeCardsCurrentPage = 1;
let draggedHomeCardRow = null;

function fetchHomeCards(page = 1) {
    homeCardsCurrentPage = page;
    const tbody = document.getElementById('home-cards-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading cards...</td></tr>`;

    const searchInput = document.getElementById('home-cards-search');
    const perPageSelect = document.getElementById('home-cards-per-page');
    const search = searchInput ? searchInput.value.trim() : '';
    const perPage = perPageSelect ? perPageSelect.value : '50';

    let url = `/admin/api/home-cards?page=${homeCardsCurrentPage}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            const items = Array.isArray(data) ? data : (data.data || []);

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 30px;">No cards found.</td></tr>`;
                return;
            }

            items.forEach((card, idx) => {
                const tr = document.createElement('tr');
                tr.className = 'draggable-row';
                tr.setAttribute('draggable', 'true');
                tr.setAttribute('data-id', card.id);
                tr.setAttribute('data-order', card.order_index);

                const colorVal = card.color || card.icon_color || '#3B82F6';
                const statusBadge = card.status ? '<span class="status-badge active">Active</span>' : '<span class="status-badge inactive">Inactive</span>';

                tr.innerHTML = `
                    <td style="text-align: center; width: 48px;">
                        <span class="drag-handle-btn" title="Drag to reorder">
                            <i class="fa-solid fa-grip-vertical"></i>
                        </span>
                    </td>
                    <td style="font-weight: 600; color: var(--text-secondary);">${card.id}</td>
                    <td style="text-align: center;">
                        <span class="order-index-badge">${card.order_index}</span>
                    </td>
                    <td style="text-align: center;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background-color: ${colorVal}1a; color: ${colorVal}; font-size: 16px;">
                            <i class="${card.icon_class || 'fa-solid fa-shapes'}"></i>
                        </div>
                    </td>
                    <td style="font-weight: bold; color: var(--text-primary);">${card.title}</td>
                    <td style="color: var(--text-secondary); font-size: 12.5px;">${card.subtitle || card.description || ''}</td>
                    <td><span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); border: 1px solid var(--border-color); font-weight: bold;">${card.screen_key}</span></td>
                    <td style="text-align: center;"><div style="width: 22px; height: 22px; border-radius: 6px; background-color: ${colorVal}; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div></td>
                    <td style="text-align: center;">
                        <button onclick="toggleHomeCardStatus(${card.id})" style="background: none; border: none; cursor: pointer;" title="Click to toggle status">
                            ${statusBadge}
                        </button>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                        <div style="display: inline-flex; gap: 4px; align-items: center;">
                            <button class="btn-reorder-move" onclick="moveHomeCardRow(this, -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="btn-reorder-move" onclick="moveHomeCardRow(this, 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="btn btn-secondary btn-sm" onclick="openEditHomeCardModal(${JSON.stringify(card).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteHomeCard(${card.id})" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Initialize Drag & Drop listeners on rows
            initHomeCardsDragAndDrop(tbody);

            if (!Array.isArray(data)) {
                const total = data.total || items.length;
                const from = (data.current_page - 1) * (parseInt(perPage) || 50) + 1;
                const to = Math.min(data.current_page * (parseInt(perPage) || 50), total);
                const status = document.getElementById('home-cards-pagination-status');
                if (status) status.textContent = `Showing ${total > 0 ? from : 0} to ${to} of ${total} entries`;

                const prevBtn = document.getElementById('btn-home-cards-prev');
                const nextBtn = document.getElementById('btn-home-cards-next');
                if (prevBtn) prevBtn.disabled = data.current_page === 1;
                if (nextBtn) nextBtn.disabled = data.current_page >= data.last_page;
            } else {
                const status = document.getElementById('home-cards-pagination-status');
                if (status) status.textContent = `Showing all ${items.length} entries (Drag & Drop enabled)`;
            }
        })
        .catch(err => {
            console.error("Error loading cards: ", err);
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--accent-red); padding: 30px;">Error loading cards.</td></tr>`;
        });
}

/**
 * Initialize HTML5 Drag & Drop on Home Cards Table Rows
 */
function initHomeCardsDragAndDrop(tbody) {
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr.draggable-row');

    rows.forEach(row => {
        row.addEventListener('dragstart', function(e) {
            draggedHomeCardRow = this;
            this.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
        });

        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (!draggedHomeCardRow || draggedHomeCardRow === this) return;

            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            rows.forEach(r => {
                r.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            if (e.clientY < midpoint) {
                this.classList.add('drag-over-top');
            } else {
                this.classList.add('drag-over-bottom');
            }
        });

        row.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        row.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over-top', 'drag-over-bottom');

            if (!draggedHomeCardRow || draggedHomeCardRow === this) return;

            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            if (e.clientY < midpoint) {
                tbody.insertBefore(draggedHomeCardRow, this);
            } else {
                tbody.insertBefore(draggedHomeCardRow, this.nextSibling);
            }

            persistHomeCardsOrder();
        });

        row.addEventListener('dragend', function(e) {
            this.classList.remove('is-dragging');
            rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom', 'is-dragging'));
            draggedHomeCardRow = null;
        });
    });
}

/**
 * Live Move Up / Down helper for clicking arrows
 */
function moveHomeCardRow(btn, direction) {
    const row = btn.closest('tr.draggable-row');
    if (!row) return;
    const tbody = row.parentElement;

    if (direction === -1 && row.previousElementSibling) {
        tbody.insertBefore(row, row.previousElementSibling);
        persistHomeCardsOrder();
    } else if (direction === 1 && row.nextElementSibling) {
        tbody.insertBefore(row.nextElementSibling, row);
        persistHomeCardsOrder();
    }
}

/**
 * Persist the new sequence of cards to the server via AJAX
 */
function persistHomeCardsOrder() {
    const tbody = document.getElementById('home-cards-table-body');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
    if (rows.length === 0) return;

    const cardIds = [];
    rows.forEach((row, idx) => {
        const id = parseInt(row.getAttribute('data-id'));
        if (id) {
            cardIds.push(id);
            // Update visual badge immediately
            const badge = row.querySelector('.order-index-badge');
            if (badge) badge.textContent = idx + 1;
            row.setAttribute('data-order', idx + 1);
        }
    });

    const indicator = document.getElementById('home-cards-reorder-indicator');
    if (indicator) indicator.style.display = 'inline-flex';

    fetch('/admin/api/home-cards/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ orders: cardIds })
    })
    .then(res => res.json())
    .then(res => {
        if (indicator) indicator.style.display = 'none';
        if (res.status === 'success' || res.success) {
            showToast('হোম কার্ডের অবস্থান সফলভাবে পরিবর্তন করা হয়েছে');
        } else {
            showToast('কার্ড ক্রম পরিবর্তন করতে সমস্যা হয়েছে');
        }
    })
    .catch(err => {
        console.error("Failed to reorder home cards: ", err);
        if (indicator) indicator.style.display = 'none';
        showToast('কার্ড ক্রম সংরক্ষণ ব্যর্থ হয়েছে');
    });
}

function toggleHomeCardStatus(id) {
    fetch(`/admin/api/home-cards/toggle-status/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        showToast('কার্ড স্ট্যাটাস আপডেট করা হয়েছে');
        fetchHomeCards(homeCardsCurrentPage);
    })
    .catch(err => {
        console.error("Error toggling card status: ", err);
        showToast('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
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
