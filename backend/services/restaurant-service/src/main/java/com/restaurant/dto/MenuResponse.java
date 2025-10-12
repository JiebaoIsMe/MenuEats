package com.restaurant.dto;

import java.math.BigDecimal;

public class MenuResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private long restaurant_id;
    private boolean available;

    // Default constructor
    public MenuResponse() {}

    // Constructor with params
    public MenuResponse(String id, String name, String description, BigDecimal price, String category, long restaurant_id, boolean available) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.restaurant_id = restaurant_id;
        this.available = available;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
        return restaurant_id;
    }

    public void setRestaurantId(long restaurant_id) {
        this.restaurant_id = restaurant_id;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }



}