package com.logistic.service;

import com.logistic.dto.DeliveryTrackingResponse;
import com.logistic.model.DeliveryTracking;
import com.logistic.model.LogisticsStatus;
import com.logistic.model.Rider;
import com.logistic.repository.DeliveryTrackingRepository;
import com.logistic.repository.RiderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class DeliveryTrackingService {
    
    @Autowired
    private DeliveryTrackingRepository deliveryTrackingRepository;
    
    @Autowired
    private RiderRepository riderRepository;
    
    @Autowired
    private OrderingServiceIntegration orderingServiceIntegration;
    
    public DeliveryTrackingResponse createDeliveryTracking(Long orderId) {
        DeliveryTracking tracking = new DeliveryTracking(orderId);
        tracking = deliveryTrackingRepository.save(tracking);
        
        // Start automatic assignment process
        initiateDeliveryProcess(tracking.getId());
        
        return convertToDto(tracking);
    }
    
    public Optional<DeliveryTrackingResponse> getTrackingByOrderId(Long orderId) {
        return deliveryTrackingRepository.findByOrderId(orderId)
                .map(this::convertToDto);
    }
    
    public List<DeliveryTrackingResponse> getTrackingByRider(Long riderId) {
        return deliveryTrackingRepository.findByRiderId(riderId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    public DeliveryTrackingResponse assignRider(Long orderId, Long riderId) {
        DeliveryTracking tracking = deliveryTrackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery tracking not found for order: " + orderId));
        
        Rider rider = riderRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found: " + riderId));
        
        tracking.setRiderId(riderId);
        tracking.setLogisticsStatus(LogisticsStatus.ASSIGNED_TO_RIDER);
        rider.setAvailable(false);
        
        riderRepository.save(rider);
        tracking = deliveryTrackingRepository.save(tracking);
        
        // Continue the delivery process
        continueDeliveryProcess(tracking.getId());
        
        return convertToDto(tracking);
    }
    
    public DeliveryTrackingResponse updateLogisticsStatus(Long orderId, LogisticsStatus newStatus) {
        DeliveryTracking tracking = deliveryTrackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery tracking not found for order: " + orderId));
        
        tracking.setLogisticsStatus(newStatus);
        
        // Update timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case PICKED_UP_FROM_RESTAURANT:
                tracking.setPickupTime(now);
                break;
            case RIDER_EN_ROUTE_TO_CUSTOMER:
                tracking.setDepartureTime(now);
                break;
            case DELIVERED:
                tracking.setDeliveryTime(now);
                // Update ordering-service order status
                orderingServiceIntegration.updateOrderStatus(orderId, "DELIVERED");
                // Free up the rider
                if (tracking.getRiderId() != null) {
                    riderRepository.findById(tracking.getRiderId())
                            .ifPresent(rider -> {
                                rider.setAvailable(true);
                                riderRepository.save(rider);
                            });
                }
                break;
        }
        
        tracking = deliveryTrackingRepository.save(tracking);
        return convertToDto(tracking);
    }
    
    @Async
    public void initiateDeliveryProcess(Long trackingId) {
        try {
            // Wait 3 seconds then assign rider
            Thread.sleep(3000);
            
            DeliveryTracking tracking = deliveryTrackingRepository.findById(trackingId).orElse(null);
            if (tracking != null && tracking.getLogisticsStatus() == LogisticsStatus.PENDING_ASSIGNMENT) {
                List<Rider> availableRiders = riderRepository.findAvailableRiders();
                if (!availableRiders.isEmpty()) {
                    assignRider(tracking.getOrderId(), availableRiders.get(0).getId());
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    @Async
    public void continueDeliveryProcess(Long trackingId) {
        try {
            DeliveryTracking tracking = deliveryTrackingRepository.findById(trackingId).orElse(null);
            if (tracking == null) return;
            
            // Rider en route to restaurant (2 seconds)
            Thread.sleep(2000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.RIDER_EN_ROUTE_TO_RESTAURANT);
            
            // Arrived at restaurant (3 seconds)
            Thread.sleep(3000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.ARRIVED_AT_RESTAURANT);
            
            // Picked up from restaurant (5 seconds)
            Thread.sleep(5000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.PICKED_UP_FROM_RESTAURANT);
            
            // En route to customer (2 seconds)
            Thread.sleep(2000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.RIDER_EN_ROUTE_TO_CUSTOMER);
            
            // Near customer (8 seconds)
            Thread.sleep(8000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.NEAR_CUSTOMER);
            
            // Delivered (3 seconds)
            Thread.sleep(3000);
            updateLogisticsStatus(tracking.getOrderId(), LogisticsStatus.DELIVERED);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private DeliveryTrackingResponse convertToDto(DeliveryTracking tracking) {
        return new DeliveryTrackingResponse(
                tracking.getId(),
                tracking.getOrderId(),
                tracking.getRiderId(),
                tracking.getLogisticsStatus(),
                tracking.getEstimatedDeliveryTime(),
                tracking.getPickupTime(),
                tracking.getDepartureTime(),
                tracking.getDeliveryTime(),
                tracking.getUpdatedAt()
        );
    }
}