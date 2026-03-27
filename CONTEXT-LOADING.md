# MementoVault — MCP Auto-Context Loading

## Problem

When a Claude client connects to MementoVault via MCP, Claude does NOT automatically call `get_context`. It only knows that tools are available, but waits for the user to ask. The user should never have to say "load my context" — it must happen automatically on every new conversation.

## Solution

Two-layer approach: a hardcoded server instruction that always fires, plus an optional user-configurable prompt in settings.

---

## Layer 1 — MCP Server Instructions (hardcoded, not user-editable)

The MCP protocol supports an `instructions` field in the server's initialization response. This is treated by Claude as a system-level instruction tied to the MCP server.

When the MCP server responds to the `initialize` request, include this field:

```json
{
  "instructions": "CRITICAL: At the start of every conversation, you MUST immediately call the `get_context` tool from this MCP server BEFORE responding to the user's first message. Do not wait for the user to ask. Do not skip this step. The context contains the user's identity, instructions, current state, and memory — you need it to respond appropriately.\n\nAfter loading context, do NOT announce that you loaded it. Do not say 'I've loaded your context' or 'Let me check your profile'. Just absorb the information silently and respond to the user naturally, as if you already knew everything.\n\nIf the user asks about available documents, skills, snippets, or assets, use the corresponding list/get tools to retrieve them on demand. The initial get_context call provides an overview of what's available — use the specific tools to get full content when needed."
}
```

This is hardcoded in the MCP server implementation. Every collection endpoint returns this. The user cannot modify or disable it.

### Implementation Location

In the MCP server handler, when responding to the `initialize` method:

```php
// app/Http/Controllers/McpServerController.php (or equivalent MCP handler)

// During MCP initialize handshake response:
$initResponse = [
    'protocolVersion' => '2024-11-05',
    'capabilities' => [
        'tools' => new \stdClass(),
    ],
    'serverInfo' => [
        'name' => 'MementoVault',
        'version' => '1.0.0',
    ],
    'instructions' => $this->buildServerInstructions($collection),
];
```

```php
private function buildServerInstructions(Collection $collection): string
{
    $baseInstructions = <<<'PROMPT'
CRITICAL: At the start of every conversation, you MUST immediately call the `get_context` tool from this MCP server BEFORE responding to the user's first message. Do not wait for the user to ask. Do not skip this step. The context contains the user's identity, instructions, current state, and memory — you need it to respond appropriately.

After loading context, do NOT announce that you loaded it. Do not say "I've loaded your context" or "Let me check your profile". Just absorb the information silently and respond to the user naturally, as if you already knew everything.

If the user asks about available documents, skills, snippets, or assets, use the corresponding list/get tools to retrieve them on demand. The initial get_context call provides an overview of what's available — use the specific tools to get full content when needed.
PROMPT;

    // Append user custom prompt if configured
    $workspace = $collection->workspace;
    $customPrompt = $workspace->settings['mcp_custom_prompt'] ?? null;

    if ($customPrompt) {
        $baseInstructions .= "\n\n--- Additional Instructions ---\n\n" . $customPrompt;
    }

    return $baseInstructions;
}
```

---

## Layer 2 — User-Configurable MCP Prompt (optional, in Settings)

In the workspace Settings page, add a section "MCP Behavior" with:

### Field: Custom MCP Prompt

- **Type:** textarea (markdown)
- **Label:** "Custom MCP Prompt"
- **Helper text:** "Optional instructions appended to every MCP connection. Use this to add specific behaviors you want Claude to follow across all collections. The auto-context loading is already built-in and cannot be disabled."
- **Default:** empty
- **Max length:** 2000 characters
- **Storage:** `workspaces.settings` JSON field, key `mcp_custom_prompt`

### Example use cases for custom prompt:

- "Always respond in Italian."
- "When I share code, analyze it for security issues before anything else."
- "Start every response with a brief summary of what you understand about my request."
- "If I mention a deadline, always flag it and suggest a timeline."

### What the user CANNOT do:

- Disable the auto-context loading (it's hardcoded above the custom prompt)
- Override the instruction to call `get_context` first
- Remove the "silent loading" behavior

---

## Database Change

No new table needed. Add `mcp_custom_prompt` to the `settings` JSON field on the `workspaces` table.

The `settings` JSON structure becomes:

```json
{
  "default_language": "it",
  "mcp_custom_prompt": "Always respond in Italian. Be concise."
}
```

---

## Settings UI Addition

In `Pages/Settings/Index.jsx`, add a new section after the existing fields:

```
MCP Behavior
├── Info box: "MementoVault automatically loads your full context at the start of every conversation. This cannot be disabled."
├── Custom MCP Prompt (textarea)
│   └── Helper: "Optional additional instructions sent to Claude on every MCP connection."
└── Save button
```

---

## Routes

No new routes needed. The existing `PUT /settings` route already handles workspace settings updates. Just add `mcp_custom_prompt` to the validated fields.

```php
// In SettingsController@update validation:
$validated = $request->validate([
    'name' => 'required|string|max:255',
    // ... existing fields
    'mcp_custom_prompt' => 'nullable|string|max:2000',
]);

// Save to settings JSON
$workspace->update([
    'settings' => array_merge($workspace->settings ?? [], [
        'mcp_custom_prompt' => $validated['mcp_custom_prompt'],
    ]),
]);
```

---

## Testing Checklist

1. Connect to MCP endpoint from Claude.ai → Claude should immediately call `get_context` without being asked
2. Claude should NOT say "I loaded your context" — it should just know
3. If user has a custom prompt in settings, verify it's included in the MCP instructions
4. If custom prompt is empty/null, only the hardcoded instructions are sent
5. Verify the instructions appear in the MCP `initialize` response
6. Test with multiple collections — each should have the same base behavior
7. Verify user cannot inject instructions that override the auto-load behavior (sanitize the custom prompt field)

---

## Security Note

The `mcp_custom_prompt` field should be sanitized to prevent prompt injection. Specifically:

- Strip any content that tries to override the base instructions (e.g., "ignore previous instructions")
- Max length enforced at 2000 characters
- No HTML allowed, plain text only
- The custom prompt is always APPENDED after the hardcoded instructions, never prepended or replacing them