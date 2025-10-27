package com.user.infrastructure.web;

import com.user.application.commands.SendMessageCommand;
import com.user.application.handlers.MessageCommandHandler;
import com.user.domain.messaging.model.Message;
import com.user.domain.messaging.service.MessagingDomainService;
import com.user.dto.MessageResponse;
import com.user.shared.valueobjects.UserId;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class MessageController {

    @Autowired
    private MessageCommandHandler messageCommandHandler;

    @Autowired
    private MessagingDomainService messagingDomainService;

    @PostMapping("/{senderId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long senderId, @RequestBody Map<String, Object> request) {
        try {
            SendMessageCommand command = new SendMessageCommand(
                senderId,
                Long.valueOf(request.get("receiverId").toString()),
                request.get("content").toString(),
                request.getOrDefault("messageType", "TEXT").toString(),
                request.get("orderId") != null ? Long.valueOf(request.get("orderId").toString()) : null
            );

            Message message = messageCommandHandler.handle(command);
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{userId}/conversations/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, @PathVariable Long otherUserId) {
        try {
            List<Message> messages = messagingDomainService.getConversation(
                new UserId(userId), 
                new UserId(otherUserId)
            );
            List<MessageResponse> messageResponses = messages.stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(messageResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{userId}/messages/unread")
    public ResponseEntity<?> getUnreadMessages(@PathVariable Long userId) {
        try {
            List<Message> messages = messagingDomainService.getUnreadMessages(new UserId(userId));
            List<MessageResponse> messageResponses = messages.stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(messageResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{userId}/messages/inbox")
    public ResponseEntity<?> getUserInbox(@PathVariable Long userId) {
        try {
            List<Message> messages = messagingDomainService.getRecentConversations(new UserId(userId));
            List<MessageResponse> messageResponses = messages.stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(messageResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{userId}/messages/unread/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            long count = messagingDomainService.getUnreadMessageCount(new UserId(userId));
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{userId}/conversations")
    public ResponseEntity<?> getRecentConversations(@PathVariable Long userId) {
        try {
            List<Message> messages = messagingDomainService.getRecentConversations(new UserId(userId));
            List<MessageResponse> messageResponses = messages.stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(messageResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{userId}/messages/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long userId, @PathVariable Long messageId) {
        try {
            messagingDomainService.markMessageAsRead(new com.user.shared.valueobjects.MessageId(messageId), new UserId(userId));
            // Return the updated message
            return ResponseEntity.ok(Map.of("id", messageId, "status", "READ", "read", true, "readAt", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/messages/order/{orderId}")
    public ResponseEntity<?> getOrderMessages(@PathVariable Long orderId) {
        try {
            List<Message> messages = messagingDomainService.getOrderMessages(orderId);
            List<MessageResponse> messageResponses = messages.stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(messageResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}