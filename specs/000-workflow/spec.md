# 000 Workflow Spec

## Metadata

- Spec ID: 000-workflow
- Status: Approved
- Purpose: Define mandatory delivery workflow for all future work.

## What A Spec Is

A spec is the high-level contract for intended change.
It defines what the system should do, what it must not do, boundaries, invariants, and success criteria.
Specs are written in plain English and avoid implementation detail unless essential for clarity.

## What A Sprint Is

A sprint is a small, single-purpose execution unit derived from one spec.
Each sprint must have one clear objective and bounded scope.

## What QA Is

QA is explicit verification between intent and reality:

- Spec vs code: does implementation match the spec?
- Sprint vs spec: did sprint scope deliver what it promised, and only that?

QA must report: matches, missing, extra, ambiguous.

## What Traceability Means

Traceability means each change can be followed from intent to implementation:

- Spec defines intent.
- Sprint defines execution slice.
- Code implements sprint scope.
- QA verifies both alignment checks.

No code change is valid without a traceable chain.

## Mandatory Work Order

1. Code Audit
2. Spec
3. QA Spec vs Code
4. Sprint
5. Code
6. QA Sprint vs Spec
7. Carry forward validated and relevant findings only

## Variance And Invariance

### Variance

Variance is what we intend to introduce, modify, or remove in a controlled way.
Variance must be declared in the spec before coding begins.

### Invariance

Invariance is what must remain true and what must never happen during delivery.

## Workflow Invariants

- Do not make up function names.
- Do not invent files, APIs, or behaviors that do not exist.
- Do not start coding before the relevant spec exists.
- Do not skip QA.
- Do not let one sprint serve multiple unrelated purposes.
- Do not silently change architecture.
- Do not mix broad refactoring and feature work without stating it explicitly.
- Do not move domain logic into transport, route handlers, or UI layers without explicit spec justification.
- Carry forward only validated and relevant findings between sprints.
- Every sprint must state its single purpose.
- QA must explicitly state what matches, what is missing, what is extra, and what is ambiguous.
- No sprint may combine process setup, architecture refactoring, and feature delivery unless the spec explicitly allows it.

## Success Criteria

- The repo has a `specs/` source-of-truth system with templates and initial specs.
- Every future change can be mapped to spec -> sprint -> code -> QA.
- QA output uses explicit and repeatable classification.
- Workflow rules are understandable by humans and AI.

## Non-Goals

- Implementing product features.
- Performing broad architecture redesign.
- Rewriting historical sprint artifacts.
