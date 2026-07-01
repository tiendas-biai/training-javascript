# Exercise 08 — Social Network

## What it does

Builds an undirected graph from the event log (an adjacency map of
`user → Set of neighbors`), then partitions users by how many neighbors they end
up with.

## Key concepts

### Symmetric adjacency

```js
if (type === 'CONNECT') { setA.add(b); setB.add(a) }
else if (type === 'DISCONNECT') { setA.delete(b); setB.delete(a) }
```

Because connections are mutual, every event touches **both** users' neighbor
sets. Using a `Set` per user means a repeated `CONNECT` between the same pair
doesn't inflate the count, and a `DISCONNECT` cleanly removes the edge from both
sides.

### Ensure-then-use

```js
const ensure = (user) => {
  if (!connections.has(user)) connections.set(user, new Set())
  return connections.get(user)
}
```

Lazily creating a user's set on first mention means even someone who connects and
then fully disconnects still exists in the graph (with `0` connections) and gets
classified.

## Implementation notes

- **Replay, then classify.** All events are applied first; grouping happens once
  at the end based on the final neighbor counts.
- **Threshold is "or more".** `neighbors.size >= count` goes to `more`; strictly
  fewer goes to `less`.

## Things to watch out for

- **Touch both endpoints.** Updating only one user's set would desynchronize the
  graph and miscount degrees. Every edge change is mirrored.
- **Idempotent edges.** Sets make duplicate connects and disconnects safe — the
  degree reflects distinct neighbors, not raw event counts.
- **Disconnected users still count.** A user who ends with zero connections is
  still a user and belongs in `less` (assuming `count >= 1`); don't drop them.
