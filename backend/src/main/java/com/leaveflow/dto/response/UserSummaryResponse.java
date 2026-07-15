package com.leaveflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class UserSummaryResponse {
    private Long userId;
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String designation;
    private String departmentName;
    private String avatarUrl;
    private List<String> roles;
}
