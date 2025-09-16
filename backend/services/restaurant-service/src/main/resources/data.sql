-- Restaurant Service Initial Data
MERGE INTO restaurant (id, name, location, owner_id) KEY(id) VALUES
(1, 'Pizza Palace', '123 Pizza Street, Little Italy', 4),
(2, 'Burger Haven', '456 Burger Avenue, Downtown', 5),
(3, 'Sushi Zen', '789 Sushi Lane, Japan Town', 4),
(4, 'Taco Fiesta', '321 Taco Road, Mexican Quarter', 5),
(5, 'Pasta Paradise', '654 Pasta Place, Italian District', 4);