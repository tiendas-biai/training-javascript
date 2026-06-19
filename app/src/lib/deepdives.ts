// Loads a subject's deep-dive write-ups (app/data/deepdives/<subject>.json), keyed
// by card id. Bundled and dynamic-imported so each subject's deep dives are a
// separate chunk, fetched only when the card detail page needs them. The cards API
// path doesn't use this — there the deep dive rides along on the card itself.
import type { DeepDiveMap } from '../types';

const cast = (p: Promise<unknown>) => p as Promise<{ default: DeepDiveMap }>;

// One entry per subject. Adding a subject = add its deepdives file here.
const loaders: Record<string, () => Promise<{ default: DeepDiveMap }>> = {
  javascript: () => cast(import('../../data/deepdives/javascript.json')),
  react: () => cast(import('../../data/deepdives/react.json')),
  node: () => cast(import('../../data/deepdives/node.json')),
  typescript: () => cast(import('../../data/deepdives/typescript.json')),
  aws: () => cast(import('../../data/deepdives/aws.json')),
  graphql: () => cast(import('../../data/deepdives/graphql.json')),
  springboot: () => cast(import('../../data/deepdives/springboot.json')),
  java: () => cast(import('../../data/deepdives/java.json')),
  python: () => cast(import('../../data/deepdives/python.json')),
};

/** Dynamic-import a subject's deep-dive map. Unknown subjects resolve to {}. */
export async function loadDeepDives(subjectId: string): Promise<DeepDiveMap> {
  const loader = loaders[subjectId];
  if (!loader) return {};
  const mod = await loader();
  return mod.default ?? {};
}
