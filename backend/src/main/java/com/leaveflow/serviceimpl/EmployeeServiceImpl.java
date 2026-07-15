package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.EmployeeCreateRequest;
import com.leaveflow.dto.request.EmployeeUpdateRequest;
import com.leaveflow.dto.request.ProfileUpdateRequest;
import com.leaveflow.dto.response.EmployeeResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.entity.*;
import com.leaveflow.enums.EmployeeStatus;
import com.leaveflow.enums.RoleName;
import com.leaveflow.exception.BadRequestException;
import com.leaveflow.exception.ConflictException;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.mapper.EmployeeMapper;
import com.leaveflow.repository.*;
import com.leaveflow.service.EmailService;
import com.leaveflow.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public EmployeeResponse create(EmployeeCreateRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An employee with this email already exists.");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
        }

        RoleName roleName;
        try {
            roleName = RoleName.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role. Must be one of ADMIN, MANAGER, EMPLOYEE.");
        }
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not seeded: " + roleName));

        Employee employee = Employee.builder()
                .employeeCode(generateEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .designation(request.getDesignation())
                .department(department)
                .manager(manager)
                .dateOfJoining(request.getDateOfJoining())
                .status(EmployeeStatus.ACTIVE)
                .build();
        employee = employeeRepository.save(employee);

        User user = User.builder()
                .employee(employee)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getInitialPassword()))
                .roles(Set.of(role))
                .build();
        userRepository.save(user);

        allocateDefaultLeaveBalances(employee);
        emailService.sendWelcomeEmail(employee.getEmail(), employee.getFullName());

        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long id, EmployeeUpdateRequest request) {
        Employee employee = findOrThrow(id);

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(employee.getEmail())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("An employee with this email already exists.");
            }
            employee.setEmail(request.getEmail());
        }
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
            employee.setDepartment(department);
        }

        if (request.getManagerId() != null) {
            if (request.getManagerId().equals(id)) {
                throw new BadRequestException("An employee cannot be their own manager.");
            }
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
            employee.setManager(manager);
        }

        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }

        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Employee employee = findOrThrow(id);
        userRepository.findByEmployeeId(id).ifPresent(userRepository::delete);
        employeeRepository.delete(employee);
    }

    @Override
    public EmployeeResponse getById(Long id) {
        return employeeMapper.toResponse(findOrThrow(id));
    }

    @Override
    public PageResponse<EmployeeResponse> search(String search, Long departmentId, EmployeeStatus status, Pageable pageable) {
        Page<Employee> page = employeeRepository.search(search, departmentId, status, pageable);
        return new PageResponse<>(page.map(employeeMapper::toResponse));
    }

    @Override
    @Transactional
    public EmployeeResponse updateOwnProfile(Long employeeId, ProfileUpdateRequest request) {
        Employee employee = findOrThrow(employeeId);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) {
            employee.setAvatarUrl(request.getAvatarUrl());
        }
        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    @Override
    public EmployeeResponse getMyProfile(Long employeeId) {
        return employeeMapper.toResponse(findOrThrow(employeeId));
    }

    private void allocateDefaultLeaveBalances(Employee employee) {
        int year = Year.now().getValue();
        List<LeaveType> activeLeaveTypes = leaveTypeRepository.findByActiveTrue();
        for (LeaveType type : activeLeaveTypes) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .year(year)
                    .allocatedDays(type.getDefaultAnnualDays())
                    .build();
            leaveBalanceRepository.save(balance);
        }
    }

    private String generateEmployeeCode() {
        String candidate;
        do {
            candidate = "EMP" + String.format("%05d", (int) (Math.random() * 100000));
        } while (employeeRepository.existsByEmployeeCode(candidate));
        return candidate;
    }

    private Employee findOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }
}
