/**
 * Wrong MCQs Module JS
 * Integrates with profile filters and SPA navigation
 */

function loadWrongMcqsModule() {
    if (typeof loadWrongMcqsList === 'function') {
        // Handled by 10_activation_profile.js
        return;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('wrong-mcqs-screen')?.classList.contains('active')) {
        if (typeof loadWrongMcqsList === 'function') {
            loadWrongMcqsList();
        }
    }
});
