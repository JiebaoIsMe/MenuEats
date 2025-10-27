package com.user.shared.valueobjects;

import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class MessageId {
    private Long value;

    protected MessageId() {
        // JPA constructor
    }

    public MessageId(Long value) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException("MessageId must be a positive number");
        }
        this.value = value;
    }

    public Long getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageId messageId = (MessageId) o;
        return Objects.equals(value, messageId.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "MessageId{" + value + '}';
    }
}