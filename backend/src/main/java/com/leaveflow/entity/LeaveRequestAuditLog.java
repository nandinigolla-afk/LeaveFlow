package com.leaveflow.entity;

import com.leaveflow.enums.LeaveStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "leave_request_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_request_id", nullable = false)
    private LeaveRequest leaveRequest;

    @Column(nullable = false, length = 30)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private Employee performedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private LeaveStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private LeaveStatus newStatus;

    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
