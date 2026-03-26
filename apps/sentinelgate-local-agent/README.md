# sentinelgate-local-agent

This service is the local-first boundary for SentinelGate.

- Raw text stays local to this service.
- The local agent performs scan-oriented work and manages local job lifecycle state.
- Cloud-bound payloads should contain only summary-oriented data.
