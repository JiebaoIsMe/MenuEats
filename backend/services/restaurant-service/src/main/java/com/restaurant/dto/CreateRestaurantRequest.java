package com.restaurant.dto;

public class CreateRestaurantRequest {
    private String name;
    private String location;
    private long ownerId;

    // Default constructor
    public CreateRestaurantRequest() {}

    // Constructor with parameters
    public CreateRestaurantRequest(String name, String location, long ownerId) {
        this.name = name;
        this.location = location;
        this.ownerId = ownerId;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public long getOwnerId() {
        return ownerId;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setOwnerId(long ownerId) {
        this.ownerId = ownerId;
    }
}