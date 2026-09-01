/**
 * Sfida (Speed Challenge) & Leaderboard Module JS
 * Integrates with /api/v1/sfida/questions and /api/v1/leaderboard
 */

let activeSfidaQuestions = [];

function loadSfidaModule(limit = 15) {
    fetchLeaderboardData();

    return fetch(`/api/v1/sfida/questions?limit=${limit}`)
        .then(res => res.json())
        .then(resData => {
            const questions = resData.data || resData || [];
            activeSfidaQuestions = Array.isArray(questions) ? questions : [];
            return activeSfidaQuestions;
        })
        .catch(err => {
            console.error('Error loading sfida questions:', err);
            return [];
        });
}

function startSfidaChallenge() {
    if (typeof showToast === 'function') showToast('চ্যালেঞ্জ লোড হচ্ছে...');

    loadSfidaModule(20).then(questions => {
        if (!questions || questions.length === 0) {
            if (typeof showToast === 'function') showToast('চ্যালেঞ্জ প্রশ্ন পাওয়া যায়নি');
            return;
        }

        if (typeof testQuestions !== 'undefined') {
            testQuestions = questions;
            if (typeof currentTestIndex !== 'undefined') currentTestIndex = 0;
            if (typeof testAnswers !== 'undefined') testAnswers = Array(testQuestions.length).fill(null);
            if (typeof practiceMode !== 'undefined') practiceMode = 'sfida';
        }

        if (typeof openScreen === 'function') {
            openScreen('test', 'Sfida Challenge');
        }
        if (typeof switchTestQuestionTab === 'function') switchTestQuestionTab(1);
        if (typeof showTestQuestion === 'function') showTestQuestion();
        if (typeof startTestTimer === 'function') startTestTimer();
    });
}

function fetchLeaderboardData() {
    return fetch('/api/v1/leaderboard')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(resData => {
            const rankings = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
            renderLeaderboardUI(rankings);
            return rankings;
        })
        .catch(err => {
            console.error('Error fetching leaderboard:', err);
            renderLeaderboardUI([]);
            return [];
        });
}

function loadLeaderboardData() {
    fetchLeaderboardData();
}

function renderLeaderboardUI(rankings) {
    const podiumContainer = document.getElementById('sfida-podium-container');
    const listContainer = document.getElementById('sfida-leaderboard-list');

    if (!Array.isArray(rankings)) {
        rankings = [];
    }

    if (rankings.length === 0) {
        if (podiumContainer) podiumContainer.innerHTML = '';
        if (listContainer) {
            listContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">এখনো র্যাঙ্কিং ডাটা নেই</div>`;
        }
        return;
    }

    if (podiumContainer) {
        podiumContainer.innerHTML = '';
        const top3 = rankings.slice(0, 3);
        const podiumColors = ['#F59E0B', '#94A3B8', '#D97706']; // Gold, Silver, Bronze

        top3.forEach((user, idx) => {
            const card = document.createElement('div');
            card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 14px; padding: 12px 8px; text-align: center;';
            card.innerHTML = `
                <div style="font-size: 14px; font-weight: 900; color: ${podiumColors[idx]}; margin-bottom: 4px;">#${user.rank || (idx + 1)}</div>
                <img src="${user.avatar}" alt="${user.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-bottom: 6px; border: 2px solid ${podiumColors[idx]};">
                <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.name}</div>
                <div style="font-size: 11px; font-weight: 700; color: var(--accent-green); margin-top: 2px;">${user.correct_count || 0} Pts</div>
            `;
            podiumContainer.appendChild(card);
        });
    }

    if (listContainer) {
        listContainer.innerHTML = '';
        const restList = rankings.slice(3);
        restList.forEach(user => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px;';
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 13px; font-weight: 800; color: var(--text-secondary); width: 24px;">#${user.rank}</span>
                    <img src="${user.avatar}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${user.name}</span>
                </div>
                <div style="font-size: 12px; font-weight: 800; color: var(--accent-green);">${user.correct_count || 0} Pts</div>
            `;
            listContainer.appendChild(item);
        });
    }
}


// Note: loadSfidaModule() is called on-demand via openScreen('sfida')
// Do NOT auto-trigger here to avoid unnecessary API calls.
