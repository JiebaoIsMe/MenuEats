package com.user.application.handlers;

import com.user.application.commands.SendMessageCommand;
import com.user.domain.messaging.model.Message;
import com.user.domain.messaging.service.MessagingDomainService;
import com.user.domain.user.model.UserRepository;
import com.user.shared.valueobjects.UserId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageCommandHandler {

    @Autowired
    private MessagingDomainService messagingDomainService;

    @Autowired
    private UserRepository userRepository;

    public Message handle(SendMessageCommand command) {
        // Validate users exist
        UserId senderId = new UserId(command.getSenderId());
        UserId receiverId = new UserId(command.getReceiverId());

        userRepository.findByUserId(senderId)
            .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + senderId));
        userRepository.findByUserId(receiverId)
            .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + receiverId));

        // Business logic validation
        if (!messagingDomainService.canUserSendMessage(senderId, receiverId)) {
            throw new IllegalArgumentException("User cannot send message to this recipient");
        }

        // Execute domain operation
        return messagingDomainService.sendMessage(
            senderId,
            receiverId,
            command.getContent(),
            command.getMessageType(),
            command.getOrderId()
        );
    }
}