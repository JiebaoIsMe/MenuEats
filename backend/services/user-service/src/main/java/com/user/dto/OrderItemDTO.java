package com.user.dto;

import java.math.BigDecimal;

public class OrderItemDTO {
    private String menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemDTO() {}

    public OrderItemDTO(String menuItemId, String menuItemName, Integer quantity, BigDecimal price) {
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and setters
    public String getMenuItemId() { return menuItemId; }
    public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }

    public String getMenuItemName() { return menuItemName; }
    public void setMenuItemName(String menuItemName) { this.menuItemName = menuItemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}