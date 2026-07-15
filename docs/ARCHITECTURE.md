# Architecture

## Overview

LeaveFlow Pro is a two-tier application: a stateless Spring Boot REST API backed by PostgreSQL, and a React SPA that consumes it over JWT-authenticated HTTP.

```
┌──────────────────┐        HTTPS/JSON        ┌───────────────────────┐        JDBC        ┌──────────────┐
│  React SPA        │ ───────────────────────▶ │  Spring Boot API      │ ──────────────────▶ │  PostgreSQL   │
│  (Vercel)          │ ◀─────────────────────── │  (Render, Docker)     │ ◀────────────────── │  (Neon)       │
└──────────────────┘      JWT Bearer token     └───────────────────────┘                     └──────────────┘
```

## Backend

**Layering** (`backend/src/main/java/com/leaveflow/`):

```
controller/    → REST endpoints. Thin: validate via annotations, delegate to services, wrap in ApiResponse<T>.
service/       → Interfaces defining business operations.
serviceimpl/   → Business logic: validation rules, orchestration, transactions.
repository/    → Spring Data JPA interfaces with custom @Query methods for search/filter/pagination.
entity/        → JPA entities mapped 1:1 to tables in database/schema.sql.
dto/request/   → Inbound payloads with bean validation.
dto/response/  → Outbound shapes, decoupled from entities.
mapper/        → MapStruct interfaces: entity → response DTO.
security/      → JWT issuing/validation, Spring Security UserDetails integration, SecurityUtils for "current user" access.
exception/     → Domain exceptions + GlobalExceptionHandler (RestControllerAdvice) mapping them to HTTP responses.
config/        → SecurityConfig (stateless JWT filter chain, CORS), OpenApiConfig (Swagger).
```

**Why this shape:** controllers stay testable and swap-able (e.g. adding GraphQL later wouldn't touch business logic), services own transaction boundaries (`@Transactional`) so multi-step operations like "approve leave → consume balance → write audit log → notify employee" are atomic, and mappers keep entities from leaking into the API contract.

### Authentication flow

1. `POST /auth/login` validates credentials via Spring Security's `AuthenticationManager` + `BCryptPasswordEncoder`.
2. On success, `JwtService` issues a short-lived **access token** (15 min default) and a longer-lived **refresh token** (7 days default), both HS256-signed.
3. `JwtAuthenticationFilter` runs once per request, validates the `Authorization: Bearer <token>` header, and populates `SecurityContextHolder` with a `UserPrincipal` carrying the user's roles.
4. `@PreAuthorize("hasRole('ADMIN')")` (etc.) on controller methods enforces role-based access at the endpoint level.
5. When an access token expires, the frontend's Axios interceptor (`lib/api.ts`) transparently calls `/auth/refresh` and retries the original request — the user never sees a forced logout unless the refresh token itself has expired.

### Leave request state machine

```
        create()                 review(approve)              
PENDING ────────▶ (validated) ──────────────────▶ APPROVED
   │                                                   │
   │ update()/delete() while PENDING                   │ cancel()
   │                                                   ▼
   ▼                review(reject)                CANCELLED
 (edited)  ───────────────────────▶ REJECTED
```

Every transition writes a row to `leave_request_audit_logs` (action, actor, previous/new status, notes) — this is what powers the "Audit Trail" endpoint and satisfies the audit-log requirement.

Balance accounting: a request **reserves nothing** at creation (only validated against current remaining balance); it **consumes** balance on approval and **releases** it on cancellation of a previously-approved request. This means two overlapping pending requests can both pass validation but only one can ultimately be approved if balance runs out — the approval step re-validates balance sufficiency as the final guard.

## Frontend

```
src/
  lib/           → Axios client + typed API modules (one per backend resource), token storage, error extraction.
  store/         → React Context: AuthContext (session, role helpers), ThemeContext (dark mode, persisted).
  routes/        → ProtectedRoute (auth + role gate), RoleRedirect (post-login dispatcher).
  layouts/       → AuthLayout (split-screen), AdminLayout/ManagerLayout/EmployeeLayout/SharedLayout — all built on DashboardLayout (Sidebar + Navbar).
  components/ui/ → Generic primitives (Button, Input, Card, Badge, Spinner, EmptyState, ErrorState).
  components/common/ → Modal, ConfirmDialog, Pagination, StatCard.
  components/leave/  → Domain components shared across roles: balance cards, request form modal, review modal, requests table, filters.
  components/admin/  → Admin-only form modals (Employee, Department, LeaveType).
  pages/         → Route-level screens, grouped by role.
```

**State management:** TanStack Query owns all server state (caching, refetching, invalidation on mutation) — there is no separate Redux/Zustand store for API data. `AuthContext`/`ThemeContext` cover the two pieces of genuinely global client state (who's logged in, light/dark).

**Design system:** Tailwind config (`tailwind.config.js`) defines the token set (brand indigo scale, surface/border colors for light+dark, radii, shadows) once; component classes (`.btn-primary`, `.input`, `.card`, etc. in `globals.css`) compose those tokens so every screen stays visually consistent without repeating utility strings everywhere.

## Data model

See [`database/ER_DIAGRAM.md`](../database/ER_DIAGRAM.md) for the full entity-relationship diagram and [`database/schema.sql`](../database/schema.sql) for DDL with all constraints, indexes, and foreign keys.

Key design choices:
- `leave_balances` is keyed on `(employee_id, leave_type_id, year)` — balances reset annually rather than accumulating indefinitely, with an explicit `carried_forward` column for policies that allow rollover.
- `leave_request_audit_logs` is append-only and never updated, giving a tamper-evident history independent of the mutable `leave_requests` row.
- Soft-delete is used for `leave_types` (`active` flag) since historical leave requests reference them by foreign key and must remain queryable even after a type is retired; employees/departments use hard delete since the trial scope doesn't require historical org-chart reconstruction.

## Deployment topology

| Layer | Provider | Notes |
|---|---|---|
| Frontend | Vercel | Static SPA build (`vite build`), SPA rewrite so client-side routing works on refresh |
| Backend | Render | Docker-based web service, health check on `/actuator/health` |
| Database | Neon (serverless Postgres) | Connection string injected via `DATABASE_URL` env var; Flyway runs migrations on boot |

See [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step deployment instructions.
