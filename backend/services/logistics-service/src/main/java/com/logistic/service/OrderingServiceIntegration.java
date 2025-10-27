package com.logistic.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OrderingServiceIntegration {
    
    private final RestTemplate restTemplate;
    
    @Value("${ordering.service.base-url:http://localhost:8082}")
    private String orderingServiceBaseUrl;
    
    public OrderingServiceIntegration() {
        this.restTemplate = new RestTemplate();
    }
    
    public boolean updateOrderStatus(Long orderId, String status) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId + "/status";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = Map.of("status", status);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, 
                    HttpMethod.PATCH, 
                    request, 
                    String.class
            );
            
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("Failed to update order status in ordering-service: " + e.getMessage());
            return false;
        }
    }
    
    public boolean isOrderReadyForPickup(Long orderId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId;
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String status = (String) response.getBody().get("status");
                return "READY_FOR_PICKUP".equals(status);
            }
            return false;
        } catch (Exception e) {
            System.err.println("Failed to check order status: " + e.getMessage());
            return false;
        }
    }
}