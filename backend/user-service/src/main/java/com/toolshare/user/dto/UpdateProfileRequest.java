package com.toolshare.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Pattern(regexp = "^[0-9+\\-()\\s]{7,40}$", message = "Phone number is invalid") String phone,
        @Size(max = 160) String location,
        @Size(max = 1000) String bio,
        @Size(max = 500) String avatarUrl
) {
}

