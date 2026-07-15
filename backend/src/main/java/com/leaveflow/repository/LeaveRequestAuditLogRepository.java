package com.leaveflow.repository;

import com.leaveflow.entity.LeaveRequestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestAuditLogRepository extends JpaRepository<LeaveRequestAuditLog, Long> {
    List<LeaveRequestAuditLog> findByLeaveRequestIdOrderByCreatedAtDesc(Long leaveRequestId);
}
