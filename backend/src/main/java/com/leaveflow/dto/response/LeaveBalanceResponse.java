package com.leaveflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class LeaveBalanceResponse {
    private Long id;
    private Long leaveTypeId;
    private String leaveTypeName;
    private String leaveTypeCode;
    private String colorHex;
    private Integer year;
    private BigDecimal allocatedDays;
    private BigDecimal usedDays;
    private BigDecimal carriedForward;
    private BigDecimal remainingDays;
}
