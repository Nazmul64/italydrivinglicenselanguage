<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan QR Code to Unlock Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html {
            width: 100%; height: 100%;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            padding: 32px 24px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .header-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .qr-card {
            background: #ffffff;
            padding: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 16px;
            border: 2px dashed #cbd5e1;
            margin: 0 auto 20px auto;
            width: 250px;
            height: 250px;
        }
        #qrcode canvas, #qrcode img {
            width: 218px !important;
            height: 218px !important;
            display: block;
            margin: 0 auto;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(59, 130, 246, 0.1);
            color: #2563eb;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 16px;
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
        .footer {
            margin-top: 24px;
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 0.2px;
        }
    </style>
    <!-- Client-Side QRCode JS Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>

    <div class="container">
        <h1 class="header-title" style="font-size: 17px; line-height: 1.5; color: #0f172a; margin-bottom: 6px;">M Bangla Patente B Apps এর কিউআর কোডটি স্ক্যান করুন</h1>
        <p class="subtitle" style="font-size: 13px; color: #64748b; margin-bottom: 14px;">স্ক্যান সফল হলে পেজটি অটোমেটিক আনলক হবে।</p>

        <div class="status-badge">
            <div class="status-dot"></div>
            <span>স্ক্যানের জন্য অপেক্ষা করা হচ্ছে...</span>
        </div>

        <div class="qr-card">
            <div id="qrcode"></div>
        </div>

        <div class="footer">
            Copyright: R.C.
        </div>
    </div>

    <script>
        var qrUrl = "{{ $qrUnlockUrl }}";
        var sessionId = "{{ $sessionId }}";
        var qrcodeContainer = document.getElementById("qrcode");

        function generateQR() {
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrcodeContainer, {
                    text: qrUrl,
                    width: 218,
                    height: 218,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } else {
                var img = document.createElement("img");
                img.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(qrUrl);
                img.style.width = "218px";
                img.style.height = "218px";
                qrcodeContainer.appendChild(img);
            }
        }

        generateQR();

        // Real-time polling to check if mobile device unlocked this session
        var isRedirecting = false;
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
                        }
                        if (data.session_id) {
                            localStorage.setItem('app_client_session_id', data.session_id);
                        }
                        if (data.first_name) {
                            localStorage.setItem('app_client_first_name', data.first_name);
                        }
                        if (data.last_name) {
                            localStorage.setItem('app_client_last_name', data.last_name);
                        }
                        document.cookie = "qr_unlocked_" + encodeURIComponent(sessionId) + "=true; path=/; max-age=31536000";
                        window.location.href = '/?qr_unlocked=1';
                    }
                })
                .catch(function(err) { console.error('QR Session Check Error:', err); });
        }, 1500);
    </script>
</body>
</html>
