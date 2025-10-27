package com.logistic.model;

public enum LogisticsStatus {
    PENDING_ASSIGNMENT,           // Waiting for rider assignment
    ASSIGNED_TO_RIDER,           // Rider has been assigned
    RIDER_EN_ROUTE_TO_RESTAURANT, // Rider heading to pickup location
    ARRIVED_AT_RESTAURANT,       // Rider arrived at restaurant
    PICKED_UP_FROM_RESTAURANT,   // Order picked up from restaurant
    RIDER_EN_ROUTE_TO_CUSTOMER,  // Rider heading to customer
    NEAR_CUSTOMER,               // Rider is close to customer location
    DELIVERED                    // Order delivered to customer
}