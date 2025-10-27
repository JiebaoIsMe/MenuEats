package com.user.shared.valueobjects;

import jakarta.persistence.Embeddable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ConversationId {
    private String value;

    protected ConversationId() {
        // JPA constructor
    }

    public ConversationId(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("ConversationId cannot be null or empty");
        }
        this.value = value;
    }

    public static ConversationId generate() {
        return new ConversationId(UUID.randomUUID().toString());
    }

    public static ConversationId fromParticipants(UserId userId1, UserId userId2) {
        // Create deterministic conversation ID from sorted user IDs
        Long id1 = userId1.getValue();
        Long id2 = userId2.getValue();
        String conversationKey = id1 < id2 ? id1 + "_" + id2 : id2 + "_" + id1;
        return new ConversationId("conv_" + conversationKey);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConversationId that = (ConversationId) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "ConversationId{" + value + '}';
    }
}