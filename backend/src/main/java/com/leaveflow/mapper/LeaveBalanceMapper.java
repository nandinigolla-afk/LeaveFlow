package com.leaveflow.mapper;

import com.leaveflow.dto.response.LeaveBalanceResponse;
import com.leaveflow.entity.LeaveBalance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveBalanceMapper {

    @Mapping(target = "leaveTypeId", source = "leaveType.id")
    @Mapping(target = "leaveTypeName", source = "leaveType.name")
    @Mapping(target = "leaveTypeCode", source = "leaveType.code")
    @Mapping(target = "colorHex", source = "leaveType.colorHex")
    @Mapping(target = "remainingDays", expression = "java(balance.getRemainingDays())")
    LeaveBalanceResponse toResponse(LeaveBalance balance);
}
