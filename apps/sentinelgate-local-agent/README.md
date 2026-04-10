# sentinelgate-local-agent

This service is the local-first boundary for SentinelGate.

- Raw text stays local to this service.
- The primary flow is `scan-cases`: create a local scan case, run the scanner, review explainable signals, and derive a deterministic decision.
- The local agent produces a `cloudSafeSummary` using the shared contract in `packages/contracts`.
- The service emits small structured logs with request/correlation IDs.
- Centralized Express error handling returns consistent JSON errors with `code`, `message`, and `requestId`.
- Logs never include `rawText` or full source content.
- A tiny monitoring adapter seam exists so Sentry can be attached later without changing controller logic.
- Legacy job endpoints remain only as compatibility paths from the earlier prototype.
- `npm run demo:send-summary --workspace sentinelgate-local-agent` sends a demo summary to a running cloud-platform service.
