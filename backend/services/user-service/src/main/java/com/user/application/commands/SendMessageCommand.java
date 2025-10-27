package com.user.application.commands;

public class SendMessageCommand {
    private final Long senderId;
    private final Long receiverId;
    private final String content;
    private final String messageType;
    private final Long orderId;

    public SendMessageCommand(Long senderId, Long receiverId, String content, String messageType, Long orderId) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.messageType = messageType;
        this.orderId = orderId;
    }

    public Long getSenderId() { return senderId; }
    public Long getReceiverId() { return receiverId; }
    public String getContent() { return content; }
    public String getMessageType() { return messageType; }
    public Long getOrderId() { return orderId; }
}