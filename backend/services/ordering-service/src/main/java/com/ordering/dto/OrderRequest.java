package com.ordering.dto;

import com.ordering.model.OrderItem;
import java.util.List;

public record OrderRequest(
    Long customerId,
    Long restaurantId,
    String deliveryAddress,
    List<OrderItem> items
) {}
