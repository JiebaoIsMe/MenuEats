package com.discovery.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.azure.search.AzureAiSearchEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("azure-ai-search")
public class AzureAiSearchConfig {

    @Value("${AZURE_AI_SEARCH_ENDPOINT}")
    private String azureAiSearchEndpoint;

    @Value("${AZURE_AI_SEARCH_KEY}")
    private String azureAiSearchKey;

    @Bean
    EmbeddingStore<TextSegment> embeddingStore() {
        return AzureAiSearchEmbeddingStore.builder()
                .endpoint(azureAiSearchEndpoint)
                .apiKey(azureAiSearchKey)
                .indexName("menueats-restaurants")
                .dimensions(1536) // Azure OpenAI text-embedding-3-small uses 1536 dimensions
                .build();
    }
}