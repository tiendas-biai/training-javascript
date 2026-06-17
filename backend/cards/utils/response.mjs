import { MANAGE_CARDS, ADMIN_ROLE } from "./constants.mjs";

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

// Array claims can arrive stringified through the HTTP API authorizer
// (e.g. "[manage:cards read:x]"); normalize all shapes to a token list.
const toList = (raw) => {
  if (raw == null) return [];
  return Array.isArray(raw)
    ? raw
    : String(raw).replace(/^\[|\]$/g, "").split(/[\s,]+/).filter(Boolean);
};

// Writes are allowed for either an explicit manage:cards permission/scope (Auth0
// RBAC, "Add Permissions in the Access Token") OR an `admin` role surfaced in a
// roles claim on the access token (added via an Auth0 Action). Roles are read
// from the standard user_roles/roles claims plus an optional namespaced claim
// named by the ROLES_CLAIM env var (e.g. "https://devdrill/user_roles"), since
// Auth0 may require custom claims on access tokens to be namespaced.
export const hasManageCards = (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? {};
  const perms = [...toList(claims.permissions), ...toList(claims.scope)];
  if (perms.includes(MANAGE_CARDS)) return true;

  const rolesClaim = process.env.ROLES_CLAIM;
  const roles = [
    ...toList(claims.user_roles),
    ...toList(claims.roles),
    ...(rolesClaim ? toList(claims[rolesClaim]) : []),
  ];
  return roles.includes(ADMIN_ROLE);
};
