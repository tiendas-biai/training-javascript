# Auth0 Login + Per-User Cloud Progress — Implementation Plan

Status: **Draft / planning** · Owner: Mario · Target app: `app/` (Dev Drill)
Reference implementations:
- `../tiendasbiai-contabilidad` — **CRA + React + Redux/RTK Query** storefront (`@auth0/auth0-react`, SAM Lambda + DynamoDB, Django-backed per-user data)
- `../validayarumal` — **Vite + vanilla TS** game (`@auth0/auth0-spa-js` singleton, self-contained SAM Lambda + DynamoDB scores)

The two share one Auth0 tenant (`entornobiai`), the `VITE_*`/`REACT_APP_*` env conventions,
and the `sam build && sam deploy --config-env dev|prod` workflow. The game is the closer
match to **our** stack (Vite), so we borrow its infra shape; the storefront is the closer
match to **our** framework (React), so we borrow its component patterns.

---

## 1. Goal

Let signed-in users study with their progress stored **in the cloud** (so it
follows them across devices/browsers), while **anonymous users keep working
exactly as today** against `localStorage`. As a second track, move the question
banks into **DynamoDB** behind a **Lambda API**, mirroring the patterns already
proven in `tiendasbiai-contabilidad`.

Three deliverables, shippable independently:

1. **Auth0 login** in the Vite/React app (login/logout, token acquisition).
2. **Per-user progress API** (Lambda + DynamoDB) with a storage abstraction so
   `useProgress` transparently uses the API when authenticated, `localStorage`
   when not.
3. **Questions in DynamoDB** (Lambda + DynamoDB) — JSON stays the seed source of
   truth, synced up to a table the app can read at runtime.

---

## 2. What the reference repos do (and what we reuse vs. adapt)

| Concern | Source | Reuse / Adapt |
|---|---|---|
| Auth0 provider wrapper | storefront `src/components/AuthComponents/Auth0ProviderWithNavigate.tsx` | **Reuse** (adapt env access) |
| Route guard | storefront `AuthenticationGuard.tsx` (`withAuthenticationRequired`) | **Reuse** |
| Login/Logout buttons | storefront `{LoginButton,LogoutButton}.tsx` | **Adapt** (drop MUI, use our CSS classes) |
| Token acquisition | storefront `useUpdateAuthToken.ts` (`getAccessTokenSilently` → Redux) | **Adapt** (no Redux — see §4.3) |
| API client w/ bearer token | storefront `src/services/*/*.ts` (`fetchBaseQuery` + `prepareHeaders`) | **Adapt** (lightweight fetch, no RTK Query) |
| **Vite-native Auth0 singleton** | game `src/shared/systems/auth.ts` (`createAuth0Client`, redirect login, `cacheLocation: "localstorage"`, `handleRedirectCallback`) | **Reference** — confirms our env/redirect approach (§4.4) |
| Lambda router pattern | storefront `lambda/items/index.mjs` + `handlers/` + `utils/` | **Reuse** the structure |
| DynamoDB client | storefront `lambda/items/utils/dynamo.mjs` (`@aws-sdk/client-dynamodb`) | **Reuse** |
| CORS / response helpers | storefront `lambda/items/utils/response.mjs` | **Reuse** |
| **Self-contained SAM template (creates its own table)** | game `infra/template.yaml` (`AWS::DynamoDB::Table`, `PAY_PER_REQUEST`, GSI) | **Reuse as the template base** (§7) |
| **"Keep best" conditional upsert** | game `infra/scores/index.mjs` (GetItem → compare → Put) | **Reference** for the merge rule (§5.4) |
| Deploy | `cd <infra> && sam build && sam deploy --config-env dev\|prod` | **Reuse** the workflow |

The storefront's `lambda/template.yaml` *references* pre-existing tables via params; the
game's `infra/template.yaml` *creates* its table (with `PAY_PER_REQUEST` + a leaderboard
GSI) in the same stack. Since we need **new** tables, the game's template is the better
starting point.

### Critical differences to design around

1. **No Django, no Redux in our app.** The reference validates JWTs in Django and
   keeps the token in a Redux slice. We have neither. Therefore:
   - **JWT must be validated at the API Gateway** (HTTP API **JWT authorizer**
     pointing at the Auth0 issuer + audience). The Lambda then trusts
     `event.requestContext.authorizer.jwt.claims.sub` as the user id. This is the
     security backbone of per-user data — without it, anyone could read anyone's
     progress.
   - Token handling uses `@auth0/auth0-react`'s `getAccessTokenSilently()`
     directly in our fetch client (no Redux needed). See §4.3.

