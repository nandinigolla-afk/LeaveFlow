package com.leaveflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestUpdateRequest {

    @NotNull
    private Long leaveTypeId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Size(max = 1000)
    private String reason;
}
