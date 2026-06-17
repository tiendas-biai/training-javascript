# Dev Drill — backend (AWS SAM)

Per-user progress API for the Dev Drill app. Separate from the Vercel frontend.

- **`ProgressFunction`** (`progress/`) — Node 24 Lambda, GET/PUT/DELETE per-user progress.
- **`drill-progress-{env}`** — DynamoDB table, PK `userId` (Auth0 `sub`) + SK `cardKey` (`<subject>#<cardId>`), `PAY_PER_REQUEST`.
- **HTTP API** with an **Auth0 JWT authorizer** (validates issuer + audience). The Lambda
  trusts `requestContext.authorizer.jwt.claims.sub` as the user id — never the path/body.

## Routes (all require a valid Auth0 access token)

| Method | Path | Action |
|---|---|---|
| GET | `/progress/{subject}` | Query the user's rows → `{ [cardId]: Progress }` |
| PUT | `/progress/{subject}/{cardId}` | Upsert one card's SM-2 progress (body = `Progress` JSON) |
| DELETE | `/progress/{subject}` | Delete the user's rows for one subject ("Reset progress") |

## Prerequisites

1. Auth0 **API** created with identifier `https://dev-drill-api`, signing RS256.
2. Set the real tenant domain in `samconfig.toml` (replace `REPLACE_ME.us.auth0.com`).
3. AWS credentials configured for `us-east-1`.

## Develop & test

```bash
cd progress && npm install && npm test    # node:test handler unit tests (mocked DynamoDB)
cd ..      && sam validate --lint          # template lint
```

## Deploy

```bash
sam build
sam deploy --config-env dev      # or: --config-env prod
```

Copy the `ApiUrl` stack output into the frontend's `VITE_API_URL`
(`app/.env` for local, Vercel project settings for prod).

## Smoke test (after deploy)

```bash
TOKEN=...    # an Auth0 access token for audience https://dev-drill-api
API=...      # ApiUrl output
curl -s "$API/progress/react" -H "Authorization: Bearer $TOKEN"            # -> {}
curl -s -X PUT "$API/progress/react/react-hooks-001" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"id":"react-hooks-001","phase":"review","interval":5,"ease":2.5}'   # -> 204
curl -s "$API/progress/react" -H "Authorization: Bearer $TOKEN"            # -> { "react-hooks-001": {...} }
curl -s "$API/progress/react"                                              # -> 401 (no token)
```
