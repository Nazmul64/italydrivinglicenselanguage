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
        return (new DizionarioController())->searchVocabulary($request);
    }

    /**
     * Search vocabulary endpoint alias.
     */
    public function search(Request $request)
    {
        return (new DizionarioController())->searchVocabulary($request);
    }
}
