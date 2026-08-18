package com.toolshare.ai.repository;

import com.toolshare.ai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConversationRepository
        extends JpaRepository<Conversation, UUID> {
}