package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.*;
import com.leaveflow.dto.response.AuthResponse;
import com.leaveflow.dto.response.UserSummaryResponse;
import com.leaveflow.entity.*;
import com.leaveflow.enums.RoleName;
import com.leaveflow.exception.BadRequestException;
import com.leaveflow.exception.ConflictException;
import com.leaveflow.exception.InvalidTokenException;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.repository.*;
import com.leaveflow.security.JwtService;
import com.leaveflow.security.UserPrincipal;
import com.leaveflow.service.AuthService;
import com.leaveflow.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int PASSWORD_RESET_EXPIRY_MINUTES = 30;

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.reset-password-url}")
    private String resetPasswordUrl;

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with this email already exists.");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        }

        Employee employee = Employee.builder()
                .employeeCode(generateEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .designation(request.getDesignation())
                .department(department)
                .dateOfJoining(request.getDateOfJoining())
                .build();
        employee = employeeRepository.save(employee);

        Role employeeRole = roleRepository.findByName(RoleName.EMPLOYEE)
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role not seeded"));

        User user = User.builder()
                .employee(employee)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(employeeRole))
                .build();
        user = userRepository.save(user);

        allocateDefaultLeaveBalances(employee);

        emailService.sendWelcomeEmail(user.getEmail(), employee.getFullName());

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);

        return AuthResponse.of(accessToken, refreshToken, toSummary(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);

        return AuthResponse.of(accessToken, refreshToken, toSummary(user));
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (RuntimeException ex) {
            throw new InvalidTokenException("Invalid or expired refresh token.");
        }

        if (!"refresh".equals(jwtService.extractTokenType(token)) || !jwtService.isTokenValid(token, username)) {
            throw new InvalidTokenException("Invalid or expired refresh token.");
        }

        User user = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserPrincipal principal = new UserPrincipal(user);
        String newAccessToken = jwtService.generateAccessToken(principal);
        String newRefreshToken = jwtService.generateRefreshToken(principal);

        return AuthResponse.of(newAccessToken, newRefreshToken, toSummary(user));
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(OffsetDateTime.now().plusMinutes(PASSWORD_RESET_EXPIRY_MINUTES))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = resetPasswordUrl + "?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), user.getEmployee().getFullName(), resetLink);
        });
        // Always respond as if successful — do not leak whether the email exists.
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token."));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new InvalidTokenException("Invalid or expired reset token.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
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

    private UserSummaryResponse toSummary(User user) {
        Employee employee = user.getEmployee();
        return UserSummaryResponse.builder()
                .userId(user.getId())
                .employeeId(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(user.getEmail())
                .designation(employee.getDesignation())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .avatarUrl(employee.getAvatarUrl())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .build();
    }
}
