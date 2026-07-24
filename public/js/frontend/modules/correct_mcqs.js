/**
 * Correct MCQs Module JS
 */
function loadCorrectMcqsModule() {
    fetch('/api/v1/correct-mcqs')
        .then(res => res.json())
        .then(data => {
            console.log('Correct MCQs loaded:', data);
        })
        .catch(err => console.error('Error loading correct MCQs:', err));
}
