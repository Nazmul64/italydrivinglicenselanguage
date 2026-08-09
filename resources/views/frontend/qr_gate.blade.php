<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan to Unlock</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html {
            width: 100%; height: 100%;
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
        }
        .container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
        }
        .qr-card {
            background: #ffffff;
            padding: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .qr-card img {
            width: 220px;
            height: 220px;
            image-rendering: pixelated;
        }
        .footer {
            padding-bottom: 20px;
            font-size: 10px;
            color: #222222;
            letter-spacing: 0.2px;
        }
        /* Overlay shown while unlocking */
        #unlock-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(255,255,255,0.96);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            gap: 16px;
        }
        #unlock-overlay.active { display: flex; }
        .spinner {
            width: 48px; height: 48px;
            border: 5px solid #e2e8f0;
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        #unlock-overlay p { font-size: 16px; font-weight: 600; color: #15803d; }
    </style>
</head>
<body>

    <div class="container">
        <div class="qr-card">
            @php
                $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrUnlockUrl);
            @endphp
            <img src="{{ $qrApiUrl }}" alt="Scan QR Code to Unlock Website">
        </div>
    </div>

    <div class="footer">
        Copyright: R.C.
    </div>

    <!-- Unlock overlay: shown while redirecting -->
    <div id="unlock-overlay">
        <div class="spinner"></div>
        <p>✅ Unlocked! Loading website...</p>
    </div>

    <script>
        // Poll every 1.2 seconds — checks GLOBAL unlock key (any app scan triggers it)
        var _checkInterval = setInterval(function() {
            fetch('/qr-check-session?global=1')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.unlocked) {
                        clearInterval(_checkInterval);
                        document.getElementById('unlock-overlay').classList.add('active');
                        // Auto redirect after brief success flash
                        setTimeout(function() {
                            window.location.replace('/');
                        }, 600);
                    }
                })
                .catch(function() {});
        }, 1200);
    </script>
</body>
</html>
