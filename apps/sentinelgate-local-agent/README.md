# sentinelgate-local-agent

This service is the local-first boundary for SentinelGate.

- Raw text stays local to this service.
- The primary flow is `scan-cases`: create a local scan case, run the scanner, review explainable signals, and derive a deterministic decision.
- The local agent produces a `cloudSafeSummary` using the shared contract in `packages/contracts`.
- Legacy job endpoints remain only as compatibility paths from the earlier prototype.
- `npm run demo:send-summary --workspace sentinelgate-local-agent` sends a demo summary to a running cloud-platform service.
