package com.leaveflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class LeaveTypeResponse {
    private Long id;
    private String name;
    private String code;
    private BigDecimal defaultAnnualDays;
    private boolean requiresApproval;
    private boolean active;
    private String colorHex;
}
