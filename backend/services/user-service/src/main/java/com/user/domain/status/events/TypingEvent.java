package com.user.domain.status.events;

import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.UserId;

public class TypingEvent extends DomainEvent {
    private final UserId userId;
    private final UserId targetUserId;
    private final boolean isTyping;

    public TypingEvent(UserId userId, UserId targetUserId, boolean isTyping) {
        super("TypingEvent");
        this.userId = userId;
        this.targetUserId = targetUserId;
        this.isTyping = isTyping;
    }

    public UserId getUserId() { return userId; }
    public UserId getTargetUserId() { return targetUserId; }
    public boolean isTyping() { return isTyping; }
}