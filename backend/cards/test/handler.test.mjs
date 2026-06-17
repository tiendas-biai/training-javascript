import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { marshall } from "@aws-sdk/util-dynamodb";
import { handler } from "../index.mjs";
import { dynamoDBClient } from "../utils/dynamo.mjs";

const event = ({ method, subject, cardId, body, permissions }) => ({
  requestContext: {
    http: { method },
    ...(permissions !== undefined
      ? { authorizer: { jwt: { claims: { permissions } } } }
      : {}),
  },
  pathParameters: { ...(subject && { subject }), ...(cardId && { cardId }) },
  body,
});

afterEach(() => mock.restoreAll());

test("GET is public and returns the subject's cards without the partition key", async () => {
  mock.method(dynamoDBClient, "send", async () => ({
    Items: [marshall({ subject: "react", id: "r1", question: "Q?", topic: "Hooks" })],
  }));

  const res = await handler(event({ method: "GET", subject: "react" }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), [{ id: "r1", question: "Q?", topic: "Hooks" }]);
});

test("writes without manage:cards are forbidden", async () => {
  const res = await handler(
    event({ method: "DELETE", subject: "react", cardId: "r1", permissions: ["read:x"] }),
  );
  assert.equal(res.statusCode, 403);
});

test("PUT with manage:cards upserts under the path subject + cardId", async () => {
  let captured;
  mock.method(dynamoDBClient, "send", async (cmd) => {
    captured = cmd;
    return {};
  });

  const res = await handler(
    event({
      method: "PUT",
      subject: "react",
      cardId: "r1",
      permissions: ["manage:cards"],
      body: JSON.stringify({ id: "ignored", question: "Q?" }),
    }),
  );

  assert.equal(res.statusCode, 200);
  assert.equal(captured.constructor.name, "PutItemCommand");
  assert.equal(captured.input.Item.subject.S, "react");
  assert.equal(captured.input.Item.id.S, "r1"); // path cardId wins over body id
});

test("manage:cards survives a stringified permissions claim", async () => {
  mock.method(dynamoDBClient, "send", async () => ({}));
  const res = await handler(
    event({
      method: "POST",
      subject: "react",
      permissions: "[manage:cards read:x]",
      body: JSON.stringify({ id: "r2", question: "Q?" }),
    }),
  );
  assert.equal(res.statusCode, 200);
});
