@include('frontend.layouts.header')

    <div class="app-container">
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
            @include('frontend.screens.page_details')
            @include('frontend.screens.saved_mcqs')
            @include('frontend.screens.correct_mcqs')
            @include('frontend.screens.wrong_mcqs')
        </div>
        
        <!-- Floating Live Chat support overlay -->
        @include('frontend.screens.chat')
        
        <!-- Shared Modals, Modals Overlays, Bottom Nav, and scripts loader -->
        @include('frontend.layouts.footer')
