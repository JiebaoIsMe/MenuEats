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
    
    public Restaurant getRestaurantByName(String name){
        return restaurantRepo.findByName(name).orElseThrow(()-> new EntityNotFoundException(
            "Restaurant not found with name: " + name
        ));
    }

    
    public Restaurant addRestaurant(Restaurant restaurant){
        // Auto-assign menu_id based on restaurant ID
        // Get next menu ID (max existing menu_id + 1)
        List<Restaurant> allRestaurants = restaurantRepo.findAll();
        Long nextMenuId = allRestaurants.stream()
            .mapToLong(r -> r.getMenu_id() != null ? r.getMenu_id() : 0L)
            .max()
            .orElse(0L) + 1;
        
        restaurant.setMenu_id(nextMenuId);
        return restaurantRepo.save(restaurant);
    }

    public Restaurant updateRestaurant(Restaurant restaurant){

        getRestaurantById(restaurant.getId());
        return restaurantRepo.save(restaurant);
        
    }

    // pass to admin 
    // public void deleteRestaurant(Long id){
    //     // match id in update or create
    //     restaurantRepo.deleteById(id);
    // }
}
