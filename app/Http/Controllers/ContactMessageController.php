<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContactMessageController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        ContactMessage::create($validated);

        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if ($botToken && $chatId) {
            try {
                Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => "💬 [Memento Vault] New contact message\n👤 {$validated['name']}\n✉️ {$validated['email']}\n\n{$validated['message']}",
                ]);
            } catch (\Throwable $e) {
                Log::error('Telegram contact notification failed', ['message' => $e->getMessage()]);
            }
        }

        return back();
    }
}
