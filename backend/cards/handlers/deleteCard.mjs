import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import { HTTP_NO_CONTENT, HTTP_INTERNAL_SERVER_ERROR, ERROR_INTERNAL_SERVER } from "../utils/constants.mjs";

// DELETE /cards/{subject}/{cardId} — admin remove of a single card.
export const deleteCard = async (subject, cardId) => {
  try {
    await dynamoDBClient.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ subject, id: cardId }),
      }),
    );
    return buildResponse(HTTP_NO_CONTENT);
  } catch (err) {
    console.error("deleteCard error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
