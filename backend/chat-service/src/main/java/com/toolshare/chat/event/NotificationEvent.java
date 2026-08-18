package com.toolshare.chat.event;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationEvent(
        String type,
        UUID actorId,
        UUID recipientId,
        String message,
        Map<String, String> metadata,
        Instant createdAt
) {
    public static NotificationEvent message(UUID actorId, UUID recipientId, UUID conversationId, UUID messageId) {
        return new NotificationEvent("NEW_MESSAGE", actorId, recipientId, "New chat message",
                Map.of("conversationId", conversationId.toString(), "messageId", messageId.toString()), Instant.now());
    }
}

