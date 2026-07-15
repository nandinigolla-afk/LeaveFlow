package com.leaveflow.controller;

import com.leaveflow.dto.request.LeaveRequestCreateRequest;
import com.leaveflow.dto.request.LeaveRequestUpdateRequest;
import com.leaveflow.dto.request.LeaveReviewRequest;
import com.leaveflow.dto.response.*;
import com.leaveflow.enums.LeaveStatus;
import com.leaveflow.security.SecurityUtils;
import com.leaveflow.service.LeaveRequestService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leave-requests")
@RequiredArgsConstructor
@Tag(name = "Leave Requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> create(@Valid @RequestBody LeaveRequestCreateRequest request) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request submitted", leaveRequestService.create(employeeId, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> update(@PathVariable Long id,
                                                                      @Valid @RequestBody LeaveRequestUpdateRequest request) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success("Leave request updated", leaveRequestService.update(employeeId, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        leaveRequestService.delete(employeeId, id);
        return ResponseEntity.ok(ApiResponse.success("Leave request deleted", null));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancel(@PathVariable Long id) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", leaveRequestService.cancel(employeeId, id)));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> review(@PathVariable Long id,
                                                                       @Valid @RequestBody LeaveReviewRequest request) {
        Long reviewerId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success("Leave request reviewed", leaveRequestService.review(reviewerId, id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getById(id)));
    }

    @GetMapping("/{id}/audit-trail")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditTrail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getAuditTrail(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> getMyLeaveRequests(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) Long leaveTypeId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success(
                leaveRequestService.search(employeeId, status, leaveTypeId, fromDate, toDate, null, pageable)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> searchAll(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) Long leaveTypeId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveRequestService.search(employeeId, status, leaveTypeId, fromDate, toDate, search, pageable)));
    }

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> pendingApprovals(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Long managerId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getPendingApprovalsForManager(managerId, pageable)));
    }
}
