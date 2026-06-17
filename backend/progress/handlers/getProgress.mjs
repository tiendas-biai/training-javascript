import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import { HTTP_OK, HTTP_INTERNAL_SERVER_ERROR, ERROR_INTERNAL_SERVER } from "../utils/constants.mjs";

// GET /progress/{subject} -> { [cardId]: Progress } — exactly the shape the
// client's StoredProgressMap holds. Pages through the query so a subject with
// many cards still returns the full map.
export const getProgress = async (userId, subject) => {
  try {
    const items = [];
    let ExclusiveStartKey;
    do {
      const res = await dynamoDBClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :u AND begins_with(cardKey, :p)",
          ExpressionAttributeValues: marshall({ ":u": userId, ":p": `${subject}#` }),
          ExclusiveStartKey,
        }),
      );
      items.push(...(res.Items ?? []));
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    const map = {};
    for (const raw of items) {
      const { userId: _u, cardKey, ...progress } = unmarshall(raw);
      const cardId = cardKey.slice(subject.length + 1); // strip "<subject>#"
      map[cardId] = progress;
    }
    return buildResponse(HTTP_OK, map);
  } catch (err) {
    console.error("getProgress error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
