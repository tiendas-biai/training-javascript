#!/usr/bin/env bash
# Wire Dev Drill routes into the shared entorno-biai HTTP API. Idempotent: skips
# integrations/routes that already exist. Run ONCE (env-independent) — dev/prod
# dispatch is handled by stage variables (see set-stage-vars.sh). Requires jq.
#
#   ./scripts/wire-api.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
AUTHORIZER_ID="${AUTHORIZER_ID:-hnjqjd}"   # entorno-biai auth0-authorizer
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

q() { aws apigatewayv2 "$@" --api-id "$API_ID" --region "$REGION"; }

# Fetch full lists once as JSON (no client-side --query — that triggers per-page
# output under auto-pagination and breaks existence checks). Match with jq.
INTS_JSON="$(q get-integrations --output json)"

# Find an existing integration by its URI, or create it; echoes the integration id.
ensure_integration() {
  local uri="$1" id
  id="$(jq -r --arg u "$uri" '.Items[] | select(.IntegrationUri==$u) | .IntegrationId' <<<"$INTS_JSON" | head -n1)"
  if [[ -n "$id" ]]; then echo "$id"; return; fi
  q create-integration \
    --integration-type AWS_PROXY \
    --integration-uri "$uri" \
    --integration-method POST \
    --payload-format-version 2.0 \
    --query IntegrationId --output text
}

# ensure_route "<METHOD /path>" <integrationId> <JWT|NONE>
ensure_route() {
  local route_key="$1" integration_id="$2" auth="$3"
  if jq -e --arg k "$route_key" '.Items[] | select(.RouteKey==$k)' <<<"$ROUTES_JSON" >/dev/null; then
    echo "  = exists: $route_key"; return
  fi
  if [[ "$auth" == "JWT" ]]; then
    q create-route --route-key "$route_key" --target "integrations/${integration_id}" \
      --authorization-type JWT --authorizer-id "$AUTHORIZER_ID" >/dev/null
  else
    q create-route --route-key "$route_key" --target "integrations/${integration_id}" \
      --authorization-type NONE >/dev/null
  fi
  echo "  + created: $route_key ($auth)"
}

PROGRESS_URI="arn:aws:lambda:${REGION}:${ACCOUNT}:function:\${stageVariables.progressFunctionName}"
CARDS_URI="arn:aws:lambda:${REGION}:${ACCOUNT}:function:\${stageVariables.cardsFunctionName}"

echo "Ensuring integrations on ${API_ID}…"
PROGRESS_INT="$(ensure_integration "$PROGRESS_URI")"; echo "  progress -> $PROGRESS_INT"
CARDS_INT="$(ensure_integration "$CARDS_URI")";       echo "  cards    -> $CARDS_INT"

ROUTES_JSON="$(q get-routes --output json)"   # after any integration creation
echo "Ensuring routes…"
ensure_route "GET /progress/{subject}"            "$PROGRESS_INT" JWT
ensure_route "PUT /progress/{subject}/{cardId}"   "$PROGRESS_INT" JWT
ensure_route "DELETE /progress/{subject}"         "$PROGRESS_INT" JWT
ensure_route "GET /cards/{subject}"               "$CARDS_INT"    NONE
ensure_route "POST /cards/{subject}"              "$CARDS_INT"    JWT
ensure_route "PUT /cards/{subject}/{cardId}"      "$CARDS_INT"    JWT
ensure_route "DELETE /cards/{subject}/{cardId}"   "$CARDS_INT"    JWT

echo "Done. dev stage AutoDeploy is off — set-stage-vars.sh dev will force a deployment."
