<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Question;
use App\Models\Dizionario;

class NotesDictionaryTranslationApiTest extends TestCase
{
    use RefreshDatabase;
    public function test_save_and_retrieve_noted_mcqs()
    {
        $chapter = \App\Models\Chapter::first() ?: \App\Models\Chapter::create([
            'chapter_number' => 1,
            'name' => 'Definizioni Generali',
            'title' => 'Definizioni Generali',
            'status' => true
        ]);

        $page = \App\Models\Page::first() ?: \App\Models\Page::create([
            'chapter_id' => $chapter->id,
            'title' => 'Strada e sue definizioni',
            'status' => true
        ]);

        $question = Question::first();
        if (!$question) {
            $question = Question::create([
                'chapter' => 1,
                'chapter_name' => 'Definizioni Generali',
                'page_id' => $page->id,
                'italian' => 'Il limite massimo di velocita in autostrada e di 130 km/h',
                'bangla' => 'হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা',
                'is_vero' => true
            ]);
        }

        $sessionId = 'test_session_' . uniqid();
        $phone = '01712345678';

        $saveResponse = $this->postJson('/api/v1/noted-mcqs/save', [
            'session_id' => $sessionId,
            'phone' => $phone,
            'question_id' => $question->id,
            'type' => 'argomenti',
            'note_text' => 'This is a test note for speed limit'
        ]);

        $saveResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);

        $indexResponse = $this->getJson("/api/v1/noted-mcqs?session_id={$sessionId}&phone={$phone}");
        $indexResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);

        $data = $indexResponse->json('data');
        $this->assertNotEmpty($data);
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
