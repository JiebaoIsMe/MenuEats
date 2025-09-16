package com.user.service;

import com.user.model.User;
import com.user.model.UserProfile;
import com.user.model.UserRole;
import com.user.repository.UserRepository;
import com.user.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.Map;


@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setActive(userDetails.isActive());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public Optional<UserProfile> getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId);
    }
    
    public UserProfile createOrUpdateUserProfile(Long userId, UserProfile profileDetails) {
        Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);
        
        if (existingProfile.isPresent()) {
            UserProfile profile = existingProfile.get();
            profile.setFirstName(profileDetails.getFirstName());
            profile.setLastName(profileDetails.getLastName());
            profile.setPhone(profileDetails.getPhone());
            profile.setAddress(profileDetails.getAddress());
            profile.setCity(profileDetails.getCity());
            profile.setPostalCode(profileDetails.getPostalCode());
            return userProfileRepository.save(profile);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            profileDetails.setUser(user);
            return userProfileRepository.save(profileDetails);
        }
    }

    public Object getAllRestaurants(){
        try {
            String restaurantServiceUrl = 
            "http://localhost:8081/api/restaurants";
            return restTemplate.getForObject(restaurantServiceUrl, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Error calling restaurant service: " 
            + e.getMessage());
        }
    }

    public Object getRestaurantByName(String name) {
        try {
            String restaurantServiceUrl = "http://localhost:8081/api/restaurants";
            Map[] restaurants = restTemplate.getForObject(restaurantServiceUrl, Map[].class);
            
            return Arrays.stream(restaurants)
                    .filter(r -> r.get("name").toString().toLowerCase().contains(name.toLowerCase()))
                    .toArray();
        } catch (Exception e) {
            throw new RuntimeException("Error searching restaurants: " + e.getMessage());
        }
    }

    public Object getRestaurantsByOwnerId(Long userId) {
        try {
            String restaurantServiceUrl = "http://localhost:8081/api/restaurants";
            Map<String, Object>[] restaurants = restTemplate.getForObject(restaurantServiceUrl, Map[].class);
            
            // Filter restaurants by owner_id
            return Arrays.stream(restaurants)
                    .filter(restaurant -> {
                        Object ownerId = restaurant.get("ownerId");
                        return ownerId != null && ownerId.toString().equals(userId.toString());
                    })
                    .toArray();
        } catch (Exception e) {
            throw new RuntimeException("Error calling restaurant service: " 
            + e.getMessage());
        }
    }
    
    public Object getRestaurantsByOwnerName(String ownerName) {
        try {
            // First, find user by username
            Optional<User> user = getUserByUsername(ownerName);
            if (user.isPresent()) {
                // Then get restaurants by user ID
                return getRestaurantsByOwnerId(user.get().getId());
            } else {
                throw new RuntimeException("Owner not found: " + ownerName);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error finding restaurants by owner name: " + e.getMessage());
        }
    }
}