2. **Build tool is Vite, not CRA.** Env vars are `VITE_*` accessed via
   `import.meta.env`, not `REACT_APP_*` via `process.env`.

3. **Frontend deploys to Vercel; backend is separate AWS.** CORS `ALLOWED_ORIGINS`
   must include `http://localhost:5173` and `https://training-javascript-one.vercel.app`.

---

## 3. Target architecture

```
   Browser (Vite SPA on Vercel)
        |
        |  anonymous  ───────────────►  localStorage  (unchanged, today's behavior)
        |
        |  authenticated
        v
   Auth0 (Universal Login)  ──►  JWT access token (audience: dev-drill-api)
        |
        v
   API Gateway (HTTP API, us-east-1)  ── JWT authorizer (Auth0) ──┐
        |                                                          │ validates token,
        +──►  ProgressFunction (Lambda)  ──►  DynamoDB drill-progress-{env}
        |          per-user read/write, userId = claims.sub        │
        +──►  CardsFunction (Lambda)     ──►  DynamoDB drill-cards-{env}
                   GET public; POST/PUT/DELETE admin-only
```

**Storage decision tree (the heart of the feature):**

```
useProgress(subject)
  └─ isAuthenticated ?
       ├─ yes → RemoteProgressStore (API, token from getAccessTokenSilently)
       └─ no  → LocalProgressStore   (localStorage, exactly as today)
```

---

## 4. Track 1 — Auth0 login (frontend)

### 4.1 Auth0 tenant setup (one-time, console)

- Create a **Single Page Application**.
  - Allowed Callback URLs: `http://localhost:5173`, `https://training-javascript-one.vercel.app`
  - Allowed Logout URLs: same two
  - Allowed Web Origins: same two
- Create an **API** (the audience), e.g. identifier `https://dev-drill-api`, signing **RS256**.
- (Optional, for card editing) Define an `admin` role / `manage:cards` permission and
  assign to your user. Enable "Add Permissions in the Access Token" / RBAC on the API.

### 4.2 Env vars (Vite — `app/.env`, and Vercel project settings)

```
VITE_AUTH0_DOMAIN=dev-xxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxx
VITE_AUTH0_AUDIENCE=https://dev-drill-api
VITE_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com/dev
# callback derived from window.location.origin (no separate var needed)
```

Add a `app/.env.example` documenting these. Remember: anything `VITE_*` is **public**
(inlined into the bundle) — that's fine for Auth0 SPA config and the API URL.

### 4.3 New / changed frontend files

```
app/src/
├── auth/
│   ├── Auth0ProviderWithNavigate.tsx   # adapted from reference; reads import.meta.env
│   ├── AuthButtons.tsx                 # Login + Logout + user avatar (our CSS, no MUI)
│   └── config.ts                       # reads & validates VITE_AUTH0_* / VITE_API_URL
├── lib/
│   ├── apiClient.ts                    # fetch wrapper that attaches Bearer token
│   └── progress/
│       ├── types.ts                    # ProgressStore interface
│       ├── localStore.ts               # wraps existing storage.ts (anonymous)
│       └── remoteStore.ts              # calls the progress API (authenticated)
└── main.tsx                            # wrap <App/> in <Auth0ProviderWithNavigate>
```

**`main.tsx`** — the provider must sit **inside** `BrowserRouter` (it uses `useNavigate`):

```tsx
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
);
```

**`Auth0ProviderWithNavigate.tsx`** — same as reference, but:
- `redirect_uri: window.location.origin`
- `cacheLocation="localstorage"` + `useRefreshTokens` (recommended so the session
  survives reloads/tab closes; otherwise silent-auth via iframe can be blocked by
  browser third-party-cookie rules).

**`apiClient.ts`** — replaces RTK Query's `prepareHeaders` pattern:

```ts
// Given a token-getter from useAuth0(), returns a typed fetch helper.
export function makeApiClient(getToken: () => Promise<string>) {
  return async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.status === 204 ? (undefined as T) : res.json();
  };
}
```

**`AuthButtons.tsx`** — `loginWithRedirect`, `logout({ logoutParams: { returnTo: origin } })`,
and show `user.name`/avatar when authenticated. Place in the headers of `SubjectPicker`
and `SubjectLayout` (next to the existing "← Subjects" / title).

> Login is **not** required anywhere. Guards (`AuthenticationGuard`) are only needed if
> we later add an admin-only "edit cards" screen.

### 4.4 Which Auth0 SDK — two proven patterns to choose from

We have a working precedent for each, both on the same tenant:

