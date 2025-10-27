package com.logistic.controller;

import com.logistic.dto.DeliveryTrackingResponse;
import com.logistic.dto.RiderResponse;
import com.logistic.repository.RiderRepository;
import com.logistic.service.DeliveryTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/riders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8084"}, allowCredentials = "true")
public class RiderController {
    
    @Autowired
    private RiderRepository riderRepository;
    
    @Autowired
    private DeliveryTrackingService deliveryTrackingService;
    
    // Get all available riders
    @GetMapping("/available")
    public ResponseEntity<List<RiderResponse>> getAvailableRiders() {
        List<RiderResponse> riders = riderRepository.findAvailableRiders()
                .stream()
                .map(this::convertToDto)
                .toList();
        return ResponseEntity.ok(riders);
    }
    
    // Get rider's current deliveries/orders
    @GetMapping("/{riderId}/deliveries")
    public ResponseEntity<List<DeliveryTrackingResponse>> getRiderDeliveries(@PathVariable Long riderId) {
        List<DeliveryTrackingResponse> deliveries = deliveryTrackingService.getTrackingByRider(riderId);
        return ResponseEntity.ok(deliveries);
    }
    
    // Get rider's active (non-delivered) orders
    @GetMapping("/{riderId}/active-deliveries")
    public ResponseEntity<List<DeliveryTrackingResponse>> getRiderActiveDeliveries(@PathVariable Long riderId) {
        List<DeliveryTrackingResponse> activeDeliveries = deliveryTrackingService.getTrackingByRider(riderId)
                .stream()
                .filter(delivery -> !delivery.getLogisticsStatus().toString().equals("DELIVERED"))
                .toList();
        return ResponseEntity.ok(activeDeliveries);
    }
    
    // Update rider availability status
    @PatchMapping("/{riderId}/availability")
    public ResponseEntity<Map<String, Object>> updateRiderAvailability(
            @PathVariable Long riderId,
            @RequestBody Map<String, Boolean> availabilityUpdate) {
        try {
            Boolean isAvailable = availabilityUpdate.get("isAvailable");
            if (isAvailable == null) {
                return ResponseEntity.badRequest().build();
            }
            
            com.logistic.model.Rider rider = riderRepository.findById(riderId).orElse(null);
            if (rider == null) {
                return ResponseEntity.notFound().build();
            }
            
            rider.setAvailable(isAvailable);
            riderRepository.save(rider);
            
            return ResponseEntity.ok(Map.of(
                    "riderId", riderId,
                    "isAvailable", isAvailable,
                    "message", "Rider availability updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    private RiderResponse convertToDto(com.logistic.model.Rider rider) {
        return new RiderResponse(
                rider.getId(),
                rider.getUserId(),
                rider.isAvailable()
        );
    }
}