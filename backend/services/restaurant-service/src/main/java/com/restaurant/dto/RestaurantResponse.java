package com.restaurant.dto;

public class RestaurantResponse {
    private long id;
    private String name;
    private String location;
    private long ownerId;
    private long menuId;

    // Default constructor
    public RestaurantResponse() {}

    // Constructor with parameters
    public RestaurantResponse(long id, String name, String location, long ownerId) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.ownerId = ownerId;
    }

    // Getters
    public long getId() {
        return id;
    }

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
    public void setId(long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setOwnerId(long ownerId) {
        this.ownerId = ownerId;
    }

    public long getMenuId() {
        return menuId;
    }

    public void setMenuId(long menuId) {
        this.menuId = menuId;
    }
}