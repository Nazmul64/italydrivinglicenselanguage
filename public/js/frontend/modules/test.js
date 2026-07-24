/**
 * Test (Practice Test) Module JS
 */
function loadTestModule() {
    fetch('/api/v1/test/questions')
        .then(res => res.json())
        .then(data => {
            console.log('Test questions loaded:', data);
        })
        .catch(err => console.error('Error loading test questions:', err));
}
