package com.logistic.dto;

public class AssignRiderRequest {
    private Long orderId;
    private Long riderId;
    
    // Default constructor
    public AssignRiderRequest() {}
    
    // Constructor
    public AssignRiderRequest(Long orderId, Long riderId) {
        this.orderId = orderId;
        this.riderId = riderId;
    }
    
    // Getters and setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getRiderId() { return riderId; }
    public void setRiderId(Long riderId) { this.riderId = riderId; }
}