package com.restaurant.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;

import com.restaurant.model.Restaurant;
import com.restaurant.service.RestaurantService;

import java.util.List;

import org.apache.catalina.connector.Response;
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
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return new ResponseEntity<>(restaurantService.getAllRestaurants(), HttpStatus.OK);
    }

    @GetMapping(value="/restaurant/{id}")
    public Restaurant getRestaurant(@PathVariable long id) {
            return restaurantService.getRestaurantById(id);
    }

    @PostMapping(value="/restaurant/{id}")
    public ResponseEntity<?> addRestaurant(@RequestPart Restaurant restaurant) {
        try{
            restaurantService.addRestaurant(restaurant);
            return new ResponseEntity<>(restaurant, HttpStatus.CREATED);
        }

        catch( Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}