<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oops! Something went wrong</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-color: #0b1329;
            --card-bg: #1c2541;
            --text-color: #f1f5f9;
            --text-muted: #94a3b8;
            --accent-color: #e11d48;
            --btn-bg: #22c55e;
            --btn-hover: #16a34a;
        }

        body {
            font-family: 'Outfit', 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }

        .error-card {
            background-color: var(--card-bg);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .error-icon {
            font-size: 80px;
            color: var(--accent-color);
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }

        h1 {
            font-size: 32px;
            margin: 0 0 10px 0;
            font-weight: 800;
        }

        p {
            font-size: 16px;
            color: var(--text-muted);
            margin: 0 0 30px 0;
            line-height: 1.6;
        }

        .ref-box {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px dashed rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 30px;
        }

        .ref-label {
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .ref-value {
            font-family: monospace;
            font-size: 18px;
            font-weight: 700;
            color: #38bdf8;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-primary {
            background-color: var(--btn-bg);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--btn-hover);
        }

        .btn-secondary {
            background-color: #334155;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #475569;
        }

        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.3s ease-out;
            z-index: 999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .toast.show {
            transform: translateX(-50%) translateY(0);
        }
    </style>
</head>
<body>

    <div class="error-card">
        <i class="fa-solid fa-triangle-exclamation error-icon"></i>
        <h1>Oops!</h1>
        <p>Something went wrong.</p>

        <div class="ref-box">
            <div class="ref-label">Reference ID:</div>
            <div class="ref-value" id="ref-id">{{ $reference_id ?? 'ERR-SYSTEM' }}</div>
        </div>

        <p style="font-size: 14px; margin-bottom: 25px;">Please try again later or send this report to our support team.</p>

        <div class="btn-group">
            <button class="btn btn-primary" onclick="copyErrorDetails()">
                <i class="fa-regular fa-copy"></i> Copy Error Details
            </button>
            <button class="btn btn-secondary" onclick="downloadReport()">
                <i class="fa-solid fa-download"></i> Download Error Report
            </button>
        </div>
    </div>

    <div id="toast" class="toast">Error details copied to clipboard!</div>

    <script>
        const refId = document.getElementById('ref-id').innerText;
        const errorData = {
            title: "MBanglaPatente Error Report",
            reference_id: refId,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            browser: navigator.userAgent
        };

        function copyErrorDetails() {
            const textToCopy = `Error Report:\nReference ID: ${errorData.reference_id}\nTimestamp: ${errorData.timestamp}\nURL: ${errorData.url}\nBrowser: ${errorData.browser}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const toast = document.getElementById('toast');
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            });
        }

        function downloadReport() {
            const reportText = `MBanglaPatente System Error Report\n=================================\nReference ID: ${errorData.reference_id}\nTimestamp: ${errorData.timestamp}\nURL: ${errorData.url}\nBrowser: ${errorData.browser}\n\nPlease share this Reference ID with the support team to debug the issue.`;
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `error-report-${refId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
