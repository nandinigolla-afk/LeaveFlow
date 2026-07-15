package com.leaveflow.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final Integer status;
    private final OffsetDateTime timestamp;

    private ApiResponse(boolean success, String message, T data, Integer status) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.status = status;
        this.timestamp = OffsetDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, 200);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, 200);
    }

    public static <T> ApiResponse<T> error(String message, Integer status) {
        return new ApiResponse<>(false, message, null, status);
    }

    public static <T> ApiResponse<T> error(String message, T data, Integer status) {
        return new ApiResponse<>(false, message, data, status);
    }
}
