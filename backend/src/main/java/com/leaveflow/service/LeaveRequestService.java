package com.leaveflow.service;

import com.leaveflow.dto.request.LeaveRequestCreateRequest;
import com.leaveflow.dto.request.LeaveRequestUpdateRequest;
import com.leaveflow.dto.request.LeaveReviewRequest;
import com.leaveflow.dto.response.AuditLogResponse;
import com.leaveflow.dto.response.LeaveRequestResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.enums.LeaveStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestService {
    LeaveRequestResponse create(Long employeeId, LeaveRequestCreateRequest request);
    LeaveRequestResponse update(Long employeeId, Long leaveRequestId, LeaveRequestUpdateRequest request);
    void delete(Long employeeId, Long leaveRequestId);
    LeaveRequestResponse cancel(Long employeeId, Long leaveRequestId);
    LeaveRequestResponse review(Long reviewerId, Long leaveRequestId, LeaveReviewRequest request);
    LeaveRequestResponse getById(Long leaveRequestId);
    PageResponse<LeaveRequestResponse> search(Long employeeId, LeaveStatus status, Long leaveTypeId,
                                               LocalDate fromDate, LocalDate toDate, String search, Pageable pageable);
    PageResponse<LeaveRequestResponse> getPendingApprovalsForManager(Long managerId, Pageable pageable);
    List<AuditLogResponse> getAuditTrail(Long leaveRequestId);
}
