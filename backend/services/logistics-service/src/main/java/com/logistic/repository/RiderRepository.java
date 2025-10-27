package com.logistic.repository;

import com.logistic.model.Rider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiderRepository extends JpaRepository<Rider, Long> {
    
    Optional<Rider> findByUserId(Long userId);
    
    List<Rider> findByIsAvailable(boolean isAvailable);
    
    @Query("SELECT r FROM Rider r WHERE r.isAvailable = true AND r.id NOT IN " +
           "(SELECT dt.riderId FROM DeliveryTracking dt WHERE dt.riderId IS NOT NULL " +
           "AND dt.logisticsStatus NOT IN ('DELIVERED'))")
    List<Rider> findAvailableRiders();
}