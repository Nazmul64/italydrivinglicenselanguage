<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M Bangla Patente B - কিউআর কোড স্ক্যান করে আনলক করুন</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html {
            width: 100%; min-height: 100%;
            background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 24px 16px;
        }
        .container {
            background: #ffffff;
            border-radius: 28px;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04);
            padding: 36px 28px;
            max-width: 430px;
            width: 100%;
            text-align: center;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 6px;
            background: linear-gradient(90deg, #16a34a, #2563eb);
        }
        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: #f0fdf4;
            color: #16a34a;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 14px;
            border: 1px solid #bbf7d0;
        }
        .header-title {
            font-size: 19px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 22px;
            line-height: 1.5;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(37, 99, 235, 0.08);
            color: #2563eb;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            background: #2563eb;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }

        /* QR Card */
        .qr-card {
            background: #ffffff;
            padding: 14px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 22px;
            border: 2px dashed #cbd5e1;
            margin: 0 auto 22px auto;
            width: 244px;
            height: 244px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
        }
        .qr-card:hover {
            border-color: #2563eb;
        }
        #qrcode canvas, #qrcode img {
            width: 216px !important;
            height: 216px !important;
            display: block;
            margin: 0 auto;
            border-radius: 10px;
        }

        .instruction-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px 16px;
            text-align: left;
            margin-bottom: 12px;
        }
        .instruction-step {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 12px;
            color: #334155;
            line-height: 1.45;
        }
        .instruction-step:last-child {
            margin-bottom: 0;
        }
        .step-num {
            background: #2563eb;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .footer {
            margin-top: 20px;
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 0.2px;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>

    <div class="container">
        <div class="brand-badge">
            <i class="fa-solid fa-car-side"></i> M Bangla Patente B
        </div>
        
        <h1 class="header-title">M Bangla Patente B Apps এর কিউআর কোডটি স্ক্যান করুন</h1>
        <p class="subtitle">স্ক্যান সফল হলে ওয়েবসাইটটি অটোমেটিক আনলক হবে।</p>

        <div class="status-badge" id="qr-status-badge">
            <div class="status-dot"></div>
            <span>স্ক্যানের জন্য অপেক্ষা করা হচ্ছে...</span>
        </div>

        <div class="qr-card">
            <div id="qrcode"></div>
        </div>

        <div class="instruction-box">
            <div class="instruction-step">
                <span class="step-num">১</span>
                <span><strong>M Bangla Patente B</strong> মোবাইল অ্যাপে নাম ও ফোন নম্বর দিয়ে সাবমিট করুন।</span>
            </div>
            <div class="instruction-step">
                <span class="step-num">২</span>
                <span>অ্যাডমিন প্যানেল থেকে লাইসেন্স সক্রিয় হওয়ার পর অ্যাপের <strong>QR স্ক্যানার</strong> খুলুন।</span>
            </div>
            <div class="instruction-step">
                <span class="step-num">৩</span>
                <span>কম্পিউটার স্ক্রিনের এই কিউআর কোডটি স্ক্যান করলেই পেজটি ওপেন হয়ে যাবে।</span>
            </div>
        </div>

        <div class="footer">
            Copyright &copy; M Bangla Patente B. All rights reserved.
        </div>
    </div>

    <script>
        var qrUrl = "{{ $qrUnlockUrl }}";
        var sessionId = "{{ $sessionId }}";
        var qrcodeContainer = document.getElementById("qrcode");
        var isRedirecting = false;

        function generateQR() {
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrcodeContainer, {
                    text: qrUrl,
                    width: 216,
                    height: 216,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } else {
                var img = document.createElement("img");
                img.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(qrUrl);
                img.style.width = "216px";
                img.style.height = "216px";
                qrcodeContainer.appendChild(img);
            }
        }

        generateQR();

        // Real-time polling to check if mobile device unlocked this session via QR
        var checkTimer = setInterval(function() {
            if (isRedirecting) return;
            fetch('/qr-check-session?session_id=' + encodeURIComponent(sessionId))
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data && data.unlocked) {
                        isRedirecting = true;
                        clearInterval(checkTimer);

                        sessionStorage.setItem('tab_qr_unlocked', 'true');
                        localStorage.setItem('app_client_active', 'true');
                        if (data.phone) {
                            localStorage.setItem('app_client_phone', data.phone);
                            document.cookie = "app_client_phone=" + encodeURIComponent(data.phone) + "; path=/; SameSite=Lax; max-age=31536000";
                        }
                        if (data.session_id) {
                            localStorage.setItem('app_client_session_id', data.session_id);
                            document.cookie = "app_client_session_id=" + encodeURIComponent(data.session_id) + "; path=/; SameSite=Lax; max-age=31536000";
                        }
                        if (data.first_name) {
                            localStorage.setItem('app_client_first_name', data.first_name);
                        }
                        if (data.last_name) {
                            localStorage.setItem('app_client_last_name', data.last_name);
                        }
                        document.cookie = "qr_session_id=" + encodeURIComponent(sessionId) + "; path=/; SameSite=Lax; max-age=31536000";
                        document.cookie = "qr_tab_unlocked=1; path=/; SameSite=Lax; max-age=31536000";
                        document.cookie = "qr_unlocked_" + encodeURIComponent(sessionId) + "=true; path=/; max-age=31536000";

                        var badge = document.getElementById('qr-status-badge');
                        if (badge) {
                            badge.innerHTML = '<span style="color:#16a34a;font-weight:800;font-size:13px;">🎉 স্ক্যান সফল হয়েছে! লোড হচ্ছে...</span>';
                            badge.style.background = 'rgba(34, 197, 94, 0.15)';
                        }

                        var curPath = window.location.pathname;
                        var curSearch = window.location.search;
                        if (curSearch) {
                            curSearch = curSearch.replace(/[?&]qr_unlocked=[^&]*/g, '').replace(/^&/, '?');
                        }
                        setTimeout(function() {
                            if (curPath && curPath !== '/' && !curPath.includes('qr-')) {
                                window.location.href = curPath + (curSearch || '');
                            } else {
                                window.location.href = '/';
                            }
                        }, 500);
                    }
                })
                .catch(function(err) { console.error('QR Session Check Error:', err); });
        }, 1200);
    </script>
</body>
</html>
