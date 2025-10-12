package com.discovery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.client.RestTemplate;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.azure.AzureOpenAiEmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

@Configuration
public class ChatbotConfig {
    
    // Define API KEYs
    static{
        System.setProperty(
            "OLLAMA_API_KEY", 
            "f678e8ddfdfd46ad9a894ee8df39b68d.lOsmVzJq96cCY7q-QQaa3C-9");
        
        // Set Azure OpenAI properties
        System.setProperty("AZURE_OPENAI_ENDPOINT", "https://menueats.openai.azure.com/");
        System.setProperty("AZURE_OPENAI_KEY", "DUVfaeHCnQXLmXnLcnBusfGN2KK93gHRIxZGvyfmWI0mkTymJjLRJQQJ99BJACL93NaXJ3w3AAABACOGNOAU");
        
        // Set Azure AI Search properties
        System.setProperty("AZURE_AI_SEARCH_ENDPOINT", "https://menueats.search.windows.net/");
        System.setProperty("AZURE_AI_SEARCH_KEY", "gwUAoZs7dw7lqv9NgSZC2RdmrJ5tAXNrUIw0Q3awBiAzSeC5BLFu");
    }

    @Value("${AZURE_OPENAI_ENDPOINT}")
    private String azureOpenAiEndpoint;

    @Value("${AZURE_OPENAI_KEY}")
    private String azureOpenAiKey;
    
    
    @Bean
    ChatModel OllamaChatModel() {
        return OllamaChatModel.builder()
            .baseUrl("https://ollama.com")
            .modelName("gpt-oss:120b")
            .customHeaders(Map.of("Authorization", "Bearer f678e8ddfdfd46ad9a894ee8df39b68d.lOsmVzJq96cCY7q-QQaa3C-9"))
            .logRequests(true)
            .logResponses(true)
            .build();
    }
    
    @Bean
    @Profile("azure-ai-search")
    EmbeddingModel azureOpenAiEmbeddingModel() {
        // Original Azure-specific approach (commented for future revert):
        /*return AzureOpenAiEmbeddingModel.builder()
                .apiKey(azureOpenAiKey)
                .endpoint(azureOpenAiEndpoint)
                .deploymentName("text-embedding-3-small")
                .logRequestsAndResponses(true)
                .build();*/
        
        // Using Azure OpenAI embedding model:
        return AzureOpenAiEmbeddingModel.builder()
                .apiKey(azureOpenAiKey)
                .endpoint(azureOpenAiEndpoint)
                .deploymentName("text-embedding-3-small")
                .logRequestsAndResponses(true)
                .build();
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
