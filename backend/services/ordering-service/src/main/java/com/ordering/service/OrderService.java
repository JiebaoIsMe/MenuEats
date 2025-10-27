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
import org.springframework.scheduling.annotation.Async;

import java.util.concurrent.CompletableFuture;

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

    public List<OrderResponse> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId).stream()
                .map(this::convertToDto) // Convert each Order to OrderResponse DTO
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse assignRiderToOrder(Long orderId, Long riderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        
        // Update status to indicate rider has been assigned
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        Order savedOrder = orderRepository.save(order);
        
        return convertToDto(savedOrder);
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

    @Transactional
    public OrderResponse acceptOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));
        
        // Update to CONFIRMED
        OrderResponse confirmedOrder = updateOrderStatus(orderId, OrderStatus.CONFIRMED);
        
        // Trigger messaging integration - send confirmation message to customer
        triggerOrderConfirmationMessaging(order);
        
        // Automatically transition to PREPARING after 2 seconds
        schedulePreparingTransition(orderId);
        
        return confirmedOrder;
    }

    @Transactional
    public OrderResponse rejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));

        return updateOrderStatus(orderId, OrderStatus.REJECTED);
    }

    @Async
    private void schedulePreparingTransition(Long orderId) {
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(2000); // Wait 2 seconds
                updateOrderStatus(orderId, OrderStatus.PREPARING);
                System.out.println("[OrderService] Order " + orderId + " automatically moved to PREPARING status");
                
                // After another 3 seconds, move to READY_FOR_PICKUP
                Thread.sleep(3000); // Wait additional 3 seconds
                updateOrderStatus(orderId, OrderStatus.READY_FOR_PICKUP);
                System.out.println("[OrderService] Order " + orderId + " automatically moved to READY_FOR_PICKUP status");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("[OrderService] Failed to transition order " + orderId + ": " + e.getMessage());
            }
        });
    }

    private void triggerOrderConfirmationMessaging(Order order) {
        try {
            System.out.println("[OrderService] MESSAGING TRIGGER: Order " + order.getId() + " confirmed - should send message from restaurantId=" + order.getRestaurantId() + " to customerId=" + order.getCustomerId());
            // TODO: Call user-service messaging endpoint
            // URL: POST http://localhost:8084/api/user-orders/{orderId}/messaging/confirmation
            // Body: {"restaurantOwnerId": restaurantOwnerId, "customerId": order.getCustomerId()}
        } catch (Exception e) {
            System.err.println("[OrderService] Failed to trigger messaging for order " + order.getId() + ": " + e.getMessage());
        }
    }
}
