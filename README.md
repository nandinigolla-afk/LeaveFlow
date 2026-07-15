# LeaveFlow Pro

A production-quality full-stack Leave Management System — Spring Boot 3 / Java 21 API, React 19 / TypeScript SPA, PostgreSQL. Built for the Digital Heroes Full Stack Developer Trial.

**[Architecture](./docs/ARCHITECTURE.md)** · **[API Reference](./docs/API.md)** · **[Deployment Guide](./docs/DEPLOYMENT.md)** · **[Progress Log](./PROGRESS.md)**

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, TanStack Query, Framer Motion, Recharts |
| Backend | Spring Boot 3, Java 21, Spring Security, JWT, Spring Data JPA, Flyway, MapStruct, Lombok, springdoc-openapi |
| Database | PostgreSQL |
| Deployment | Vercel (frontend) · Render (backend) · Neon (database) |

## Features

- **Auth**: signup, login, forgot/reset password, JWT access + refresh tokens, role-based authorization (Admin / Manager / Employee)
- **Dashboards**: distinct Admin, Manager, and Employee dashboards
- **Leave types**: Annual, Casual, Sick, Work From Home, Maternity — admin-configurable
- **Leave requests**: create, edit, delete, cancel, approve, reject, with full audit trail
- **Leave history**: search, filter, sort, paginate
- **Reports**: leave summary by status/department/type, with charts
- **Employee & department management**: full CRUD
- **Notifications**: in-app, on submit/approve/reject
- **Dark mode**, responsive design, loading/error/empty states throughout

## Project Structure

```
leaveflow-pro/
├── backend/                 Spring Boot API
│   ├── src/main/java/com/leaveflow/
│   │   ├── controller/      REST endpoints
│   │   ├── service/         Business logic interfaces
│   │   ├── serviceimpl/     Business logic implementations
│   │   ├── repository/      Spring Data JPA repositories
│   │   ├── entity/          JPA entities
│   │   ├── dto/             Request/response DTOs
│   │   ├── mapper/          MapStruct entity↔DTO mappers
│   │   ├── security/        JWT + Spring Security integration
│   │   ├── exception/       Domain exceptions + global handler
│   │   └── config/          Security, CORS, OpenAPI config
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/    Flyway migrations
│   └── Dockerfile
├── frontend/                 React SPA
│   └── src/
│       ├── pages/            Route-level screens (admin/manager/employee/auth)
│       ├── layouts/           Role-based layouts (sidebar + navbar)
│       ├── components/        ui/ (generic) · common/ · leave/ · admin/ (domain)
│       ├── lib/                Axios client + typed API modules
│       ├── store/              Auth & theme context
│       └── routes/             Protected routes, role redirect
├── database/
│   ├── schema.sql             Full DDL: tables, indexes, constraints, FKs
│   ├── ER_DIAGRAM.md          Mermaid ER diagram
│   └── seed_demo_data.sql      Optional demo accounts + sample data
├── docs/                       Architecture, API, deployment docs
├── .github/workflows/ci.yml    CI: backend build+test, frontend typecheck+build
├── render.yaml                 Render deployment blueprint
└── PROGRESS.md                 Build log
```

## Local Development Setup

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+, npm
- PostgreSQL 15+ (local, or a Neon connection string)

### 1. Database
Create a local database (or use Neon directly for local dev too):
```bash
createdb leaveflow
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL / USERNAME / PASSWORD at minimum
mvn spring-boot:run
```
Flyway runs migrations automatically on boot. The API is live at `http://localhost:8080`, Swagger UI at `http://localhost:8080/swagger-ui.html`.

> Note: Spring Boot doesn't read `.env` files natively — either export the variables in your shell, use a plugin like `spring-boot-dotenv`, or pass them inline:
> ```bash
> DATABASE_URL=jdbc:postgresql://localhost:5432/leaveflow DATABASE_USERNAME=postgres DATABASE_PASSWORD=postgres mvn spring-boot:run
> ```

Optional — load demo accounts and sample data:
```bash
psql leaveflow -f ../database/seed_demo_data.sql
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080/api/v1
npm install
npm run dev
```
The app is live at `http://localhost:5173`.

## Deployment Instructions

Full walkthrough in **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**. Summary:

1. **Neon**: create a project, copy the connection string.
2. **Render**: deploy `backend/` via the included `render.yaml` blueprint (Docker runtime); set `DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD`/`CORS_ALLOWED_ORIGINS`/`FRONTEND_URL`.
3. **Vercel**: deploy `frontend/` with root directory `frontend`; set `VITE_API_BASE_URL` to your Render URL + `/api/v1`.

## Demo Credentials

After running `database/seed_demo_data.sql` (see above), three demo accounts are available — all use the same password:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@leaveflow.pro` | `Passw0rd!` |
| Manager | `manager@leaveflow.pro` | `Passw0rd!` |
| Employee | `employee@leaveflow.pro` | `Passw0rd!` |

The demo employee already reports to the demo manager, and has one sample **pending** leave request waiting for the manager to review — a ready-made way to exercise the full approval flow immediately after logging in.

You can also just use the **Sign Up** page to create a fresh Employee account at any time — signup is self-service and works without seed data.

## Testing Instructions

**Backend:**
```bash
cd backend
mvn test          # unit/integration tests
mvn verify         # full build including tests, run in CI
```

**Frontend:**
```bash
cd frontend
npx tsc -b         # type-check, zero errors required
npm run build       # production build
npm run lint         # ESLint
```

**Manual smoke test (recommended before submission):**
1. Sign up a new Employee account (or use demo `employee@leaveflow.pro`).
2. Submit a leave request → confirm it appears as `PENDING` in Leave History.
3. Log in as `manager@leaveflow.pro` → Team Approvals → approve or reject it → confirm the employee's balance updates accordingly and a notification appears for the employee.
4. Log in as `admin@leaveflow.pro` → Employees/Departments/Leave Types → confirm CRUD works → Reports → confirm charts reflect the data above.
5. Toggle dark mode; resize to mobile width and confirm the sidebar collapses to a drawer.

## Final Submission Checklist

- [x] All functional requirements implemented (auth, RBAC, dashboards, leave CRUD + approval workflow, reports, employee/department management, notifications, dark mode, validation, exception handling, audit logs, loading/error/empty states)
- [x] Database: ER diagram, full schema with indexes/FKs/constraints, seed data
- [x] Backend: layered architecture, DTOs, mappers, global exception handling, Swagger docs, response wrapper
- [x] Frontend: responsive dashboards per role, protected routes, reusable components, dark mode
- [x] `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `.env.example` (both apps), `.gitignore` (both apps)
- [x] Architecture and API documentation (`docs/`)
- [x] Deployment configuration for Render, Vercel, Neon (`render.yaml`, `frontend/vercel.json`, `backend/Dockerfile`)
- [x] CI pipeline (`.github/workflows/ci.yml`)
- [x] Verified locally in this environment: frontend `tsc -b` and `vite build` both pass clean
- [ ] **You should still**: run `mvn clean verify` yourself once (no Maven/network access in the sandbox that built this — see note below), push to GitHub, and do one real deploy following `docs/DEPLOYMENT.md` before submitting, to catch anything environment-specific

> **Honesty note on verification**: the frontend was installed, type-checked, and built successfully in the sandbox that generated this project. The backend could **not** be compiled here (no Maven / Maven Central access in this environment) — it was reviewed carefully by hand, but you should run `mvn clean verify` locally as your first step and fix anything that surfaces before you consider this submission-ready.
