<!-- App Header -->
<header class="app-header">
    <div class="header-content-wrapper">
        <!-- Back Button (shown on sub-screens) -->
        <button class="back-btn" id="back-button" onclick="navigateBack()">
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <!-- Centered App Name -->
        <!-- Centered App Name or Logo Image -->
        <div class="app-title" id="app-header-title">
            @if($gSettings->app_logo)
                <img src="{{ asset($gSettings->app_logo) }}" alt="{{ $gSettings->app_name }}" style="max-height: 36px; object-fit: contain;">
            @else
                {{ $gSettings->app_name }}
            @endif
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
            <!-- Live Support Chat Button with Unread Badge -->
            <div class="chat-header-btn-wrapper" id="chat-header-btn" onclick="toggleGuestChat(true)" title="Live Chat Support" style="position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: #4CAF50; color: #ffffff; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35); transition: transform 0.2s ease;">
                <i class="fa-solid fa-headset" style="font-size: 18px;"></i>
                <div class="chat-notification-badge" id="chat-header-unread-badge" style="display: none; position: absolute; top: -4px; right: -4px; background-color: #ef4444; color: #ffffff; font-size: 10px; font-weight: 900; min-width: 18px; height: 18px; border-radius: 50%; padding: 0 4px; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5); z-index: 10;">0</div>
            </div>

            <!-- Theme Switcher -->
            <button class="theme-toggle-btn" id="theme-toggle" title="Toggle Theme">
                <i class="fa-solid fa-moon"></i>
            </button>

            <!-- Right profile with notification -->
            <div class="profile-wrapper" onclick="openScreen('profilo', 'প্রোফাইল')">
                <div class="profile-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="notification-badge">1</div>
            </div>
        </div>
    </div>
</header>
