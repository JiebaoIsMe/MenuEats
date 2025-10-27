package com.user.shared.events;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DomainEventPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired(required = false)
    private StreamBridge streamBridge;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(DomainEvent event) {
        // Publish internally for same-service handlers
        applicationEventPublisher.publishEvent(event);
        
        // Publish to Kafka for cross-service communication
        publishToKafka(event);
    }

    private void publishToKafka(DomainEvent event) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("eventId", event.getEventId());
            eventData.put("eventType", event.getEventType());
            eventData.put("occurredOn", event.getOccurredOn().toString());
            eventData.put("data", event);

            String topicName = determineBindingForEvent(event.getEventType());
            System.out.println("Publishing event " + event.getEventType() + " to topic: " + topicName);
            
            // Try KafkaTemplate first (direct approach), fallback to StreamBridge
            if (kafkaTemplate != null) {
                kafkaTemplate.send(topicName, eventData);
                System.out.println("Event sent successfully via KafkaTemplate");
            } else if (streamBridge != null) {
                // StreamBridge.send() accepts Object as second parameter with these data types:
                // - String: Direct JSON string that gets sent as-is to Kafka
                // - Map<String, Object>: Automatically serialized to JSON by Spring Cloud Stream
                // - POJO/Domain Objects: Serialized to JSON using Jackson ObjectMapper
                // - byte[]: Raw bytes sent directly to Kafka without JSON conversion
                // - Message<?> wrapper: For advanced headers/metadata control
                // 
                // Spring Cloud Stream automatically handles JSON serialization for non-primitive types
                // The Kafka consumer will receive this as a JSON message on the topic
                boolean sent = streamBridge.send(topicName, eventData);
                System.out.println("Event sent successfully via StreamBridge: " + sent);
            } else {
                System.out.println("No Kafka publisher available - events will only be published locally");
            }
        } catch (Exception e) {
            System.err.println("Failed to publish event to Kafka: " + e.getMessage());
            e.printStackTrace();
            // Don't rethrow - let the message save succeed even if Kafka fails
        }
    }

    private String determineBindingForEvent(String eventType) {
        // Use the actual topic names from configuration, not the binding names
        if (eventType.startsWith("User")) {
            return "user-events";
        } else if (eventType.startsWith("Message") || eventType.startsWith("Conversation")) {
            return "messaging-events";
        } else if (eventType.startsWith("Status") || eventType.startsWith("Typing")) {
            return "status-events";
        }
        return "user-events"; // Default fallback
    }

    private String determineTopicForEvent(String eventType) {
        if (eventType.startsWith("User")) {
            return "userEvents-out-0";
        } else if (eventType.startsWith("Message") || eventType.startsWith("Conversation")) {
            return "messagingEvents-out-0";
        } else if (eventType.startsWith("Status") || eventType.startsWith("Typing")) {
            return "statusEvents-out-0";
        }
        return "userEvents-out-0"; // Default fallback
    }
}