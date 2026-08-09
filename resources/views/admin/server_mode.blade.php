@extends('admin.layouts.app')

@section('title', 'Server Mode Configuration')

@section('content')
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
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b;">
                    ⚡ CURRENT ACTIVE SERVER MODE
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" onclick="quickSwitchServerMode('local')" style="background: #fef08a; color: #854d0e; font-weight: 800; border-radius: 10px; padding: 10px 18px; font-size: 13px; border: 2px solid #eab308; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                        <i class="fa-solid fa-mobile-screen"></i> Switch to Local Server
                    </button>
                    <button type="button" onclick="quickSwitchServerMode('live')" style="background: #dcfce7; color: #15803d; font-weight: 800; border-radius: 10px; padding: 10px 18px; font-size: 13px; border: 2px solid #22c55e; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                        <i class="fa-solid fa-globe"></i> Switch to Live Server
                    </button>
                </div>
            </div>

            {{-- ACTIVE MODE BANNER --}}
            <div id="active-server-mode-banner" style="background: #fef08a; border: 2px solid #eab308; border-radius: 14px; padding: 18px 24px; display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                <i class="fa-solid fa-server" id="active-server-icon" style="font-size: 32px; color: #854d0e;"></i>
                <span id="active-server-mode-text" style="font-size: 24px; font-weight: 900; color: #854d0e; letter-spacing: 0.5px;">
                    LOCAL SERVER MODE
                </span>
            </div>

            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary, #1e293b);">
                Active Base URL:&nbsp;
                <code id="active-base-url-display" style="background: rgba(59, 130, 246, 0.1); color: #2563eb; padding: 5px 12px; border-radius: 8px; font-size: 14px; font-weight: 700;">http://10.0.2.2:8000</code>
            </div>
        </div>

        {{-- SERVER URL SETTINGS FORM --}}
        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary, #1e293b); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-sliders" style="color: #64748b;"></i> Server URL Settings
            </h3>

            <form id="server-mode-config-form" onsubmit="saveServerModeSettingsForm(event)">
                <div style="margin-bottom: 20px;">
                    <label style="font-weight: 700; font-size: 13px; color: var(--text-secondary, #64748b); margin-bottom: 14px; display: block;">
                        Select Active Server Mode:
                    </label>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;">

                        {{-- LOCAL SERVER CARD --}}
                        <div id="card-option-local" onclick="selectServerModeRadio('local')" style="border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.04); border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
                                <input type="radio" id="server-mode-radio-local" name="qr_target_mode" value="local" style="width: 20px; height: 20px; accent-color: #3b82f6; margin-top: 2px; flex-shrink: 0;">
                                <div>
                                    <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; gap: 8px;">
                                        <i class="fa-solid fa-laptop-code" style="color: #f59e0b;"></i> Local Server Mode
                                    </div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                        Use for local development and testing on Emulator or Wi-Fi.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 6px;">Local Server URL:</label>
                                <input type="text" id="server-config-local-url" name="qr_local_url" value="http://10.0.2.2:8000" placeholder="http://10.0.2.2:8000"
                                    style="width: 100%; background: var(--bg-main, #f8fafc); border: 1.5px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 9px 12px; font-family: monospace; font-size: 13px; color: var(--text-primary, #1e293b); box-sizing: border-box;">
                                <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                    Example: <code style="color: #ef4444;">http://10.0.2.2:8000</code> (Emulator) or <code style="color: #ef4444;">http://192.168.1.x:8000</code> (Wi-Fi)
                                </span>
                            </div>
                        </div>

                        {{-- LIVE SERVER CARD --}}
                        <div id="card-option-live" onclick="selectServerModeRadio('live')" style="border: 2px solid var(--border-color, #cbd5e1); background: var(--bg-card, #ffffff); border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
                                <input type="radio" id="server-mode-radio-live" name="qr_target_mode" value="live" style="width: 20px; height: 20px; accent-color: #22c55e; margin-top: 2px; flex-shrink: 0;">
                                <div>
                                    <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; gap: 8px;">
                                        <i class="fa-solid fa-globe" style="color: #22c55e;"></i> Live Production Server Mode
                                    </div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                        Use for public users connecting to the production domain.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 6px;">Live Production Server URL:</label>
                                <input type="text" id="server-config-live-url" name="qr_live_url" value="http://mbanglapatenteb.com" placeholder="http://mbanglapatenteb.com"
                                    style="width: 100%; background: var(--bg-main, #f8fafc); border: 1.5px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 9px 12px; font-family: monospace; font-size: 13px; color: var(--text-primary, #1e293b); box-sizing: border-box;">
                                <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                    Example: <code style="color: #ef4444;">http://mbanglapatenteb.com</code>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                    <button type="submit" id="save-server-config-btn"
                        style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-weight: 800; border-radius: 10px; padding: 12px 28px; font-size: 15px; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: all 0.2s;">
                        <i class="fa-solid fa-box-archive"></i> Save Server Settings
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

{{-- Toast notification --}}
<div id="toast-message" class="toast-notification" style="position: fixed; bottom: 30px; right: 30px; background: #1e293b; color: #ffffff; padding: 14px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 9999; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.2); transform: translateY(20px); opacity: 0; transition: all 0.3s;">
    <span id="toast-text-content"></span>
</div>

@endsection

@push('scripts')
<script>
    // fetchServerModeSettings, selectServerModeRadio, updateActiveServerModeBanner,
    // quickSwitchServerMode, saveServerModeSettingsForm are all defined in system.js.
    // csrfToken is defined in core.js.
    // No re-declarations needed here — just trigger on load.
    document.addEventListener('DOMContentLoaded', fetchServerModeSettings);
</script>
@endpush


