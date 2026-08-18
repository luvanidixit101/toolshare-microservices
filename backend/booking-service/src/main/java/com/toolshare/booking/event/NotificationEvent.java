package com.toolshare.booking.event;

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
    public static NotificationEvent booking(String type, UUID actorId, UUID recipientId, UUID bookingId) {
        return new NotificationEvent(type, actorId, recipientId, "Booking event: " + type,
                Map.of("bookingId", bookingId.toString()), Instant.now());
    }
}

