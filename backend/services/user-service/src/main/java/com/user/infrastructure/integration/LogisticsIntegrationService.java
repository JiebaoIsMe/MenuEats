package com.user.infrastructure.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LogisticsIntegrationService {
    
    private final RestTemplate restTemplate;
    
    @Value("${logistics.service.base-url:http://localhost:8083}")
    private String logisticsServiceBaseUrl;
    
    public LogisticsIntegrationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    // Create delivery tracking for an order
    public Map<String, Object> createDeliveryTracking(Long orderId) {
        try {
            String url = logisticsServiceBaseUrl + "/api/delivery/track";
            
            HttpHeaders headers = createHeaders();
            Map<String, Long> requestBody = Map.of("orderId", orderId);
            HttpEntity<Map<String, Long>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to create delivery tracking: " + e.getMessage());
            return null;
        }
    }
    
    // Get delivery tracking by order ID
    public Map<String, Object> getDeliveryTrackingByOrderId(Long orderId) {
        try {
            String url = logisticsServiceBaseUrl + "/api/delivery/track/order/" + orderId;
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to get delivery tracking: " + e.getMessage());
            return null;
        }
    }
    
    // Get rider's deliveries
    public List<Map<String, Object>> getRiderDeliveries(Long riderId) {
        try {
            String url = logisticsServiceBaseUrl + "/api/riders/" + riderId + "/deliveries";
            
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return (List<Map<String, Object>>) response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to get rider deliveries: " + e.getMessage());
            return List.of();
        }
    }
    
    // Get available riders
    public List<Map<String, Object>> getAvailableRiders() {
        try {
            String url = logisticsServiceBaseUrl + "/api/riders/available";
            
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return (List<Map<String, Object>>) response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to get available riders: " + e.getMessage());
            return List.of();
        }
    }
    
    // Update logistics status
    public Map<String, Object> updateLogisticsStatus(Long orderId, String status) {
        try {
            String url = logisticsServiceBaseUrl + "/api/delivery/track/order/" + orderId + "/status";
            
            HttpHeaders headers = createHeaders();
            Map<String, String> requestBody = Map.of("status", status);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to update logistics status: " + e.getMessage());
            return null;
        }
    }
    
    // Assign rider to order
    public Map<String, Object> assignRiderToOrder(Long orderId, Long riderId) {
        try {
            String url = logisticsServiceBaseUrl + "/api/delivery/assign-rider";
            
            HttpHeaders headers = createHeaders();
            Map<String, Long> requestBody = Map.of("orderId", orderId, "riderId", riderId);
            HttpEntity<Map<String, Long>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to assign rider: " + e.getMessage());
            return null;
        }
    }
    
    // Check logistics service health
    public boolean isLogisticsServiceAvailable() {
        try {
            String url = logisticsServiceBaseUrl + "/api/delivery/health";
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}