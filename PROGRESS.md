# LeaveFlow Pro — Build Progress

## Phase 1 — DONE (this delivery)
- [x] Full PostgreSQL schema (`database/schema.sql`) + Flyway migration `V1__init_schema.sql`
- [x] ER diagram (`database/ER_DIAGRAM.md`)
- [x] Maven `pom.xml` (Spring Boot 3.3, Java 21, Security, JPA, JWT, MapStruct, Flyway, springdoc)
- [x] `application.yml` / `application-test.yml`
- [x] All JPA entities: Department, Employee, User, Role, PasswordResetToken, LeaveType, LeaveBalance, LeaveRequest, LeaveRequestAuditLog, Notification
- [x] All repositories (search, filters, pagination-ready)
- [x] JWT security: `JwtService`, `JwtAuthenticationFilter`, `UserPrincipal`, `CustomUserDetailsService`
- [x] `SecurityConfig` (stateless, CORS, BCrypt, role-ready `@PreAuthorize`)
- [x] Global exception handling + `ApiResponse<T>` wrapper + `PageResponse<T>`
- [x] Swagger/OpenAPI config with bearer auth
- [x] Auth module end-to-end: Signup, Login, Refresh Token, Forgot Password, Reset Password
  - Auto-provisions default leave balances (Annual/Casual/Sick/WFH/Maternity) on signup
  - Password reset via time-limited UUID token + email
- [x] Email service (HTML mail via Spring Mail, non-blocking failure handling)
- [x] `.env.example`, `.gitignore`

## Phase 2 — DONE (this delivery)
- [x] MapStruct mappers: Department, Employee, LeaveType, LeaveBalance, LeaveRequest, AuditLog, Notification
- [x] Department module: full CRUD, admin-only writes, employee-count rollup
- [x] Employee module: create (auto-provisions user + role + leave balances), update, delete, get, search/filter/paginate; `/profile` self-service endpoints
- [x] Leave Type module: CRUD (soft-delete via `active` flag), default annual day templates
- [x] Leave Balance module: per-employee/per-year balances with `remainingDays` computed
- [x] **Leave Request module (core workflow)**:
  - Create/edit/delete (pending-only), cancel (releases consumed balance)
  - Overlap-date validation, balance sufficiency checks
  - Manager approve/reject with balance consumption on approval
  - Full audit trail (`leave_request_audit_logs`) on every state transition
  - Manager notified on submission; employee notified on approve/reject
  - Search/filter/paginate (by employee, status, leave type, date range, text), `/me`, `/pending-approvals` endpoints
- [x] Notification module: in-app notifications, unread count, mark-as-read / mark-all-read
- [x] Report module: leave summary (totals by status, by department, by leave type), admin/manager only
- [x] Role-based `@PreAuthorize` on every write/sensitive endpoint (ADMIN / MANAGER / EMPLOYEE)
- [x] `SecurityUtils` helper to resolve current authenticated employee/user from JWT context

98 Java files total, all brace-balanced (sanity-checked). Not yet compiled with Maven (no Maven Central access in this sandbox) — run `mvn clean compile` locally as your first step.

## Phase 3 — DONE (this delivery)
- [x] Vite + React 19 + TypeScript scaffold, path alias `@/*`, ESLint-ready
- [x] Tailwind CSS design system: brand indigo palette, dark-mode via `class` strategy, Linear/Stripe/Vercel-inspired tokens (`tailwind.config.js`, `globals.css`)
- [x] Axios API client with JWT interceptor + automatic refresh-token retry queue (`lib/api.ts`)
- [x] Typed API service modules for every backend resource (auth, employees, departments, leave types/balances/requests, notifications, reports)
- [x] `AuthContext` (login/signup/logout, role helpers) + `ThemeContext` (persisted dark mode)
- [x] React Router route tree: public auth routes, role-gated `ProtectedRoute`, `RoleRedirect` post-login dispatcher, `/unauthorized`, 404
- [x] Auth pages with React Hook Form + Zod validation: Login, Signup, Forgot Password, Reset Password
- [x] Layouts: `AuthLayout` (split-screen), `AdminLayout`, `ManagerLayout`, `EmployeeLayout`, `SharedLayout` (profile/notifications), all built on a shared `DashboardLayout` with responsive Sidebar + Navbar (mobile drawer, dark-mode toggle, notification bell, user menu)
- [x] Reusable UI kit: Button, Input, Select, Textarea, Card, StatusBadge, Spinner, EmptyState, ErrorState
- [x] Stub dashboard/profile/notifications pages wired end-to-end to real API calls (profile, notifications list/unread-count)
- [x] **Verified**: `npm install`, `tsc -b` (zero errors), `vite build` (succeeds, 429KB bundle) all run clean in this sandbox

