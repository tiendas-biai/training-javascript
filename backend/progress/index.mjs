import { buildResponse, getUserId, getHttpMethod } from "./utils/response.mjs";
import {
  HTTP_UNAUTHORIZED,
  HTTP_BAD_REQUEST,
  HTTP_METHOD_NOT_ALLOWED,
  METHOD_GET,
  METHOD_PUT,
  METHOD_DELETE,
  ERROR_UNAUTHENTICATED,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_MISSING_SUBJECT,
  ERROR_MISSING_CARD_ID,
} from "./utils/constants.mjs";
import { getProgress } from "./handlers/getProgress.mjs";
import { putProgress } from "./handlers/putProgress.mjs";
import { resetProgress } from "./handlers/resetProgress.mjs";

export const handler = async (event) => {
  // The JWT authorizer guarantees a valid token, but never assume the claim exists.
  const userId = getUserId(event);
  if (!userId) {
    return buildResponse(HTTP_UNAUTHORIZED, { error: ERROR_UNAUTHENTICATED });
  }

  const method = getHttpMethod(event);
  const subject = event.pathParameters?.subject;
  const cardId = event.pathParameters?.cardId;

  if (!subject) {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_SUBJECT });
  }

  if (method === METHOD_GET) {
    return getProgress(userId, subject);
  }

  if (method === METHOD_PUT) {
    if (!cardId) return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_CARD_ID });
    return putProgress(userId, subject, cardId, event.body);
  }

  if (method === METHOD_DELETE) {
    return resetProgress(userId, subject);
  }

  return buildResponse(HTTP_METHOD_NOT_ALLOWED, { error: ERROR_METHOD_NOT_ALLOWED });
};
