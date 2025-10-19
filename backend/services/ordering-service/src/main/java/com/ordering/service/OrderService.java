package com.ordering.service;

import com.ordering.dto.OrderRequest;
import com.ordering.dto.OrderResponse;
import com.ordering.dto.OrderItemResponse;
import com.ordering.model.Order;
import com.ordering.model.OrderStatus;
import com.ordering.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    private OrderResponse convertToDto(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getMenuItemId(),
                        item.getMenuItemName(),
                        item.getQuantity(),
                        item.getPrice()))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getRestaurantId(),
                itemResponses,
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getDeliveryAddress());
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        if (orderRequest.items() == null || orderRequest.items().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        Order order = new Order();
        order.setCustomerId(orderRequest.customerId());
        order.setRestaurantId(orderRequest.restaurantId());
        order.setDeliveryAddress(orderRequest.deliveryAddress());
        order.setItems(orderRequest.items());

        order.calculateTotalAmount();

        Order savedOrder = orderRepository.save(order);

        return convertToDto(savedOrder);
    }

    public Optional<OrderResponse> getOrderById(Long id) {
        Optional<Order> orderOptional = orderRepository.findById(id);
        return orderOptional.map(this::convertToDto);
    }

    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDto) // Convert each Order to OrderResponse DTO
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);
        return convertToDto(savedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));

        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
}
