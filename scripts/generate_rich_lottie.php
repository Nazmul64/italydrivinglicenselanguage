<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HomeCard;

$lottieDir = public_path('uploads/cards/lottie');
if (!file_exists($lottieDir)) {
    mkdir($lottieDir, 0777, true);
}

function hexToRgba($hex, $alpha = 1.0) {
    $hex = ltrim($hex, '#');
    if (strlen($hex) == 3) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    return [
        round(hexdec(substr($hex, 0, 2)) / 255, 3),
        round(hexdec(substr($hex, 2, 2)) / 255, 3),
        round(hexdec(substr($hex, 4, 2)) / 255, 3),
        $alpha
    ];
}

function createTransform($p = [150, 110, 0], $s = [100, 100, 100], $r = 0, $o = 100, $a = [0, 0, 0]) {
    return [
        "o" => is_array($o) ? $o : ["a" => 0, "k" => $o],
        "r" => is_array($r) ? $r : ["a" => 0, "k" => $r],
        "p" => is_array($p) ? $p : ["a" => 0, "k" => $p],
        "a" => is_array($a) ? $a : ["a" => 0, "k" => $a],
        "s" => is_array($s) ? $s : ["a" => 0, "k" => $s]
    ];
}

function createKeyframeProperty($valStart, $valMid, $valEnd, $startT = 0, $midT = 30, $endT = 60) {
    return [
        "a" => 1,
        "k" => [
            [
                "i" => ["x" => [0.4, 0.4, 0.4], "y" => [1, 1, 1]],
                "o" => ["x" => [0.6, 0.6, 0.6], "y" => [0, 0, 0]],
                "t" => $startT,
                "s" => is_array($valStart) ? $valStart : [$valStart]
            ],
            [
                "i" => ["x" => [0.4, 0.4, 0.4], "y" => [1, 1, 1]],
                "o" => ["x" => [0.6, 0.6, 0.6], "y" => [0, 0, 0]],
                "t" => $midT,
                "s" => is_array($valMid) ? $valMid : [$valMid]
            ],
            [
                "t" => $endT,
                "s" => is_array($valEnd) ? $valEnd : [$valEnd]
            ]
        ]
    ];
}

function createRectShape($x, $y, $w, $h, $radius, $fillColor, $strokeColor = null, $strokeWidth = 0) {
    $items = [
        ["ty" => "rc", "p" => ["a" => 0, "k" => [$x, $y]], "s" => ["a" => 0, "k" => [$w, $h]], "r" => ["a" => 0, "k" => $radius]],
        ["ty" => "fl", "c" => ["a" => 0, "k" => $fillColor], "o" => ["a" => 0, "k" => 100]]
    ];
    if ($strokeColor && $strokeWidth > 0) {
        $items[] = ["ty" => "st", "c" => ["a" => 0, "k" => $strokeColor], "o" => ["a" => 0, "k" => 100], "w" => ["a" => 0, "k" => $strokeWidth], "lc" => 2, "lj" => 2];
    }
    $items[] = ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]];
    return ["ty" => "gr", "it" => $items];
}

function createEllipseShape($x, $y, $w, $h, $fillColor, $strokeColor = null, $strokeWidth = 0) {
    $items = [
        ["ty" => "el", "p" => ["a" => 0, "k" => [$x, $y]], "s" => ["a" => 0, "k" => [$w, $h]]],
        ["ty" => "fl", "c" => ["a" => 0, "k" => $fillColor], "o" => ["a" => 0, "k" => 100]]
    ];
    if ($strokeColor && $strokeWidth > 0) {
        $items[] = ["ty" => "st", "c" => ["a" => 0, "k" => $strokeColor], "o" => ["a" => 0, "k" => 100], "w" => ["a" => 0, "k" => $strokeWidth], "lc" => 2, "lj" => 2];
    }
    $items[] = ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]];
    return ["ty" => "gr", "it" => $items];
}

function createStarShape($x, $y, $points, $innerR, $outerR, $fillColor) {
    return [
        "ty" => "gr",
        "it" => [
            ["ty" => "sr", "p" => ["a" => 0, "k" => [$x, $y]], "r" => ["a" => 0, "k" => $points], "ir" => ["a" => 0, "k" => $innerR], "is" => ["a" => 0, "k" => 0], "or" => ["a" => 0, "k" => $outerR], "os" => ["a" => 0, "k" => 0], "sy" => 1],
            ["ty" => "fl", "c" => ["a" => 0, "k" => $fillColor], "o" => ["a" => 0, "k" => 100]],
            ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
        ]
    ];
}

