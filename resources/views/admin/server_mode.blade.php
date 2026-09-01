@extends('admin.layouts.app')

@section('title', 'Server Mode Configuration')

@section('content')
@php
    $targetMode = $setting->qr_target_mode ?? 'local';
    $isLive = ($targetMode === 'live');
    $liveUrl = $setting->qr_live_url ?? 'https://mbanglapatenteb.com';
    $localUrl = $setting->qr_local_url ?? 'http://10.0.2.2:8000';
    $activeUrl = $isLive ? $liveUrl : $localUrl;
@endphp

<style>
    /* Modern Server Mode Switcher System Styles */
    .server-switch-container {
        display: inline-flex;
        align-items: center;
        background: #f1f5f9;
        border: 1.5px solid #cbd5e1;
        border-radius: 30px;
        padding: 4px;
        position: relative;
        cursor: pointer;
        user-select: none;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
    }
    .server-switch-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 800;
        border-radius: 25px;
        color: #64748b;
        transition: all 0.25s ease;
        z-index: 2;
        cursor: pointer;
    }
    .server-switch-option.active-local {
        background: linear-gradient(135deg, #eab308, #ca8a04);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
    }
    .server-switch-option.active-live {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }
    
    /* Toggle Switch Slider Track & Thumb */
    .toggle-switch-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255,255,255,0.85);
        border: 1.5px solid rgba(0,0,0,0.1);
        border-radius: 16px;
        padding: 10px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .toggle-switch-wrapper:hover {
        background: #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    }
    .toggle-switch-track {
        width: 58px;
        height: 30px;
        background-color: #cbd5e1;
        border-radius: 30px;
        position: relative;
        transition: background-color 0.3s ease;
    }
    .toggle-switch-track.active-live {
        background-color: #22c55e;
    }
    .toggle-switch-track.active-local {
        background-color: #eab308;
    }
    .toggle-switch-thumb {
        width: 24px;
        height: 24px;
        background-color: #ffffff;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .toggle-switch-track.active-live .toggle-switch-thumb {
        transform: translateX(28px);
        color: #22c55e;
    }
    .toggle-switch-track.active-local .toggle-switch-thumb {
        transform: translateX(0px);
        color: #eab308;
    }
</style>

<div style="min-height: 100vh; background: var(--bg-main, #f8fafc); padding: 32px 24px;">

    {{-- Back Button --}}
    <div style="margin-bottom: 24px;">
        <a href="/admin" style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #64748b; text-decoration: none; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 10px; padding: 8px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s;">
            <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
        </a>
    </div>

    {{-- Page Header --}}
    <div style="margin-bottom: 32px;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                <i class="fa-solid fa-server" style="color: #ffffff; font-size: 22px;"></i>
            </div>
            <div>
                <h1 style="font-size: 26px; font-weight: 900; color: var(--text-primary, #1e293b); margin: 0;">Server Mode Configuration</h1>
                <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Switch between Local Development Server and Live Production Server. Changes take effect on the mobile app immediately.</p>
            </div>
        </div>
    </div>

    <div style="max-width: 900px; display: flex; flex-direction: column; gap: 24px;">

        {{-- CURRENT ACTIVE SERVER MODE CARD --}}
        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b;">
                    ⚡ CURRENT ACTIVE SERVER MODE
                </div>

                {{-- Interactive Switch System (FontAwesome Pills) --}}
                <div class="server-switch-container" id="server-switch-pill-box">
                    <div id="switch-btn-local" onclick="quickSwitchServerMode('local')" class="server-switch-option {{ !$isLive ? 'active-local' : '' }}">
                        <i class="fa-solid fa-laptop-code"></i> Local Server
                    </div>
                    <div id="switch-btn-live" onclick="quickSwitchServerMode('live')" class="server-switch-option {{ $isLive ? 'active-live' : '' }}">
                        <i class="fa-solid fa-globe"></i> Live Production
                    </div>
                </div>
            </div>

            {{-- ACTIVE MODE BANNER --}}
            <div id="active-server-mode-banner" style="background: {{ $isLive ? '#dcfce7' : '#fef08a' }}; border: 2px solid {{ $isLive ? '#22c55e' : '#eab308' }}; border-radius: 14px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <i class="fa-solid {{ $isLive ? 'fa-globe' : 'fa-server' }}" id="active-server-icon" style="font-size: 32px; color: {{ $isLive ? '#15803d' : '#854d0e' }};"></i>
                    <div>
                        <span id="active-server-mode-text" style="font-size: 22px; font-weight: 900; color: {{ $isLive ? '#15803d' : '#854d0e' }}; letter-spacing: 0.5px;">
                            {{ $isLive ? 'LIVE PRODUCTION SERVER MODE' : 'LOCAL SERVER MODE' }}
                        </span>
                        <div style="font-size: 13px; font-weight: 600; color: {{ $isLive ? '#166534' : '#a16207' }}; margin-top: 2px;">
                            Active Base URL: <code id="active-base-url-display" style="background: rgba(255,255,255,0.75); color: {{ $isLive ? '#15803d' : '#854d0e' }}; padding: 3px 8px; border-radius: 6px; font-size: 13px; font-weight: 700;">{{ $activeUrl }}</code>
                        </div>
                    </div>
                </div>

                {{-- Interactive Slide Switch Toggle --}}
                <div class="toggle-switch-wrapper" onclick="toggleServerModeSwitch()" title="Click to toggle server mode">
                    <span style="font-size: 12px; font-weight: 800; color: #475569;" id="toggle-switch-label">
                        {{ $isLive ? 'Live Mode Active' : 'Local Mode Active' }}
                    </span>
                    <div class="toggle-switch-track {{ $isLive ? 'active-live' : 'active-local' }}" id="main-toggle-switch-track">
                        <div class="toggle-switch-thumb">
                            <i class="fa-solid {{ $isLive ? 'fa-globe' : 'fa-laptop-code' }}" id="main-toggle-switch-icon" style="font-size: 11px;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- SERVER URL SETTINGS FORM --}}
        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary, #1e293b); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-sliders" style="color: #64748b;"></i> Server URL Settings
            </h3>

            <form id="server-mode-config-form" onsubmit="saveServerModeSettingsForm(event)">
                <input type="hidden" name="qr_target_mode" id="hidden-qr-target-mode" value="{{ $targetMode }}">

                <div style="margin-bottom: 20px;">
                    <label style="font-weight: 700; font-size: 13px; color: var(--text-secondary, #64748b); margin-bottom: 14px; display: block;">
                        Select Active Server Mode:
                    </label>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;">

                        {{-- LOCAL SERVER CARD --}}
                        <div id="card-option-local" onclick="selectServerModeRadio('local')" 
                            style="border: 2px solid {{ !$isLive ? '#3b82f6' : 'var(--border-color, #cbd5e1)' }}; background: {{ !$isLive ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-card, #ffffff)' }}; border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
                                <input type="radio" id="server-mode-radio-local" name="qr_target_mode_radio" value="local" {{ !$isLive ? 'checked' : '' }} style="width: 20px; height: 20px; accent-color: #3b82f6; margin-top: 2px; flex-shrink: 0;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; justify-content: space-between;">
                                        <span><i class="fa-solid fa-laptop-code" style="color: #f59e0b; margin-right: 6px;"></i> Local Server Mode</span>
                                        <span id="badge-local-active" style="display: {{ !$isLive ? 'inline-block' : 'none' }}; background: #fef08a; color: #854d0e; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px;">ACTIVE</span>
                                    </div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                        Use for local development and testing on Emulator or Wi-Fi.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 6px;">Local Server URL:</label>
                                <input type="text" id="server-config-local-url" name="qr_local_url" value="{{ $localUrl }}" placeholder="http://10.0.2.2:8000"
                                    style="width: 100%; background: var(--bg-main, #f8fafc); border: 1.5px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 9px 12px; font-family: monospace; font-size: 13px; color: var(--text-primary, #1e293b); box-sizing: border-box;">
                                <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                    Example: <code style="color: #ef4444;">http://10.0.2.2:8000</code> (Emulator) or <code style="color: #ef4444;">http://192.168.1.x:8000</code> (Wi-Fi)
                                </span>
                            </div>
                        </div>

                        {{-- LIVE SERVER CARD --}}
                        <div id="card-option-live" onclick="selectServerModeRadio('live')" 
                            style="border: 2px solid {{ $isLive ? '#22c55e' : 'var(--border-color, #cbd5e1)' }}; background: {{ $isLive ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-card, #ffffff)' }}; border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
                                <input type="radio" id="server-mode-radio-live" name="qr_target_mode_radio" value="live" {{ $isLive ? 'checked' : '' }} style="width: 20px; height: 20px; accent-color: #22c55e; margin-top: 2px; flex-shrink: 0;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; justify-content: space-between;">
                                        <span><i class="fa-solid fa-globe" style="color: #22c55e; margin-right: 6px;"></i> Live Production Server Mode</span>
                                        <span id="badge-live-active" style="display: {{ $isLive ? 'inline-block' : 'none' }}; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px;">ACTIVE</span>
                                    </div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                        Use for public users connecting to the production domain.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 6px;">Live Production Server URL:</label>
                                <input type="text" id="server-config-live-url" name="qr_live_url" value="{{ $liveUrl }}" placeholder="https://mbanglapatenteb.com"
                                    style="width: 100%; background: var(--bg-main, #f8fafc); border: 1.5px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 9px 12px; font-family: monospace; font-size: 13px; color: var(--text-primary, #1e293b); box-sizing: border-box;">
                                <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                    Example: <code style="color: #ef4444;">https://mbanglapatenteb.com</code>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                    <button type="submit" id="save-server-config-btn"
                        style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-weight: 800; border-radius: 10px; padding: 12px 28px; font-size: 15px; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: all 0.2s;">
                        <i class="fa-solid fa-floppy-disk"></i> Save Server Settings
                    </button>
                </div>
            </form>
        </div>

        {{-- HOW IT WORKS INFO BOX --}}
        <div style="background: linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.06)); border: 1.5px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 22px 24px;">
            <div style="font-weight: 800; font-size: 14px; color: #4f46e5; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-circle-info"></i> কিভাবে কাজ করে?
            </div>
            <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary, #475569); font-size: 13px; line-height: 2;">
                <li><strong>Local Server Mode</strong> — অ্যাপ শুধুমাত্র আপনার পিসির লোকাল নেটওয়ার্কে কাজ করে (ডেভেলপমেন্ট এর জন্য)।</li>
                <li><strong>Live Production Mode</strong> — অ্যাপ সরাসরি <code>mbanglapatenteb.com</code> এর সাথে কথা বলে (পাবলিক ইউজার এর জন্য)।</li>
                <li>সেটিং পরিবর্তনের পর মোবাইল অ্যাপ রিস্টার্ট করলেই নতুন মোড কার্যকর হবে।</li>
            </ul>
        </div>

    </div>
</div>

@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', fetchServerModeSettings);
</script>
@endpush
