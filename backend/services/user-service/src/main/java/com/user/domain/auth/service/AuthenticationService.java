package com.user.domain.auth.service;

import com.user.domain.user.model.User;
import com.user.domain.user.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    // Simple password hashing using SHA-256 with salt
    public String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes());
            byte[] hashedPassword = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hashedPassword);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public boolean verifyPassword(String password, String hashedPassword, String salt) {
        String newHash = hashPassword(password, salt);
        return newHash.equals(hashedPassword);
    }

    public Optional<User> authenticate(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();
        
        // For backward compatibility with existing users without salt
        // TODO: REMOVE MOCK PASSWORD CHECK - Replace with real password verification
        if (password.equals("password123") || password.equals(user.getPassword())) {
            return Optional.of(user);
        }
        
        return Optional.empty();
    }

    public boolean isValidRole(String role) {
        return User.CUSTOMER.equals(role) || 
               User.BUSINESS_OWNER.equals(role) || 
               User.RIDER.equals(role);
    }
}