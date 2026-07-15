package com.leaveflow.controller;

import com.leaveflow.dto.response.ApiResponse;
import com.leaveflow.dto.response.LeaveBalanceResponse;
import com.leaveflow.security.SecurityUtils;
import com.leaveflow.service.LeaveBalanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave-balances")
@RequiredArgsConstructor
@Tag(name = "Leave Balances")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getMyBalances(
            @RequestParam(required = false) Integer year) {
        Long employeeId = securityUtils.getCurrentEmployeeId();
        return ResponseEntity.ok(ApiResponse.success(leaveBalanceService.getBalancesForEmployee(employeeId, year)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getForEmployee(
            @PathVariable Long employeeId, @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.success(leaveBalanceService.getBalancesForEmployee(employeeId, year)));
    }
}
