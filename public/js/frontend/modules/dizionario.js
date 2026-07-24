/**
 * Dizionario (Italian-Bangla Dictionary) Module JS
 */
function loadDizionarioModule() {
    fetch('/api/v1/dizionario')
        .then(res => res.json())
        .then(data => {
            console.log('Dizionario terms loaded:', data);
        })
        .catch(err => console.error('Error loading dizionario:', err));
}
