package com.logistic.repository;

import com.logistic.model.DeliveryTracking;
import com.logistic.model.LogisticsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, Long> {
    
    Optional<DeliveryTracking> findByOrderId(Long orderId);
    
    List<DeliveryTracking> findByRiderId(Long riderId);
    
    List<DeliveryTracking> findByLogisticsStatus(LogisticsStatus status);
    
    @Query("SELECT dt FROM DeliveryTracking dt WHERE dt.riderId = :riderId AND dt.logisticsStatus NOT IN ('DELIVERED')")
    List<DeliveryTracking> findActiveDeliveriesByRider(@Param("riderId") Long riderId);
    
    @Query("SELECT dt FROM DeliveryTracking dt WHERE dt.logisticsStatus = 'PENDING_ASSIGNMENT' ORDER BY dt.updatedAt ASC")
    List<DeliveryTracking> findPendingAssignments();
}