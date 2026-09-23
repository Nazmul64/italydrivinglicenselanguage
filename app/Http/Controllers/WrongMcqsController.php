<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\WrongMcqsApiController;
use Illuminate\Http\Request;

class WrongMcqsController extends Controller
{
    /**
     * Get incorrectly answered MCQs list.
     */
    public function index(Request $request)
    {
        $apiController = app(WrongMcqsApiController::class);
        $res = $apiController->index($request);

        if ($request->wantsJson() || $request->is('api/*')) {
            return $res;
        }

        $responseData = $res->getData();
        $questions = $responseData->data ?? [];

        return view('frontend.screens.wrong_mcqs', compact('questions'));
    }
}