| | `@auth0/auth0-react` (storefront) | `@auth0/auth0-spa-js` (game) |
|---|---|---|
| Style | React provider + hooks (`useAuth0`) | Framework-agnostic singleton (`AuthManager`) |
| Token for API | `getAccessTokenSilently()` | `getTokenSilently()` |
| Reactivity | Re-renders on auth state change (built-in) | Manual — you poll `isAuthenticated()` |
| Fit for us | **Natural** — we're React, need `isAuthenticated` reactive in `useProgress` | Works, but we'd hand-roll the React glue |

**Recommendation: `@auth0/auth0-react`** (storefront pattern). Our `useProgress` rewrite
(§5.2) depends on `isAuthenticated`/`isLoading` reacting automatically — exactly what the
hook gives us. The game's singleton is great for a non-React canvas game but would force us
to rebuild that reactivity by hand.

What we still take from the **game's** Auth0 code: it confirms our environment exactly —
`import.meta.env.VITE_AUTH0_*`, **redirect** login (popups are blocked by default),
`cacheLocation: "localstorage"` to survive reloads, and handling the `?code=&state=`
callback on `origin + pathname`. These map 1:1 onto the `Auth0Provider` config in §4.3.

---

## 5. Track 2 — Per-user progress (the localStorage ↔ cloud switch)

### 5.1 The storage seam

Today every screen reads/writes progress through **one hook**:
`useProgress(storageKey)` → `{ progressMap, update, reset }` (`app/src/hooks/useProgress.ts`),
backed by `app/src/lib/storage.ts` (localStorage keyed `srs:<subject>`). **This hook is
the only thing that has to change.** Screens (`SubjectHome`, `Session`) keep calling it.

Define a common interface:

```ts
export interface ProgressStore {
  load(): Promise<StoredProgressMap>;            // all progress for this subject
  save(id: string, progress: Progress): Promise<void>;  // upsert one card
  reset(): Promise<void>;                          // clear this subject
}
```

- `LocalProgressStore(storageKey)` — thin async wrapper over the current
  `loadProgress`/`saveProgress`/`clearProgress`. Behavior identical to today.
- `RemoteProgressStore(subject, api)` — hits the progress API (§5.3).

### 5.2 `useProgress` rewrite (async-aware)

```ts
export function useProgress(subject: Subject) {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [progressMap, setProgressMap] = useState<StoredProgressMap>({});
  const [loading, setLoading] = useState(true);

  const store = useMemo<ProgressStore>(() =>
    isAuthenticated
      ? new RemoteProgressStore(subject, makeApiClient(getAccessTokenSilently))
      : new LocalProgressStore(subject.storageKey),
    [isAuthenticated, subject /* , token getter */]);

  useEffect(() => {
    if (isLoading) return;                 // wait for Auth0 to settle
    let alive = true;
    setLoading(true);
    store.load().then(m => { if (alive) { setProgressMap(m); setLoading(false); } });
    return () => { alive = false; };
  }, [store, isLoading]);

  const update = useCallback((id, progress) => {
    setProgressMap(prev => ({ ...prev, [id]: progress })); // optimistic
    void store.save(id, progress);                          // fire-and-forget + retry queue
  }, [store]);

  const reset = useCallback(() => { setProgressMap({}); void store.reset(); }, [store]);

  return { progressMap, update, reset, loading };
}
```

**Consumer impact:** `useProgress` becomes briefly async for authenticated users.
`SubjectHome` and `Session` already tolerate a "not ready yet" state for cards
(`useSubjectData` returns `null`); add the same guard for `loading` (show the existing
spinner/skeleton). This is the main non-trivial refactor and needs a test.

**Write strategy:** optimistic local state update + background `save`. Wrap `save`
in a small **retry/queue** so a dropped request (offline, token refresh) doesn't lose a
grade; on failure, keep the optimistic value and retry with backoff. Anonymous path is
synchronous as today.

### 5.3 Progress API (Lambda + DynamoDB)

**DynamoDB table `drill-progress-{env}`** (per-card items — DynamoDB-native, cheap
partial writes):

| Attribute | Role | Example |
|---|---|---|
| `userId` (PK) | Auth0 `sub` | `auth0\|abc123` |
| `cardKey` (SK) | `<subject>#<cardId>` | `react#react-hooks-001` |
| `phase`,`interval`,`ease`,`nextDue`,`lastReviewed`,`totalSeen` | SM-2 state | — |

- **GET `/progress/{subject}`** → `Query` PK=`userId`, SK `begins_with "<subject>#"`,
  return as `{ [cardId]: Progress }` (exactly the shape `useProgress` holds today).
