import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const TABLE_NAME = process.env.TABLE_NAME || "drill-progress-dev";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";

export const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });

// SK encodes subject so one Query (begins_with) returns a whole subject's rows.
export const cardKeyFor = (subject, cardId) => `${subject}#${cardId}`;
