# Deep-dive authoring prompts

These prompts generate the **deep dive** for a drill card — a teaching-grade write-up
(explanation + runnable example + doc links) shown in a collapsible section on the card
detail page (`/:subject/card/:id`).

## Workflow

1. Pick the prompt for the card's subject (`react-deep-dive.md`, `javascript-deep-dive.md`,
   `typescript-deep-dive.md`, `node-deep-dive.md`, `aws-deep-dive.md`).
2. Paste the card's JSON (from `app/data/<subject>.json`) where the prompt says **Card**.
3. Run it. The model returns a single JSON object.
4. Paste that object into `app/data/deepdives/<subject>.json` under the card's `id`.

## Target shape

Each deep dive is keyed by card id in `app/data/deepdives/<subject>.json`:

```json
{
  "<card-id>": {
    "explanation": "markdown string — problem / why / why the solution works / mistakes",
    "example": "```tsx\n…complete, runnable code…\n```",
    "resources": [
      { "label": "Source — page title", "url": "https://…" }
    ]
  }
}
```

- **`explanation`** — markdown. Supports `**bold**`, `*italic*`, `` `inline code` ``, and
  fenced ```` ```code``` ```` blocks (rendered by `app/src/components/RichText.tsx`).
- **`example`** — a single fenced code block. The renderer adds a **Copy** button, so the
  snippet must be complete and copy-paste runnable. `tsx`/`ts`/`js` all highlight.
- **`resources`** — optional array of `{ label, url }`. Prefer official docs (react.dev,
  developer.mozilla.org, nodejs.org, expressjs.com, typescriptlang.org, docs.aws.amazon.com).

`example` and `resources` are both optional (e.g. AWS scenario cards may have no code).
IDs must already exist in the bank; deep dives never create cards.
