# Node.js Deep-Dive Prompt

Explain the concept shown in the card below as if you were teaching it to an experienced
developer who wants to understand *why* it works, not just memorize the answer.

Your explanation should:

1. Explain the problem being discussed.
2. Explain why the problem occurs (event loop, modules, streams, etc. — the Node runtime).
3. Explain why the proposed solution / answer works.
4. Mention common mistakes or misconceptions.
5. Keep the explanation concise and practical.

After the explanation, provide a complete Node.js example that demonstrates the concept.

## Code requirements

- A self-contained script runnable with `node script.js` (or note `node --experimental` flags
  if truly required). Express examples may assume `express` is installed; say so in a comment.
- Use modern JavaScript (ES modules or CommonJS — match what the concept is about; state which).
- Use core modules only unless the card is specifically about a package (e.g. Express).
- Use `console.log` / observable output so the behavior is clear; brief inline comments on key lines.
- Prefer the simplest example. The code must run without errors. Favor clarity over cleverness.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/node.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: problem / why / why the answer works / common mistakes",
    "example": "```js\n// runnable node script; note module system + any flags in comments\n```",
    "resources": [
      { "label": "Node.js docs — <page>", "url": "https://nodejs.org/api/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` must be a single fenced ```` ```js ```` block.
- `resources`: 1–3 links, prefer nodejs.org/api or expressjs.com.

## Card

[paste the card JSON here]
