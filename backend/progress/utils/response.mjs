// CORS (preflight + Access-Control-* headers) is handled by the HTTP API's
// CorsConfiguration in template.yaml, so responses here only carry JSON. Setting
// Access-Control-Allow-Origin here too would duplicate the header and break CORS.
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

// userId is ALWAYS the verified Auth0 subject from the JWT authorizer — never
// anything from the path or body. This is the security backbone of per-user data.
export const getUserId = (event) =>
  event.requestContext?.authorizer?.jwt?.claims?.sub || null;

export const getHttpMethod = (event) =>
  event.requestContext?.http?.method || event.httpMethod || null;
