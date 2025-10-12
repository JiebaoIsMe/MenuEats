package com.user.service;

import com.user.model.User;
import com.user.model.UserProfile;
import com.user.model.UserRole;
import com.user.repository.UserRepository;
import com.user.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.Map;


@Service
public class UserService {
    
    // ===== SERVICE URLS =====
    private static final String RESTAURANT_SERVICE_URL = "http://localhost:8081/api/restaurants";
    private static final String MENU_SERVICE_URL = "http://localhost:8081/api/restaurant/menu";
    
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
    
    public List<User> getUsersByRole(String role) {
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
            return restTemplate.getForObject(RESTAURANT_SERVICE_URL, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Error calling restaurant service: " 
            + e.getMessage());
        }
    }

    public Object getRestaurantByName(String name) {
        try {
            // Map<Key, Value> is not like python dict ( dict<[]> )
            Map[] restaurants = restTemplate.getForObject(RESTAURANT_SERVICE_URL, Map[].class);
            
            return Arrays.stream(restaurants)
                    .filter(r -> r.get("name").toString().toLowerCase().contains(name.toLowerCase()))
                    .toArray();
        } catch (Exception e) {
            throw new RuntimeException("Error searching restaurants: " + e.getMessage());
        }
    }

    public Object getRestaurantsByOwnerId(Long userId) {
        try {
            Map<String, Object>[] restaurants = restTemplate.getForObject(RESTAURANT_SERVICE_URL, Map[].class);
            
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

    // ===== ROLE VALIDATION =====
    
    /**
     * Validates user role for operations
     * 
     * BUSINESS_OWNER: Manages own restaurants/menus
     * RIDER: Handles deliveries and order status  
     * CUSTOMER: Places orders 
     */
    private void validateRole(Long userId, String requiredRole) {
        User user = getUserById(userId).orElseThrow(() -> 
            new RuntimeException("User not found: " + userId));
        
        if (!requiredRole.equals(user.getRole())) {
            throw new RuntimeException("Access denied. Required: " + requiredRole + ", Current: " + user.getRole());
        }
    }
}

  // ===== ROLE VALIDATED METHODS =====

  /**
   * BUSINESS_OWNER:
   * - Can CRUD own restaurants
   * - Can CRUD menu items own restaurant
   * - Can review business analytics and orders
   * - Cannot access other owners' restaurant data
   * 
   * RIDER: 
   * - Can view all restaurants for delivery purposes
   * - Can update delivery status and location
   * - Can access delivery-related customer info
   * - Cannot modify restaurant or menu information
   * 
   * CUSTOMER:
   * - Can view all restaurants and menus
   * - Can place and manage their own orders
   * - Cannot modify restaurant or menu data
   */
    
    // ===== BUSINESS OWNER METHODS =====
    
    public Object createRestaurant(Long ownerId, Map<String, Object> restaurantData) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        restaurantData.put("ownerId", ownerId);
        return restTemplate.postForObject(RESTAURANT_SERVICE_URL, restaurantData, Object.class);
    }
    
    public Object updateRestaurant(Long ownerId, Long restaurantId, Map<String, Object> restaurantData) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        validateOwnership(ownerId, restaurantId);
        // put for Map<>
        restaurantData.put("ownerId", ownerId);
        String url = RESTAURANT_SERVICE_URL + "/" + restaurantId;
        // put for restTemplate
        restTemplate.put(url, restaurantData);
        return "Restaurant updated successfully";
    }
    
    public Object deleteRestaurant(Long ownerId, Long restaurantId) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        validateOwnership(ownerId, restaurantId);
        String url = RESTAURANT_SERVICE_URL + "/" + restaurantId;
        restTemplate.delete(url);
        return "Restaurant deleted successfully";
    }
    
    public Object createMenuItem(Long ownerId, Long restaurantId, Map<String, Object> menuData) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        validateOwnership(ownerId, restaurantId);
        menuData.put("restaurantId", restaurantId);
        return restTemplate.postForObject(MENU_SERVICE_URL, menuData, Object.class);
    }
    
    public Object updateMenuItem(Long ownerId, Long restaurantId, String menuItemId, Map<String, Object> menuData) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        validateOwnership(ownerId, restaurantId);
        menuData.put("restaurantId", restaurantId);
        String url = MENU_SERVICE_URL + "/" + menuItemId;
        restTemplate.put(url, menuData);
        return "Menu item updated successfully";
    }
    
    public Object deleteMenuItem(Long ownerId, Long restaurantId, String menuItemId) {
        validateRole(ownerId, UserRole.BUSINESS_OWNER);
        validateOwnership(ownerId, restaurantId);
        String url = MENU_SERVICE_URL + "/" + menuItemId;
        restTemplate.delete(url);
        return "Menu item deleted successfully";
    }
    
    private void validateOwnership(Long ownerId, Long restaurantId) {
        Object[] userRestaurants = (Object[]) getRestaurantsByOwnerId(ownerId);
        boolean ownsRestaurant = Arrays.stream(userRestaurants)
                .anyMatch(restaurant -> {
                    Map<String, Object> restaurantMap = (Map<String, Object>) restaurant;
                    Object id = restaurantMap.get("id");
                    return id != null && id.toString().equals(restaurantId.toString());
                });
        if (!ownsRestaurant) {
            throw new RuntimeException("Access denied. You can only manage your own restaurants.");
        }
    }
    
    // ===== RIDER METHODS =====
    
    public Object getAllRestaurantsForDelivery(Long riderId) {
        validateRole(riderId, UserRole.RIDER);
        return getAllRestaurants();
    }
    
    // These methods should be handled by order/delivery service
    /*
    public Object updateDeliveryStatus(Long riderId, Long orderId, String status) {
        validateRole(riderId, UserRole.RIDER);
        // TODO: Implement when order service is available
        // For now, return a placeholder response
        return "Delivery status updated to: " + status + " for order: " + orderId;
    }
    
    public Object updateRiderLocation(Long riderId, Map<String, Object> locationData) {
        validateRole(riderId, UserRole.RIDER);
        // TODO: Implement rider location tracking
        // For now, return a placeholder response
        return "Rider location updated: " + locationData.toString();
    }
    
    public Object getDeliveryCustomerInfo(Long riderId, Long orderId) {
        validateRole(riderId, UserRole.RIDER);
        // TODO: Implement when order service is available
        // This should return limited customer info needed for delivery
        return "Customer delivery info for order: " + orderId;
    }
    */
    
    // ===== CUSTOMER METHODS =====
    
    // public Object getAllRestaurants(Long customerId) {
    //     validateRole(customerId, UserRole.CUSTOMER); (ignore)
    //     return getAllRestaurants();
    // }
    
    // public Object getRestaurantMenu(Long customerId, Long restaurantId) {
    //     validateRole(customerId, UserRole.CUSTOMER);  (ignore)
    //     try {
    //         String url = MENU_SERVICE_URL + "/restaurant/" + restaurantId;
    //         return restTemplate.getForObject(url, Object.class);
    //     } catch (Exception e) {
    //         throw new RuntimeException("Error getting restaurant menu: " + e.getMessage());
    //     }
    // }
    
    // These 4 methods should be handled by order service
    /*
    public Object placeOrder(Long customerId, Map<String, Object> orderData) {
        validateRole(customerId, UserRole.CUSTOMER);  <- ignore first 
        orderData.put("customerId", customerId);
        return "Order placed successfully: " + orderData.toString();
    }
    
    public Object getCustomerOrders(Long customerId) {
        validateRole(customerId, UserRole.CUSTOMER);
        return "Customer orders for user: " + customerId;
    }
    
    public Object getOrderDetails(Long customerId, Long orderId) {
        validateRole(customerId, UserRole.CUSTOMER);
        return "Order details for order: " + orderId + ", customer: " + customerId;
    }
    
    public Object cancelOrder(Long customerId, Long orderId) {
        validateRole(customerId, UserRole.CUSTOMER);
        return "Order cancelled: " + orderId + " for customer: " + customerId;
    }
    */
}