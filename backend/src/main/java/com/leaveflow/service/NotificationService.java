package com.leaveflow.service;

import com.leaveflow.dto.response.NotificationResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void notify(Long userId, NotificationType type, String title, String message, String link);
    PageResponse<NotificationResponse> getForUser(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
}
