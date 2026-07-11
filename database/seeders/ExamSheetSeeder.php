<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExamSheet;

class ExamSheetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear any existing worksheets
        ExamSheet::truncate();

        // Seed completed exams
        ExamSheet::create([
            'student_name' => 'RAHIM RAYHAN',
            'motorizzazione' => 'GENOVA',
            'exam_date' => '16/06/2026',
            'status' => 'completed',
            'correct_count' => 28,
            'wrong_count' => 2,
            'unanswered_count' => 0,
            'total_count' => 30,
            'answers' => [] // empty or mocked array
        ]);

        ExamSheet::create([
            'student_name' => 'RESMA MIREDULA',
            'motorizzazione' => 'MODENA',
            'exam_date' => '29/06/2026',
            'status' => 'completed',
            'correct_count' => 29,
            'wrong_count' => 1,
            'unanswered_count' => 0,
            'total_count' => 30,
            'answers' => []
        ]);

        // Seed new exams to take
        ExamSheet::create([
            'student_name' => 'HAMID MOHAMMED ABDUL',
            'motorizzazione' => 'SAVONA',
            'exam_date' => '25/06/2026',
            'status' => 'new',
            'correct_count' => 0,
            'wrong_count' => 0,
            'unanswered_count' => 30,
            'total_count' => 30,
            'answers' => null
        ]);

        ExamSheet::create([
            'student_name' => 'KABIR HOSSAIN',
            'motorizzazione' => 'ROMA',
            'exam_date' => '05/07/2026',
            'status' => 'new',
            'correct_count' => 0,
            'wrong_count' => 0,
            'unanswered_count' => 30,
            'total_count' => 30,
            'answers' => null
        ]);
    }
}
