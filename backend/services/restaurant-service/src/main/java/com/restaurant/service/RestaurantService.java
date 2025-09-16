package com.restaurant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import com.restaurant.repository.RestaurantRepository;
import com.restaurant.model.Restaurant;


import java.util.List;

@Service
public class RestaurantService {
    
    @Autowired
    RestaurantRepository restaurantRepo;

    public List<Restaurant> getAllRestaurants(){
        return restaurantRepo.findAll();
    }

    public Restaurant getRestaurantById(long id){
        return restaurantRepo.findById(id).orElseThrow(()-> new EntityNotFoundException(
            "Restaurant not found with id:" + id 
        ));
    }

    
    public Restaurant addRestaurant(Restaurant restaurant){
        return restaurantRepo.save(restaurant);
    }

    public Restaurant updateRestaurant(Restaurant restaurant){

        getRestaurantById(restaurant.getId());
        return restaurantRepo.save(restaurant);
        
    }

    public void deleteRestaurant(Long id){
        // match id in update or create
        restaurantRepo.deleteById(id);
    }
}
