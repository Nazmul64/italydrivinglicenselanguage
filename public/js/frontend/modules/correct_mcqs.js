/**
 * Correct MCQs Module JS
 * Integrates with profile filters and SPA navigation
 */

function loadCorrectMcqsModule() {
    if (typeof loadCorrectMcqsList === 'function') {
        // Handled by 10_activation_profile.js
        return;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('correct-mcqs-screen')?.classList.contains('active')) {
        if (typeof loadCorrectMcqsList === 'function') {
            loadCorrectMcqsList();
        }
    }
});
