# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-14

### Added
- Initial production release of LeaveFlow Pro.
- **Auth**: signup, login, JWT access/refresh tokens, forgot/reset password, role-based authorization (Admin, Manager, Employee).
- **Leave management**: create/edit/delete/cancel leave requests, manager approve/reject workflow, per-employee/year leave balances, full audit trail on every state change.
- **Leave types**: configurable categories (Annual, Casual, Sick, Work From Home, Maternity) with admin CRUD.
- **Employee & department management**: full CRUD, search, filter, and pagination.
- **Notifications**: in-app notifications on submission, approval, and rejection.
- **Reports**: leave summary by status, department, and leave type, with charts.
- **Frontend**: React 19 + Vite + TypeScript SPA with Tailwind CSS design system, dark mode, responsive layouts for Admin/Manager/Employee.
- **Docs**: architecture, API, and deployment guides; Postman-ready OpenAPI/Swagger spec.
- **CI**: GitHub Actions pipeline building and type-checking both backend and frontend on every push.
