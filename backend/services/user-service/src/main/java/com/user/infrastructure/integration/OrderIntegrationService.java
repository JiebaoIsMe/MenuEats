package com.user.infrastructure.integration;

import com.user.dto.OrderDTO;
import com.user.dto.OrderItemDTO;
import com.user.domain.messaging.model.Message;
import com.user.domain.messaging.service.MessagingDomainService;
import com.user.shared.valueobjects.UserId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderIntegrationService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private MessagingDomainService messagingDomainService;

    @Value("${ordering-service.base-url:http://localhost:8082}")
    private String orderingServiceBaseUrl;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    public OrderDTO createOrder(Map<String, Object> orderData) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders";
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(orderData, createHeaders());
            
            ResponseEntity<OrderDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                OrderDTO.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to create order: " + e.getMessage());
            return null;
        }
    }

    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/customer/" + customerId;
            
            ResponseEntity<List<OrderDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<List<OrderDTO>>() {}
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            // Log the error and return empty list for graceful degradation
            System.err.println("Failed to fetch orders for customer " + customerId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public OrderDTO getOrderById(Long orderId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId;
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                Map.class
            );
            
            Map<String, Object> orderData = response.getBody();
            if (orderData == null) {
                return null;
            }
            
            // Convert to OrderDTO
            OrderDTO orderDTO = new OrderDTO();
            orderDTO.setId(Long.valueOf(orderData.get("id").toString()));
            orderDTO.setCustomerId(Long.valueOf(orderData.get("customerId").toString()));
            orderDTO.setRestaurantId(Long.valueOf(orderData.get("restaurantId").toString()));
            orderDTO.setTotalAmount(new java.math.BigDecimal(orderData.get("totalAmount").toString()));
            orderDTO.setStatus(orderData.get("status").toString());
            orderDTO.setCreatedAt(orderData.get("createdAt").toString());
            orderDTO.setDeliveryAddress(orderData.get("deliveryAddress").toString());
            
            // Convert items
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");
            List<OrderItemDTO> items = new java.util.ArrayList<>();
            
            if (itemsData != null) {
                for (Map<String, Object> itemData : itemsData) {
                    OrderItemDTO item = new OrderItemDTO();
                    item.setMenuItemId(itemData.get("menuItemId").toString());
                    item.setMenuItemName(itemData.get("menuItemName").toString());
                    item.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
                    item.setPrice(new java.math.BigDecimal(itemData.get("price").toString()));
                    items.add(item);
                }
            }
            orderDTO.setItems(items);
            
            return orderDTO;
        } catch (RestClientException e) {
            System.err.println("Failed to fetch order " + orderId + ": " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Failed to convert order data " + orderId + ": " + e.getMessage());
            return null;
        }
    }

    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId + "/status";
            
            Map<String, String> statusUpdate = new HashMap<>();
            statusUpdate.put("status", newStatus);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(statusUpdate, createHeaders());
            
            ResponseEntity<OrderDTO> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                request,
                OrderDTO.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to update order status for order " + orderId + ": " + e.getMessage());
            return null;
        }
    }

    public OrderDTO cancelOrder(Long orderId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId;
            
            ResponseEntity<OrderDTO> response = restTemplate.exchange(
                url,
                HttpMethod.DELETE,
                new HttpEntity<>(createHeaders()),
                OrderDTO.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to cancel order " + orderId + ": " + e.getMessage());
            return null;
        }
    }

    // Helper method to check if ordering service is available
    public boolean isOrderingServiceAvailable() {
        try {
            // Simple health check - try to access a lightweight endpoint
            String url = orderingServiceBaseUrl + "/actuator/health";
            restTemplate.getForEntity(url, String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public OrderDTO acceptOrder(Long orderId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId + "/accept";
            
            ResponseEntity<OrderDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(createHeaders()),
                OrderDTO.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to accept order " + orderId + ": " + e.getMessage());
            return null;
        }
    }

    public List<OrderDTO> getOrdersByStatus(String status) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/status/" + status;
            
            ResponseEntity<List<OrderDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<List<OrderDTO>>() {}
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to fetch orders with status " + status + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public OrderDTO assignRiderToOrder(Long orderId, Long riderId) {
        try {
            String url = orderingServiceBaseUrl + "/api/orders/" + orderId + "/assign-rider";
            
            Map<String, Long> requestBody = Map.of("riderId", riderId);
            
            ResponseEntity<OrderDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(requestBody, createHeaders()),
                OrderDTO.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("Failed to assign rider " + riderId + " to order " + orderId + ": " + e.getMessage());
            return null;
        }
    }

    public OrderDTO markOrderAsDelivered(Long orderId) {
        try {
            // Use the existing updateOrderStatus method which already handles PATCH correctly
            return updateOrderStatus(orderId, "DELIVERED");
        } catch (Exception e) {
            System.err.println("Failed to mark order " + orderId + " as delivered: " + e.getMessage());
            return null;
        }
    }

    public Message createOrderConfirmationMessage(Long restaurantOwnerId, Long customerId, Long orderId) {
        System.out.println("[OrderIntegrationService] Creating order confirmation message for order: " + orderId);
        
        return messagingDomainService.sendMessage(
            new UserId(restaurantOwnerId),
            new UserId(customerId),
            "Hey, thank you for your ordering! We've confirmed your order and will start preparing it shortly.",
            "ORDER_CONFIRMATION",
            orderId
        );
    }
}