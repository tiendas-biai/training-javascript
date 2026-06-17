# Dev Drill — Infrastructure Plan (us-east-1, account 523696430074)

How we deploy the Dev Drill backend (progress + cards APIs) **into the existing
shared AWS infrastructure**, matching the conventions already in use by the
storefront and games stacks.

Status: **Plan / agreed decisions** · Region: `us-east-1` · Account: `523696430074`

---

## 1. Discovered existing infrastructure (audited via AWS CLI)

**One shared HTTP API** — `entorno-biai` (`m02lp78cnl`), two stages:

| Stage | URL | AutoDeploy |
|---|---|---|
| dev | `https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/dev` | off |
| prod | `https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/prod` | on |

- **dev/prod routing = stage variables.** Every integration URI is
  `…:function:${stageVariables.<svc>FunctionName}` (AWS_PROXY, payload 2.0). The
  `dev` stage maps each var to a `…-dev-…` function; `prod` to a `…-prod-…` one.
  The *route* is created once; the *stage* picks the function.
- **Each service = its own SAM stack** that deploys **only Lambda(s) + table(s)**
  (no API in the stack), then its function name is wired into the shared API as a
  stage variable. (Confirmed: the scores stack is just table + function + output.)
- **Conventions:** `nodejs20.x`, 256 MB, 15 s. Tables `<name>` (prod) / `<name>-dev`
  (dev) — **prod has no suffix** (`items`, `orders`, `banners`).
- **CORS (on the shared API):** origins `http://localhost:3000`, `http://localhost:5173`,
  `https://www.entornobiai.com`, `https://games.entornobiai.com`; methods
  `GET,POST,OPTIONS,PUT,DELETE,PATCH`; headers `content-type,authorization`.
  → **Our Vercel domain is not yet allowed.**
- **Auth0 JWT authorizer already on the API** — id `hnjqjd`, name `auth0-authorizer`,
  issuer `https://entornobiai.us.auth0.com/`, audience `https://entorno-biai`.
  **Currently attached to zero routes** (all routes are `authType NONE`; existing
  services authenticate in-app/Django).

DynamoDB tables today: `items(-dev)`, `orders(-dev)`, `banners(-dev)`,
`daily-budget(-dev)`, `entornobiai-games-scores(-dev)`, `entornobiai-wedding-scores(-dev)`.
No `drill*` tables or `*drill*` functions exist yet — clean slate for us.

---

## 2. Decisions (agreed)

1. **Integrate into the shared `entorno-biai` API** (not a dedicated API).
2. **Reuse the `entornobiai` Auth0 tenant + audience `https://entorno-biai`** and the
   **existing `auth0-authorizer` (`hnjqjd`)** — no new Auth0 API.
3. **Enforce JWT at the gateway** on `/progress/*` and card writes; `GET /cards/*` public.

Forced deviation: **runtime `nodejs22.x`**, because AWS disabled new-function creation
on `nodejs20.x` (2026-06-01). Existing functions stay on 20.x; ours start on 22.x.

---

## 3. Target design

```
Vercel SPA ──auth(entornobiai.us.auth0.com, aud https://entorno-biai)──┐
   │                                                                    │ access token
   ▼                                                                    ▼
entorno-biai HTTP API (m02lp78cnl)
   ├─ GET    /progress/{subject}          JWT hnjqjd ─┐
   ├─ PUT    /progress/{subject}/{cardId} JWT hnjqjd ─┤→ ${stageVariables.progressFunctionName}
   ├─ DELETE /progress/{subject}          JWT hnjqjd ─┘     (dev|prod Lambda) → drill-progress[-dev]
   ├─ GET    /cards/{subject}             NONE (public) ─┐
   ├─ POST   /cards/{subject}             JWT hnjqjd     ├→ ${stageVariables.cardsFunctionName}
   ├─ PUT    /cards/{subject}/{cardId}    JWT hnjqjd     │      (dev|prod Lambda) → drill-cards[-dev]
   └─ DELETE /cards/{subject}/{cardId}    JWT hnjqjd ────┘
```

- **userId** comes from `requestContext.authorizer.jwt.claims.sub` (gateway-validated).
- **Card writes** additionally require the `manage:cards` permission claim (checked in Lambda).

### Names

| Thing | dev | prod |
|---|---|---|
| SAM stack | `dev-drill-backend-dev` | `dev-drill-backend-prod` |
| Progress fn | `dev-drill-progress-dev` | `dev-drill-progress-prod` |
| Cards fn | `dev-drill-cards-dev` | `dev-drill-cards-prod` |
| Progress table | `drill-progress-dev` | `drill-progress` |
| Cards table | `drill-cards-dev` | `drill-cards` |
| Stage var (progress) | `progressFunctionName=dev-drill-progress-dev` | `…=dev-drill-progress-prod` |
| Stage var (cards) | `cardsFunctionName=dev-drill-cards-dev` | `…=dev-drill-cards-prod` |

