/**
 * Lezioni (Recorded Classes) Module JS
 */
function loadLezioniModule() {
    fetch('/api/v1/lezioni')
        .then(res => res.json())
        .then(data => {
            console.log('Lezioni loaded:', data);
        })
        .catch(err => console.error('Error loading lezioni:', err));
}
