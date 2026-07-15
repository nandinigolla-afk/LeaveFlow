package com.leaveflow.serviceimpl;

import com.leaveflow.dto.response.LeaveBalanceResponse;
import com.leaveflow.mapper.LeaveBalanceMapper;
import com.leaveflow.repository.LeaveBalanceRepository;
import com.leaveflow.service.LeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveBalanceMapper leaveBalanceMapper;

    @Override
    public List<LeaveBalanceResponse> getBalancesForEmployee(Long employeeId, Integer year) {
        int targetYear = year != null ? year : Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, targetYear).stream()
                .map(leaveBalanceMapper::toResponse)
                .collect(Collectors.toList());
    }
}
