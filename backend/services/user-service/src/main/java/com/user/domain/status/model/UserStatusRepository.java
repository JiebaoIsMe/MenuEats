package com.user.domain.status.model;

import com.user.shared.valueobjects.UserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, Long> {

    // Domain-specific queries
    @Query("SELECT us FROM UserStatus us WHERE us.status IN ('ONLINE', 'TYPING')")
    List<UserStatus> findOnlineUsers();

    @Query("SELECT us FROM UserStatus us WHERE us.status = 'TYPING' AND us.chattingWith = :targetUserId")
    List<UserStatus> findUsersTypingTo(@Param("targetUserId") Long targetUserId);

    @Query("SELECT us FROM UserStatus us WHERE us.lastActive > :since ORDER BY us.lastActive DESC")
    List<UserStatus> findRecentlyActive(@Param("since") LocalDateTime since);

    @Query("SELECT us FROM UserStatus us WHERE us.status = :status")
    List<UserStatus> findByStatus(@Param("status") String status);

    // Domain repository methods
    default Optional<UserStatus> findByUserId(UserId userId) {
        return findById(userId.getValue());
    }

    default List<UserStatus> findUsersTypingToUser(UserId userId) {
        return findUsersTypingTo(userId.getValue());
    }

    default List<UserStatus> findRecentlyActiveUsers() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return findRecentlyActive(oneHourAgo);
    }
}