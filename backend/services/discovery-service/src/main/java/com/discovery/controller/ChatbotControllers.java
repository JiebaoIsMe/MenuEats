package com.discovery.controller;

import com.discovery.service.ChatbotService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin
public class ChatbotControllers {
    
    @Autowired
    private ChatbotService chatbotService;

    // test connection
    @GetMapping("/test")
    public String test() {
        return "test";
    }
        
    // Get all restaurants from restaurant service with their menu
    @GetMapping("/restaurants_with_menu")
    public ResponseEntity<?> getAllRestaurantsWithMenu() {
        try {
            Object restaurants = chatbotService.getAllRestaurantsWithMenu();
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling restaurant service: " + e.getMessage());
        }
    }
    
    // Initialize RAG with restaurant data
    @PostMapping("/rag/initialize")
    public ResponseEntity<?> initializeRAG() {
        try {
            // Populates vector database with restaurant data
            chatbotService.indexRestaurantData();
            return ResponseEntity.ok("RAG system initialized successfully with restaurant data");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error initializing RAG: " + e.getMessage());
        }
    }
    
    // RAG chat endpoint
    @PostMapping("/rag/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Query is required");
            }
            
            String response = chatbotService.answer(query);
            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing chat: " + e.getMessage());
        }
    }
}
