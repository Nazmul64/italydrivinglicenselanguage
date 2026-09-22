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

// Helper to create 100% compliant, rich Bodymovin smooth vector animation JSON
function generateCardLottie($name, $primaryHex, $secondaryHex, $accentHex, $iconType) {
    $hexToRgb = function($hex) {
        $hex = ltrim($hex, '#');
        if (strlen($hex) == 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        return [
            round(hexdec(substr($hex, 0, 2)) / 255, 3),
            round(hexdec(substr($hex, 2, 2)) / 255, 3),
            round(hexdec(substr($hex, 4, 2)) / 255, 3),
            1
        ];
    };

    $cPrimary = $hexToRgb($primaryHex);
    $cSecondary = $hexToRgb($secondaryHex);
    $cAccent = $hexToRgb($accentHex);
    $cWhite = [1, 1, 1, 1];
    $cBgSoft = [$cPrimary[0], $cPrimary[1], $cPrimary[2], 0.15];

    $layers = [];

    // Layer 1: Orbiting / Pulsing Sparkle 1 (Top Right)
    $layers[] = [
        "ddd" => 0,
        "ind" => 1,
        "ty" => 4,
        "nm" => "Sparkle Top Right",
        "sr" => 1,
        "ks" => [
            "o" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.8], "y" => [0.8]], "o" => ["x" => [0.2], "y" => [0.2]], "t" => 0, "s" => [40]],
                    ["i" => ["x" => [0.8], "y" => [0.8]], "o" => ["x" => [0.2], "y" => [0.2]], "t" => 30, "s" => [100]],
                    ["i" => ["x" => [0.8], "y" => [0.8]], "o" => ["x" => [0.2], "y" => [0.2]], "t" => 60, "s" => [40]]
                ]
            ],
            "r" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 0, "s" => [0]],
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 60, "s" => [180]]
                ]
            ],
            "p" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 0, "s" => [195, 45, 0]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 30, "s" => [200, 35, 0]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 60, "s" => [195, 45, 0]]
                ]
            ],
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 0, "s" => [75, 75, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 30, "s" => [125, 125, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 60, "s" => [75, 75, 100]]
                ]
            ]
        ],
        "shapes" => [
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "sr", "p" => ["a" => 0, "k" => [0, 0]], "r" => ["a" => 0, "k" => 4], "ir" => ["a" => 0, "k" => 3.5], "is" => ["a" => 0, "k" => 0], "or" => ["a" => 0, "k" => 9], "os" => ["a" => 0, "k" => 0], "sy" => 1],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cAccent], "o" => ["a" => 0, "k" => 100]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ]
        ],
        "ip" => 0,
        "op" => 60,
        "st" => 0
    ];

    // Layer 2: Main Floating Hero Icon / Card
    $layers[] = [
        "ddd" => 0,
        "ind" => 2,
        "ty" => 4,
        "nm" => "Main Hero Icon",
        "sr" => 1,
        "ks" => [
            "o" => ["a" => 0, "k" => 100],
            "r" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 0, "s" => [-2]],
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 30, "s" => [2]],
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 60, "s" => [-2]]
                ]
            ],
            "p" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.4, 0.4, 0.4], "y" => [1, 1, 1]], "o" => ["x" => [0.6, 0.6, 0.6], "y" => [0, 0, 0]], "t" => 0, "s" => [120, 120, 0]],
                    ["i" => ["x" => [0.4, 0.4, 0.4], "y" => [1, 1, 1]], "o" => ["x" => [0.6, 0.6, 0.6], "y" => [0, 0, 0]], "t" => 30, "s" => [120, 108, 0]],
                    ["i" => ["x" => [0.4, 0.4, 0.4], "y" => [1, 1, 1]], "o" => ["x" => [0.6, 0.6, 0.6], "y" => [0, 0, 0]], "t" => 60, "s" => [120, 120, 0]]
                ]
            ],
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 0, "s" => [98, 98, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 30, "s" => [104, 104, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 60, "s" => [98, 98, 100]]
                ]
            ]
        ],
        "shapes" => [
            // Outer squircle background
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "rc", "p" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [92, 92]], "r" => ["a" => 0, "k" => 28]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cPrimary], "o" => ["a" => 0, "k" => 100]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ],
            // Glossy highlight
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "rc", "p" => ["a" => 0, "k" => [0, -18]], "s" => ["a" => 0, "k" => [74, 38]], "r" => ["a" => 0, "k" => 18]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cWhite], "o" => ["a" => 0, "k" => 22]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ],
            // Inner white circular base
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "el", "p" => ["a" => 0, "k" => [0, 2]], "s" => ["a" => 0, "k" => [52, 52]]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cWhite], "o" => ["a" => 0, "k" => 92]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ],
            // Inner secondary ring
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "el", "p" => ["a" => 0, "k" => [0, 2]], "s" => ["a" => 0, "k" => [38, 38]]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cSecondary], "o" => ["a" => 0, "k" => 100]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ],
            // Inner center symbol dot
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "el", "p" => ["a" => 0, "k" => [0, 2]], "s" => ["a" => 0, "k" => [18, 18]]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cWhite], "o" => ["a" => 0, "k" => 100]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ]
        ],
        "ip" => 0,
        "op" => 60,
        "st" => 0
    ];

    // Layer 3: Soft Background Glow Ring (Pulsing)
    $layers[] = [
        "ddd" => 0,
        "ind" => 3,
        "ty" => 4,
        "nm" => "Soft Background Glow Ring",
        "sr" => 1,
        "ks" => [
            "o" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 0, "s" => [50]],
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 30, "s" => [90]],
                    ["i" => ["x" => [0.5], "y" => [1]], "o" => ["x" => [0.5], "y" => [0]], "t" => 60, "s" => [50]]
                ]
            ],
            "r" => ["a" => 0, "k" => 0],
            "p" => ["a" => 0, "k" => [120, 120, 0]],
            "a" => ["a" => 0, "k" => [0, 0, 0]],
            "s" => [
                "a" => 1,
                "k" => [
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 0, "s" => [94, 94, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 30, "s" => [118, 118, 100]],
                    ["i" => ["x" => [0.5, 0.5, 0.5], "y" => [1, 1, 1]], "o" => ["x" => [0.5, 0.5, 0.5], "y" => [0, 0, 0]], "t" => 60, "s" => [94, 94, 100]]
                ]
            ]
        ],
        "shapes" => [
            [
                "ty" => "gr",
                "it" => [
                    ["ty" => "el", "p" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [126, 126]]],
                    ["ty" => "fl", "c" => ["a" => 0, "k" => $cBgSoft], "o" => ["a" => 0, "k" => 100]],
                    ["ty" => "tr", "p" => ["a" => 0, "k" => [0, 0]], "a" => ["a" => 0, "k" => [0, 0]], "s" => ["a" => 0, "k" => [100, 100]], "r" => ["a" => 0, "k" => 0], "o" => ["a" => 0, "k" => 100]]
                ]
            ]
        ],
        "ip" => 0,
        "op" => 60,
        "st" => 0
    ];

    return [
        "v" => "5.7.4",
        "fr" => 30,
        "ip" => 0,
        "op" => 60,
        "w" => 240,
        "h" => 240,
        "nm" => $name,
        "ddd" => 0,
        "assets" => [],
        "layers" => $layers
    ];
}

