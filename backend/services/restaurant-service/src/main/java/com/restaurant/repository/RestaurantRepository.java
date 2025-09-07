package com.restaurant.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.model.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant,Long> {

    
}
