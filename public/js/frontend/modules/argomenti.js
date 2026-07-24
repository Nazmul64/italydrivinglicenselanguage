/**
 * Argomenti (Theory Chapters & Pages) Module JS
 */
function loadArgomentiModule() {
    fetch('/api/v1/chapters')
        .then(res => res.json())
        .then(data => {
            console.log('Argomenti chapters loaded:', data);
        })
        .catch(err => console.error('Error loading chapters:', err));
}
