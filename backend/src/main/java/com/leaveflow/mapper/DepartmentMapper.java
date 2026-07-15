package com.leaveflow.mapper;

import com.leaveflow.dto.response.DepartmentResponse;
import com.leaveflow.entity.Department;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    default DepartmentResponse toResponse(Department department, long employeeCount) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .employeeCount(employeeCount)
                .build();
    }
}
