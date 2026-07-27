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
    
    return fetch('/api/v1/test/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
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
