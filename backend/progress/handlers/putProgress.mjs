import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME, cardKeyFor } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import {
  HTTP_NO_CONTENT,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  ERROR_INVALID_BODY,
  ERROR_INTERNAL_SERVER,
} from "../utils/constants.mjs";

// PUT /progress/{subject}/{cardId} — upsert one card's SM-2 progress.
export const putProgress = async (userId, subject, cardId, rawBody) => {
  let progress;
  try {
    progress = JSON.parse(rawBody ?? "");
  } catch {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_INVALID_BODY });
  }
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
    return buildResponse(HTTP_BAD_REQUEST, { error: ERROR_INVALID_BODY });
  }

  try {
    // userId/cardKey come from the verified token + path; never trust them in the body.
    const { userId: _u, cardKey: _k, ...fields } = progress;
    await dynamoDBClient.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(
          { userId, cardKey: cardKeyFor(subject, cardId), ...fields },
          { removeUndefinedValues: true },
        ),
      }),
    );
    return buildResponse(HTTP_NO_CONTENT);
  } catch (err) {
    console.error("putProgress error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
