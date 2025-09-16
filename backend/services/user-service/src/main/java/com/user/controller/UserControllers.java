package com.user.controller;

import com.user.model.User;
import com.user.model.UserProfile;
import com.user.model.UserRole;
import com.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public List<User> getUsersByRole(@PathVariable UserRole role) {
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
    
    // Get restaurants by owner (for restaurant owners)
    @GetMapping("/{userId}/restaurants")
    public ResponseEntity<?> getRestaurantsByOwnerId(@PathVariable Long userId) {
        try {
            Object restaurants = userService.getRestaurantsByOwnerId(userId);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling restaurant service: " + e.getMessage());
        }
    }


    // Get restaurants by owner (for restaurant owners)
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
    

}