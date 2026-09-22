<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dizionario;
use App\Models\Question;
use App\Models\CartelloMcq;
use App\Models\Translation;
use Illuminate\Http\Request;

class TranslationApiController extends Controller
{
    /**
     * Get dictionary translation popup details for a question or term.
     */
    public function getQuestionTranslation(Request $request)
    {
        $questionId = $request->get('question_id') ?: $request->get('id');
        $term = trim((string)($request->get('term') ?: $request->get('word') ?: $request->get('text') ?: ''));

        if ($questionId) {
            $question = Question::find($questionId);
            if ($question) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'id' => $question->id,
                        'italian' => $question->italian,
                        'bangla' => $question->bangla,
                        'vocabulary' => $question->vocabulary ?? [],
                        'image' => $question->image
                    ]
                ]);
            }

            $cartello = CartelloMcq::find($questionId);
            if ($cartello) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'id' => $cartello->id,
                        'italian' => $cartello->question,
                        'bangla' => $cartello->bn_question,
                        'vocabulary' => $cartello->vocabulary ?? [],
                        'image' => $cartello->image
                    ]
                ]);
            }
        }

        if ($term !== '') {
            $diz = Dizionario::where('word', 'like', "%{$term}%")
                ->orWhere('bn', 'like', "%{$term}%")
                ->first();

            if ($diz) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'term' => $term,
                        'word' => $diz->word,
                        'italian' => $diz->word,
                        'bangla' => $diz->bn,
                        'desc_it' => $diz->desc_it,
                        'desc_bn' => $diz->desc_bn,
                        'image' => $diz->image,
                        'audio' => $diz->audio,
                    ]
                ]);
            }

            // If not found in Dizionario, perform instant translation
            return $this->translate($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Please provide question_id or term parameter'
        ], 400);
    }

    /**
     * Bidirectional Translation API (Italian <-> Bengali).
     */
    public function translate(Request $request)
    {
        $text = trim((string)(
            $request->input('text') 
            ?? $request->input('q') 
            ?? $request->input('term') 
            ?? $request->input('word') 
            ?? $request->get('text') 
            ?? $request->get('q') 
            ?? $request->get('term') 
            ?? $request->get('word') 
            ?? ''
        ));

        if (empty($text)) {
            return response()->json([
                'status' => 'error',
                'message' => 'অনুবাদ করার জন্য কিছু লিখুন।'
            ], 422);
        }

        $fromLang = strtolower(trim((string)($request->input('from_lang') ?: $request->get('from_lang') ?: '')));
        $toLang = strtolower(trim((string)($request->input('to_lang') ?: $request->get('to_lang') ?: '')));

        // Auto-detect language if not explicitly provided
        if (empty($fromLang) || empty($toLang)) {
            // Check if text contains Bengali characters (Unicode range 0980-09FF)
            if (preg_match('/[\x{0980}-\x{09FF}]/u', $text)) {
                $fromLang = 'bn';
                $toLang = 'it';
            } else {
                $fromLang = 'it';
                $toLang = 'bn';
            }
        }

        // 1. Check cached translations DB
        $cached = Translation::where('source_text', $text)
            ->where('from_lang', $fromLang)
            ->where('to_lang', $toLang)
            ->first();

        if ($cached) {
            $cached->increment('search_count');
            return response()->json([
                'status' => 'success',
                'translated_text' => $cached->translated_text,
                'translation' => $cached->translated_text,
                'source_text' => $text,
                'from_lang' => $fromLang,
                'to_lang' => $toLang,
                'cached' => true
            ]);
        }

        $transText = null;

        // 2. Check Dizionario Table
        if ($fromLang === 'it' && $toLang === 'bn') {
            $dict = Dizionario::where('word', 'like', $text)->first();
            if ($dict && !empty($dict->bn)) {
                $transText = $dict->bn;
            }
        } elseif ($fromLang === 'bn' && $toLang === 'it') {
            $dict = Dizionario::where('bn', 'like', $text)->first();
            if ($dict && !empty($dict->word)) {
                $transText = $dict->word;
            }
        }

        // 3. Online Translation Engine (Google Translate Web API fallback)
        if (empty($transText)) {
            $transText = $this->fetchOnlineTranslation($text, $fromLang, $toLang);
        }

        if (empty($transText)) {
            $transText = $text; // Fallback
        }

        // Cache translation in DB for future instant responses
        try {
            Translation::updateOrCreate(
                [
                    'source_text' => $text,
                    'from_lang' => $fromLang,
                    'to_lang' => $toLang
                ],
                [
                    'translated_text' => $transText
                ]
            );
        } catch (\Throwable $e) {
            // Ignore if concurrency cache insert fails
        }

        $payload = [
            'status' => 'success',
            'translated_text' => $transText,
            'translation' => $transText,
            'source_text' => $text,
            'from_lang' => $fromLang,
            'to_lang' => $toLang,
            'cached' => false,
            'data' => [
                'term' => $text,
                'word' => $text,
                'italian' => $toLang === 'it' ? $transText : $text,
                'bangla' => $toLang === 'bn' ? $transText : $text,
                'translated_text' => $transText,
                'translation' => $transText,
            ]
        ];

        return response()->json($payload);
    }

    /**
     * Fast online translation provider fallback with multiple robust engines.
     */
    protected function fetchOnlineTranslation($text, $fromLang, $toLang)
    {
        $headers = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n";

        // 1. Google Translate Dict Chrome Extension API (very reliable and fast)
        try {
            $gtDictUrl = "https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl={$fromLang}&tl={$toLang}&q=" . urlencode($text);
            $ctx = stream_context_create([
                'http' => [
                    'timeout' => 3.0,
                    'ignore_errors' => true,
                    'header' => $headers
                ],
                'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
            ]);
            $resp = @file_get_contents($gtDictUrl, false, $ctx);
            if ($resp) {
                $arr = json_decode($resp, true);
                if (is_array($arr) && isset($arr[0]) && is_string($arr[0]) && !empty(trim($arr[0]))) {
                    return trim($arr[0]);
                }
            }
        } catch (\Throwable $e) {
            // Skip to next provider
        }

        // 2. MyMemory Free Translation API
        try {
            $pair = "{$fromLang}|{$toLang}";
            $mmUrl = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=" . urlencode($pair);
            $ctx = stream_context_create([
                'http' => [
                    'timeout' => 3.5,
                    'ignore_errors' => true,
                    'header' => $headers
                ],
                'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
            ]);
            $resp = @file_get_contents($mmUrl, false, $ctx);
            if ($resp) {
                $json = json_decode($resp, true);
                if (isset($json['responseData']['translatedText']) && !empty($json['responseData']['translatedText'])) {
                    $clean = trim($json['responseData']['translatedText']);
                    // Exclude error responses from MyMemory
                    if (!str_contains($clean, 'MYMEMORY WARNING:') && !str_contains($clean, 'QUERY LENGTH LIMIT EXCEEDED')) {
                        return $clean;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Skip to next provider
        }

        // 3. Fallback to Google Translate Single GTX Endpoint
        try {
            $gtUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl={$fromLang}&tl={$toLang}&dt=t&q=" . urlencode($text);
            $ctx = stream_context_create([
                'http' => [
                    'timeout' => 3.0,
                    'ignore_errors' => true,
                    'header' => $headers
                ],
                'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
            ]);
            $resp = @file_get_contents($gtUrl, false, $ctx);
            if ($resp) {
                $arr = json_decode($resp, true);
                if (isset($arr[0]) && is_array($arr[0])) {
                    $result = '';
                    foreach ($arr[0] as $part) {
                        if (isset($part[0])) {
                            $result .= $part[0];
                        }
                    }
                    if (!empty(trim($result))) {
                        return trim($result);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Ignore
        }

        return null;
    }
}
