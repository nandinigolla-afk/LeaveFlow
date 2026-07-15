package com.leaveflow.controller;

import com.leaveflow.dto.response.ApiResponse;
import com.leaveflow.dto.response.LeaveSummaryReportResponse;
import com.leaveflow.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/leave-summary")
    public ResponseEntity<ApiResponse<LeaveSummaryReportResponse>> leaveSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getLeaveSummary(fromDate, toDate, departmentId)));
    }
}
