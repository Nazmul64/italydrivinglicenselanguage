<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Question;
use App\Models\Dizionario;
use App\Models\AppClient;
use App\Models\User;
use App\Models\SavedMcq;
use App\Models\UserMcqResult;

class NotesDictionaryTranslationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_save_and_retrieve_noted_mcqs()
    {
        $chapter = \App\Models\Chapter::create([
            'chapter_number' => 1,
            'name' => 'Definizioni Generali',
            'title' => 'Definizioni Generali',
            'status' => true
        ]);

        $page = \App\Models\Page::create([
            'chapter_id' => $chapter->id,
            'title' => 'Strada e sue definizioni',
            'status' => true
        ]);

        $question = Question::create([
            'chapter' => 1,
            'chapter_name' => 'Definizioni Generali',
            'page_id' => $page->id,
            'italian' => 'Il limite massimo di velocita in autostrada e di 130 km/h',
            'bangla' => 'হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা',
            'is_vero' => true
        ]);

        $mobileSessionId = 'mobile_session_' . uniqid();
        $webSessionId = 'web_session_' . uniqid();
        $phone = '01706640864';

        // 1. Mobile App saves a note
        $saveResponse = $this->postJson('/api/v1/noted-mcqs/save', [
            'session_id' => $mobileSessionId,
            'phone' => $phone,
            'question_id' => $question->id,
            'type' => 'argomenti',
            'note_text' => 'This is a test note for speed limit'
        ]);

        $saveResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);

        // 2. Web Browser retrieves noted MCQs using phone
        $webResponse = $this->getJson("/api/v1/noted-mcqs?session_id={$webSessionId}&phone={$phone}");
        $webResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);

        $data = $webResponse->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('This is a test note for speed limit', $data[0]['note_text']);
    }

    public function test_saved_mcqs_cross_platform_sync()
    {
        $chapter = \App\Models\Chapter::create([
            'chapter_number' => 2,
            'name' => 'Segnali Stradali',
            'title' => 'Segnali Stradali',
            'status' => true
        ]);

        $page = \App\Models\Page::create([
            'chapter_id' => $chapter->id,
            'title' => 'Segnali di pericolo',
            'status' => true
        ]);

        $question = Question::create([
            'chapter' => 2,
            'chapter_name' => 'Segnali Stradali',
            'page_id' => $page->id,
            'italian' => 'Il segnale raffigurato preannuncia un pericolo',
            'bangla' => 'প্রদর্শিত চিহ্নটি বিপদের পূর্বসতর্কতা দেয়',
            'is_vero' => true
        ]);

        $phone = '01706640864';
        $mobileSession = 'mobile_device_123';

        // Toggle bookmark from Mobile
        $toggleResp = $this->postJson('/api/v1/saved-mcqs/toggle', [
            'question_id' => $question->id,
            'phone' => $phone,
            'session_id' => $mobileSession,
            'type' => 'argomenti'
        ]);

        $toggleResp->assertStatus(200)->assertJson(['saved' => true]);

        // Retrieve on Web
        $webResp = $this->getJson("/api/v1/saved-mcqs?phone={$phone}");
        $webResp->assertStatus(200);
        $this->assertNotEmpty($webResp->json('data'));
    }

    public function test_wrong_and_correct_mcqs_cross_platform_sync()
    {
        $chapter = \App\Models\Chapter::create([
            'chapter_number' => 3,
            'name' => 'Precedenza',
            'title' => 'Precedenza',
            'status' => true
        ]);

        $page = \App\Models\Page::create([
            'chapter_id' => $chapter->id,
            'title' => 'Regola generale',
            'status' => true
        ]);

        $qWrong = Question::create([
            'chapter' => 3,
            'chapter_name' => 'Precedenza',
            'page_id' => $page->id,
            'italian' => 'Bisogna sempre dare la precedenza a destra e a sinistra',
            'bangla' => 'সর্বদা ডানে এবং বামে অগ্রাধিকার দিতে হবে',
            'is_vero' => false
        ]);

        $qCorrect = Question::create([
            'chapter' => 3,
            'chapter_name' => 'Precedenza',
            'page_id' => $page->id,
            'italian' => 'Di norma si deve dare la precedenza a destra',
            'bangla' => 'সাধারণ নিয়মে ডানে অগ্রাধিকার দিতে হবে',
            'is_vero' => true
        ]);

        $phone = '01706640864';
        $mobileSession = 'mob_session_abc';

        // Log MCQ results from mobile app
        $logResp = $this->postJson('/api/v1/user-mcq-results/log', [
            'phone' => $phone,
            'session_id' => $mobileSession,
            'results' => [
                [
                    'question_id' => $qWrong->id,
                    'user_answer' => 'V',
                    'is_correct' => 0
                ],
                [
                    'question_id' => $qCorrect->id,
                    'user_answer' => 'V',
                    'is_correct' => 1
                ]
            ]
        ]);

        $logResp->assertStatus(200)->assertJson(['success' => true]);

        // Check Wrong MCQs endpoint on web
        $wrongResp = $this->getJson("/api/v1/wrong-mcqs?phone={$phone}");
        $wrongResp->assertStatus(200);
        $this->assertNotEmpty($wrongResp->json('data'));

        // Check Correct MCQs endpoint on web
        $correctResp = $this->getJson("/api/v1/correct-mcqs?phone={$phone}");
        $correctResp->assertStatus(200);
        $this->assertNotEmpty($correctResp->json('data'));
    }

    public function test_dictionary_search_api()
    {
        Dizionario::firstOrCreate(
            ['word' => 'autostrada'],
            [
                'bn' => 'মহাসড়ক',
                'desc_it' => 'Strada extraurbana',
                'desc_bn' => 'দ্রুতগামী সড়ক'
            ]
        );

        $response = $this->getJson('/api/v1/dictionary/search?q=autostrada');
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);

        $results = $response->json('data');
        $this->assertNotEmpty($results);
    }

    public function test_translation_api_bidirectional()
    {
        $resp1 = $this->postJson('/api/v1/translate', [
            'text' => 'strada',
            'from_lang' => 'it',
            'to_lang' => 'bn'
        ]);

        $resp1->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'from_lang' => 'it',
                'to_lang' => 'bn'
            ]);

        $this->assertNotEmpty($resp1->json('translated_text'));
    }
}
