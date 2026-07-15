package com.leaveflow.mapper;

import com.leaveflow.dto.response.LeaveRequestResponse;
import com.leaveflow.entity.LeaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveRequestMapper {

    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "employeeName", expression = "java(leaveRequest.getEmployee().getFullName())")
    @Mapping(target = "employeeCode", source = "employee.employeeCode")
    @Mapping(target = "employeeAvatarUrl", source = "employee.avatarUrl")
    @Mapping(target = "leaveTypeId", source = "leaveType.id")
    @Mapping(target = "leaveTypeName", source = "leaveType.name")
    @Mapping(target = "leaveTypeColor", source = "leaveType.colorHex")
    @Mapping(target = "reviewedById", source = "reviewedBy.id")
    @Mapping(target = "reviewedByName", expression = "java(leaveRequest.getReviewedBy() != null ? leaveRequest.getReviewedBy().getFullName() : null)")
    LeaveRequestResponse toResponse(LeaveRequest leaveRequest);
}