---

## 4. What our SAM stack owns vs. what we wire into the shared API

**SAM stack (`backend/template.yaml`, per env)** — declarative, owned by us:
- `ProgressFunction`, `CardsFunction` (explicit `FunctionName`, `nodejs22.x`).
- `ProgressTable`, `CardsTable` (`PAY_PER_REQUEST`).
- `AWS::Lambda::Permission` ×2 — let the shared API (`m02lp78cnl`) invoke each function.
- Outputs: function names (to use as stage-variable values).

**Wired into the shared API (scripted, because the API/stages are not owned by any
single stack)** — `backend/scripts/`:
- **Once (env-independent):** 2 integrations (stage-variable URIs) + 7 routes with the
  right authorizer. → `wire-api.sh` (idempotent).
- **Per env:** set `progressFunctionName` / `cardsFunctionName` on the dev/prod stage.
  → `set-stage-vars.sh dev|prod`.
- **Once:** add `https://training-javascript-one.vercel.app` to the shared API CORS
  `AllowOrigins`. → `add-cors-origin.sh`.

> Why scripts and not CloudFormation for the routes: the shared API and its stages were
> created outside any stack, so CFN can't own/modify their CORS or stage variables without
> a risky import. Adding routes via CFN would also collide when both env stacks deploy the
> same route keys. Scripting the wiring once (with stage variables doing dev/prod dispatch)
> mirrors how the existing services are wired.

---

## 5. Auth0 console steps (one-time)

Tenant `entornobiai.us.auth0.com` (reused):
1. **SPA application** (new "Dev Drill", or reuse an existing SPA): add to Allowed
   Callback / Logout / Web Origins: `http://localhost:5173` and
   `https://training-javascript-one.vercel.app`. Copy its **Client ID**.
2. **API `https://entorno-biai`** (exists): for card editing, add a `manage:cards`
   permission, enable **RBAC** + **Add Permissions in the Access Token**, and assign
   `manage:cards` to your user.

Frontend env (local `app/.env` + Vercel):
```
VITE_AUTH0_DOMAIN=entornobiai.us.auth0.com
VITE_AUTH0_CLIENT_ID=<the SPA client id>
VITE_AUTH0_AUDIENCE=https://entorno-biai
VITE_API_URL=https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/dev   # or /prod
# VITE_CARDS_FROM_API=true   # optional, once the cards table is seeded
```

---

## 6. Deploy runbook

```bash
cd backend
cd progress && npm install && npm test && cd ..
cd cards    && npm install && npm test && cd ..

# 1) Lambdas + tables (per env)
sam build
sam deploy --config-env dev      # creates dev-drill-{progress,cards}-dev + drill-*-dev

# 2) Wire the shared API (scripts/, idempotent)
./scripts/wire-api.sh            # integrations + routes (run once, env-independent)
./scripts/set-stage-vars.sh dev  # point the dev stage at the dev functions
./scripts/add-cors-origin.sh     # add the Vercel origin to shared CORS (once)

# 3) Seed the cards read model (optional)
npm install && TABLE_NAME=drill-cards-dev npm run seed

# prod: sam deploy --config-env prod && ./scripts/set-stage-vars.sh prod
```

Smoke test:
```bash
API=https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/dev
curl -s "$API/cards/react"                              # public -> Card[]
curl -s "$API/progress/react"                           # -> 401 (no token)
curl -s "$API/progress/react" -H "Authorization: Bearer $TOKEN"   # -> {}
```

---

## 7. Security checklist

- [ ] `/progress/*` routes use authorizer `hnjqjd` (JWT issuer+audience validated).
- [ ] Lambda derives `userId` only from `claims.sub`.
- [ ] `GET /cards/*` public; card writes require JWT **and** `manage:cards`.
- [ ] CORS stays an allow-list (add only the Vercel origin; never `*`).
- [ ] No secrets in the bundle — only public Auth0 SPA config in `VITE_*`.
- [ ] Lambda invoke permission scoped to the shared API's execute-api ARN.

---

## 8. Teardown

`sam delete --config-env dev|prod` removes our functions + tables. The shared-API
routes/integrations we added are removed with `scripts/unwire-api.sh` (delete the 7
routes + 2 integrations); stage variables and the CORS origin are reverted manually.
