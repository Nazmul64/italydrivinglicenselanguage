        <!-- 4. Interactive Video Dialog Modal -->
        <div class="video-modal" id="video-player-modal">
            <div class="video-close-btn" onclick="closeVideoPlayer()"><i class="fa-solid fa-xmark"></i></div>
            <div class="video-player-container">
                <i class="fa-solid fa-play video-control-play" onclick="simulateVideoPlaying()"></i>
            </div>
            <div style="color: white; text-align: center; padding: 20px;">
                <h4 id="video-player-title" style="font-size: 16px; font-weight: bold;">ভিডিও প্লেয়ার</h4>
                <p id="video-player-sub" style="font-size: 12px; opacity: 0.7; margin-top: 4px;">লোডিং হচ্ছে...</p>
            </div>
        </div>

        @if(isset($popupPromo) && $popupPromo->is_active && !empty($popupPromo->image_path))
        <!-- Custom Promo Popup Modal -->
        <div class="promo-overlay" id="promo-popup-modal" style="display: none;">
            <div class="promo-card">
                <!-- Promo Banner Image -->
                <div class="promo-image-box">
                    <img src="{{ $popupPromo->image_path }}" alt="Promotional Offer">
                </div>
                
                <!-- Action / Check this button -->
                @if($popupPromo->link_url)
                    <a href="{{ $popupPromo->link_url }}" target="_blank" class="promo-action-link">Check this</a>
                @else
                    <span class="promo-action-link" style="opacity: 0.5; cursor: not-allowed;">Check this</span>
                @endif
                
                <!-- Close Button -->
                <button type="button" class="promo-close-btn" onclick="closePromoPopup()">Chiudi</button>
            </div>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const promoModal = document.getElementById('promo-popup-modal');
                if (promoModal) {
                    // Check if popup was already shown in this session
                    if (!sessionStorage.getItem('promo_popup_shown')) {
                        // Show the modal
                        promoModal.style.display = 'flex';
                    }
                    
                    // Close popup when clicking outside the promo card
                    promoModal.addEventListener('click', function(e) {
                        if (e.target === promoModal) {
                            closePromoPopup();
                        }
                    });
                }
            });

            function closePromoPopup() {
                const promoModal = document.getElementById('promo-popup-modal');
                if (promoModal) {
                    promoModal.style.display = 'none';
                    sessionStorage.setItem('promo_popup_shown', 'true');
                }
            }
        </script>
        @endif

        <!-- 5. Exam Results Popup Modal -->
        <div class="modal-overlay" id="exam-result-modal">
            <!-- Outcome modal content showing emojis and counters details -->
            <div class="modal-content" style="padding: 24px; border-radius: 20px; text-align: center; max-width: 340px; width: 90%;">
                <div id="test-result-emoji" style="font-size: 52px; margin-bottom: 8px;">😊</div>
                <h3 class="result-title" style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">Risultato del Test</h3>
                
                <!-- Metrics pills matching Screenshot -->
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: rgba(76, 175, 80, 0.08); padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #4CAF50;">
                        <span>Giusto</span>
                        <span id="txt-giusto">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: rgba(239, 68, 68, 0.08); padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #ef4444;">
                        <span>Sbagliato</span>
                        <span id="txt-sbagliato">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: rgba(245, 158, 11, 0.08); padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #f59e0b;">
                        <span>Non date</span>
                        <span id="txt-nondate">0</span>
                    </div>
                </div>

                <!-- Custom Progress overlay bar inside result modal -->
                <div style="height: 10px; background-color: var(--border-card); border-radius: 6px; display: flex; overflow: hidden; margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <div id="bar-giusto" style="background-color: #4CAF50; width: 0%;"></div>
                    <div id="bar-sbagliato" style="background-color: #ef4444; width: 0%;"></div>
                    <div id="bar-nondate" style="background-color: #f59e0b; width: 0%;"></div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="action-btn" style="background-color: var(--accent-green); color: white; margin: 0; font-weight: 800;" onclick="openTestDetailsView()">
                        Mostra Risultato
                    </button>
                    <button class="action-btn" style="background-color: var(--bg-page); color: var(--text-secondary); margin: 0; font-weight: bold; border: 1px solid var(--border-card);" onclick="closeResultModal()">
                        Home
                    </button>
                </div>
            </div>
        </div>

        <!-- App Activation Lock Screen Overlay -->
        <div class="activation-lock-overlay" id="app-activation-lock" style="display: none;">
            <div class="lock-card" style="position: relative;">
                <button type="button" onclick="closeActivationLock()" style="position: absolute; top: 16px; right: 20px; background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-secondary);"><i class="fa-solid fa-xmark"></i></button>
                <div class="lock-icon-box">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="lock-title">অ্যাপ্লিকেশনটি সক্রিয় করুন</h2>
                <p class="lock-message">
                    আপনার অ্যাপ্লিকেশনটি বর্তমানে নিষ্ক্রিয় রয়েছে। দয়া করে এটি সক্রিয় করতে নিচের <strong>সাপোর্ট (Supporto)</strong> অপশনে গিয়ে আপনার নাম ও মোবাইল নাম্বার দিয়ে সাবমিট করুন।
                </p>
                <div class="lock-instruction">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>ভেরিফিকেশন সাবমিট করার পর অ্যাডমিন অ্যাকাউন্টটি সক্রিয় করে দেবেন।</span>
                </div>
                <button type="button" class="lock-support-btn" onclick="closeActivationLock(); toggleGuestChat(true)">
                    <i class="fa-solid fa-headset"></i> সাপোর্ট চ্যাট ওপেন করুন
                </button>
            </div>
        </div>

        <!-- Test Option Settings Modal Overlay -->
        <div class="activation-lock-overlay" id="test-options-modal" style="display: none; z-index: 9999;">
            <div class="lock-card" style="padding: 24px; max-width: 320px; border-radius: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background-color: var(--bg-card); display: flex; flex-direction: column; gap: 16px; align-items: center; border: 1.5px solid var(--border-card);">
                <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                    Vuoi la correzione istantanea durante il test?
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                    Do you want immediate correct awnser during test?
                </div>
                
                <!-- Toggle switch for Disable translation -->
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 16px; background-color: var(--bg-page); border-radius: 12px; margin-top: 6px; border: 1px solid var(--border-card);">
                    <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Disabilita Traduzioni ?</span>
                    
                    <!-- Toggle Switch element -->
                    <label class="switch-container" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                        <input type="checkbox" id="test-disable-translation-toggle" style="opacity: 0; width: 0; height: 0;">
                        <span class="slider-toggle" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
                    </label>
                </div>
                
                <!-- No / Si buttons -->
                <div style="display: flex; width: 100%; gap: 12px; margin-top: 10px;">
                    <button type="button" onclick="confirmTestOptions(false)" style="flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); font-weight: bold; color: var(--text-primary); cursor: pointer; font-size: 14px;">
                        No
                    </button>
                    <button type="button" onclick="confirmTestOptions(true)" style="flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid var(--border-card); background-color: var(--bg-card); font-weight: bold; color: var(--text-primary); cursor: pointer; font-size: 14px;">
                        Si
                    </button>
                </div>
            </div>
        </div>

        <!-- Question Translation Details Modal Overlay -->
        <div class="activation-lock-overlay" id="q-translation-modal" style="display: none; z-index: 99999;">
            <div class="lock-card" style="padding: 24px; max-width: 320px; border-radius: 24px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background-color: var(--bg-card); display: flex; flex-direction: column; gap: 16px; align-items: stretch; border: 1px solid var(--border-card);">
                <div id="q-translation-it" style="font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-top: 4px;">
                    La carreggiata non comprende le piste ciclabili
                </div>
                <div id="q-translation-bn" style="font-size: 14px; color: var(--text-secondary); line-height: 1.4; border-top: 1px solid var(--border-card); padding-top: 12px; font-weight: 600;">
                    ক্যারেজ্জাতায় বাইসাইকেল চলাচলের লেন যুক্ত থাকেনা
                </div>
                
                <!-- Bottom controls row -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <!-- Speaker icon button -->
                    <button type="button" onclick="readTranslationModalText()" style="width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid var(--border-card); background-color: var(--bg-card); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); outline: none;">
                        <i class="fa-solid fa-volume-high" style="font-size: 18px;"></i>
                    </button>
                    
                    <!-- OK button -->
                    <button type="button" onclick="closeTranslationModal()" style="padding: 8px 24px; border-radius: 20px; border: 1.5px solid #2563eb; background-color: white; color: #2563eb; font-weight: bold; font-size: 14px; cursor: pointer; outline: none; transition: all 0.2s;">
                        OK
                    </button>
                </div>
            </div>
        </div>

        <!-- 6. Floating Navigation Bar Centered -->
        <nav class="bottom-nav">
            <div class="nav-item active" id="nav-home" onclick="clickBottomNav('home')">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </div>
            <div class="nav-item" id="nav-quiz" onclick="clickBottomNav('scheda-esame')">
                <i class="fa-solid fa-paste"></i>
                <span>Quiz</span>
            </div>
            <div class="nav-item" id="nav-scanner" onclick="openQrScanner()">
                <i class="fa-solid fa-qrcode"></i>
                <span>Scanner</span>
            </div>
            <div class="nav-item" id="nav-dictionary" onclick="clickBottomNav('dizionario')">
                <i class="fa-solid fa-book"></i>
                <span>Dizionario</span>
            </div>
            <div class="nav-item" id="nav-profile" onclick="clickBottomNav('profilo')">
                <i class="fa-solid fa-user-gear"></i>
                <span>Profilo</span>
            </div>
        </nav>

        <!-- Notes Popup Modal -->
        <div class="modal-overlay" id="notes-modal" style="display: none; align-items: center; justify-content: center; z-index: 1000;">
            <div class="modal-content" style="padding: 24px; border-radius: 20px; width: 90%; max-width: 340px; background-color: var(--bg-card); position: relative;">
                <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); text-align: center; margin-bottom: 12px;">Inserisci note</h3>
                
                <input type="hidden" id="notes-form-page-id">
                <input type="hidden" id="notes-form-question-id">
                <input type="hidden" id="notes-form-note-id">

                <textarea id="notes-textarea" rows="5" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border-card); background-color: var(--bg-page); color: var(--text-primary); font-size: 13px; font-weight: 600; resize: none; outline: none; margin-bottom: 10px;" placeholder="Scrivi qui la tua nota..."></textarea>
                
                <div style="font-size: 11px; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">
                    Le tue note non verranno condivise con nessuno
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="action-btn" style="background-color: var(--accent-green); color: white; margin: 0; font-weight: 800; padding: 10px;" onclick="saveUserNote()">
                        Salva
                    </button>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" id="notes-delete-btn" style="flex: 1; background-color: var(--accent-red); color: white; margin: 0; font-weight: bold; font-size: 12px; padding: 8px; display: none;" onclick="deleteUserNote()">
                            Elimina
                        </button>
                        <button class="action-btn" style="flex: 1; background-color: var(--bg-page); color: var(--text-secondary); margin: 0; font-weight: bold; border: 1px solid var(--border-card); font-size: 12px; padding: 8px;" onclick="closeNotesModal()">
                            Chiudi
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dictionary Term Popover Modal matching screenshot exactly -->
        <div class="modal-overlay" id="dict-term-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 10000; padding: 16px;">
            <div class="modal-card" style="width: 100%; max-width: 360px; background: var(--bg-card, #ffffff); border-radius: 20px; overflow: hidden; padding: 24px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 16px; position: relative;">
                
                <!-- Close Button -->
                <i class="fa-solid fa-xmark" onclick="closeDictTermModal()" style="position: absolute; right: 18px; top: 18px; font-size: 18px; cursor: pointer; color: var(--text-secondary, #64748b); z-index: 10;"></i>
                
                <!-- Title (Italian Term) -->
                <h3 id="dict-modal-title" style="margin: 0; font-size: 22px; font-weight: 500; color: var(--text-primary, #1e293b); text-transform: uppercase; letter-spacing: 0.5px;">STRADA</h3>
                
                <!-- Illustration Image -->
                <div id="dict-modal-image-container" style="width: 100%; height: 170px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.02);">
                    <img id="dict-modal-image" src="" style="width: 100%; height: 100%; object-fit: contain;" alt="Diagram">
                </div>

                <!-- Illustration Video -->
                <div id="dict-modal-video-container" style="display: none; width: 100%; height: 170px; border-radius: 8px; overflow: hidden; background-color: #000; align-items: center; justify-content: center;">
                    <video id="dict-modal-video" src="" style="width: 100%; height: 100%; object-fit: contain;" controls></video>
                </div>

                <!-- Explanation Text (Paragraph format, no table) -->
                <div style="max-height: 180px; overflow-y: auto; color: var(--text-primary, #334155); font-size: 15px; line-height: 1.6;">
                    <div id="dict-modal-text-it" style="font-weight: 400; margin-bottom: 6px;"></div>
                    <div id="dict-modal-text-bn" style="font-weight: 400; color: var(--text-secondary, #475569);"></div>
                </div>

                <!-- Bottom Control Icons Row -->
                <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-top: 10px; padding-top: 10px;">
                    <!-- Circular Bangladesh Flag Badge with "Bangla" label below -->
                    <div id="dict-modal-toggle-lang" onclick="toggleDictModalLang()" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; user-select: none;">
                        <div id="dict-modal-lang-circle" style="width: 32px; height: 32px; border-radius: 50%; background-color: #006a4e; display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <span style="width: 16px; height: 16px; border-radius: 50%; background-color: #f42a41; display: block;"></span>
                        </div>
                        <span id="dict-modal-lang-text" style="font-size: 11px; font-weight: 600; color: var(--text-secondary, #64748b);">Bangla</span>
                    </div>
                    
                    <!-- Action Icons (Green Ribbon Bookmark, Search, Speaker) -->
                    <div style="display: flex; gap: 24px; align-items: center; padding-bottom: 6px;">
                        <i class="fa-solid fa-bookmark" id="dict-modal-save-btn" onclick="saveDictWord()" style="font-size: 22px; cursor: pointer; color: #4CAF50;" title="Save word"></i>
                        <i class="fa-solid fa-magnifying-glass" onclick="searchDictWord()" style="font-size: 22px; cursor: pointer; color: var(--text-primary, #1e293b);" title="Search in dictionary"></i>
                        <i class="fa-solid fa-volume-high" onclick="speakDictWord()" style="font-size: 24px; cursor: pointer; color: var(--text-primary, #1e293b);" title="Speak word"></i>
                    </div>
                </div>

                <!-- Rounded Pill OK Button -->
                <button onclick="closeDictTermModal()" style="width: 100%; border-radius: 12px; padding: 10px; font-weight: 700; font-size: 16px; background-color: var(--bg-page, #f1f5f9); color: var(--text-primary, #1e293b); border: 1px solid var(--border-card, #cbd5e1); margin-top: 4px; text-align: center; cursor: pointer; transition: background 0.2s;">OK</button>
            </div>
        </div>

        <!-- Page / Question Vocabulary Term Modal -->
        <div class="modal-overlay" id="vocab-term-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; padding: 16px;">
            <!-- TV Outer Shell -->
            <div style="width: 100%; max-width: 460px; display: flex; flex-direction: column; align-items: center; position: relative;">

                <!-- TV Screen Frame -->
                <div style="
                    width: 100%;
                    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
                    border-radius: 28px 28px 12px 12px;
                    padding: 6px;
                    box-shadow:
                        0 0 0 4px #2a2a4a,
                        0 0 0 8px #1a1a2e,
                        0 0 0 12px #0f0f1e,
                        0 20px 60px rgba(0,0,0,0.8),
                        inset 0 2px 4px rgba(255,255,255,0.1);
                    border: 3px solid #2d2d5e;
                ">
                    <!-- TV Bezel Inner Glow -->
                    <div style="
                        background: var(--bg-card);
                        border-radius: 22px 22px 8px 8px;
                        overflow: hidden;
                        border: 2px solid rgba(99, 102, 241, 0.4);
                        box-shadow: inset 0 0 20px rgba(99,102,241,0.08);
                    ">
                        <!-- TV Status Bar (top of screen) -->
                        <div style="
                            background: linear-gradient(90deg, #0f3460, #1a1a2e);
                            padding: 10px 18px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            border-bottom: 1px solid rgba(99,102,241,0.3);
                        ">
                            <!-- TV signal dots -->
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 6px #ef4444;"></div>
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 6px #f59e0b;"></div>
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></div>
                            <span style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); margin-left: 4px; letter-spacing: 1px;">VOCAB TV</span>
                            <!-- Close Button -->
                            <i class="fa-solid fa-xmark" onclick="closeVocabTermModal()" style="position: absolute; right: 22px; font-size: 18px; cursor: pointer; color: rgba(255,255,255,0.6); z-index: 10; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='rgba(255,255,255,0.6)'"></i>
                        </div>

                        <!-- Title Bar -->
                        <div style="
                            padding: 14px 18px 10px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            background: linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%);
                            border-bottom: 2px solid rgba(99,102,241,0.25);
                        ">
                            <div style="
                                width: 36px; height: 36px;
                                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                border-radius: 10px;
                                display: flex; align-items: center; justify-content: center;
                                box-shadow: 0 4px 12px rgba(99,102,241,0.4);
                            ">
                                <i class="fa-solid fa-book-open" style="color: white; font-size: 16px;"></i>
                            </div>
                            <div>
                                <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Vocabulary</div>
                                <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">শব্দের অর্থ</div>
                            </div>
                        </div>

                        <!-- Vocabulary Table -->
                        <div style="padding: 14px 14px 10px; max-height: 320px; overflow-y: auto;">
                            <table style="
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 13px;
                                border: 2px solid #6366f1;
                                border-radius: 12px;
                                overflow: hidden;
                            ">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                                        <th style="
                                            padding: 11px 14px;
                                            font-weight: 700;
                                            color: white;
                                            width: 38%;
                                            text-align: left;
                                            border-right: 2px solid rgba(255,255,255,0.3);
                                            font-size: 12px;
                                            letter-spacing: 0.5px;
                                        ">🇮🇹 Italian Word</th>
                                        <th style="
                                            padding: 11px 14px;
                                            font-weight: 700;
                                            color: white;
                                            width: 40%;
                                            text-align: left;
                                            border-right: 2px solid rgba(255,255,255,0.3);
                                            font-size: 12px;
                                            letter-spacing: 0.5px;
                                        ">🇧🇩 Bangla Meaning</th>
                                        <th style="
                                            padding: 11px 14px;
                                            font-weight: 700;
                                            color: white;
                                            width: 22%;
                                            text-align: center;
                                            font-size: 12px;
                                            letter-spacing: 0.5px;
                                        ">🔊 শুনুন</th>
                                    </tr>
                                </thead>
                                <tbody id="vocab-modal-tbody">
                                    <!-- Injected dynamically -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Close Button -->
                        <div style="padding: 10px 14px 14px;">
                            <button onclick="closeVocabTermModal()" style="
                                width: 100%;
                                padding: 12px;
                                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                color: white;
                                border: none;
                                border-radius: 12px;
                                font-weight: 800;
                                font-size: 14px;
                                cursor: pointer;
                                letter-spacing: 0.5px;
                                box-shadow: 0 4px 14px rgba(99,102,241,0.4);
                                transition: opacity 0.2s;
                            " onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                                ✕ Chiudi (বন্ধ করুন)
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TV Stand Neck -->
                <div style="
                    width: 60px;
                    height: 20px;
                    background: linear-gradient(180deg, #1a1a2e, #0f0f1e);
                    border-left: 3px solid #2a2a4a;
                    border-right: 3px solid #2a2a4a;
                    margin-top: 0;
                "></div>

                <!-- TV Stand Base -->
                <div style="
                    width: 160px;
                    height: 14px;
                    background: linear-gradient(180deg, #1a1a2e, #0f0f1e);
                    border-radius: 0 0 20px 20px;
                    border: 3px solid #2a2a4a;
                    border-top: none;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
                "></div>
            </div>
        </div>


        <!-- Image Zoom Modal -->
        <div class="modal-overlay" id="vocab-image-zoom-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 11000; padding: 16px;" onclick="closeVocabImageZoom()">
            <div style="position: relative; max-width: 90%; max-height: 90%; display: flex; justify-content: center; align-items: center;">
                <i class="fa-solid fa-xmark" style="position: absolute; right: -15px; top: -35px; font-size: 24px; cursor: pointer; color: white;"></i>
                <img id="vocab-zoom-img" src="" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            </div>
        </div>

        <!-- Toast Notification Panel -->
        <div class="toast-container" id="toast-container">
            <i class="fa-solid fa-circle-info"></i>
            <span id="toast-text">বার্তা</span>
        </div>

        <!-- Translation Popup Modal matching screenshot -->
        <div class="modal-overlay" id="translation-popup-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; padding: 16px;">
            <div class="modal-card" style="width: 100%; max-width: 440px; background: #ffffff; border-radius: 24px; padding: 24px 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 16px; position: relative;">
                
                <!-- Close Button -->
                <i class="fa-solid fa-xmark" onclick="closeTranslationPopupModal()" style="position: absolute; right: 18px; top: 18px; font-size: 18px; cursor: pointer; color: #64748b; z-index: 10;"></i>

                <!-- Italian Text Box -->
                <div id="trans-modal-italian" style="font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.6; max-height: 180px; overflow-y: auto; padding-right: 4px;">
                </div>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 0;">

                <!-- Bangla Translation Box -->
                <div id="trans-modal-bangla" style="font-size: 13px; font-weight: 600; color: #475569; line-height: 1.6; max-height: 180px; overflow-y: auto; padding-right: 4px;">
                </div>

                <!-- Bottom Action Row matching screenshot -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <!-- Speaker Button -->
                    <button onclick="speakTranslationModalText()" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);" title="Listen">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>

                    <!-- OK Button -->
                    <button onclick="closeTranslationPopupModal()" style="padding: 8px 28px; border-radius: 20px; font-weight: 800; font-size: 14px; background: #ffffff; color: #3b82f6; border: 1.5px solid #3b82f6; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#3b82f6';">
                        OK
                    </button>
                </div>
            </div>
        </div>

        <!-- App QR Scanner Modal Overlay -->
        <div id="qr-scanner-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 11000; align-items: center; justify-content: center; color: white;">
            <div style="position: relative; width: 90%; max-width: 400px; background: #121212; border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 16px; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <!-- Top Close Bar -->
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 12px;">
                    <span style="font-weight: 800; font-size: 16px; color: #fff;">Scanner QR Code</span>
                    <button onclick="closeQrScanner()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <!-- Viewfinder Camera Scanner Container -->
                <div id="qr-reader" style="width: 100%; min-height: 250px; background: #000; border-radius: 16px; overflow: hidden; border: 2px solid #22c55e;"></div>
                
                <div style="font-size: 12px; color: #aaa; text-align: center; font-weight: 600;">
                    বইয়ের QR কোডটি ক্যামেরার সামনে ধরুন। স্ক্যান সফল হলে অটোমেটিক কুইজ ওপেন হবে।
                </div>
            </div>
        </div>

    </div>

    <!-- External JavaScript Separated Asset -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    <script src="{{ asset('js/frontend/app.js') }}?v={{ time() }}"></script>
</body>
</html>
