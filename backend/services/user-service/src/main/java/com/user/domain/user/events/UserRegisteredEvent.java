package com.user.domain.user.events;

import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.UserId;

public class UserRegisteredEvent extends DomainEvent {
    private final UserId userId;
    private final String username;
    private final String email;
    private final String role;

    public UserRegisteredEvent(UserId userId, String username, String email, String role) {
        super("UserRegisteredEvent");
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public UserId getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    @Override
    public String toString() {
        return "UserRegisteredEvent{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                "} " + super.toString();
    }
}