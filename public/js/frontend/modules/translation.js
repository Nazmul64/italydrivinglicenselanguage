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

    const params = new URLSearchParams();
    params.append('text', text);
    params.append('from_lang', fromLang);
    params.append('to_lang', toLang);

    fetch(`/api/v1/translate?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            let translated = '';
            if (data.status === 'success') {
                translated = data.translated_text || data.translation || (data.data ? (toLang === 'it' ? data.data.italian : data.data.bangla) : '');
            }
            if (!translated && data.data) {
                translated = (toLang === 'bn') ? (data.data.bangla || data.data.definition) : (data.data.italian || data.data.term);
            }
            if (translated && translated !== text) {
                lastTranslatedText = translated;
                lastTargetLang = toLang;
                if (resultTextEl) resultTextEl.innerText = translated;
            } else if (translated) {
                lastTranslatedText = translated;
                lastTargetLang = toLang;
                if (resultTextEl) resultTextEl.innerText = translated;
            } else {
                fetchClientSideTranslation(text, fromLang, toLang, resultTextEl);
            }
        })
        .catch(err => {
            console.warn('Backend translation failed, falling back to direct browser translator:', err);
            fetchClientSideTranslation(text, fromLang, toLang, resultTextEl);
        });
}

function fetchClientSideTranslation(text, fromLang, toLang, resultTextEl) {
    const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
    fetch(directUrl)
        .then(res => res.json())
        .then(arr => {
            if (arr && arr[0] && Array.isArray(arr[0])) {
                let directResult = '';
                arr[0].forEach(part => {
                    if (part && part[0]) directResult += part[0];
                });
                if (directResult.trim()) {
                    lastTranslatedText = directResult.trim();
                    lastTargetLang = toLang;
                    if (resultTextEl) resultTextEl.innerText = lastTranslatedText;
                    return;
                }
            }
            if (resultTextEl) resultTextEl.innerText = 'অনুবাদ পাওয়া যায়নি';
        })
        .catch(() => {
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
