# contracts

This package contains shared SentinelGate DTO and schema contracts.

- It defines boundary-safe payload shapes shared across services.
- Cloud-bound payloads must not contain raw text or other sensitive source content.
- `scan-summary-request.schema.json` defines the summary payload shape.
- `scan-summary-contract.js` provides the small shared field list and summary builder used by local and cloud.
- The package is intentionally lightweight and is not published in this stage.
