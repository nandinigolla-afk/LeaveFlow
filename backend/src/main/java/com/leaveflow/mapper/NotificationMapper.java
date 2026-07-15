package com.leaveflow.mapper;

import com.leaveflow.dto.response.NotificationResponse;
import com.leaveflow.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
