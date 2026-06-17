#!/usr/bin/env bash
# Add the Dev Drill Vercel origin to the shared entorno-biai API's CORS allow-list,
# preserving every existing origin/method/header. Idempotent. Requires jq.
#
#   ./scripts/add-cors-origin.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
ORIGIN="${ORIGIN:-https://training-javascript-one.vercel.app}"

current="$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" \
  --query CorsConfiguration --output json)"

if echo "$current" | jq -e --arg o "$ORIGIN" '.AllowOrigins | index($o)' >/dev/null; then
  echo "Origin already allowed: $ORIGIN"; exit 0
fi

updated="$(echo "$current" | jq --arg o "$ORIGIN" '.AllowOrigins += [$o]')"
aws apigatewayv2 update-api --api-id "$API_ID" --region "$REGION" \
  --cors-configuration "$updated" >/dev/null

echo "Added $ORIGIN. AllowOrigins is now:"
echo "$updated" | jq -r '.AllowOrigins[]' | sed 's/^/  - /'
