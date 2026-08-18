package com.toolshare.chat.service;

import com.toolshare.chat.dto.ConversationResponse;
import com.toolshare.chat.dto.CreateConversationRequest;
import com.toolshare.chat.dto.MessageResponse;
import com.toolshare.chat.dto.SendMessageCompatibilityRequest;
import com.toolshare.chat.dto.SendMessageRequest;
import com.toolshare.chat.event.NotificationEvent;
import com.toolshare.chat.event.NotificationPublisher;
import com.toolshare.chat.exception.ApiException;
import com.toolshare.chat.model.ChatMessage;
import com.toolshare.chat.model.Conversation;
import com.toolshare.chat.repository.ConversationRepository;
import com.toolshare.chat.repository.MessageRepository;
import com.toolshare.chat.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationPublisher notificationPublisher;

    public ChatService(ConversationRepository conversationRepository, MessageRepository messageRepository, NotificationPublisher notificationPublisher) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationPublisher = notificationPublisher;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> conversations(CurrentUser currentUser) {
        return conversationRepository.findByParticipantAIdOrParticipantBIdOrderByUpdatedAtDesc(currentUser.id(), currentUser.id())
                .stream()
                .map(conversation -> toConversationResponse(conversation, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse conversation(UUID id, CurrentUser currentUser) {
        Conversation conversation = findConversation(id);
        requireParticipant(conversation, currentUser);
        return toConversationResponse(conversation, currentUser);
    }

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request, CurrentUser currentUser) {
        if (request.participantId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot create a conversation with yourself");
        }

        Conversation conversation = conversationRepository.findBetween(currentUser.id(), request.participantId())
                .orElseGet(() -> {
                    Conversation created = new Conversation();
                    created.setParticipantAId(currentUser.id());
                    created.setParticipantAName(currentUser.displayName().isBlank() ? currentUser.email() : currentUser.displayName());
                    created.setParticipantBId(request.participantId());
                    created.setParticipantBName(defaultParticipantName(request.participantName(), request.participantId()));
                    Conversation saved = conversationRepository.save(created);
                    log.info("Created conversation {}", saved.getId());
                    return saved;
                });

        if (request.initialMessage() != null && !request.initialMessage().isBlank()) {
            sendMessage(conversation.getId(), new SendMessageRequest(request.initialMessage()), currentUser);
        }
        return toConversationResponse(conversation, currentUser);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> messages(UUID conversationId, CurrentUser currentUser) {
        Conversation conversation = findConversation(conversationId);
        requireParticipant(conversation, currentUser);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(message -> toMessageResponse(message, currentUser))
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, SendMessageRequest request, CurrentUser currentUser) {
        Conversation conversation = findConversation(conversationId);
        requireParticipant(conversation, currentUser);

        ChatMessage message = new ChatMessage();
        message.setConversationId(conversation.getId());
        message.setSenderId(currentUser.id());
        message.setReceiverId(otherParticipant(conversation, currentUser.id()));
        message.setMessage(request.message().trim());
        ChatMessage saved = messageRepository.save(message);

        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        notificationPublisher.publish(NotificationEvent.message(currentUser.id(), saved.getReceiverId(), conversation.getId(), saved.getId()));
        log.info("Created message {} in conversation {}", saved.getId(), conversation.getId());
        return toMessageResponse(saved, currentUser);
    }

    @Transactional
    public MessageResponse sendMessageCompat(SendMessageCompatibilityRequest request, CurrentUser currentUser) {
        return sendMessage(request.conversationId(), new SendMessageRequest(request.text()), currentUser);
    }

    @Transactional
    public MessageResponse markRead(UUID messageId, CurrentUser currentUser) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
        Conversation conversation = findConversation(message.getConversationId());
        requireParticipant(conversation, currentUser);
        if (!message.getReceiverId().equals(currentUser.id()) && !currentUser.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the receiver can mark this message as read");
        }
        message.setRead(true);
        return toMessageResponse(messageRepository.save(message), currentUser);
    }

    private Conversation findConversation(UUID id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
    }

    private void requireParticipant(Conversation conversation, CurrentUser currentUser) {
        if (!currentUser.isAdmin() && !conversation.getParticipantAId().equals(currentUser.id()) && !conversation.getParticipantBId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this conversation");
        }
    }

    private UUID otherParticipant(Conversation conversation, UUID userId) {
        return conversation.getParticipantAId().equals(userId) ? conversation.getParticipantBId() : conversation.getParticipantAId();
    }

    private String otherParticipantName(Conversation conversation, UUID userId) {
        return conversation.getParticipantAId().equals(userId) ? conversation.getParticipantBName() : conversation.getParticipantAName();
    }

    private ConversationResponse toConversationResponse(Conversation conversation, CurrentUser currentUser) {
        ChatMessage lastMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId()).orElse(null);
        return new ConversationResponse(
                conversation.getId(),
                otherParticipant(conversation, currentUser.id()),
                otherParticipantName(conversation, currentUser.id()),
                null,
                false,
                lastMessage == null ? "" : lastMessage.getMessage(),
                lastMessage == null ? conversation.getUpdatedAt() : lastMessage.getCreatedAt(),
                messageRepository.countByConversationIdAndReceiverIdAndReadFalse(conversation.getId(), currentUser.id()),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    private MessageResponse toMessageResponse(ChatMessage message, CurrentUser currentUser) {
        boolean mine = message.getSenderId().equals(currentUser.id());
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getReceiverId(),
                message.getMessage(),
                message.getMessage(),
                message.getCreatedAt(),
                message.getCreatedAt(),
                message.isRead(),
                mine
        );
    }

    private String defaultParticipantName(String name, UUID participantId) {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        String suffix = participantId.toString().substring(0, 8);
        return "User " + suffix;
    }
}

