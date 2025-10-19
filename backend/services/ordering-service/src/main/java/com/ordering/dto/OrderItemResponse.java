package com.ordering.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long menuItemId,
    String menuItemName,
    int quantity,
    BigDecimal price
) {}
