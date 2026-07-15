package com.leaveflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String phone;

    private String avatarUrl;
}
