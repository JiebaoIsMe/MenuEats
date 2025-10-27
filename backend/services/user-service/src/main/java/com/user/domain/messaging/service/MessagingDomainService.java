package com.user.domain.messaging.service;

import com.user.domain.messaging.events.ConversationStartedEvent;
import com.user.domain.messaging.events.MessageSentEvent;
import com.user.domain.messaging.model.Message;
import com.user.domain.messaging.model.MessageRepository;
import com.user.shared.events.DomainEventPublisher;
import com.user.shared.valueobjects.ConversationId;
import com.user.shared.valueobjects.MessageId;
import com.user.shared.valueobjects.UserId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class MessagingDomainService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private DomainEventPublisher eventPublisher;

    public Message sendMessage(UserId senderId, UserId receiverId, String content, 
                              String messageType, Long orderId) {
        
        // Check if this is the first message between these users
        List<Message> existingConversation = messageRepository.findConversationBetween(senderId, receiverId);
        boolean isNewConversation = existingConversation.isEmpty();

        // Create and save the message
        Message message = Message.create(senderId, receiverId, content, messageType, orderId);
        Message savedMessage = messageRepository.save(message);

        // Generate conversation ID
        ConversationId conversationId = ConversationId.fromParticipants(senderId, receiverId);

        // Publish events
        if (isNewConversation) {
            eventPublisher.publish(new ConversationStartedEvent(
                conversationId, 
                Set.of(senderId, receiverId), 
                senderId
            ));
        }

        eventPublisher.publish(new MessageSentEvent(
            savedMessage.getMessageId(),
            conversationId,
            senderId,
            receiverId,
            content,
            messageType,
            orderId
        ));

        return savedMessage;
    }

    public void markMessageAsRead(MessageId messageId, UserId userId) {
        Message message = messageRepository.findByMessageId(messageId)
            .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

        if (!message.getReceiverId().equals(userId)) {
            throw new IllegalArgumentException("User can only mark their own received messages as read");
        }

        message.markAsRead();
        messageRepository.save(message);

        // Could publish MessageReadEvent here
    }

    public void markMessageAsDelivered(MessageId messageId) {
        Message message = messageRepository.findByMessageId(messageId)
            .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

        message.markAsDelivered();
        messageRepository.save(message);

        // Could publish MessageDeliveredEvent here
    }

    public List<Message> getConversation(UserId userId1, UserId userId2) {
        return messageRepository.findConversationBetween(userId1, userId2);
    }

    public List<Message> getUnreadMessages(UserId userId) {
        return messageRepository.findUnreadForUser(userId);
    }

    public long getUnreadMessageCount(UserId userId) {
        return messageRepository.countUnreadForUser(userId);
    }

    public List<Message> getRecentConversations(UserId userId) {
        return messageRepository.findRecentConversationsForUser(userId);
    }

    public List<Message> getOrderMessages(Long orderId) {
        return messageRepository.findByOrderId(orderId);
    }

    public boolean canUserSendMessage(UserId senderId, UserId receiverId) {
        // Business rules for message sending
        // Could check user status, blocking rules, etc.
        return !senderId.equals(receiverId);
    }
}