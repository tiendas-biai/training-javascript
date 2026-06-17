# Dev Drill — backend (AWS SAM)

Progress + cards API for the Dev Drill app. This stack deploys **only Lambdas +
DynamoDB tables**; the routes live on the **shared `entorno-biai` HTTP API**
(`m02lp78cnl`), dispatched per stage (dev/prod) by stage variables — matching the
account convention. Full design + audit: [`../documents/INFRA_PLAN.md`](../documents/INFRA_PLAN.md).

- **`ProgressFunction`** (`progress/`) — Node 22 Lambda, GET/PUT/DELETE per-user progress.
- **`CardsFunction`** (`cards/`) — Node 22 Lambda, public GET banks + admin writes.
- **`drill-progress`/`-dev`** — DynamoDB, PK `userId` (Auth0 `sub`) + SK `cardKey` (`<subject>#<cardId>`).
- **`drill-cards`/`-dev`** — DynamoDB, PK `subject` + SK `id` (question banks, derived read model).
- Auth: the shared API's existing **Auth0 JWT authorizer** (`hnjqjd`, tenant
  `entornobiai`, audience `https://entorno-biai`) guards `/progress/*` + card writes.
  The Lambda trusts `requestContext.authorizer.jwt.claims.sub` — never the path/body.

## Routes (on the shared API)

Progress (require a valid Auth0 access token):

| Method | Path | Action |
|---|---|---|
| GET | `/progress/{subject}` | Query the user's rows → `{ [cardId]: Progress }` |
| PUT | `/progress/{subject}/{cardId}` | Upsert one card's SM-2 progress (body = `Progress` JSON) |
| DELETE | `/progress/{subject}` | Delete the user's rows for one subject ("Reset progress") |

Cards (GET public; writes require the `manage:cards` permission claim):

| Method | Path | Action |
|---|---|---|
| GET | `/cards/{subject}` | Public — Query the subject's bank → `Card[]` |
| POST | `/cards/{subject}` | Admin — upsert a card (id from body) |
| PUT | `/cards/{subject}/{cardId}` | Admin — upsert a card (id from path) |
| DELETE | `/cards/{subject}/{cardId}` | Admin — delete a card |

## Develop & test

```bash
cd progress && npm install && npm test    # progress handler unit tests (mocked DynamoDB)
cd ../cards && npm install && npm test     # cards handler unit tests (mocked DynamoDB)
cd ..       && sam validate --lint         # template lint
```

## Deploy

```bash
# 1) Lambdas + tables for this env
sam build
sam deploy --config-env dev                 # or: --config-env prod

# 2) Wire the shared entorno-biai API (scripts are idempotent)
./scripts/wire-api.sh                        # integrations + routes — run ONCE (env-independent)
./scripts/set-stage-vars.sh dev              # point the dev stage at the dev functions
./scripts/add-cors-origin.sh                 # add the Vercel origin to shared CORS — run once

# 3) Seed the cards read model (optional; JSON in app/data stays source of truth)
npm install && TABLE_NAME=drill-cards-dev npm run seed
```

For prod: `sam deploy --config-env prod && ./scripts/set-stage-vars.sh prod`
(prod stage AutoDeploys; dev does not, so `set-stage-vars.sh dev` forces a deployment).

## Smoke test

```bash
API=https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/dev
TOKEN=...   # Auth0 access token, audience https://entorno-biai

curl -s "$API/cards/react"                                                   # public -> Card[]
curl -s "$API/progress/react"                                                # -> 401 (no token)
curl -s "$API/progress/react" -H "Authorization: Bearer $TOKEN"              # -> {}
curl -s -X PUT "$API/progress/react/react-hooks-001" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"id":"react-hooks-001","phase":"review","interval":5,"ease":2.5}'     # -> 204
```

## Teardown

```bash
./scripts/unwire-api.sh           # remove routes + integrations from the shared API
sam delete --config-env dev       # remove this env's functions + tables
```
