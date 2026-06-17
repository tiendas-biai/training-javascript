import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { marshall } from "@aws-sdk/util-dynamodb";
import { handler } from "../index.mjs";
import { dynamoDBClient } from "../utils/dynamo.mjs";

// Build a minimal HTTP API v2 event with the JWT authorizer claims populated.
const event = ({ method, subject, cardId, body, sub = "auth0|abc123" }) => ({
  requestContext: {
    http: { method },
    ...(sub ? { authorizer: { jwt: { claims: { sub } } } } : {}),
  },
  pathParameters: { ...(subject && { subject }), ...(cardId && { cardId }) },
  body,
});

afterEach(() => mock.restoreAll());

test("rejects requests without a verified sub claim", async () => {
  const res = await handler(event({ method: "GET", subject: "react", sub: null }));
  assert.equal(res.statusCode, 401);
});

test("PUT derives userId from the token, never from the body", async () => {
  let captured;
  mock.method(dynamoDBClient, "send", async (cmd) => {
    captured = cmd;
    return {};
  });

  const res = await handler(
    event({
      method: "PUT",
      subject: "react",
      cardId: "react-hooks-001",
      // Attacker tries to write into someone else's partition via the body:
      body: JSON.stringify({ userId: "auth0|victim", phase: "review", interval: 5 }),
    }),
  );

  assert.equal(res.statusCode, 204);
  assert.equal(captured.constructor.name, "PutItemCommand");
  assert.equal(captured.input.Item.userId.S, "auth0|abc123"); // from claim, not body
  assert.equal(captured.input.Item.cardKey.S, "react#react-hooks-001");
  assert.equal(captured.input.Item.phase.S, "review");
});

test("GET returns a { cardId: Progress } map with no key leakage", async () => {
  mock.method(dynamoDBClient, "send", async () => ({
    Items: [
      marshall({
        userId: "auth0|abc123",
        cardKey: "react#react-hooks-001",
        phase: "review",
        interval: 5,
        ease: 2.5,
      }),
    ],
  }));

  const res = await handler(event({ method: "GET", subject: "react" }));
  assert.equal(res.statusCode, 200);
  const map = JSON.parse(res.body);
  assert.deepEqual(map, {
    "react-hooks-001": { phase: "review", interval: 5, ease: 2.5 },
  });
});

test("invalid PUT body is rejected with 400", async () => {
  const res = await handler(
    event({ method: "PUT", subject: "react", cardId: "x", body: "not json" }),
  );
  assert.equal(res.statusCode, 400);
});
