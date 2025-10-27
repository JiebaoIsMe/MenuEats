package com.ordering.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.math.BigDecimal;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String menuItemId;
    private String menuItemName;
    private int quantity;
    private BigDecimal price;
    
    @Column(name = "order_id")
    private Long orderId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMenuItemId() { return menuItemId; }
    public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }
    public String getMenuItemName() { return menuItemName; }
    public void setMenuItemName(String menuItemName) { this.menuItemName = menuItemName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}
