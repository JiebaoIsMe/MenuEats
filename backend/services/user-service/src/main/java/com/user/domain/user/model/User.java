package com.user.domain.user.model;

import com.user.domain.user.events.UserRegisteredEvent;
import com.user.domain.user.events.UserUpdatedEvent;
import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.UserId;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    // Role constants
    public static final String RIDER = "RIDER";
    public static final String CUSTOMER = "CUSTOMER";
    public static final String BUSINESS_OWNER = "BUSINESS_OWNER";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean active = true;

    @Transient
    private List<DomainEvent> domainEvents = new ArrayList<>();

    protected User() {
        // JPA constructor
    }

    // Factory method for creating new users
    public static User create(String username, String email, String password, String role) {
        User user = new User();
        user.username = username;
        user.email = email;
        user.password = password;
        user.role = role;
        user.active = true;

        return user;
    }

    // Method to add domain event after user is saved and has an ID
    public void registerUserCreatedEvent() {
        if (this.id != null) {
            this.addDomainEvent(new UserRegisteredEvent(
                new UserId(this.id), this.username, this.email, this.role
            ));
        }
    }

    // Rich domain behavior - Profile will be managed separately

    public void updateContactInfo(String username, String email) {
        if (username != null && !username.trim().isEmpty()) {
            this.username = username;
        }
        if (email != null && !email.trim().isEmpty()) {
            this.email = email;
        }
        addDomainEvent(new UserUpdatedEvent(new UserId(this.id), this.username, this.email, this.role));
    }

    public void changeRole(String newRole) {
        if (newRole != null && !newRole.equals(this.role)) {
            this.role = newRole;
            addDomainEvent(new UserUpdatedEvent(new UserId(this.id), this.username, this.email, this.role));
        }
    }

    public void deactivate() {
        this.active = false;
        // Could add UserDeactivatedEvent here
    }

    public void activate() {
        this.active = true;
        // Could add UserActivatedEvent here
    }

    // Domain queries
    public boolean canSendMessages() {
        return active && role != null;
    }

    public boolean canReceiveMessages() {
        return active;
    }

    public UserId getUserId() {
        return new UserId(this.id);
    }

    public String getDisplayName() {
        return username; // Profile is now separate entity
    }

    // Domain events management
    public void addDomainEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return new ArrayList<>(domainEvents);
    }

    public void clearDomainEvents() {
        this.domainEvents.clear();
    }

    // Getters and setters (minimal - favor rich domain methods)
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    // These setters should be used carefully - prefer domain methods
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}