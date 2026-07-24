/**
 * Sfida (Speed Challenge) Module JS
 */
function loadSfidaModule() {
    fetch('/api/v1/sfida/questions')
        .then(res => res.json())
        .then(data => {
            console.log('Sfida questions loaded:', data);
        })
        .catch(err => console.error('Error loading sfida:', err));
}
