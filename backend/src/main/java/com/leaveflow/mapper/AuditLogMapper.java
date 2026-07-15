package com.leaveflow.mapper;

import com.leaveflow.dto.response.AuditLogResponse;
import com.leaveflow.entity.LeaveRequestAuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    @Mapping(target = "performedByName", expression = "java(log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : \"System\")")
    AuditLogResponse toResponse(LeaveRequestAuditLog log);
}
