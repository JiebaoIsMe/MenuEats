package com.user.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderDTO {
    private Long id;
    private Long customerId;
    private Long restaurantId;
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private String status;
    private String createdAt;
    private String deliveryAddress;

    public OrderDTO() {}

    public OrderDTO(Long id, Long customerId, Long restaurantId, List<OrderItemDTO> items, 
                   BigDecimal totalAmount, String status, String createdAt, String deliveryAddress) {
        this.id = id;
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.deliveryAddress = deliveryAddress;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}