# GraphQL Subject — Plan & Progress

Resumable plan for adding **GraphQL** as a new Dev Drill subject (`app/`). Pairs with the deep-dive
runbook in `documents/DEEP_DIVES.md` and the subject architecture in `CLAUDE.md`. Pick up here in a
new session.

## Goal

A new **GraphQL** subject whose question bank is grounded in the **official GraphQL docs**
(graphql.org/learn) **plus typical interview questions**, with a **deep dive on every card**
(GraphQL-focused, copy-paste examples — SDL/query language, plus JS for resolvers/DataLoader — and
1–3 official-doc URLs each).

Adding a subject = **one registry entry + one data file** (`CLAUDE.md`, `src/lib/subjects.ts`). No
screen/route/SRS changes — the picker, library, session, card detail, and deep-dive rendering pick it
up automatically.

**Target: ~72 cards across 9 topics, each with a deep dive.**

## Decisions (confirmed with user)

- Size: **~70 cards** (planned **72**).
- **Cards + deep dives** in this effort (not cards-only).
- Deep-dive examples are GraphQL-focused, copy-paste format, code snippets where useful, doc URLs.

## Progress checklist

- [x] **`graphql` devDependency installed** in `app/package.json` (`^17.0.1`) — used only by the new
  verifier; `import { parse } from 'graphql'` confirmed working (committed in `ce0e9c4`).
- [x] `app/src/lib/subjects.ts` — `graphql` registry entry added (icon `◈`, color `#e10098`).
- [x] `app/data/graphql.json` — bank created and filled: **72 cards**, unique ids, MCQ/MR validated.
- [x] `app/data/deepdives/graphql.json` — deep-dive map: **72 entries, 0 cards missing a deep dive**.
- [x] `app/scripts/verify-graphql-examples.mjs` — verifier added (` ```graphql `→`parse()`, ` ```js `→`node --check`).
- [x] `app/src/components/RichText.tsx` — Prism `graphql` grammar registered.
- [x] Topics 1–9 authored (cards + deep dives), verified (`✓ All examples parse clean`), committed per topic.
- [x] `CLAUDE.md` + `documents/DEEP_DIVES.md` updated; typecheck clean, 117/117 tests pass, coverage 72/72.

**Status: COMPLETE.** All 9 topics authored, verified, and committed; docs updated.

## Subject registration

`app/src/lib/subjects.ts` — add (mirrors the existing five entries):

```ts
graphql: {
  id: 'graphql', label: 'GraphQL', icon: '◈', color: '#e10098', // official GraphQL pink
  storageKey: 'srs:graphql',
  loadData: loader('graphql', () => load(import('../../data/graphql.json'))),
},
```

`icon` renders as text in the tile — `'◈'` reads as a graph node; `'GQ'` is a fine alternative (matches
the JS/TS/No 2-letter style).

## Card shapes (`app/src/types.ts`)

Discriminated union — `reveal` (default, `answer`), `multiple-choice` (`options` + `answer`),
`multiple-response` (`options` + `answers`). `difficulty`: `easy|medium|hard`. IDs unique within the
subject. **ID pattern:** `graphql-<topic>-NNN`, `graphql-<topic>-mcq-NNN`, `graphql-<topic>-mr-NNN`.
Type mix ≈ 60% reveal / 30% MCQ / 10% multiple-response (MR good for "select all valid scalars",
"which support fragments", etc.). Code in question/answer/explanation goes in ```graphql / ```js fences.

## Topic breakdown (~72 cards)

