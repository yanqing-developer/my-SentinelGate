# sentinelgate-cloud-platform

This service is the cloud-side receiver for SentinelGate scan summaries.

- It accepts only cloud-safe summary payloads from the local agent.
- It does not accept or store raw text.
- Accepted summary records are kept in memory in this stage.
- The current role is governance and reporting-safe ingestion, not full policy or audit workflow management.
