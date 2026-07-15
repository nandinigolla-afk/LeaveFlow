package com.leaveflow.serviceimpl;

import com.leaveflow.dto.response.NotificationResponse;
import com.leaveflow.dto.response.PageResponse;
import com.leaveflow.entity.Notification;
import com.leaveflow.entity.User;
import com.leaveflow.enums.NotificationType;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.mapper.NotificationMapper;
import com.leaveflow.repository.NotificationRepository;
import com.leaveflow.repository.UserRepository;
import com.leaveflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public void notify(Long userId, NotificationType type, String title, String message, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public PageResponse<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return new PageResponse<>(page.map(notificationMapper::toResponse));
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        Pageable all = Pageable.unpaged();
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, all)
                .forEach(n -> n.setRead(true));
    }
}
