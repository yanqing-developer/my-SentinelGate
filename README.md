# SentinelGate

SentinelGate is a privacy-first, local-first internal tool for detecting and tagging sensitive data before content leaves a trusted environment.

This repository is organized as a minimal npm workspace monorepo. The current implementation is an early foundation and prototype, not a full platform.

## Current Maturity

- Early foundation / prototype
- Runnable local agent service
- Runnable cloud platform placeholder service
- Shared contracts package for boundary-safe schemas and docs

## Monorepo Structure

```text
.
├── apps/
│   ├── sentinelgate-local-agent/
│   └── sentinelgate-cloud-platform/
└── packages/
    └── contracts/
```

## Service Responsibilities

### `apps/sentinelgate-local-agent`

- Express service for local-first processing
- Handles raw text locally
- Owns the current job lifecycle prototype
- Represents the trusted boundary where scan-oriented work happens

### `apps/sentinelgate-cloud-platform`

- Express service for cloud-facing summary and audit workflows
- Accepts only summary-oriented payloads in the current prototype
- Does not accept raw text fields
- Exists to make the cloud boundary explicit before larger platform features are added

### `packages/contracts`

- Shared JSON schemas and contract notes
- Intended to define cloud-safe DTO and schema boundaries
- Reinforces that raw text must not be part of cloud-bound payloads

## Current Implementation Notes

- The repository currently uses JavaScript with Node.js and Express.
- Earlier README text referenced TypeScript for the local service and Go for the cloud service. That is not the current implementation state.
- If those migrations happen later, they should be treated as roadmap work rather than current reality.

## Current Endpoints

### Local Agent

- `GET /api/health`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs/:id/start`
- `POST /api/jobs/:id/complete`
- `POST /api/jobs/:id/fail`

### Cloud Platform

- `GET /health`
- `POST /api/scan-summaries`

The cloud placeholder route accepts only summary-oriented fields and rejects obvious raw text fields.

## Future Direction

The intended direction remains:

- stronger local scan modeling
- explicit local-agent vs cloud-platform contracts
- policy and audit domain models
- async job workflows
- observability and deployment workflows

Those pieces are not yet implemented in this step.
