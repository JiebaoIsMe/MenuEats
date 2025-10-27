package com.logistic.dto;

public class RiderResponse {
    private Long id;
    private Long userId;
    private boolean isAvailable;
    private String userName;  // From user-service
    private String userPhone; // From user-service
    
    // Default constructor
    public RiderResponse() {}
    
    // Constructor
    public RiderResponse(Long id, Long userId, boolean isAvailable) {
        this.id = id;
        this.userId = userId;
        this.isAvailable = isAvailable;
    }
    
    // Constructor with user details
    public RiderResponse(Long id, Long userId, boolean isAvailable, String userName, String userPhone) {
        this.id = id;
        this.userId = userId;
        this.isAvailable = isAvailable;
        this.userName = userName;
        this.userPhone = userPhone;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
}