- **PUT `/progress/{subject}/{cardId}`** → `PutItem` one row.
- **DELETE `/progress/{subject}`** → `Query` + `BatchWriteItem` deletes (or a TTL/blob —
  see alternative). Backs "Reset all progress".

> **Alternative (simpler) shape:** one item per `{userId, subject}` holding the whole
> map as a JSON attribute — mirrors localStorage 1:1 and is fine at our scale
> (≤300 cards/subject). Trade-off: every grade rewrites the whole map and risks
> last-write-wins races across tabs. **Recommendation:** per-card items (above) for
> correctness; fall back to blob only if write volume/complexity becomes a problem.

**`ProgressFunction`** (Lambda) — copy `items/` structure:
`index.mjs` router (GET/PUT/DELETE) + `handlers/{getProgress,putProgress,resetProgress}.mjs`
+ reused `utils/{dynamo,response,constants}.mjs`. **`userId` always comes from
`event.requestContext.authorizer.jwt.claims.sub`** — never from the path/body, so users
can only touch their own rows.

### 5.4 Login migration (don't lose existing local progress)

On first authenticated load, if `localStorage` has `srs:<subject>` data:
1. Prompt once: *"Found local progress — sync it to your account?"*
2. **Merge** local into remote per card: keep the entry with the later `lastReviewed`
   (and higher `totalSeen` as tiebreak), so cloud + local don't clobber each other.
3. After a successful merge, clear the local keys (or mark merged) to avoid re-prompting.

This reuses the spirit of the existing one-time `migrate.ts` (`srs:all → srs:javascript`).

---

## 6. Track 3 — Questions in DynamoDB

**Recommendation: keep JSON as the source of truth, sync it up to DynamoDB.** Fully
removing the bundled JSON would add a network dependency for core content and kill the
simple "edit `data/*.json` + push" workflow. Instead:

**DynamoDB table `drill-cards-{env}`:** PK `subject`, SK `id`, plus the card attributes.
- **GET `/cards/{subject}`** (public, no auth) → `Query` PK=`subject` → `Card[]`.
- **POST/PUT/DELETE** (admin-only via JWT authorizer + `manage:cards` scope) for editing
  cards from a future admin screen.

**`CardsFunction`** (Lambda) — same router pattern as `items/`.

**Seed script** (`app/scripts/seed-cards.mjs`): read `app/data/*.json`, `BatchWriteItem`
into `drill-cards-{env}`. Run on deploy / when banks change. This keeps the repo JSON
authoritative and the table a derived read model.

**Frontend loading:** extend the subject registry's `loadData` to optionally fetch from
`/cards/{subject}`, falling back to the bundled import when the API is unavailable
(offline / anonymous). `useSubjectData` already abstracts loading (returns `null` while
pending) and caches per subject, so the change is contained to `subjects.ts` + the loader.

> Phasing: ship Track 3 **last**. Tracks 1–2 deliver the user-visible win (cloud
> progress). Questions-in-DynamoDB mainly enables a future "edit questions in-app" flow.

---

## 7. Infrastructure & repo layout

New top-level backend dir, mirroring the reference's `lambda/`:

```
backend/                          # AWS SAM project (separate from Vercel frontend)
├── template.yaml                 # ProgressFunction, CardsFunction, tables, JWT authorizer
├── samconfig.toml                # dev/prod config-envs
├── progress/  { index.mjs, handlers/, utils/{dynamo,response,constants}.mjs }
├── cards/     { index.mjs, handlers/, utils/... }
└── shared/    # optional shared utils
```

**`template.yaml` essentials** — start from the **game's** `infra/template.yaml` (it
creates its table in-stack), then add the JWT authorizer the game lacks:
- `AWS::Serverless::HttpApi` with an Auth0 **JWT authorizer**
  (`IdentitySource: $request.header.Authorization`, `Issuer: https://<domain>/`,
  `Audience: [https://dev-drill-api]`). Apply it to `/progress/*` (required) and to
  card **writes**; leave `GET /cards/*` open.
- `AWS::DynamoDB::Table` resources (as the game does) with `BillingMode: PAY_PER_REQUEST`:
  - `drill-progress-{env}` — **composite key**: `userId` (HASH) + `cardKey` (RANGE).
  - `drill-cards-{env}` — `subject` (HASH) + `id` (RANGE).
- Each function: `DynamoDBCrudPolicy` scoped to its table, env vars `TABLE_NAME`,
  `ALLOWED_ORIGINS`.
- Params per env: `Environment`, `AllowedOrigins`, table names — `--config-env dev|prod`.

