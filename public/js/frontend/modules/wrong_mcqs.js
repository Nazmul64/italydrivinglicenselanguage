/**
 * Wrong MCQs Module JS
 */
function loadWrongMcqsModule() {
    fetch('/api/v1/wrong-mcqs')
        .then(res => res.json())
        .then(data => {
            console.log('Wrong MCQs loaded:', data);
        })
        .catch(err => console.error('Error loading wrong MCQs:', err));
}
