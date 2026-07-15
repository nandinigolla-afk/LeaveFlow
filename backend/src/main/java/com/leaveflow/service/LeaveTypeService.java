package com.leaveflow.service;

import com.leaveflow.dto.request.LeaveTypeRequest;
import com.leaveflow.dto.response.LeaveTypeResponse;

import java.util.List;

public interface LeaveTypeService {
    LeaveTypeResponse create(LeaveTypeRequest request);
    LeaveTypeResponse update(Long id, LeaveTypeRequest request);
    void delete(Long id);
    List<LeaveTypeResponse> getAll();
}
