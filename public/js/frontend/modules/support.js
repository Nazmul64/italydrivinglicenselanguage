/**
 * Support (Live Tutor Chat) Module JS
 */
function loadSupportModule() {
    fetch('/api/v1/support/messages')
        .then(res => res.json())
        .then(data => {
            console.log('Support messages loaded:', data);
        })
        .catch(err => console.error('Error loading support messages:', err));
}
