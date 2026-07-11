<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Chapter;
use App\Models\Page;
use App\Models\Question;

class ChapterPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing data
        Schema::disableForeignKeyConstraints();
        DB::table('pages')->truncate();
        DB::table('chapters')->truncate();
        DB::table('notes')->truncate();
        DB::table('saved_mcqs')->truncate();
        Question::query()->update(['page_id' => null]);
        Schema::enableForeignKeyConstraints();

        // 2. Define hardcoded chapters list
        $chaptersList = [
            ['id' => 1, 'name' => "Definizioni stradali e doveri dell'uso della strada", 'bn_name' => "রাস্তা ও ট্রাফিকের সাধারণ সংজ্ঞা এবং চালকের দায়িত্ব"],
            ['id' => 2, 'name' => "Segnali di pericolo", 'bn_name' => "বিপদজনক সংকেত"],
            ['id' => 3, 'name' => "Segnali di divieto", 'bn_name' => "নিষেধাজ্ঞা সংকেত"],
            ['id' => 4, 'name' => "Segnali di obbligo", 'bn_name' => "বাধ্যতামূলক সংকেত"],
            ['id' => 5, 'name' => "Segnali orizzontali e segni sulla strada", 'bn_name' => "রাস্তার অনুভূমিক দাগ এবং সংকেত"],
            ['id' => 6, 'name' => "Segnalazioni semaforiche e degli agenti del traffico", 'bn_name' => "ট্রাফিক লাইট এবং ট্রাফিক পুলিশের সংকেত"],
            ['id' => 7, 'name' => "Pericolo e intralcio, limiti di velocità, distanza di sicurezza", 'bn_name' => "বিপদ ও প্রতিবন্ধকতা, গতিসীমা, নিরাপদ দূরত্ব"],
            ['id' => 8, 'name' => "Norme sulla circolazione dei veicoli (precedenze)", 'bn_name' => "যানবাহন চলাচেলের নিয়ম (অগ্রাধিকার)"],
            ['id' => 9, 'name' => "Esempi di precedenza (rappresentazioni grafiche)", 'bn_name' => "অগ্রাধিকারের চিত্রভিত্তিক উদাহরণ"],
            ['id' => 10, 'name' => "Norme sul sorpasso", 'bn_name' => "ওভারটেকিংয়ের নিয়মাবলি"],
            ['id' => 11, 'name' => "Fermata, sosta, partenza e ingombro della carreggiata", 'bn_name' => "থামা, পার্কিং, যাত্রা শুরু এবং প্রতিবন্ধকতা সৃষ্টি"],
            ['id' => 12, 'name' => "Norme sull'uso delle luci, dispositivi acustici, spie", 'bn_name' => "লাইট, হর্ন এবং ইন্ডিকেটর ব্যবহারের নিয়ম"],
            ['id' => 13, 'name' => "Cinture di sicurezza, sistemi di ritenuta, casco", 'bn_name' => "সিটবেল্ট, হেলমেট এবং চাইল্ড সিট ব্যবহারের নিয়ম"],
            ['id' => 14, 'name' => "Patenti di guida, documenti, punti patente", 'bn_name' => "ড্রাইভিং লাইসেন্স, নথিপত্র এবং পেনাল্টি পয়েন্ট"],
            ['id' => 15, 'name' => "Incidenti stradali e primo soccorso", 'bn_name' => "সড়ক দুর্ঘটনা এবং প্রাথমিক চিকিৎসা"],
            ['id' => 16, 'name' => "Guida in relazione alle condizioni ambientali", 'bn_name' => "প্রাকৃতিক বৈরী পরিবেশে গাড়ি চালানো"],
            ['id' => 17, 'name' => "Responsabilità civile, penale, amministrativa, assicurazione", 'bn_name' => "আইনি ও ফৌজদারি দায়বদ্ধতা এবং ইনস্যুরেন্স"],
            ['id' => 18, 'name' => "Limitazione dei consumi, inquinamento, elementi del veicolo", 'bn_name' => "জ্বালানি সাশ্রয়, পরিবেশ দূষণ এবং গাড়ির পার্টস"],
            ['id' => 19, 'name' => "Dispositivi di equipaggiamento e specchietti retrovisori", 'bn_name' => "গাড়ির অভ্যন্তরীণ যন্ত্রপাতি ও লুকিং গ্লাস"],
            ['id' => 20, 'name' => "Uso ed efficienza dei dispositivi del veicolo", 'bn_name' => "গাড়ির গুরুত্বপূর্ণ পার্টসের ব্যবহার ও কার্যকারিতা"],
            ['id' => 21, 'name' => "Comportamenti alla guida in autostrada e strade extraurbane", 'bn_name' => "এক্সপ্রেসওয়ে এবং হাইওয়েতে গাড়ি চালানোর নিয়ম"],
            ['id' => 22, 'name' => "Segnali di indicazione, pannelli integrativi, segnali turistici", 'bn_name' => "নির্দেশনামূলক এবং পর্যটন সাইনবোর্ড"],
            ['id' => 23, 'name' => "Uso corretto della strada e comportamenti precauzionali", 'bn_name' => "রাস্তার সঠিক ব্যবহার এবং সতর্কতামূলক আচরণ"],
            ['id' => 24, 'name' => "Segnali luminosi e indicazioni degli agenti di polizia", 'bn_name' => "পুলিশের হাতের ইশারা এবং বিশেষ লাইট সংকেত"],
            ['id' => 25, 'name' => "Definizioni generali e classificazione dei veicoli", 'bn_name' => "যানবাহনের প্রকারভেদ এবং সাধারণ পরিচিতি"]
        ];

        // 3. Insert chapters
        foreach ($chaptersList as $ch) {
            Chapter::create([
                'id' => $ch['id'],
                'name' => $ch['name'],
                'bn_name' => $ch['bn_name']
            ]);
        }

        // 4. Define sheets titles for Chapter 1 and Chapter 2
        $chapter1Sheets = [
            "Definizioni stradali: la strada",
            "Definizioni stradali: la carreggiata",
            "Definizioni stradali: parti della carreggiata",
            "Definizioni stradali: le corsie",
            "Definizioni stradali: marciapiede e banchina",
            "Definizioni stradali: isola di traffico",
            "Definizioni stradali: salvagente",
            "Definizioni stradali: passaggio a livello",
            "Definizioni stradali: pista ciclabile",
            "Definizioni stradali: area pedonale",
            "Definizioni stradali: zona a traffico limitato",
            "Definizioni stradali: isola pedonale",
            "Definizioni stradali: autostrada",
            "Definizioni stradali: carreggiata e corsia d'emergenza",
            "Definizioni stradali: strada extraurbana",
            "Definizioni stradali: curva e dosso",
            "Definizioni stradali: incrocio o intersezione",
            "Definizioni stradali: passaggio pedonale",
            "Definizioni stradali: passo carrabile",
            "Definizioni stradali: isola spartitraffico",
            "Definizioni stradali: banchina stradale",
            "Definizioni stradali: corsia di decelerazione",
            "Definizioni stradali: corsia di accelerazione"
        ];

        $chapter2Sheets = [
            "Segnali di pericolo: strada deformata",
            "Segnali di pericolo: dosso",
            "Segnali di pericolo: cunetta",
            "Segnali di pericolo: curva pericolosa a destra",
            "Segnali di pericolo: curva pericolosa a sinistra",
            "Segnali di pericolo: doppia curva",
            "Segnali di pericolo: passaggio a livello con barriere",
            "Segnali di pericolo: passaggio a livello senza barriere",
            "Segnali di pericolo: croce di S. Andrea",
            "Segnali di pericolo: pannelli distanziometrici",
            "Segnali di pericolo: attraversamento tranviario",
            "Segnali di pericolo: attraversamento pedonale",
            "Segnali di pericolo: attraversamento ciclabile",
            "Segnali di pericolo: discesa pericolosa",
            "Segnali di pericolo: salita ripida",
            "Segnali di pericolo: strettoia simmetrica",
            "Segnali di pericolo: strettoia asimmetrica a sinistra",
            "Segnali di pericolo: strettoia asimmetrica a destra",
            "Segnali di pericolo: ponte mobile",
            "Segnali di pericolo: banchina pericolosa",
            "Segnali di pericolo: strada sdrucciolevole",
            "Segnali di pericolo: bambini",
            "Segnali di pericolo: animali domestici",
            "Segnali di pericolo: animali selvatici",
            "Segnali di pericolo: doppio senso di circolazione",
            "Segnali di pericolo: senso unico alternato",
            "Segnali di pericolo: semaforo",
            "Segnali di pericolo: altri pericoli"
        ];

        // 5. Query questions and slice them into pages
        foreach ($chaptersList as $ch) {
            $chId = $ch['id'];
            $chName = $ch['name'];
            
            // Get all questions in order of ID
            $questions = Question::where('chapter', $chId)->orderBy('id')->get();
            $count = $questions->count();
            
            if ($count === 0) {
                continue;
            }
            
            $chunks = $questions->chunk(10);
            $pageIndex = 0;
            
            foreach ($chunks as $chunk) {
                // Determine sheet title
                $title = "Pagina " . ($pageIndex + 1);
                if ($chId === 1 && isset($chapter1Sheets[$pageIndex])) {
                    $title = $chapter1Sheets[$pageIndex];
                } elseif ($chId === 2 && isset($chapter2Sheets[$pageIndex])) {
                    $title = $chapter2Sheets[$pageIndex];
                } else {
                    $title = $chName . ": Pagina " . ($pageIndex + 1);
                }
                
                // Create Page
                $page = Page::create([
                    'chapter_id' => $chId,
                    'title' => $title,
                    'bn_title' => $title // Let's make it identical or empty for now
                ]);
                
                // Link questions to this page
                $questionIds = $chunk->pluck('id')->toArray();
                Question::whereIn('id', $questionIds)->update(['page_id' => $page->id]);
                
                $pageIndex++;
            }
        }
    }
}
