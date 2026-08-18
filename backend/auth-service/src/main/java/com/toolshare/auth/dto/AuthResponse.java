package com.toolshare.auth.dto;

import com.toolshare.auth.model.Role;

import java.util.UUID;

public record AuthResponse(
        String token,
        String type,
        String refreshToken,
        UUID userId,
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
) {
}

