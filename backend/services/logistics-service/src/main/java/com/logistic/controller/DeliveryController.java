package com.logistic.controller;

import com.logistic.dto.AssignRiderRequest;
import com.logistic.dto.DeliveryTrackingResponse;
import com.logistic.model.LogisticsStatus;
import com.logistic.service.DeliveryTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8084"}, allowCredentials = "true")
public class DeliveryController {
    
    @Autowired
    private DeliveryTrackingService deliveryTrackingService;
    
    // Create delivery tracking for an order
    @PostMapping("/track")
    public ResponseEntity<DeliveryTrackingResponse> createDeliveryTracking(@RequestBody Map<String, Long> request) {
        try {
            Long orderId = request.get("orderId");
            if (orderId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            DeliveryTrackingResponse tracking = deliveryTrackingService.createDeliveryTracking(orderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(tracking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get delivery tracking by order ID
    @GetMapping("/track/order/{orderId}")
    public ResponseEntity<DeliveryTrackingResponse> getTrackingByOrderId(@PathVariable Long orderId) {
        return deliveryTrackingService.getTrackingByOrderId(orderId)
                .map(tracking -> ResponseEntity.ok(tracking))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get all deliveries for a rider
    @GetMapping("/track/rider/{riderId}")
    public ResponseEntity<List<DeliveryTrackingResponse>> getTrackingByRider(@PathVariable Long riderId) {
        List<DeliveryTrackingResponse> trackings = deliveryTrackingService.getTrackingByRider(riderId);
        return ResponseEntity.ok(trackings);
    }
    
    // Assign rider to order
    @PostMapping("/assign-rider")
    public ResponseEntity<DeliveryTrackingResponse> assignRider(@RequestBody AssignRiderRequest request) {
        try {
            DeliveryTrackingResponse tracking = deliveryTrackingService.assignRider(
                    request.getOrderId(), 
                    request.getRiderId()
            );
            return ResponseEntity.ok(tracking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update logistics status (for rider actions)
    @PatchMapping("/track/order/{orderId}/status")
    public ResponseEntity<DeliveryTrackingResponse> updateLogisticsStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String statusStr = statusUpdate.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().build();
            }
            
            LogisticsStatus status = LogisticsStatus.valueOf(statusStr.toUpperCase());
            DeliveryTrackingResponse tracking = deliveryTrackingService.updateLogisticsStatus(orderId, status);
            return ResponseEntity.ok(tracking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "logistics-service",
                "port", "8083"
        ));
    }
}