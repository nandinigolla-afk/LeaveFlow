-- Convert PostgreSQL native enum columns to VARCHAR + CHECK constraints.
-- Hibernate's @Enumerated(EnumType.STRING) writes plain VARCHAR over JDBC,
-- which Postgres refuses to implicitly cast into a native enum column.

ALTER TABLE roles
    ALTER COLUMN name TYPE VARCHAR(20) USING name::text;
ALTER TABLE roles
    ADD CONSTRAINT chk_roles_name CHECK (name IN ('ADMIN', 'MANAGER', 'EMPLOYEE'));

ALTER TABLE employees
    ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE employees
    ADD CONSTRAINT chk_employees_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'));

ALTER TABLE leave_requests
    ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE leave_requests
    ADD CONSTRAINT chk_leave_requests_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'));

ALTER TABLE leave_request_audit_logs
    ALTER COLUMN previous_status TYPE VARCHAR(20) USING previous_status::text;
ALTER TABLE leave_request_audit_logs
    ALTER COLUMN new_status TYPE VARCHAR(20) USING new_status::text;
ALTER TABLE leave_request_audit_logs
    ADD CONSTRAINT chk_audit_previous_status CHECK (previous_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') OR previous_status IS NULL);
ALTER TABLE leave_request_audit_logs
    ADD CONSTRAINT chk_audit_new_status CHECK (new_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') OR new_status IS NULL);

ALTER TABLE notifications
    ALTER COLUMN type TYPE VARCHAR(30) USING type::text;
ALTER TABLE notifications
    ADD CONSTRAINT chk_notifications_type CHECK (type IN ('LEAVE_REQUEST', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED', 'SYSTEM'));

-- The native enum types are no longer referenced by any column — safe to drop.
DROP TYPE role_name;
DROP TYPE employee_status;
DROP TYPE leave_status;
DROP TYPE notification_type;
