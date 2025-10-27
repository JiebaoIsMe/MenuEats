package com.logistic.dto;

import com.logistic.model.LogisticsStatus;
import java.time.LocalDateTime;

public class DeliveryTrackingResponse {
    private Long id;
    private Long orderId;
    private Long riderId;
    private LogisticsStatus logisticsStatus;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime pickupTime;
    private LocalDateTime departureTime;
    private LocalDateTime deliveryTime;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public DeliveryTrackingResponse() {}
    
    // Constructor with all fields
    public DeliveryTrackingResponse(Long id, Long orderId, Long riderId, LogisticsStatus logisticsStatus,
                                  LocalDateTime estimatedDeliveryTime, LocalDateTime pickupTime,
                                  LocalDateTime departureTime, LocalDateTime deliveryTime,
                                  LocalDateTime updatedAt) {
        this.id = id;
        this.orderId = orderId;
        this.riderId = riderId;
        this.logisticsStatus = logisticsStatus;
        this.estimatedDeliveryTime = estimatedDeliveryTime;
        this.pickupTime = pickupTime;
        this.departureTime = departureTime;
        this.deliveryTime = deliveryTime;
        this.updatedAt = updatedAt;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getRiderId() { return riderId; }
    public void setRiderId(Long riderId) { this.riderId = riderId; }
    
    public LogisticsStatus getLogisticsStatus() { return logisticsStatus; }
    public void setLogisticsStatus(LogisticsStatus logisticsStatus) { this.logisticsStatus = logisticsStatus; }
    
    public LocalDateTime getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(LocalDateTime estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }
    
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    
    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
    
    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalDateTime deliveryTime) { this.deliveryTime = deliveryTime; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}