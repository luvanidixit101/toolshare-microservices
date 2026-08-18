package com.toolshare.chat.repository;

import com.toolshare.chat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    long countByConversationIdAndReceiverIdAndReadFalse(UUID conversationId, UUID receiverId);

    Optional<ChatMessage> findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);
}

