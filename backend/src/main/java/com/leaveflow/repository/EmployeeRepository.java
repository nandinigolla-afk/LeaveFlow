package com.leaveflow.repository;

import com.leaveflow.entity.Employee;
import com.leaveflow.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    List<Employee> findByManagerId(Long managerId);

    @Query("""
            SELECT e FROM Employee e
            WHERE (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:departmentId IS NULL OR e.department.id = :departmentId)
              AND (:status IS NULL OR e.status = :status)
            """)
    Page<Employee> search(@Param("search") String search,
                           @Param("departmentId") Long departmentId,
                           @Param("status") EmployeeStatus status,
                           Pageable pageable);
}
