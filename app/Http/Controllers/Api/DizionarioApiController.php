<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dizionario;
use Illuminate\Http\Request;

class DizionarioApiController extends Controller
{
    /**
     * Get dictionary terms with optional search filter.
     */
    public function getTerms(Request $request)
    {
        $search = $request->get('search');
        $query = Dizionario::query();

        if ($search) {
            $query->where('word', 'like', "%{$search}%")
                  ->orWhere('bn', 'like', "%{$search}%")
                  ->orWhere('desc_it', 'like', "%{$search}%")
                  ->orWhere('desc_bn', 'like', "%{$search}%");
        }

        $terms = $query->orderBy('word', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'total_terms' => $terms->count(),
            'data' => $terms
        ]);
    }
}
