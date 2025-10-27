package com.user.domain.user.service;

import com.user.domain.user.model.User;
import com.user.domain.user.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserDomainService {

    @Autowired
    private UserRepository userRepository;

    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    public void validateUserCreation(String username, String email) {
        if (!isUsernameAvailable(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
        if (!isEmailAvailable(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
    }

    public void validateUserUpdate(User user, String newUsername, String newEmail) {
        if (newUsername != null && !newUsername.equals(user.getUsername())) {
            if (!isUsernameAvailable(newUsername)) {
                throw new IllegalArgumentException("Username already exists: " + newUsername);
            }
        }
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            if (!isEmailAvailable(newEmail)) {
                throw new IllegalArgumentException("Email already exists: " + newEmail);
            }
        }
    }

    public boolean canUserPerformAction(User user, String action) {
        if (!user.isActive()) {
            return false;
        }

        // Business rules for different actions based on role
        switch (action.toLowerCase()) {
            case "send_message":
                return user.canSendMessages();
            case "receive_message":
                return user.canReceiveMessages();
            case "manage_restaurant":
                return "BUSINESS_OWNER".equals(user.getRole());
            case "deliver_order":
                return "RIDER".equals(user.getRole());
            default:
                return true; // Default allow for basic actions
        }
    }
}