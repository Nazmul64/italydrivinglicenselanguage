<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#3b82f6">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Italy Bangla Patente">
    <link rel="manifest" href="{{ asset('manifest.json') }}">
    <title>{{ $gSettings->app_name }}</title>
    @if($gSettings->favicon)
        <link rel="icon" type="image/x-icon" href="{{ asset($gSettings->favicon) }}">
    @endif
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- External CSS Separated Asset -->
    <link rel="stylesheet" href="{{ asset('css/frontend/style.css') }}?v={{ time() }}">

    <!-- Dynamic Layout & Neumorphism Color Configuration from Admin Panel -->
    @php
        $primColor = $gSettings->primary_color ?? '#F4F7FA';
        $accColor  = $gSettings->accent_color ?? '#4CAF50';
        $txtColor  = $gSettings->text_color ?? '#1e293b';

        // Calculate Neumorphic dark and light shadows
        $hex = ltrim($primColor, '#');
        if (strlen($hex) == 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        $r = hexdec(strlen($hex) >= 2 ? substr($hex, 0, 2) : 'F4');
        $g = hexdec(strlen($hex) >= 4 ? substr($hex, 2, 2) : 'F7');
        $b = hexdec(strlen($hex) >= 6 ? substr($hex, 4, 2) : 'FA');

        // Dark shadow (14% darker)
        $dr = max(0, (int)($r * 0.86));
        $dg = max(0, (int)($g * 0.86));
        $db = max(0, (int)($b * 0.86));
        $darkShadow = sprintf("#%02x%02x%02x", $dr, $dg, $db);

        // Light shadow (15% lighter or max 255)
        $lr = min(255, (int)($r * 1.12) + 20);
        $lg = min(255, (int)($g * 1.12) + 20);
        $lb = min(255, (int)($b * 1.12) + 20);
        $lightShadow = sprintf("#%02x%02x%02x", $lr, $lg, $lb);
    @endphp
    <style id="dynamic-admin-layout-styles">
        :root {
            --home-desk-cols: {{ $gSettings->home_desktop_columns ?? 4 }};
            --home-tab-cols: {{ $gSettings->home_tablet_columns ?? 3 }};
            --home-mob-cols: {{ $gSettings->home_mobile_columns ?? 2 }};
            --home-card-w: {{ !empty($gSettings->home_card_width) ? (is_numeric($gSettings->home_card_width) ? $gSettings->home_card_width . 'px' : $gSettings->home_card_width) : '100%' }};
            --home-card-h: {{ !empty($gSettings->home_card_height) ? (is_numeric($gSettings->home_card_height) ? $gSettings->home_card_height . 'px' : $gSettings->home_card_height) : 'auto' }};
            --home-card-gap-px: {{ ($gSettings->home_card_gap ?? 24) . 'px' }};
            --schede-desk-cols: {{ $gSettings->schede_desktop_columns ?? 2 }};
            --schede-mob-cols: {{ $gSettings->schede_mobile_columns ?? 1 }};

            --home-icon-size-desk: {{ ($gSettings->icon_size_desktop ?? 90) . 'px' }};
            --home-icon-size-mob: {{ ($gSettings->icon_size_mobile ?? 60) . 'px' }};
            --home-title-size-desk: {{ ($gSettings->title_font_size_desktop ?? 16) . 'px' }};
            --home-title-size-mob: {{ ($gSettings->title_font_size_mobile ?? 14) . 'px' }};
            --home-subtitle-size-desk: {{ ($gSettings->subtitle_font_size_desktop ?? 12) . 'px' }};
            --home-subtitle-size-mob: {{ ($gSettings->subtitle_font_size_mobile ?? 11) . 'px' }};

            --cartelli-chap-title-desk: {{ ($gSettings->cartelli_chapter_title_font_desktop ?? 16) . 'px' }};
            --cartelli-chap-title-mob: {{ ($gSettings->cartelli_chapter_title_font_mobile ?? 14) . 'px' }};
            --cartelli-chap-img-desk: {{ ($gSettings->cartelli_chapter_image_size_desktop ?? 120) . 'px' }};
            --cartelli-chap-img-mob: {{ ($gSettings->cartelli_chapter_image_size_mobile ?? 80) . 'px' }};
            --cartelli-chap-img-w-desk: {{ !empty($gSettings->cartelli_chapter_image_width_desktop) ? (is_numeric($gSettings->cartelli_chapter_image_width_desktop) ? $gSettings->cartelli_chapter_image_width_desktop . 'px' : $gSettings->cartelli_chapter_image_width_desktop) : 'auto' }};
            --cartelli-chap-img-w-mob: {{ !empty($gSettings->cartelli_chapter_image_width_mobile) ? (is_numeric($gSettings->cartelli_chapter_image_width_mobile) ? $gSettings->cartelli_chapter_image_width_mobile . 'px' : $gSettings->cartelli_chapter_image_width_mobile) : 'auto' }};

            --cartelli-page-title-desk: {{ ($gSettings->cartelli_page_title_font_desktop ?? 15) . 'px' }};
            --cartelli-page-title-mob: {{ ($gSettings->cartelli_page_title_font_mobile ?? 13) . 'px' }};
            --cartelli-page-img-desk: {{ ($gSettings->cartelli_page_image_size_desktop ?? 120) . 'px' }};
            --cartelli-page-img-mob: {{ ($gSettings->cartelli_page_image_size_mobile ?? 80) . 'px' }};
            --cartelli-page-img-w-desk: {{ !empty($gSettings->cartelli_page_image_width_desktop) ? (is_numeric($gSettings->cartelli_page_image_width_desktop) ? $gSettings->cartelli_page_image_width_desktop . 'px' : $gSettings->cartelli_page_image_width_desktop) : 'auto' }};
            --cartelli-page-img-w-mob: {{ !empty($gSettings->cartelli_page_image_width_mobile) ? (is_numeric($gSettings->cartelli_page_image_width_mobile) ? $gSettings->cartelli_page_image_width_mobile . 'px' : $gSettings->cartelli_page_image_width_mobile) : 'auto' }};

            --argomenti-chap-title-desk: {{ ($gSettings->argomenti_chapter_title_font_desktop ?? 16) . 'px' }};
            --argomenti-chap-title-mob: {{ ($gSettings->argomenti_chapter_title_font_mobile ?? 14) . 'px' }};
            --argomenti-chap-img-desk: {{ ($gSettings->argomenti_chapter_image_size_desktop ?? 120) . 'px' }};
            --argomenti-chap-img-mob: {{ ($gSettings->argomenti_chapter_image_size_mobile ?? 80) . 'px' }};
            --argomenti-chap-img-w-desk: {{ !empty($gSettings->argomenti_chapter_image_width_desktop) ? (is_numeric($gSettings->argomenti_chapter_image_width_desktop) ? $gSettings->argomenti_chapter_image_width_desktop . 'px' : $gSettings->argomenti_chapter_image_width_desktop) : 'auto' }};
            --argomenti-chap-img-w-mob: {{ !empty($gSettings->argomenti_chapter_image_width_mobile) ? (is_numeric($gSettings->argomenti_chapter_image_width_mobile) ? $gSettings->argomenti_chapter_image_width_mobile . 'px' : $gSettings->argomenti_chapter_image_width_mobile) : 'auto' }};

            --argomenti-page-title-desk: {{ ($gSettings->argomenti_page_title_font_desktop ?? 15) . 'px' }};
            --argomenti-page-title-mob: {{ ($gSettings->argomenti_page_title_font_mobile ?? 13) . 'px' }};
            --argomenti-page-img-desk: {{ ($gSettings->argomenti_page_image_size_desktop ?? 120) . 'px' }};
            --argomenti-page-img-mob: {{ ($gSettings->argomenti_page_image_size_mobile ?? 80) . 'px' }};
            --argomenti-page-img-w-desk: {{ !empty($gSettings->argomenti_page_image_width_desktop) ? (is_numeric($gSettings->argomenti_page_image_width_desktop) ? $gSettings->argomenti_page_image_width_desktop . 'px' : $gSettings->argomenti_page_image_width_desktop) : 'auto' }};
            --argomenti-page-img-w-mob: {{ !empty($gSettings->argomenti_page_image_width_mobile) ? (is_numeric($gSettings->argomenti_page_image_width_mobile) ? $gSettings->argomenti_page_image_width_mobile . 'px' : $gSettings->argomenti_page_image_width_mobile) : 'auto' }};

            --argomenti-q-text-desk: {{ ($gSettings->argomenti_question_text_font_desktop ?? 15) . 'px' }};
            --argomenti-q-text-mob: {{ ($gSettings->argomenti_question_text_font_mobile ?? 13) . 'px' }};

            --custom-bg-card: {{ $primColor }};
            --custom-accent: {{ $accColor }};
            --custom-text: {{ $txtColor }};
            --custom-shadow-dark: {{ $darkShadow }};
            --custom-shadow-light: {{ $lightShadow }};
        }

        .nav-card,
        .content-card,
        .chapter-image-card {
            background-color: var(--custom-bg-card) !important;
            box-shadow: 8px 8px 18px var(--custom-shadow-dark), -8px -8px 18px var(--custom-shadow-light) !important;
        }

        .nav-card:hover,
        .content-card:hover,
        .chapter-image-card:hover {
            box-shadow: 12px 12px 26px var(--custom-shadow-dark), -12px -12px 26px var(--custom-shadow-light) !important;
        }

        .nav-card .illustration-box,
        .nav-card .fallback-icon-box {
            width: var(--home-icon-size-desk) !important;
            height: var(--home-icon-size-desk) !important;
        }

        .nav-card .card-title {
            font-size: var(--home-title-size-desk) !important;
            color: var(--custom-text, var(--text-primary));
        }

        .nav-card .card-subtitle {
            font-size: var(--home-subtitle-size-desk) !important;
        }

        .chapter-image-card h3,
        .chapter-image-card .card-title,
        .chapter-card-header h3 {
            font-size: var(--cartelli-chap-title-desk) !important;
        }

        .content-card h4,
        .content-card .card-title,
        .schede-page-title {
            font-size: var(--cartelli-page-title-desk) !important;
        }

        #screen-cartelli .chapter-image-card img,
        #screen-cartelli .chapter-card-img {
            max-height: var(--cartelli-chap-img-desk) !important;
            height: var(--cartelli-chap-img-desk) !important;
            width: var(--cartelli-chap-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-cartelli-schede .content-card img,
        #screen-cartelli-schede .schede-page-img {
            max-height: var(--cartelli-page-img-desk) !important;
            height: var(--cartelli-page-img-desk) !important;
            width: var(--cartelli-page-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti .chapter-image-card h3,
        #screen-argomenti .chapter-card-header h3 {
            font-size: var(--argomenti-chap-title-desk) !important;
        }

        #screen-argomenti .chapter-image-card img,
        #screen-argomenti .chapter-card-img {
            max-height: var(--argomenti-chap-img-desk) !important;
            height: var(--argomenti-chap-img-desk) !important;
            width: var(--argomenti-chap-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti-schede .content-card h4,
        #screen-argomenti-schede .schede-page-title {
            font-size: var(--argomenti-page-title-desk) !important;
        }

        #screen-argomenti-schede .content-card img,
        #screen-argomenti-schede .schede-page-img {
            max-height: var(--argomenti-page-img-desk) !important;
            height: var(--argomenti-page-img-desk) !important;
            width: var(--argomenti-page-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti-questions .question-text-box,
        #screen-argomenti-questions .question-italian-text {
            font-size: var(--argomenti-q-text-desk) !important;
        }

        .services-grid {
            display: grid !important;
            grid-template-columns: repeat(var(--home-desk-cols), 1fr) !important;
            gap: var(--home-card-gap-px) !important;
            width: 100% !important;
        }

        .services-grid .nav-card {
            width: var(--home-card-w) !important;
            min-height: var(--home-card-h) !important;
            box-sizing: border-box !important;
        }

        .argomenti-grid,
        .argomenti-schede-grid {
            display: grid !important;
            grid-template-columns: repeat(var(--schede-desk-cols), 1fr) !important;
            gap: 16px !important;
            width: 100% !important;
        }

        @media (max-width: 1024px) {
            .services-grid {
                grid-template-columns: repeat(var(--home-tab-cols), 1fr) !important;
            }
        }

        @media (max-width: 640px) {
            .services-grid {
                grid-template-columns: repeat(var(--home-mob-cols), 1fr) !important;
            }
            .argomenti-grid,
            .argomenti-schede-grid {
                grid-template-columns: repeat(var(--schede-mob-cols), 1fr) !important;
            }

            .nav-card .illustration-box,
            .nav-card .fallback-icon-box {
                width: var(--home-icon-size-mob) !important;
                height: var(--home-icon-size-mob) !important;
            }

            .nav-card .card-title {
                font-size: var(--home-title-size-mob) !important;
            }

            .nav-card .card-subtitle {
                font-size: var(--home-subtitle-size-mob) !important;
            }

            .chapter-image-card h3,
            .chapter-image-card .card-title,
            .chapter-card-header h3 {
                font-size: var(--cartelli-chap-title-mob) !important;
            }

            .content-card h4,
            .content-card .card-title,
            .schede-page-title {
                font-size: var(--cartelli-page-title-mob) !important;
            }

            #screen-cartelli .chapter-image-card img,
            #screen-cartelli .chapter-card-img {
                max-height: var(--cartelli-chap-img-mob) !important;
                height: var(--cartelli-chap-img-mob) !important;
                width: var(--cartelli-chap-img-w-mob) !important;
            }

            #screen-cartelli-schede .content-card img,
            #screen-cartelli-schede .schede-page-img {
                max-height: var(--cartelli-page-img-mob) !important;
                height: var(--cartelli-page-img-mob) !important;
                width: var(--cartelli-page-img-w-mob) !important;
            }

            #screen-argomenti .chapter-image-card h3,
            #screen-argomenti .chapter-card-header h3 {
                font-size: var(--argomenti-chap-title-mob) !important;
            }

            #screen-argomenti .chapter-image-card img,
            #screen-argomenti .chapter-card-img {
                max-height: var(--argomenti-chap-img-mob) !important;
                height: var(--argomenti-chap-img-mob) !important;
                width: var(--argomenti-chap-img-w-mob) !important;
            }

            #screen-argomenti-schede .content-card h4,
            #screen-argomenti-schede .schede-page-title {
                font-size: var(--argomenti-page-title-mob) !important;
            }

            #screen-argomenti-schede .content-card img,
            #screen-argomenti-schede .schede-page-img {
                max-height: var(--argomenti-page-img-mob) !important;
                height: var(--argomenti-page-img-mob) !important;
                width: var(--argomenti-page-img-w-mob) !important;
            }

            #screen-argomenti-questions .question-text-box,
            #screen-argomenti-questions .question-italian-text {
                font-size: var(--argomenti-q-text-mob) !important;
            }
        }
    </style>
</head>
<body>
