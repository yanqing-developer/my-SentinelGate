# SentinelGate

**Privacy-first local scanning before data leaves a trusted environment.**

SentinelGate is a backend-focused prototype that demonstrates how to detect potentially sensitive content locally, convert the result into a cloud-safe summary, and send only that summary to a cloud-side service for governance and reporting-safe workflows.

It is intentionally small, but it is built to tell a clear engineering story about service boundaries, explainable detection, safe cloud ingestion, observability, and persistence tradeoffs.

## Why SentinelGate Exists

Organizations increasingly need to review text before it is sent to external systems such as SaaS tools, cloud storage, third-party APIs, or AI services.

The core problem is not just classification accuracy. It is architectural trust:

- raw text may contain sensitive data that must remain inside a trusted boundary
- cloud systems may still need safe summary data for audit, reporting, or workflow coordination
- teams need simple, explainable behavior rather than opaque black-box scanning

SentinelGate models that split explicitly.

## Core Architecture

```text
User / internal system
        |
        v
sentinelgate-local-agent
- receives raw text
- scans locally
- produces explainable signals
- decides ALLOW / WARN / BLOCK
- builds cloudSafeSummary
        |
        |  only summary-safe payloads
        v
sentinelgate-cloud-platform
- accepts scan summaries
- stores summary-safe records
- exposes governance/reporting-safe read APIs
        ^
        |
packages/contracts
- shared boundary-safe summary contract
```

## Privacy Boundary

This is the most important design rule in the repository.

`sentinelgate-local-agent` is the only service allowed to handle raw text.

`sentinelgate-cloud-platform` persists and serves only summary-safe data such as:

- `caseId`
- summarized `detectedSignals`
- `riskLevel`
- `recommendation`
- metadata such as `source` and `receivedAt`

Cloud-side code does **not** accept or store:

- `rawText`
- `rawContent`
- full source content
- detailed local-only scan context

That boundary is reinforced by shared contracts in [packages/contracts](D:/Projects/code/my-SentinelGate/packages/contracts).

## Current Implemented Capabilities

The current repository already demonstrates:

- local-only raw text scanning in [apps/sentinelgate-local-agent](D:/Projects/code/my-SentinelGate/apps/sentinelgate-local-agent)
- explainable rule-based detection for patterns such as email, phone numbers, long numeric identifiers, and sensitive keywords
- deterministic risk decisions: `LOW / MEDIUM / HIGH` and `ALLOW / WARN / BLOCK`
- generation of `cloudSafeSummary` payloads aligned to shared contracts
- cloud-side ingestion and read APIs in [apps/sentinelgate-cloud-platform](D:/Projects/code/my-SentinelGate/apps/sentinelgate-cloud-platform)
- SQLite-backed persistence for cloud summary records
- structured logs with request/correlation IDs in both services
- centralized error handling with consistent JSON error responses
- GitHub Actions CI that runs automated tests for both services

This is still an early prototype. It is not presented as production-ready.

## End-to-End Flow

The implemented flow is:

1. Raw text is submitted to `sentinelgate-local-agent`
2. The local agent scans the text and produces explainable signals
3. The local agent computes a deterministic risk decision
4. The local agent builds a contract-safe summary that excludes raw text
5. The summary is sent to `sentinelgate-cloud-platform`
6. The cloud platform persists only the summary-safe record and exposes read APIs

## Repository Structure

```text
.
├── apps/
│   ├── sentinelgate-local-agent/
│   └── sentinelgate-cloud-platform/
└── packages/
    └── contracts/
```

## How to Run

Install dependencies:

```bash
npm install
```

Start the local agent:

```bash
npm run dev:local
```

Start the cloud platform:

```bash
npm run dev:cloud
```

## How to Demo

1. Install dependencies:

```bash
npm install
```

2. In one terminal, start the local agent:

```bash
npm run dev:local
```

3. In a second terminal, start the cloud platform:

```bash
npm run dev:cloud
```

4. In a third terminal, run the end-to-end demo helper:

```bash
npm run demo:send-summary --workspace sentinelgate-local-agent
```

The demo helper will:

- create and scan a local case
- build a cloud-safe summary
- send the summary to the cloud platform
- read the stored cloud record back
- print the result with a correlation ID

Run tests:

```bash
npm run test --workspace sentinelgate-local-agent
npm run test --workspace sentinelgate-cloud-platform
```

## CI, Observability, and Persistence Notes

The repository includes a few reliability-minded basics without pretending to be a full platform yet.

- CI: GitHub Actions runs automated tests for both services on push and pull request
- Observability: both services emit structured logs with `x-request-id` / `x-correlation-id`
- Error handling: both services use centralized Express error middleware with consistent JSON responses
- Persistence: cloud summary records are stored in a minimal SQLite database; local raw text is not persisted to cloud

## Why This Project Is Useful for Backend / Platform Engineering

SentinelGate is useful as a portfolio project because it demonstrates several backend engineering themes in a compact, reviewable codebase:

- privacy-first system design
- explicit trust boundaries between services
- explainable, deterministic business logic
- safe cloud ingestion patterns
- lightweight observability and request correlation
- centralized error handling and CI discipline
- simple persistence tradeoffs instead of premature platform complexity

## Future Roadmap

Reasonable next steps for the project include:

- policy versioning for scanner behavior and governance rules
- richer cloud-side audit workflows and record views
- stronger persistence modeling and query patterns
- real external monitoring integration behind the existing monitoring seam
- deployment automation and environment packaging

Those are future extensions, not current features.
