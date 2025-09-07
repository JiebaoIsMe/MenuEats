package com.restaurant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return restaurantRepo.findById(id).orElse(new Restaurant());
    }

    
    public void addRestaurant(Restaurant restaurant){
        restaurantRepo.save(restaurant);
    }

    public void updateRestaurant(Restaurant restaurant){

        // test
        restaurant.setId(-1);
        restaurant.setLocation("test");
        restaurant.setName("test");
        restaurant.setOwnerId(-1);

        restaurantRepo.save(restaurant);
    }

    public void deleteRestaurant(Long id){

        // match id in update or create
        restaurantRepo.deleteById(id);
    }
}
