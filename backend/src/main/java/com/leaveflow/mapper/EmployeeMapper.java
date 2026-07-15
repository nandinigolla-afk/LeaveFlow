package com.leaveflow.mapper;

import com.leaveflow.dto.response.EmployeeResponse;
import com.leaveflow.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "fullName", expression = "java(employee.getFullName())")
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "managerName", expression = "java(employee.getManager() != null ? employee.getManager().getFullName() : null)")
    EmployeeResponse toResponse(Employee employee);
}
