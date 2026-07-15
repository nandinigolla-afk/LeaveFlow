package com.leaveflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeaveReviewRequest {

    /** true = approve, false = reject */
    @NotNull
    private Boolean approve;

    @Size(max = 1000)
    private String comment;
}
