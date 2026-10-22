<?php

namespace App\Http\Controllers;

use App\Models\Dizionario;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DizionarioController extends Controller
{
    /**
     * Check if user has permission to manage a module.
     */
    protected function checkPermission($module)
    {
        $user = auth()->user();
        if (!$user) return;
        if ($user->role === 'super_admin') return;

        if ($user->role === 'staff') {
            $permissions = json_decode($user->permissions, true) ?: [];
            if (in_array($module, $permissions)) {
                return;
            }
        }

        abort(403, 'Unauthorized access: You do not have permission to manage ' . $module);
    }

    // ==========================================
    // Public API Endpoints (For User Interface)
    // ==========================================

    /**
     * Get all dictionary terms.
     */
    public function getDictionary()
    {
        $terms = Dizionario::orderBy('word', 'asc')->get();
        return response()->json($terms);
    }

    public static function clearVocabularyCache()
    {
        \Illuminate\Support\Facades\Cache::forget('all_compiled_mcq_vocabulary');
    }

    /**
     * Compile and retrieve all vocabulary words and MCQs from Questions, Cartelli, Manuale and Dizionario table.
     */
    public function getAllVocabularyData()
    {
        return \Illuminate\Support\Facades\Cache::remember('all_compiled_mcq_vocabulary', 60, function () {
            $vocabMap = [];
            $knownMeanings = []; // word_lower => ['bn' => ..., 'image' => ..., 'audio' => ...]

            // 1. Dizionario Table Terms (Official glossary)
            $dizionarioTerms = Dizionario::all();
            foreach ($dizionarioTerms as $d) {
                $word = trim($d->word ?? '');
                if (!$word) continue;
                $key = mb_strtolower($word);
                $bn = trim($d->bn ?? '');
                $img = $d->image ? (str_starts_with($d->image, 'http') ? $d->image : asset($d->image)) : '';
                $audio = $d->audio ? (str_starts_with($d->audio, 'http') ? $d->audio : asset($d->audio)) : '';

                $knownMeanings[$key] = [
                    'bn' => $bn,
                    'image' => $img,
                    'audio' => $audio,
                ];

                $vocabMap[$key] = [
                    'word' => $word,
                    'bn' => $bn,
                    'desc_it' => trim($d->desc_it ?? ''),
                    'desc_bn' => trim($d->desc_bn ?? ''),
                    'image' => $img,
                    'audio' => $audio,
                    'video' => $d->video ? (str_starts_with($d->video, 'http') ? $d->video : asset($d->video)) : '',
                    'source' => 'Dizionario',
                    'target_type' => 'dizionario',
                    'is_mcq' => false,
                    'examples' => [],
                ];
            }

            // 2. Pre-scan all explicit vocabulary to populate $knownMeanings
            $questions = \App\Models\Question::all(['id', 'chapter', 'chapter_name', 'page_id', 'italian', 'bangla', 'vocabulary', 'image', 'audio', 'video']);
            foreach ($questions as $q) {
                $rawVocab = $q->vocabulary;
                if (is_string($rawVocab)) $rawVocab = json_decode($rawVocab, true);
                if (is_array($rawVocab)) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $item['image_path'] ?? $q->image ?? '';
                        if ($it && $bn) {
                            $k = mb_strtolower($it);
                            if (!isset($knownMeanings[$k])) {
                                $knownMeanings[$k] = [
                                    'bn' => $bn,
                                    'image' => $img ? (str_starts_with($img, 'http') ? $img : asset($img)) : '',
                                    'audio' => '',
                                ];
                            }
                        }
                    }
                }
            }

            $cartelliMcqs = \App\Models\CartelloMcq::all(['id', 'page_id', 'question', 'bn_question', 'vocabulary', 'image']);
            foreach ($cartelliMcqs as $cm) {
                $rawVocab = $cm->vocabulary;
                if (is_string($rawVocab)) $rawVocab = json_decode($rawVocab, true);
                if (is_array($rawVocab)) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $cm->image ?? '';
                        if ($it && $bn) {
                            $k = mb_strtolower($it);
                            if (!isset($knownMeanings[$k])) {
                                $knownMeanings[$k] = [
                                    'bn' => $bn,
                                    'image' => $img ? (str_starts_with($img, 'http') ? $img : asset($img)) : '',
                                    'audio' => '',
                                ];
                            }
                        }
                    }
                }
            }

            // 3. Process Argomenti & Quiz Questions
            foreach ($questions as $q) {
                $cleanExampleIt = trim(preg_replace('/\s+/', ' ', strip_tags($q->italian ?? '')));
                $cleanExampleBn = trim(preg_replace('/\s+/', ' ', strip_tags($q->bangla ?? '')));
                $qImage = $q->image ? (str_starts_with($q->image, 'http') ? $q->image : asset($q->image)) : '';
                $chapTitle = $q->chapter_name ?: ($q->chapter ? "Capitolo {$q->chapter}" : 'Quiz');

                // 3a. Explicit vocabulary items
                $rawVocab = $q->vocabulary;
                if (is_string($rawVocab)) $rawVocab = json_decode($rawVocab, true);
                if (is_array($rawVocab)) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $item['image_path'] ?? $qImage;
                        if (!$it) continue;
                        $key = mb_strtolower($it);

                        if (!isset($vocabMap[$key])) {
                            $vocabMap[$key] = [
                                'word' => $it,
                                'bn' => $bn,
                                'desc_it' => $cleanExampleIt,
                                'desc_bn' => $cleanExampleBn,
                                'image' => $img ? (str_starts_with($img, 'http') ? $img : asset($img)) : '',
                                'audio' => '',
                                'video' => '',
                                'source' => 'Argomenti MCQ',
                                'target_type' => 'argomenti',
                                'is_mcq' => false,
                                'page_id' => $q->page_id,
                                'chapter_id' => $q->chapter,
                                'question_id' => $q->id,
                                'chapter' => $chapTitle,
                                'examples' => [],
                            ];
                        } else {
                            if (empty($vocabMap[$key]['bn']) && !empty($bn)) $vocabMap[$key]['bn'] = $bn;
                            if (empty($vocabMap[$key]['image']) && !empty($img)) $vocabMap[$key]['image'] = str_starts_with($img, 'http') ? $img : asset($img);
                            if (empty($vocabMap[$key]['page_id']) && !empty($q->page_id)) {
                                $vocabMap[$key]['page_id'] = $q->page_id;
                                $vocabMap[$key]['chapter_id'] = $q->chapter;
                                $vocabMap[$key]['question_id'] = $q->id;
                                $vocabMap[$key]['target_type'] = 'argomenti';
                            }
                        }

                        if ($cleanExampleIt && count($vocabMap[$key]['examples']) < 5) {
                            $vocabMap[$key]['examples'][] = [
                                'it' => $cleanExampleIt,
                                'bn' => $cleanExampleBn,
                                'chapter' => $chapTitle,
                                'page_id' => $q->page_id,
                                'chapter_id' => $q->chapter,
                                'question_id' => $q->id,
                                'target_type' => 'argomenti',
                                'source' => 'Argomenti MCQ'
                            ];
                        }
                    }
                }

                // 3b. Underlined words (<u>...</u>)
                if (preg_match_all('/<u>(.*?)<\/u>/iu', $q->italian ?? '', $matches)) {
                    foreach ($matches[1] as $underlined) {
                        $cleanWord = trim(strip_tags($underlined));
                        if (!$cleanWord || mb_strlen($cleanWord) < 2) continue;
                        $key = mb_strtolower($cleanWord);

                        if (!isset($vocabMap[$key])) {
                            $bn = $knownMeanings[$key]['bn'] ?? '';
                            $vocabMap[$key] = [
                                'word' => $cleanWord,
                                'bn' => $bn,
                                'desc_it' => $cleanExampleIt,
                                'desc_bn' => $cleanExampleBn,
                                'image' => $qImage,
                                'audio' => '',
                                'video' => '',
                                'source' => 'Argomenti MCQ',
                                'target_type' => 'argomenti',
                                'is_mcq' => false,
                                'page_id' => $q->page_id,
                                'chapter_id' => $q->chapter,
                                'question_id' => $q->id,
                                'chapter' => $chapTitle,
                                'examples' => [
                                    [
                                        'it' => $cleanExampleIt,
                                        'bn' => $cleanExampleBn,
                                        'chapter' => $chapTitle,
                                        'page_id' => $q->page_id,
                                        'chapter_id' => $q->chapter,
                                        'question_id' => $q->id,
                                        'target_type' => 'argomenti',
                                        'source' => 'Argomenti MCQ'
                                    ]
                                ]
                            ];
                        }
                    }
                }

                // 3c. Extract all distinct words from question sentence
                $wordsInQuestion = preg_split('/[^\p{L}\p{N}]+/u', $cleanExampleIt, -1, PREG_SPLIT_NO_EMPTY);
                foreach ($wordsInQuestion as $singleWord) {
                    $trimmedWord = trim($singleWord);
                    if (mb_strlen($trimmedWord) < 2) continue;
                    $key = mb_strtolower($trimmedWord);

                    if (!isset($vocabMap[$key])) {
                        $knownBn = $knownMeanings[$key]['bn'] ?? '';
                        $vocabMap[$key] = [
                            'word' => ucfirst($trimmedWord),
                            'bn' => $knownBn,
                            'desc_it' => $cleanExampleIt,
                            'desc_bn' => $cleanExampleBn,
                            'image' => $qImage,
                            'audio' => '',
                            'video' => '',
                            'source' => 'Argomenti MCQ',
                            'target_type' => 'argomenti',
                            'is_mcq' => false,
                            'page_id' => $q->page_id,
                            'chapter_id' => $q->chapter,
                            'question_id' => $q->id,
                            'chapter' => $chapTitle,
                            'examples' => [
                                [
                                    'it' => $cleanExampleIt,
                                    'bn' => $cleanExampleBn,
                                    'chapter' => $chapTitle,
                                    'page_id' => $q->page_id,
                                    'chapter_id' => $q->chapter,
                                    'question_id' => $q->id,
                                    'target_type' => 'argomenti',
                                    'source' => 'Argomenti MCQ'
                                ]
                            ]
                        ];
                    } else {
                        if (empty($vocabMap[$key]['desc_it'])) $vocabMap[$key]['desc_it'] = $cleanExampleIt;
                        if (empty($vocabMap[$key]['desc_bn'])) $vocabMap[$key]['desc_bn'] = $cleanExampleBn;
                        if (empty($vocabMap[$key]['page_id']) && !empty($q->page_id)) {
                            $vocabMap[$key]['page_id'] = $q->page_id;
                            $vocabMap[$key]['chapter_id'] = $q->chapter;
                            $vocabMap[$key]['question_id'] = $q->id;
                            $vocabMap[$key]['chapter'] = $chapTitle;
                            $vocabMap[$key]['target_type'] = 'argomenti';
                        }
                    }
                }

                // 3d. Index the MCQ Question itself as a full question entry!
                if ($cleanExampleIt) {
                    $mcqKey = "mcq_argomenti_{$q->id}";
                    $vocabMap[$mcqKey] = [
                        'word' => $cleanExampleIt,
                        'bn' => $cleanExampleBn ?: $cleanExampleIt,
                        'desc_it' => $cleanExampleIt,
                        'desc_bn' => $cleanExampleBn,
                        'image' => $qImage,
                        'audio' => $q->audio ? (str_starts_with($q->audio, 'http') ? $q->audio : asset($q->audio)) : '',
                        'video' => $q->video ? (str_starts_with($q->video, 'http') ? $q->video : asset($q->video)) : '',
                        'source' => 'Argomenti MCQ',
                        'target_type' => 'argomenti',
                        'is_mcq' => true,
                        'page_id' => $q->page_id,
                        'chapter_id' => $q->chapter,
                        'question_id' => $q->id,
                        'chapter' => $chapTitle,
                        'examples' => []
                    ];
                }
            }

            // 4. Process Cartelli MCQs
            foreach ($cartelliMcqs as $cm) {
                $cleanExampleIt = trim(preg_replace('/\s+/', ' ', strip_tags($cm->question ?? '')));
                $cleanExampleBn = trim(preg_replace('/\s+/', ' ', strip_tags($cm->bn_question ?? '')));
                $cmImage = $cm->image ? (str_starts_with($cm->image, 'http') ? $cm->image : asset($cm->image)) : '';
                $cmChap = 'Cartelli Stradali';

                // Explicit vocabulary
                $rawVocab = $cm->vocabulary;
                if (is_string($rawVocab)) $rawVocab = json_decode($rawVocab, true);
                if (is_array($rawVocab)) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $cmImage;
                        if (!$it) continue;
                        $key = mb_strtolower($it);

                        if (!isset($vocabMap[$key])) {
                            $vocabMap[$key] = [
                                'word' => $it,
                                'bn' => $bn,
                                'desc_it' => $cleanExampleIt,
                                'desc_bn' => $cleanExampleBn,
                                'image' => $img ? (str_starts_with($img, 'http') ? $img : asset($img)) : '',
                                'audio' => '',
                                'video' => '',
                                'source' => 'Cartelli MCQ',
                                'target_type' => 'cartelli',
                                'is_mcq' => false,
                                'page_id' => $cm->page_id,
                                'question_id' => $cm->id,
                                'chapter' => $cmChap,
                                'examples' => [],
                            ];
                        }
                    }
                }

                // All words in Cartelli MCQ
                $wordsInCm = preg_split('/[^\p{L}\p{N}]+/u', $cleanExampleIt, -1, PREG_SPLIT_NO_EMPTY);
                foreach ($wordsInCm as $singleWord) {
                    $trimmedWord = trim($singleWord);
                    if (mb_strlen($trimmedWord) < 2) continue;
                    $key = mb_strtolower($trimmedWord);

                    if (!isset($vocabMap[$key])) {
                        $knownBn = $knownMeanings[$key]['bn'] ?? '';
                        $vocabMap[$key] = [
                            'word' => ucfirst($trimmedWord),
                            'bn' => $knownBn,
                            'desc_it' => $cleanExampleIt,
                            'desc_bn' => $cleanExampleBn,
                            'image' => $cmImage,
                            'audio' => '',
                            'video' => '',
                            'source' => 'Cartelli MCQ',
                            'target_type' => 'cartelli',
                            'is_mcq' => false,
                            'page_id' => $cm->page_id,
                            'question_id' => $cm->id,
                            'chapter' => $cmChap,
                            'examples' => []
                        ];
                    }
                }

                // Index Cartelli MCQ itself
                if ($cleanExampleIt) {
                    $mcqKey = "mcq_cartelli_{$cm->id}";
                    $vocabMap[$mcqKey] = [
                        'word' => $cleanExampleIt,
                        'bn' => $cleanExampleBn ?: $cleanExampleIt,
                        'desc_it' => $cleanExampleIt,
                        'desc_bn' => $cleanExampleBn,
                        'image' => $cmImage,
                        'audio' => '',
                        'video' => '',
                        'source' => 'Cartelli MCQ',
                        'target_type' => 'cartelli',
                        'is_mcq' => true,
                        'page_id' => $cm->page_id,
                        'question_id' => $cm->id,
                        'chapter' => $cmChap,
                        'examples' => []
                    ];
                }
            }

            // 5. Process Manuale Chapters
            $manuales = \App\Models\Manuale::all(['id', 'title', 'chapter_number', 'vocabulary', 'image_path']);
            foreach ($manuales as $man) {
                $rawVocab = $man->vocabulary;
                if (is_string($rawVocab)) $rawVocab = json_decode($rawVocab, true);
                if (is_array($rawVocab)) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $man->image_path ?? '';
                        if (!$it) continue;
                        $key = mb_strtolower($it);

                        if (!isset($vocabMap[$key])) {
                            $vocabMap[$key] = [
                                'word' => $it,
                                'bn' => $bn,
                                'desc_it' => $man->title ?? '',
                                'desc_bn' => '',
                                'image' => $img ? (str_starts_with($img, 'http') ? $img : asset($img)) : '',
                                'audio' => '',
                                'video' => '',
                                'source' => 'Manuale',
                                'target_type' => 'manuale',
                                'is_mcq' => false,
                                'page_id' => $man->id,
                                'question_id' => null,
                                'chapter' => $man->title ?? "Chapter {$man->chapter_number}",
                                'examples' => [],
                            ];
                        }
                    }
                }
            }

            $list = array_values($vocabMap);
            usort($list, function ($a, $b) {
                $aIsMcq = !empty($a['is_mcq']);
                $bIsMcq = !empty($b['is_mcq']);
                if ($aIsMcq !== $bIsMcq) return $aIsMcq ? 1 : -1;
                return strcasecmp($a['word'], $b['word']);
            });

            return $list;
        });
    }

    /**
     * Search vocabulary across MCQs, Cartelli, Manuale and Dizionario table.
     */
    public function searchVocabulary(Request $request)
    {
        $query = trim((string)($request->input('q', $request->input('query', $request->input('search', '')))));
        $letter = strtoupper(trim((string)$request->input('letter', '')));

        $allTerms = $this->getAllVocabularyData();

        if (empty($query) && empty($letter)) {
            return response()->json([
                'status' => 'success',
                'total' => count($allTerms),
                'total_terms' => count($allTerms),
                'results' => $allTerms,
                'data' => $allTerms,
                'words' => $allTerms
            ]);
        }

        $filtered = array_filter($allTerms, function ($item) use ($query, $letter) {
            $word = $item['word'] ?? '';
            $bn = $item['bn'] ?? '';
            $descIt = $item['desc_it'] ?? '';
            $descBn = $item['desc_bn'] ?? '';
            $chapter = $item['chapter'] ?? '';

            if ($letter) {
                $firstChar = strtoupper(mb_substr($word, 0, 1));
                if ($firstChar !== $letter) {
                    return false;
                }
            }

            if ($query) {
                $qLower = mb_strtolower($query);
                $wordLower = mb_strtolower($word);
                $bnLower = mb_strtolower($bn);
                $isMcq = !empty($item['is_mcq']);

                if ($isMcq) {
                    $chapterLower = mb_strtolower($chapter);
                    return (
                        str_contains($wordLower, $qLower) ||
                        str_contains($bnLower, $qLower) ||
                        str_contains($chapterLower, $qLower)
                    );
                } else {
                    return (
                        str_contains($wordLower, $qLower) ||
                        str_contains($bnLower, $qLower)
                    );
                }
            }

            return true;
        });

        // Direct real-time DB query when a search query is given to ensure any freshly uploaded MCQs are included
        if (!empty($query)) {
            $qLower = mb_strtolower($query);
            $dbQuestions = \App\Models\Question::where('italian', 'LIKE', "%{$query}%")
                ->orWhere('bangla', 'LIKE', "%{$query}%")
                ->orWhere('chapter_name', 'LIKE', "%{$query}%")
                ->limit(30)
                ->get();

            $existingIds = [];
            foreach ($filtered as $f) {
                if (!empty($f['is_mcq']) && !empty($f['question_id'])) {
                    $existingIds[$f['question_id']] = true;
                }
            }

            foreach ($dbQuestions as $dbQ) {
                if (isset($existingIds[$dbQ->id])) continue;
                $cleanIt = trim(strip_tags($dbQ->italian ?? ''));
                $cleanBn = trim(strip_tags($dbQ->bangla ?? ''));
                $filtered[] = [
                    'word' => $cleanIt,
                    'bn' => $cleanBn ?: $cleanIt,
                    'desc_it' => $cleanIt,
                    'desc_bn' => $cleanBn,
                    'image' => $dbQ->image ? (str_starts_with($dbQ->image, 'http') ? $dbQ->image : asset($dbQ->image)) : '',
                    'audio' => $dbQ->audio ? (str_starts_with($dbQ->audio, 'http') ? $dbQ->audio : asset($dbQ->audio)) : '',
                    'video' => $dbQ->video ? (str_starts_with($dbQ->video, 'http') ? $dbQ->video : asset($dbQ->video)) : '',
                    'source' => 'Argomenti MCQ',
                    'target_type' => 'argomenti',
                    'is_mcq' => true,
                    'page_id' => $dbQ->page_id,
                    'chapter_id' => $dbQ->chapter,
                    'question_id' => $dbQ->id,
                    'chapter' => $dbQ->chapter_name ?: ($dbQ->chapter ? "Capitolo {$dbQ->chapter}" : 'Quiz'),
                    'examples' => []
                ];
            }

            // Real-time query for CartelloMcqs to ensure zero lag
            $dbCartelli = \App\Models\CartelloMcq::where('question', 'LIKE', "%{$query}%")
                ->orWhere('bn_question', 'LIKE', "%{$query}%")
                ->limit(30)
                ->get();
            foreach ($dbCartelli as $cm) {
                if (isset($existingIds['cartelli_' . $cm->id])) continue;
                $cleanIt = trim(strip_tags($cm->question ?? ''));
                $cleanBn = trim(strip_tags($cm->bn_question ?? ''));
                $filtered[] = [
                    'word' => $cleanIt,
                    'bn' => $cleanBn ?: $cleanIt,
                    'desc_it' => $cleanIt,
                    'desc_bn' => $cleanBn,
                    'image' => $cm->image ? (str_starts_with($cm->image, 'http') ? $cm->image : asset($cm->image)) : '',
                    'audio' => $cm->voice ? (str_starts_with($cm->voice, 'http') ? $cm->voice : asset($cm->voice)) : '',
                    'video' => $cm->video ? (str_starts_with($cm->video, 'http') ? $cm->video : asset($cm->video)) : '',
                    'source' => 'Cartelli MCQ',
                    'target_type' => 'cartelli',
                    'is_mcq' => true,
                    'page_id' => $cm->page_id,
                    'chapter_id' => null,
                    'question_id' => $cm->id,
                    'chapter' => 'Cartelli Stradali',
                    'examples' => []
                ];
            }

            // Real-time query for Dizionario terms to ensure zero lag
            $dbTerms = Dizionario::where('word', 'LIKE', "%{$query}%")
                ->orWhere('bn', 'LIKE', "%{$query}%")
                ->limit(30)
                ->get();
            $existingWords = [];
            foreach ($filtered as $f) {
                if (empty($f['is_mcq']) && !empty($f['word'])) {
                    $existingWords[mb_strtolower($f['word'])] = true;
                }
            }
            foreach ($dbTerms as $dt) {
                $dtWord = trim($dt->word ?? '');
                if (!$dtWord || isset($existingWords[mb_strtolower($dtWord)])) continue;
                $filtered[] = [
                    'word' => $dtWord,
                    'bn' => trim($dt->bn ?? ''),
                    'desc_it' => trim($dt->desc_it ?? ''),
                    'desc_bn' => trim($dt->desc_bn ?? ''),
                    'image' => $dt->image ? (str_starts_with($dt->image, 'http') ? $dt->image : asset($dt->image)) : '',
                    'audio' => $dt->audio ? (str_starts_with($dt->audio, 'http') ? $dt->audio : asset($dt->audio)) : '',
                    'video' => $dt->video ? (str_starts_with($dt->video, 'http') ? $dt->video : asset($dt->video)) : '',
                    'source' => 'Dizionario',
                    'target_type' => 'dizionario',
                    'is_mcq' => false,
                    'examples' => []
                ];
            }
        }

        // Re-index and prioritize matches: exact word -> word starts with -> word contains -> mcq sentence
        $results = array_values($filtered);
        if ($query) {
            $qLower = mb_strtolower($query);
            usort($results, function ($a, $b) use ($qLower) {
                $aIsMcq = !empty($a['is_mcq']);
                $bIsMcq = !empty($b['is_mcq']);

                $aWord = mb_strtolower($a['word'] ?? '');
                $bWord = mb_strtolower($b['word'] ?? '');

                $aExact = ($aWord === $qLower);
                $bExact = ($bWord === $qLower);
                if ($aExact !== $bExact) return $aExact ? -1 : 1;

                $aStarts = str_starts_with($aWord, $qLower);
                $bStarts = str_starts_with($bWord, $qLower);
                if ($aStarts !== $bStarts) return $aStarts ? -1 : 1;

                if ($aIsMcq !== $bIsMcq) {
                    return $aIsMcq ? 1 : -1;
                }

                return mb_strlen($aWord) <=> mb_strlen($bWord) ?: strcasecmp($a['word'] ?? '', $b['word'] ?? '');
            });
        }

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'letter' => $letter,
            'total' => count($results),
            'total_terms' => count($results),
            'results' => $results,
            'data' => $results,
            'words' => $results
        ]);
    }

    // ==========================================
    // Admin API Endpoints (For Administrative Interface)
    // ==========================================

    /**
     * Get dictionary terms list for admin panel (paginated).
     */
    public function getDictionaryAdmin(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = Dizionario::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('word', 'like', "%{$search}%")
                  ->orWhere('bn', 'like', "%{$search}%")
                  ->orWhere('desc_it', 'like', "%{$search}%")
                  ->orWhere('desc_bn', 'like', "%{$search}%");
            });
        }

        $terms = $query->orderBy('word', 'asc')->paginate($perPage);
        return response()->json($terms);
    }

    /**
     * Store new dictionary word.
     */
    public function storeWord(Request $request)
    {
        $this->checkPermission('dizionario');

        $request->validate([
            'word'    => 'required|string|max:255|unique:dizionaros,word',
            'bn'      => 'required|string|max:255',
            'desc_it' => 'nullable|string',
            'desc_bn' => 'nullable|string',
            'image'   => 'nullable|max:20480',
            'audio'   => 'nullable|max:15360',
            'video'   => 'nullable|max:30720',
        ]);

        $data = [
            'word'    => $request->word,
            'bn'      => $request->bn,
            'desc_it' => $request->desc_it,
            'desc_bn' => $request->desc_bn,
        ];

        $term = Dizionario::create($data);

        // Upload Image
        if ($request->hasFile('image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/dizionario/images', 'dict_img_' . $term->id, 800, 80);
            $term->image = $uploadedPath;
        }

        // Upload Audio (Voice)
        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $fileName = 'dict_aud_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/audios'), $fileName);
            $term->audio = '/uploads/dizionario/audios/' . $fileName;
        }

        // Upload Video
        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'dict_vid_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/videos'), $fileName);
            $term->video = '/uploads/dizionario/videos/' . $fileName;
        }

        $term->save();
        \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');

        return response()->json($term);
    }

    /**
     * Update dictionary word.
     */
    public function updateWord(Request $request, $id)
    {
        $this->checkPermission('dizionario');
        $term = Dizionario::findOrFail($id);

        $request->validate([
            'word'    => 'required|string|max:255|unique:dizionaros,word,' . $id,
            'bn'      => 'required|string|max:255',
            'desc_it' => 'nullable|string',
            'desc_bn' => 'nullable|string',
            'image'   => 'nullable|max:20480',
            'audio'   => 'nullable|max:15360',
            'video'   => 'nullable|max:30720',
        ]);

        $term->word = $request->word;
        $term->bn = $request->bn;
        $term->desc_it = $request->desc_it;
        $term->desc_bn = $request->desc_bn;

        // Update Image
        if ($request->hasFile('image')) {
            if ($term->image && file_exists(public_path($term->image))) {
                @unlink(public_path($term->image));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/dizionario/images', 'dict_img_' . $term->id, 800, 80);
            $term->image = $uploadedPath;
        }

        // Update Audio (Voice)
        if ($request->hasFile('audio')) {
            if ($term->audio && file_exists(public_path($term->audio))) {
                @unlink(public_path($term->audio));
            }
            $file = $request->file('audio');
            $fileName = 'dict_aud_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/audios'), $fileName);
            $term->audio = '/uploads/dizionario/audios/' . $fileName;
        }

        // Update Video
        if ($request->hasFile('video')) {
            if ($term->video && file_exists(public_path($term->video))) {
                @unlink(public_path($term->video));
            }
            $file = $request->file('video');
            $fileName = 'dict_vid_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/videos'), $fileName);
            $term->video = '/uploads/dizionario/videos/' . $fileName;
        }

        $term->save();
        \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');

        return response()->json($term);
    }

    /**
     * Delete dictionary word.
     */
    public function deleteWord($id)
    {
        $this->checkPermission('dizionario');
        $term = Dizionario::findOrFail($id);

        // Delete associated files
        if ($term->image && file_exists(public_path($term->image))) {
            @unlink(public_path($term->image));
        }
        if ($term->audio && file_exists(public_path($term->audio))) {
            @unlink(public_path($term->audio));
        }
        if ($term->video && file_exists(public_path($term->video))) {
            @unlink(public_path($term->video));
        }

        $term->delete();
        \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');
        return response()->json(['success' => true]);
    }

    /**
     * Bulk delete dictionary words.
     */
    public function bulkDeleteWord(Request $request)
    {
        $this->checkPermission('dizionario');

        if ($request->input('all') === true) {
            $query = Dizionario::query();
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('word', 'like', "%{$search}%")
                      ->orWhere('bn', 'like', "%{$search}%")
                      ->orWhere('desc_it', 'like', "%{$search}%")
                      ->orWhere('desc_bn', 'like', "%{$search}%");
                });
            }
            $terms = $query->get();
            foreach ($terms as $term) {
                if ($term->image && file_exists(public_path($term->image))) {
                    @unlink(public_path($term->image));
                }
                if ($term->audio && file_exists(public_path($term->audio))) {
                    @unlink(public_path($term->audio));
                }
                if ($term->video && file_exists(public_path($term->video))) {
                    @unlink(public_path($term->video));
                }
                $term->delete();
            }
            \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');
            return response()->json(['success' => true]);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:dizionaros,id',
        ]);

        $terms = Dizionario::whereIn('id', $request->ids)->get();
        foreach ($terms as $term) {
            if ($term->image && file_exists(public_path($term->image))) {
                @unlink(public_path($term->image));
            }
            if ($term->audio && file_exists(public_path($term->audio))) {
                @unlink(public_path($term->audio));
            }
            if ($term->video && file_exists(public_path($term->video))) {
                @unlink(public_path($term->video));
            }
            $term->delete();
        }

        \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');
        return response()->json(['success' => true]);
    }
}
