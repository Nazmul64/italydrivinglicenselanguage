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

    /**
     * Compile and retrieve all vocabulary words from MCQs, Cartelli, Manuale and Dizionario table.
     */
    public function getAllVocabularyData()
    {
        return \Illuminate\Support\Facades\Cache::remember('all_compiled_mcq_vocabulary', 600, function () {
            $vocabMap = [];

            // 1. Dizionario Table Terms
            $dizionarioTerms = Dizionario::all();
            foreach ($dizionarioTerms as $d) {
                $word = trim($d->word ?? '');
                if (!$word) continue;
                $key = mb_strtolower($word);

                if (!isset($vocabMap[$key])) {
                    $vocabMap[$key] = [
                        'word' => $word,
                        'bn' => trim($d->bn ?? ''),
                        'desc_it' => trim($d->desc_it ?? ''),
                        'desc_bn' => trim($d->desc_bn ?? ''),
                        'image' => $d->image ? (str_starts_with($d->image, 'http') ? $d->image : asset($d->image)) : '',
                        'audio' => $d->audio ? (str_starts_with($d->audio, 'http') ? $d->audio : asset($d->audio)) : '',
                        'video' => $d->video ? (str_starts_with($d->video, 'http') ? $d->video : asset($d->video)) : '',
                        'source' => 'Dizionario',
                        'examples' => [],
                    ];
                } else {
                    if (empty($vocabMap[$key]['bn']) && !empty($d->bn)) {
                        $vocabMap[$key]['bn'] = trim($d->bn);
                    }
                    if (empty($vocabMap[$key]['desc_it']) && !empty($d->desc_it)) {
                        $vocabMap[$key]['desc_it'] = trim($d->desc_it);
                    }
                    if (empty($vocabMap[$key]['desc_bn']) && !empty($d->desc_bn)) {
                        $vocabMap[$key]['desc_bn'] = trim($d->desc_bn);
                    }
                    if (empty($vocabMap[$key]['image']) && !empty($d->image)) {
                        $vocabMap[$key]['image'] = str_starts_with($d->image, 'http') ? $d->image : asset($d->image);
                    }
                }
            }

            // 2. Questions (Argomenti / Scheda Esame MCQs)
            $questions = \App\Models\Question::whereNotNull('vocabulary')
                ->orWhere('italian', 'like', '%<u>%')
                ->get(['id', 'chapter', 'chapter_name', 'page_id', 'italian', 'bangla', 'vocabulary', 'image']);

            foreach ($questions as $q) {
                $rawVocab = $q->vocabulary;
                if (is_string($rawVocab)) {
                    $rawVocab = json_decode($rawVocab, true);
                }

                if (is_array($rawVocab) && count($rawVocab) > 0) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['italian_word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bangla_meaning'] ?? $item['bn'] ?? $item['translation'] ?? '');
                        $img = $item['image'] ?? $item['image_path'] ?? $item['img'] ?? $q->image ?? '';

                        if (!$it) continue;
                        $key = mb_strtolower($it);

                        $cleanExampleIt = strip_tags($q->italian ?? '');
                        $cleanExampleBn = strip_tags($q->bangla ?? '');

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
                                'page_id' => $q->page_id,
                                'question_id' => $q->id,
                                'chapter' => $q->chapter_name ?: "Chapter {$q->chapter}",
                                'examples' => [],
                            ];
                        } else {
                            if (empty($vocabMap[$key]['bn']) && !empty($bn)) {
                                $vocabMap[$key]['bn'] = $bn;
                            }
                            if (empty($vocabMap[$key]['image']) && !empty($img)) {
                                $vocabMap[$key]['image'] = str_starts_with($img, 'http') ? $img : asset($img);
                            }
                            if (empty($vocabMap[$key]['page_id']) && !empty($q->page_id)) {
                                $vocabMap[$key]['page_id'] = $q->page_id;
                                $vocabMap[$key]['question_id'] = $q->id;
                                $vocabMap[$key]['target_type'] = 'argomenti';
                            }
                        }

                        if ($cleanExampleIt && count($vocabMap[$key]['examples']) < 5) {
                            $vocabMap[$key]['examples'][] = [
                                'it' => $cleanExampleIt,
                                'bn' => $cleanExampleBn,
                                'chapter' => $q->chapter_name ?: "Chapter {$q->chapter}",
                                'page_id' => $q->page_id,
                                'question_id' => $q->id,
                                'target_type' => 'argomenti',
                                'source' => 'Argomenti MCQ'
                            ];
                        }
                    }
                }

                // Also parse <u> tags if vocabulary JSON was not populated
                if (preg_match_all('/<u>(.*?)<\/u>/i', $q->italian ?? '', $matches)) {
                    foreach ($matches[1] as $underlinedWord) {
                        $cleanWord = trim(strip_tags($underlinedWord));
                        if (!$cleanWord || mb_strlen($cleanWord) < 2) continue;
                        $key = mb_strtolower($cleanWord);

                        if (!isset($vocabMap[$key])) {
                            $cleanExampleIt = strip_tags($q->italian ?? '');
                            $cleanExampleBn = strip_tags($q->bangla ?? '');
                            $vocabMap[$key] = [
                                'word' => $cleanWord,
                                'bn' => '',
                                'desc_it' => $cleanExampleIt,
                                'desc_bn' => $cleanExampleBn,
                                'image' => $q->image ? (str_starts_with($q->image, 'http') ? $q->image : asset($q->image)) : '',
                                'audio' => '',
                                'video' => '',
                                'source' => 'Argomenti MCQ',
                                'target_type' => 'argomenti',
                                'page_id' => $q->page_id,
                                'question_id' => $q->id,
                                'chapter' => $q->chapter_name ?: "Chapter {$q->chapter}",
                                'examples' => [
                                    [
                                        'it' => $cleanExampleIt,
                                        'bn' => $cleanExampleBn,
                                        'chapter' => $q->chapter_name ?: "Chapter {$q->chapter}",
                                        'page_id' => $q->page_id,
                                        'question_id' => $q->id,
                                        'target_type' => 'argomenti',
                                        'source' => 'Argomenti MCQ'
                                    ]
                                ],
                            ];
                        }
                    }
                }
            }

            // 3. Cartelli MCQs
            $cartelliMcqs = \App\Models\CartelloMcq::whereNotNull('vocabulary')
                ->orWhere('question', 'like', '%<u>%')
                ->get(['id', 'page_id', 'question', 'bn_question', 'vocabulary', 'image']);

            foreach ($cartelliMcqs as $cm) {
                $rawVocab = $cm->vocabulary;
                if (is_string($rawVocab)) {
                    $rawVocab = json_decode($rawVocab, true);
                }

                if (is_array($rawVocab) && count($rawVocab) > 0) {
                    foreach ($rawVocab as $item) {
                        $it = trim($item['italian'] ?? $item['word'] ?? $item['it'] ?? '');
                        $bn = trim($item['bangla'] ?? $item['meaning'] ?? $item['bn'] ?? '');
                        $img = $item['image'] ?? $cm->image ?? '';

                        if (!$it) continue;
                        $key = mb_strtolower($it);

                        $cleanExampleIt = strip_tags($cm->question ?? '');
                        $cleanExampleBn = strip_tags($cm->bn_question ?? '');

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
                                'page_id' => $cm->page_id,
                                'question_id' => $cm->id,
                                'chapter' => 'Cartelli Stradali',
                                'examples' => [],
                            ];
                        } else {
                            if (empty($vocabMap[$key]['bn']) && !empty($bn)) {
                                $vocabMap[$key]['bn'] = $bn;
                            }
                            if (empty($vocabMap[$key]['image']) && !empty($img)) {
                                $vocabMap[$key]['image'] = str_starts_with($img, 'http') ? $img : asset($img);
                            }
                            if (empty($vocabMap[$key]['page_id']) && !empty($cm->page_id)) {
                                $vocabMap[$key]['page_id'] = $cm->page_id;
                                $vocabMap[$key]['question_id'] = $cm->id;
                                $vocabMap[$key]['target_type'] = 'cartelli';
                            }
                        }

                        if ($cleanExampleIt && count($vocabMap[$key]['examples']) < 5) {
                            $vocabMap[$key]['examples'][] = [
                                'it' => $cleanExampleIt,
                                'bn' => $cleanExampleBn,
                                'chapter' => 'Cartelli Stradali',
                                'page_id' => $cm->page_id,
                                'question_id' => $cm->id,
                                'target_type' => 'cartelli',
                                'source' => 'Cartelli MCQ'
                            ];
                        }
                    }
                }
            }

            // 4. Manuale Chapters
            $manuales = \App\Models\Manuale::whereNotNull('vocabulary')
                ->get(['id', 'title', 'chapter_number', 'vocabulary', 'image_path']);

            foreach ($manuales as $man) {
                $rawVocab = $man->vocabulary;
                if (is_string($rawVocab)) {
                    $rawVocab = json_decode($rawVocab, true);
                }

                if (is_array($rawVocab) && count($rawVocab) > 0) {
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
                                'page_id' => $man->id,
                                'question_id' => null,
                                'chapter' => $man->title ?? "Chapter {$man->chapter_number}",
                                'examples' => [],
                            ];
                        } else {
                            if (empty($vocabMap[$key]['bn']) && !empty($bn)) {
                                $vocabMap[$key]['bn'] = $bn;
                            }
                            if (empty($vocabMap[$key]['image']) && !empty($img)) {
                                $vocabMap[$key]['image'] = str_starts_with($img, 'http') ? $img : asset($img);
                            }
                        }
                    }
                }
            }

            $list = array_values($vocabMap);
            usort($list, function ($a, $b) {
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
        $query = trim($request->input('q', $request->input('search', '')));
        $letter = strtoupper(trim($request->input('letter', '')));

        $allTerms = $this->getAllVocabularyData();

        if (empty($query) && empty($letter)) {
            return response()->json([
                'status' => 'success',
                'total' => count($allTerms),
                'results' => $allTerms
            ]);
        }

        $filtered = array_filter($allTerms, function ($item) use ($query, $letter) {
            $word = $item['word'] ?? '';
            $bn = $item['bn'] ?? '';
            $descIt = $item['desc_it'] ?? '';
            $descBn = $item['desc_bn'] ?? '';

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
                $descItLower = mb_strtolower($descIt);
                $descBnLower = mb_strtolower($descBn);

                return (
                    str_contains($wordLower, $qLower) ||
                    str_contains($bnLower, $qLower) ||
                    str_contains($descItLower, $qLower) ||
                    str_contains($descBnLower, $qLower)
                );
            }

            return true;
        });

        // Re-index and prioritize exact or prefix matches
        $results = array_values($filtered);
        if ($query) {
            $qLower = mb_strtolower($query);
            usort($results, function ($a, $b) use ($qLower) {
                $aWord = mb_strtolower($a['word']);
                $bWord = mb_strtolower($b['word']);

                $aExact = ($aWord === $qLower);
                $bExact = ($bWord === $qLower);
                if ($aExact !== $bExact) return $aExact ? -1 : 1;

                $aStarts = str_starts_with($aWord, $qLower);
                $bStarts = str_starts_with($bWord, $qLower);
                if ($aStarts !== $bStarts) return $aStarts ? -1 : 1;

                return strcasecmp($a['word'], $b['word']);
            });
        }

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'letter' => $letter,
            'total' => count($results),
            'results' => $results
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
