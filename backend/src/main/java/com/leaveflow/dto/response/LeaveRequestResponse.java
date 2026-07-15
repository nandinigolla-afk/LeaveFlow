package com.leaveflow.dto.response;

import com.leaveflow.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
@AllArgsConstructor
public class LeaveRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String employeeAvatarUrl;
    private Long leaveTypeId;
    private String leaveTypeName;
    private String leaveTypeColor;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LeaveStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private OffsetDateTime reviewedAt;
    private String reviewComment;
    private OffsetDateTime createdAt;
}
