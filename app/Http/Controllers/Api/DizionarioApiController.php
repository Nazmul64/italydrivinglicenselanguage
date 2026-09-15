<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DizionarioController;
use App\Models\Dizionario;
use Illuminate\Http\Request;

class DizionarioApiController extends Controller
{
    /**
     * Get dictionary terms with optional search filter or return all compiled vocabulary.
     */
    public function getTerms(Request $request)
    {
        $search = trim((string)($request->get('search') ?: $request->get('q') ?: $request->get('query') ?: $request->get('word') ?: $request->get('term') ?: ''));
        $letter = strtoupper(trim((string)($request->get('letter') ?: '')));

        $dizionarioController = new DizionarioController();
        $allVocab = $dizionarioController->getAllVocabularyData();

        if (empty($search) && empty($letter)) {
            return response()->json([
                'status' => 'success',
                'total_terms' => count($allVocab),
                'total' => count($allVocab),
                'data' => $allVocab,
                'results' => $allVocab,
                'words' => $allVocab
            ]);
        }

        $filtered = array_filter($allVocab, function ($item) use ($search, $letter) {
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

            if ($search) {
                $qLower = mb_strtolower($search);
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

        $results = array_values($filtered);
        if ($search) {
            $qLower = mb_strtolower($search);
            usort($results, function ($a, $b) use ($qLower) {
                $aWord = mb_strtolower($a['word'] ?? '');
                $bWord = mb_strtolower($b['word'] ?? '');

                $aExact = ($aWord === $qLower);
                $bExact = ($bWord === $qLower);
                if ($aExact !== $bExact) return $aExact ? -1 : 1;

                $aStarts = str_starts_with($aWord, $qLower);
                $bStarts = str_starts_with($bWord, $qLower);
                if ($aStarts !== $bStarts) return $aStarts ? -1 : 1;

                return strcasecmp($a['word'] ?? '', $b['word'] ?? '');
            });
        }

        return response()->json([
            'status' => 'success',
            'query' => $search,
            'letter' => $letter,
            'total_terms' => count($results),
            'total' => count($results),
            'data' => $results,
            'results' => $results,
            'words' => $results
        ]);
    }

    /**
     * Search vocabulary endpoint alias.
     */
    public function search(Request $request)
    {
        return $this->getTerms($request);
    }
}
