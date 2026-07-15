package com.leaveflow.serviceimpl;

import com.leaveflow.dto.response.LeaveSummaryReportResponse;
import com.leaveflow.entity.LeaveRequest;
import com.leaveflow.enums.LeaveStatus;
import com.leaveflow.repository.LeaveRequestRepository;
import com.leaveflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final LeaveRequestRepository leaveRequestRepository;

    @Override
    public LeaveSummaryReportResponse getLeaveSummary(LocalDate fromDate, LocalDate toDate, Long departmentId) {
        List<LeaveRequest> requests = leaveRequestRepository
                .search(null, null, null, fromDate, toDate, null, Pageable.unpaged())
                .stream()
                .filter(lr -> departmentId == null
                        || (lr.getEmployee().getDepartment() != null && lr.getEmployee().getDepartment().getId().equals(departmentId)))
                .collect(Collectors.toList());

        long total = requests.size();
        long pending = countByStatus(requests, LeaveStatus.PENDING);
        long approved = countByStatus(requests, LeaveStatus.APPROVED);
        long rejected = countByStatus(requests, LeaveStatus.REJECTED);
        long cancelled = countByStatus(requests, LeaveStatus.CANCELLED);

        List<LeaveSummaryReportResponse.DepartmentLeaveStat> byDepartment = requests.stream()
                .filter(lr -> lr.getEmployee().getDepartment() != null)
                .collect(Collectors.groupingBy(lr -> lr.getEmployee().getDepartment().getName()))
                .entrySet().stream()
                .map(e -> LeaveSummaryReportResponse.DepartmentLeaveStat.builder()
                        .departmentName(e.getKey())
                        .totalRequests(e.getValue().size())
                        .totalDaysTaken(e.getValue().stream()
                                .filter(lr -> lr.getStatus() == LeaveStatus.APPROVED)
                                .mapToDouble(lr -> lr.getTotalDays().doubleValue())
                                .sum())
                        .build())
                .sorted(Comparator.comparing(LeaveSummaryReportResponse.DepartmentLeaveStat::getDepartmentName))
                .collect(Collectors.toList());

        List<LeaveSummaryReportResponse.LeaveTypeStat> byLeaveType = requests.stream()
                .collect(Collectors.groupingBy(lr -> lr.getLeaveType().getName()))
                .entrySet().stream()
                .map(e -> LeaveSummaryReportResponse.LeaveTypeStat.builder()
                        .leaveTypeName(e.getKey())
                        .totalRequests(e.getValue().size())
                        .totalDaysTaken(e.getValue().stream()
                                .filter(lr -> lr.getStatus() == LeaveStatus.APPROVED)
                                .mapToDouble(lr -> lr.getTotalDays().doubleValue())
                                .sum())
                        .build())
                .sorted(Comparator.comparing(LeaveSummaryReportResponse.LeaveTypeStat::getLeaveTypeName))
                .collect(Collectors.toList());

        return LeaveSummaryReportResponse.builder()
                .totalRequests(total)
                .pendingRequests(pending)
                .approvedRequests(approved)
                .rejectedRequests(rejected)
                .cancelledRequests(cancelled)
                .byDepartment(byDepartment)
                .byLeaveType(byLeaveType)
                .build();
    }

    private long countByStatus(List<LeaveRequest> requests, LeaveStatus status) {
        return requests.stream().filter(lr -> lr.getStatus() == status).count();
    }
}
