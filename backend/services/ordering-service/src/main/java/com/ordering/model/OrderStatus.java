package com.ordering.model;

public enum OrderStatus {
    NEW,
    CONFIRMED,
    REJECTED,
    PREPARING,
    READY_FOR_PICKUP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}