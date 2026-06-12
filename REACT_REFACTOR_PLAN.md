# React Refactor Plan

**Goal:** Port the Dev Drill app from Vite + vanilla JS to **Vite + React 18 + TypeScript**, with **React Router** for routing and **Jest + React Testing Library** for tests — preserving every behavior, URL, and user's stored progress exactly.

**Not in scope:** Next.js, SSR, state libraries (Redux/Zustand), visual redesign, new features.

---

## 1. Hard constraints (what must not change)

| Invariant | Why |
|---|---|
| `localStorage` keys `srs:<subject>` and the progress shape | Users keep their SM-2 progress through the migration |
| Card IDs and data JSON files | Progress maps to cards by ID; data files are untouched |
| URL structure (`/`, `/:subject`, `/:subject/card-library?filter=…`, `/:subject/card/:id`) | Bookmarks/shared links keep working; `vercel.json` rewrite already covers SPA refresh |
| SM-2 behavior (intervals, graduation, queue mechanics) | The algorithm is the product |
| Visual theme (tiendasbiai palette, Antonio/Inter, One Dark code blocks) | Just shipped; `styles.css` ports as-is |
| Vercel deployment | Vite in, Vite out — build command and `dist/` output unchanged |

---

## 2. Strategy: logic is already React-ready

The codebase divides cleanly:

- **Pure logic** (`srs.js`, `session.js`, `storage.js`, `migrate.js`, `subjects.js`) — no DOM access. Ports to TypeScript nearly mechanically; gets typed and unit-tested first.
- **UI** (`ui.js`, 700 lines of template strings + listeners) — rewritten as components. The render functions already map one-to-one onto components.
- **Glue** (`main.js` route handlers + module-level session state) — becomes React Router routes plus a `useSession` reducer hook.

Because the refactor lands on `main` → auto-deploys, **all work happens on a `react-refactor` branch**. Vercel will build preview deployments for the branch — free staging. Merge only after the final checklist passes.

---

## 3. Target structure

```
app/
├── data/                      # unchanged
├── public/fonts/              # unchanged
├── src/
│   ├── main.tsx               # ReactDOM.createRoot + RouterProvider
│   ├── App.tsx                # route table
│   ├── styles.css             # unchanged (global, class-based)
│   ├── types.ts               # Card, MCQCard, MRCard, Progress, Subject, Rating, …
│   ├── lib/                   # ported pure logic (typed, tested)
│   │   ├── subjects.ts
│   │   ├── srs.ts
│   │   ├── session.ts
│   │   ├── storage.ts
│   │   └── migrate.ts
│   ├── hooks/
│   │   ├── useSubjectData.ts  # resolves :subject param → { subject, cards } (dynamic import, cached)
│   │   ├── useProgress.ts     # progressMap state + save-on-change for a storage key
│   │   └── useSession.ts      # useReducer: queue / phase / stats / learningStreak
│   ├── components/
│   │   ├── RichText.tsx       # renderText port: code fences (Prism), inline code, em/strong
│   │   ├── Badge.tsx, CardMeta.tsx, PhaseBadge.tsx
│   │   ├── GradeButtons.tsx
│   │   ├── OptionsList.tsx    # shared by MCQ / MR / detail views
│   │   └── SessionHeader.tsx
│   └── screens/
│       ├── SubjectPicker.tsx
│       ├── SubjectHome.tsx    # start screen: stats, filters, size, start
│       ├── Session.tsx        # owns useSession; renders Reveal / MCQ / MR phase
│       ├── RevealCard.tsx, MCQCard.tsx, MRCard.tsx
│       ├── Summary.tsx, NothingDue.tsx, EmptySubject.tsx
│       ├── CardLibrary.tsx    # filters via useSearchParams
│       └── CardDetail.tsx
├── jest.config.ts
├── tsconfig.json
├── vite.config.ts             # + @vitejs/plugin-react
└── vercel.json                # unchanged
```

