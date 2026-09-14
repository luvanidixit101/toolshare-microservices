package com.toolshare.ai.controller;

import com.toolshare.ai.dto.AiChatRequest;
import com.toolshare.ai.dto.AiChatResponse;
import com.toolshare.ai.service.AiConversationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiConversationService aiConversationService;

    public AiController(
            AiConversationService aiConversationService
    ) {
        this.aiConversationService = aiConversationService;
    }

    @PostMapping("/chat")
    public AiChatResponse chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        AiConversationService.ChatResult result =
                aiConversationService.chat(
                        request.message(),
                        request.conversationId(),
                        UUID.fromString(jwt.getSubject())
                );

        return new AiChatResponse(
                result.message(),
                result.conversationId()
        );
    }
}
