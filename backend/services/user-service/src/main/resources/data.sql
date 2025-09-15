-- User Service Initial Data
MERGE INTO users (id, username, email, password, role, active, created_at) KEY(id) VALUES
(1, 'admin', 'admin@menueats.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, CURRENT_TIMESTAMP),
(2, 'customer1', 'customer1@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CUSTOMER', true, CURRENT_TIMESTAMP),
(3, 'customer2', 'customer2@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CUSTOMER', true, CURRENT_TIMESTAMP),
(4, 'pizzaowner', 'owner@pizzapalace.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RESTAURANT_OWNER', true, CURRENT_TIMESTAMP),
(5, 'burgerowner', 'owner@burgerhaven.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RESTAURANT_OWNER', true, CURRENT_TIMESTAMP);

-- User Profiles
MERGE INTO user_profiles (id, user_id, first_name, last_name, phone, address, city, postal_code) KEY(id) VALUES
(1, 1, 'System', 'Administrator', '+1-555-0000', '123 System St', 'Admin City', '00000'),
(2, 2, 'John', 'Doe', '+1-555-0001', '456 Customer Ave', 'Customer City', '12345'),
(3, 3, 'Jane', 'Smith', '+1-555-0002', '789 User Blvd', 'User Town', '67890'),
(4, 4, 'Mario', 'Rossi', '+1-555-0003', '123 Pizza St', 'Little Italy', '11111'),
(5, 5, 'Bob', 'Johnson', '+1-555-0004', '456 Burger Ave', 'Burger Town', '22222');