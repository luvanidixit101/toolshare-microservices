package com.toolshare.ai.service;

import com.toolshare.ai.entity.AiMessage;
import com.toolshare.ai.entity.Conversation;
import com.toolshare.ai.repository.AiMessageRepository;
import com.toolshare.ai.repository.ConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AiConversationService {

    private final ConversationRepository conversationRepository;
    private final AiMessageRepository aiMessageRepository;
    private final GeminiService geminiService;

    public AiConversationService(
            ConversationRepository conversationRepository,
            AiMessageRepository aiMessageRepository,
            GeminiService geminiService
    ) {
        this.conversationRepository = conversationRepository;
        this.aiMessageRepository = aiMessageRepository;
        this.geminiService = geminiService;
    }

    @Transactional
    public ChatResult chat(String message, String conversationId, UUID ownerId) {

        Conversation conversation = getOrCreateConversation(conversationId, ownerId);

        saveMessage(
                conversation,
                AiMessage.Role.USER,
                message
        );

        List<AiMessage> history =
                aiMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        String aiResponse =
                geminiService.generateResponse(history);

        saveMessage(
                conversation,
                AiMessage.Role.MODEL,
                aiResponse
        );

        return new ChatResult(
                aiResponse,
                conversation.getId().toString()
        );
    }

    @SuppressWarnings("null")
    private Conversation getOrCreateConversation(String conversationId, UUID ownerId) {

        if (conversationId == null || conversationId.isBlank()) {
            Conversation conversation = new Conversation();
            conversation.setOwnerId(ownerId);
            return conversationRepository.save(conversation);
        }

        UUID id;

        try {
            id = UUID.fromString(conversationId);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid conversationId"
            );
        }

        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found"
                        )
                );
        if (!ownerId.equals(conversation.getOwnerId())) {
            throw new IllegalArgumentException("Conversation not found");
        }
        return conversation;
    }

    private void saveMessage(
            Conversation conversation,
            AiMessage.Role role,
            String content
    ) {
        AiMessage message = new AiMessage();

        message.setConversation(conversation);
        message.setRole(role);
        message.setContent(content);

        aiMessageRepository.save(message);
    }

    public record ChatResult(
            String message,
            String conversationId
    ) {
    }
}
