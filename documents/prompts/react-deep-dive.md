# React Deep-Dive Prompt

Explain the concept shown in the card below as if you were teaching it to an experienced
developer who wants to understand *why* it works, not just memorize the answer.

Your explanation should:

1. Explain the problem being discussed.
2. Explain why the problem occurs.
3. Explain why the proposed solution works.
4. Mention common mistakes or misconceptions.
5. Keep the explanation concise and practical.

After the explanation, provide a complete React + TypeScript example that demonstrates the
concept.

## Code requirements

- Fully working and ready to copy-paste directly into `src/App.tsx`.
- Start with `export default function App() {`.
- Include all required imports; keep everything in a single file; use TypeScript.
- Use modern React with hooks. Prefer the simplest solution that demonstrates the concept.
- Make it interactive when appropriate so the behavior can be observed.
- No CSS/styling unless necessary for understanding. Favor clarity over cleverness.
- Avoid custom hooks/helpers/abstractions unless essential. The code must compile without errors.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/react.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: problem / why / why the solution works / common mistakes",
    "example": "```tsx\nexport default function App() {\n  …\n}\n```",
    "resources": [
      { "label": "react.dev — <page>", "url": "https://react.dev/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` must be the full tsx file inside a single fenced ```` ```tsx ```` block.
- `resources`: 1–3 links, prefer https://react.dev (fall back to MDN for web APIs).

## Card

[paste the card JSON here]
