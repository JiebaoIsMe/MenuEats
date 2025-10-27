package com.user.domain.messaging.model;

import com.user.shared.valueobjects.MessageId;
import com.user.shared.valueobjects.UserId;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "message_type", nullable = false)
    private String messageType;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "order_id")
    private Long orderId;

    protected Message() {
        // JPA constructor
    }

    // Factory method
    public static Message create(UserId senderId, UserId receiverId, String content, 
                               String messageType, Long orderId) {
        Message message = new Message();
        message.senderId = senderId.getValue();
        message.receiverId = receiverId.getValue();
        message.content = content;
        message.messageType = messageType != null ? messageType : "TEXT";
        message.status = "SENT";
        message.orderId = orderId;
        message.createdAt = LocalDateTime.now();
        message.updatedAt = LocalDateTime.now();
        return message;
    }

    // Rich domain behavior
    public void markAsDelivered() {
        if (!"SENT".equals(this.status)) {
            throw new IllegalStateException("Can only deliver sent messages");
        }
        this.status = "DELIVERED";
        this.deliveredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsRead() {
        if (!"DELIVERED".equals(this.status) && !"SENT".equals(this.status)) {
            throw new IllegalStateException("Can only read delivered or sent messages");
        }
        this.status = "READ";
        this.readAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean canBeEditedBy(UserId userId) {
        return getSenderId().equals(userId) && 
               createdAt.isAfter(LocalDateTime.now().minusMinutes(5)) &&
               "SENT".equals(status);
    }

    public boolean isOrderMessage() {
        return orderId != null;
    }

    public boolean isDelivered() {
        return "DELIVERED".equals(status) || "READ".equals(status);
    }

    public boolean isRead() {
        return "READ".equals(status);
    }

    // Domain queries
    public MessageId getMessageId() {
        return new MessageId(this.id);
    }

    public UserId getSenderId() {
        return new UserId(this.senderId);
    }

    public UserId getReceiverId() {
        return new UserId(this.receiverId);
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}