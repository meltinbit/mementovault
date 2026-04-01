<?php

namespace App\Http\Controllers;

use App\Models\TrialRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrialRequestController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        TrialRequest::firstOrCreate(['email' => $validated['email']]);

        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if ($botToken && $chatId) {
            try {
                $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => "📩 [Memento Vault] New trial request\n✉️ {$validated['email']}",
                ]);

                if ($response->failed()) {
                    Log::error('Telegram notification failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Telegram notification exception', ['message' => $e->getMessage()]);
            }
        }

        return back();
    }
}
