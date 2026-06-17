import { MANAGE_CARDS } from "./constants.mjs";

// CORS is handled by the HTTP API's CorsConfiguration; responses carry JSON only.
export const buildResponse = (statusCode, body) => {
  if (body === undefined || body === null) {
    return { statusCode };
  }
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
};

export const getHttpMethod = (event) =>
  event.requestContext?.http?.method || event.httpMethod || null;

// Auth0 RBAC ("Add Permissions in the Access Token") surfaces granted
// permissions in the `permissions` claim. Writes require manage:cards.
export const hasManageCards = (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? {};
  const raw = claims.permissions ?? claims.scope ?? [];
  // Array claims can arrive stringified through the HTTP API authorizer
  // (e.g. "[manage:cards read:x]"); normalize all shapes to a token list.
  const list = Array.isArray(raw)
    ? raw
    : String(raw).replace(/^\[|\]$/g, "").split(/[\s,]+/).filter(Boolean);
  return list.includes(MANAGE_CARDS);
};
