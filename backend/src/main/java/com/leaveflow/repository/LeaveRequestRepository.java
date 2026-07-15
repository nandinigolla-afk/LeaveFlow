package com.leaveflow.repository;

import com.leaveflow.entity.LeaveRequest;
import com.leaveflow.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE (:employeeId IS NULL OR lr.employee.id = :employeeId)
              AND (:status IS NULL OR lr.status = :status)
              AND (:leaveTypeId IS NULL OR lr.leaveType.id = :leaveTypeId)
              AND (:fromDate IS NULL OR lr.startDate >= :fromDate)
              AND (:toDate IS NULL OR lr.endDate <= :toDate)
              AND (:search IS NULL OR LOWER(lr.employee.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(lr.employee.lastName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<LeaveRequest> search(@Param("employeeId") Long employeeId,
                               @Param("status") LeaveStatus status,
                               @Param("leaveTypeId") Long leaveTypeId,
                               @Param("fromDate") LocalDate fromDate,
                               @Param("toDate") LocalDate toDate,
                               @Param("search") String search,
                               Pageable pageable);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.employee.manager.id = :managerId AND lr.status = :status
            """)
    Page<LeaveRequest> findByManagerAndStatus(@Param("managerId") Long managerId,
                                               @Param("status") LeaveStatus status,
                                               Pageable pageable);

    @Query("""
            SELECT COUNT(lr) > 0 FROM LeaveRequest lr
            WHERE lr.employee.id = :employeeId
              AND lr.status IN ('PENDING', 'APPROVED')
              AND lr.startDate <= :endDate AND lr.endDate >= :startDate
              AND (:excludeId IS NULL OR lr.id <> :excludeId)
            """)
    boolean existsOverlapping(@Param("employeeId") Long employeeId,
                               @Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate,
                               @Param("excludeId") Long excludeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);
}
