package com.leaveflow.service;

import com.leaveflow.dto.response.LeaveSummaryReportResponse;

import java.time.LocalDate;

public interface ReportService {
    LeaveSummaryReportResponse getLeaveSummary(LocalDate fromDate, LocalDate toDate, Long departmentId);
}
