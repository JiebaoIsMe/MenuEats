package com.user.infrastructure.web;

import com.user.domain.auth.service.AuthenticationService;
import com.user.domain.user.model.User;
import com.user.domain.user.model.UserRepository;
import com.user.dto.AuthResponse;
import com.user.dto.CreateUserRequest;
import com.user.dto.LoginRequest;
import com.user.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private UserRepository userRepository;

    private static final String USER_SESSION_KEY_PREFIX = "authenticated_user_port_";
    
    // Get port-specific session key to prevent session sharing across frontend instances
    private String getSessionKey(HttpServletRequest request) {
        String frontendPort = request.getHeader("X-Frontend-Port");
        if (frontendPort == null || frontendPort.isEmpty()) {
            frontendPort = "default";
        }
        return USER_SESSION_KEY_PREFIX + frontendPort;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpSession session, HttpServletRequest httpRequest) {
        try {
            System.out.println("[AUTH] Login attempt for username: " + request.getUsername());
            
            Optional<User> userOpt = authService.authenticate(request.getUsername(), request.getPassword());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                if (!user.isActive()) {
                    System.out.println("[AUTH] Login failed - user is deactivated: " + request.getUsername());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new AuthResponse(false, "Account is deactivated"));
                }
                
                // Store user in port-specific session key to prevent session sharing
                String sessionKey = getSessionKey(httpRequest);
                session.setAttribute(sessionKey, user.getId());
                System.out.println("[AUTH] Using session key: " + sessionKey + " for port: " + httpRequest.getHeader("X-Frontend-Port"));
                
                System.out.println("[AUTH] Login successful for user: " + user.getUsername() + " (ID: " + user.getId() + ", Role: " + user.getRole() + ")");
                
                return ResponseEntity.ok(new AuthResponse(
                    true, 
                    "Login successful", 
                    new UserResponse(user)
                ));
            } else {
                System.out.println("[AUTH] Login failed - invalid credentials for: " + request.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Invalid username or password"));
            }
        } catch (Exception e) {
            System.err.println("[AUTH] Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Login failed"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody CreateUserRequest request, HttpSession session, HttpServletRequest httpRequest) {
        try {
            System.out.println("[AUTH] Registration attempt for username: " + request.getUsername());
            
            // Validate input
            if (request.getUsername() == null || request.getPassword() == null || request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(false, "Username, password, and email are required"));
            }
            
            // Check if role is valid
            if (!authService.isValidRole(request.getRole())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(false, "Invalid role. Must be CUSTOMER, BUSINESS_OWNER, or RIDER"));
            }
            
            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                System.out.println("[AUTH] Registration failed - username already exists: " + request.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new AuthResponse(false, "Username already exists"));
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                System.out.println("[AUTH] Registration failed - email already exists: " + request.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new AuthResponse(false, "Email already exists"));
            }
            
            // Create new user
            User user = User.create(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(), // TODO: Hash password in production
                request.getRole()
            );
            
            User savedUser = userRepository.save(user);
            savedUser.registerUserCreatedEvent();
            
            // Auto-login after registration with port-specific session key
            String sessionKey = getSessionKey(httpRequest);
            session.setAttribute(sessionKey, savedUser.getId());
            
            System.out.println("[AUTH] Registration successful for user: " + savedUser.getUsername() + " (ID: " + savedUser.getId() + ", Role: " + savedUser.getRole() + ")");
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(
                        true, 
                        "Registration successful", 
                        new UserResponse(savedUser)
                    ));
        } catch (Exception e) {
            System.err.println("[AUTH] Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Registration failed"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session, HttpServletRequest httpRequest) {
        try {
            String sessionKey = getSessionKey(httpRequest);
            Long userId = (Long) session.getAttribute(sessionKey);
            System.out.println("[AUTH] Logout for user ID: " + userId);
            
            session.invalidate();
            
            return ResponseEntity.ok(new AuthResponse(true, "Logout successful"));
        } catch (Exception e) {
            System.err.println("[AUTH] Logout error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Logout failed"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpSession session, HttpServletRequest httpRequest) {
        try {
            String sessionKey = getSessionKey(httpRequest);
            Long userId = (Long) session.getAttribute(sessionKey);
            
            if (userId == null) {
                System.out.println("[AUTH] No authenticated user in session");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Not authenticated"));
            }
            
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("[AUTH] Current user: " + user.getUsername() + " (ID: " + user.getId() + ", Role: " + user.getRole() + ")");
                
                return ResponseEntity.ok(new AuthResponse(
                    true, 
                    "User authenticated", 
                    new UserResponse(user)
                ));
            } else {
                System.out.println("[AUTH] User ID " + userId + " not found in database");
                session.invalidate();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "User not found"));
            }
        } catch (Exception e) {
            System.err.println("[AUTH] Get current user error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Authentication check failed"));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<AuthResponse> getAuthStatus(HttpSession session, HttpServletRequest httpRequest) {
        String sessionKey = getSessionKey(httpRequest);
        Long userId = (Long) session.getAttribute(sessionKey);
        boolean authenticated = userId != null;
        
        System.out.println("[AUTH] Auth status check - authenticated: " + authenticated + " (userID: " + userId + ")");
        
        return ResponseEntity.ok(new AuthResponse(
            true, 
            authenticated ? "Authenticated" : "Not authenticated"
        ));
    }
}