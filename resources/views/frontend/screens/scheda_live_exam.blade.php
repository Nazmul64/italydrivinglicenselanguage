<!-- SCREEN: Scheda Live Exam (Official Motorizzazione PDF Sheets Uploaded by Admin) -->
<div id="screen-scheda-live-exam" class="screen" style="padding: 0; position: relative;">


    <!-- 2. MAIN SCHEDA LIVE EXAM VIEW -->
    <div style="padding: 16px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
        <!-- Top Green Header Bar -->
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 16px; margin: -16px -16px 16px -16px; color: white; box-shadow: 0 4px 14px rgba(16,185,129,0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <i class="fa-solid fa-arrow-left" onclick="openScreen('home')" style="cursor: pointer; font-size: 20px;"></i>
                    <div>
                        <h2 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.2px;">Scheda Live Exam</h2>
                        <div style="font-size: 11px; opacity: 0.92; font-weight: 600;">অফিসিয়াল মোটরইজ্জাসিওনে লাইভ পরীক্ষার রেজাল্ট ও PDF শিট</div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 14px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-file-pdf" style="color: #fee2e2;"></i> PDF Sheet
                </div>
            </div>

            <!-- Tabs: Nuove | Completato -->
            <div style="display: flex; gap: 24px; padding: 0 8px;">
                <div id="tab-live-completato" onclick="switchLiveExamTab('completato')" style="padding: 8px 4px; font-weight: 800; font-size: 14px; color: #ffffff; cursor: pointer; border-bottom: 3px solid #6366F1; transition: all 0.2s;">
                    <i class="fa-solid fa-circle-check" style="font-size: 12px; margin-right: 4px;"></i> Esami Superati (পাস শিট)
                </div>
                <div id="tab-live-nuove" onclick="switchLiveExamTab('nuove')" style="padding: 8px 4px; font-weight: 800; font-size: 14px; color: rgba(255,255,255,0.75); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s;">
                    <i class="fa-solid fa-clock" style="font-size: 12px; margin-right: 4px;"></i> Nuove (নতুন শিডিউল)
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div style="position: relative; margin-bottom: 18px;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 15px;"></i>
            <input type="text" id="scheda-live-search-input" oninput="filterLiveExamCards()" placeholder="Cerca per nome candidato, centro o ID..." style="width: 100%; padding: 13px 18px 13px 44px; border-radius: 20px; border: 1.5px solid #e2e8f0; background-color: #f8fafc; color: #0f172a; font-size: 14px; font-weight: 600; outline: none; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        </div>

        <!-- Cards Container -->
        <div id="scheda-live-cards-container" style="display: flex; flex-direction: column; gap: 14px; padding-bottom: 90px;">
            <!-- Live Passed Exam Cards Injected Dynamically -->
        </div>
    </div>
</div>
