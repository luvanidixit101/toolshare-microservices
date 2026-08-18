package com.toolshare.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID participantId,
        String participantName,
        String participantAvatar,
        boolean online,
        String lastMessage,
        Instant lastMessageAt,
        long unreadCount,
        Instant createdAt,
        Instant updatedAt
) {
}

