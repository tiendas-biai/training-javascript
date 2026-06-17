import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  ERROR_INVALID_BODY,
  ERROR_MISSING_CARD_ID,
  ERROR_INTERNAL_SERVER,
} from "../utils/constants.mjs";

// POST /cards/{subject} (id from body) or PUT /cards/{subject}/{cardId} — admin
// upsert of a single card. cardId from the path wins when present.
export const putCard = async (subject, cardId, rawBody) => {
  let card;
  try {
    card = JSON.parse(rawBody ?? "");
  } catch {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_INVALID_BODY });
  }
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_INVALID_BODY });
  }

  const id = cardId ?? card.id;
  if (!id) {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_MISSING_CARD_ID });
  }

  try {
    const item = marshall({ ...card, subject, id }, { removeUndefinedValues: true });
    await dynamoDBClient.send(new PutItemCommand({ TableName: TABLE_NAME, Item: item }));
    return buildResponse(HTTP_OK, { ...card, id });
  } catch (err) {
    console.error("putCard error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
