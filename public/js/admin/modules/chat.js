// MBanglaPatente Admin Panel - Support Chat & Client Management Module

let adminChatInterval = null;
let activeChatSessionId = null;
let allConversationsList = [];
let adminChatSearchQuery = '';
let adminChatSearchDebounce = null;

function startAdminChatPolling() {
    fetchConversations();
    if (!adminChatInterval) {
        adminChatInterval = setInterval(() => {
            if (document.hidden) return; // Pause polling when tab is not in focus
            if (!adminChatSearchQuery) {
                fetchConversations();
            }
            if (activeChatSessionId) {
                fetchConversationMessages(activeChatSessionId, false);
            }
        }, 6000);
    }
}

function stopAdminChatPolling() {
    if (adminChatInterval) {
        clearInterval(adminChatInterval);
        adminChatInterval = null;
    }
}

function fetchConversations(customSearch = '') {
    const url = customSearch 
        ? `/admin/api/chat/conversations?search=${encodeURIComponent(customSearch)}`
        : '/admin/api/chat/conversations';

    const fetchPromise = window.safeFetchJson
        ? safeFetchJson(url)
        : fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.json());

    fetchPromise
        .then(conversations => {
            if (Array.isArray(conversations)) {
                if (!customSearch) {
                    allConversationsList = conversations;
                }
                renderConversationsList(conversations);
            }
        })
        .catch(err => console.warn("Admin chat sync notice: ", err.message || err));
}

function onAdminChatSearchInput(val) {
    adminChatSearchQuery = (val || '').trim().toLowerCase();
    const clearBtn = document.getElementById('admin-chat-search-clear');
    if (clearBtn) {
        clearBtn.style.display = adminChatSearchQuery ? 'block' : 'none';
    }

    // 1. Instant 0ms local filtering
    if (!adminChatSearchQuery) {
        renderConversationsList(allConversationsList);
    } else {
        const localMatches = allConversationsList.filter(convo => {
            const client = convo.client || {};
            const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
            const phone = (client.phone || '').toLowerCase();
            const cleanPhone = phone.replace(/\D/g, '');
            const cleanQuery = adminChatSearchQuery.replace(/\D/g, '');
            const lastMsg = (convo.last_message || '').toLowerCase();
            const sId = (convo.session_id || '').toLowerCase();

            return fullName.includes(adminChatSearchQuery) ||
                   phone.includes(adminChatSearchQuery) ||
                   (cleanQuery.length >= 3 && cleanPhone.includes(cleanQuery)) ||
                   lastMsg.includes(adminChatSearchQuery) ||
                   sId.includes(adminChatSearchQuery);
        });
        renderConversationsList(localMatches);
    }

    // 2. Debounced server search across entire database of users and app_clients
    clearTimeout(adminChatSearchDebounce);
    if (adminChatSearchQuery.length >= 2) {
        adminChatSearchDebounce = setTimeout(() => {
            fetchConversations(adminChatSearchQuery);
        }, 250);
    }
}

function clearAdminChatSearch() {
    const input = document.getElementById('admin-chat-search-input');
    if (input) {
        input.value = '';
    }
    onAdminChatSearchInput('');
}

