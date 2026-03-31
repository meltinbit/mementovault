<?php

namespace App\Http\Controllers;

use App\Models\TrialRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrialRequestController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        TrialRequest::firstOrCreate(['email' => $validated['email']]);

        return back();
    }
}
