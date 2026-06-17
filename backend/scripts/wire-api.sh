#!/usr/bin/env bash
# Wire Dev Drill routes into the shared entorno-biai HTTP API. Idempotent and
# convergent: creates a dedicated JWT authorizer for OUR Auth0 tenant, creates
# the integrations + routes, and re-points existing routes onto our authorizer.
# Run ONCE per change; dev/prod dispatch is via stage variables. Requires jq.
#
#   ./scripts/wire-api.sh
#
# Override the tenant/audience as needed:
#   ISSUER=https://<tenant>.us.auth0.com/ AUDIENCE=https://dev-drill-api ./scripts/wire-api.sh
set -euo pipefail

API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

# Our own authorizer (kept separate from the shared prod "auth0-authorizer").
AUTH_NAME="${AUTH_NAME:-dev-drill-auth0}"
ISSUER="${ISSUER:-https://dev-zhk0rclzhr4i4q0b.us.auth0.com/}"   # dev tenant (issuer distinguishes dev vs prod)
AUDIENCE="${AUDIENCE:-https://entorno-biai}"                     # "Entorno Biai API" identifier in that tenant

q() { aws apigatewayv2 "$@" --api-id "$API_ID" --region "$REGION"; }

# Fetch full lists once as JSON (a client-side --query breaks under auto-pagination).
AUTHZ_JSON="$(q get-authorizers --output json)"
INTS_JSON="$(q get-integrations --output json)"

ensure_authorizer() {
  local id
  id="$(jq -r --arg n "$AUTH_NAME" '.Items[] | select(.Name==$n) | .AuthorizerId' <<<"$AUTHZ_JSON" | head -n1)"
  if [[ -n "$id" ]]; then
    # Converge issuer/audience in case they changed.
    q update-authorizer --authorizer-id "$id" \
      --jwt-configuration "Issuer=${ISSUER},Audience=${AUDIENCE}" >/dev/null
    echo "$id"; return
  fi
  q create-authorizer --name "$AUTH_NAME" --authorizer-type JWT \
    --identity-source '$request.header.Authorization' \
    --jwt-configuration "Issuer=${ISSUER},Audience=${AUDIENCE}" \
    --query AuthorizerId --output text
}

ensure_integration() {
  local uri="$1" id
  id="$(jq -r --arg u "$uri" '.Items[] | select(.IntegrationUri==$u) | .IntegrationId' <<<"$INTS_JSON" | head -n1)"
  if [[ -n "$id" ]]; then echo "$id"; return; fi
  q create-integration --integration-type AWS_PROXY --integration-uri "$uri" \
    --integration-method POST --payload-format-version 2.0 \
    --query IntegrationId --output text
}

# ensure_route "<METHOD /path>" <integrationId> <JWT|NONE> — create or converge.
ensure_route() {
  local route_key="$1" integration_id="$2" auth="$3" rid cur_auth cur_authz
  rid="$(jq -r --arg k "$route_key" '.Items[] | select(.RouteKey==$k) | .RouteId' <<<"$ROUTES_JSON" | head -n1)"
  if [[ -z "$rid" ]]; then
    if [[ "$auth" == "JWT" ]]; then
      q create-route --route-key "$route_key" --target "integrations/${integration_id}" \
        --authorization-type JWT --authorizer-id "$AUTHORIZER_ID" >/dev/null
    else
      q create-route --route-key "$route_key" --target "integrations/${integration_id}" \
        --authorization-type NONE >/dev/null
    fi
    echo "  + created: $route_key ($auth)"; return
  fi
  cur_auth="$(jq -r --arg k "$route_key" '.Items[] | select(.RouteKey==$k) | .AuthorizationType' <<<"$ROUTES_JSON")"
  cur_authz="$(jq -r --arg k "$route_key" '.Items[] | select(.RouteKey==$k) | .AuthorizerId // ""' <<<"$ROUTES_JSON")"
  if [[ "$auth" == "JWT" && ( "$cur_auth" != "JWT" || "$cur_authz" != "$AUTHORIZER_ID" ) ]]; then
    q update-route --route-id "$rid" --target "integrations/${integration_id}" \
      --authorization-type JWT --authorizer-id "$AUTHORIZER_ID" >/dev/null
    echo "  ~ re-pointed authorizer: $route_key"
  elif [[ "$auth" == "NONE" && "$cur_auth" != "NONE" ]]; then
    q update-route --route-id "$rid" --target "integrations/${integration_id}" --authorization-type NONE >/dev/null
    echo "  ~ set public: $route_key"
  else
    echo "  = ok: $route_key"
  fi
}

AUTHORIZER_ID="$(ensure_authorizer)"
echo "Authorizer ${AUTH_NAME} -> ${AUTHORIZER_ID} (iss ${ISSUER} aud ${AUDIENCE})"

PROGRESS_URI="arn:aws:lambda:${REGION}:${ACCOUNT}:function:\${stageVariables.progressFunctionName}"
CARDS_URI="arn:aws:lambda:${REGION}:${ACCOUNT}:function:\${stageVariables.cardsFunctionName}"
echo "Ensuring integrations…"
PROGRESS_INT="$(ensure_integration "$PROGRESS_URI")"; echo "  progress -> $PROGRESS_INT"
CARDS_INT="$(ensure_integration "$CARDS_URI")";       echo "  cards    -> $CARDS_INT"

ROUTES_JSON="$(q get-routes --output json)"
echo "Ensuring routes…"
ensure_route "GET /progress/{subject}"            "$PROGRESS_INT" JWT
ensure_route "PUT /progress/{subject}/{cardId}"   "$PROGRESS_INT" JWT
ensure_route "DELETE /progress/{subject}"         "$PROGRESS_INT" JWT
ensure_route "GET /cards/{subject}"               "$CARDS_INT"    NONE
ensure_route "POST /cards/{subject}"              "$CARDS_INT"    JWT
ensure_route "PUT /cards/{subject}/{cardId}"      "$CARDS_INT"    JWT
ensure_route "DELETE /cards/{subject}/{cardId}"   "$CARDS_INT"    JWT

echo "Publishing to dev stage…"
q create-deployment --stage-name dev >/dev/null
echo "Done."
