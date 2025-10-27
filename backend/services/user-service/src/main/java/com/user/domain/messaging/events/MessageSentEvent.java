package com.user.domain.messaging.events;

import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.ConversationId;
import com.user.shared.valueobjects.MessageId;
import com.user.shared.valueobjects.UserId;

public class MessageSentEvent extends DomainEvent {
    private final MessageId messageId;
    private final ConversationId conversationId;
    private final UserId senderId;
    private final UserId receiverId;
    private final String content;
    private final String messageType;
    private final Long orderId;

    public MessageSentEvent(MessageId messageId, ConversationId conversationId, 
                           UserId senderId, UserId receiverId, String content, 
                           String messageType, Long orderId) {
        super("MessageSentEvent");
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.messageType = messageType;
        this.orderId = orderId;
    }

    // Getters
    public MessageId getMessageId() { return messageId; }
    public ConversationId getConversationId() { return conversationId; }
    public UserId getSenderId() { return senderId; }
    public UserId getReceiverId() { return receiverId; }
    public String getContent() { return content; }
    public String getMessageType() { return messageType; }
    public Long getOrderId() { return orderId; }

    @Override
    public String toString() {
        return "MessageSentEvent{" +
                "messageId=" + messageId +
                ", conversationId=" + conversationId +
                ", senderId=" + senderId +
                ", receiverId=" + receiverId +
                ", content='" + content + '\'' +
                ", messageType='" + messageType + '\'' +
                ", orderId=" + orderId +
                "} " + super.toString();
    }
}