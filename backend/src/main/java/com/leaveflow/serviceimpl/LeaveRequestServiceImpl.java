package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.LeaveRequestCreateRequest;
import com.leaveflow.dto.request.LeaveRequestUpdateRequest;
import com.leaveflow.dto.request.LeaveReviewRequest;
import com.leaveflow.dto.response.AuditLogResponse;
import com.leaveflow.dto.response.LeaveRequestResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.entity.*;
import com.leaveflow.enums.LeaveStatus;
import com.leaveflow.enums.NotificationType;
import com.leaveflow.exception.BadRequestException;
import com.leaveflow.exception.ForbiddenOperationException;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.mapper.AuditLogMapper;
import com.leaveflow.mapper.LeaveRequestMapper;
import com.leaveflow.repository.*;
import com.leaveflow.service.LeaveRequestService;
import com.leaveflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    private final LeaveRequestMapper leaveRequestMapper;
    private final AuditLogMapper auditLogMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LeaveRequestResponse create(Long employeeId, LeaveRequestCreateRequest request) {
        Employee employee = findEmployeeOrThrow(employeeId);
        LeaveType leaveType = findLeaveTypeOrThrow(request.getLeaveTypeId());

        validateDateRange(request.getStartDate(), request.getEndDate());
        BigDecimal totalDays = calculateDays(request.getStartDate(), request.getEndDate());

        if (leaveRequestRepository.existsOverlapping(employeeId, request.getStartDate(), request.getEndDate(), null)) {
            throw new BadRequestException("You already have a leave request overlapping these dates.");
        }

        ensureSufficientBalance(employee, leaveType, totalDays, null);

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        writeAudit(leaveRequest, "CREATED", employee, null, LeaveStatus.PENDING, "Leave request submitted");

        notifyManager(employee, leaveRequest, NotificationType.LEAVE_REQUEST,
                "New leave request", employee.getFullName() + " requested " + totalDays + " day(s) of " + leaveType.getName());

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequestResponse update(Long employeeId, Long leaveRequestId, LeaveRequestUpdateRequest request) {
        LeaveRequest leaveRequest = findLeaveRequestOrThrow(leaveRequestId);
        assertOwner(leaveRequest, employeeId);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be edited.");
        }

        LeaveType leaveType = findLeaveTypeOrThrow(request.getLeaveTypeId());
        validateDateRange(request.getStartDate(), request.getEndDate());
        BigDecimal totalDays = calculateDays(request.getStartDate(), request.getEndDate());

        if (leaveRequestRepository.existsOverlapping(employeeId, request.getStartDate(), request.getEndDate(), leaveRequestId)) {
            throw new BadRequestException("You already have a leave request overlapping these dates.");
        }

        ensureSufficientBalance(leaveRequest.getEmployee(), leaveType, totalDays, leaveRequestId);

        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setTotalDays(totalDays);
        leaveRequest.setReason(request.getReason());
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        writeAudit(leaveRequest, "UPDATED", leaveRequest.getEmployee(), leaveRequest.getStatus(), leaveRequest.getStatus(), "Leave request edited");

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Override
    @Transactional
    public void delete(Long employeeId, Long leaveRequestId) {
        LeaveRequest leaveRequest = findLeaveRequestOrThrow(leaveRequestId);
        assertOwner(leaveRequest, employeeId);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be deleted.");
        }

        leaveRequestRepository.delete(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequestResponse cancel(Long employeeId, Long leaveRequestId) {
        LeaveRequest leaveRequest = findLeaveRequestOrThrow(leaveRequestId);
        assertOwner(leaveRequest, employeeId);

        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED || leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            throw new BadRequestException("This leave request cannot be cancelled.");
        }

        LeaveStatus previousStatus = leaveRequest.getStatus();

        if (previousStatus == LeaveStatus.APPROVED) {
            releaseBalance(leaveRequest);
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        writeAudit(leaveRequest, "CANCELLED", leaveRequest.getEmployee(), previousStatus, LeaveStatus.CANCELLED, "Cancelled by employee");

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequestResponse review(Long reviewerId, Long leaveRequestId, LeaveReviewRequest request) {
        LeaveRequest leaveRequest = findLeaveRequestOrThrow(leaveRequestId);
        Employee reviewer = findEmployeeOrThrow(reviewerId);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be reviewed.");
        }

        LeaveStatus previousStatus = leaveRequest.getStatus();
        LeaveStatus newStatus = Boolean.TRUE.equals(request.getApprove()) ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

        if (newStatus == LeaveStatus.APPROVED) {
            consumeBalance(leaveRequest);
        }

        leaveRequest.setStatus(newStatus);
        leaveRequest.setReviewedBy(reviewer);
        leaveRequest.setReviewedAt(OffsetDateTime.now());
        leaveRequest.setReviewComment(request.getComment());
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        writeAudit(leaveRequest, newStatus == LeaveStatus.APPROVED ? "APPROVED" : "REJECTED",
                reviewer, previousStatus, newStatus, request.getComment());

        userRepository.findByEmployeeId(leaveRequest.getEmployee().getId()).ifPresent(user ->
                notificationService.notify(user.getId(),
                        newStatus == LeaveStatus.APPROVED ? NotificationType.LEAVE_APPROVED : NotificationType.LEAVE_REJECTED,
                        "Leave request " + newStatus.name().toLowerCase(),
                        "Your " + leaveRequest.getLeaveType().getName() + " request was " + newStatus.name().toLowerCase() + " by " + reviewer.getFullName(),
                        "/leave-requests/" + leaveRequest.getId()));

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Override
    public LeaveRequestResponse getById(Long leaveRequestId) {
        return leaveRequestMapper.toResponse(findLeaveRequestOrThrow(leaveRequestId));
    }

    @Override
    public PageResponse<LeaveRequestResponse> search(Long employeeId, LeaveStatus status, Long leaveTypeId,
                                                       LocalDate fromDate, LocalDate toDate, String search, Pageable pageable) {
        Page<LeaveRequest> page = leaveRequestRepository.search(employeeId, status, leaveTypeId, fromDate, toDate, search, pageable);
        return new PageResponse<>(page.map(leaveRequestMapper::toResponse));
    }

    @Override
    public PageResponse<LeaveRequestResponse> getPendingApprovalsForManager(Long managerId, Pageable pageable) {
        Page<LeaveRequest> page = leaveRequestRepository.findByManagerAndStatus(managerId, LeaveStatus.PENDING, pageable);
        return new PageResponse<>(page.map(leaveRequestMapper::toResponse));
    }

    @Override
    public List<AuditLogResponse> getAuditTrail(Long leaveRequestId) {
        return auditLogRepository.findByLeaveRequestIdOrderByCreatedAtDesc(leaveRequestId).stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ---------- internal helpers ----------

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new BadRequestException("End date cannot be before start date.");
        }
    }

    private BigDecimal calculateDays(LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return BigDecimal.valueOf(days);
    }

    private void ensureSufficientBalance(Employee employee, LeaveType leaveType, BigDecimal requestedDays, Long excludeRequestId) {
        int year = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveType.getId(), year)
                .orElseThrow(() -> new BadRequestException("No leave balance allocated for " + leaveType.getName() + "."));

        if (balance.getRemainingDays().compareTo(requestedDays) < 0) {
            throw new BadRequestException("Insufficient " + leaveType.getName() + " balance. Remaining: " + balance.getRemainingDays());
        }
    }

    private void consumeBalance(LeaveRequest leaveRequest) {
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), year)
                .orElseThrow(() -> new BadRequestException("No leave balance allocated for this leave type."));

        if (balance.getRemainingDays().compareTo(leaveRequest.getTotalDays()) < 0) {
            throw new BadRequestException("Insufficient balance to approve this request.");
        }
        balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);
    }

    private void releaseBalance(LeaveRequest leaveRequest) {
        int year = leaveRequest.getStartDate().getYear();
        leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), year)
                .ifPresent(balance -> {
                    balance.setUsedDays(balance.getUsedDays().subtract(leaveRequest.getTotalDays()).max(BigDecimal.ZERO));
                    leaveBalanceRepository.save(balance);
                });
    }

    private void notifyManager(Employee employee, LeaveRequest leaveRequest, NotificationType type, String title, String message) {
        if (employee.getManager() == null) {
            return;
        }
        userRepository.findByEmployeeId(employee.getManager().getId()).ifPresent(managerUser ->
                notificationService.notify(managerUser.getId(), type, title, message, "/leave-requests/" + leaveRequest.getId()));
    }

    private void writeAudit(LeaveRequest leaveRequest, String action, Employee performedBy,
                             LeaveStatus previousStatus, LeaveStatus newStatus, String notes) {
        LeaveRequestAuditLog log = LeaveRequestAuditLog.builder()
                .leaveRequest(leaveRequest)
                .action(action)
                .performedBy(performedBy)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .notes(notes)
                .build();
        auditLogRepository.save(log);
    }

    private void assertOwner(LeaveRequest leaveRequest, Long employeeId) {
        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new ForbiddenOperationException("You can only manage your own leave requests.");
        }
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    private LeaveType findLeaveTypeOrThrow(Long id) {
        return leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with id: " + id));
    }

    private LeaveRequest findLeaveRequestOrThrow(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));
    }
}
