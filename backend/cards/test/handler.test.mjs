import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { marshall } from "@aws-sdk/util-dynamodb";
import { handler } from "../index.mjs";
import { dynamoDBClient } from "../utils/dynamo.mjs";

const event = ({ method, subject, cardId, body, claims }) => ({
  requestContext: {
    http: { method },
    ...(claims !== undefined ? { authorizer: { jwt: { claims } } } : {}),
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

test("writes without manage:cards or admin role are forbidden", async () => {
  const res = await handler(
    event({ method: "DELETE", subject: "react", cardId: "r1", claims: { permissions: ["read:x"], user_roles: ["viewer"] } }),
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
      claims: { permissions: ["manage:cards"] },
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
      claims: { permissions: "[manage:cards read:x]" },
      body: JSON.stringify({ id: "r2", question: "Q?" }),
    }),
  );
  assert.equal(res.statusCode, 200);
});

test("admin role in user_roles authorizes writes (no manage:cards needed)", async () => {
  mock.method(dynamoDBClient, "send", async () => ({}));
  const res = await handler(
    event({
      method: "POST",
      subject: "react",
      claims: { user_roles: ["admin"], scope: "openid profile email" },
      body: JSON.stringify({ id: "r3", question: "Q?" }),
    }),
  );
  assert.equal(res.statusCode, 200);
});

test("admin role survives a stringified user_roles claim", async () => {
  mock.method(dynamoDBClient, "send", async () => ({}));
  const res = await handler(
    event({
      method: "DELETE",
      subject: "react",
      cardId: "r3",
      claims: { user_roles: "[admin]" },
    }),
  );
  assert.equal(res.statusCode, 204);
});
