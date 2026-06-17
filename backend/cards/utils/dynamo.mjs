import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const TABLE_NAME = process.env.TABLE_NAME || "drill-cards-dev";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";

export const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });
