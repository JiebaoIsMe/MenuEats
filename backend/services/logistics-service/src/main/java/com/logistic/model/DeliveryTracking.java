package com.logistic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tracking")
public class DeliveryTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Foreign key to ordering-service customer_order table
    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;
    
    // Foreign key to logistics-service riders table
    @Column(name = "rider_id")
    private Long riderId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogisticsStatus logisticsStatus = LogisticsStatus.PENDING_ASSIGNMENT;
    
    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;
    
    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;
    
    @Column(name = "departure_time")
    private LocalDateTime departureTime;
    
    @Column(name = "delivery_time")
    private LocalDateTime deliveryTime;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public DeliveryTracking() {}
    
    // Constructor with required fields
    public DeliveryTracking(Long orderId) {
        this.orderId = orderId;
        this.estimatedDeliveryTime = LocalDateTime.now().plusMinutes(30); // Default 30 min ETA
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