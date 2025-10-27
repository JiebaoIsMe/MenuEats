package com.restaurant.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;



import com.restaurant.model.MenuItems;
import com.restaurant.dto.CreateMenuRequest;
import com.restaurant.dto.MenuResponse;
import com.restaurant.service.MenuService;

import java.util.List;
import java.util.ArrayList;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class MenuControllers {
    
    @Autowired
    private MenuService menuService;

    @GetMapping("/restaurant/{restaurantName}/menu")
    public ResponseEntity<List<MenuResponse>> getMenuByRestaurantName(@PathVariable String restaurantName) {
        try {
            // Get MenuItems from menu service
            List<MenuItems> menu_items = menuService.getAllMenuItemsByRestaurantName(restaurantName);

            // Convert List<MenuItems> to List<MenuItemsResponse>
            List<MenuResponse> menuResponses = new ArrayList<>();
            for (MenuItems items : menu_items) {
                MenuResponse response = new MenuResponse();
                response.setId(items.getId());
                response.setName(items.getName());
                response.setDescription(items.getDescription());
                response.setCategory(items.getCategory());
                response.setPrice(items.getPrice());
                response.setAvailable(items.getAvailable());
                response.setRestaurantId(items.getRestaurantId());
                menuResponses.add(response);
            }
            return new ResponseEntity<>(menuResponses, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<List<MenuResponse>> getMenuByRestaurantId(@PathVariable Long restaurantId) {
        try {
            // Get MenuItems from menu service by restaurant ID
            List<MenuItems> menu_items = menuService.getAllMenuItemsByRestaurantId(restaurantId);

            // Convert List<MenuItems> to List<MenuItemsResponse>
            List<MenuResponse> menuResponses = new ArrayList<>();
            for (MenuItems items : menu_items) {
                MenuResponse response = new MenuResponse();
                response.setId(items.getId());
                response.setName(items.getName());
                response.setDescription(items.getDescription());
                response.setCategory(items.getCategory());
                response.setPrice(items.getPrice());
                response.setAvailable(items.getAvailable());
                response.setRestaurantId(items.getRestaurantId());
                menuResponses.add(response);
            }
            return new ResponseEntity<>(menuResponses, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/menu/{itemId}")
    public ResponseEntity<MenuResponse> getMenuItemById(@PathVariable String itemId) {
        try {
            // Get MenuItems from menu service
            MenuItems menu_item = menuService.getMenuItemById(itemId);

            // Convert MenuItems to MenuResponse
            MenuResponse response = new MenuResponse();
            response.setId(menu_item.getId());
            response.setName(menu_item.getName());
            response.setDescription(menu_item.getDescription());
            response.setCategory(menu_item.getCategory());
            response.setPrice(menu_item.getPrice());
            response.setAvailable(menu_item.getAvailable());
            response.setRestaurantId(menu_item.getRestaurantId());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PostMapping("/restaurant/menu")
    public ResponseEntity<MenuResponse> createMenuItem(@RequestBody CreateMenuRequest request) {
        try {
            // convert request to MenuItems
            MenuItems menu_item = new MenuItems();
            menu_item.setName(request.getName());
            menu_item.setDescription(request.getDescription());
            menu_item.setCategory(request.getCategory());
            menu_item.setPrice(request.getPrice());
            menu_item.setAvailable(request.isAvailable());
            menu_item.setRestaurantId(request.getRestaurantId());
           
            MenuItems new_item = menuService.createMenuItem(menu_item);

            // Create MenuResponse with MenuItems
            MenuResponse response = new MenuResponse();
            response.setId(new_item.getId());
            response.setName(new_item.getName());
            response.setDescription(new_item.getDescription());
            response.setCategory(new_item.getCategory());
            response.setPrice(new_item.getPrice());
            response.setAvailable(new_item.getAvailable());
            response.setRestaurantId(new_item.getRestaurantId());

            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/restaurant/menu/{id}")
    public ResponseEntity<MenuResponse> updateMenuItem(@PathVariable String id, @RequestBody CreateMenuRequest request) {
        try {
            // Convert CreateMenuRequest to MenuItems object
            MenuItems menu_item = new MenuItems();
            menu_item.setName(request.getName());
            menu_item.setDescription(request.getDescription());
            menu_item.setCategory(request.getCategory());
            menu_item.setPrice(request.getPrice());
            menu_item.setAvailable(request.isAvailable());
            menu_item.setRestaurantId(request.getRestaurantId());
            
            // Get updated MenuItems internal data
            MenuItems updated_item = menuService.updateMenuItem(id, menu_item);

            // convert result to MenuResponse 
            MenuResponse response = new MenuResponse();
            response.setId(updated_item.getId());
            response.setName(updated_item.getName());
            response.setDescription(updated_item.getDescription());
            response.setCategory(updated_item.getCategory());
            response.setPrice(updated_item.getPrice());
            response.setAvailable(updated_item.getAvailable());
            response.setRestaurantId(updated_item.getRestaurantId());

            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/restaurant/menu/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
