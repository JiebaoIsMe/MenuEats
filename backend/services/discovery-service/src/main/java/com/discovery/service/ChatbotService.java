package com.discovery.service;

import com.discovery.repository.ChatbotRepository;
// replaced by autowire
// import com.discovery.service.EmbeddingService;

import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// replaced by autowire
// import dev.langchain4j.model.ollama.OllamaChatModel;
// import dev.langchain4j.memory.ChatMemory;
// import dev.langchain4j.store.embedding.EmbeddingStore;v


import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;


import dev.langchain4j.model.chat.ChatModel;

@Service
public class ChatbotService {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private EmbeddingService embeddingService;
    
    @Autowired
    private ChatModel chatModel;

    // Get all restaurants including their menu
    public Object getAllRestaurantsWithMenu(){
        try {
            String restaurantServiceUrl = "http://localhost:8081/api/restaurants";
            
            // Get all restaurants: List<Map<String,Object>>
            List<Map<String,Object>> restaurants = restTemplate.getForObject(restaurantServiceUrl, List.class);
            // Storage for combined results: List<Map<String,Object>>
            List<Map<String,Object>> restaurantsWithMenu = new ArrayList<>();

            // Loop through each restaurant: Map<String, Object>
            for (Map<String, Object> restaurant: restaurants){
                // Extract restaurant name: String
                String restaurantName = (String) restaurant.get("name");
                // Build menu URL: String
                String menuUrl = "http://localhost:8081/api/restaurant/" + restaurantName + "/menu";
                // Fetch menu items: List<Map<String, Object>>
                List<Map<String, Object>> menu_items = restTemplate.getForObject(menuUrl, List.class);
                
                // Create combined structure: Map<String,Object>
                Map<String,Object> restaurantWithMenuItems = new HashMap<>();
                restaurantWithMenuItems.put("restaurant", restaurant);
                restaurantWithMenuItems.put("menuItems", menu_items);
                // Add to results
                restaurantsWithMenu.add(restaurantWithMenuItems);
            }

            // Return the combined data structure for RAG processing
            return restaurantsWithMenu;

        } catch (Exception e) {
            throw new RuntimeException("Error calling restaurant service: " 
            + e.getMessage());
        }
    }

    // ChatModel bean is injected via @Autowired above  

    // Load docs and index embeddings
    private final ChatbotRepository repository = new ChatbotRepository();
    List<String> docs = repository.getAllDocuments();
    // call embeddings service here

    // Convert restaurant+menu data to text for RAG embeddings: List<String>
    public List<String> convertToText(Object restaurantsData) {
        // Storage for text sentences: List<String>
        List<String> textChunks = new ArrayList<>();
        
        // Cast restaurantsData to List<Map<String,Object>>
        List<Map<String, Object>> restaurants = (List<Map<String,Object>>) restaurantsData;
        
        // Loop through each restaurant data: Map<String,Object>
        for (Map<String, Object> data : restaurants){
            // Extract restaurant info: Map<String,Object>
            Map<String,Object> restaurant = (Map<String, Object>) data.get("restaurant");
            String restaurantName = (String) restaurant.get("name");
            String location = (String) restaurant.get("location");
            
            // Extract menu items: List<Map<String,Object>>
            List<Map<String, Object>> menuItems = (List<Map<String, Object>>) data.get("menuItems");
            
            // 1. Create restaurant overview embeddings
            String restaurantOverview = restaurantName + " is a restaurant located at " + location + 
                                      ". This restaurant offers dining services with various menu options including " +
                                      "entrees, main dishes, desserts, and drinks.";
            textChunks.add(restaurantOverview);
            
            // 2. Group menu items by category for embeddings
            Map<String, List<String>> categoryGroups = new HashMap<>();
            
            for (Map<String, Object> item : menuItems) {
                String itemName = (String) item.get("name");
                String description = (String) item.get("description");
                String category = (String) item.get("category");
                Object available = item.get("available");
                
                // Skip unavailable items
                if (available != null && !(Boolean) available) {
                    continue;
                }
                
                // Group items by category
                categoryGroups.computeIfAbsent(category, k -> new ArrayList<>())
                             .add(itemName + " (" + description + ")");
            }
            
            // 3. Create category-based embeddings
            for (Map.Entry<String, List<String>> categoryEntry : categoryGroups.entrySet()) {
                String category = categoryEntry.getKey();
                List<String> items = categoryEntry.getValue();
                
                String categoryText = restaurantName + " " + category + " menu includes: " + 
                                    String.join(", ", items) + 
                                    ". Restaurant location: " + location;
                textChunks.add(categoryText);
            }
        }
        
        return textChunks;
    }

    public void indexRestaurantData(){
        // Data flow: JSON → Text → Vectors → Vector Database
        try {
            //Fetch restaurant + menu data (JSON)
            Object restaurantData = getAllRestaurantsWithMenu();
            // Convert to readable text (Text)
            List<String> textChunks = convertToText(restaurantData);
            // Store as embeddings (Vectors -> Vector Database)
            embeddingService.indexDocuments(textChunks);
            // Test output
            System.out.println("Indexed" + textChunks.size() + "restaurant items");
        } catch (Exception e) {
            throw new RuntimeException("Error Indexing restaurant data:" + e.getMessage());
        }
    }
    // RAG: retrieve context + handle user prompts
    public String answer(String user_prompts){
        try {
            //Find relevant restauran info
            List<String> relevantDocs = embeddingService.retrieveRelevant(user_prompts, 10);
            
            // Check if we found relevant information
            if (relevantDocs.isEmpty() || relevantDocs.stream().allMatch(String::isEmpty)) {
                return "I apologize, but I couldn't find relevant restaurant information for your query. Please try asking about specific restaurants, menu items, cuisines, or food categories that might be available in our database.";
            }
            
            //Combine context
            String context = String.join("\n", relevantDocs);
            
            // Optimized system prompt for clean point form responses
            String prompt = "You are a helpful restaurant assistant. Based on the following restaurant and menu information, provide a clear response to the user's question.\n\n" +
                          "Restaurant Information:\n" + context + 
                          "\n\nUser Question: " + user_prompts + 
                          "\n\nInstructions:\n" +
                          "- Start with restaurant name in bold format: **Restaurant Name** - Location\n" +
                          "- Follow with menu items using dashes (-) at the start of each line\n" +
                          "- Format each menu item as: - Item Name: Description\n" +
                          "- DO NOT include item codes or prices unless user specifically asks for pricing\n" +
                          "- Add a blank line between different restaurants\n" +
                          "- Keep descriptions brief and informative\n" +
                          "- If you cannot find relevant information, respond with: 'I apologize, but I don't have information about that specific request in our current restaurant database.'\n" +
                          "- Be conversational and helpful in your tone\n\n" +
                          "Response:";
            
            // Generate response using injected ChatModel: String
            return chatModel.chat(prompt);
            
        } catch (Exception e) {
            return "I apologize, but I'm currently unable to process your request. Please try again in a moment or contact support if the issue persists.";
        }
    }

}
