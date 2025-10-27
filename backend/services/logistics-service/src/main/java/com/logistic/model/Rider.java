package com.logistic.model;

import jakarta.persistence.*;

@Entity
@Table(name = "riders")
public class Rider {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Foreign key to user-service users table
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    @Column(nullable = false)
    private boolean isAvailable = true;
    
    // Default constructor
    public Rider() {}
    
    // Constructor with required fields
    public Rider(Long userId) {
        this.userId = userId;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}