#!/usr/bin/env bash
# Wire Dev Drill routes into the shared entorno-biai HTTP API. Idempotent: skips
# integrations/routes that already exist. Run ONCE (env-independent) — dev/prod
# dispatch is handled by stage variables (see set-stage-vars.sh).
#
#   ./scripts/wire-api.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
AUTHORIZER_ID="${AUTHORIZER_ID:-hnjqjd}"   # entorno-biai auth0-authorizer
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

q() { aws apigatewayv2 "$@" --api-id "$API_ID" --region "$REGION"; }

# Find an existing integration by its URI, or create it; echoes the integration id.
ensure_integration() {
  local uri="$1"
  local existing
  existing="$(q get-integrations --query "Items[?IntegrationUri=='${uri}'].IntegrationId | [0]" --output text)"
  if [[ "$existing" != "None" && -n "$existing" ]]; then
    echo "$existing"; return
  fi
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
  local existing
  existing="$(q get-routes --query "Items[?RouteKey=='${route_key}'].RouteId | [0]" --output text)"
  if [[ "$existing" != "None" && -n "$existing" ]]; then
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

echo "Ensuring routes…"
ensure_route "GET /progress/{subject}"            "$PROGRESS_INT" JWT
ensure_route "PUT /progress/{subject}/{cardId}"   "$PROGRESS_INT" JWT
ensure_route "DELETE /progress/{subject}"         "$PROGRESS_INT" JWT
ensure_route "GET /cards/{subject}"               "$CARDS_INT"    NONE
ensure_route "POST /cards/{subject}"              "$CARDS_INT"    JWT
ensure_route "PUT /cards/{subject}/{cardId}"      "$CARDS_INT"    JWT
ensure_route "DELETE /cards/{subject}/{cardId}"   "$CARDS_INT"    JWT

echo "Done. (dev stage has AutoDeploy off — run: aws apigatewayv2 create-deployment --api-id $API_ID --stage-name dev)"
