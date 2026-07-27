<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'app_name',
        'app_logo',
        'favicon',
        'exam_time_minutes',
        'home_desktop_columns',
        'home_tablet_columns',
        'home_mobile_columns',
        'home_card_width',
        'home_card_height',
        'home_card_gap',
        'schede_desktop_columns',
        'schede_mobile_columns',
        'primary_color',
        'accent_color',
        'text_color',
        'icon_size_desktop',
        'icon_size_mobile',
        'title_font_size_desktop',
        'title_font_size_mobile',
        'subtitle_font_size_desktop',
        'subtitle_font_size_mobile',
        'cartelli_chapter_title_font_desktop',
        'cartelli_chapter_title_font_mobile',
        'cartelli_page_title_font_desktop',
        'cartelli_page_title_font_mobile',
        'cartelli_page_image_size_desktop',
        'cartelli_page_image_size_mobile',
        'argomenti_chapter_title_font_desktop',
        'argomenti_chapter_title_font_mobile',
        'argomenti_page_title_font_desktop',
        'argomenti_page_title_font_mobile',
        'argomenti_question_text_font_desktop',
        'argomenti_question_text_font_mobile',
        'cartelli_chapter_image_size_desktop',
        'cartelli_chapter_image_size_mobile',
        'argomenti_chapter_image_size_desktop',
        'argomenti_chapter_image_size_mobile',
        'argomenti_page_image_size_desktop',
        'argomenti_page_image_size_mobile',
        'cartelli_chapter_image_width_desktop',
        'cartelli_chapter_image_width_mobile',
        'cartelli_page_image_width_desktop',
        'cartelli_page_image_width_mobile',
        'argomenti_chapter_image_width_desktop',
        'argomenti_chapter_image_width_mobile',
        'argomenti_page_image_width_desktop',
        'argomenti_page_image_width_mobile',
        'license_message',
    ];
}
