package com.toolshare.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        UUID receiverId,
        String message,
        String text,
        Instant createdAt,
        Instant sentAt,
        boolean read,
        boolean mine
) {
}

