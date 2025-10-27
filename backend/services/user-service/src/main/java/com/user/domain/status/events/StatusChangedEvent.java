package com.user.domain.status.events;

import com.user.shared.events.DomainEvent;
import com.user.shared.valueobjects.UserId;

public class StatusChangedEvent extends DomainEvent {
    private final UserId userId;
    private final String oldStatus;
    private final String newStatus;
    private final String platform;

    public StatusChangedEvent(UserId userId, String oldStatus, String newStatus, String platform) {
        super("StatusChangedEvent");
        this.userId = userId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.platform = platform;
    }

    public UserId getUserId() { return userId; }
    public String getOldStatus() { return oldStatus; }
    public String getNewStatus() { return newStatus; }
    public String getPlatform() { return platform; }
}