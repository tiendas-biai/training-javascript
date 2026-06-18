# TypeScript Deep-Dive Prompt

Explain the concept shown in the card below as if you were teaching it to an experienced
developer who wants to understand *why* it works, not just memorize the answer.

Your explanation should:

1. Explain the problem being discussed.
2. Explain why the problem occurs (what the type system is doing).
3. Explain why the proposed solution / answer works.
4. Mention common mistakes or misconceptions (e.g. type vs. runtime, structural typing).
5. Keep the explanation concise and practical.

After the explanation, provide a complete TypeScript example that demonstrates the concept.

## Code requirements

- A self-contained `.ts` snippet that compiles under `strict` mode with no errors.
- Include all required types/imports in a single snippet; no external dependencies.
- Where it clarifies the concept, show what the compiler *rejects* via a commented
  `// @ts-expect-error` line next to the offending statement.
- Prefer the simplest example. Use `console.log` only when runtime behavior matters.
- No unnecessary abstractions. Favor clarity over cleverness.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/typescript.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: problem / why / why the answer works / common mistakes",
    "example": "```ts\n// compiles under strict; @ts-expect-error marks intentional rejects\n```",
    "resources": [
      { "label": "TypeScript Handbook — <page>", "url": "https://www.typescriptlang.org/docs/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` must be a single fenced ```` ```ts ```` block.
- `resources`: 1–3 links, prefer typescriptlang.org (Handbook / Reference).

## Card

[paste the card JSON here]
