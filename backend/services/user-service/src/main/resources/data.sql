-- User Service Initial Data with separated Users and UserProfiles tables

-- Insert core user data (users table) with first names as usernames
-- All users use password: password123
INSERT INTO users (username, email, password, role, active) VALUES
('mike', 'mike@mail.com', 'password123', 'RIDER', true),
('john', 'john@mail.com', 'password123', 'CUSTOMER', true),
('jane', 'jane@mail.com', 'password123', 'CUSTOMER', true),
('mario', 'mario@mail.com', 'password123', 'BUSINESS_OWNER', true),
('bob', 'bob@mail.com', 'password123', 'BUSINESS_OWNER', true),
('sarah', 'sarah@mail.com', 'password123', 'RIDER', true);

-- Insert profile data (user_profiles table)
INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city) VALUES
(1, 'Mike', 'Rider', '+1-555-0001', '123 Delivery St', 'Downtown'),
(2, 'John', 'Customer', '+1-555-0002', '456 Customer Ave', 'Midtown'),
(3, 'Jane', 'Smith', '+1-555-0003', '789 User Blvd', 'Uptown'),
(4, 'Mario', 'Rossi', '+1-555-0004', '123 Pizza St', 'Little Italy'),
(5, 'Bob', 'Johnson', '+1-555-0005', '456 Burger Ave', 'Food District'),
(6, 'Sarah', 'Wilson', '+1-555-0006', '789 Delivery Ave', 'Express Zone');