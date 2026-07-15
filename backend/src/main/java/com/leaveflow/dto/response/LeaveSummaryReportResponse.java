package com.leaveflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class LeaveSummaryReportResponse {
    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long cancelledRequests;
    private List<DepartmentLeaveStat> byDepartment;
    private List<LeaveTypeStat> byLeaveType;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class DepartmentLeaveStat {
        private String departmentName;
        private long totalRequests;
        private double totalDaysTaken;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class LeaveTypeStat {
        private String leaveTypeName;
        private long totalRequests;
        private double totalDaysTaken;
    }
}
