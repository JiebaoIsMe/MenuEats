package com.user.infrastructure.web;

import com.user.domain.user.model.User;
import com.user.domain.user.model.UserRepository;
import com.user.domain.user.model.UserProfile;
import com.user.domain.user.model.UserProfileRepository;
import com.user.domain.user.service.UserDomainService;
import com.user.dto.CreateUserRequest;
import com.user.dto.UserResponse;
import com.user.dto.RestaurantResponse;
import com.user.dto.UserStatusResponse;
import com.user.domain.status.model.UserStatus;
import com.user.domain.status.model.UserStatusRepository;
import com.user.shared.valueobjects.UserId;
import com.user.shared.events.DomainEvent;
import com.user.shared.events.DomainEventPublisher;
import com.user.infrastructure.integration.RestaurantIntegrationService;
import com.user.infrastructure.integration.OrderIntegrationService;
import com.user.infrastructure.integration.LogisticsIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserDomainService userDomainService;
    
    @Autowired
    private DomainEventPublisher eventPublisher;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserStatusRepository userStatusRepository;

    @Autowired
    private RestaurantIntegrationService restaurantIntegrationService;

    @Autowired
    private OrderIntegrationService orderIntegrationService;

    @Autowired
    private LogisticsIntegrationService logisticsIntegrationService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/active")
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Try to find the user profile
                    UserProfile profile = userProfileRepository.findByUserId(id).orElse(null);
                    return ResponseEntity.ok(new UserResponse(user, profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/display-name")
    public ResponseEntity<Map<String, String>> getUserDisplayName(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            String displayName = user.getUsername();
            String role = user.getRole();

            // For business owners, try to get restaurant name using integration service
            if ("BUSINESS_OWNER".equals(role)) {
                String restaurantName = restaurantIntegrationService.getRestaurantNameByOwnerId(id);
                if (restaurantName != null && !restaurantName.trim().isEmpty()) {
                    displayName = restaurantName;
                }
            }

            Map<String, String> result = new HashMap<>();
            result.put("displayName", displayName);
            result.put("role", role);
            result.put("username", user.getUsername());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error getting display name for user " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{orderId}/participants")
    public ResponseEntity<Map<String, Object>> getOrderParticipants(@PathVariable Long orderId) {
        try {
            // Get order details using integration service
            var orderDetails = orderIntegrationService.getOrderById(orderId);
            if (orderDetails == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> participants = new HashMap<>();
            
            // Add customer info
            Long customerId = orderDetails.getCustomerId();
            if (customerId != null) {
                User customer = userRepository.findById(customerId).orElse(null);
                if (customer != null) {
                    Map<String, Object> customerInfo = new HashMap<>();
                    customerInfo.put("id", customerId);
                    customerInfo.put("displayName", customer.getUsername());
                    customerInfo.put("role", "CUSTOMER");
                    participants.put("customer", customerInfo);
                }
            }

            // Add restaurant owner info
            Long restaurantId = orderDetails.getRestaurantId();
            if (restaurantId != null) {
                var restaurantDetails = restaurantIntegrationService.getRestaurantById(restaurantId);
                if (restaurantDetails != null) {
                    Object ownerIdObj = restaurantDetails.get("ownerId");
                    if (ownerIdObj instanceof Number) {
                        Long ownerId = ((Number) ownerIdObj).longValue();
                        String restaurantName = restaurantDetails.get("name").toString();
                        
                        Map<String, Object> ownerInfo = new HashMap<>();
                        ownerInfo.put("id", ownerId);
                        ownerInfo.put("displayName", restaurantName);
                        ownerInfo.put("role", "BUSINESS_OWNER");
                        ownerInfo.put("restaurantId", restaurantId);
                        participants.put("restaurantOwner", ownerInfo);
                    }
                }
            }

            // Get assigned rider from logistics if order is ready for delivery
            String orderStatus = orderDetails.getStatus();
            if ("ASSIGNED_TO_RIDER".equals(orderStatus) || "OUT_FOR_DELIVERY".equals(orderStatus) || "DELIVERED".equals(orderStatus)) {
                // Try to get delivery tracking to find assigned rider
                var deliveryTracking = logisticsIntegrationService.getDeliveryTrackingByOrderId(orderId);
                if (deliveryTracking != null) {
                    Object riderIdObj = deliveryTracking.get("riderId");
                    if (riderIdObj instanceof Number) {
                        Long riderId = ((Number) riderIdObj).longValue();
                        User rider = userRepository.findById(riderId).orElse(null);
                        if (rider != null) {
                            Map<String, Object> riderInfo = new HashMap<>();
                            riderInfo.put("id", riderId);
                            riderInfo.put("displayName", rider.getUsername());
                            riderInfo.put("role", "RIDER");
                            participants.put("rider", riderInfo);
                        }
                    }
                }
            }

            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            System.err.println("Error getting order participants for order " + orderId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(new UserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(new UserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    public List<UserResponse> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        try {
            // Validate using domain service
            userDomainService.validateUserCreation(request.getUsername(), request.getEmail());
            
            User user = User.create(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getRole()
            );
            
            User savedUser = userRepository.save(user);
            
            // Generate domain event after user has been saved and has an ID
            savedUser.registerUserCreatedEvent();
            
            // Create user profile if profile information is provided
            if (request.getFirstName() != null || request.getLastName() != null) {
                UserProfile profile = new UserProfile(
                    savedUser.getId(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getPhone(),
                    request.getAddress()
                );
                profile.setCity(request.getCity());
                userProfileRepository.save(profile);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new UserResponse(savedUser));
        } catch (Exception e) {
            // e.printStackTrace(); // Debug line commented out after successful testing
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest request) {
        try {
            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate using domain service
            userDomainService.validateUserUpdate(existingUser, request.getUsername(), request.getEmail());
            
            // updateProfile expects (firstName, lastName, phone, address)
            // For basic user updates, we'll set the fields directly or use setters
            existingUser.setUsername(request.getUsername());
            existingUser.setEmail(request.getEmail());
            existingUser.setRole(request.getRole());
            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(new UserResponse(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // =============================================================================
    // USER STATUS ENDPOINTS - STATUS MANAGEMENT
    // =============================================================================
    
    @PutMapping("/{userId}/status")
    public ResponseEntity<UserStatusResponse> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String platform = request.get("platform");
            
            UserStatus userStatus = userStatusRepository.findById(userId)
                .orElse(UserStatus.create(new UserId(userId), "OFFLINE", platform));
                
            userStatus.updateStatus(status);
            userStatus.setPlatform(platform);
            
            UserStatus savedStatus = userStatusRepository.save(userStatus);
            return ResponseEntity.ok(new UserStatusResponse(savedStatus));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{userId}/status")
    public ResponseEntity<UserStatusResponse> getUserStatus(@PathVariable Long userId) {
        try {
            UserStatus userStatus = userStatusRepository.findById(userId)
                .orElse(UserStatus.create(new UserId(userId), "OFFLINE", "UNKNOWN"));
                
            return ResponseEntity.ok(new UserStatusResponse(userStatus));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @PostMapping("/{userId}/typing/{targetUserId}")
    public ResponseEntity<UserStatusResponse> setTyping(@PathVariable Long userId, @PathVariable Long targetUserId) {
        try {
            UserStatus userStatus = userStatusRepository.findById(userId)
                .orElse(UserStatus.create(new UserId(userId), "OFFLINE", "WEB"));
                
            userStatus.setTyping(new UserId(targetUserId));
            UserStatus savedStatus = userStatusRepository.save(userStatus);
            
            return ResponseEntity.ok(new UserStatusResponse(savedStatus));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{userId}/typing")
    public ResponseEntity<UserStatusResponse> stopTyping(@PathVariable Long userId) {
        try {
            UserStatus userStatus = userStatusRepository.findById(userId)
                .orElse(UserStatus.create(new UserId(userId), "ONLINE", "WEB"));
                
            userStatus.stopTyping();
            UserStatus savedStatus = userStatusRepository.save(userStatus);
            
            return ResponseEntity.ok(new UserStatusResponse(savedStatus));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // =============================================================================
    // RESTAURANT INTEGRATION ENDPOINTS - CROSS-SERVICE COMMUNICATION  
    // =============================================================================
    
    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        try {
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants", String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            List<RestaurantResponse> restaurants = new ArrayList<>();
            for (JsonNode restaurant : jsonNode) {
                RestaurantResponse restaurantResponse = new RestaurantResponse(
                    restaurant.get("id").asLong(),
                    restaurant.get("name").asText(),
                    restaurant.get("location").asText(),
                    restaurant.get("ownerId").asLong(),
                    restaurant.has("menuId") ? restaurant.get("menuId").asLong() : 0
                );
                restaurants.add(restaurantResponse);
            }
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable Long id) {
        try {
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + id, String.class);
            JsonNode restaurant = objectMapper.readTree(response);
            
            RestaurantResponse restaurantResponse = new RestaurantResponse(
                restaurant.get("id").asLong(),
                restaurant.get("name").asText(),
                restaurant.get("location").asText(),
                restaurant.get("ownerId").asLong(),
                restaurant.has("menuId") ? restaurant.get("menuId").asLong() : 0
            );
            return ResponseEntity.ok(restaurantResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/restaurants/name/{name}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByName(@PathVariable String name) {
        try {
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants", String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            List<RestaurantResponse> restaurants = new ArrayList<>();
            for (JsonNode restaurant : jsonNode) {
                String restaurantName = restaurant.get("name").asText();
                if (restaurantName.toLowerCase().contains(name.toLowerCase())) {
                    RestaurantResponse restaurantResponse = new RestaurantResponse(
                        restaurant.get("id").asLong(),
                        restaurantName,
                        restaurant.get("location").asText(),
                        restaurant.get("ownerId").asLong(),
                        restaurant.has("menuId") ? restaurant.get("menuId").asLong() : 0
                    );
                    restaurants.add(restaurantResponse);
                }
            }
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // RESTAURANT CRU OPERATIONS - BUSINESS OWNER ONLY
    // =============================================================================

    @PostMapping("/{ownerId}/restaurants")
    public ResponseEntity<?> createRestaurant(@PathVariable Long ownerId, @RequestBody Map<String, Object> request) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Map<String, Object> restaurantData = new HashMap<>(request);
            restaurantData.put("ownerId", ownerId);
            String response = restTemplate.postForObject("http://localhost:8081/api/restaurants", restaurantData, String.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{ownerId}/restaurants")
    public ResponseEntity<?> getOwnerRestaurants(@PathVariable Long ownerId) {
        try {
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants", String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            List<JsonNode> ownerRestaurants = new ArrayList<>();
            for (JsonNode restaurant : jsonNode) {
                if (restaurant.get("ownerId").asLong() == ownerId) {
                    ownerRestaurants.add(restaurant);
                }
            }
            return ResponseEntity.ok(ownerRestaurants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{ownerId}/restaurants/{restaurantId}")
    public ResponseEntity<?> updateRestaurant(@PathVariable Long ownerId, @PathVariable Long restaurantId, @RequestBody Map<String, Object> request) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode existingRestaurant = objectMapper.readTree(getResponse);
            if (existingRestaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Map<String, Object> restaurantData = new HashMap<>(request);
            restaurantData.put("ownerId", ownerId);
            restTemplate.put("http://localhost:8081/api/restaurants/" + restaurantId, restaurantData);
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // MENU ITEM CRU OPERATIONS - BUSINESS OWNER ONLY
    // =============================================================================

    @GetMapping("/{ownerId}/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> getMenuItems(@PathVariable Long ownerId, @PathVariable Long restaurantId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId + "/menu", String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{ownerId}/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> createMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @RequestBody Map<String, Object> request) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Map<String, Object> menuData = new HashMap<>(request);
            menuData.put("restaurantId", restaurantId);
            String response = restTemplate.postForObject("http://localhost:8081/api/restaurant/menu", menuData, String.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{ownerId}/restaurants/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable String menuItemId, @RequestBody Map<String, Object> request) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Map<String, Object> menuData = new HashMap<>(request);
            menuData.put("restaurantId", restaurantId);
            restTemplate.put("http://localhost:8081/api/restaurant/menu/" + menuItemId, menuData);
            String response = restTemplate.getForObject("http://localhost:8081/api/menu/" + menuItemId, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{ownerId}/restaurants/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable String menuItemId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            restTemplate.delete("http://localhost:8081/api/restaurant/menu/" + menuItemId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // ORDER MANAGEMENT - BUSINESS OWNER ACCEPT/REJECT
    // =============================================================================

    @GetMapping("/{ownerId}/restaurants/{restaurantId}/orders")
    public ResponseEntity<?> getRestaurantOrders(@PathVariable Long ownerId, @PathVariable Long restaurantId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // Proxy to ordering service for restaurant orders
            String response = restTemplate.getForObject("http://localhost:8082/api/orders/restaurant/" + restaurantId, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{ownerId}/orders")
    public ResponseEntity<?> getAllOwnerOrders(@PathVariable Long ownerId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Get all restaurants owned by this user using existing internal logic
            List<RestaurantResponse> restaurants = getRestaurantsForOwner(ownerId);
            
            // Collect all orders from all owned restaurants
            List<JsonNode> allOrders = new ArrayList<>();
            for (RestaurantResponse restaurant : restaurants) {
                Long restaurantId = restaurant.getId();
                try {
                    String ordersResponse = restTemplate.getForObject("http://localhost:8082/api/orders/restaurant/" + restaurantId, String.class);
                    JsonNode orders = objectMapper.readTree(ordersResponse);
                    for (JsonNode order : orders) {
                        allOrders.add(order);
                    }
                } catch (Exception e) {
                    // Continue with other restaurants if one fails
                    System.err.println("Failed to get orders for restaurant " + restaurantId + ": " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(allOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper method to get restaurants for owner (reusing existing logic)
    private List<RestaurantResponse> getRestaurantsForOwner(Long ownerId) {
        try {
            String response = restTemplate.getForObject("http://localhost:8081/api/restaurants", String.class);
            JsonNode restaurantsArray = objectMapper.readTree(response);
            
            List<RestaurantResponse> ownerRestaurants = new ArrayList<>();
            for (JsonNode restaurantNode : restaurantsArray) {
                if (restaurantNode.get("ownerId").asLong() == ownerId) {
                    RestaurantResponse restaurant = new RestaurantResponse();
                    restaurant.setId(restaurantNode.get("id").asLong());
                    restaurant.setName(restaurantNode.get("name").asText());
                    restaurant.setLocation(restaurantNode.get("location").asText());
                    restaurant.setOwnerId(restaurantNode.get("ownerId").asLong());
                    ownerRestaurants.add(restaurant);
                }
            }
            return ownerRestaurants;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @PostMapping("/{ownerId}/restaurants/{restaurantId}/orders/{orderId}/accept")
    public ResponseEntity<?> acceptOrder(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable Long orderId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String response = restTemplate.postForObject("http://localhost:8082/api/orders/" + orderId + "/accept", null, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{ownerId}/restaurants/{restaurantId}/orders/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long ownerId, @PathVariable Long restaurantId, @PathVariable Long orderId) {
        try {
            User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!"BUSINESS_OWNER".equals(owner.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String getResponse = restTemplate.getForObject("http://localhost:8081/api/restaurants/" + restaurantId, String.class);
            JsonNode restaurant = objectMapper.readTree(getResponse);
            if (restaurant.get("ownerId").asLong() != ownerId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String response = restTemplate.postForObject("http://localhost:8082/api/orders/" + orderId + "/reject", null, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // RIDER ACCESS ENDPOINTS - COMMENTED OUT FOR NOW
    // =============================================================================

    // @GetMapping("/{riderId}/delivery/restaurants")
    // public ResponseEntity<?> getRiderRestaurants(@PathVariable Long riderId) {
    //     try {
    //         User rider = userRepository.findById(riderId).orElseThrow(() -> new RuntimeException("User not found"));
    //         if (!"RIDER".equals(rider.getRole())) {
    //             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //         }
    //         String response = restTemplate.getForObject("http://localhost:8081/api/restaurants", String.class);
    //         return ResponseEntity.ok(objectMapper.readTree(response));
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //     }
    // }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> statusUpdate) {
        try {
            // Proxy to ordering service for updating order status
            String url = "http://localhost:8082/api/orders/" + orderId + "/status";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(statusUpdate, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PATCH, request, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response.getBody()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            // Proxy to ordering service for getting orders by status
            String url = "http://localhost:8082/api/orders/status/" + status;
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/orders/{orderId}/assign-rider")
    public ResponseEntity<?> assignRiderToOrder(@PathVariable Long orderId, @RequestBody Map<String, Long> riderAssignment) {
        try {
            // Proxy to ordering service for assigning rider to order
            String url = "http://localhost:8082/api/orders/" + orderId + "/assign-rider";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Long>> request = new HttpEntity<>(riderAssignment, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response.getBody()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // LOGISTICS SERVICE PROXY ENDPOINTS - RIDER DELIVERY MANAGEMENT
    // =============================================================================

    @GetMapping("/logistics/riders/{riderId}/deliveries")
    public ResponseEntity<?> getRiderDeliveries(@PathVariable Long riderId) {
        try {
            // Proxy to logistics service for rider deliveries
            String url = "http://localhost:8083/api/logistics/riders/" + riderId + "/deliveries";
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user-orders/{orderId}")
    public ResponseEntity<?> getUserOrder(@PathVariable Long orderId) {
        try {
            // Proxy to ordering service for order details
            String url = "http://localhost:8082/api/orders/" + orderId;
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}