The game's `scores/index.mjs` uses raw `{ S }/{ N }` attribute maps; the storefront uses
`@aws-sdk/util-dynamodb` `marshall`/`unmarshall`. **Prefer `util-dynamodb`** — less
error-prone with the nested `Progress` shape.

**Deploy:** `cd backend && sam build && sam deploy --config-env dev`. Capture the output
API URL into `VITE_API_URL` (local `.env` + Vercel env).

---

## 8. Testing

- **Stores:** unit-test `LocalProgressStore` (existing storage behavior) and
  `RemoteProgressStore` (mock `fetch`/api client) against the `ProgressStore` interface.
- **Merge logic:** table-driven tests of the local↔remote merge rule (later-wins).
- **`useProgress`:** RTL test for both branches — anonymous (localStorage) and
  authenticated (mock `useAuth0` → `isAuthenticated: true`, mock api). Assert the loading
  guard and optimistic update.
- **Lambda handlers:** unit-test with mocked `@aws-sdk/client-dynamodb` (as the reference
  does) — `getProgress` shape, `putProgress` upsert, `userId` taken from claims not input.
- **Existing suites stay green:** the SM-2/session/storage tests are unaffected because the
  `Progress` shape and `srs.ts` math don't change.
- Routing/screen tests already mock `lib/subjects`; add a mock for `useAuth0`
  (default `isAuthenticated: false`) so existing tests keep using the local path.

---

## 9. Security checklist

> **Anti-pattern observed in the game** (`infra/scores/index.mjs`): the scores endpoint is
> **unauthenticated** (`Access-Control-Allow-Origin: *`, no authorizer) and keys data by an
> `email` taken straight from the request **body** — so anyone can write a score for any
> email. That's fine for a casual leaderboard, but **unacceptable for study progress**.
> Our progress API must therefore do the opposite of the game on identity & auth:

- [ ] API Gateway **JWT authorizer** validates issuer + audience on every `/progress/*`
      route (never trust a `userId`/`email` from the client body — the game's mistake).
- [ ] Lambda derives `userId` **only** from `claims.sub`.
- [ ] CORS `ALLOWED_ORIGINS` limited to localhost:5173 + the Vercel domain (not `*`).
- [ ] No secrets in the bundle — only public Auth0 SPA config in `VITE_*`.
- [ ] Card writes gated behind an `admin`/`manage:cards` permission.
- [ ] Rate-limit / throttle the HTTP API stage.

---

## 10. Phased rollout

| Phase | Scope | User-visible result |
|---|---|---|
| **0** | Auth0 tenant + env wiring, `Auth0ProviderWithNavigate`, login/logout buttons | Can log in/out; nothing else changes |
| **1** | `ProgressFunction` + `drill-progress` table + JWT authorizer (dev) | API exists, tested via curl |
| **2** | `ProgressStore` abstraction + `useProgress` rewrite + loading guards | Auth'd users get cloud progress; anon unchanged |
| **3** | Login migration prompt (merge localStorage → account) | No progress lost on first login |
| **4** | `CardsFunction` + `drill-cards` table + seed script | Questions in DynamoDB (read model) |
| **5** | (optional) in-app admin card editor behind `AuthenticationGuard` | Edit questions without a deploy |
| **6** | (optional) cross-user leaderboard — reuse the game's GSI pattern (`gsi_pk` + score RANGE, `ScanIndexForward: false`) over a "cards mastered" metric | Compete on mastery |

Phases 0–3 are the core ask and can ship before 4–6.

---

## 11. Open decisions (need your call)

1. **Progress storage shape:** per-card items (recommended, §5.3) vs. one JSON blob
   per subject (simpler, mirrors localStorage). 
2. **Questions:** keep JSON-as-source + sync to DynamoDB (recommended, §6) vs. make
   DynamoDB the sole source and drop bundled JSON.
3. **State layer:** lightweight fetch client (recommended — no new deps beyond
   `@auth0/auth0-react`) vs. adopt Redux Toolkit + RTK Query to match the reference repo
   1:1.
4. **Login requirement:** keep the app fully usable anonymous (recommended) vs. gate
   certain subjects/features behind login.
5. **Backend location:** new `backend/` dir in this repo (recommended) vs. a separate repo.
6. **Region/account:** reuse the reference's AWS account/region (`us-east-1`) and a new
   Auth0 tenant, or share the existing `entornobiai` tenant?

---

## 12. New dependencies

- Frontend: `@auth0/auth0-react` (only required new runtime dep).
- Backend: `@aws-sdk/client-dynamodb`, `@aws-sdk/util-dynamodb` (per-Lambda, as reference).
- Tooling: AWS SAM CLI (already used for the reference repo).
```