| # | Topic | `<topic>` id | Cards | Coverage |
|---|---|---|---|---|
| 1 | Introduction & GraphQL vs REST | `intro` | 8 | what GraphQL is, single endpoint, over/under-fetching, type system & spec, strongly-typed, not a DB, GraphQL vs REST trade-offs |
| 2 | Queries | `query` | 10 | fields, arguments, aliases, fragments, variables, default vars, directives (`@include`/`@skip`), operation name, meta field `__typename` |
| 3 | Mutations | `mutation` | 6 | writing data, input types, returning modified data, multiple mutation fields run **serially**, naming conventions |
| 4 | Schema & Type System | `schema` | 12 | SDL, object types & fields, built-in scalars, custom scalars, enums, lists & non-null (`[T!]!`), interfaces, unions, input types, `Query`/`Mutation`/`Subscription` root types |
| 5 | Resolvers & Execution | `resolver` | 9 | resolver signature `(parent, args, context, info)`, default/trivial resolvers, async resolvers, execution/resolution order, context, scalar coercion, field error propagation & nullability |
| 6 | Subscriptions & Real-time | `sub` | 5 | what they are, WebSockets transport, pub/sub, when to use vs polling, scaling caveats |
| 7 | Performance: N+1, DataLoader, Caching | `perf` | 8 | the N+1 problem, DataLoader batching+caching, per-request loader instances, response/field caching, persisted queries, query cost |
| 8 | Best Practices & Security | `bp` | 8 | cursor/connection pagination, error handling (`errors` array + partial data), nullability strategy, versioning (evolve don't version), depth/complexity limiting, rate limiting, auth in context, introspection in prod |
| 9 | Ecosystem & Tooling | `eco` | 6 | Apollo vs Relay, introspection & GraphiQL, schema-first vs code-first, codegen, federation (composing subgraphs), `graphql-js` reference impl |

## Deep dives (one per card)

Stored in `app/data/deepdives/graphql.json`, authored per topic with `app/scripts/dd-batch.mjs`
(set `subject = 'graphql'`). House quality bar (see `documents/DEEP_DIVES.md`):

- **explanation** — markdown, problem → why it happens → why the solution works → common mistakes,
  with **colon-ending bold labels** (`**The problem:** …`) so the `DeepDive` spacing regex fires
  (`src/components/DeepDive.tsx` matches `:**`).
- **example** — one fenced, copy-paste-ready block: **```graphql** for SDL/queries/mutations (common
  case), **```js** for resolver/DataLoader/server snippets. Conceptual cards (e.g. "GraphQL vs REST")
  may omit `example`.
- **resources** — 1–3 official links, preferring **graphql.org/learn/**, plus
  **apollographql.com/docs** and **graphql-js.org** where apt.

## New verifier: `app/scripts/verify-graphql-examples.mjs`

The existing verifiers don't fit GraphQL (`verify-deepdive-examples.mjs` = tsx type-check;
`verify-node-examples.mjs` = `node --check`). Mirror the `verify-node-examples.mjs` harness, but route
by fence language:

- **```graphql → `parse()` from the `graphql` package** — validates type-system SDL *and*
  executable-document syntax without needing a schema. (`import { parse } from 'graphql'`.)
- **```js → `node --check`** (write temp file, syntax-only).

Report failing ids; print `✓ All examples parse clean.` Usage: `node scripts/verify-graphql-examples.mjs graphql`.

## Prism highlighting

`app/src/components/RichText.tsx` currently imports `prism-javascript/typescript/jsx/tsx` and falls
back to JS for other languages. Add `import 'prismjs/components/prism-graphql';` so ```graphql blocks
highlight correctly in cards and deep dives. Low-risk.

## Per-topic execution recipe

1. `cd app` and read nothing extra — author that topic's cards directly into `data/graphql.json`
   (append to the array; keep the file valid JSON).
2. Fill `scripts/dd-batch.mjs` (`subject = 'graphql'`) with the topic's deep dives →
   `node scripts/dd-batch.mjs` (merges into `data/deepdives/graphql.json`).
3. `node scripts/verify-graphql-examples.mjs graphql` → aim for "✓ All examples parse clean."
4. Spot-check a few GraphQL snippets are idiomatic (self-review; SDL/queries aren't executed).
5. Commit `data/graphql.json` + `data/deepdives/graphql.json` per topic
   (`git commit -m "add graphql <topic> cards + deep dives"`).
6. After `dd-batch.mjs` runs, `git checkout app/scripts/dd-batch.mjs` to reset it to the template.

## Docs to update (after all topics)

- **`CLAUDE.md`** — add `graphql` to the subject-registry example, the "Current subjects" line, the
  question-banks table (new row), and the deep-dive **status** line; mention `verify-graphql-examples.mjs`.
- **`documents/DEEP_DIVES.md`** — add a GraphQL status section; note the new verifier + the `graphql`
  devDep, and that ```graphql examples are syntax-checked via `parse()` (not executed).

## Verification (end to end)

- `cd app && node scripts/verify-graphql-examples.mjs graphql` → all parse clean.
- Coverage: every card id has a deep-dive entry:
  `node -e "const c=require('./data/graphql.json'),d=require('./data/deepdives/graphql.json');console.log(c.length, Object.keys(d).length, c.filter(x=>!d[x.id]).length)"`
- `npm run typecheck` (subjects.ts edit) and `npm test` (routing tests mock `lib/subjects`; confirm green).
- `npm run dev` → `/` shows the GraphQL tile with a count; `/graphql`, library, a session, and a card
  detail render the 📘 Deep Dive with ```graphql code + Copy button + resource links. (Playwright MCP can screenshot.)

## Out of scope (note only)

- Backend seed (`backend/scripts/seed-cards.mjs`) unnecessary — bundled JSON is the source of truth and
  `VITE_CARDS_FROM_API` is off by default. Seed later if cloud cards are enabled.
- No new screens/routes/SRS logic.

## Source references

- Official docs: https://graphql.org/learn/ (Introduction, Queries, Mutations, Schemas & Types,
  Subscriptions, Validation, Execution, Best Practices), https://graphql-js.org/docs/ , Apollo docs
  https://www.apollographql.com/docs/ (schema design, DataLoader/N+1, federation).
- Interview staples: N+1 + DataLoader, resolvers, fragments, subscriptions, caching, auth, schema
  design, GraphQL vs REST (Turing, Apollo, Postman, Devinterview-io question lists).
