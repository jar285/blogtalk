# 000 Workflow QA

## Metadata

- QA ID: 000-workflow/qa
- Parent Spec: `specs/000-workflow/spec.md`
- Parent Sprint: `specs/000-workflow/sprints/sprint-0.md`

## QA Scope

Verify that the workflow scaffold exists and is enforceable for future work.

## Findings: Spec vs Scaffold

### Matches

- `specs/` structure includes required workflow and audit tracks.
- Templates exist for spec, sprint, and QA.
- Workflow order is explicit and mandatory.
- Invariants are written explicitly and aligned with requested constraints.
- Traceability expectations are documented in `specs/README.md` and `000-workflow/spec.md`.

### Missing

- No missing structural files for the requested scaffold.

### Extra

- No unrelated process artifacts were added under `specs/`.

### Ambiguous

- Enforcement mechanism is policy-based documentation, not automated linting or CI gate yet.

## Findings Classification

### Confirmed Facts

- The repository now contains a `specs/` source-of-truth structure.
- Workflow templates are present and reusable.
- Workflow invariants and QA reporting model are explicitly defined.

### Open Questions

- Should CI reject pull requests that bypass spec/sprint/QA links?
- Should legacy `/sprints` docs be backfilled into `specs/` format or left as historical artifacts?

### Suspected Drift

- Future drift risk exists if workflow is not enforced during review and CI.

## Disposition

- Action now: Use `specs/` workflow for all new work immediately.
- Action deferred: Add CI and PR template enforcement as a dedicated future sprint.
- Carry-forward items:
  - Decide CI enforcement policy for traceability.
  - Decide handling policy for legacy sprint archive.
