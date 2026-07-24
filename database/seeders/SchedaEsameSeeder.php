<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExamSheet;
use App\Models\Question;

class SchedaEsameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch 30 random questions to attach to sample passed exam sheets
        $questions = Question::inRandomOrder()->limit(30)->get();
        $questionsArray = [];

        foreach ($questions as $index => $q) {
            $isVero = ($q->is_vero == 1 || $q->is_vero == '1' || $q->is_vero === true);
            // Give 29 correct answers and 1 wrong answer to match Screenshot 3
            $userAns = ($index === 5) ? !$isVero : $isVero;

            $questionsArray[] = [
                'id' => $q->id,
                'italian' => $q->italian,
                'bangla' => $q->bangla,
                'image' => $q->image ?? null,
                'is_vero' => $isVero,
                'user_answer' => $userAns
            ];
        }

        $sampleExams = [
            [
                'student_name' => 'RAHMAN SHAJAHAN',
                'motorizzazione' => 'GORIZIA',
                'exam_date' => '22/01/2025',
                'status' => 'completed',
                'correct_count' => 29,
                'wrong_count' => 1,
                'unanswered_count' => 0,
                'total_count' => 30,
                'answers' => $questionsArray
            ],
            [
                'student_name' => 'BEPARY JOYDEB',
                'motorizzazione' => 'GENOVA',
                'exam_date' => '20/01/2025',
                'status' => 'completed',
                'correct_count' => 29,
                'wrong_count' => 1,
                'unanswered_count' => 0,
                'total_count' => 30,
                'answers' => $questionsArray
            ],
            [
                'student_name' => 'MUNSHI SHAHJALAL',
                'motorizzazione' => 'BRESCIA',
                'exam_date' => '21/01/2025',
                'status' => 'completed',
                'correct_count' => 29,
                'wrong_count' => 1,
                'unanswered_count' => 0,
                'total_count' => 30,
                'answers' => $questionsArray
            ],
            [
                'student_name' => 'HOSSAIN MD MEHEDI',
                'motorizzazione' => 'ROMA',
                'exam_date' => '18/01/2025',
                'status' => 'completed',
                'correct_count' => 30,
                'wrong_count' => 0,
                'unanswered_count' => 0,
                'total_count' => 30,
                'answers' => $questionsArray
            ],
            [
                'student_name' => 'ISLAM NAZMUL',
                'motorizzazione' => 'MILANO',
                'exam_date' => '15/01/2025',
                'status' => 'completed',
                'correct_count' => 28,
                'wrong_count' => 2,
                'unanswered_count' => 0,
                'total_count' => 30,
                'answers' => $questionsArray
            ]
        ];

        foreach ($sampleExams as $ex) {
            ExamSheet::updateOrCreate(
                [
                    'student_name' => $ex['student_name'],
                    'motorizzazione' => $ex['motorizzazione']
                ],
                $ex
            );
        }
    }
}
