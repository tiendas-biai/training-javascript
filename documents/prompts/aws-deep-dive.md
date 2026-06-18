# AWS SAA Deep-Dive Prompt

Explain the concept shown in the scenario card below as if you were coaching an experienced
engineer for the AWS Certified Solutions Architect – Associate (SAA-C03) exam. Focus on *why*
the correct answer is right and *why the distractors are wrong*, not just the answer.

Your explanation should:

1. Restate the problem / scenario and what is actually being optimized for
   (security, resilience, performance, or cost).
2. Explain the AWS service behavior or design principle that drives the answer.
3. Explain why the correct option(s) win against the alternatives.
4. Call out the trap(s) — why the tempting wrong answers are wrong, and any exam keywords
   ("most cost-effective", "least operational overhead", "highly available") that flip the choice.
5. Keep it concise and exam-practical.

## Example requirements (optional)

AWS cards are usually conceptual, so a code example is **optional**. Include one only when it
genuinely clarifies the concept — e.g. a short IAM/S3 bucket policy (JSON), an AWS CLI command,
or a minimal CloudFormation/CDK snippet. If you include one, make it a single fenced code block
with the right language tag (` ```json `, ` ```bash `, ` ```yaml `). Otherwise omit `example`.

## Output format

Return **one JSON object** (no prose around it) ready to paste into
`app/data/deepdives/aws.json` under the card's `id`:

```json
{
  "<card-id>": {
    "explanation": "markdown: scenario / driving principle / why the answer wins / the traps",
    "example": "```json\n// optional — IAM policy / CLI / CFN snippet, only if it clarifies\n```",
    "resources": [
      { "label": "AWS Docs — <service/page>", "url": "https://docs.aws.amazon.com/…" }
    ]
  }
}
```

- `explanation` markdown supports `**bold**`, `*italic*`, `` `inline code` ``, fenced code.
- `example` is optional — drop the key entirely when there's no useful snippet.
- `resources`: 1–3 links, prefer docs.aws.amazon.com or the AWS Well-Architected Framework.

## Card

[paste the card JSON here]
