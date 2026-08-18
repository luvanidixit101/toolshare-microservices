package com.toolshare.user.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String location,
        String bio,
        String avatarUrl,
        BigDecimal rating,
        int reviewCount,
        LocalDate memberSince,
        Map<String, String> preferences
) {
}

