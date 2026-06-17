// Seed the drill-cards-{env} table from the bundled JSON banks (the source of
// truth). Run after deploy or whenever app/data/*.json changes.
//
//   TABLE_NAME=drill-cards-dev AWS_REGION=us-east-1 npm run seed   (from backend/)
//
// Each card is stored as { subject, ...card } where subject = the data filename.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || "drill-cards-dev";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const BATCH_SIZE = 25; // BatchWriteItem hard limit

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || join(here, "..", "..", "app", "data");

const client = new DynamoDBClient({ region: AWS_REGION });

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function seed() {
  const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith(".json"));
  if (files.length === 0) throw new Error(`No .json banks found in ${DATA_DIR}`);

  let total = 0;
  for (const file of files) {
    const subject = basename(file, ".json");
    const cards = JSON.parse(await readFile(join(DATA_DIR, file), "utf8"));
    if (!Array.isArray(cards) || cards.length === 0) {
      console.log(`· ${subject}: skipped (no cards)`);
      continue;
    }

    for (const part of chunk(cards, BATCH_SIZE)) {
      let requestItems = {
        [TABLE_NAME]: part.map((card) => ({
          PutRequest: { Item: marshall({ subject, ...card }, { removeUndefinedValues: true }) },
        })),
      };
      // BatchWriteItem may return UnprocessedItems under throttling — retry them.
      for (let attempt = 0; Object.keys(requestItems).length > 0; attempt++) {
        const { UnprocessedItems } = await client.send(
          new BatchWriteItemCommand({ RequestItems: requestItems }),
        );
        requestItems = UnprocessedItems ?? {};
        if (Object.keys(requestItems).length > 0) {
          await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
        }
      }
    }
    total += cards.length;
    console.log(`✓ ${subject}: ${cards.length} cards`);
  }
  console.log(`\nSeeded ${total} cards into ${TABLE_NAME} (${AWS_REGION}).`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
