/**
 * E-Class (Live Classes) Module JS
 */
function loadEClassModule() {
    fetch('/api/v1/eclass')
        .then(res => res.json())
        .then(data => {
            console.log('E-Classes loaded:', data);
        })
        .catch(err => console.error('Error loading eclasses:', err));
}
