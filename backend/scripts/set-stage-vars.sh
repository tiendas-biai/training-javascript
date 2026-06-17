#!/usr/bin/env bash
# Point a shared-API stage at this env's Dev Drill functions, by setting the
# progressFunctionName / cardsFunctionName stage variables. Reads the deployed
# names from the SAM stack outputs.
#
#   ./scripts/set-stage-vars.sh dev    # or prod
set -euo pipefail

ENV="${1:?usage: set-stage-vars.sh <dev|prod>}"
API_ID="${API_ID:-m02lp78cnl}"
REGION="${AWS_REGION:-us-east-1}"
STACK="dev-drill-backend-${ENV}"

out() {
  aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue | [0]" --output text
}

PROGRESS_FN="$(out ProgressFunctionName)"
CARDS_FN="$(out CardsFunctionName)"
echo "Stage $ENV: progressFunctionName=$PROGRESS_FN cardsFunctionName=$CARDS_FN"

aws apigatewayv2 update-stage --api-id "$API_ID" --region "$REGION" --stage-name "$ENV" \
  --stage-variables "progressFunctionName=${PROGRESS_FN},cardsFunctionName=${CARDS_FN}" >/dev/null

# dev has AutoDeploy off; force a deployment so the new routes/vars go live.
if [[ "$ENV" == "dev" ]]; then
  aws apigatewayv2 create-deployment --api-id "$API_ID" --region "$REGION" --stage-name dev >/dev/null
fi
echo "Updated stage variables on $ENV."
