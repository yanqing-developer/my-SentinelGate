# sentinelgate-cloud-platform

This service is the cloud-side receiver for SentinelGate scan summaries.

- It accepts only contract-safe summary payloads from the local agent.
- It does not accept or store raw text.
- Accepted summary records are kept in memory in this stage.
- Validation is kept lightweight but aligned to the shared summary contract in `packages/contracts`.
- The service emits small structured logs with request/correlation IDs.
- Logs never include raw text or forbidden payload content.
- The current role is governance and reporting-safe ingestion, not full policy or audit workflow management.
