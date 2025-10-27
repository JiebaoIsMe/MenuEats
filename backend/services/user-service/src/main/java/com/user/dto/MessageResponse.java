package com.user.dto;

import com.user.domain.messaging.model.Message;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * DTO for message responses in REST API
 * 
 * Used to return message data to clients, excluding sensitive information.
 * Follows the Restaurant Service response DTO pattern for consistency.
 * 
 * Example JSON response:
 * {
 *   "id": 123,
 *   "senderId": 4,
 *   "receiverId": 5,
 *   "content": "Hello! Is my order ready?",
 *   "messageType": "TEXT",
 *   "status": "DELIVERED",
 *   "createdAt": "2025-01-15T10:30:00",
 *   "orderId": 123
 * }
 */
public class MessageResponse {
    
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageType;
    private String status;
    private String createdAt; // Changed to String to avoid Jackson serialization issues
    private String updatedAt; // Changed to String to avoid Jackson serialization issues
    private String deliveredAt; // Changed to String to avoid Jackson serialization issues  
    private String readAt; // Changed to String to avoid Jackson serialization issues
    private Long orderId;
    
    // Default constructor
    public MessageResponse() {}
    
    // Constructor from Message entity
    public MessageResponse(Message message) {
        this.id = message.getId();
        this.senderId = message.getSenderId().getValue();
        this.receiverId = message.getReceiverId().getValue();
        this.content = message.getContent();
        this.messageType = message.getMessageType();
        this.status = message.getStatus();
        this.createdAt = message.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.updatedAt = message.getUpdatedAt() != null ? message.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
        this.deliveredAt = message.getDeliveredAt() != null ? message.getDeliveredAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
        this.readAt = message.getReadAt() != null ? message.getReadAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
        this.orderId = message.getOrderId();
    }
    
    // Constructor with all fields (typically used for conversion from Message entity)
    public MessageResponse(Long id, Long senderId, Long receiverId, String content, 
                          String messageType, String status, String createdAt, String updatedAt,
                          String deliveredAt, String readAt, Long orderId) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.messageType = messageType;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deliveredAt = deliveredAt;
        this.readAt = readAt;
        this.orderId = orderId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
    
    public Long getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getMessageType() {
        return messageType;
    }
    
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getDeliveredAt() {
        return deliveredAt;
    }
    
    public void setDeliveredAt(String deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
    
    public String getReadAt() {
        return readAt;
    }
    
    public void setReadAt(String readAt) {
        this.readAt = readAt;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    // Helper methods
    
    /**
     * Check if message is order-related
     */
    public boolean isOrderMessage() {
        return orderId != null;
    }
    
    /**
     * Check if message has been read by recipient
     */
    public boolean isRead() {
        return "READ".equals(status);
    }
    
    /**
     * Check if message has been delivered to recipient
     */
    public boolean isDelivered() {
        return "DELIVERED".equals(status) || isRead();
    }
}