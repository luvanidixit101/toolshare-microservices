package com.toolshare.ai.controller;

import com.toolshare.ai.dto.AiChatRequest;
import com.toolshare.ai.dto.AiChatResponse;
import com.toolshare.ai.service.AiConversationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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
            @Valid @RequestBody AiChatRequest request
    ) {

        AiConversationService.ChatResult result =
                aiConversationService.chat(
                        request.message(),
                        request.conversationId()
                );

        return new AiChatResponse(
                result.message(),
                result.conversationId()
        );
    }
}