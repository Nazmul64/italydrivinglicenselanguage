<!-- SCREEN: Scheda Esame (Passed Sheets & 30-MCQ Exam Practice) -->
<div id="screen-scheda-esame" class="screen" style="padding: 0; position: relative;">

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

    <!-- 2. SCHEDA ESAME LIST VIEW (Passed Sheets List - Matching Screenshot 2) -->
    <div id="scheda-esame-list-view" style="display: block; padding: 16px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
        <!-- Top Green Header Bar Matching Mobile App Screenshot 2 -->
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 16px; margin: -16px -16px 16px -16px; color: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 14px rgba(16,185,129,0.25);">
            <div style="display: flex; align-items: center; gap: 14px;">
                <i class="fa-solid fa-arrow-left" onclick="openScreen('home')" style="cursor: pointer; font-size: 20px;"></i>
                <h2 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.2px;">Scheda Esame (Passed Sheets)</h2>
            </div>
            <button type="button" onclick="showSchedaInfoModal()" style="background: rgba(255,255,255,0.22); border: none; width: 34px; height: 34px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px;" title="Info">
                <i class="fa-solid fa-info"></i>
            </button>
        </div>

        <!-- Top Action Button Matching Mobile App Screenshot 2: "▶ Avvia Nuovo Esame (30 Quesiti)" -->
        <div style="margin-bottom: 16px;">
            <button type="button" onclick="startNewSchedaExamSimulation()" style="width: 100%; background: #10B981; color: #ffffff; border: none; padding: 15px 20px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(16,185,129,0.35); transition: transform 0.15s, background-color 0.15s;">
                <i class="fa-solid fa-circle-play" style="font-size: 20px;"></i> Avvia Nuovo Esame (30 Quesiti)
            </button>
        </div>

        <!-- Search Bar Matching Mobile App Screenshot 2 -->
        <div style="position: relative; margin-bottom: 18px;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 15px;"></i>
            <input type="text" id="scheda-esame-search-input" oninput="filterSchedaEsameCards()" placeholder="Cerca per nome candidato, centro o ID..." style="width: 100%; padding: 13px 18px 13px 44px; border-radius: 20px; border: 1.5px solid #e2e8f0; background-color: #f8fafc; color: #0f172a; font-size: 14px; font-weight: 600; outline: none; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        </div>

        <!-- Exam Cards List Container Matching Screenshot 2 -->
        <div id="scheda-esame-cards-container" style="display: flex; flex-direction: column; gap: 14px; padding-bottom: 90px;">
            <!-- Dynamic Exam Cards Loaded via JS -->
        </div>
    </div>

    <!-- 3. CANDIDATE PASSED EXAM SHEET OVERVIEW (Matching Screenshot 3) -->
    <div id="scheda-candidate-sheet-view" style="display: none; padding: 16px; min-height: 100vh;">
        <!-- Top Green Header Bar Matching Screenshot 3 -->
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 16px; margin: -16px -16px 16px -16px; color: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 14px rgba(16,185,129,0.25);">
            <div style="display: flex; align-items: center; gap: 14px;">
                <i class="fa-solid fa-arrow-left" onclick="backToSchedaEsameList()" style="cursor: pointer; font-size: 20px;"></i>
                <h2 id="scheda-candidate-name-header" style="margin: 0; font-size: 19px; font-weight: 800;">Nome Candidato</h2>
            </div>
        </div>

        <!-- Candidate Info & Score Card Matching Screenshot 3 -->
        <div style="background: #ffffff; border-radius: 18px; padding: 16px 20px; margin-bottom: 14px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
            <div id="scheda-candidate-center-date" style="font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 4px;">
                Motorizzazione Civile • 25/10/2026
            </div>
            <div id="scheda-candidate-score-text" style="font-size: 16px; font-weight: 800; color: #10B981;">
                Punteggio: 27/30 Corrette (IDONEO)
            </div>
        </div>

        <!-- Action Selection Buttons Matching Screenshot 3: Unselect All | Select | Select All -->
        <div style="display: flex; gap: 12px; margin-bottom: 18px;">
            <button type="button" onclick="unselectAllSchedaQuestions()" style="flex: 1; background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.15s;">
                Unselect All
            </button>
            <button type="button" onclick="toggleSelectSchedaQuestions()" style="flex: 1; background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.15s;">
                Select
            </button>
            <button type="button" onclick="selectAllSchedaQuestions()" style="flex: 1; background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.15s;">
                Select All
            </button>
        </div>

        <!-- List of Questions from this candidate's sheet -->
        <div id="scheda-candidate-questions-list" style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 110px;">
            <!-- Questions injected dynamically -->
        </div>

        <!-- Floating Green Action Button Matching Screenshot 3: "? QUIZ >" -->
        <div style="position: fixed; right: 20px; bottom: 85px; z-index: 1000;">
            <button type="button" onclick="startSchedaQuizFromSelection()" style="background: #10B981; color: #ffffff; border: none; padding: 14px 26px; border-radius: 30px; font-weight: 900; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 6px 20px rgba(16,185,129,0.5); transition: transform 0.15s, box-shadow 0.15s;">
                <i class="fa-solid fa-file-circle-question" style="font-size: 19px;"></i> QUIZ <i class="fa-solid fa-chevron-right" style="font-size: 14px;"></i>
            </button>
        </div>
    </div>

    <!-- 4. INTERACTIVE 30-MCQ QUIZ VIEW -->
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

        <!-- Question Content Box -->
        <div style="background: #ffffff; border-radius: 18px; padding: 18px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.04); margin-bottom: 20px;">
            <!-- Question Image if present -->
            <div id="scheda-quiz-img-container" style="display: none; text-align: center; margin-bottom: 14px;">
                <img id="scheda-quiz-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="Sign" style="max-width: 100%; max-height: 180px; border-radius: 12px; object-fit: contain;">
            </div>

            <!-- Question Italian Text with Underlined Words -->
            <div id="scheda-quiz-question-text" style="font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.6; margin-bottom: 12px;">
                Loading question...
            </div>

            <!-- Question Bangla Translation -->
            <div id="scheda-quiz-question-bn" style="font-size: 14px; font-weight: 600; color: #2563eb; background: rgba(37,99,235,0.06); padding: 10px 12px; border-radius: 10px; margin-bottom: 20px;">
            </div>

            <!-- VERO / FALSO Options -->
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
