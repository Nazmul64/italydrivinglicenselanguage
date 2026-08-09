// --- 12. Guest Chat System AJAX Logic ---
let chatInterval = null;
let knownChatMessageIds = new Set();
let unreadChatMessageCount = 0;
let isFirstChatLoad = true;

function playChatNotificationSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
        console.log("Notification audio play skipped: ", e);
    }
}

function updateChatHeaderUnreadBadge() {
    const badge = document.getElementById('chat-header-unread-badge');
    if (!badge) return;
    if (unreadChatMessageCount > 0) {
        badge.textContent = unreadChatMessageCount > 99 ? '99+' : unreadChatMessageCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function toggleGuestChat(show) {
    const widget = document.getElementById('guest-chat-widget');
    if (!widget) return;
    widget.style.display = show ? 'flex' : 'none';

    if (show) {
        unreadChatMessageCount = 0;
        updateChatHeaderUnreadBadge();
        const savedPhone = localStorage.getItem('app_client_phone');
        if (savedPhone || currentClientVerified) {
            setChatWidgetView('normal');
        } else {
            setChatWidgetView('verify');
        }
        checkClientActivation();
        fetchGuestChatMessages();
    }
}

function fetchGuestChatMessages() {
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;
    let url = '/api/chat/messages';
    if (savedSessionId) {
        url += '?session_id=' + encodeURIComponent(savedSessionId);
    }

    fetch(url)
        .then(res => res.json())
        .then(messages => {
            if (Array.isArray(messages)) {
                let hasNewAdminMsg = false;

                messages.forEach(msg => {
                    if (msg.id && !knownChatMessageIds.has(msg.id)) {
                        knownChatMessageIds.add(msg.id);
                        if (!isFirstChatLoad && msg.sender === 'admin') {
                            hasNewAdminMsg = true;
                            unreadChatMessageCount++;
                        }
                    }
                });

                if (isFirstChatLoad) {
                    isFirstChatLoad = false;
                } else if (hasNewAdminMsg) {
                    const widget = document.getElementById('guest-chat-widget');
                    const isChatOpen = widget && widget.style.display !== 'none' && widget.style.display !== '';
                    if (!isChatOpen) {
                        updateChatHeaderUnreadBadge();
                        playChatNotificationSound();
                    } else {
                        unreadChatMessageCount = 0;
                        updateChatHeaderUnreadBadge();
                    }
                }

                renderGuestChatMessages(messages);
            }
        })
        .catch(err => console.error("Error fetching chat: ", err));
}

function renderGuestChatMessages(messages) {
    const container = document.getElementById('guest-chat-messages');
    if (!container) return;
    const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = '';
    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">আপনার বার্তা লিখে চ্যাট শুরু করুন। রহমান স্যার খুব শীঘ্রই উত্তর দেবেন!</div>`;
        return;
    }

    messages.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.message && msg.message.startsWith('[LICENSE_CARD:') && msg.message.endsWith(']')) {
            const matchDays = msg.message.match(/days=(\d+)/);
            const matchKey = msg.message.match(/key=(\d+)/);
            const days = matchDays ? matchDays[1] : 365;
            const key = matchKey ? matchKey[1] : '';

            bubble.className = `license-card-bubble`;
            let buttonHTML = `<button class="license-card-btn" onclick="activateLicenseFromCard(${days})">Attiva Licenza</button>`;
            if (currentClientActive) {
                buttonHTML = `<div style="text-align: center; font-size: 13px; font-weight: 800; color: #4CAF50; border: 1.5px solid #4CAF50; border-radius: 12px; padding: 10px; margin-top: 12px; font-family: inherit;">Licenza Attivata ✓</div>`;
            }

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
                ${buttonHTML}
            `;
        } else {
            bubble.className = `chat-bubble ${msg.sender === 'user' ? 'user' : 'admin'}`;
            if (msg.attachment_path) {
                const img = document.createElement('img');
                img.src = msg.attachment_path;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '200px';
                img.style.borderRadius = '12px';
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

    if (scrollAtBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight;
    }
}

function activateLicenseFromCard(days) {
    showToast('লাইসেন্স সক্রিয় করা হচ্ছে...');

    fetch('/api/client/activate', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: days })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(`লাইসেন্স সফলভাবে সক্রিয় করা হয়েছে! (${days} দিন)`);
                checkClientActivation();
            } else {
                showToast('সক্রিয় করতে সমস্যা হয়েছে');
            }
        })
        .catch(err => {
            console.error("Error activating license: ", err);
            showToast('সক্রিয় করতে সমস্যা হয়েছে');
        });
}

function triggerChatAttachment() {
    const fileInput = document.getElementById('guest-chat-file');
    if (fileInput) fileInput.click();
}

function uploadChatAttachment(input) {
    if (!input.files || !input.files[0]) return;

    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    if (!savedPhone && !currentClientVerified) {
        showToast('চ্যাট শুরু করতে আপনার নাম ও মোবাইল নম্বর দিয়ে ভেরিফাই করুন।');
        setChatWidgetView('verify');
        input.value = '';
        return;
    }

    const file = input.files[0];
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', '');
    if (savedSessionId) formData.append('session_id', savedSessionId);

    showToast('ফাইল আপলোড হচ্ছে...');

    fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: formData
    })
        .then(res => {
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        })
        .then(msg => {
            input.value = '';
            fetchGuestChatMessages();
            showToast('ফাইল পাঠানো হয়েছে');
        })
        .catch(err => {
            console.error("Error uploading attachment: ", err);
            showToast('ফাইল আপলোড করতে সমস্যা হয়েছে');
        });
}

function sendGuestChatMessage() {
    const savedPhone = localStorage.getItem('app_client_phone') || currentClientPhone;
    if (!savedPhone && !currentClientVerified) {
        showToast('চ্যাট শুরু করতে আপনার নাম ও মোবাইল নম্বর দিয়ে ভেরিফাই করুন।');
        setChatWidgetView('verify');
        return;
    }

    const input = document.getElementById('guest-chat-input');
    if (!input) return;
    const messageText = input.value.trim();
    if (!messageText) return;

    input.value = '';
    const savedSessionId = localStorage.getItem('app_client_session_id') || currentClientSessionId;

    fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({
            message: messageText,
            session_id: savedSessionId
        })
    })
        .then(res => res.json())
        .then(msg => {
            fetchGuestChatMessages();
        })
        .catch(err => console.error("Error sending message: ", err));
}

// Start continuous background polling for live chat messages
setInterval(fetchGuestChatMessages, 3000);

window.openTeacherHelpModal = function() {
    toggleGuestChat(true);
};

