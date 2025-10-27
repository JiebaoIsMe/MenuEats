package com.user.domain.messaging.model;

import com.user.shared.valueobjects.MessageId;
import com.user.shared.valueobjects.UserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Domain-specific queries
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :receiverId AND m.status != 'READ' " +
           "ORDER BY m.createdAt DESC")
    List<Message> findUnreadByReceiver(@Param("receiverId") Long receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.status != 'read'")
    long countUnreadByReceiver(@Param("receiverId") Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.orderId = :orderId ORDER BY m.createdAt ASC")
    List<Message> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT DISTINCT m FROM Message m WHERE " +
           "(m.senderId = :userId OR m.receiverId = :userId) AND " +
           "m.createdAt = (SELECT MAX(m2.createdAt) FROM Message m2 WHERE " +
           "((m2.senderId = m.senderId AND m2.receiverId = m.receiverId) OR " +
           "(m2.senderId = m.receiverId AND m2.receiverId = m.senderId))) " +
           "ORDER BY m.createdAt DESC")
    List<Message> findRecentConversations(@Param("userId") Long userId);

    // Domain repository methods
    default Optional<Message> findByMessageId(MessageId messageId) {
        return findById(messageId.getValue());
    }

    default List<Message> findConversationBetween(UserId userId1, UserId userId2) {
        return findConversation(userId1.getValue(), userId2.getValue());
    }

    default List<Message> findUnreadForUser(UserId userId) {
        return findUnreadByReceiver(userId.getValue());
    }

    default long countUnreadForUser(UserId userId) {
        return countUnreadByReceiver(userId.getValue());
    }

    default List<Message> findRecentConversationsForUser(UserId userId) {
        return findRecentConversations(userId.getValue());
    }
}