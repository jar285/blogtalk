# Specs Workflow

`specs/` is the source of truth for planning and execution in this repository.
All future work must start here before code changes begin.

## Required Workflow

1. Code Audit
2. Spec
3. QA Spec vs Code
4. Sprint
5. Code
6. QA Sprint vs Spec

No step may be skipped.

## Purpose Of Each Artifact

- `spec.md`: High-level intent, boundaries, invariants, success criteria, and non-goals.
- `sprints/sprint-N.md`: One sprint, one purpose, small and reviewable implementation slice.
- `qa.md`: Explicit verification with findings under matches, missing, extra, ambiguous.

## Naming Conventions

- Spec folder: `NNN-topic` (example: `000-workflow`).
- Sprint files: `sprint-0.md`, `sprint-1.md`, and so on.
- Templates live in `specs/templates/`.

## Traceability Rules

- Every sprint references its parent spec.
- Every QA document references both spec and sprint artifacts.
- Every code change must map back to a sprint.
- Only validated and relevant findings are carried forward.

## Legacy Sprint Docs

Existing `/sprints` content is treated as historical context.
New work must be initiated and governed by `/specs`.
