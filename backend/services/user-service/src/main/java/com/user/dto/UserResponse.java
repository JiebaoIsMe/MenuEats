package com.user.dto;

import com.user.domain.user.model.User;
import com.user.domain.user.model.UserProfile;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean active;
    private UserProfileData userProfile;

    // Default constructor
    public UserResponse() {}

    // Constructor from User domain object
    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
        this.userProfile = null; // Will be set separately when profile data is available
    }

    // Constructor from User and UserProfile
    public UserResponse(User user, UserProfile profile) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
        this.userProfile = profile != null ? new UserProfileData(profile) : null;
    }

    // Constructor with parameters
    public UserResponse(Long id, String username, String email, String role, boolean active) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public UserProfileData getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileData userProfile) {
        this.userProfile = userProfile;
    }

    // Nested class for profile data
    public static class UserProfileData {
        private String firstName;
        private String lastName;
        private String phone;
        private String address;
        private String city;
        private String postalCode;

        public UserProfileData() {}

        public UserProfileData(UserProfile profile) {
            this.firstName = profile.getFirstName();
            this.lastName = profile.getLastName();
            this.phone = profile.getPhone();
            this.address = profile.getAddress();
            this.city = profile.getCity();
            this.postalCode = profile.getPostalCode();
        }

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }
}