/**
 * Support (Live Tutor Chat) Module JS
 * Integrates with /api/v1/support/messages
 */

function loadSupportModule() {
    return fetch('/api/v1/support/messages')
        .then(res => res.json())
        .then(resData => {
            const messages = resData.data || resData || [];
            console.log('Support messages loaded from /api/v1/support/messages:', messages);
            return messages;
        })
        .catch(err => {
            console.error('Error loading support messages:', err);
            return [];
        });
}

function sendSupportMessageApi(messageText, attachmentPath = null) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    return fetch('/api/v1/support/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            message: messageText,
            attachment: attachmentPath
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Support message sent via v1 API:', data);
        return data;
    })
    .catch(err => {
        console.error('Error sending support message via v1 API:', err);
    });
}
