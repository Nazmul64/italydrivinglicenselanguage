<?php
// Italy Driving License Platform - RESTful API v1 Documentation
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RESTful API v1 Documentation - Italy Driving License Platform</title>
    <!-- Google Fonts & FontAwesome -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --bg-body: #0f172a;
            --bg-sidebar: #1e293b;
            --bg-card: #1e293b;
            --bg-code: #090d16;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-blue: #38bdf8;
            --accent-green: #22c55e;
            --accent-purple: #a855f7;
            --accent-yellow: #eab308;
            --accent-red: #ef4444;
            --border-color: #334155;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar Styling */
        .sidebar {
            width: 300px;
            background-color: var(--bg-sidebar);
            border-right: 1px solid var(--border-color);
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            overflow-y: auto;
            padding: 24px 16px;
        }

        .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand i {
            font-size: 24px;
            color: var(--accent-blue);
        }

        .sidebar-brand h2 {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
        }

        .sidebar-menu {
            list-style: none;
        }

        .sidebar-menu-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--text-muted);
            margin: 16px 0 8px 8px;
            letter-spacing: 0.5px;
        }

        .sidebar-menu li a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .sidebar-menu li a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            color: var(--accent-blue);
        }

        /* Main Content */
        .main-content {
            margin-left: 300px;
            flex: 1;
            padding: 40px;
            max-width: 1100px;
        }

        .doc-header {
            margin-bottom: 36px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .doc-title {
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 8px;
        }

        .doc-subtitle {
            font-size: 15px;
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* Endpoint Card */
        .endpoint-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .method-badge {
            padding: 4px 12px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 12px;
            text-transform: uppercase;
        }

        .method-get { background-color: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
        .method-post { background-color: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }
        .method-delete { background-color: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

        .endpoint-url {
            font-family: 'Fira Code', monospace;
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
        }

        .endpoint-desc {
            font-size: 14px;
            color: var(--text-muted);
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .section-subhead {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--accent-blue);
            margin: 16px 0 8px 0;
        }

        table.params-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 13px;
        }

        table.params-table th, table.params-table td {
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color);
        }

        table.params-table th {
            color: var(--text-muted);
            font-weight: 700;
            background-color: rgba(0,0,0,0.15);
        }

        table.params-table code {
            font-family: 'Fira Code', monospace;
            color: #f472b6;
        }

        pre.code-block {
            background-color: var(--bg-code);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 16px;
            font-family: 'Fira Code', monospace;
            font-size: 12.5px;
            color: #38bdf8;
            overflow-x: auto;
            line-height: 1.5;
        }

        .integration-guide-card {
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.08));
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin: 40px 0;
        }

        .integration-guide-card h3 {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
    </style>
</head>
<body>

    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-brand">
            <i class="fa-solid fa-code"></i>
            <div>
                <h2>Mobile App API</h2>
                <span style="font-size: 11px; color: var(--accent-green); font-weight: bold;">v1.0 Ready (Flutter/RN)</span>
            </div>
        </div>

        <ul class="sidebar-menu">
            <div class="sidebar-menu-title">Getting Started</div>
            <li><a href="#overview"><i class="fa-solid fa-compass"></i> Overview & Headers</a></li>

            <div class="sidebar-menu-title">All 16 App Modules</div>
            <li><a href="#mod-1"><i class="fa-solid fa-graduation-cap"></i> 1. ARGOMENTI</a></li>
            <li><a href="#mod-2"><i class="fa-solid fa-chalkboard-user"></i> 2. E-Class & Lezioni</a></li>
            <li><a href="#mod-3"><i class="fa-solid fa-list-check"></i> 3. Test (Practice)</a></li>
            <li><a href="#mod-4"><i class="fa-solid fa-diamond-turn-right"></i> 4. Cartelli</a></li>
            <li><a href="#mod-5"><i class="fa-solid fa-spell-check"></i> 5. Dizionario</a></li>
            <li><a href="#mod-6"><i class="fa-solid fa-file-signature"></i> 6. Scheda Esame</a></li>
            <li><a href="#mod-7"><i class="fa-solid fa-trophy"></i> 7. Sfida Challenge</a></li>
            <li><a href="#mod-8"><i class="fa-solid fa-headset"></i> 8. Support Chat</a></li>
            <li><a href="#mod-9"><i class="fa-solid fa-circle-xmark"></i> 9. Wrong MCQs</a></li>
            <li><a href="#mod-10"><i class="fa-solid fa-circle-check"></i> 10. Correct MCQs</a></li>
            <li><a href="#mod-11"><i class="fa-solid fa-bookmark"></i> 11. Saved MCQs & Notes</a></li>
            <li><a href="#mod-12"><i class="fa-solid fa-language"></i> 12. Translation</a></li>
            <li><a href="#mod-13"><i class="fa-solid fa-shapes"></i> 13. Patente Social</a></li>
            <li><a href="#mod-14"><i class="fa-solid fa-book-bookmark"></i> 14. Manuale Theory</a></li>
            <li><a href="#mod-15"><i class="fa-solid fa-ranking-star"></i> 15. Leaderboard</a></li>
            <li><a href="#mod-16"><i class="fa-solid fa-shield-halved"></i> 16. Client & License</a></li>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="doc-header">
            <h1 class="doc-title">RESTful API Integration Specification</h1>
            <p class="doc-subtitle">Complete RESTful API endpoint documentation for Mobile Application Developers (Flutter / React Native / iOS / Android) powering the Italy Bangla License Platform.</p>
        </div>

        <!-- Section: Overview -->
        <div id="overview" class="endpoint-card">
            <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 12px; color: #ffffff;"><i class="fa-solid fa-network-wired" style="color: var(--accent-blue);"></i> Overview & Global Headers</h2>
            <p class="endpoint-desc">Base URL: <code>http://127.0.0.1:8000/api/v1</code></p>
            
            <div class="section-subhead">Required Headers</div>
            <table class="params-table">
                <thead>
                    <tr><th>Header Key</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>Accept</code></td><td>String</td><td><code>application/json</code></td></tr>
                    <tr><td><code>Content-Type</code></td><td>String</td><td><code>application/json</code></td></tr>
                    <tr><td><code>X-CSRF-TOKEN</code></td><td>String</td><td>Laravel CSRF Token (Required for POST/PUT/DELETE requests)</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile App Special Logic Guide -->
        <div class="integration-guide-card">
            <h3><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-purple);"></i> Mobile App Developer Implementation Guide</h3>
            <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin-bottom: 12px;">
                1. <strong>Underline Vocabulary Terms:</strong> Questions contain a <code>vocabulary</code> JSON array of Italian keywords and Bangla definitions. In Flutter/React Native, parse the <code>italian</code> question string and underline any word matching a keyword in <code>vocabulary</code>.<br>
                2. <strong>Translation Modal:</strong> When a user taps the <code>A-Z</code> translation button or taps an underlined word, call <code>GET /api/v1/translation?question_id=123</code> or <code>GET /api/v1/translation?term=strada</code> to display the dictionary popup modal.<br>
                3. <strong>Audio & Voiceover:</strong> MCQ items contain an <code>audio</code> parameter. If non-null, stream or play the MP3 audio file. Otherwise, fallback to Text-To-Speech (TTS) for the Italian string.<br>
                4. <strong>Scheda Esame (30 MCQs):</strong> Total 30 questions, 20-minute countdown timer, max 3 errors allowed. Exceeding 3 errors results in BOCCIATO (Failed).
            </p>
        </div>

        <!-- Module 1: ARGOMENTI -->
        <div id="mod-1" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/chapters</span>
            </div>
            <p class="endpoint-desc">Fetches all Argomenti (Theory Chapters).</p>
            <div class="section-subhead">Sample Response Payload</div>
            <pre class="code-block">{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Definizioni stradali e del traffico",
      "sort_order": 1,
      "created_at": "2026-07-26T12:00:00.000000Z"
    }
  ]
}</pre>
        </div>

        <!-- Module 2: E-Class & Lezioni -->
        <div id="mod-2" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/lezioni</span>
            </div>
            <p class="endpoint-desc">Fetches all recorded video classes and tutorial lectures.</p>
        </div>

        <!-- Module 3: Test (Practice Test) -->
        <div id="mod-3" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/test/questions?limit=30</span>
            </div>
            <p class="endpoint-desc">Fetches random MCQs for practice test sessions.</p>
        </div>

        <!-- Module 4: Cartelli -->
        <div id="mod-4" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/cartelli/categories</span>
            </div>
            <p class="endpoint-desc">Fetches traffic sign categories (Pericolo, Obbligo, Divieto, etc.).</p>
        </div>

        <!-- Module 5: Dizionario -->
        <div id="mod-5" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/dizionario?search=corsia</span>
            </div>
            <p class="endpoint-desc">Searches Italian-Bangla driving license terms and meanings.</p>
        </div>

        <!-- Module 6: Scheda Esame -->
        <div id="mod-6" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/scheda-esame/generate</span>
            </div>
            <p class="endpoint-desc">Generates an official 30-question Scheda Esame exam paper.</p>
        </div>

        <!-- Module 7: Sfida -->
        <div id="mod-7" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/sfida/questions</span>
            </div>
            <p class="endpoint-desc">Fetches questions for Sfida (Speed Challenge) game mode.</p>
        </div>

        <!-- Module 8: Support Chat -->
        <div id="mod-8" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-post">POST</span>
                <span class="endpoint-url">/api/v1/support/messages</span>
            </div>
            <p class="endpoint-desc">Sends a message to the tutor support chat room.</p>
        </div>

        <!-- Module 9 & 10: Wrong / Correct MCQs -->
        <div id="mod-9" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/wrong-mcqs</span>
            </div>
            <p class="endpoint-desc">Fetches user's wrong answered questions for re-quiz practice.</p>
        </div>

        <!-- Module 11: Saved MCQs -->
        <div id="mod-11" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-post">POST</span>
                <span class="endpoint-url">/api/v1/saved-mcqs/toggle</span>
            </div>
            <p class="endpoint-desc">Bookmarks or removes an MCQ from user's saved list.</p>
        </div>

        <!-- Module 12: Translation -->
        <div id="mod-12" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/translation?question_id=12</span>
            </div>
            <p class="endpoint-desc">Fetches vocabulary popup details for a specific question.</p>
        </div>

        <!-- Module 13: Patente Social -->
        <div id="mod-13" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/patente-social/cards</span>
            </div>
            <p class="endpoint-desc">Fetches dynamic home grid cards, banners, and app theme settings.</p>
        </div>

        <!-- Module 14: Manuale -->
        <div id="mod-14" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/manuale/chapters</span>
            </div>
            <p class="endpoint-desc">Fetches theory manual chapters and pages.</p>
        </div>

        <!-- Module 15: Leaderboard -->
        <div id="mod-15" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/leaderboard</span>
            </div>
            <p class="endpoint-desc">Fetches Top 20 student leaderboard rankings and scores.</p>
        </div>

        <!-- Module 16: Client Status & Verification -->
        <div id="mod-16" class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-url">/api/v1/client/status</span>
            </div>
            <p class="endpoint-desc">Checks client device session activation and license expiry status.</p>
        </div>

    </div>

</body>
</html>
