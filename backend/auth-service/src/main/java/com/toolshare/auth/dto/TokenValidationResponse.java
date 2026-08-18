package com.toolshare.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record TokenValidationResponse(
        boolean valid,
        UUID userId,
        String email,
        String role,
        Instant expiresAt
) {
}

