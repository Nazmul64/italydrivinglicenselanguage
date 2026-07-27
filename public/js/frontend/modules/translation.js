// ==========================================
// Translation & Pronunciation Module
// ==========================================

let currentTranslationMode = 'bn_to_it'; // 'bn_to_it' or 'it_to_bn'
let lastTranslatedText = '';
let lastTargetLang = 'it';

function setTranslationMode(mode) {
    currentTranslationMode = mode;

    const btnBnIt = document.getElementById('btn-trans-mode-bn-it');
    const btnItBn = document.getElementById('btn-trans-mode-it-bn');
    const label = document.getElementById('trans-current-mode-label');
    const input = document.getElementById('trans-input-text');

    if (mode === 'bn_to_it') {
        if (btnBnIt) {
            btnBnIt.style.borderColor = '#2563EB';
            btnBnIt.style.color = '#1e293b';
        }
        if (btnItBn) {
            btnItBn.style.borderColor = '#cbd5e1';
            btnItBn.style.color = '#64748b';
        }
        if (label) label.innerHTML = '<i class="fa-solid fa-language"></i> বাংলা ➔ ইতালিয়ান';
        if (input) input.placeholder = 'বাংলা বাক্য বা শব্দ লিখুন... (যেমন: শুভ সকাল)';
    } else {
        if (btnItBn) {
            btnItBn.style.borderColor = '#2563EB';
            btnItBn.style.color = '#1e293b';
        }
        if (btnBnIt) {
            btnBnIt.style.borderColor = '#cbd5e1';
            btnBnIt.style.color = '#64748b';
        }
        if (label) label.innerHTML = '<i class="fa-solid fa-language"></i> ইতালিয়ান ➔ বাংলা';
        if (input) input.placeholder = 'ইতালিয়ান বাক্য বা শব্দ লিখুন... (e.g. Buongiorno)';
    }
}

function clearTranslationInput() {
    const input = document.getElementById('trans-input-text');
    if (input) input.value = '';
    const card = document.getElementById('trans-result-card');
    if (card) card.style.display = 'none';
}

function performTranslation() {
    const input = document.getElementById('trans-input-text');
    const text = input ? input.value.trim() : '';

    if (!text) {
        if (typeof showToast === 'function') showToast('অনুবাদ করার জন্য কিছু লিখুন');
        return;
    }

    const fromLang = currentTranslationMode === 'bn_to_it' ? 'bn' : 'it';
    const toLang = currentTranslationMode === 'bn_to_it' ? 'it' : 'bn';

    const resultCard = document.getElementById('trans-result-card');
    const resultTextEl = document.getElementById('trans-result-text');

    if (resultTextEl) {
        resultTextEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অনুবাদ করা হচ্ছে...';
    }
    if (resultCard) resultCard.style.display = 'block';

    const formData = new FormData();
    formData.append('text', text);
    formData.append('from_lang', fromLang);
    formData.append('to_lang', toLang);

    fetch(`/api/v1/translation?term=${encodeURIComponent(text)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                const translationResult = (toLang === 'bn') ? (data.data.bangla || data.data.definition) : (data.data.italian || data.data.term);
                lastTranslatedText = translationResult || text;
                lastTargetLang = toLang;
                if (resultTextEl) resultTextEl.innerText = translationResult || text;
            } else {
                fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: formData
                })
                .then(res => res.json())
                .then(data2 => {
                    if (data2.status === 'success' && data2.translated_text) {
                        lastTranslatedText = data2.translated_text;
                        lastTargetLang = toLang;
                        if (resultTextEl) resultTextEl.innerText = data2.translated_text;
                    } else {
                        if (resultTextEl) resultTextEl.innerText = 'অনুবাদ পাওয়া যায়নি';
                    }
                })
                .catch(() => {
                    if (resultTextEl) resultTextEl.innerText = 'অনুবাদ পাওয়া যায়নি';
                });
            }
        })
        .catch(err => {
            console.error('Translation error:', err);
            if (resultTextEl) resultTextEl.innerText = 'অনুবাদ করতে সমস্যা হয়েছে';
        });
}

function fetchQuestionTranslationApi(questionId) {
    return fetch(`/api/v1/translation?question_id=${questionId}`)
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success' && resData.data) {
                return resData.data;
            }
            return null;
        })
        .catch(err => {
            console.error('Error fetching question translation details:', err);
            return null;
        });
}

function playTranslationAudio() {
    if (!lastTranslatedText) {
        const resultTextEl = document.getElementById('trans-result-text');
        lastTranslatedText = resultTextEl ? resultTextEl.innerText.trim() : '';
    }

    if (!lastTranslatedText) {
        if (typeof showToast === 'function') showToast('উচ্চারণ শোনার জন্য আগে অনুবাদ করুন');
        return;
    }

    if (!('speechSynthesis' in window)) {
        if (typeof showToast === 'function') showToast('আপনার ব্রাউজারে টেক্সট-টু-স্পিচ সাপোর্ট নেই');
        return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(lastTranslatedText);
    utterance.lang = lastTargetLang === 'it' ? 'it-IT' : 'bn-BD';
    utterance.rate = 0.9; // Slightly calm speaking rate for clarity

    window.speechSynthesis.speak(utterance);
    if (typeof showToast === 'function') showToast('উচ্চারণ প্লে হচ্ছে...');
}

function copyTranslationResult() {
    const textEl = document.getElementById('trans-result-text');
    const text = textEl ? textEl.innerText.trim() : '';

    if (!text) return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') showToast('অনুবাদিত টেক্সট কপি করা হয়েছে!');
        });
    } else {
        if (typeof showToast === 'function') showToast('অনুবাদিত টেক্সট সিলেক্ট করে কপি করুন');
    }
}

function initTranslationModule() {
    setTranslationMode('bn_to_it');
}

window.addEventListener('DOMContentLoaded', () => {
    initTranslationModule();
});
