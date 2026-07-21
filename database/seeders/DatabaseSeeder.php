<?php

namespace Database\Seeders;

use App\Models\User;
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
        // User::factory(10)->create();

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

        // Seed initial driving categories
        if (\App\Models\Category::count() === 0) {
            \App\Models\Category::create([
                'name' => 'Patente AM',
                'description' => 'Moped and light quadricycles theory questions.',
            ]);
            \App\Models\Category::create([
                'name' => 'Patente B',
                'description' => 'Passenger car and light commercial vehicle theory questions.',
            ]);
            \App\Models\Category::create([
                'name' => 'Patente C',
                'description' => 'Heavy truck and freight vehicle theory questions.',
            ]);
        }

        // Seed Banner Sliders
        if (\App\Models\Slider::count() === 0) {
            $sliders = [
                [
                    'title' => 'সহজে ড্রাইভিং লাইসেন্স পাস করুন',
                    'subtitle' => 'ইতালিয়ান ড্রাইভিং লাইসেন্স গাইড',
                    'image_url' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop',
                    'link_url' => '#'
                ],
                [
                    'title' => 'সব ট্রাফিক সাইন জানুন',
                    'subtitle' => 'গুরুত্বপূর্ণ সংকেতসমূহের বিস্তারিত ব্যাখ্যা',
                    'image_url' => 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop',
                    'link_url' => '#'
                ],
                [
                    'title' => 'অনলাইন লেকচার ও ক্লাস',
                    'subtitle' => 'ভিডিও টিউটোরিয়ালের সাথে থিওরি শিখুন',
                    'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop',
                    'link_url' => '#'
                ],
                [
                    'title' => 'পরীক্ষার সঠিক প্রস্তুতি নিন',
                    'subtitle' => 'আনলিমিটেড এক্সাম সিমুলেশন কুইজ',
                    'image_url' => 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&auto=format&fit=crop',
                    'link_url' => '#'
                ]
            ];
            foreach ($sliders as $s) {
                \App\Models\Slider::create($s);
            }
        }

        // Seed Home Navigation Cards
        if (\App\Models\HomeCard::count() === 0) {
            $cards = [
                [
                    'title' => 'Lezioni',
                    'subtitle' => 'Classes',
                    'screen_key' => 'lezioni',
                    'icon_class' => 'fa-solid fa-video',
                    'icon_color' => '#3B82F6',
                    'order_index' => 1
                ],
                [
                    'title' => 'Test',
                    'subtitle' => 'Practice Test',
                    'screen_key' => 'test',
                    'icon_class' => 'fa-solid fa-laptop-code',
                    'icon_color' => '#475569',
                    'order_index' => 2
                ],
                [
                    'title' => 'ARGOMENTI',
                    'subtitle' => 'TOPICS',
                    'screen_key' => 'argomenti',
                    'icon_class' => 'fa-solid fa-graduation-cap',
                    'icon_color' => '#8B5CF6',
                    'order_index' => 3
                ],
                [
                    'title' => 'E-Class',
                    'subtitle' => 'E-Class',
                    'screen_key' => 'eclass',
                    'icon_class' => 'fa-solid fa-chalkboard-user',
                    'icon_color' => '#06B6D4',
                    'order_index' => 4
                ],
                [
                    'title' => 'Sfida',
                    'subtitle' => 'Challenge',
                    'screen_key' => 'sfida',
                    'icon_class' => 'fa-solid fa-trophy',
                    'icon_color' => '#F59E0B',
                    'order_index' => 5
                ],
                [
                    'title' => 'Scheda Esame',
                    'subtitle' => 'Exam Test',
                    'screen_key' => 'scheda-esame',
                    'icon_class' => 'fa-solid fa-file-signature',
                    'icon_color' => '#F43F5E',
                    'order_index' => 6
                ],
                [
                    'title' => 'Dizionario',
                    'subtitle' => 'Dictionary',
                    'screen_key' => 'dizionario',
                    'icon_class' => 'fa-solid fa-book-open',
                    'icon_color' => '#10B981',
                    'order_index' => 7
                ],
                [
                    'title' => 'Cartelli',
                    'subtitle' => 'Traffic Signs',
                    'screen_key' => 'cartelli',
                    'icon_class' => 'fa-solid fa-map-signs',
                    'icon_color' => '#F97316',
                    'order_index' => 8
                ],
                [
                    'title' => 'Saved MCQs',
                    'subtitle' => 'Bookmarks',
                    'screen_key' => 'saved-mcqs',
                    'icon_class' => 'fa-solid fa-bookmark',
                    'icon_color' => '#EF4444',
                    'order_index' => 9
                ]
            ];
            foreach ($cards as $c) {
                \App\Models\HomeCard::create($c);
            }
        }

        // Seed Lecture Classes (Videos)
        if (\App\Models\LectureClass::count() === 0) {
            $lectures = [
                [
                    'title' => 'Capitolo 1: Definizione della strada',
                    'duration' => '১২ মিনিট',
                    'thumbnail_url' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150',
                    'video_url' => 'https://www.w3schools.com/html/mov_bbb.mp4'
                ],
                [
                    'title' => 'Capitolo 2: I Segnali di Pericolo',
                    'duration' => '১৮ মিনিট',
                    'thumbnail_url' => 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=150',
                    'video_url' => 'https://www.w3schools.com/html/mov_bbb.mp4'
                ],
                [
                    'title' => 'Capitolo 3: Segnali di Divieto',
                    'duration' => '১৫ মিনিট',
                    'thumbnail_url' => 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=150',
                    'video_url' => 'https://www.w3schools.com/html/mov_bbb.mp4'
                ]
            ];
            foreach ($lectures as $l) {
                \App\Models\LectureClass::create($l);
            }
        }

        // Seed Live Classes
        if (\App\Models\LiveClass::count() === 0) {
            \App\Models\LiveClass::create([
                'title' => 'পরবর্তী লাইভ ক্লাস আজ রাত ৯:০০ টায়',
                'subtitle' => 'অধ্যায় ৪: অগ্রাধিকার নিয়ম (Precedenza)',
                'scheduled_at' => now()->setHour(21)->setMinute(0)->setSecond(0),
                'room_link' => 'https://meet.google.com/abc-defg-hij'
            ]);
        }
    }
}
