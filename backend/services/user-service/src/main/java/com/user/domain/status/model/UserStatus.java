package com.user.domain.status.model;

import com.user.shared.valueobjects.UserId;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_status")
public class UserStatus {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String status;

    @Column(name = "last_active", nullable = false)
    private LocalDateTime lastActive;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private String platform;

    @Column(name = "chatting_with")
    private Long chattingWith;

    protected UserStatus() {
        // JPA constructor
    }

    // Factory method
    public static UserStatus create(UserId userId, String status, String platform) {
        UserStatus userStatus = new UserStatus();
        userStatus.userId = userId.getValue();
        userStatus.status = status;
        userStatus.platform = platform;
        userStatus.lastActive = LocalDateTime.now();
        userStatus.updatedAt = LocalDateTime.now();
        return userStatus;
    }

    // Rich domain behavior
    public void updateStatus(String newStatus) {
        this.status = newStatus;
        this.lastActive = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Clear typing status when going offline
        if ("OFFLINE".equals(newStatus)) {
            this.chattingWith = null;
        }
    }

    public void setTyping(UserId targetUserId) {
        this.status = "TYPING";
        this.chattingWith = targetUserId.getValue();
        this.lastActive = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void stopTyping() {
        this.status = "ONLINE";
        this.chattingWith = null;
        this.lastActive = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Domain queries
    public boolean isTyping() {
        return "TYPING".equals(status);
    }

    public boolean isOnline() {
        return "ONLINE".equals(status) || "TYPING".equals(status);
    }

    public boolean isAvailable() {
        return isOnline() && !isTyping();
    }

    public String getDisplayStatus() {
        if (isTyping()) {
            return "Typing...";
        } else if (isOnline()) {
            return "Online";
        } else {
            return "Offline";
        }
    }

    public UserId getUserId() {
        return new UserId(this.userId);
    }

    // Getters and setters
    public Long getId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastActive() { return lastActive; }
    public void setLastActive(LocalDateTime lastActive) { this.lastActive = lastActive; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public Long getChattingWith() { return chattingWith; }
    public void setChattingWith(Long chattingWith) { this.chattingWith = chattingWith; }

    // For JSON serialization compatibility
    public boolean isActive() { return isOnline(); }
}