/**
 * Dizionario (Italian-Bangla Dictionary) Module JS
 * Optimized for Server-Side Rendered Blade Data
 */

function loadDizionarioModule(searchQuery = '') {
    if (typeof filterDictionary === 'function') {
        const searchInput = document.getElementById('dictionary-search');
        if (searchInput && searchQuery !== undefined) {
            searchInput.value = searchQuery;
        }
        filterDictionary();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // If dictionary data is already rendered by Laravel, no fetch needed.
    const searchInput = document.getElementById('dictionary-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (typeof filterDictionary === 'function') {
                filterDictionary();
            }
        });
    }
});
