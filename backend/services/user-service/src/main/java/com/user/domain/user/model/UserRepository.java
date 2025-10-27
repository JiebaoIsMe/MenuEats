package com.user.domain.user.model;

import com.user.shared.valueobjects.UserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Domain-specific queries
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByActiveTrue();

    @Query("SELECT u FROM User u WHERE u.active = true AND u.role = :role")
    List<User> findActiveUsersByRole(@Param("role") String role);

    // Domain repository methods
    default Optional<User> findByUserId(UserId userId) {
        return findById(userId.getValue());
    }
}