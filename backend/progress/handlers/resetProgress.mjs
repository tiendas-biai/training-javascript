import { QueryCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient, TABLE_NAME } from "../utils/dynamo.mjs";
import { buildResponse } from "../utils/response.mjs";
import { HTTP_NO_CONTENT, HTTP_INTERNAL_SERVER_ERROR, ERROR_INTERNAL_SERVER } from "../utils/constants.mjs";

const BATCH_SIZE = 25; // BatchWriteItem hard limit

// DELETE /progress/{subject} — clear one subject's rows for this user. Backs
// "Reset all progress". Only ever touches userId's own partition.
export const resetProgress = async (userId, subject) => {
  try {
    const keys = [];
    let ExclusiveStartKey;
    do {
      const res = await dynamoDBClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :u AND begins_with(cardKey, :p)",
          ExpressionAttributeValues: marshall({ ":u": userId, ":p": `${subject}#` }),
          ProjectionExpression: "userId, cardKey",
          ExclusiveStartKey,
        }),
      );
      keys.push(...(res.Items ?? []));
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const chunk = keys.slice(i, i + BATCH_SIZE);
      await dynamoDBClient.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [TABLE_NAME]: chunk.map((Key) => ({ DeleteRequest: { Key } })),
          },
        }),
      );
    }
    return buildResponse(HTTP_NO_CONTENT);
  } catch (err) {
    console.error("resetProgress error:", err);
    return buildResponse(HTTP_INTERNAL_SERVER_ERROR, { error: ERROR_INTERNAL_SERVER });
  }
};
