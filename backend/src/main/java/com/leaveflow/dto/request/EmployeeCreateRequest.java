package com.leaveflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeCreateRequest {

    @NotBlank
    @Size(max = 60)
    private String firstName;

    @NotBlank
    @Size(max = 60)
    private String lastName;

    @NotBlank
    @Email
    private String email;

    private String phone;

    @NotBlank
    private String designation;

    private Long departmentId;

    private Long managerId;

    @NotNull
    private LocalDate dateOfJoining;

    /** Role to assign: ADMIN, MANAGER, or EMPLOYEE */
    @NotBlank
    private String role;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String initialPassword;
}
