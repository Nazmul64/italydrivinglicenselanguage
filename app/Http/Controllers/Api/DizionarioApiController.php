<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dizionario;
use Illuminate\Http\Request;

class DizionarioApiController extends Controller
{
    public function getTerms()
    {
        $terms = Dizionario::orderBy('term', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $terms
        ]);
    }
}
