package com.user.dto;

import com.user.domain.status.model.UserStatus;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * DTO for user status responses in REST API
 * 
 * Used to return user online status information to clients.
 * Essential for showing online/offline indicators in chat interfaces.
 * 
 * Example JSON response:
 * {
 *   "userId": 4,
 *   "status": "ONLINE",
 *   "lastActive": "2025-01-15T10:30:00",
 *   "platform": "WEB",
 *   "isTyping": true,
 *   "chattingWith": 5
 * }
 */
public class UserStatusResponse {
    
    private Long userId;
    private String status;
    private String lastActive; // Changed to String to avoid Jackson serialization issues
    private String platform;
    private boolean isTyping;
    private Long chattingWith;
    
    // Default constructor
    public UserStatusResponse() {}
    
    // Constructor from UserStatus entity
    public UserStatusResponse(UserStatus userStatus) {
        this.userId = userStatus.getUserId().getValue();
        this.status = userStatus.getStatus();
        this.lastActive = userStatus.getLastActive().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.platform = userStatus.getPlatform();
        this.chattingWith = userStatus.getChattingWith();
        this.isTyping = "TYPING".equals(userStatus.getStatus());
    }
    
    // Constructor with all fields
    public UserStatusResponse(Long userId, String status, String lastActive, 
                             String platform, Long chattingWith) {
        this.userId = userId;
        this.status = status;
        this.lastActive = lastActive;
        this.platform = platform;
        this.chattingWith = chattingWith;
        this.isTyping = "TYPING".equals(status);
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.isTyping = "TYPING".equals(status);
    }
    
    public String getLastActive() {
        return lastActive;
    }
    
    public void setLastActive(String lastActive) {
        this.lastActive = lastActive;
    }
    
    public String getPlatform() {
        return platform;
    }
    
    public void setPlatform(String platform) {
        this.platform = platform;
    }
    
    public boolean isTyping() {
        return isTyping;
    }
    
    public void setTyping(boolean typing) {
        this.isTyping = typing;
    }
    
    public Long getChattingWith() {
        return chattingWith;
    }
    
    public void setChattingWith(Long chattingWith) {
        this.chattingWith = chattingWith;
    }
    
    // Helper methods
    
    /**
     * Check if user is currently active (online or typing)
     */
    public boolean isActive() {
        return "ONLINE".equals(status) || "TYPING".equals(status);
    }
    
    /**
     * Check if user is available for new conversations
     */
    public boolean isAvailable() {
        return isActive() && chattingWith == null;
    }
    
    /**
     * Get user-friendly status text for UI display
     */
    public String getDisplayStatus() {
        switch (status) {
            case "ONLINE": return "Online";
            case "AWAY": return "Away";
            case "TYPING": return "Typing...";
            case "OFFLINE": 
            default: return "Offline";
        }
    }
}