45 frontend TS/TSX files. `node_modules`/`dist` stripped from the delivered zip — run `npm install` locally.

## Phase 4 — DONE (this delivery)
- [x] **Employee**: real dashboard (balances, stats, recent requests), Request Leave page, Leave History with filters + pagination + edit/cancel/delete
- [x] **Manager**: real dashboard (pending-approval count, own balances, approval preview), Team Approvals (review modal), Team Members, My Leave (reuses employee history), Reports
- [x] **Admin**: real dashboard (org stats + quick actions), Employees (search/filter/paginate + create/edit/delete modals), Departments (CRUD cards), All Leave Requests (filterable, reviewable), Leave Types (CRUD), Reports with **recharts** bar + pie charts
- [x] Shared components: `Modal`, `ConfirmDialog`, `Pagination`, `StatCard`, `useDebounce`
- [x] Leave-domain components: `LeaveBalanceCards`, `LeaveRequestFormModal` (create/edit), `ReviewModal` (approve/reject), `LeaveRequestsTable` (role-aware actions), `LeaveRequestFilters`
- [x] Admin-domain form modals: `EmployeeFormModal`, `DepartmentFormModal`, `LeaveTypeFormModal`
- [x] Full route wiring for all three roles in `App.tsx`
- [x] **Verified again**: `npm install`, `tsc -b` (zero errors), `vite build` (succeeds — 915KB bundle, only a chunk-size *warning*, not an error) all pass clean in this sandbox

69 frontend TS/TSX files total. Known simplification: "Team Members" filters client-side from a page of employees (no dedicated `/employees?managerId=` endpoint) — fine for trial scope, flagged for anyone hardening this further.

## Phase 5 — DONE (this delivery) — PROJECT COMPLETE
- [x] `render.yaml` (Docker blueprint) + `backend/Dockerfile` (multi-stage Maven build → slim JRE) + `.dockerignore`
- [x] `frontend/vercel.json` (SPA rewrites, security headers)
- [x] `.github/workflows/ci.yml` — backend `mvn verify` + frontend `tsc -b` / `vite build` on every push
- [x] `LICENSE` (MIT), `CHANGELOG.md`, `CONTRIBUTING.md`
- [x] `docs/ARCHITECTURE.md` — layering rationale, auth flow, leave-request state machine, data model decisions
- [x] `docs/API.md` — full endpoint reference with roles/auth per route
- [x] `docs/DEPLOYMENT.md` — step-by-step Neon → Render → Vercel walkthrough with a post-deploy checklist
- [x] `database/seed_demo_data.sql` — 3 demo accounts (Admin/Manager/Employee) with real BCrypt hashes, leave balances, and one sample pending request ready to approve
- [x] Root `README.md` tying it all together: setup, deployment, demo credentials, testing instructions, submission checklist
- [x] Added backend tests: Spring context-load smoke test + a Mockito unit test for `LeaveTypeServiceImpl`
- [x] Re-verified frontend (`npm install` → `tsc -b` → `vite build`) clean one final time after all additions

**265 files total.** The project is submission-ready pending one thing only: run `mvn clean verify` locally (no Maven/network access in this sandbox) and do one real deploy following `docs/DEPLOYMENT.md`.

**All 5 phases complete.** See the README's Final Submission Checklist for what to verify before you submit.
