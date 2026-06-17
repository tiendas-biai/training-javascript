#!/usr/bin/env bash
# Remove the Dev Drill routes + integrations from the shared entorno-biai API.
# Does NOT touch CORS or stage variables (revert those manually if desired).
# Requires jq.
#
#   ./scripts/unwire-api.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

q() { aws apigatewayv2 "$@" --api-id "$API_ID" --region "$REGION"; }

# Fetch full lists once as JSON (avoid client-side --query under auto-pagination).
ROUTES_JSON="$(q get-routes --output json)"
INTS_JSON="$(q get-integrations --output json)"

ROUTES=(
  "GET /progress/{subject}"
  "PUT /progress/{subject}/{cardId}"
  "DELETE /progress/{subject}"
  "GET /cards/{subject}"
  "POST /cards/{subject}"
  "PUT /cards/{subject}/{cardId}"
  "DELETE /cards/{subject}/{cardId}"
)

for key in "${ROUTES[@]}"; do
  id="$(jq -r --arg k "$key" '.Items[] | select(.RouteKey==$k) | .RouteId' <<<"$ROUTES_JSON" | head -n1)"
  if [[ -n "$id" ]]; then
    q delete-route --route-id "$id" >/dev/null
    echo "  - deleted route: $key"
  fi
done

for var in progressFunctionName cardsFunctionName; do
  uri="arn:aws:lambda:${REGION}:${ACCOUNT}:function:\${stageVariables.${var}}"
  id="$(jq -r --arg u "$uri" '.Items[] | select(.IntegrationUri==$u) | .IntegrationId' <<<"$INTS_JSON" | head -n1)"
  if [[ -n "$id" ]]; then
    q delete-integration --integration-id "$id" >/dev/null
    echo "  - deleted integration: $var ($id)"
  fi
done

echo "Done. (Run sam delete to remove the functions + tables.)"
