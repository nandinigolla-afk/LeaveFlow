package com.leaveflow.service;

import com.leaveflow.dto.request.EmployeeCreateRequest;
import com.leaveflow.dto.request.EmployeeUpdateRequest;
import com.leaveflow.dto.request.ProfileUpdateRequest;
import com.leaveflow.dto.response.EmployeeResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.enums.EmployeeStatus;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponse create(EmployeeCreateRequest request);
    EmployeeResponse update(Long id, EmployeeUpdateRequest request);
    void delete(Long id);
    EmployeeResponse getById(Long id);
    PageResponse<EmployeeResponse> search(String search, Long departmentId, EmployeeStatus status, Pageable pageable);
    EmployeeResponse updateOwnProfile(Long employeeId, ProfileUpdateRequest request);
    EmployeeResponse getMyProfile(Long employeeId);
}
