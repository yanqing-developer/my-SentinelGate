# SentinelGate

**Privacy-First Pre-Upload Risk Analysis System**  
Local/Cloud Separation - Async Job Processing - Strict State Machine - Contract-Driven Design

Built with:
- Cloud: Go
- Local: TypeScript (Node.js)

---

## Overview

SentinelGate models a real enterprise requirement:

Before uploading internal documents or content to external systems (cloud storage, SaaS platforms, AI tools, or third-party services), organizations must assess whether the data contains sensitive information.

This project demonstrates a privacy-preserving backend architecture for:

- Pre-upload risk assessment
- Strict data boundary enforcement
- Asynchronous analysis workflows
- Contract-driven API design

The focus is architectural correctness and production realism rather than feature volume.

---

## Real-World Motivation

Enterprises face increasing risks when sharing data externally:

- Accidental leakage of personal identifiers
- Exposure of confidential business information
- Compliance violations (GDPR and internal governance policies)
- Uncontrolled use of AI tools with sensitive data

A safe workflow requires:

1. Sensitive data to remain inside a trusted boundary
2. External analysis services to operate without raw data access
3. Non-blocking background processing
4. Deterministic and auditable state transitions

SentinelGate models this architecture in a minimal but production-minded way.

---

## System Architecture

Client  
↓  
Local Service (TypeScript / Node.js)  
↓  
Sends only non-sensitive signals  
↓  
Cloud Service (Go)

---

### Local Service

Responsibilities:

- Stores sensitive case data
- Extracts non-sensitive risk signals
- Initiates analysis jobs in the Cloud
- Maintains case-to-job mapping
- Aggregates job status for clients

Sensitive content never leaves this service.

Examples of data stored locally:

- rawContent
- subjectName
- email
- internalNotes
- file references

---

### Cloud Service

Responsibilities:

- Executes long-running risk analysis jobs
- Applies scoring rules to non-sensitive signals
- Manages job lifecycle state
- Returns structured risk summaries

Cloud receives only:

- caseId
- Derived signal indicators
- Non-sensitive metadata

Cloud never receives raw content.

The Cloud layer is implemented in Go to reflect production-oriented backend design where:

- Concurrency and background execution matter
- Explicit error handling is preferred
- Job lifecycle management must be deterministic

---

## Privacy Boundary

The system enforces a strict trust separation.

Cloud must never accept or return:

- rawContent
- subjectName
- email
- fileName
- filePath
- internalNotes
- Any personally identifiable or business-sensitive field

Cloud only processes:

- caseId
- Derived risk signals
- Job status
- Risk score
- Risk level
- Structured summary

This boundary is architectural and encoded in JSON schema definitions.

---

## Risk Analysis Model (Simplified)

Each job produces a structured, non-sensitive result:

- riskScore (0–100)
- riskLevel (LOW - MEDIUM - HIGH)
- detectedSignals (e.g. EMAIL_PATTERN, NUMERIC_ID_PATTERN)
- recommendation (e.g. "Mask identifiers before upload")

The scoring logic is intentionally simple to keep the focus on system architecture rather than machine learning complexity.

---

## Job Lifecycle

All jobs follow a strict state machine:

PENDING → RUNNING → DONE  
                 ↘ FAILED  

Invalid transitions are rejected.

Examples of illegal transitions:

- DONE → RUNNING
- FAILED → RUNNING
- DONE → PENDING

This models production-grade background processing integrity.

---

## Async Processing Model

SentinelGate uses a pull-based polling mechanism:

1. POST /jobs → returns jobId
2. GET /jobs/:jobId → retrieve job status

Design choices:

- No blocking HTTP requests
- No long-running synchronous endpoints
- Clear separation between submission and retrieval

---

## Contract-Driven Development

All external responses are defined using JSON Schema.

Design principles:

- additionalProperties: false
- Explicit required fields
- Enum-based constraints
- Structured error responses
- Privacy boundary encoded in structure

Schemas are stored in `/contracts`.

---

## Repository Structure

.
├── cloud/       - Go service (risk engine + job manager)
├── local/       - TypeScript service (sensitive boundary)
├── contracts/   - Shared JSON schemas
└── README.md

---

## Technical Highlights

- Explicit Local/Cloud trust separation
- Zero raw data leakage to Cloud
- Asynchronous background job processing
- Strict state machine enforcement
- Centralized error contract
- Privacy boundary encoded in schema
- Minimal but production-minded structure

---

## Future Improvements

Potential extensions include:

- Persistent storage
- Authentication and authorization
- Message queues (Kafka or SQS)
- Idempotent job submission
- Observability (metrics and tracing)
- Rate limiting
- Audit logging

---

## Purpose

SentinelGate is built as an interview-ready backend engineering demonstration.

It highlights architectural reasoning, privacy awareness, and system modeling over UI or feature breadth.
