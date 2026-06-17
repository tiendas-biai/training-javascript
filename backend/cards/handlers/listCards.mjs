import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import { HTTP_OK, HTTP_INTERNAL_SERVER_ERROR, ERROR_INTERNAL_SERVER } from "../utils/constants.mjs";

// GET /cards/{subject} (public) -> Card[]. The stored `subject` partition key is
// stripped so the response matches the bundled JSON's card shape exactly.
export const listCards = async (subject) => {
  try {
    const cards = [];
    let ExclusiveStartKey;
    do {
      const res = await dynamoDBClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "subject = :s",
          ExpressionAttributeValues: marshall({ ":s": subject }),
          ExclusiveStartKey,
        }),
      );
      for (const raw of res.Items ?? []) {
        const { subject: _s, ...card } = unmarshall(raw);
        cards.push(card);
      }
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return buildResponse(HTTP_OK, cards);
  } catch (err) {
    console.error("listCards error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
