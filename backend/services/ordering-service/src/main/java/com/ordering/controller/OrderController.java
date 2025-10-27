package com.ordering.controller;

import com.ordering.dto.OrderRequest;
import com.ordering.dto.OrderResponse;
import com.ordering.model.Order;
import com.ordering.model.OrderStatus;
import com.ordering.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            OrderResponse newOrder = orderService.createOrder(orderRequest);
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(orderDto -> new ResponseEntity<>(orderDto, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable Long customerId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByCustomerId(customerId);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getRestaurantOrders(@PathVariable Long restaurantId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByRestaurantId(restaurantId);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(statusUpdate.get("status").toUpperCase());
            OrderResponse updatedOrder = orderService.updateOrderStatus(id, newStatus);
            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        try {
            OrderResponse cancelledOrder = orderService.cancelOrder(id);
            return new ResponseEntity<>(cancelledOrder, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long id) {
        try {
            OrderResponse acceptedOrder = orderService.acceptOrder(id);
            return new ResponseEntity<>(acceptedOrder, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<OrderResponse> rejectOrder(@PathVariable Long id) {
        try {
            OrderResponse rejectedOrder = orderService.rejectOrder(id);
            return new ResponseEntity<>(rejectedOrder, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponse> orders = orderService.getOrdersByStatus(orderStatus);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/assign-rider")
    public ResponseEntity<OrderResponse> assignRiderToOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Long> riderAssignment) {
        try {
            Long riderId = riderAssignment.get("riderId");
            OrderResponse updatedOrder = orderService.assignRiderToOrder(id, riderId);
            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
