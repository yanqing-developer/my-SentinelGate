## Job Status Specification

This document defines the lifecycle and invariants of a cloud job in SentinelGate.
It is a contract level specification(readable by engineering, QA, and reviewers) and is enforced by implementation.

### Status Enum

- PENDING: Job is created and acceped, but not started yet.
- RUNNING: Job is executing and progress may advance over time.
- DONE: Job finished successfully and produced a non-sensitive result summary.
- FAILED: Job terminated with an error(non-sensitive).

### Allowed Transitions 

- PENDING -> RUNNING
- RUNNING -> DONE
- RUNNING -> FAILED

All other transition are invalid and must be rejected.

Examples of invalid transitions:

- PENDING -> DONE
- PENDING -> FAILED
- RUNNING -> PENDING 
- DONE -> PENDING
- FAILED -> PENDING 

### Invariants

- Progress must be an integer within [0,100]
- result is allowed only when status is DONE
- error is allowed only when status is FAILED
- Cloud responses must not contain any sensitive fields (raw content, names ,emails, file paths, intertal notes)
  only derived signals and non-senstive summaries are allowed.

### Notes

- The system uses a pull-based polling model: clients query job status via GET /jobs/:jobId,
- Job execution is asynchronous and must not block the HTTP request that creates the Job.

