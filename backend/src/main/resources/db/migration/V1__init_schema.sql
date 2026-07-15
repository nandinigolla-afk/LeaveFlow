-- =====================================================================
-- LeaveFlow Pro — PostgreSQL Schema
-- =====================================================================
-- ER OVERVIEW (textual, see /database/ER_DIAGRAM.md for the diagram)
--
--   departments 1---* employees
--   employees   1---1 users            (users.employee_id -> employees.id)
--   employees   *---1 employees        (manager_id self-reference)
--   users       *---* roles            (via user_roles)
--   employees   1---* leave_requests
--   leave_types 1---* leave_requests
--   employees   1---* leave_balances   (per leave_type per year)
--   leave_types 1---* leave_balances
--   leave_requests 1---* leave_request_audit_logs
--   users       1---* notifications
--   users       1---* password_reset_tokens
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- ENUMS
-- =====================================================================
CREATE TYPE role_name AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');
CREATE TYPE notification_type AS ENUM ('LEAVE_REQUEST', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED', 'SYSTEM');

-- =====================================================================
-- DEPARTMENTS
-- =====================================================================
CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- EMPLOYEES
-- =====================================================================
CREATE TABLE employees (
    id              BIGSERIAL PRIMARY KEY,
    employee_code   VARCHAR(20) NOT NULL UNIQUE,
    first_name      VARCHAR(60) NOT NULL,
    last_name       VARCHAR(60) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    designation     VARCHAR(100),
    department_id   BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    manager_id      BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    date_of_joining DATE NOT NULL,
    status          employee_status NOT NULL DEFAULT 'ACTIVE',
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_not_own_manager CHECK (id <> manager_id)
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);

-- =====================================================================
-- USERS (auth identity, 1:1 with employee)
-- =====================================================================
CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- =====================================================================
-- ROLES / USER_ROLES (many-to-many)
-- =====================================================================
CREATE TABLE roles (
    id      BIGSERIAL PRIMARY KEY,
    name    role_name NOT NULL UNIQUE
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================================
-- PASSWORD RESET TOKENS
-- =====================================================================
CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);

-- =====================================================================
-- LEAVE TYPES
-- =====================================================================
CREATE TABLE leave_types (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(50) NOT NULL UNIQUE,
    code                VARCHAR(10) NOT NULL UNIQUE,
    default_annual_days NUMERIC(5,2) NOT NULL DEFAULT 0,
    requires_approval   BOOLEAN NOT NULL DEFAULT TRUE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    color_hex           VARCHAR(7) DEFAULT '#6366F1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- LEAVE BALANCES (per employee, per leave type, per year)
-- =====================================================================
CREATE TABLE leave_balances (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   BIGINT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year            INT NOT NULL,
    allocated_days  NUMERIC(5,2) NOT NULL DEFAULT 0,
    used_days       NUMERIC(5,2) NOT NULL DEFAULT 0,
    carried_forward NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_balance UNIQUE (employee_id, leave_type_id, year),
    CONSTRAINT chk_used_not_negative CHECK (used_days >= 0)
);

CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id, year);

-- =====================================================================
-- LEAVE REQUESTS
-- =====================================================================
CREATE TABLE leave_requests (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   BIGINT NOT NULL REFERENCES leave_types(id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    total_days      NUMERIC(5,2) NOT NULL,
    reason          VARCHAR(1000),
    status          leave_status NOT NULL DEFAULT 'PENDING',
    reviewed_by     BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    review_comment  VARCHAR(1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_type ON leave_requests(leave_type_id);

-- =====================================================================
-- LEAVE REQUEST AUDIT LOG
-- =====================================================================
CREATE TABLE leave_request_audit_logs (
    id                  BIGSERIAL PRIMARY KEY,
    leave_request_id    BIGINT NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    action              VARCHAR(30) NOT NULL,
    performed_by        BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    previous_status     leave_status,
    new_status          leave_status,
    notes               VARCHAR(1000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_leave_request ON leave_request_audit_logs(leave_request_id);

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================
CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     VARCHAR(1000) NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- =====================================================================
-- SEED: roles + default leave types
-- =====================================================================
INSERT INTO roles (name) VALUES ('ADMIN'), ('MANAGER'), ('EMPLOYEE');

INSERT INTO leave_types (name, code, default_annual_days, requires_approval, color_hex) VALUES
 ('Annual Leave',    'AL', 20, TRUE, '#6366F1'),
 ('Casual Leave',    'CL', 12, TRUE, '#22C55E'),
 ('Sick Leave',      'SL', 10, TRUE, '#EF4444'),
 ('Work From Home',  'WFH', 24, TRUE, '#0EA5E9'),
 ('Maternity Leave', 'ML', 90, TRUE, '#EC4899');
