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

        <!-- Dictionary Term Popover Modal -->
        <div class="modal-overlay" id="dict-term-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; padding: 16px;">
            <div class="modal-card" style="width: 100%; max-width: 380px; background: var(--bg-card); border-radius: 24px; overflow: hidden; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; position: relative;">
                
                <!-- Close Button -->
                <i class="fa-solid fa-xmark" onclick="closeDictTermModal()" style="position: absolute; right: 20px; top: 20px; font-size: 20px; cursor: pointer; color: var(--text-secondary); z-index: 10;"></i>
                
                <!-- Title (Italian Term) -->
                <h3 id="dict-modal-title" style="margin: 0; font-size: 20px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; padding-right: 30px;">Term</h3>
                
                <!-- Illustration Image -->
                <div id="dict-modal-image-container" style="width: 100%; height: 160px; border-radius: 16px; overflow: hidden; background-color: #f7fafc; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                    <img id="dict-modal-image" src="" style="width: 100%; height: 100%; object-fit: cover;" alt="Diagram">
                </div>

                <!-- Explanation Text -->
                <div style="max-height: 180px; overflow-y: auto; padding-right: 4px;">
                    <!-- Bilingual Text -->
                    <div id="dict-modal-text-it" style="font-size: 13px; color: var(--text-secondary); font-weight: 600; line-height: 1.5; margin-bottom: 8px;"></div>
                    <div id="dict-modal-text-bn" style="font-size: 13px; color: var(--text-primary); font-weight: 700; line-height: 1.5;"></div>
                </div>

                <!-- Bottom action row -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; border-top: 1px solid var(--border-color); padding-top: 14px;">
                    <!-- Bangla toggle badge -->
                    <div id="dict-modal-toggle-lang" onclick="toggleDictModalLang()" style="cursor: pointer; display: flex; align-items: center; gap: 6px; background-color: var(--bg-page); padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 11px; font-weight: 800; color: var(--text-secondary); user-select: none;">
                        <span id="dict-modal-lang-circle" style="width: 8px; height: 8px; border-radius: 50%; background-color: #4CAF50; display: inline-block; transition: background-color 0.2s;"></span>
                        <span id="dict-modal-lang-text">Bangla</span>
                    </div>
                    
                    <!-- Icons -->
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <i class="fa-regular fa-bookmark" id="dict-modal-save-btn" onclick="saveDictWord()" style="font-size: 18px; cursor: pointer; color: var(--text-secondary); padding: 4px;" title="Save word"></i>
                        <i class="fa-solid fa-magnifying-glass" onclick="searchDictWord()" style="font-size: 18px; cursor: pointer; color: var(--text-secondary); padding: 4px;" title="Search in dictionary"></i>
                        <i class="fa-solid fa-volume-high" onclick="speakDictWord()" style="font-size: 18px; cursor: pointer; color: var(--text-secondary); padding: 4px;" title="Speak word"></i>
                    </div>
                </div>

                <!-- Confirm OK Button -->
                <button class="action-btn" onclick="closeDictTermModal()" style="width: 100%; border-radius: 14px; padding: 12px; font-weight: 800; font-size: 13px; background-color: var(--bg-page); color: var(--text-primary); border: 1px solid var(--border-color); margin: 0; text-align: center; cursor: pointer;">OK</button>
            </div>
        </div>

        <!-- Toast Notification Panel -->
        <div class="toast-container" id="toast-container">
            <i class="fa-solid fa-circle-info"></i>
            <span id="toast-text">বার্তা</span>
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
    <script src="{{ asset('js/frontend/app.js') }}?v={{ time() }}"></script>
</body>
</html>
