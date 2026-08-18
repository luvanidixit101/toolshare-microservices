package com.toolshare.chat.controller;

import com.toolshare.chat.dto.ApiResponse;
import com.toolshare.chat.dto.ConversationResponse;
import com.toolshare.chat.dto.CreateConversationRequest;
import com.toolshare.chat.dto.MessageResponse;
import com.toolshare.chat.dto.SendMessageCompatibilityRequest;
import com.toolshare.chat.dto.SendMessageRequest;
import com.toolshare.chat.security.CurrentUser;
import com.toolshare.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Chat")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    @Operation(summary = "List conversations")
    @GetMapping("/conversations")
    public ApiResponse<List<ConversationResponse>> conversations(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Conversations loaded", service.conversations(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get conversation")
    @GetMapping("/conversations/{id}")
    public ApiResponse<ConversationResponse> conversation(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Conversation loaded", service.conversation(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Create conversation")
    @PostMapping("/conversations")
    public ApiResponse<ConversationResponse> createConversation(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateConversationRequest request) {
        return ApiResponse.ok("Conversation created", service.createConversation(request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "List messages in a conversation")
    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<MessageResponse>> messages(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Messages loaded", service.messages(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Send message in a conversation")
    @PostMapping("/conversations/{id}/messages")
    public ApiResponse<MessageResponse> sendMessage(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.ok("Message sent", service.sendMessage(id, request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Send message compatibility route")
    @PostMapping("/messages")
    public ApiResponse<MessageResponse> sendMessageCompat(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SendMessageCompatibilityRequest request) {
        return ApiResponse.ok("Message sent", service.sendMessageCompat(request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Mark a message as read")
    @PatchMapping("/messages/{id}/read")
    public ApiResponse<MessageResponse> markRead(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Message marked read", service.markRead(id, CurrentUser.from(jwt)));
    }
}