// Build standard floating background backdrop + decorative particles for all cards
function buildCardBackdropLayers(&$layers, $pColor, $sColor, $aColor) {
    // 1. Sparkle 1 (Top Right)
    $layers[] = [
        "ddd" => 0, "ind" => count($layers) + 1, "ty" => 4, "nm" => "Sparkle 1", "sr" => 1,
        "ks" => [
            "o" => createKeyframeProperty([30], [100], [30]),
            "r" => createKeyframeProperty([0], [90], [180]),
            "p" => createKeyframeProperty([240, 35, 0], [245, 25, 0], [240, 35, 0]),
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => createKeyframeProperty([60, 60, 100], [110, 110, 100], [60, 60, 100])
        ],
        "shapes" => [createStarShape(0, 0, 4, 3, 10, $aColor)],
        "ip" => 0, "op" => 60, "st" => 0
    ];

    // 2. Sparkle 2 (Bottom Left)
    $layers[] = [
        "ddd" => 0, "ind" => count($layers) + 1, "ty" => 4, "nm" => "Sparkle 2", "sr" => 1,
        "ks" => [
            "o" => createKeyframeProperty([80], [20], [80]),
            "r" => createKeyframeProperty([0], [-90], [-180]),
            "p" => createKeyframeProperty([55, 140, 0], [50, 145, 0], [55, 140, 0]),
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => createKeyframeProperty([90, 90, 100], [50, 50, 100], [90, 90, 100])
        ],
        "shapes" => [createStarShape(0, 0, 4, 2.5, 8, $sColor)],
        "ip" => 0, "op" => 60, "st" => 0
    ];

    // 3. Floating Orb 1 (Top Left)
    $layers[] = [
        "ddd" => 0, "ind" => count($layers) + 1, "ty" => 4, "nm" => "Dot Orb 1", "sr" => 1,
        "ks" => [
            "o" => createKeyframeProperty([40], [80], [40]),
            "r" => ["a" => 0, "k" => 0],
            "p" => createKeyframeProperty([48, 50, 0], [45, 42, 0], [48, 50, 0]),
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => createKeyframeProperty([80, 80, 100], [120, 120, 100], [80, 80, 100])
        ],
        "shapes" => [createEllipseShape(0, 0, 12, 12, $pColor)],
        "ip" => 0, "op" => 60, "st" => 0
    ];

    // 4. Floating Orb 2 (Right Mid)
    $layers[] = [
        "ddd" => 0, "ind" => count($layers) + 1, "ty" => 4, "nm" => "Dot Orb 2", "sr" => 1,
        "ks" => [
            "o" => createKeyframeProperty([60], [30], [60]),
            "r" => ["a" => 0, "k" => 0],
            "p" => createKeyframeProperty([250, 125, 0], [255, 130, 0], [250, 125, 0]),
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => createKeyframeProperty([100, 100, 100], [70, 70, 100], [100, 100, 100])
        ],
        "shapes" => [createEllipseShape(0, 0, 10, 10, $aColor)],
        "ip" => 0, "op" => 60, "st" => 0
    ];
}

