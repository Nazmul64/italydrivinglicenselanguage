/**
 * Saved MCQs (Bookmarks) Module JS
 */
function loadSavedMcqsModule() {
    fetch('/api/v1/saved-mcqs')
        .then(res => res.json())
        .then(data => {
            console.log('Saved MCQs loaded:', data);
        })
        .catch(err => console.error('Error loading saved MCQs:', err));
}
