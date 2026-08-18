package com.toolshare.chat.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateConversationRequest(
        @NotNull UUID participantId,
        @Size(max = 180) String participantName,
        @Size(max = 4000) String initialMessage
) {
}

