package com.ordering.dto;

import com.ordering.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    Long customerId,
    Long restaurantId,
    List<OrderItemResponse> items,
    BigDecimal totalAmount,
    OrderStatus status,
    LocalDateTime createdAt,
    String deliveryAddress
) {}
