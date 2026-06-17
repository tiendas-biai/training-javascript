export const HTTP_OK = 200;
export const HTTP_NO_CONTENT = 204;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_INTERNAL_SERVER_ERROR = 500;

export const METHOD_GET = "GET";
export const METHOD_POST = "POST";
export const METHOD_PUT = "PUT";
export const METHOD_DELETE = "DELETE";

export const MANAGE_CARDS = "manage:cards";
export const ADMIN_ROLE = "admin";

export const ERROR_METHOD_NOT_ALLOWED = "Method Not Allowed";
export const ERROR_INTERNAL_SERVER = "Internal Server Error";
export const ERROR_FORBIDDEN = "Missing manage:cards permission";
export const ERROR_MISSING_SUBJECT = "subject path parameter is required";
export const ERROR_MISSING_CARD_ID = "cardId is required";
export const ERROR_INVALID_BODY = "Request body must be a JSON card object";
