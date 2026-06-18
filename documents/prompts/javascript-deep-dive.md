# JavaScript Deep-Dive Prompt

Explain the concept shown in the card below as if you were teaching it to an experienced
developer who wants to understand *why* it works, not just memorize the answer.

Your explanation should:

1. Explain the problem being discussed.
2. Explain why the problem occurs (the underlying language behavior).
3. Explain why the proposed solution / answer works.
4. Mention common mistakes or misconceptions.
5. Keep the explanation concise and practical.

After the explanation, provide a complete JavaScript example that demonstrates the concept.

## Code requirements

- Fully working and runnable as-is in Node.js or the browser console (plain `.js`, no build).
- Include any required code in a single snippet; no external dependencies.
- Use modern JavaScript (ES2020+). Prefer the simplest solution that demonstrates the concept.
- Use `console.log` to make the behavior observable, with brief inline comments on key lines.
- No unnecessary code or abstractions. The code must run without errors. Favor clarity.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/javascript.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: problem / why / why the answer works / common mistakes",
    "example": "```js\n// runnable demo with console.log output noted in comments\n```",
    "resources": [
      { "label": "MDN — <page>", "url": "https://developer.mozilla.org/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` must be a single fenced ```` ```js ```` block.
- `resources`: 1–3 links, prefer MDN (developer.mozilla.org) or tc39 proposals where relevant.

## Card

[paste the card JSON here]
