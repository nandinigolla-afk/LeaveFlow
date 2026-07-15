package com.leaveflow.mapper;

import com.leaveflow.dto.response.LeaveTypeResponse;
import com.leaveflow.entity.LeaveType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LeaveTypeMapper {
    LeaveTypeResponse toResponse(LeaveType leaveType);
}
