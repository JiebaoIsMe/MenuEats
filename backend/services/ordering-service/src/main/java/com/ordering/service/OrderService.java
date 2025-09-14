package com.ordering.service;

import com.ordering.dto.OrderRequest;
import com.ordering.model.Order;
import com.ordering.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Order createOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerId(orderRequest.customerId());
        order.setRestaurantId(orderRequest.restaurantId());
        order.setDeliveryAddress(orderRequest.deliveryAddress());
        order.setItems(orderRequest.items());

        order.calculateTotalAmount();

        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
}