function renderConversationsList(conversations) {
    const listContainer = document.getElementById('admin-chat-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Strictly exclude any guest or phone-less entry from admin conversations
    if (Array.isArray(conversations)) {
        conversations = conversations.filter(convo => {
            const client = convo.client || {};
            const phone = (client.phone || '').trim();
            const cleanPhone = phone.replace(/\D/g, '');
            const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase().trim();
            if (!phone || phone === 'N/A' || cleanPhone.length < 7) return false;
            if (fullName === 'guest user' || fullName.startsWith('guest')) return false;
            return true;
        });
    }

    // Update summary counts
    const totalCount = Array.isArray(conversations) ? conversations.length : 0;
    const activeCount = Array.isArray(conversations) ? conversations.filter(c => c.client && c.client.is_active).length : 0;
    
    const totalBadge = document.getElementById('chat-total-count');
    const activeBadge = document.getElementById('chat-active-count');
    const sidebarBadge = document.getElementById('chat-sidebar-count-badge');

    if (totalBadge) totalBadge.innerText = totalCount;
    if (activeBadge) activeBadge.innerText = activeCount;
    if (sidebarBadge) sidebarBadge.innerText = totalCount;

    if (!conversations || conversations.length === 0) {
        listContainer.innerHTML = adminChatSearchQuery
            ? `<div style="padding: 24px 16px; text-align: center; color: var(--text-secondary); font-size: 13px;">
                 <i class="fa-solid fa-user-slash" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i><br>
                 "<strong>${adminChatSearchQuery}</strong>" দিয়ে কোনো কাস্টমার পাওয়া যায়নি
               </div>`
            : `<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px;">কোনো চ্যাট উপলব্ধ নেই</div>`;
        return;
    }

    conversations.forEach(convo => {
        const item = document.createElement('div');
        item.className = `conversation-item ${activeChatSessionId === convo.session_id ? 'active' : ''}`;
        item.setAttribute('data-session-id', convo.session_id);
        item.onclick = () => selectConversation(convo.session_id);

        let avatarHTML = '<div class="conversation-avatar">GU</div>';
        let safeSessionId = String(convo.session_id || '');
        let nameHTML = `<div class="conversation-name">Guest #${safeSessionId.substring(0, 8)}</div>`;
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
                    <span style="font-size: 9px; color: var(--text-secondary); white-space: nowrap;"><i class="fa-solid fa-phone" style="font-size: 8px; margin-right: 2px;"></i>${client.phone}</span>
                    <div class="client-progress-bar-bg" style="flex: 1; height: 5px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; position: relative;">
                        <div class="client-progress-bar-fill" style="width: ${client.progress}%; height: 100%; background-color: #4CAF50; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }

        const statusHTML = `
            <div style="display: flex; align-items: center; gap: 4px;">
                <button class="btn-chat-toggle ${isActive ? 'active' : 'inactive'}"
                        onclick="event.stopPropagation(); toggleClientActivation('${convo.session_id}')"
                        title="${isActive ? 'Click to Deactivate Customer' : 'Click to Activate Customer'}">
                    <i class="fa-solid ${isActive ? 'fa-user-check' : 'fa-user-xmark'}"></i>
                    <span>${isActive ? 'Active' : 'Inactive'}</span>
                </button>
                <button class="btn-chat-delete"
                        onclick="event.stopPropagation(); deleteChatConversation('${convo.session_id}')"
                        title="Delete User & Conversation (কাস্টমার ও চ্যাট মুছে ফেলুন)"
                        style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 5px 8px; cursor: pointer; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;"
                        onmouseover="this.style.background='#ef4444'; this.style.color='#fff';"
                        onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444';">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
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

function updateActiveChatHeaderStatus(isActive, sessionId) {
    const container = document.getElementById('active-chat-toggle-btn-container');
    if (!container) return;
    const targetSessionId = sessionId || activeChatSessionId;
    if (!targetSessionId) return;

    container.innerHTML = `
        <button class="btn-chat-toggle ${isActive ? 'active' : 'inactive'}"
                onclick="event.stopPropagation(); toggleClientActivation('${targetSessionId}')"
                title="${isActive ? 'Click to Deactivate Customer' : 'Click to Activate Customer'}"
                style="padding: 6px 14px; font-size: 12px;">
            <i class="fa-solid ${isActive ? 'fa-user-check' : 'fa-user-xmark'}"></i>
            <span>${isActive ? 'Active' : 'Inactive'}</span>
        </button>
    `;
}

function toggleClientActivation(identifier) {
    if (!identifier) return;
    const safeIdentifier = encodeURIComponent(identifier);
    fetch(`/admin/api/clients/toggle-active/${safeIdentifier}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getAdminCsrfToken(),
            'Accept': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            const isNowActive = data.is_active;
            showToast(isNowActive ? 'গ্রাহক অ্যাকাউন্ট সক্রিয় (Active) করা হয়েছে' : 'গ্রাহক অ্যাকাউন্ট নিষ্ক্রিয় (Inactive) করা হয়েছে');
            
            // Instantly update active chat header toggle button
            if (activeChatSessionId === identifier) {
                updateActiveChatHeaderStatus(isNowActive, identifier);
                fetchConversationMessages(identifier, true);
            }

            // Update in local cache
            const convo = allConversationsList.find(c => c.session_id === identifier);
            if (convo && convo.client) {
                convo.client.is_active = isNowActive;
            }

            if (adminChatSearchQuery) {
                fetchConversations(adminChatSearchQuery);
            } else {
                fetchConversations();
            }
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
    const activeSub = document.getElementById('active-chat-sub');
    const activeAvatar = document.getElementById('active-chat-avatar');

    let isActive = false;

    if (convo && convo.client) {
        const client = convo.client;
        isActive = !!client.is_active;
        if (activeName) activeName.innerText = `${client.first_name} ${client.last_name}`;
        if (activeSub) activeSub.innerHTML = `<i class="fa-solid fa-phone" style="font-size: 10px; margin-right: 4px;"></i>${client.phone || 'N/A'}`;
        if (activeAvatar) activeAvatar.innerText = `${client.first_name[0] || 'U'}${client.last_name[0] || 'S'}`.toUpperCase();
    } else {
        let safeSId = String(sessionId || '');
        if (activeName) activeName.innerText = `Guest User #${safeSId.substring(0, 8)}`;
        if (activeSub) activeSub.innerText = `Session: #${safeSId.substring(0, 8)}`;
        if (activeAvatar) activeAvatar.innerText = `GU`;
    }

    updateActiveChatHeaderStatus(isActive, sessionId);

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
    if (!sessionId) return;
    const url = `/admin/api/chat/messages/${encodeURIComponent(sessionId)}`;
    const fetchPromise = window.safeFetchJson
        ? safeFetchJson(url)
        : fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.json());

    fetchPromise
        .then(messages => {
            if (Array.isArray(messages)) {
                renderConversationMessages(messages, forceScroll);
            }
        })
        .catch(err => console.warn("Chat messages sync notice: ", err.message || err));
}

function renderConversationMessages(messages, forceScroll) {
    const container = document.getElementById('admin-chat-messages');
    if (!container || !Array.isArray(messages)) return;
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    const seenJoinGreetings = new Set();
    messages.forEach(msg => {
        const rawText = (msg.message || '').trim();
        if (rawText.includes('যুক্ত হয়েছি') || rawText.includes('অ্যাপ থেকে চ্যাটে') || rawText.includes('নিবন্ধিত হয়েছে')) {
            if (seenJoinGreetings.has(rawText)) {
                return; // Suppress duplicate greeting bubbles
            }
            seenJoinGreetings.add(rawText);
        }

        const bubble = document.createElement('div');

        if (msg.is_license_card || (msg.message && msg.message.includes('[LICENSE_CARD:'))) {
            const matchSec = msg.message.match(/(?:seconds|sec)=(\d+)/);
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=([0-9a-zA-Z_-]+)/);
            const key = matchKey ? matchKey[1] : (msg.license_key || '');

            let durationStr = '';
            if (matchSec) {
                const sec = parseInt(matchSec[1], 10);
                if (sec < 60) durationStr = `${sec} Seconds (${sec} সেকেন্ড)`;
                else if (sec < 3600) durationStr = `${Math.round(sec / 60)} Minutes (${Math.round(sec / 60)} মিনিট)`;
                else if (sec < 86400) durationStr = `${Math.round(sec / 3600)} Hours (${Math.round(sec / 3600)} ঘণ্টা)`;
                else {
                    const d = Math.round(sec / 86400);
                    durationStr = `${d} Days (${d} দিন)`;
                }
            } else {
                const days = matchDays ? parseInt(matchDays[1], 10) : 365;
                durationStr = `${days} Days`;
                if (days === 365 || days === 366) durationStr = '1 Year (১ বছর)';
                else if (days === 730 || days === 732) durationStr = '2 Years (২ বছর)';
                else if (days === 180) durationStr = '6 Months (৬ মাস)';
                else if (days === 90) durationStr = '3 Months (৩ মাস)';
                else if (days === 30) durationStr = '1 Month (১ মাস)';
            }

            bubble.className = `license-card-bubble`;
            bubble.style.alignSelf = 'flex-end';
            bubble.innerHTML = `
                <div class="license-card-title">Chiave Licenza ${key}</div>
                <div class="license-card-duration" style="font-weight: 700; color: #ffffff; background: rgba(0, 0, 0, 0.25); padding: 7px 12px; border-radius: 8px; margin: 10px 0; font-size: 13.5px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.28); display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);">
                    <i class="fa-solid fa-clock" style="color: #fde047; font-size: 14px;"></i> <span>মেয়াদ: <strong>${durationStr}</strong></span>
                </div>
                <button class="license-card-btn" disabled style="opacity: 0.7; cursor: not-allowed;">Attiva Licenza (Inviata)</button>
            `;
        } else {
            bubble.className = `chat-message-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`;
            const attachUrl = msg.attachment_path || msg.image_url || msg.image || msg.attachment;
            if (attachUrl) {
                let cleanSrc = attachUrl;
                if (!cleanSrc.startsWith('http') && !cleanSrc.startsWith('/') && !cleanSrc.startsWith('data:')) {
                    cleanSrc = '/' + cleanSrc;
                }
                const img = document.createElement('img');
                img.src = cleanSrc;
                img.alt = 'ছবি';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '280px';
                img.style.borderRadius = '10px';
                img.style.display = 'block';
                img.style.cursor = 'pointer';
                img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                img.onclick = () => window.open(cleanSrc, '_blank');
                img.onerror = function() {
                    this.style.display = 'none';
                };
                bubble.appendChild(img);

                if (msg.message && msg.message !== 'ছবি পাঠানো হয়েছে' && msg.message !== 'Photo sent') {
                    const text = document.createElement('div');
                    text.innerText = msg.message;
                    text.style.marginTop = '8px';
                    text.style.wordBreak = 'break-word';
                    bubble.appendChild(text);
                }
            } else {
                bubble.innerText = msg.message || '';
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
            'X-CSRF-TOKEN': getAdminCsrfToken()
        },
        body: formData
    })
        .then(res => res.json())
        .then(msg => {
            fetchConversationMessages(activeChatSessionId, true);
        })
        .catch(err => console.error("Error sending message: ", err));
}


function getAdminCsrfToken() {
    return (typeof csrfToken !== 'undefined' && csrfToken) 
        ? csrfToken 
        : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
}

let allChatPresetsList = [];

function openAdminChatSettings() {
    if (!activeChatSessionId) {
        if (allConversationsList && allConversationsList.length > 0) {
            selectConversation(allConversationsList[0].session_id);
        } else {
            showToast('দয়া করে প্রথমে একটি চ্যাট নির্বাচন করুন');
            return;
        }
    }
    const modal = document.getElementById('admin-chat-settings-modal');
    const container = document.getElementById('admin-macro-buttons-container');
    const targetEl = document.getElementById('chat-settings-target-user');

    const convo = allConversationsList.find(c => c.session_id === activeChatSessionId);
    if (targetEl) {
        if (convo && convo.client) {
            targetEl.textContent = `${convo.client.first_name || ''} ${convo.client.last_name || ''} (${convo.client.phone || 'N/A'})`.trim();
        } else {
            let safeSId = String(activeChatSessionId || '');
            targetEl.textContent = `Guest #${safeSId.substring(0, 8)}`;
        }
    }

    if (modal) modal.style.display = 'flex';

    if (container) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 15px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading options...</div>';

        fetch('/admin/api/chat-presets')
            .then(res => res.json())
            .then(presets => {
                allChatPresetsList = Array.isArray(presets) ? presets : [];
                container.innerHTML = '';
                if (allChatPresetsList.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; color: var(--text-secondary); padding: 15px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                            <div style="font-size: 12px; margin-bottom: 8px;">কোনো কাস্টম প্রিসেট বাটন নেই</div>
                            <button type="button" class="btn btn-sm btn-primary" onclick="closeAdminChatSettings(); openAddChatPresetModal();" style="font-size: 11px;">
                                <i class="fa-solid fa-plus"></i> নতুন বাটন তৈরি করুন
                            </button>
                        </div>
                    `;
                    return;
                }

                allChatPresetsList.forEach(p => {
                    if (!p.status && p.status !== undefined && p.status !== 1 && p.status !== true) return;
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-block text-start';
                    btn.style.textAlign = 'left';
                    btn.style.padding = '10px 14px';
                    btn.style.backgroundColor = p.bg_color || '#3b82f6';
                    btn.style.color = p.text_color || '#ffffff';
                    btn.style.border = 'none';
                    btn.style.borderRadius = '10px';
                    btn.style.fontWeight = 'bold';
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'space-between';
                    btn.style.cursor = 'pointer';
                    btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

                    const typeBadge = p.type === 'license'
                        ? `<span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 4px; margin-left: 6px;"><i class="fa-solid fa-key"></i> ${p.days ? p.days + ' Days' : 'License'}</span>`
                        : `<span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 4px; margin-left: 6px;"><i class="fa-solid fa-message"></i> Text</span>`;

                    btn.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-paper-plane" style="font-size: 12px; opacity: 0.8;"></i>
                            <span>${p.title}</span>
                        </div>
                        ${typeBadge}
                    `;
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

function sendDirectChatLicense(secondsOrDays, customLabel = '') {
    let durationSeconds = parseInt(secondsOrDays, 10);
    if (!activeChatSessionId) {
        if (allConversationsList && allConversationsList.length > 0) {
            activeChatSessionId = allConversationsList[0].session_id;
        } else {
            showToast('দয়া করে প্রথমে একটি চ্যাট নির্বাচন করুন');
            return;
        }
    }
    if (!durationSeconds || durationSeconds < 1) {
        showToast('দয়া করে সঠিক সময়কাল লিখুন');
        return;
    }

    let label = customLabel;
    if (!label) {
        if (durationSeconds < 60) {
            label = `${durationSeconds} সেকেন্ড`;
        } else if (durationSeconds < 3600) {
            label = `${Math.round(durationSeconds / 60)} মিনিট`;
        } else if (durationSeconds < 86400) {
            label = `${Math.round(durationSeconds / 3600)} ঘন্টা`;
        } else {
            const days = Math.round(durationSeconds / 86400);
            label = `${days} দিন`;
        }
    }

    closeAdminChatSettings();
    showToast(`${label} মেয়াদের লাইসেন্স কি তৈরি করা হচ্ছে...`);

    fetch('/admin/api/chat/send-license', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': getAdminCsrfToken()
        },
        body: JSON.stringify({
            session_id: activeChatSessionId,
            duration_seconds: durationSeconds,
            days: Math.max(1, Math.round(durationSeconds / 86400)),
            duration_label: label
        })
    })
        .then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to send license');
            }
            return res.json();
        })
        .then(data => {
            showToast(`লাইসেন্স কি (${label}) সফলভাবে চ্যাটে পাঠানো হয়েছে!`);
            fetchConversationMessages(activeChatSessionId, true);
            fetchConversations();
        })
        .catch(err => {
            console.error("Error sending license: ", err);
            showToast(err.message || 'লাইসেন্স পাঠাতে সমস্যা হয়েছে');
        });
}

function sendCustomChatLicense() {
    const valInput = document.getElementById('admin-custom-license-val');
    const unitSelect = document.getElementById('admin-custom-license-unit');
    const val = parseInt(valInput ? valInput.value : '0', 10);
    const unit = unitSelect ? unitSelect.value : 'months';

    if (!val || val < 1) {
        showToast('দয়া করে সঠিক সংখ্যা লিখুন');
        return;
    }

    let durationSeconds = val;
    let label = '';
    if (unit === 'seconds') {
        durationSeconds = val;
        label = `${val} সেকেন্ড`;
    } else if (unit === 'minutes') {
        durationSeconds = val * 60;
        label = `${val} মিনিট`;
    } else if (unit === 'hours') {
        durationSeconds = val * 3600;
        label = `${val} ঘন্টা`;
    } else if (unit === 'days') {
        durationSeconds = val * 86400;
        label = `${val} দিন`;
    } else if (unit === 'months') {
        durationSeconds = val * 2592000;
        label = `${val} মাস`;
    } else if (unit === 'years') {
        durationSeconds = val * 31536000;
        label = `${val} বছর`;
    }

    sendDirectChatLicense(durationSeconds, label);
}

function deleteChatConversation(sessionId) {
    if (!sessionId) return;
    if (!confirm('আপনি কি নিশ্চিত এই কাস্টমার ও চ্যাট হিস্টোরি মুছে ফেলতে চান?\n\nএটি মুছে দিলে কাস্টমার অ্যাপ থেকে পুনরায় নতুন করে রেজিস্ট্রেশন করতে পারবে।')) {
        return;
    }

    showToast('কাস্টমার মুছে ফেলা হচ্ছে...');

    fetch('/admin/api/chat/delete-conversation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': getAdminCsrfToken()
        },
        body: JSON.stringify({ session_id: sessionId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে');

                // If currently open chat was deleted, reset main area
                if (activeChatSessionId === sessionId) {
                    activeChatSessionId = null;
                    const mainArea = document.getElementById('admin-chat-main-area');
                    if (mainArea) mainArea.style.display = 'none';
                }

                // Remove from local list
                allConversationsList = allConversationsList.filter(c => c.session_id !== sessionId);

                if (adminChatSearchQuery) {
                    fetchConversations(adminChatSearchQuery);
                } else {
                    fetchConversations();
                }
            } else {
                showToast(data.message || 'মুছে ফেলতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error('Error deleting conversation:', err);
            showToast('কাস্টমার মুছে ফেলতে সমস্যা হয়েছে');
        });
}

window.sendDirectChatLicense = sendDirectChatLicense;
window.sendCustomChatLicense = sendCustomChatLicense;
window.deleteChatConversation = deleteChatConversation;

function executeChatPreset(presetId) {
    if (!activeChatSessionId) {
        if (allConversationsList && allConversationsList.length > 0) {
            activeChatSessionId = allConversationsList[0].session_id;
        } else {
            showToast('দয়া করে প্রথমে একটি চ্যাট নির্বাচন করুন');
            return;
        }
    }

    closeAdminChatSettings();
    showToast('অনুরোধ পাঠানো হচ্ছে...');

    fetch('/admin/api/chat/preset-execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': getAdminCsrfToken()
        },
        body: JSON.stringify({
            session_id: activeChatSessionId,
            preset_id: presetId
        })
    })
        .then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Preset execution failed');
            }
            return res.json();
        })
        .then(msg => {
            showToast('অ্যাকশন সফলভাবে সম্পন্ন হয়েছে');
            fetchConversationMessages(activeChatSessionId, true);
            fetchConversations();
        })
        .catch(err => {
            console.error("Error executing chat preset: ", err);
            showToast(err.message || 'অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
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

                const sendBtn = activeChatSessionId
                    ? `<button class="btn btn-sm" onclick="executeChatPreset(${p.id}); closeChatPresetManagerModal();" style="padding: 3px 8px; font-size: 11px; background-color: #10b981; color: white; border: none; font-weight: bold; border-radius: 4px; margin-right: 4px;" title="Send this button directly into active chat"><i class="fa-solid fa-paper-plane"></i> Send</button>`
                    : '';

                tr.innerHTML = `
                    <td style="text-align: center; font-weight: bold;">${p.order_index}</td>
                    <td>
                        <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: ${p.bg_color}; color: ${p.text_color}; font-size: 11px; font-weight: bold;">
                            ${p.title}
                        </div>
                        ${(() => {
                            if (p.duration_seconds) {
                                const sec = p.duration_seconds;
                                if (sec < 60) return `<small style="color: #10b981; font-weight: bold; margin-left: 6px;">(${sec} sec)</small>`;
                                if (sec < 3600) return `<small style="color: #10b981; font-weight: bold; margin-left: 6px;">(${Math.round(sec / 60)} min)</small>`;
                                if (sec < 86400) return `<small style="color: #10b981; font-weight: bold; margin-left: 6px;">(${Math.round(sec / 3600)} hrs)</small>`;
                                return `<small style="color: var(--text-secondary); margin-left: 6px;">(${Math.round(sec / 86400)} days)</small>`;
                            }
                            return p.days ? `<small style="color: var(--text-secondary); margin-left: 6px;">(${p.days} days)</small>` : '';
                        })()}
                    </td>
                    <td style="text-align: center;">${badgeType}</td>
                    <td style="text-align: right; white-space: nowrap;">
                        ${sendBtn}
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

function setPresetDurationQuick(val, unit, title) {
    const valInput = document.getElementById('form-preset-duration-val');
    const unitSelect = document.getElementById('form-preset-duration-unit');
    const titleInput = document.getElementById('form-preset-title');

    if (valInput) valInput.value = val;
    if (unitSelect) unitSelect.value = unit;

    if (titleInput && (!titleInput.value.trim() || titleInput.dataset.autoTitle === 'true')) {
        titleInput.value = title;
        titleInput.dataset.autoTitle = 'true';
    }

    updatePresetDurationCalc();
}

function updatePresetDurationCalc() {
    const valInput = document.getElementById('form-preset-duration-val');
    const unitSelect = document.getElementById('form-preset-duration-unit');
    const previewEl = document.getElementById('preset-duration-preview');
    const secInput = document.getElementById('form-preset-seconds');
    const daysInput = document.getElementById('form-preset-days');

    const val = parseInt(valInput ? valInput.value : '30', 10) || 30;
    const unit = unitSelect ? unitSelect.value : 'seconds';

    let totalSeconds = val;
    let label = `${val} সেকেন্ড`;

    switch (unit) {
        case 'seconds':
            totalSeconds = val;
            label = `${val} সেকেন্ড (${val}s)`;
            break;
        case 'minutes':
            totalSeconds = val * 60;
            label = `${val} মিনিট (${val}m)`;
            break;
        case 'hours':
            totalSeconds = val * 3600;
            label = `${val} ঘণ্টা (${val}h)`;
            break;
        case 'days':
            totalSeconds = val * 86400;
            label = `${val} দিন (${val}d)`;
            break;
        case 'years':
            totalSeconds = val * 31536000;
            label = `${val} বছর (${val}y)`;
            break;
    }

    if (secInput) secInput.value = totalSeconds;
    if (daysInput) daysInput.value = Math.max(1, Math.ceil(totalSeconds / 86400));
    if (previewEl) previewEl.textContent = label;
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
    const titleInput = document.getElementById('form-preset-title');
    titleInput.value = '';
    titleInput.dataset.autoTitle = 'true';
    document.getElementById('form-preset-type').value = 'license';
    document.getElementById('form-preset-text').value = '';
    document.getElementById('form-preset-bg-color').value = '#3b82f6';
    document.getElementById('form-preset-text-color').value = '#ffffff';
    document.getElementById('form-preset-order').value = (allChatPresetsList.length + 1).toString();
    toggleChatPresetTypeFields('license');

    // Default to 30 seconds for quick testing
    setPresetDurationQuick(30, 'seconds', '30s Test License');

    const modal = document.getElementById('chat-preset-modal');
    if (modal) modal.style.display = 'flex';
}

function openEditChatPresetModal(preset) {
    document.getElementById('chat-preset-modal-title').textContent = 'Edit Chat Response Button';
    document.getElementById('form-preset-id').value = preset.id;
    const titleInput = document.getElementById('form-preset-title');
    titleInput.value = preset.title;
    titleInput.dataset.autoTitle = 'false';
    document.getElementById('form-preset-type').value = preset.type || 'license';
    document.getElementById('form-preset-text').value = preset.message_text || '';
    document.getElementById('form-preset-bg-color').value = preset.bg_color || '#3b82f6';
    document.getElementById('form-preset-text-color').value = preset.text_color || '#ffffff';
    document.getElementById('form-preset-order').value = preset.order_index || '0';
    toggleChatPresetTypeFields(preset.type || 'license');

    if (preset.duration_seconds && preset.duration_seconds > 0) {
        const sec = preset.duration_seconds;
        if (sec < 60) {
            setPresetDurationQuick(sec, 'seconds', preset.title);
        } else if (sec < 3600 && sec % 60 === 0) {
            setPresetDurationQuick(sec / 60, 'minutes', preset.title);
        } else if (sec < 86400 && sec % 3600 === 0) {
            setPresetDurationQuick(sec / 3600, 'hours', preset.title);
        } else if (sec % 31536000 === 0) {
            setPresetDurationQuick(sec / 31536000, 'years', preset.title);
        } else {
            setPresetDurationQuick(Math.round(sec / 86400), 'days', preset.title);
        }
    } else if (preset.days) {
        setPresetDurationQuick(preset.days, 'days', preset.title);
    } else {
        setPresetDurationQuick(30, 'seconds', preset.title);
    }

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
    const durationSeconds = parseInt(document.getElementById('form-preset-seconds')?.value || '30', 10);
    const days = parseInt(document.getElementById('form-preset-days')?.value || '1', 10);
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
            'X-CSRF-TOKEN': getAdminCsrfToken()
        },
        body: JSON.stringify({
            title: title,
            type: type,
            days: days,
            duration_seconds: durationSeconds,
            message_text: messageText,
            bg_color: bgColor,
            text_color: textColor,
            order_index: parseInt(orderIndex) || 0
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
            'X-CSRF-TOKEN': getAdminCsrfToken()
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