function generateLottieForScreen($key, $name, $primaryHex, $secondaryHex, $accentHex) {
    $p = hexToRgba($primaryHex);
    $s = hexToRgba($secondaryHex);
    $a = hexToRgba($accentHex);
    $w = hexToRgba('#FFFFFF');
    $dark = hexToRgba('#1E293B');
    $pBg = hexToRgba($primaryHex, 0.14);

    $layers = [];

    // Build Backdrop
    buildCardBackdropLayers($layers, $p, $s, $a);

    // Hero Floating Group / Elements
    $mainShapes = [];

    // Ambient Soft Background Badge Plate
    $mainShapes[] = createRectShape(0, 0, 130, 100, 32, $pBg);

    switch ($key) {
        case 'lezioni':
            // Monitor Screen
            $mainShapes[] = createRectShape(0, -6, 104, 68, 14, $p);
            $mainShapes[] = createRectShape(0, -6, 94, 58, 10, $dark);
            // Monitor Stand
            $mainShapes[] = createRectShape(0, 34, 24, 12, 3, $p);
            $mainShapes[] = createRectShape(0, 42, 48, 6, 3, $s);
            // Play Button Triangle inside Circle
            $mainShapes[] = createEllipseShape(0, -6, 30, 30, $a);
            $mainShapes[] = createStarShape(2, -6, 3, 7, 14, $w);
            // Progress Bar
            $mainShapes[] = createRectShape(-16, 16, 44, 4, 2, $s);
            $mainShapes[] = createRectShape(18, 16, 20, 4, 2, hexToRgba('#475569'));
            break;

        case 'test':
            // Clipboard Paper
            $mainShapes[] = createRectShape(0, 0, 84, 106, 12, $w, $s, 3);
            // Clip top
            $mainShapes[] = createRectShape(0, -50, 36, 14, 5, $p);
            $mainShapes[] = createEllipseShape(0, -50, 12, 12, $w);
            // Checkmark rows
            $mainShapes[] = createRectShape(-24, -26, 14, 14, 4, hexToRgba('#10B981'));
            $mainShapes[] = createStarShape(-24, -26, 4, 3, 7, $w); // check star
            $mainShapes[] = createRectShape(10, -26, 38, 6, 3, hexToRgba('#CBD5E1'));

            $mainShapes[] = createRectShape(-24, -2, 14, 14, 4, hexToRgba('#10B981'));
            $mainShapes[] = createStarShape(-24, -2, 4, 3, 7, $w);
            $mainShapes[] = createRectShape(10, -2, 38, 6, 3, hexToRgba('#CBD5E1'));

            $mainShapes[] = createRectShape(-24, 22, 14, 14, 4, $a);
            $mainShapes[] = createRectShape(10, 22, 38, 6, 3, hexToRgba('#CBD5E1'));
            break;

        case 'argomenti':
            // Graduation Cap + Books
            // Cap Diamond
            $mainShapes[] = createStarShape(0, -22, 4, 26, 52, $p);
            $mainShapes[] = createRectShape(0, -10, 36, 16, 4, $dark);
            $mainShapes[] = createEllipseShape(0, -22, 10, 10, $a);
            // Tassel
            $mainShapes[] = createRectShape(32, -12, 4, 20, 2, $a);
            $mainShapes[] = createEllipseShape(32, 0, 8, 8, $a);
            // Books Stack
            $mainShapes[] = createRectShape(0, 18, 92, 16, 4, $s);
            $mainShapes[] = createRectShape(0, 36, 104, 16, 4, $p);
            $mainShapes[] = createRectShape(-42, 18, 6, 12, 2, $w);
            $mainShapes[] = createRectShape(-48, 36, 6, 12, 2, $w);
            break;

        case 'eclass':
            // Interactive Blackboard / Video Class
            $mainShapes[] = createRectShape(0, -4, 108, 72, 12, $p);
            $mainShapes[] = createRectShape(0, -4, 98, 62, 8, hexToRgba('#0F172A'));
            // Live Red Badge
            $mainShapes[] = createRectShape(-26, -22, 28, 12, 4, hexToRgba('#EF4444'));
            $mainShapes[] = createEllipseShape(-33, -22, 5, 5, $w);
            // Web camera top
            $mainShapes[] = createEllipseShape(0, -40, 10, 10, $dark);
            $mainShapes[] = createEllipseShape(0, -40, 4, 4, hexToRgba('#38BDF8'));
            // Whiteboard Teacher Chart
            $mainShapes[] = createRectShape(18, -4, 36, 26, 4, hexToRgba('#1E293B'));
            $mainShapes[] = createEllipseShape(18, -4, 14, 14, $a);
            // Stand legs
            $mainShapes[] = createRectShape(-24, 38, 8, 20, 3, $dark);
            $mainShapes[] = createRectShape(24, 38, 8, 20, 3, $dark);
            break;

        case 'sfida':
            // Golden Trophy Cup
            $mainShapes[] = createRectShape(0, 38, 54, 14, 5, hexToRgba('#78350F'));
            $mainShapes[] = createRectShape(0, 26, 22, 16, 4, $a);
            // Cup Bowl
            $mainShapes[] = createEllipseShape(0, -6, 68, 64, $a);
            $mainShapes[] = createRectShape(0, -22, 68, 22, 4, $a);
            // Inner gold glow
            $mainShapes[] = createEllipseShape(0, -22, 56, 14, hexToRgba('#FDE047'));
            // Handles
            $mainShapes[] = createEllipseShape(-38, -12, 24, 32, hexToRgba('#000000', 0), $a, 6);
            $mainShapes[] = createEllipseShape(38, -12, 24, 32, hexToRgba('#000000', 0), $a, 6);
            // Star on Trophy
            $mainShapes[] = createStarShape(0, -6, 5, 6, 15, $w);
            break;

        case 'scheda-esame':
            // Certificate Diploma with Ribbon Stamp
            $mainShapes[] = createRectShape(0, 0, 92, 110, 10, $w, $p, 4);
            $mainShapes[] = createRectShape(0, -32, 60, 8, 4, $p);
            $mainShapes[] = createRectShape(-10, -18, 40, 5, 2, hexToRgba('#94A3B8'));
            $mainShapes[] = createRectShape(-10, -6, 40, 5, 2, hexToRgba('#CBD5E1'));
            $mainShapes[] = createRectShape(-10, 6, 40, 5, 2, hexToRgba('#CBD5E1'));
            // Gold Medal Ribbon Stamp
            $mainShapes[] = createRectShape(22, 28, 12, 26, 2, hexToRgba('#EF4444'));
            $mainShapes[] = createEllipseShape(22, 20, 28, 28, $a);
            $mainShapes[] = createStarShape(22, 20, 5, 5, 11, $w);
            break;

        case 'words':
        case 'dizionario':
            // Open Dictionary Book + Letters
            $mainShapes[] = createRectShape(-26, 6, 48, 64, 6, $p);
            $mainShapes[] = createRectShape(26, 6, 48, 64, 6, $s);
            $mainShapes[] = createRectShape(-24, 6, 42, 58, 4, $w);
            $mainShapes[] = createRectShape(24, 6, 42, 58, 4, $w);
            // Spine center
            $mainShapes[] = createRectShape(0, 6, 10, 64, 3, $dark);
            // Lines & Symbols
            $mainShapes[] = createRectShape(-24, -8, 26, 5, 2, $p);
            $mainShapes[] = createRectShape(-24, 2, 26, 4, 2, hexToRgba('#94A3B8'));
            $mainShapes[] = createRectShape(-24, 12, 26, 4, 2, hexToRgba('#CBD5E1'));
            $mainShapes[] = createRectShape(24, -8, 26, 5, 2, $s);
            $mainShapes[] = createRectShape(24, 2, 26, 4, 2, hexToRgba('#94A3B8'));
            $mainShapes[] = createRectShape(24, 12, 26, 4, 2, hexToRgba('#CBD5E1'));
            // Magnifying Glass
            $mainShapes[] = createEllipseShape(24, -18, 26, 26, hexToRgba('#000000', 0), $a, 5);
            $mainShapes[] = createRectShape(36, -6, 8, 18, 3, $a);
            break;

        case 'dictionary':
            // Vocabulary Search Lens
            $mainShapes[] = createEllipseShape(-6, -10, 64, 64, hexToRgba('#000000', 0), $p, 8);
            $mainShapes[] = createEllipseShape(-6, -10, 50, 50, hexToRgba('#E0F2FE'));
            // Lens Handle
            $mainShapes[] = createRectShape(28, 24, 14, 36, 6, $a);
            // Dictionary Book Mini
            $mainShapes[] = createRectShape(-6, -10, 30, 22, 4, $p);
            $mainShapes[] = createStarShape(-6, -10, 4, 3, 8, $w);
            break;

        case 'cartelli':
            // STOP Sign + Danger Sign + Pole
            $mainShapes[] = createRectShape(0, 24, 8, 64, 4, hexToRgba('#64748B'));
            // Octagon STOP Red Sign
            $mainShapes[] = createRectShape(-18, -14, 52, 52, 14, hexToRgba('#DC2626'));
            $mainShapes[] = createRectShape(-18, -14, 44, 44, 10, hexToRgba('#DC2626'), $w, 3);
            $mainShapes[] = createRectShape(-18, -14, 28, 8, 3, $w); // STOP white bar
            // Triangular Danger Warning Sign
            $mainShapes[] = createStarShape(24, 2, 3, 16, 32, $a);
            $mainShapes[] = createStarShape(24, 3, 3, 11, 22, hexToRgba('#FEF08A'));
            $mainShapes[] = createRectShape(24, 2, 4, 10, 2, $dark);
            $mainShapes[] = createEllipseShape(24, 10, 4, 4, $dark);
            break;

        case 'saved-mcqs':
            // Saved Bookmark Ribbon with Star
            $mainShapes[] = createRectShape(0, 0, 72, 98, 12, $w, $p, 3);
            // Bookmark Ribbon
            $mainShapes[] = createRectShape(14, -14, 24, 62, 5, $p);
            $mainShapes[] = createStarShape(14, 6, 3, 8, 16, $w); // Cutout notch simulation
            $mainShapes[] = createStarShape(14, -18, 5, 5, 11, $a);
            // MCQ rows
            $mainShapes[] = createRectShape(-18, -20, 22, 6, 3, $s);
            $mainShapes[] = createRectShape(-18, -8, 22, 5, 2, hexToRgba('#CBD5E1'));
            $mainShapes[] = createRectShape(-18, 4, 22, 5, 2, hexToRgba('#CBD5E1'));
            $mainShapes[] = createRectShape(-18, 16, 22, 5, 2, hexToRgba('#CBD5E1'));
            break;

        case 'noted-mcqs':
            // Notepad with Pen
            $mainShapes[] = createRectShape(0, 4, 80, 94, 10, hexToRgba('#FEF08A'), hexToRgba('#F59E0B'), 3);
            // Top Binder Header
            $mainShapes[] = createRectShape(0, -38, 80, 14, 4, hexToRgba('#F59E0B'));
            $mainShapes[] = createEllipseShape(-24, -38, 6, 6, $w);
            $mainShapes[] = createEllipseShape(0, -38, 6, 6, $w);
            $mainShapes[] = createEllipseShape(24, -38, 6, 6, $w);
            // Notes Check Lines
            $mainShapes[] = createRectShape(-20, -16, 10, 10, 3, $p);
            $mainShapes[] = createRectShape(8, -16, 36, 5, 2, hexToRgba('#475569'));
            $mainShapes[] = createRectShape(-20, 2, 10, 10, 3, $p);
            $mainShapes[] = createRectShape(8, 2, 36, 5, 2, hexToRgba('#475569'));
            $mainShapes[] = createRectShape(-20, 20, 10, 10, 3, $s);
            $mainShapes[] = createRectShape(8, 20, 36, 5, 2, hexToRgba('#475569'));
            // Highlighter Pen
            $mainShapes[] = createRectShape(32, -8, 10, 38, 4, $p);
            $mainShapes[] = createStarShape(32, 16, 3, 5, 10, hexToRgba('#0F172A'));
            break;

        case 'correct-mcqs':
            // Glowing Green Success Checkmark Shield
            $mainShapes[] = createEllipseShape(0, 0, 92, 92, hexToRgba('#DCFCE7'));
            $mainShapes[] = createEllipseShape(0, 0, 76, 76, hexToRgba('#16A34A'));
            // Checkmark Vector Shapes
            $mainShapes[] = createRectShape(-8, 6, 14, 32, 6, $w);
            $mainShapes[] = createRectShape(12, -4, 14, 52, 6, $w);
            // Sparkle Badges
            $mainShapes[] = createStarShape(-28, -28, 4, 3, 9, $a);
            $mainShapes[] = createStarShape(28, 24, 4, 3, 9, $a);
            break;

        case 'wrong-mcqs':
            // Glowing Red Cross Circle
            $mainShapes[] = createEllipseShape(0, 0, 92, 92, hexToRgba('#FEE2E2'));
            $mainShapes[] = createEllipseShape(0, 0, 76, 76, hexToRgba('#DC2626'));
            // Cross bars
            $mainShapes[] = createRectShape(0, 0, 14, 52, 6, $w);
            $mainShapes[] = createRectShape(0, 0, 52, 14, 6, $w);
            // Warning exclamation sparkle
            $mainShapes[] = createStarShape(-28, -26, 4, 3, 8, $a);
            $mainShapes[] = createStarShape(28, 26, 4, 3, 8, $a);
            break;

        case 'support':
            // Headset + Live Chat Bubble
            // Headset Band
            $mainShapes[] = createEllipseShape(0, -6, 76, 76, hexToRgba('#000000', 0), $p, 8);
            // Ear pads
            $mainShapes[] = createRectShape(-38, 2, 14, 28, 6, $p);
            $mainShapes[] = createRectShape(38, 2, 14, 28, 6, $p);
            // Microphone
            $mainShapes[] = createRectShape(24, 24, 28, 6, 3, $dark);
            $mainShapes[] = createEllipseShape(10, 24, 10, 10, hexToRgba('#EF4444'));
            // Chat Bubble
            $mainShapes[] = createRectShape(0, -10, 48, 34, 10, $a);
            $mainShapes[] = createEllipseShape(-10, -10, 5, 5, $w);
            $mainShapes[] = createEllipseShape(0, -10, 5, 5, $w);
            $mainShapes[] = createEllipseShape(10, -10, 5, 5, $w);
            break;

        case 'top-performers':
            // Leaderboard 1-2-3 Podium with Gold Star
            $mainShapes[] = createRectShape(0, 18, 38, 54, 5, $a); // 1st
            $mainShapes[] = createRectShape(-36, 28, 34, 34, 5, hexToRgba('#94A3B8')); // 2nd
            $mainShapes[] = createRectShape(36, 34, 34, 22, 5, hexToRgba('#CD7F32')); // 3rd
            // Gold Star atop 1st
            $mainShapes[] = createStarShape(0, -22, 5, 8, 20, $a);
            $mainShapes[] = createEllipseShape(0, -22, 8, 8, $w);
            break;

        case 'manuale':
            // Theory Manual Guide Book with Bookmark
            $mainShapes[] = createRectShape(0, 0, 78, 102, 10, $p);
            $mainShapes[] = createRectShape(-28, 0, 14, 102, 4, $dark);
            $mainShapes[] = createRectShape(8, 0, 50, 88, 6, $w);
            // Guide text lines
            $mainShapes[] = createRectShape(8, -26, 36, 12, 4, $a);
            $mainShapes[] = createRectShape(8, -8, 36, 5, 2, hexToRgba('#94A3B8'));
            $mainShapes[] = createRectShape(8, 4, 36, 5, 2, hexToRgba('#CBD5E1'));
            $mainShapes[] = createRectShape(8, 16, 36, 5, 2, hexToRgba('#CBD5E1'));
            // Red bookmark hanging
            $mainShapes[] = createRectShape(-6, 44, 12, 22, 3, hexToRgba('#EF4444'));
            break;

        case 'patente-social':
            // Social Network Chat Nodes & Hearts
            $mainShapes[] = createRectShape(-16, -14, 56, 42, 12, $p);
            $mainShapes[] = createRectShape(18, 12, 52, 38, 10, $s);
            // Floating Heart
            $mainShapes[] = createStarShape(-16, -14, 4, 4, 10, $w);
            $mainShapes[] = createStarShape(18, 12, 4, 3, 8, $w);
            // Notification Badge
            $mainShapes[] = createEllipseShape(38, -22, 18, 18, hexToRgba('#EF4444'));
            $mainShapes[] = createStarShape(38, -22, 4, 2, 6, $w);
            break;

        case 'translation':
            // Dual Language Globe 'A' <-> '文'
            $mainShapes[] = createEllipseShape(0, 0, 84, 84, $p);
            // Latitude lines
            $mainShapes[] = createEllipseShape(0, 0, 84, 34, hexToRgba('#000000', 0), hexToRgba('#FFFFFF', 0.4), 3);
            $mainShapes[] = createRectShape(-20, -10, 26, 26, 6, $w);
            $mainShapes[] = createRectShape(20, 10, 26, 26, 6, $a);
            $mainShapes[] = createStarShape(-20, -10, 3, 4, 8, $p);
            $mainShapes[] = createStarShape(20, 10, 4, 3, 7, $w);
            break;

        default:
            $mainShapes[] = createEllipseShape(0, 0, 80, 80, $p);
            $mainShapes[] = createStarShape(0, 0, 5, 10, 24, $w);
            break;
    }

    // Add Main Hero Shape Layer with smooth floating & gentle breathing animation
    $layers[] = [
        "ddd" => 0,
        "ind" => count($layers) + 1,
        "ty" => 4,
        "nm" => "Main Hero Icon",
        "sr" => 1,
        "ks" => [
            "o" => ["a" => 0, "k" => 100],
            "r" => createKeyframeProperty([-1.5], [1.5], [-1.5]),
            "p" => createKeyframeProperty([150, 110, 0], [150, 100, 0], [150, 110, 0]),
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => createKeyframeProperty([97, 97, 100], [103, 103, 100], [97, 97, 100])
        ],
        "shapes" => $mainShapes,
        "ip" => 0,
        "op" => 60,
        "st" => 0
    ];

    return [
        "v" => "5.7.4",
        "fr" => 30,
        "ip" => 0,
        "op" => 60,
        "w" => 300,
        "h" => 220,
        "nm" => $name,
        "ddd" => 0,
        "assets" => [],
        "layers" => $layers
    ];
}

