package com.leaveflow.dto.response;

import com.leaveflow.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private LocalDate dateOfJoining;
    private EmployeeStatus status;
    private String avatarUrl;
}
