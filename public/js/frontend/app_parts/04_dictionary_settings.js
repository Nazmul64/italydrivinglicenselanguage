// --- 10. Dictionary Logic ---
let dictionaryData = [];

function fetchDictionaryData() {
    fetch('/api/v1/dizionario')
        .then(r => r.json())
        .then(data => {
            const dbWords = Array.isArray(data) ? data : (data.data || []);
            dictionaryData = dbWords.map(dbItem => ({
                word: dbItem.italian || dbItem.word || '',
                bn: dbItem.bangla || dbItem.bn || '',
                desc_it: dbItem.definition || dbItem.desc_it || '',
                desc_bn: dbItem.bangla || dbItem.desc_bn || '',
                image: dbItem.image || '',
                audio: dbItem.audio || null,
                video: dbItem.video || null,
            })).filter(item => item.word !== '');
        })
        .catch(() => { });
}
fetchDictionaryData();

function initDictionary() {
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    dictionaryData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card dictionary-item';
        card.innerHTML = `
            <div class="dict-word">${item.word}</div>
            <div class="dict-meaning">${item.bn}</div>
            <div class="dict-desc">${item.desc_it}<br><span style="color: var(--accent-green); font-weight:700;">${item.desc_bn}</span></div>
        `;
        listContainer.appendChild(card);
    });
}

function filterDictionary() {
    const query = document.getElementById('dictionary-search').value.toLowerCase();
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const filtered = dictionaryData.filter(item =>
        item.word.toLowerCase().includes(query) ||
        item.bn.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-secondary);">কোনো ফলাফল পাওয়া যায়নি!</div>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card dictionary-item';
        card.innerHTML = `
            <div class="dict-word">${item.word}</div>
            <div class="dict-meaning">${item.bn}</div>
            <div class="dict-desc">${item.desc_it}<br><span style="color: var(--accent-green); font-weight:700;">${item.desc_bn}</span></div>
        `;
        listContainer.appendChild(card);
    });
}


// --- 11. App Settings & Sound Systems ---
let soundEnabled = true;

function toggleSound(checked) {
    soundEnabled = checked;
    showToast(soundEnabled ? 'শব্দ সংকেত চালু হয়েছে' : 'শব্দ সংকেত বন্ধ করা হয়েছে');
}

function playAppSound(isCorrect) {
    if (!soundEnabled) return;
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.connect(gain);
        gain.connect(context.destination);

        if (isCorrect) {
            osc.frequency.setValueAtTime(523.25, context.currentTime);
            osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            osc.start();
            osc.stop(context.currentTime + 0.3);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, context.currentTime);
            osc.frequency.setValueAtTime(110, context.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
            osc.start();
            osc.stop(context.currentTime + 0.4);
        }
    } catch (e) {
        console.error("Audio error: ", e);
    }
}

function resetAppData() {
    if (confirm("আপনি কি নিশ্চিতভাবে সব ডেটা রিসেট করতে চান?")) {
        const examsEl = document.getElementById('stats-exams');
        const errorsEl = document.getElementById('stats-errors');
        if (examsEl) examsEl.innerText = '0';
        if (errorsEl) errorsEl.innerText = '0.0';
        showToast('সব ডেটা সফলভাবে রিসেট করা হয়েছে');
    }
}