// Generate for all screens
$configs = [
    'lezioni' => ['Lezioni Video', '#2563EB', '#3B82F6', '#F59E0B'],
    'test' => ['Practice Test', '#059669', '#10B981', '#F59E0B'],
    'argomenti' => ['Argomenti Topics', '#7C3AED', '#8B5CF6', '#EC4899'],
    'eclass' => ['Live E-Class', '#DC2626', '#EF4444', '#F59E0B'],
    'sfida' => ['Quiz Sfida', '#D97706', '#F59E0B', '#10B981'],
    'scheda-esame' => ['Scheda Esame', '#0284C7', '#0EA5E9', '#F59E0B'],
    'words' => ['Glossary Word', '#0D9488', '#14B8A6', '#F59E0B'],
    'dizionario' => ['Dizionario Word', '#0D9488', '#14B8A6', '#F59E0B'],
    'dictionary' => ['Dictionary Search', '#0284C7', '#38BDF8', '#F59E0B'],
    'cartelli' => ['Traffic Cartelli', '#EA580C', '#F97316', '#DC2626'],
    'saved-mcqs' => ['Saved MCQs', '#2563EB', '#60A5FA', '#F59E0B'],
    'noted-mcqs' => ['Noted MCQs', '#059669', '#34D399', '#F59E0B'],
    'correct-mcqs' => ['Correct MCQs', '#16A34A', '#22C55E', '#86EFAC'],
    'wrong-mcqs' => ['Wrong MCQs', '#DC2626', '#EF4444', '#FCA5A5'],
    'support' => ['Customer Support', '#4F46E5', '#6366F1', '#EC4899'],
    'top-performers' => ['Top Performers', '#D97706', '#F59E0B', '#6366F1'],
    'manuale' => ['Manuale Theory', '#1D4ED8', '#3B82F6', '#10B981'],
    'patente-social' => ['Patente Social', '#DB2777', '#EC4899', '#8B5CF6'],
    'translation' => ['Translation Voice', '#9333EA', '#A855F7', '#3B82F6']
];

$cards = HomeCard::all();
echo "Regenerating customized rich Bodymovin Lottie animations for " . $cards->count() . " cards...\n";

foreach ($cards as $card) {
    $sk = strtolower($card->screen_key);
    $cfg = $configs[$sk] ?? ['Home Service', '#3B82F6', '#60A5FA', '#F59E0B'];
    
    $filename = 'lottie_' . str_replace(['-', ' '], '_', $sk) . '.json';
    $filePath = $lottieDir . '/' . $filename;
    
    $lottieData = generateLottieForScreen($sk, $cfg[0], $cfg[1], $cfg[2], $cfg[3]);
    file_put_contents($filePath, json_encode($lottieData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    
    $relativeUrl = '/uploads/cards/lottie/' . $filename;
    
    $card->media_type = 'lottie';
    $card->lottie_url = $relativeUrl;
    $card->save();
    
    echo "✔ Card ID: {$card->id} ({$card->title}) updated: {$relativeUrl}\n";
}

echo "\nDone!\n";
