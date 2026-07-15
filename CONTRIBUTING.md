# Contributing to LeaveFlow Pro

Thanks for your interest in improving LeaveFlow Pro. This guide covers how to get set up and how changes are expected to land.

## Getting set up

See the [README](./README.md#local-development-setup) for full local setup instructions (backend + frontend + database).

## Branching & commits

- Branch from `main`: `feature/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`.
- Keep commits scoped and descriptive. Prefer [Conventional Commits](https://www.conventionalcommits.org/) style (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) — it keeps history readable and enables automated changelogs later.
- Rebase on `main` before opening a PR; avoid merge commits in feature branches.

## Code style

**Backend (Java / Spring Boot)**
- Follow standard Java conventions; let Lombok handle boilerplate (getters/setters/builders) rather than hand-writing it.
- Keep controllers thin — validation and orchestration belong in services, not controllers.
- New endpoints must: validate input with `jakarta.validation` annotations, return the shared `ApiResponse<T>` wrapper, and be documented with Swagger annotations.
- Any new exception type should extend the pattern in `com.leaveflow.exception` and be registered in `GlobalExceptionHandler`.

**Frontend (React / TypeScript)**
- Strict TypeScript — no `any` unless there's a documented reason (see `EmployeeFormModal.tsx` for the one accepted exception, discriminated union across create/update schemas).
- Co-locate feature components under `components/<domain>/`; keep `components/ui/` limited to generic, domain-agnostic primitives.
- Data fetching goes through TanStack Query with the typed API modules in `lib/*.api.ts` — don't call `axios`/`fetch` directly from components.
- Run `npm run lint` and `npx tsc -b` before opening a PR.

## Testing

- Backend: add/extend tests under `backend/src/test/java`. Run with `mvn test`.
- Frontend: type-checking (`tsc -b`) and a production build (`npm run build`) must both pass.
- New workflow logic (e.g. leave balance calculations, approval state transitions) should have unit test coverage — these are the parts most likely to silently break.

## Pull requests

1. Describe **what** changed and **why**, not just a restatement of the diff.
2. Link the relevant issue if one exists.
3. Include screenshots/GIFs for UI changes.
4. Make sure CI (`.github/workflows/ci.yml`) is green before requesting review.

## Reporting bugs / requesting features

Open an issue with:
- Steps to reproduce (for bugs) or the problem you're trying to solve (for features)
- Expected vs. actual behavior
- Environment (browser, OS, backend/frontend versions) where relevant

## Code of conduct

Be respectful, assume good intent, and keep discussion focused on the work.
