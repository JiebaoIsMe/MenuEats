package com.restaurant.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.restaurant.model.Restaurant;
import com.restaurant.service.RestaurantService;

import com.restaurant.dto.RestaurantResponse;
import com.restaurant.dto.CreateRestaurantRequest;

import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api")
@CrossOrigin
public class RestaurantControllers {

    @RequestMapping(value="/test")
    public String test() {
        return "Test Message";
    }

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping(value="/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        try {
            // Get all restaurants from service
            List<Restaurant> restaurants = restaurantService.getAllRestaurants();
            
            // Convert List<Restaurant> to List<RestaurantResponse>
            List<RestaurantResponse> responseList = new ArrayList<>();
            for (Restaurant restaurant : restaurants) {
                RestaurantResponse response = new RestaurantResponse();
                response.setId(restaurant.getId());
                response.setName(restaurant.getName());
                response.setLocation(restaurant.getLocation());
                response.setOwnerId(restaurant.getOwnerId());
                responseList.add(response);
            }
            // Convert from RestaurantResponse to JSON data with HttpStatus
            return new ResponseEntity<>(responseList, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value="/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable long id) {
        try {
            // Get restaurant from service
            Restaurant restaurant = restaurantService.getRestaurantById(id);
            
            // Convert Entity to Response
            RestaurantResponse response = new RestaurantResponse();
            response.setId(restaurant.getId());
            response.setName(restaurant.getName());
            response.setLocation(restaurant.getLocation());
            response.setOwnerId(restaurant.getOwnerId());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);

        }
            
    }

    @PostMapping(value="/restaurants")
    // Response here is for notification sucess or failed to interact with database
    public ResponseEntity<RestaurantResponse> addRestaurant(@RequestBody CreateRestaurantRequest request) {
        try{
            // Convert JSON to DTO Entity 
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.getName());
            restaurant.setLocation(request.getLocation());
            restaurant.setOwnerId(request.getOwnerId());

            // Save into repository
            restaurantService.addRestaurant(restaurant);

            // Convert Entity to Response DTO
            RestaurantResponse response = new RestaurantResponse();
            response.setId(restaurant.getId());
            response.setName(restaurant.getName());
            response.setLocation(restaurant.getLocation());
            response.setOwnerId(restaurant.getOwnerId());

            return new ResponseEntity<RestaurantResponse>(response, HttpStatus.CREATED);
        }

        catch( Exception e){
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    
    @PutMapping(value="/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(@PathVariable long id, @RequestBody CreateRestaurantRequest request) {
        try {
            // Convert JSON to Request Entity via DTO mapping
            Restaurant restaurant = new Restaurant();
            restaurant.setId(id);
            restaurant.setName(request.getName());
            restaurant.setLocation(request.getLocation());
            restaurant.setOwnerId(request.getOwnerId());

            // Save changes into repository 
            restaurantService.updateRestaurant(restaurant);

            // Convert Entity to Response 
            RestaurantResponse response = new RestaurantResponse();
            response.setId(restaurant.getId());
            response.setName(restaurant.getName());
            response.setLocation(restaurant.getLocation());
            response.setOwnerId(restaurant.getOwnerId());

            return new ResponseEntity<RestaurantResponse>(response,HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    // only for admin, overscoped
    // @DeleteMapping(value="/restaurants/{id}")
    // public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
    //     try {
    //         restaurantService.deleteRestaurant(id);
    //         return new ResponseEntity<>(HttpStatus.OK);
    //     } catch (Exception e) {
    //         return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}