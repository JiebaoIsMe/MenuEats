package com.user.infrastructure.web;

import com.user.infrastructure.integration.LogisticsIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logistics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class LogisticsController {
    
    @Autowired
    private LogisticsIntegrationService logisticsIntegrationService;
    
    // Create delivery tracking for an order
    @PostMapping("/track")
    public ResponseEntity<Map<String, Object>> createDeliveryTracking(@RequestBody Map<String, Long> request) {
        try {
            Long orderId = request.get("orderId");
            if (orderId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, Object> tracking = logisticsIntegrationService.createDeliveryTracking(orderId);
            if (tracking != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(tracking);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get delivery tracking by order ID
    @GetMapping("/track/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getDeliveryTrackingByOrderId(@PathVariable Long orderId) {
        try {
            Map<String, Object> tracking = logisticsIntegrationService.getDeliveryTrackingByOrderId(orderId);
            if (tracking != null) {
                return ResponseEntity.ok(tracking);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get rider's deliveries
    @GetMapping("/riders/{riderId}/deliveries")
    public ResponseEntity<List<Map<String, Object>>> getRiderDeliveries(@PathVariable Long riderId) {
        try {
            List<Map<String, Object>> deliveries = logisticsIntegrationService.getRiderDeliveries(riderId);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get available riders
    @GetMapping("/riders/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableRiders() {
        try {
            List<Map<String, Object>> riders = logisticsIntegrationService.getAvailableRiders();
            return ResponseEntity.ok(riders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update logistics status (for rider actions)
    @PatchMapping("/track/order/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateLogisticsStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, Object> updatedTracking = logisticsIntegrationService.updateLogisticsStatus(orderId, status.toUpperCase());
            if (updatedTracking != null) {
                return ResponseEntity.ok(updatedTracking);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Assign rider to order
    @PostMapping("/assign-rider")
    public ResponseEntity<Map<String, Object>> assignRiderToOrder(@RequestBody Map<String, Long> request) {
        try {
            Long orderId = request.get("orderId");
            Long riderId = request.get("riderId");
            
            if (orderId == null || riderId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, Object> tracking = logisticsIntegrationService.assignRiderToOrder(orderId, riderId);
            if (tracking != null) {
                return ResponseEntity.ok(tracking);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Health check for logistics service
    @GetMapping("/health/logistics-service")
    public ResponseEntity<Map<String, Object>> checkLogisticsServiceHealth() {
        boolean isAvailable = logisticsIntegrationService.isLogisticsServiceAvailable();
        Map<String, Object> response = Map.of(
                "logistics-service-available", isAvailable,
                "status", isAvailable ? "UP" : "DOWN"
        );
        return ResponseEntity.ok(response);
    }
}