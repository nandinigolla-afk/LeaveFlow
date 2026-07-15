package com.leaveflow.service;

import com.leaveflow.dto.response.LeaveBalanceResponse;

import java.util.List;

public interface LeaveBalanceService {
    List<LeaveBalanceResponse> getBalancesForEmployee(Long employeeId, Integer year);
}
