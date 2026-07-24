<!-- SCREEN: Exam Simulation (Taking Exam) -->
<div id="screen-exam-simulation" class="screen" style="display: none;">
    <div class="exam-timer-box">
        <span class="section-title">অফিসিয়াল পরীক্ষা ডেমো</span>
        <span class="timer-badge" id="exam-timer">30:00</span>
    </div>

    <div class="exam-grid-dots" id="exam-dots-container">
        <!-- Dots 1 to 30 will be generated via JavaScript -->
    </div>

    <div class="content-card quiz-box">
        <div style="font-size: 13px; font-weight: bold; color: #3B82F6;" id="exam-question-number">প্রশ্ন ১</div>
        <div class="question-text" id="exam-question-it">Caricamento della domanda...</div>
        <div class="question-bangla" id="exam-question-bn" style="display: none;">প্রশ্ন লোড হচ্ছে...</div>
        
        <div class="answer-buttons">
            <button class="ans-btn btn-vero" id="exam-vero-btn" onclick="answerSchedaExamQuestion(true)">
                VERO
            </button>
            <button class="ans-btn btn-falso" id="exam-falso-btn" onclick="answerSchedaExamQuestion(false)">
                FALSO
            </button>
        </div>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 14px;">
        <button class="action-btn" style="flex: 1; margin:0;" onclick="prevSchedaExamQuestion()">
            <i class="fa-solid fa-arrow-left"></i> পূর্বের
        </button>
        <button class="action-btn" style="flex: 1; margin:0;" onclick="nextSchedaExamQuestion()">
            পরবর্তী <i class="fa-solid fa-arrow-right"></i>
        </button>
    </div>

    <button class="submit-exam-btn" onclick="submitSchedaExam()">
        <i class="fa-solid fa-circle-check"></i> খাতা জমা দিন (Consegna)
    </button>
</div>