// Config per screen
$configs = [
    'lezioni' => ['Lezioni Video', '#2563EB', '#3B82F6', '#F59E0B', 'video'],
    'test' => ['Practice Test', '#059669', '#10B981', '#F59E0B', 'test'],
    'argomenti' => ['Argomenti Topics', '#7C3AED', '#8B5CF6', '#EC4899', 'graduation'],
    'eclass' => ['Live E-Class', '#DC2626', '#EF4444', '#F59E0B', 'chalkboard'],
    'sfida' => ['Quiz Sfida', '#D97706', '#F59E0B', '#10B981', 'trophy'],
    'scheda-esame' => ['Scheda Esame', '#0284C7', '#0EA5E9', '#F59E0B', 'certificate'],
    'words' => ['Glossary Word', '#0D9488', '#14B8A6', '#F59E0B', 'book'],
    'dizionario' => ['Dizionario Word', '#0D9488', '#14B8A6', '#F59E0B', 'book'],
    'dictionary' => ['Dictionary Search', '#0284C7', '#38BDF8', '#F59E0B', 'search'],
    'cartelli' => ['Traffic Cartelli', '#EA580C', '#F97316', '#EF4444', 'sign'],
    'saved-mcqs' => ['Saved MCQs', '#2563EB', '#60A5FA', '#F59E0B', 'bookmark'],
    'noted-mcqs' => ['Noted MCQs', '#059669', '#34D399', '#F59E0B', 'note'],
    'correct-mcqs' => ['Correct MCQs', '#16A34A', '#22C55E', '#86EFAC', 'check'],
    'wrong-mcqs' => ['Wrong MCQs', '#DC2626', '#EF4444', '#FCA5A5', 'cross'],
    'support' => ['Customer Support', '#4F46E5', '#6366F1', '#EC4899', 'headset'],
    'top-performers' => ['Top Performers', '#D97706', '#F59E0B', '#6366F1', 'star'],
    'manuale' => ['Manuale Theory', '#1D4ED8', '#3B82F6', '#10B981', 'guide'],
    'patente-social' => ['Patente Social', '#DB2777', '#EC4899', '#8B5CF6', 'community'],
    'translation' => ['Translation Voice', '#9333EA', '#A855F7', '#3B82F6', 'translate']
];

$cards = HomeCard::all();
echo "Regenerating Lottie animations for " . $cards->count() . " cards...\n";

foreach ($cards as $card) {
    $sk = strtolower($card->screen_key);
    $cfg = $configs[$sk] ?? ['Home Service', '#3B82F6', '#60A5FA', '#F59E0B', 'general'];
    
    $filename = 'lottie_' . str_replace(['-', ' '], '_', $sk) . '.json';
    $filePath = $lottieDir . '/' . $filename;
    
    $lottieData = generateCardLottie($cfg[0], $cfg[1], $cfg[2], $cfg[3], $cfg[4]);
    file_put_contents($filePath, json_encode($lottieData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    
    $relativeUrl = '/uploads/cards/lottie/' . $filename;
    
    $card->media_type = 'lottie';
    $card->lottie_url = $relativeUrl;
    $card->save();
    
    echo "✔ Card ID: {$card->id} ({$card->title}) updated: {$relativeUrl}\n";
}

echo "\nDone!\n";
