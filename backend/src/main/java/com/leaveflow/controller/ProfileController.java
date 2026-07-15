package com.leaveflow.controller;

import com.leaveflow.dto.request.ProfileUpdateRequest;
import com.leaveflow.dto.response.ApiResponse;
import com.leaveflow.dto.response.EmployeeResponse;
import com.leaveflow.security.SecurityUtils;
import com.leaveflow.service.EmployeeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Tag(name = "Profile")
public class ProfileController {

    private final EmployeeService employeeService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile() {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success(employeeService.getMyProfile(employeeId)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", employeeService.updateOwnProfile(employeeId, request)));
    }
}
