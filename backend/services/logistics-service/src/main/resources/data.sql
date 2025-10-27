-- Sample Riders Data (Connected to user-service users)
INSERT INTO riders (user_id, is_available) VALUES
(1, true),   -- Mike (user ID 1 is a rider)
(6, true);   -- Sarah (user ID 6 is a rider)

-- No sample delivery tracking data - database starts empty for clean testing