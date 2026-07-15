package com.leaveflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LeaveTypeRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotNull
    @DecimalMin(value = "0", message = "Default annual days cannot be negative")
    private BigDecimal defaultAnnualDays;

    private boolean requiresApproval = true;

    private boolean active = true;

    private String colorHex;
}
