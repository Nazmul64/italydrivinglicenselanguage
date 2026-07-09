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

        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'admin',
                'password' => bcrypt('admin@gmail.com')
            ]
        );

        // Seed 7000 Patente questions from JSON file if table is empty
        if (\App\Models\Question::count() === 0) {
            $jsonPath = database_path('data/questions.json');
            if (file_exists($jsonPath)) {
                $json = file_get_contents($jsonPath);
                $questions = json_decode($json, true);
                if (is_array($questions)) {
                    $chunks = array_chunk($questions, 500);
                    foreach ($chunks as $chunk) {
                        $insertData = [];
                        foreach ($chunk as $q) {
                            $insertData[] = [
                                'chapter' => $q['chapter'],
                                'chapter_name' => $q['chapterName'] ?? '',
                                'italian' => $q['italian'],
                                'bangla' => $q['bangla'],
                                'is_vero' => $q['isVero'] ? 1 : 0,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                        \Illuminate\Support\Facades\DB::table('questions')->insert($insertData);
                    }
                }
            }
        }
        // Seed initial driving categories
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
}
