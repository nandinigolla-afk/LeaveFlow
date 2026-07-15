package com.leaveflow.dto.request;

import com.leaveflow.enums.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployeeUpdateRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    private String email;

    private String phone;

    private String designation;

    private Long departmentId;

    private Long managerId;

    private EmployeeStatus status;
}
