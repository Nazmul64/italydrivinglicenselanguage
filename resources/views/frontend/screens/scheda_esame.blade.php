<!-- SCREEN: Scheda Esame List -->
<div id="screen-scheda-esame" class="screen" style="display: none;">
    <!-- Green header bar -->
    <div style="background: linear-gradient(135deg, #4CAF50, #81C784); padding: 18px 16px; margin: -16px -16px 20px -16px; border-radius: 0 0 16px 16px; color: white;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <i class="fa-solid fa-arrow-left" onclick="openScreen('screen-home')" style="cursor: pointer; font-size: 18px;"></i>
            <h2 style="margin: 0; font-size: 18px; font-weight: 800;">Scheda Esame</h2>
        </div>
        
        <!-- Tab Switches: Nuove / Completato -->
        <div style="display: flex; gap: 20px; font-size: 14px; font-weight: 700; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 6px;">
            <div id="exam-tab-new" onclick="switchExamTab('new')" style="cursor: pointer; padding-bottom: 4px; border-bottom: 3px solid white; color: white;">Nuove</div>
            <div id="exam-tab-completed" onclick="switchExamTab('completed')" style="cursor: pointer; padding-bottom: 4px; color: rgba(255,255,255,0.7);">Completato</div>
        </div>
    </div>

    <!-- Search here box -->
    <div style="position: relative; margin-bottom: 20px;">
        <input type="text" id="exam-search-input" oninput="filterExamCards()" placeholder="Search here" style="width: 100%; padding: 14px 16px 14px 44px; border-radius: 28px; border: 1px solid var(--border-color); background-color: var(--bg-card); color: var(--text-primary); font-size: 14px; font-weight: 600; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 14px;"></i>
    </div>

    <!-- Cards container -->
    <div id="exam-cards-list" style="display: flex; flex-direction: column; gap: 16px; padding-bottom: 80px;">
        <!-- Exam cards will be loaded here dynamically -->
    </div>
</div>
