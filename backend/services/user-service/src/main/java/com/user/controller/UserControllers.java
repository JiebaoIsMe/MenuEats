package com.user.controller;

import com.user.model.User;
import com.user.model.UserProfile;
import com.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserControllers {
    
    @Autowired
    private UserService userService;
    
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @GetMapping("/active")
    public List<User> getActiveUsers() {
        return userService.getActiveUsers();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        return userService.getUsersByRole(role);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long userId) {
        Optional<UserProfile> profile = userService.getUserProfile(userId);
        return profile.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{userId}/profile")
    public ResponseEntity<UserProfile> createOrUpdateUserProfile(@PathVariable Long userId, @RequestBody UserProfile profileDetails) {
        try {
            UserProfile profile = userService.createOrUpdateUserProfile(userId, profileDetails);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get restaurants from restaurant service
    @GetMapping("/restaurants")
    public ResponseEntity<?> getAllRestaurants() {
        try {
            Object restaurants = userService.getAllRestaurants();
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling restaurant service: " + e.getMessage());
        }
    }
    
    // Get restaurants by owner id(for restaurant owners)
    @GetMapping("/{userId}/restaurants")
    public ResponseEntity<?> getRestaurantsByOwnerId(@PathVariable Long userId) {
        try {
            Object restaurants = userService.getRestaurantsByOwnerId(userId);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling restaurant service: " + e.getMessage());
        }
    }


    // Get restaurants by owner name (for restaurant owners)
    @GetMapping("owner/{ownerName}/restaurants")
    public ResponseEntity<?> getRestaurantsByOwnerName(@PathVariable String ownerName) {
        try {
            Object restaurants = userService.getRestaurantsByOwnerName(ownerName);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling restaurant service: " + e.getMessage());
        }
    }
    
    // Search restaurants by name
    @GetMapping("/restaurants/search/{name}")
    public ResponseEntity<?> getRestaurantByName(@PathVariable String name) {
        try {
            Object restaurants = userService.getRestaurantByName(name);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error searching restaurants: " + e.getMessage());
        }
    }
    
    // ===== BUSINESS OWNER RESTAURANT CRUD =====
    
    @PostMapping("/{ownerId}/restaurants")
    public ResponseEntity<?> createRestaurant(@PathVariable Long ownerId, @RequestBody Map<String, Object> restaurantData) {
        try {
            Object result = userService.createRestaurant(ownerId, restaurantData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @PutMapping("/{ownerId}/restaurants/{restaurantId}")
    public ResponseEntity<?> updateRestaurant(@PathVariable Long ownerId, @PathVariable Long restaurantId, @RequestBody Map<String, Object> restaurantData) {
        try {
            Object result = userService.updateRestaurant(ownerId, restaurantId, restaurantData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{ownerId}/restaurants/{restaurantId}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long ownerId, @PathVariable Long restaurantId) {
        try {
            Object result = userService.deleteRestaurant(ownerId, restaurantId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    // ===== BUSINESS OWNER MENU CRUD =====
    
    @PostMapping("/{ownerId}/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> createMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @RequestBody Map<String, Object> menuData) {
        try {
            Object result = userService.createMenuItem(ownerId, restaurantId, menuData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @PutMapping("/{ownerId}/restaurants/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable String menuItemId, @RequestBody Map<String, Object> menuData) {
        try {
            Object result = userService.updateMenuItem(ownerId, restaurantId, menuItemId, menuData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{ownerId}/restaurants/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable String menuItemId) {
        try {
            Object result = userService.deleteMenuItem(ownerId, restaurantId, menuItemId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    // ===== RIDER DELIVERY METHODS =====
    
    @GetMapping("/{riderId}/delivery/restaurants")
    public ResponseEntity<?> getAllRestaurantsForDelivery(@PathVariable Long riderId) {
        try {
            Object restaurants = userService.getAllRestaurantsForDelivery(riderId);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    // These endpoints should be handled by order/delivery service
    /*
    @PutMapping("/{riderId}/delivery/orders/{orderId}/status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable Long riderId, @PathVariable Long orderId, @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            Object result = userService.updateDeliveryStatus(riderId, orderId, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @PutMapping("/{riderId}/delivery/location")
    public ResponseEntity<?> updateRiderLocation(@PathVariable Long riderId, @RequestBody Map<String, Object> locationData) {
        try {
            Object result = userService.updateRiderLocation(riderId, locationData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @GetMapping("/{riderId}/delivery/orders/{orderId}/customer")
    public ResponseEntity<?> getDeliveryCustomerInfo(@PathVariable Long riderId, @PathVariable Long orderId) {
        try {
            Object customerInfo = userService.getDeliveryCustomerInfo(riderId, orderId);
            return ResponseEntity.ok(customerInfo);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    */
    
    // ===== CUSTOMER METHODS =====
    
    @GetMapping("/{customerId}/customer/restaurants")
    public ResponseEntity<?> getAllRestaurantsForCustomer(@PathVariable Long customerId) {
        try {
            Object restaurants = userService.getAllRestaurantsForCustomer(customerId);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @GetMapping("/{customerId}/customer/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> getRestaurantMenuForCustomer(@PathVariable Long customerId, @PathVariable Long restaurantId) {
        try {
            Object menu = userService.getRestaurantMenuForCustomer(customerId, restaurantId);
            return ResponseEntity.ok(menu);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    // These endpoints should be handled by order service
    /*
    @PostMapping("/{customerId}/customer/orders")
    public ResponseEntity<?> placeOrder(@PathVariable Long customerId, @RequestBody Map<String, Object> orderData) {
        try {
            Object result = userService.placeOrder(customerId, orderData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @GetMapping("/{customerId}/customer/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long customerId) {
        try {
            Object orders = userService.getCustomerOrders(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @GetMapping("/{customerId}/customer/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long customerId, @PathVariable Long orderId) {
        try {
            Object orderDetails = userService.getOrderDetails(customerId, orderId);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{customerId}/customer/orders/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long customerId, @PathVariable Long orderId) {
        try {
            Object result = userService.cancelOrder(customerId, orderId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
    */

}