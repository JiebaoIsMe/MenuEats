package com.user.infrastructure.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class RestaurantIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${restaurant-service.base-url:http://localhost:8081}")
    private String restaurantServiceBaseUrl;

    public RestaurantIntegrationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    // Get all restaurants
    public List<Map<String, Object>> getAllRestaurants() {
        try {
            String url = restaurantServiceBaseUrl + "/api/restaurants";
            
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to fetch all restaurants: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    // Get restaurant by ID
    public Map<String, Object> getRestaurantById(Long restaurantId) {
        try {
            String url = restaurantServiceBaseUrl + "/api/restaurants/" + restaurantId;
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to fetch restaurant " + restaurantId + ": " + e.getMessage());
            return null;
        }
    }

    // Get restaurants by owner ID
    public List<Map<String, Object>> getRestaurantsByOwnerId(Long ownerId) {
        try {
            List<Map<String, Object>> allRestaurants = getAllRestaurants();
            
            return allRestaurants.stream()
                .filter(restaurant -> {
                    Object ownerIdObj = restaurant.get("ownerId");
                    if (ownerIdObj instanceof Number) {
                        return ((Number) ownerIdObj).longValue() == ownerId;
                    }
                    return false;
                })
                .toList();
        } catch (Exception e) {
            System.err.println("Failed to fetch restaurants for owner " + ownerId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    // Get restaurant name by owner ID (first restaurant found)
    public String getRestaurantNameByOwnerId(Long ownerId) {
        try {
            List<Map<String, Object>> ownerRestaurants = getRestaurantsByOwnerId(ownerId);
            
            if (!ownerRestaurants.isEmpty()) {
                Object nameObj = ownerRestaurants.get(0).get("name");
                return nameObj != null ? nameObj.toString() : null;
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Failed to fetch restaurant name for owner " + ownerId + ": " + e.getMessage());
            return null;
        }
    }

    // Check restaurant service health
    public boolean isRestaurantServiceAvailable() {
        try {
            String url = restaurantServiceBaseUrl + "/actuator/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    // Get menu for restaurant
    public List<Map<String, Object>> getRestaurantMenu(Long restaurantId) {
        try {
            String url = restaurantServiceBaseUrl + "/api/restaurants/" + restaurantId + "/menu";
            
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to fetch menu for restaurant " + restaurantId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }
}