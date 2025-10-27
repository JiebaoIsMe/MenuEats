-- Restaurant Service Initial Data
MERGE INTO restaurant (id, name, location, owner_id, menu_id) KEY(id) VALUES
(1, 'Pizza Palace', '123 Pizza Street, Little Italy', 4, 1),
(2, 'Burger Haven', '456 Burger Avenue, Downtown', 5, 2),
(3, 'Sushi Zen', '789 Sushi Lane, Japan Town', 4, 3),
(4, 'Taco Fiesta', '321 Taco Road, Mexican Quarter', 5, 4),
(5, 'Pasta Paradise', '654 Pasta Place, Italian District', 4, 5);

-- Menu Items Initial Data
MERGE INTO menu_items (id, name, description, price, category, available, restaurant_id) KEY(id) VALUES
-- Pizza Palace Menu (A=entree, B=main, C=dessert, D=drink)
('A001', 'Caesar Salad', 'Crisp romaine lettuce with caesar dressing', 8.99, 'entree', true, 1),
('A002', 'Garlic Bread', 'Fresh baked bread with garlic butter', 5.99, 'entree', true, 1),
('B001', 'Margherita Pizza', 'Fresh tomatoes, mozzarella, and basil on thin crust', 12.99, 'main', true, 1),
('B002', 'Pepperoni Pizza', 'Classic pepperoni with mozzarella cheese', 14.99, 'main', true, 1),
('C001', 'Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 6.99, 'dessert', true, 1),

-- Burger Haven Menu
('A003', 'French Fries', 'Crispy golden french fries', 4.99, 'entree', true, 2),
('A004', 'Onion Rings', 'Beer-battered onion rings', 5.99, 'entree', true, 2),
('B003', 'Classic Burger', 'Beef patty with lettuce, tomato, and onion', 10.99, 'main', true, 2),
('B004', 'Cheeseburger', 'Classic burger with melted cheddar cheese', 11.99, 'main', true, 2),
('D001', 'Chocolate Shake', 'Rich chocolate milkshake', 4.99, 'drink', true, 2),

-- Sushi Zen Menu
('A005', 'Miso Soup', 'Traditional soybean paste soup', 3.99, 'entree', true, 3),
('A006', 'Edamame', 'Steamed soybeans with sea salt', 4.99, 'entree', true, 3),
('B005', 'California Roll', 'Crab, avocado, and cucumber roll', 8.99, 'main', true, 3),
('B006', 'Salmon Nigiri', 'Fresh salmon over seasoned rice (2 pieces)', 6.99, 'main', true, 3),
('C002', 'Green Tea Ice Cream', 'Creamy green tea flavored ice cream', 4.99, 'dessert', true, 3),

-- Taco Fiesta Menu
('A007', 'Guacamole & Chips', 'Fresh guacamole with tortilla chips', 6.99, 'entree', true, 4),
('A008', 'Mexican Rice', 'Seasoned rice with tomatoes and spices', 3.99, 'entree', true, 4),
('B007', 'Beef Tacos', 'Seasoned ground beef with lettuce and cheese (3 pieces)', 9.99, 'main', true, 4),
('B008', 'Chicken Quesadilla', 'Grilled chicken with melted cheese in flour tortilla', 11.99, 'main', true, 4),
('C003', 'Churros', 'Fried dough pastry with cinnamon sugar', 5.99, 'dessert', true, 4),

-- Pasta Paradise Menu
('A009', 'Bruschetta', 'Toasted bread with tomatoes, basil, and garlic', 7.99, 'entree', true, 5),
('A010', 'Minestrone Soup', 'Italian vegetable soup with pasta', 5.99, 'entree', true, 5),
('B009', 'Spaghetti Carbonara', 'Spaghetti with eggs, cheese, and pancetta', 13.99, 'main', true, 5),
('B010', 'Fettuccine Alfredo', 'Fettuccine pasta in creamy parmesan sauce', 12.99, 'main', true, 5),
('C004', 'Gelato', 'Italian ice cream - vanilla, chocolate, or strawberry', 4.99, 'dessert', true, 5);

-- Reset the auto-increment sequence for restaurant table to start from next available ID
ALTER TABLE restaurant ALTER COLUMN id RESTART WITH 6;