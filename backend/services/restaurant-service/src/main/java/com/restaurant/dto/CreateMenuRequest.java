package com.restaurant.dto;

import java.math.BigDecimal;

public class CreateMenuRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private long restaurantId;
    private boolean available;

    // Default constructor
    public CreateMenuRequest() {}

    public CreateMenuRequest(String name, String description, BigDecimal price, String category, long restaurantId, boolean available) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.restaurantId = restaurantId;
        this.available = available;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurant_id(long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }


}