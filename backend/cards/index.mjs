import { buildResponse, getHttpMethod, hasManageCards } from "./utils/response.mjs";
import {
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_METHOD_NOT_ALLOWED,
  METHOD_GET,
  METHOD_POST,
  METHOD_PUT,
  METHOD_DELETE,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_FORBIDDEN,
  ERROR_MISSING_SUBJECT,
  ERROR_MISSING_CARD_ID,
} from "./utils/constants.mjs";
import { listCards } from "./handlers/listCards.mjs";
import { putCard } from "./handlers/putCard.mjs";
import { deleteCard } from "./handlers/deleteCard.mjs";

export const handler = async (event) => {
  const method = getHttpMethod(event);
  const subject = event.pathParameters?.subject;
  const cardId = event.pathParameters?.cardId;

  if (!subject) {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_SUBJECT });
  }

  // Public read.
  if (method === METHOD_GET) {
    return listCards(subject);
  }

  // Writes are admin-only. The JWT authorizer already proved a valid token;
  // here we additionally require the manage:cards permission.
  if (!hasManageCards(event)) {
    return buildResponse(HTTP_FORBIDDEN, { error: ERROR_FORBIDDEN });
  }

  if (method === METHOD_POST) {
    return putCard(subject, undefined, event.body);
  }

  if (method === METHOD_PUT) {
    if (!cardId) return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_CARD_ID });
    return putCard(subject, cardId, event.body);
  }

  if (method === METHOD_DELETE) {
    if (!cardId) return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_CARD_ID });
    return deleteCard(subject, cardId);
  }

  return buildResponse(HTTP_METHOD_NOT_ALLOWED, { error: ERROR_METHOD_NOT_ALLOWED });
};
