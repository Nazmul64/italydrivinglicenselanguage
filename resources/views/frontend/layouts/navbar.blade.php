<!-- App Header -->
<header class="app-header">
    <div class="header-content-wrapper">
        <!-- Back Button (shown on sub-screens) -->
        <button class="back-btn" id="back-button" onclick="navigateBack()">
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <!-- Centered App Name -->
        <div class="app-title" id="app-header-title">mbanglapatenteb</div>

        <div style="display: flex; gap: 12px; align-items: center;">
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
