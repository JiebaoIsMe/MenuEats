package com.user.domain.messaging.events;

import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.ConversationId;
import com.user.shared.valueobjects.UserId;

import java.util.Set;

public class ConversationStartedEvent extends DomainEvent {
    private final ConversationId conversationId;
    private final Set<UserId> participants;
    private final UserId initiatedBy;

    public ConversationStartedEvent(ConversationId conversationId, Set<UserId> participants, UserId initiatedBy) {
        super("ConversationStartedEvent");
        this.conversationId = conversationId;
        this.participants = participants;
        this.initiatedBy = initiatedBy;
    }

    public ConversationId getConversationId() {
        return conversationId;
    }

    public Set<UserId> getParticipants() {
        return participants;
    }

    public UserId getInitiatedBy() {
        return initiatedBy;
    }

    @Override
    public String toString() {
        return "ConversationStartedEvent{" +
                "conversationId=" + conversationId +
                ", participants=" + participants +
                ", initiatedBy=" + initiatedBy +
                "} " + super.toString();
    }
}