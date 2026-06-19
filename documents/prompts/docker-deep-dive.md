# Docker Deep-Dive Prompt

Explain the concept shown in the card below as if you were teaching it to an experienced
developer who wants to understand *why* it works, not just memorize the answer. The Docker
subject is integration-focused: cards span Docker fundamentals, Kubernetes, and AWS container
services (ECR, ECS/Fargate, EKS), so anchor the explanation in how containers actually ship
to production on AWS.

Your explanation should:

1. Explain the problem being discussed.
2. Explain why it happens (image layers, the scheduler, networking, IAM — whatever the card is about).
3. Explain why the proposed solution / answer works.
4. Mention common mistakes or misconceptions.
5. Keep it concise and practical.

Write the bold section labels ending in a **colon** (`**The problem:** …`, `**Why it happens:** …`)
so the `DeepDive` component inserts spacing — do not add manual line breaks.

After the explanation, provide a complete, copy-paste-ready example.

## Code requirements

- Pick the fence language that matches the concept:
  - `dockerfile` — Dockerfile snippets (must start each logical line with a real instruction).
  - `yaml` — Kubernetes manifests and `docker-compose.yml` (must be valid YAML; multi-doc `---` ok).
  - `bash` — Docker / `kubectl` / `aws` / `eksctl` CLI workflows (must pass `bash -n`).
  - `json` — ECS task definitions and other AWS JSON (must be valid JSON).
- Make it the simplest example that shows the behavior; brief inline comments on key lines.
- Use real, current resource names/flags. For AWS examples use placeholder account `123456789012`
  and region `us-east-1`. Purely conceptual cards (e.g. "advantages of Fargate") may omit `example`.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/docker.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: problem / why / why the answer works / common mistakes",
    "example": "```dockerfile\n# or ```yaml / ```bash / ```json — match the concept\n```",
    "resources": [
      { "label": "Docker docs — <page>", "url": "https://docs.docker.com/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` must be a single fenced block; omit the key entirely for conceptual cards.
- `resources`: 1–3 links, prefer official docs (docs.docker.com, kubernetes.io, docs.aws.amazon.com).

Verify the merged result with `node scripts/verify-docker-examples.mjs docker` (yaml parse,
`bash -n`, Dockerfile instruction lint).

## Card

[paste the card JSON here]
