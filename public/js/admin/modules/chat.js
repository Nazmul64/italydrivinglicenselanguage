// MBanglaPatente Admin Panel - Support Chat & Client Management Module

let adminChatInterval = null;
let activeChatSessionId = null;
let allConversationsList = [];

function startAdminChatPolling() {
    fetchConversations();
    if (!adminChatInterval) {
        adminChatInterval = setInterval(() => {
            fetchConversations();
            if (activeChatSessionId) {
                fetchConversationMessages(activeChatSessionId, false);
            }
        }, 3000);
    }
}

function stopAdminChatPolling() {
    if (adminChatInterval) {
        clearInterval(adminChatInterval);
        adminChatInterval = null;
    }
}

function fetchConversations() {
    fetch('/admin/api/chat/conversations')
        .then(res => res.json())
        .then(conversations => {
            allConversationsList = conversations;
            renderConversationsList(conversations);
        })
        .catch(err => console.error("Error fetching conversations: ", err));
}

function renderConversationsList(conversations) {
    const listContainer = document.getElementById('admin-chat-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (!conversations || conversations.length === 0) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px;">কোনো চ্যাট উপলব্ধ নেই</div>`;
        return;
    }

    conversations.forEach(convo => {
        const item = document.createElement('div');
        item.className = `conversation-item ${activeChatSessionId === convo.session_id ? 'active' : ''}`;
        item.setAttribute('data-session-id', convo.session_id);
        item.onclick = () => selectConversation(convo.session_id);

        let avatarHTML = '<div class="conversation-avatar">GU</div>';
        let nameHTML = `<div class="conversation-name">Guest #${convo.session_id.substring(0, 8)}</div>`;
        let progressHTML = '';
        const isActive = convo.client ? (!!convo.client.is_active) : false;

        if (convo.client) {
            const client = convo.client;
            const initials = `${client.first_name[0] || 'U'}${client.last_name[0] || 'S'}`.toUpperCase();
            avatarHTML = `<div class="conversation-avatar">${initials}</div>`;

            let starsHTML = '<span class="client-stars-display" style="color: #fbbf24; margin-left: 4px; font-size: 10px;">';
            for (let i = 1; i <= 5; i++) {
                starsHTML += i <= client.stars ? '★' : '☆';
            }
            starsHTML += '</span>';

            nameHTML = `
                <div class="conversation-name" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span>${client.first_name} ${client.last_name}</span>
                    ${starsHTML}
                </div>
            `;

            progressHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; width: 100%;">
                    <span style="font-size: 9px; color: var(--text-secondary); white-space: nowrap;">${client.phone}</span>
                    <div class="client-progress-bar-bg" style="flex: 1; height: 5px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; position: relative;">
                        <div class="client-progress-bar-fill" style="width: ${client.progress}%; height: 100%; background-color: #4CAF50; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }

        const statusHTML = `
            <button class="btn-chat-toggle ${isActive ? 'active' : 'inactive'}"
                    onclick="event.stopPropagation(); toggleClientActivation('${convo.session_id}')"
                    title="${isActive ? 'Click to Deactivate Customer' : 'Click to Activate Customer'}">
                <i class="fa-solid ${isActive ? 'fa-user-check' : 'fa-user-xmark'}"></i>
                <span>${isActive ? 'Active' : 'Inactive'}</span>
            </button>
        `;

        item.innerHTML = `
            ${avatarHTML}
            <div class="conversation-meta" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                ${nameHTML}
                <div class="conversation-last-msg" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; margin-top: 2px;">${convo.last_message}</div>
                ${progressHTML}
            </div>
            ${statusHTML}
        `;
        listContainer.appendChild(item);
    });
}

function toggleClientActivation(identifier) {
    if (!identifier) return;
    const safeIdentifier = encodeURIComponent(identifier);
    fetch(`/admin/api/clients/toggle-active/${safeIdentifier}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast(data.is_active ? 'গ্রাহক অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'গ্রাহক অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে');
            fetchConversations();
        })
        .catch(err => {
            console.error("Error toggling client activation: ", err);
            showToast('অ্যাক্টিভেশন স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        });
}



function selectConversation(sessionId) {
    activeChatSessionId = sessionId;

    const fallback = document.getElementById('admin-chat-fallback');
    const mainArea = document.getElementById('admin-chat-main-area');
    if (fallback) fallback.style.display = 'none';
    if (mainArea) mainArea.style.display = 'flex';

    const convo = allConversationsList.find(c => c.session_id === sessionId);
    const activeName = document.getElementById('active-chat-name');
    const activeAvatar = document.getElementById('active-chat-avatar');

    if (convo && convo.client) {
        const client = convo.client;
        if (activeName) activeName.innerText = `${client.first_name} ${client.last_name} (${client.phone})`;
        if (activeAvatar) activeAvatar.innerText = `${client.first_name[0] || 'U'}${client.last_name[0] || 'S'}`.toUpperCase();
    } else {
        if (activeName) activeName.innerText = `Guest User #${sessionId.substring(0, 8)}`;
        if (activeAvatar) activeAvatar.innerText = `GU`;
    }

    fetchConversationMessages(sessionId, true);

    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.conversation-item[data-session-id="${sessionId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function fetchConversationMessages(sessionId, forceScroll = false) {
    fetch(`/admin/api/chat/messages/${sessionId}`)
        .then(res => res.json())
        .then(messages => {
            renderConversationMessages(messages, forceScroll);
        })
        .catch(err => console.error("Error loading messages: ", err));
}

function renderConversationMessages(messages, forceScroll) {
    const container = document.getElementById('admin-chat-messages');
    if (!container) return;
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    messages.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.message && msg.message.startsWith('[LICENSE_CARD:') && msg.message.endsWith(']')) {
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=(\d+)/);
            const days = matchDays ? matchDays[1] : 365;
            const key = matchKey ? matchKey[1] : '';

            bubble.className = `license-card-bubble`;
            bubble.style.alignSelf = 'flex-end';
            bubble.innerHTML = `
                <div class="license-card-title">Chiave Licenza ${key}</div>
                <div class="license-card-features">
                    <div>Traduzione Testi</div>
                    <div>Audio</div>
                    <div>Lezioni Video</div>
                    <div>Live class video registarti</div>
                    <div>Web App</div>
                    <div>SUPPORTO</div>
                    <div>Giorni ${days}</div>
                </div>
                <button class="license-card-btn" disabled style="opacity: 0.7; cursor: not-allowed;">Attiva Licenza (Inviata)</button>
            `;
        } else {
            bubble.className = `chat-message-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`;
            if (msg.attachment_path) {
                const img = document.createElement('img');
                img.src = msg.attachment_path;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '250px';
                img.style.borderRadius = '8px';
                img.style.display = 'block';
                img.style.cursor = 'pointer';
                img.onclick = () => window.open(msg.attachment_path, '_blank');
                bubble.appendChild(img);

                if (msg.message) {
                    const text = document.createElement('div');
                    text.innerText = msg.message;
                    text.style.marginTop = '6px';
                    bubble.appendChild(text);
                }
            } else {
                bubble.innerText = msg.message;
            }
        }

        container.appendChild(bubble);
    });

    if (forceScroll || scrollAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

let pendingAdminImageFile = null;

function handleAdminImageSelected(input) {
    if (input.files && input.files[0]) {
        pendingAdminImageFile = input.files[0];
        showToast('ছবি সিলেক্ট করা হয়েছে: ' + pendingAdminImageFile.name);
        sendAdminChatMessage();
    }
}

function sendAdminChatMessage() {
    const input = document.getElementById('admin-chat-input');
    const imageInput = document.getElementById('admin-chat-image-input');
    if (!input) return;

    const messageText = input.value.trim();
    const file = pendingAdminImageFile || (imageInput && imageInput.files ? imageInput.files[0] : null);

    if ((!messageText && !file) || !activeChatSessionId) return;

    input.value = '';
    if (imageInput) imageInput.value = '';
    pendingAdminImageFile = null;

    const formData = new FormData();
    formData.append('session_id', activeChatSessionId);
    if (messageText) formData.append('message', messageText);
    if (file) formData.append('file', file);

    fetch('/admin/api/chat/messages', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
        .then(res => res.json())
        .then(msg => {
            fetchConversationMessages(activeChatSessionId, true);
        })
        .catch(err => console.error("Error sending message: ", err));
}


let allChatPresetsList = [];

function openAdminChatSettings() {
    if (!activeChatSessionId) {
        if (typeof openChatPresetManagerModal === 'function') {
            openChatPresetManagerModal();
        } else {
            showToast('দয়া করে প্রথমে একটি চ্যাট নির্বাচন করুন');
        }
        return;
    }
    const modal = document.getElementById('admin-chat-settings-modal');

    const container = document.getElementById('admin-macro-buttons-container');
    if (modal) modal.style.display = 'flex';

    if (container) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 15px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading options...</div>';

        fetch('/admin/api/chat-presets')
            .then(res => res.json())
            .then(presets => {
                allChatPresetsList = Array.isArray(presets) ? presets : [];
                container.innerHTML = '';
                if (allChatPresetsList.length === 0) {
                    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 15px;">No preset buttons found.</div>';
                    return;
                }

                allChatPresetsList.forEach(p => {
                    if (!p.status) return;
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-block text-start';
                    btn.style.textAlign = 'left';
                    btn.style.padding = '10px 16px';
                    btn.style.backgroundColor = p.bg_color || '#64748b';
                    btn.style.color = p.text_color || '#ffffff';
                    btn.style.border = 'none';
                    btn.style.borderRadius = '10px';
                    btn.style.fontWeight = 'bold';
                    btn.textContent = p.title;
                    btn.onclick = () => executeChatPreset(p.id);
                    container.appendChild(btn);
                });
            })
            .catch(err => {
                console.error("Error loading chat presets: ", err);
                container.innerHTML = '<div style="text-align: center; color: var(--accent-red); padding: 15px;">Error loading options.</div>';
            });
    }
}

function closeAdminChatSettings() {
    const modal = document.getElementById('admin-chat-settings-modal');
    if (modal) modal.style.display = 'none';
}

function executeChatPreset(presetId) {
    if (!activeChatSessionId) return;

    closeAdminChatSettings();
    showToast('অনুরোধ পাঠানো হচ্ছে...');

    fetch('/admin/api/chat/preset-execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            session_id: activeChatSessionId,
            preset_id: presetId
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Preset execution failed');
            return res.json();
        })
        .then(msg => {
            showToast('অ্যাকশন সফলভাবে সম্পন্ন হয়েছে');
            fetchConversationMessages(activeChatSessionId, true);
            fetchConversations();
        })
        .catch(err => {
            console.error("Error executing chat preset: ", err);
            showToast('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
        });
}

function openChatPresetManagerModal() {
    closeAdminChatSettings();
    const modal = document.getElementById('admin-preset-manager-modal');
    if (modal) modal.style.display = 'flex';
    fetchChatPresetsManagerList();
}

function closeChatPresetManagerModal() {
    const modal = document.getElementById('admin-preset-manager-modal');
    if (modal) modal.style.display = 'none';
}

function fetchChatPresetsManagerList() {
    const tbody = document.getElementById('chat-presets-manager-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Loading presets...</td></tr>';

    fetch('/admin/api/chat-presets')
        .then(res => res.json())
        .then(presets => {
            allChatPresetsList = Array.isArray(presets) ? presets : [];
            tbody.innerHTML = '';

            if (allChatPresetsList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">No presets found. Click "+ Add New Button" to create one.</td></tr>';
                return;
            }

            allChatPresetsList.forEach(p => {
                const tr = document.createElement('tr');
                const badgeType = p.type === 'license'
                    ? '<span class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">License</span>'
                    : '<span class="badge" style="background-color: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.2);">Text</span>';

                tr.innerHTML = `
                    <td style="text-align: center; font-weight: bold;">${p.order_index}</td>
                    <td>
                        <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: ${p.bg_color}; color: ${p.text_color}; font-size: 11px; font-weight: bold;">
                            ${p.title}
                        </div>
                        ${p.days ? `<small style="color: var(--text-secondary); margin-left: 6px;">(${p.days} days)</small>` : ''}
                    </td>
                    <td style="text-align: center;">${badgeType}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditChatPresetModal(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="padding: 3px 6px; font-size: 11px;"><i class="fa-solid fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteChatPreset(${p.id})" style="padding: 3px 6px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error fetching presets list: ", err);
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--accent-red); padding: 20px;">Error loading presets.</td></tr>';
        });
}

function toggleChatPresetTypeFields(type) {
    const daysGroup = document.getElementById('form-preset-days-group');
    const textGroup = document.getElementById('form-preset-text-group');

    if (type === 'license') {
        if (daysGroup) daysGroup.style.display = 'block';
        if (textGroup) textGroup.style.display = 'none';
    } else {
        if (daysGroup) daysGroup.style.display = 'none';
        if (textGroup) textGroup.style.display = 'block';
    }
}

function openAddChatPresetModal() {
    document.getElementById('chat-preset-modal-title').textContent = 'Add Chat Response Button';
    document.getElementById('form-preset-id').value = '';
    document.getElementById('form-preset-title').value = '';
    document.getElementById('form-preset-type').value = 'license';
    document.getElementById('form-preset-days').value = '365';
    document.getElementById('form-preset-text').value = '';
    document.getElementById('form-preset-bg-color').value = '#3b82f6';
    document.getElementById('form-preset-text-color').value = '#ffffff';
    document.getElementById('form-preset-order').value = (allChatPresetsList.length + 1).toString();
    toggleChatPresetTypeFields('license');

    const modal = document.getElementById('chat-preset-modal');
    if (modal) modal.style.display = 'flex';
}

function openEditChatPresetModal(preset) {
    document.getElementById('chat-preset-modal-title').textContent = 'Edit Chat Response Button';
    document.getElementById('form-preset-id').value = preset.id;
    document.getElementById('form-preset-title').value = preset.title;
    document.getElementById('form-preset-type').value = preset.type || 'license';
    document.getElementById('form-preset-days').value = preset.days || '';
    document.getElementById('form-preset-text').value = preset.message_text || '';
    document.getElementById('form-preset-bg-color').value = preset.bg_color || '#3b82f6';
    document.getElementById('form-preset-text-color').value = preset.text_color || '#ffffff';
    document.getElementById('form-preset-order').value = preset.order_index || '0';
    toggleChatPresetTypeFields(preset.type || 'license');

    const modal = document.getElementById('chat-preset-modal');
    if (modal) modal.style.display = 'flex';
}

function closeChatPresetModal() {
    const modal = document.getElementById('chat-preset-modal');
    if (modal) modal.style.display = 'none';
}

function saveChatPreset(e) {
    e.preventDefault();
    const id = document.getElementById('form-preset-id').value;
    const title = document.getElementById('form-preset-title').value.trim();
    const type = document.getElementById('form-preset-type').value;
    const days = document.getElementById('form-preset-days').value;
    const messageText = document.getElementById('form-preset-text').value;
    const bgColor = document.getElementById('form-preset-bg-color').value;
    const textColor = document.getElementById('form-preset-text-color').value;
    const orderIndex = document.getElementById('form-preset-order').value;

    if (!title) {
        showToast('বাটন টাইটেল প্রদান করুন');
        return;
    }

    const url = id ? `/admin/api/chat-presets/update/${id}` : '/admin/api/chat-presets/store';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            title: title,
            type: type,
            days: days ? parseInt(days) : null,
            message_text: messageText,
            bg_color: bgColor,
            text_color: textColor,
            order_index: parseInt(orderIndex)
        })
    })
        .then(res => res.json())
        .then(data => {
            closeChatPresetModal();
            showToast(id ? 'রেসপন্স বাটন আপডেট করা হয়েছে' : 'নতুন রেসপন্স বাটন তৈরি করা হয়েছে');
            fetchChatPresetsManagerList();
        })
        .catch(err => {
            console.error("Error saving preset: ", err);
            showToast('বাটন সেভ করতে সমস্যা হয়েছে');
        });
}

function deleteChatPreset(presetId) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই রেসপন্স বাটনটি মুছে ফেলতে চান?')) return;

    fetch(`/admin/api/chat-presets/delete/${presetId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(res => res.json())
        .then(data => {
            showToast('বাটন সফলভাবে মুছে ফেলা হয়েছে');
            fetchChatPresetsManagerList();
        })
        .catch(err => {
            console.error("Error deleting preset: ", err);
            showToast('বাটন মুছতে সমস্যা হয়েছে');
        });
}
