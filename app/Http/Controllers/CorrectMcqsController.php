<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\CorrectMcqsApiController;
use Illuminate\Http\Request;

class CorrectMcqsController extends Controller
{
    /**
     * Get correctly answered MCQs list.
     */
    public function index(Request $request)
    {
        $apiController = app(CorrectMcqsApiController::class);
        $res = $apiController->index($request);

        if ($request->wantsJson() || $request->is('api/*')) {
            return $res;
        }

        $responseData = $res->getData();
        $questions = $responseData->data ?? [];

        return view('frontend.screens.correct_mcqs', compact('questions'));
    }
}
