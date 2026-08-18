package com.toolshare.chat.repository;

import com.toolshare.chat.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByParticipantAIdOrParticipantBIdOrderByUpdatedAtDesc(UUID participantAId, UUID participantBId);

    @Query("""
            select c from Conversation c
            where (c.participantAId = :first and c.participantBId = :second)
               or (c.participantAId = :second and c.participantBId = :first)
            """)
    Optional<Conversation> findBetween(@Param("first") UUID first, @Param("second") UUID second);
}

