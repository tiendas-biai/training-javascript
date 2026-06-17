#!/usr/bin/env bash
# Remove the Dev Drill routes + integrations from the shared entorno-biai API.
# Does NOT touch CORS or stage variables (revert those manually if desired).
#
#   ./scripts/unwire-api.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"

q() { aws apigatewayv2 "$@" --api-id "$API_ID" --region "$REGION"; }

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
  id="$(q get-routes --query "Items[?RouteKey=='${key}'].RouteId | [0]" --output text)"
  if [[ "$id" != "None" && -n "$id" ]]; then
    q delete-route --route-id "$id" >/dev/null
    echo "  - deleted route: $key"
  fi
done

for var in progressFunctionName cardsFunctionName; do
  uri="arn:aws:lambda:${REGION}:$(aws sts get-caller-identity --query Account --output text):function:\${stageVariables.${var}}"
  id="$(q get-integrations --query "Items[?IntegrationUri=='${uri}'].IntegrationId | [0]" --output text)"
  if [[ "$id" != "None" && -n "$id" ]]; then
    q delete-integration --integration-id "$id" >/dev/null
    echo "  - deleted integration: $var ($id)"
  fi
done

echo "Done. (Run sam delete to remove the functions + tables.)"
