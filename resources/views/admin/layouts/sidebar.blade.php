<!-- 1. Sidebar -->
<div class="sidebar">
    <div class="sidebar-brand">
        <span class="brand-logo">
            @if($gSettings->app_logo)
                <img src="{{ asset($gSettings->app_logo) }}" alt="{{ $gSettings->app_name }}" style="max-height: 24px; object-fit: contain; margin-right: 8px;">
            @else
                <i class="fa-solid fa-graduation-cap"></i> 
            @endif
            {{ $gSettings->app_name }}
        </span>
        <i class="fa-solid fa-bars-staggered action-icon" style="color: white; font-size: 16px;"></i>
    </div>

    <div class="sidebar-menu">
        <div class="menu-header">General</div>
        
        <div class="menu-item active" onclick="switchPanel('dashboard')" id="menu-dashboard">
            <span class="menu-link-group">
                <i class="fa-solid fa-house"></i>
                <span>Dashboard</span>
            </span>
        </div>

        <div class="menu-header">Applications</div>

        <!-- MCQ CRUD Active Manager Menu Tab -->
        <div class="menu-item" onclick="switchPanel('mcq-questions')" id="menu-questions">
            <span class="menu-link-group">
                <i class="fa-solid fa-database" style="color: #fbbf24;"></i>
                <span style="font-weight: bold;">Manage MCQs (এমসিকিউ)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('mcq-chapters')" id="menu-chapters">
            <span class="menu-link-group">
                <i class="fa-solid fa-book-open"></i>
                <span>Manage Chapters</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('mcq-exams')" id="menu-exams">
            <span class="menu-link-group">
                <i class="fa-solid fa-file-invoice"></i>
                <span>Scheda Esame Scheduler</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('file-manager')" id="menu-file-manager">
            <span class="menu-link-group">
                <i class="fa-solid fa-folder-open"></i>
                <span>File Manager</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('chat-room')" id="menu-chat-room">
            <span class="menu-link-group">
                <i class="fa-solid fa-comments"></i>
                <span>Chat Room</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('categories')" id="menu-categories">
            <span class="menu-link-group">
                <i class="fa-solid fa-list"></i>
                <span>Categories</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('dizionario')" id="menu-dizionario">
            <span class="menu-link-group">
                <i class="fa-solid fa-spell-check"></i>
                <span>Manage Dictionary</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sliders')" id="menu-sliders">
            <span class="menu-link-group">
                <i class="fa-solid fa-images"></i>
                <span>Manage Sliders</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('popup-promo')" id="menu-popup-promo">
            <span class="menu-link-group">
                <i class="fa-solid fa-rectangle-ad"></i>
                <span>Popup Promo Settings</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('home-cards')" id="menu-home-cards">
            <span class="menu-link-group">
                <i class="fa-solid fa-shapes"></i>
                <span>Home Cards (Icons)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('classes')" id="menu-classes">
            <span class="menu-link-group">
                <i class="fa-solid fa-video"></i>
                <span>Manage Lecture Videos</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('live-classes')" id="menu-live-classes">
            <span class="menu-link-group">
                <i class="fa-solid fa-tower-broadcast"></i>
                <span>Manage Live Sessions</span>
            </span>
        </div>

        <div class="menu-header">Cartelli MCQ Module</div>

        <div class="menu-item" onclick="switchPanel('cartelli-mcqs')" id="menu-cartelli-mcqs">
            <span class="menu-link-group">
                <i class="fa-solid fa-database" style="color: #fbbf24;"></i>
                <span>Manage Cartelli MCQs (এমসিকিউ)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('cartelli-chapters')" id="menu-cartelli-chapters">
            <span class="menu-link-group">
                <i class="fa-solid fa-book-open" style="color: #60a5fa;"></i>
                <span>Manage Cartelli Chapters</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('cartelli-categories')" id="menu-cartelli-categories">
            <span class="menu-link-group">
                <i class="fa-solid fa-layer-group" style="color: #34d399;"></i>
                <span>অধ্যায় (Category)</span>
            </span>
        </div>

        <div class="menu-header">System</div>

        <div class="menu-item" onclick="switchPanel('general-settings')" id="menu-general-settings">
            <span class="menu-link-group">
                <i class="fa-solid fa-gears" style="color: #60a5fa;"></i>
                <span>General Settings</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-errors')" id="menu-sys-errors">
            <span class="menu-link-group">
                <i class="fa-solid fa-bug"></i>
                <span>Error Logs</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-health')" id="menu-sys-health">
            <span class="menu-link-group">
                <i class="fa-solid fa-heart-pulse"></i>
                <span>System Health</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-api')" id="menu-sys-api">
            <span class="menu-link-group">
                <i class="fa-solid fa-network-wired"></i>
                <span>API Monitor</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-logs')" id="menu-sys-logs">
            <span class="menu-link-group">
                <i class="fa-solid fa-file-lines"></i>
                <span>Log Viewer</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-env')" id="menu-sys-env">
            <span class="menu-link-group">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Env & Security</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sys-backups')" id="menu-sys-backups">
            <span class="menu-link-group">
                <i class="fa-solid fa-floppy-disk"></i>
                <span>Backup & Diagnostics</span>
            </span>
        </div>

        <div class="menu-item" onclick="showToast('ব্যবহারকারী সেটিংস ডেমো মোড')">
            <span class="menu-link-group">
                <i class="fa-solid fa-users"></i>
                <span>Users & Groups</span>
            </span>
            <i class="fa-solid fa-angle-right" style="font-size: 11px;"></i>
        </div>
    </div>
</div>
