package com.toolshare.chat.service;

import com.toolshare.chat.dto.SendMessageRequest;
import com.toolshare.chat.event.NotificationPublisher;
import com.toolshare.chat.exception.ApiException;
import com.toolshare.chat.model.Conversation;
import com.toolshare.chat.repository.ConversationRepository;
import com.toolshare.chat.repository.MessageRepository;
import com.toolshare.chat.security.CurrentUser;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChatServiceTest {

    private final ConversationRepository conversationRepository = mock(ConversationRepository.class);
    private final MessageRepository messageRepository = mock(MessageRepository.class);
    private final NotificationPublisher notificationPublisher = mock(NotificationPublisher.class);
    private final ChatService service = new ChatService(conversationRepository, messageRepository, notificationPublisher);

    @Test
    void sendMessageRejectsNonParticipant() {
        UUID conversationId = UUID.randomUUID();
        Conversation conversation = new Conversation();
        conversation.setId(conversationId);
        conversation.setParticipantAId(UUID.randomUUID());
        conversation.setParticipantAName("A");
        conversation.setParticipantBId(UUID.randomUUID());
        conversation.setParticipantBName("B");

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

        assertThatThrownBy(() -> service.sendMessage(conversationId, new SendMessageRequest("hello"),
                new CurrentUser(UUID.randomUUID(), "outsider@example.com", "Out", "Sider", "USER")))
                .isInstanceOf(ApiException.class)
                .hasMessage("You do not have access to this conversation");
    }
}

