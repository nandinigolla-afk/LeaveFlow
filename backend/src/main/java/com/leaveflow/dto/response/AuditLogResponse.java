package com.leaveflow.dto.response;

import com.leaveflow.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String action;
    private String performedByName;
    private LeaveStatus previousStatus;
    private LeaveStatus newStatus;
    private String notes;
    private OffsetDateTime createdAt;
}
