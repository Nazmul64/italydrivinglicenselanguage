@include('frontend.layouts.header')

    <div class="app-container pwa-mobile-mode">
        <!-- PWA Install Banner -->
        <div id="pwa-install-banner" style="display: none; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 16px; border-radius: 14px; margin: 12px 16px 0 16px; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(59,130,246,0.3); z-index: 9999;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fa-solid fa-mobile-screen-button" style="font-size: 22px;"></i>
                <div>
                    <strong style="font-size: 14px; display: block;">ইতালি বাংলা ড্রাইভিং লাইসেন্স অ্যাপ</strong>
                    <span style="font-size: 11px; opacity: 0.9;">আপনার ফোনে অ্যাপটি ইনস্টল করুন</span>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="pwa-install-btn" style="background: white; color: #1d4ed8; border: none; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer;">Install</button>
                <button onclick="document.getElementById('pwa-install-banner').style.display='none'" style="background: rgba(255,255,255,0.2); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>

        <!-- Background Pattern -->
        <div class="bg-pattern"></div>

        <!-- Top App Header -->
        @include('frontend.layouts.navbar')

        <!-- Scrollable App Body containing Screens -->
        <div class="app-body">
            @include('frontend.screens.home')
            @include('frontend.screens.lezioni')
            @include('frontend.screens.test')
            @include('frontend.screens.test_results')
            @include('frontend.screens.argomenti')
            @include('frontend.screens.argomenti_schede')
            @include('frontend.screens.eclass')
            @include('frontend.screens.sfida')
            @include('frontend.screens.scheda_esame')
            @include('frontend.screens.exam_simulation')
            @include('frontend.screens.dizionario')
            @include('frontend.screens.cartelli')
            @include('frontend.screens.profilo')
            @include('frontend.screens.manuale')
            @include('frontend.screens.social')
            @include('frontend.screens.translation')
            @include('frontend.screens.page_details')
            @include('frontend.screens.saved_mcqs')
            @include('frontend.screens.noted_mcqs')
            @include('frontend.screens.correct_mcqs')
            @include('frontend.screens.wrong_mcqs')
        </div>
        
        <!-- Floating Live Chat support overlay -->
        @include('frontend.screens.chat')
        
        <!-- Shared Modals, Modals Overlays, Bottom Nav, and scripts loader -->
        @include('frontend.layouts.footer')

    <script>
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'flex';
        });

        document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the PWA install prompt');
                }
                deferredPrompt = null;
                document.getElementById('pwa-install-banner').style.display = 'none';
            }
        });
    </script>
