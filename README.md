# SentinelGate

SentinelGate is a privacy-first, local-first internal tool for detecting and tagging sensitive data before content leaves a trusted environment.

This repository is organized as a minimal npm workspace monorepo. The current implementation is an early dual-service prototype, not a full platform.

## Current Maturity

- Early dual-service foundation / prototype
- Runnable local agent service with explainable local scanning
- Runnable cloud platform service that accepts only cloud-safe summaries
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
- Runs explainable rule-based scanning
- Produces `cloudSafeSummary` shapes without raw text

### `apps/sentinelgate-cloud-platform`

- Express service for cloud-facing governance and reporting-safe records
- Accepts only scan summary payloads
- Stores accepted summary records in memory
- Does not accept or store raw text

### `packages/contracts`

- Shared JSON schemas and contract notes
- Defines the summary boundary between local and cloud
- Reinforces that raw text must not be part of cloud-bound payloads

## Current Endpoints

### Local Agent

- `GET /api/health`
- `POST /api/scan-cases`
- `POST /api/scan-cases/:id/scan`
- `GET /api/scan-cases/:id`
- `GET /api/scan-cases/:id/result`
- Legacy job endpoints remain for compatibility only

### Cloud Platform

- `GET /health`
- `POST /api/scan-summaries`
- `GET /api/scan-summaries`
- `GET /api/scan-summaries/:id`
- `GET /api/scan-summaries/case/:caseId`

## Current Implementation Notes

- The repository currently uses JavaScript with Node.js and Express.
- Both services are intentionally in-memory in this stage.
- The project story is now: raw text stays local, cloud receives only safe summaries.

## Future Direction

The intended direction remains:

- stronger policy and governance modeling
- richer cloud-side audit/reporting workflows
- persistent storage
- observability and deployment workflows

Those pieces are not yet implemented in this step.
