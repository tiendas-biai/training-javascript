// Merge a batch of authored deep dives into data/deepdives/<subject>.json.
//
// Reusable per-topic template (see documents/DEEP_DIVES.md):
//   1. Set `subject` and fill `batch` with { "<card-id>": { explanation, example?, resources } }.
//   2. node scripts/dd-batch.mjs           # merges only the listed ids, pretty-prints the file
//   3. node scripts/verify-deepdive-examples.mjs <subject>   # type-checks every example
//   4. git commit the data file per topic.
//
// Only the ids present in `batch` are overwritten; everything else is left untouched.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const subject = 'react';
const file = join(here, '..', 'data', 'deepdives', `${subject}.json`);

const batch = {
  // "react-xxx-001": {
  //   explanation: "**Problem** … **Why** … **Why the solution works** … **Common mistakes** …",
  //   example: "```tsx\nexport default function App() {\n  return null;\n}\n```",
  //   resources: [{ label: "react.dev — …", url: "https://react.dev/…" }],
  // },
};

if (Object.keys(batch).length === 0) {
  console.log('batch is empty — fill the `batch` object first. Nothing written.');
} else {
  const data = JSON.parse(await readFile(file, 'utf8'));
  for (const [id, entry] of Object.entries(batch)) data[id] = entry;
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`Merged ${Object.keys(batch).length} entries into ${subject}.json`);
}
