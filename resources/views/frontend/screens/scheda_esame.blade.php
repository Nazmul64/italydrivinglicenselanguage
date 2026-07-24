<!-- SCREEN: Scheda Esame (Passed Exam Sheets Scheduler) -->
<div id="screen-scheda-esame" class="screen" style="display: none; padding: 0; position: relative;">

    <!-- 1. INFO POPUP MODAL (Matching Screenshot 2) -->
    <div id="scheda-info-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
        <div style="background: #ffffff; width: 100%; max-width: 340px; border-radius: 20px; padding: 26px 20px 20px 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.25); animation: popIn 0.25s ease-out;">
            <!-- Info Icon Circle -->
            <div style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid #22D3EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; color: #22D3EE; font-size: 36px; font-weight: 800; font-family: sans-serif;">
                i
            </div>

            <!-- Modal Description Text -->
            <p style="font-size: 15px; font-weight: 600; color: #1e293b; line-height: 1.5; margin: 0 0 24px 0;">
                Queste Schede sono gli esami passati da alcuni utenti che sono riuscite a passare l'esame usando questa applicazione
            </p>

            <!-- Ok Button -->
            <button type="button" onclick="closeSchedaInfoModal()" style="background: none; border: none; color: #EF4444; font-size: 18px; font-weight: 800; cursor: pointer; padding: 6px 24px;">
                Ok
            </button>
        </div>
    </div>

    <!-- 2. SCHEDA ESAME LIST VIEW (Matching Screenshot 3) -->
    <div id="scheda-list-view" style="display: block; padding: 16px;">
        <!-- Top Header Bar -->
        <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); padding: 14px 16px; margin: -16px -16px 16px -16px; color: white; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(220,38,38,0.25);">
            <i class="fa-solid fa-arrow-left" onclick="openScreen('screen-home')" style="cursor: pointer; font-size: 18px;"></i>
            <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.3px;">Scheda Esame</h2>
        </div>

        <!-- Search Bar -->
        <div style="position: relative; margin-bottom: 20px;">
            <input type="text" id="scheda-search-input" oninput="filterSchedaCards()" placeholder="Search here" style="width: 100%; padding: 12px 16px 12px 42px; border-radius: 28px; border: 1.5 solid #cbd5e1; background-color: #f8fafc; color: #0f172a; font-size: 14px; font-weight: 600; outline: none; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px;"></i>
        </div>

        <!-- Exam Cards List Container -->
        <div id="scheda-cards-container" style="display: flex; flex-direction: column; gap: 16px; padding-bottom: 80px;">
            <!-- Dynamic Exam Cards Loaded via JS -->
        </div>
    </div>

    <!-- 3. INTERACTIVE 30-MCQ QUIZ VIEW (Matching Screenshot 4) -->
    <div id="scheda-quiz-view" style="display: none; padding: 16px;">
        <!-- Header Bar -->
        <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); padding: 14px 16px; margin: -16px -16px 14px -16px; color: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(220,38,38,0.25);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fa-solid fa-arrow-left" onclick="exitSchedaQuizView()" style="cursor: pointer; font-size: 18px;"></i>
                <h2 id="scheda-quiz-title" style="margin: 0; font-size: 16px; font-weight: 800;">Scheda Esame</h2>
            </div>
            <div id="scheda-quiz-timer" style="font-size: 14px; font-weight: 800; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 12px;">
                ⏱ 30:00
            </div>
        </div>

        <!-- Top Group Tabs: Questions da 1 a 10 | 11 a 20 | 21 a 30 -->
        <div style="display: flex; background: #e2e8f0; border-radius: 12px; padding: 3px; margin-bottom: 10px;">
            <button type="button" id="scheda-tab-group-1" onclick="setSchedaQuestionRange(1)" style="flex: 1; border: none; padding: 8px 4px; border-radius: 10px; font-weight: 700; font-size: 11px; color: #dc2626; background: #ffffff; cursor: pointer;">Questions da 1 a 10</button>
            <button type="button" id="scheda-tab-group-2" onclick="setSchedaQuestionRange(11)" style="flex: 1; border: none; padding: 8px 4px; border-radius: 10px; font-weight: 700; font-size: 11px; color: #64748b; background: transparent; cursor: pointer;">Questions da 11 a 20</button>
            <button type="button" id="scheda-tab-group-3" onclick="setSchedaQuestionRange(21)" style="flex: 1; border: none; padding: 8px 4px; border-radius: 10px; font-weight: 700; font-size: 11px; color: #64748b; background: transparent; cursor: pointer;">Questions da 21 a 30</button>
        </div>

        <!-- Question Number Pill Bar (1 to 10/11 to 20/21 to 30) -->
        <div id="scheda-question-pills-bar" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px;">
            <!-- Dynamic 1..30 Pill Buttons -->
        </div>

        <!-- Question Content Box (Matching Screenshot 4 Layout) -->
        <div style="background: #ffffff; border-radius: 18px; padding: 18px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.04); margin-bottom: 20px;">
            <!-- Question Image if present -->
            <div id="scheda-quiz-img-container" style="display: none; text-align: center; margin-bottom: 14px;">
                <img id="scheda-quiz-img" src="" alt="Sign" style="max-width: 100%; max-height: 180px; border-radius: 12px; object-fit: contain;">
            </div>

            <!-- Question Italian Text with Underlined Words -->
            <div id="scheda-quiz-question-text" style="font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.6; margin-bottom: 12px;">
                Loading question...
            </div>

            <!-- Question Bangla Translation -->
            <div id="scheda-quiz-question-bn" style="font-size: 14px; font-weight: 600; color: #2563eb; background: rgba(37,99,235,0.06); padding: 10px 12px; border-radius: 10px; margin-bottom: 20px;">
            </div>

            <!-- VERO / FALSO Options (Matching Screenshot 4) -->
            <div style="display: flex; gap: 14px;">
                <button type="button" id="scheda-btn-vero" onclick="selectSchedaAnswer(true)" style="flex: 1; padding: 14px; border-radius: 14px; border: 2px solid #22c55e; background: #f0fdf4; color: #15803d; font-size: 16px; font-weight: 800; cursor: pointer; text-align: center; transition: all 0.2s;">
                    VERO (সত্য)
                </button>
                <button type="button" id="scheda-btn-falso" onclick="selectSchedaAnswer(false)" style="flex: 1; padding: 14px; border-radius: 14px; border: 2px solid #ef4444; background: #fef2f2; color: #b91c1c; font-size: 16px; font-weight: 800; cursor: pointer; text-align: center; transition: all 0.2s;">
                    FALSO (মিথ্যা)
                </button>
            </div>
        </div>

        <!-- Navigation Buttons: Prev / Next / Submit -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" onclick="prevSchedaQuestion()" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer;">
                ← Indietro
            </button>
            <button type="button" onclick="submitSchedaQuiz()" style="background: #10b981; color: #ffffff; border: none; padding: 10px 22px; border-radius: 20px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                Conferma Esame
            </button>
            <button type="button" onclick="nextSchedaQuestion()" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer;">
                Avanti →
            </button>
        </div>
    </div>
</div>
