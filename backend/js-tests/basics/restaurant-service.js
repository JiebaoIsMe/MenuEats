// Restaurant Service API Testing Script - Pure Fetch Calls
// Copy and paste into browser console
// Service running on localhost:8081

const BASE_URL = 'http://localhost:8081/api';

// Get all restaurants
fetch(`${BASE_URL}/restaurants`)
  .then(response => response.json())
  .then(data => console.log('All Restaurants:', data))
  .catch(error => console.error('Error:', error));

// Get restaurant by ID (change ID as needed)
fetch(`${BASE_URL}/restaurants/1`)
  .then(response => response.json())
  .then(data => console.log('Restaurant 1:', data))
  .catch(error => console.error('Error:', error));

// Create restaurant
const newRestaurant = {
    name: "Mario's Pizza Palace",
    location: "123 Main Street",
    contactInfo: "+1-555-0123",
    description: "Authentic Italian pizza and pasta"
};

fetch(`${BASE_URL}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRestaurant)
})
.then(response => response.json())
.then(data => console.log('Created Restaurant:', data))
.catch(error => console.error('Error:', error));

// Update restaurant (change ID as needed)
const updateRestaurant = {
    name: "Updated Pizza Palace",
    location: "456 New Street",
    contactInfo: "+1-555-9999",
    description: "Updated description"
};

fetch(`${BASE_URL}/restaurants/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateRestaurant)
})
.then(response => response.json())
.then(data => console.log('Updated Restaurant:', data))
.catch(error => console.error('Error:', error));

// Get menu by restaurant ID (change ID as needed)
fetch(`${BASE_URL}/restaurant/1/menu`)
  .then(response => response.json())
  .then(data => console.log('Menu for Restaurant 1:', data))
  .catch(error => console.error('Error:', error));

// Create menu item
const newMenuItem = {
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, and basil",
    price: 1299,
    category: "main",
    restaurant_id: 1,
    available: true
};

fetch(`${BASE_URL}/restaurant/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMenuItem)
})
.then(response => response.json())
.then(data => console.log('Created Menu Item:', data))
.catch(error => console.error('Error:', error));

// Update menu item (change ID as needed)
const updateMenuItem = {
    name: "Updated Margherita Pizza",
    description: "Updated: Fresh tomatoes, mozzarella, basil, and oregano",
    price: 1499,
    category: "main",
    restaurant_id: 1,
    available: true
};

fetch(`${BASE_URL}/restaurant/menu/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateMenuItem)
})
.then(response => response.json())
.then(data => console.log('Updated Menu Item:', data))
.catch(error => console.error('Error:', error));

// Delete menu item (change ID as needed)
fetch(`${BASE_URL}/restaurant/menu/1`, {
    method: 'DELETE'
})
.then(() => console.log('Menu item deleted'))
.catch(error => console.error('Error:', error));

// Delete restaurant (change ID as needed)
fetch(`${BASE_URL}/restaurants/1`, {
    method: 'DELETE'
})
.then(() => console.log('Restaurant deleted'))
.catch(error => console.error('Error:', error));    