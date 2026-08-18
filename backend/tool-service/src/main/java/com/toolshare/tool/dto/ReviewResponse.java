package com.toolshare.tool.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID toolId,
        String authorName,
        String authorAvatar,
        int rating,
        String comment,
        Instant createdAt
) {
}

