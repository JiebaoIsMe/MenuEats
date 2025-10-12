package com.discovery.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    @Autowired
    public EmbeddingService(EmbeddingModel embeddingModel, EmbeddingStore<TextSegment> embeddingStore) {
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        System.out.println("EmbeddingService initialized with Elasticsearch vector store");
    }
    
    // Index text documents with vector embeddings in Elasticsearch
    public void indexDocuments(List<String> texts) throws RuntimeException {
        try {
            // Convert texts to TextSegments
            List<TextSegment> segments = texts.stream()
                .map(TextSegment::from)
                .collect(Collectors.toList());
            
            // Generate embeddings for all text segments
            List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
            
            // Store embeddings with their text segments in Elasticsearch
            embeddingStore.addAll(embeddings, segments);
            
            System.out.println("Successfully indexed " + texts.size() + " documents with vector embeddings in Elasticsearch");
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate vector embeddings: " + e.getMessage(), e);
        }
    }

    // Vector similarity-based retrieval using Elasticsearch
    public List<String> retrieveRelevant(String query, int maxResults) throws RuntimeException {
        try {
            // Generate embedding for the query
            Embedding queryEmbedding = embeddingModel.embed(query).content();
            
            // Create search request with the query embedding and max results
            EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(maxResults)
                .build();
            
            // Find most similar documents using vector similarity in Elasticsearch
            EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(searchRequest);
            List<EmbeddingMatch<TextSegment>> matches = searchResult.matches();
            
            if (matches.isEmpty()) {
                throw new RuntimeException("No relevant documents found for query: " + query);
            }
            
            // Extract text content from matches
            List<String> results = matches.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.toList());
            
            System.out.println("Found " + results.size() + " documents using Elasticsearch vector similarity");
            return results;
            
        } catch (Exception e) {
            throw new RuntimeException("Elasticsearch vector search failed: " + e.getMessage(), e);
        }
    }
}