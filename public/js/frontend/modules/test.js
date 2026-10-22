/**
 * Test (Practice Test & Exam Simulation) Module JS
 * Integrates with /api/v1/test/questions and /api/v1/test/submit
 */

function loadTestModule(limit = 30, chapter = null) {
    let url = `/api/v1/test/questions?limit=${limit}`;
    if (chapter) {
        url += `&chapter=${encodeURIComponent(chapter)}`;
    }

    return fetch(url)
        .then(res => res.json())
        .then(resData => {
            const questions = resData.data || resData || [];
            if (typeof testQuestions !== 'undefined') {
                testQuestions = questions;
                if (typeof currentTestIndex !== 'undefined') currentTestIndex = 0;
                if (typeof testAnswers !== 'undefined') testAnswers = Array(testQuestions.length).fill(null);
            }
            return questions;
        })
        .catch(err => {
            console.error('Error loading practice test questions:', err);
            return [];
        });
}

function submitTestResult(totalQuestions, correctCount, wrongCount, answersObj = {}) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const curPhone = localStorage.getItem('app_client_phone') || (typeof currentClientPhone !== 'undefined' ? currentClientPhone : '') || '';
    const curSessionId = localStorage.getItem('app_client_session_id') || (typeof currentClientSessionId !== 'undefined' ? currentClientSessionId : '') || '';
    const curFirstName = localStorage.getItem('app_client_first_name') || (typeof currentClientFirstName !== 'undefined' ? currentClientFirstName : '') || '';
    const curLastName = localStorage.getItem('app_client_last_name') || (typeof currentClientLastName !== 'undefined' ? currentClientLastName : '') || '';

    return fetch('/api/v1/test/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Client-Phone': curPhone,
            'X-Session-ID': curSessionId,
            'X-Client-Session-ID': curSessionId,
            'X-Client-First-Name': encodeURIComponent(curFirstName || ''),
            'X-Client-Last-Name': encodeURIComponent(curLastName || '')
        },
        body: JSON.stringify({
            phone: curPhone,
            session_id: curSessionId,
            first_name: curFirstName,
            last_name: curLastName,
            total_questions: totalQuestions,
            correct_count: correctCount,
            wrong_count: wrongCount,
            answers: answersObj
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Practice test result saved successfully:', data);
            return data;
        })
        .catch(err => {
            console.error('Error submitting practice test result:', err);
        });
}
