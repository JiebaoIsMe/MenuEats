package com.user.dto;

/**
 * DTO for sending new messages via REST API
 * 
 * Used when clients want to send a message to another user.
 * Follows the Restaurant Service DTO pattern for consistency.
 * 
 * Example usage in js-tests:
 * POST /api/users/{senderId}/messages
 * Body: {
 *   "receiverId": 5,
 *   "content": "Hello! Is my order ready?",
 *   "messageType": "TEXT",
 *   "orderId": 123
 * }
 */
public class SendMessageRequest {
    
    // ID of user receiving the message
    private Long receiverId;
    
    // Message content (text)
    private String content;
    
    // Message type: "TEXT", "IMAGE", "LOCATION", "ORDER_UPDATE"
    private String messageType;
    
    // Optional: Related order ID for order-specific messages
    private Long orderId;
    
    // Default constructor
    public SendMessageRequest() {
        this.messageType = "TEXT"; // Default message type
    }
    
    // Constructor with required fields
    public SendMessageRequest(Long receiverId, String content) {
        this();
        this.receiverId = receiverId;
        this.content = content;
    }
    
    // Constructor with all fields
    public SendMessageRequest(Long receiverId, String content, String messageType, Long orderId) {
        this.receiverId = receiverId;
        this.content = content;
        this.messageType = messageType;
        this.orderId = orderId;
    }
    
    // Getters and Setters
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
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    // Validation helpers
    
    /**
     * Check if request has required fields for sending a message
     */
    public boolean isValid() {
        return receiverId != null && content != null && !content.trim().isEmpty();
    }
    
    /**
     * Check if this is an order-related message
     */
    public boolean isOrderMessage() {
        return orderId != null;
    }
}