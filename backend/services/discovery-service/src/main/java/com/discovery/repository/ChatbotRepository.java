package com.discovery.repository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;


@Repository
public class ChatbotRepository {

    // Connect via api layer, not directly
    // Connect to local restaurant h2
    private final String jdbcRestaurant = "jdbc:h2:file:./src/main/resources/restaurantdb";
    // Connect to local logistics h2
    private final String jdbcLogsitics = "jdbc:h2:file:./src/main/resources/logsiticsdb";


    // fetch all h2 docs
    public List<String> getAllDocuments() {
        List<String> documents = new ArrayList<>();
        documents.add("doc1");
        documents.add("doc2");
        documents.add("doc3");
        return documents;
    }
}
