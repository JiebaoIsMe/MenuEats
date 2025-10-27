package com.user.infrastructure.messaging;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.function.Consumer;

@Configuration
public class EventProcessorConfiguration {

    @Bean
    public Consumer<Map<String, Object>> userEventProcessor() {
        return event -> {
            System.out.println("USER EVENT PROCESSED: " + event);
            // Here you would handle cross-context reactions to user events
            // For example, create messaging participant when user registers
        };
    }

    @Bean
    public Consumer<Map<String, Object>> messagingEventProcessor() {
        return event -> {
            System.out.println("MESSAGING EVENT PROCESSED: " + event);
            // Here you would handle reactions to messaging events
            // For example, update user activity status when message is sent
        };
    }

    @Bean
    public Consumer<Map<String, Object>> statusEventProcessor() {
        return event -> {
            System.out.println("STATUS EVENT PROCESSED: " + event);
            // Here you would handle reactions to status events
            // For example, notify connected users when someone comes online
        };
    }
}