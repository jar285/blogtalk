# 000 Workflow Sprint 0

## Metadata

- Sprint ID: 000-workflow/sprint-0
- Parent Spec: `specs/000-workflow/spec.md`
- Status: Complete
- Purpose: Install the workflow scaffold only.

## Single Purpose

Create the process foundation for spec-first delivery in this repository.

## Scope

- Create `specs/` directory tree.
- Create workflow templates for spec, sprint, and QA.
- Create workflow spec, sprint, and QA artifacts.
- Create current-state audit spec, sprint, and QA artifacts.
- Define naming and traceability conventions.

## Out Of Scope

- Feature implementation.
- Architecture refactoring.
- Runtime behavior changes.
- Dependency or infrastructure changes.

## Deliverables

- `specs/README.md`
- `specs/templates/spec-template.md`
- `specs/templates/sprint-template.md`
- `specs/templates/qa-template.md`
- `specs/000-workflow/spec.md`
- `specs/000-workflow/qa.md`
- `specs/001-current-state-audit/spec.md`
- `specs/001-current-state-audit/qa.md`

## Verification Plan

- Confirm required folder tree exists exactly.
- Confirm templates are usable without additional headings.
- Confirm workflow order and invariants are explicit.
- Confirm QA language enforces matches/missing/extra/ambiguous.

## Traceability

- Spec: `specs/000-workflow/spec.md`
- QA: `specs/000-workflow/qa.md`