Deleted at the end: `src/ui.js`, `src/main.js`, `src/router.js` (React Router replaces it).

---

## 4. Key design decisions

### Routing (React Router)
```tsx
<Routes>
  <Route path="/" element={<SubjectPicker />} />
  <Route path="/:subject" element={<SubjectLayout />}>   {/* resolves subject, redirects unknown → / */}
    <Route index element={<SubjectHome />} />
    <Route path="card-library" element={<CardLibrary />} />
    <Route path="card/:id" element={<CardDetail />} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```
`SubjectLayout` resolves `useParams().subject` against the registry, loads cards via `useSubjectData`, and provides `{ subject, cards }` through outlet context — the React equivalent of `enterSubject()`. Library filter state moves to `useSearchParams` (replace, not push — same as today's `replaceState`).

### Session state (`useSession` reducer)
The session is a small state machine, so it becomes one reducer instead of module globals:
```ts
type SessionState = {
  queue: Card[];
  phase: 'question' | 'answered';
  picked?: string[];          // MCQ/MR selection for the answered phase
  stats: { reviewed: number; correct: number };
  learningStreak: Record<string, number>;
};
type Action = { type: 'start', queue: Card[] } | { type: 'reveal' }
            | { type: 'pick', options: string[] } | { type: 'grade', rating: Rating };
```
`grade` runs the existing `processGrade` logic (graduation, streaks, advance) and persists via `useProgress`. This is deliberately the React pattern from your study list (reducers, lifting state).

### RichText (the `renderText` port)
Inline parsing (backticks, `*em*`, `**strong**`, newlines) returns real React elements — no HTML strings, no escaping needed (React escapes by default). Fenced code blocks keep using `Prism.highlight`, inserted with `dangerouslySetInnerHTML` — acceptable because the input is our own JSON and Prism output is trusted; documented in the component.

### Types (`types.ts`)
```ts
type BaseCard = { id: string; topic: string; subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard'; question: string;
  explanation: string; tags: string[] };
type RevealCard = BaseCard & { type?: 'reveal'; answer: string };
type MCQCard    = BaseCard & { type: 'multiple-choice'; options: string[]; answer: string };
type MRCard     = BaseCard & { type: 'multiple-response'; options: string[]; answers: string[] };
type Card = RevealCard | MCQCard | MRCard;        // discriminated union — your TS bank in practice
type Progress = { id: string; phase: 'learning' | 'review'; interval: number;
  ease: number; nextDue: number; lastReviewed: number | null; totalSeen: number };
```

---

## 5. Testing (Jest + React Testing Library)

Setup: `jest`, `ts-jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `identity-obj-proxy` (CSS mock). Separate `app/jest.config.ts` so the root Jest config (exercises) stays untouched; `npm test` inside `app/`.

### Unit tests — `lib/` (write these while porting, before any UI)

**`srs.test.ts`**
- learning + easy → graduates immediately, interval 3, due in 3 days
- learning + good ×1 → stays learning, streak 1; ×2 → graduates with interval 2
- learning + hard → streak resets to 0, stays learning
- review + hard → interval ×1.2, ease decreases, floors at 1.3
- review + good → interval ×ease
- review + easy → interval ×ease×1.3, ease caps at 3.0
- `previewIntervals` labels match the grade outcomes
- `getDueCards` returns only `nextDue <= now`, excludes future cards
- `computeStats` counts attempted / mastered (review & ≥7d) / dueToday / inLearning
- legacy Leitner shape (`box`/`correctStreak`) migrates via `getOrCreate`

**`session.test.ts`**
- `getCardType`: explicit type wins; `answers` → multiple-response; `options` → multiple-choice; else reveal
- `applyFilters` by topic / difficulty / type / tag, and combinations
- `buildQueue` respects session size; `Infinity` returns all due
- `advance`: exits removes head; hard re-inserts after 2 positions; good cycles to end; hard with ≤2 remaining clamps correctly

**`storage.test.ts` / `migrate.test.ts`** (jsdom localStorage)
- load returns `{}` on missing/corrupt JSON; save/load round-trips
- migrate copies `srs:all` → `srs:javascript` once; no-ops when target exists; removes the legacy key

### Component tests — realistic scenarios

**`RevealCard`** — question shown, answer hidden → click *Show Answer* → answer + explanation + grade buttons appear → click *Good* → `onGrade('good')` called
**`MCQCard`** — options rendered (shuffle mocked for determinism) → pick wrong option → correct option gets `.correct`, picked gets `.wrong`, "✗ Incorrect" shown → grade buttons present
**`MRCard`** — "Select 2" hint; Submit disabled at 0 and 1 selections, enabled at exactly 2, disabled again after deselect → submit → both correct answers highlighted; wrong pick flagged
**`Session` (integration)** — a 2-card learning session: grade first card *Good* twice across its cycle → graduates; queue empties → Summary shows correct reviewed/accuracy numbers
**`SubjectPicker`** — renders a tile per registry subject with counts; clicking navigates (router memory history)
**`CardLibrary`** — search input updates `?q=`; status chip filters rows; chip counts don't change when other filters applied
**`CardDetail`** — MR card shows all correct options highlighted; unknown id redirects to the library
**`RichText`** — `*em*` → `<em>`, `**strong**` → `<strong>`, backtick chip, fenced block gets Prism markup, asterisk inside backticks NOT emphasized (`` `s3:*` ``)

---

## 6. Phases

**Phase 0 — scaffold (branch `react-refactor`)**
Add deps (`react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`, TS, Jest stack). `tsconfig.json` (strict), `vite.config.ts` with the react plugin, `jest.config.ts`. App still builds with old entry.

**Phase 1 — port `lib/` + unit tests**
Move the five logic modules to `src/lib/*.ts`, add `types.ts`, write all unit tests above. No UI changes yet — old app keeps running against the same logic semantics. *Checkpoint: `npm test` green.*

**Phase 2 — components & screens**
Build leaf components (RichText, badges, buttons) → screens, in this order: CardDetail → CardLibrary (read-only, easy to verify against the live app) → SubjectPicker → SubjectHome → Session screens (most stateful, last). Write component tests alongside.

**Phase 3 — cut over**
`main.tsx` + `App.tsx` routes; `index.html` points at `/src/main.tsx`. Delete `ui.js`, `main.js`, `router.js`. `migrate.ts` runs once at boot (module scope or App effect, before first render of subject screens).

**Phase 4 — verify & merge**
- All Jest suites green
- `npm run build` clean, chunk-per-subject still split (dynamic imports preserved)
- Browser smoke test (same checklist as the multi-subject refactor): picker, JS home with stats intact (progress preserved!), session with all 3 card types, library filters in URL, detail, refresh on deep route via Vercel preview URL
- Update `CLAUDE.md` (structure, commands, testing section)
- Merge to `main` → production deploy

---

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Progress loss for existing users | Storage keys/shapes untouched; Phase 4 smoke test runs against a browser profile with real progress |
| Shuffle nondeterminism breaks tests | Inject/mock the shuffle (seedable or `jest.spyOn(Math, 'random')`) |
| Prism + jsdom friction in Jest | RichText tests assert on token classes, not colors; Prism runs fine in jsdom |
| Vercel preview ≠ production config | Same `vercel.json`, same root dir — previews exercise the identical setup |
| Big-bang risk | Branch + screen-by-screen porting order (read-only screens first) keeps each step verifiable against the live app |

---

## 8. Definition of done

1. Feature parity confirmed against the checklist in Phase 4
2. All unit + component test scenarios passing under Jest
3. TypeScript strict mode, no `any` in `lib/` or screen props
4. Existing localStorage progress visibly intact after deploy
5. CLAUDE.md updated; old vanilla files deleted
