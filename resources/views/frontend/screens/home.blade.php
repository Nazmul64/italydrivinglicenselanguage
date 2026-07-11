<!-- SCREEN: Home (Dashboard) -->
<div id="screen-home" class="screen active">
    <!-- Image Slider -->
    <div class="slider-container">
        <div class="slider-wrapper" id="slider-wrapper">
            @foreach($sliders as $slider)
                <div class="slide">
                    <img src="{{ $slider->image_url }}" alt="{{ $slider->title }}">
                    <div class="slide-overlay">
                        <span class="slide-title">{{ $slider->title }}</span>
                        @if($slider->subtitle)
                            <span class="slide-subtitle">{{ $slider->subtitle }}</span>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
        <div class="slider-indicators">
            @foreach($sliders as $index => $slider)
                <span class="indicator {{ $index === 0 ? 'active' : '' }}" onclick="goToSlide({{ $index }})"></span>
            @endforeach
        </div>
    </div>

    <!-- Grid of Services: Dynamic Cards -->
    <section class="services-grid">
        @foreach($homeCards as $card)
            <div class="nav-card" onclick="openScreen('{{ $card->screen_key }}', '{{ $card->title }}')">
                <div class="illustration-box" style="background-color: {{ $card->icon_color }}1a; color: {{ $card->icon_color }};">
                    <i class="{{ $card->icon_class }}"></i>
                </div>
                <h3 class="card-title">{{ $card->title }}</h3>
                @if($card->subtitle)
                    <p class="card-subtitle">{{ $card->subtitle }}</p>
                @endif
            </div>
        @endforeach

        <!-- Support Card -->
        <div class="nav-card support-nav-card" onclick="toggleGuestChat(true)">
            <div class="illustration-box" style="background-color: rgba(16, 185, 129, 0.1); color: #10b981;">
                <i class="fa-solid fa-headset"></i>
            </div>
            <h3 class="card-title">SUPPORT</h3>
            <p class="card-subtitle">Live Chat</p>
        </div>
    </section>
</div>
