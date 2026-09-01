<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HomeCard;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'admin',
                'password' => bcrypt('admin@gmail.com'),
                'role' => 'super_admin'
            ]
        );
        if ($admin->role !== 'super_admin') {
            $admin->update(['role' => 'super_admin']);
        }

        // Default Application Setting
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            ['app_name' => 'Italy Bangla Patente']
        );
        $setting->update([
            'license_message' => "Apnake license key dewa hoise, click kore active korun. thanks \n\ncall +39 351 155 4016 for info\n\n\nMaruf - M Bangla Patente Team"
        ]);

        // ONLY Homepage Cards Seeder
        HomeCard::truncate();
        $cards = [
            [
                'title' => 'Lezioni',
                'subtitle' => 'ক্লাস ভিডিও',
                'screen_key' => 'lezioni',
                'icon_class' => 'fa-solid fa-video',
                'icon_color' => '#3B82F6',
                'order_index' => 1
            ],
            [
                'title' => 'Test',
                'subtitle' => 'অনুশীলন টেস্ট',
                'screen_key' => 'test',
                'icon_class' => 'fa-solid fa-laptop-code',
                'icon_color' => '#475569',
                'order_index' => 2
            ],
            [
                'title' => 'ARGOMENTI',
                'subtitle' => 'অধ্যায়সমূহ',
                'screen_key' => 'argomenti',
                'icon_class' => 'fa-solid fa-graduation-cap',
                'icon_color' => '#8B5CF6',
                'order_index' => 3
            ],
            [
                'title' => 'E-Class',
                'subtitle' => 'অনলাইন ক্লাস',
                'screen_key' => 'eclass',
                'icon_class' => 'fa-solid fa-chalkboard-user',
                'icon_color' => '#06B6D4',
                'order_index' => 4
            ],
            [
                'title' => 'Sfida',
                'subtitle' => 'চ্যালেঞ্জ',
                'screen_key' => 'sfida',
                'icon_class' => 'fa-solid fa-trophy',
                'icon_color' => '#F59E0B',
                'order_index' => 5
            ],
            [
                'title' => 'Scheda Esame',
                'subtitle' => 'পরীক্ষার শিট',
                'screen_key' => 'scheda-esame',
                'icon_class' => 'fa-solid fa-file-signature',
                'icon_color' => '#F43F5E',
                'order_index' => 6
            ],
            [
                'title' => 'Dizionario',
                'subtitle' => 'অভিধান',
                'screen_key' => 'dizionario',
                'icon_class' => 'fa-solid fa-book-open',
                'icon_color' => '#10B981',
                'order_index' => 7
            ],
            [
                'title' => 'Cartelli',
                'subtitle' => 'ট্রাফিক সাইন',
                'screen_key' => 'cartelli',
                'icon_class' => 'fa-solid fa-map-signs',
                'icon_color' => '#F97316',
                'order_index' => 8
            ],
            [
                'title' => 'Saved MCQs',
                'subtitle' => 'সেভ করা এমসিকিউ',
                'screen_key' => 'saved-mcqs',
                'icon_class' => 'fa-solid fa-bookmark',
                'icon_color' => '#EF4444',
                'order_index' => 9
            ],
            [
                'title' => 'Correct MCQs',
                'subtitle' => 'সঠিক এমসিকিউ',
                'screen_key' => 'correct-mcqs',
                'icon_class' => 'fa-solid fa-circle-check',
                'icon_color' => '#22C55E',
                'order_index' => 10
            ],
            [
                'title' => 'Wrong MCQs',
                'subtitle' => 'ভুল এমসিকিউ',
                'screen_key' => 'wrong-mcqs',
                'icon_class' => 'fa-solid fa-circle-xmark',
                'icon_color' => '#EF4444',
                'order_index' => 11
            ],
            [
                'title' => 'Support',
                'subtitle' => 'লাইভ চ্যাট',
                'screen_key' => 'support',
                'icon_class' => 'fa-solid fa-headset',
                'icon_color' => '#0EA5E9',
                'order_index' => 12
            ],
            [
                'title' => 'Top Performers',
                'subtitle' => 'সেরা শিক্ষার্থী র‍্যাংকিং',
                'screen_key' => 'top-performers',
                'icon_class' => 'fa-solid fa-ranking-star',
                'icon_color' => '#F59E0B',
                'order_index' => 13,
                'status' => 1
            ],
            [
                'title' => 'Manuale',
                'subtitle' => 'ম্যানুয়াল থিওরি বই',
                'screen_key' => 'manuale',
                'icon_class' => 'fa-solid fa-book-bookmark',
                'icon_color' => '#2563EB',
                'order_index' => 14,
                'status' => 1
            ],
            [
                'title' => 'Patente Social',
                'subtitle' => 'কমিউনিটি সোশ্যাল ফিড',
                'screen_key' => 'patente-social',
                'icon_class' => 'fa-solid fa-users',
                'icon_color' => '#8B5CF6',
                'order_index' => 15,
                'status' => 1
            ],
            [
                'title' => 'Translation',
                'subtitle' => 'অনুবাদ ও সঠিক উচ্চারণ',
                'screen_key' => 'translation',
                'icon_class' => 'fa-solid fa-language',
                'icon_color' => '#0284C7',
                'order_index' => 16,
                'status' => 1
            ]
        ];
        foreach ($cards as $c) {
            $c['status'] = 1;
            HomeCard::create($c);
        }

        // Default Categories
        if (\App\Models\Category::count() === 0) {
            $categories = [
                ['name' => 'Patente B', 'description' => 'Patente di Guida Categoria B'],
                ['name' => 'Patente A', 'description' => 'Patente di Guida Categoria A'],
                ['name' => 'Patente AM', 'description' => 'Patente di Guida Categoria AM'],
                ['name' => 'Patente C', 'description' => 'Patente di Guida Categoria C'],
                ['name' => 'Patente D', 'description' => 'Patente di Guida Categoria D'],
            ];
            foreach ($categories as $cat) {
                \App\Models\Category::create($cat);
            }
        }
    }
}
