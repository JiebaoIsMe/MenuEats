package com.user.infrastructure.web;

import com.user.dto.OrderDTO;
import com.user.domain.messaging.model.Message;
import com.user.infrastructure.integration.OrderIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderIntegrationService orderIntegrationService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            OrderDTO createdOrder = orderIntegrationService.createOrder(orderData);
            if (createdOrder != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        try {
            List<OrderDTO> orders = orderIntegrationService.getOrdersByCustomerId(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long orderId) {
        try {
            OrderDTO order = orderIntegrationService.getOrderById(orderId);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            OrderDTO updatedOrder = orderIntegrationService.updateOrderStatus(orderId, newStatus.toUpperCase());
            if (updatedOrder != null) {
                return ResponseEntity.ok(updatedOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long orderId) {
        try {
            OrderDTO cancelledOrder = orderIntegrationService.cancelOrder(orderId);
            if (cancelledOrder != null) {
                return ResponseEntity.ok(cancelledOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{orderId}/accept")
    public ResponseEntity<OrderDTO> acceptOrder(@PathVariable Long orderId) {
        try {
            System.out.println("[OrderController] Accept order request for orderId: " + orderId);
            OrderDTO acceptedOrder = orderIntegrationService.acceptOrder(orderId);
            if (acceptedOrder != null) {
                return ResponseEntity.ok(acceptedOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{orderId}/messaging/confirmation")
    public ResponseEntity<Map<String, Object>> createOrderConfirmationMessage(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> messageData) {
        try {
            Long restaurantOwnerId = Long.valueOf(messageData.get("restaurantOwnerId").toString());
            Long customerId = Long.valueOf(messageData.get("customerId").toString());
            
            Message message = orderIntegrationService.createOrderConfirmationMessage(restaurantOwnerId, customerId, orderId);
            
            Map<String, Object> response = Map.of(
                "messageId", message.getId(),
                "orderId", orderId,
                "content", message.getContent(),
                "messageType", message.getMessageType(),
                "status", "sent"
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Failed to create order confirmation message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable String status) {
        try {
            List<OrderDTO> orders = orderIntegrationService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{orderId}/assign-rider")
    public ResponseEntity<OrderDTO> assignRiderToOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Long> riderAssignment) {
        try {
            Long riderId = riderAssignment.get("riderId");
            OrderDTO updatedOrder = orderIntegrationService.assignRiderToOrder(orderId, riderId);
            if (updatedOrder != null) {
                return ResponseEntity.ok(updatedOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{orderId}/mark-delivered")
    public ResponseEntity<OrderDTO> markOrderAsDelivered(@PathVariable Long orderId) {
        try {
            OrderDTO deliveredOrder = orderIntegrationService.markOrderAsDelivered(orderId);
            if (deliveredOrder != null) {
                return ResponseEntity.ok(deliveredOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health/ordering-service")
    public ResponseEntity<Map<String, Object>> checkOrderingServiceHealth() {
        boolean isAvailable = orderIntegrationService.isOrderingServiceAvailable();
        Map<String, Object> response = Map.of(
            "ordering-service-available", isAvailable,
            "status", isAvailable ? "UP" : "DOWN"
        );
        return ResponseEntity.ok(response);
    }
}