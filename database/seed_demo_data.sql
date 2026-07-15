-- =====================================================================
-- Demo seed data for LeaveFlow Pro
-- Password for all three demo accounts: Passw0rd!
-- (BCrypt hash below is for that literal password, cost factor 12)
-- =====================================================================

INSERT INTO departments (name, description) VALUES
 ('Engineering', 'Product engineering and platform teams'),
 ('People Operations', 'HR, recruiting, and employee experience');

-- Admin (no manager)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, designation, department_id, manager_id, date_of_joining, status)
VALUES ('EMP00001', 'Ava', 'Administrator', 'admin@leaveflow.pro', '+1-555-0100', 'Head of People Operations',
        (SELECT id FROM departments WHERE name = 'People Operations'), NULL, '2022-01-10', 'ACTIVE');

-- Manager (no manager set yet — set below after insert since self-reference is fine as NULL for top-level manager)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, designation, department_id, manager_id, date_of_joining, status)
VALUES ('EMP00002', 'Miles', 'Manager', 'manager@leaveflow.pro', '+1-555-0101', 'Engineering Manager',
        (SELECT id FROM departments WHERE name = 'Engineering'), NULL, '2022-06-01', 'ACTIVE');

-- Employee (reports to the manager above)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, designation, department_id, manager_id, date_of_joining, status)
VALUES ('EMP00003', 'Elena', 'Employee', 'employee@leaveflow.pro', '+1-555-0102', 'Software Engineer',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE email = 'manager@leaveflow.pro'), '2023-03-15', 'ACTIVE');

-- User accounts (password: Passw0rd!)
INSERT INTO users (employee_id, email, password_hash, is_enabled)
VALUES
 ((SELECT id FROM employees WHERE email = 'admin@leaveflow.pro'), 'admin@leaveflow.pro',
  '$2b$12$y2BYuJKtIk8OMhyhBClzL.wQYgttNQVpkba8QO2ShSae/D8w7DKc2', TRUE),
 ((SELECT id FROM employees WHERE email = 'manager@leaveflow.pro'), 'manager@leaveflow.pro',
  '$2b$12$y2BYuJKtIk8OMhyhBClzL.wQYgttNQVpkba8QO2ShSae/D8w7DKc2', TRUE),
 ((SELECT id FROM employees WHERE email = 'employee@leaveflow.pro'), 'employee@leaveflow.pro',
  '$2b$12$y2BYuJKtIk8OMhyhBClzL.wQYgttNQVpkba8QO2ShSae/D8w7DKc2', TRUE);

-- Role assignments
INSERT INTO user_roles (user_id, role_id)
VALUES
 ((SELECT id FROM users WHERE email = 'admin@leaveflow.pro'), (SELECT id FROM roles WHERE name = 'ADMIN')),
 ((SELECT id FROM users WHERE email = 'manager@leaveflow.pro'), (SELECT id FROM roles WHERE name = 'MANAGER')),
 ((SELECT id FROM users WHERE email = 'employee@leaveflow.pro'), (SELECT id FROM roles WHERE name = 'EMPLOYEE'));

-- Leave balances for the current year for all three demo accounts
INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days)
SELECT e.id, lt.id, EXTRACT(YEAR FROM now())::int, lt.default_annual_days
FROM employees e
CROSS JOIN leave_types lt
WHERE e.email IN ('admin@leaveflow.pro', 'manager@leaveflow.pro', 'employee@leaveflow.pro');

-- A sample pending leave request from the demo employee, for the manager to approve
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
VALUES (
 (SELECT id FROM employees WHERE email = 'employee@leaveflow.pro'),
 (SELECT id FROM leave_types WHERE code = 'AL'),
 (CURRENT_DATE + INTERVAL '14 days')::date,
 (CURRENT_DATE + INTERVAL '16 days')::date,
 3,
 'Family trip planned months ago.',
 'PENDING'
);
