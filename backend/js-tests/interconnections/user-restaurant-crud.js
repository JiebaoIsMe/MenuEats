// User Service Role-Validated Restaurant CRUD Tests - Pure Fetch Calls
// Test restaurant and menu CRUD through user service with role validation
// Service running on localhost:8084
// Uses existing users from H2 database

const BASE_URL = 'http://localhost:8084/api';

// Data tested based on  h2 db
// User ID 4: pizzaowner (BUSINESS_OWNER)
// User ID 5: burgerowner (BUSINESS_OWNER)
// User ID 1: rider1 (RIDER)
// User ID 2: customer1 (CUSTOMER)

// Step 1: Get all users to verify existing data ( PASSED )
fetch(`${BASE_URL}/users`)
  .then(response => response.json())
  .then(data => console.log('All Users:', data))
  .catch(error => console.error('Error:', error));

// Step 2: Create restaurant using existing business owner ( Menu id musn't be null )
const ownerId = 4; // pizzaowner from database
const newRestaurant = {
    name: "Mario's Pizza Palace",
    location: "123 Main Street",
    contactInfo: "+1-555-0123",
    description: "Authentic Italian pizza"
};

fetch(`${BASE_URL}/users/${ownerId}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRestaurant)
})
.then(response => response.json())
.then(data => console.log('Created Restaurant:', data))
.catch(error => console.error('Error:', error));

// Step 3: Get restaurants by owner ID ( PASSED )
fetch(`${BASE_URL}/users/${ownerId}/restaurants`)
  .then(response => response.json())
  .then(data => console.log('Owner Restaurants:', data))
  .catch(error => console.error('Error:', error));

// Step 4: Update restaurant (owner only) ( PASSED )
const BASE_URL = 'http://localhost:8084/api';
const ownerId = 4;
const restaurantId = 1; // Pizza Palace owned by user 4
const updateRestaurant = {
    name: "Mario's Updated Pizza Palace",
    location: "456 New Street",
    contactInfo: "+1-555-9999",
    description: "Updated description"
};

fetch(`${BASE_URL}/users/${ownerId}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateRestaurant)
})
.then(response => response.json())
.then(data => console.log('Updated Restaurant:', data))
.catch(error => console.error('Error:', error));

// Step 5: Create menu item (owner only) ( PASSED )
const BASE_URL = 'http://localhost:8084/api';
const ownerId = 4;
const restaurantId = 1; // Pizza Palace owned by user 4
const menuItem = {
    name: "Quattro Stagioni Pizza",
    description: "Four seasons pizza with mushrooms, ham, artichokes, and olives",
    price: 1599,
    category: "main",
    available: true
};

fetch(`${BASE_URL}/users/${ownerId}/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem)
})
.then(response => response.json())
.then(data => console.log('Created Menu Item:', data))
.catch(error => console.error('Error:', error));

// Step 6: Update menu item (owner only) ( PASSED )
const menuItemId = "B011"; // Should be the ID returned from creation
const updateMenuItem = {
    name: "Quattro Stagioni Deluxe Pizza",
    description: "Premium four seasons pizza with extra toppings",
    price: 1799,
    category: "main",
    available: true
};

fetch(`${BASE_URL}/users/${ownerId}/restaurants/${restaurantId}/menu/${menuItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateMenuItem)
})
.then(response => response.json())
.then(data => console.log('Updated Menu Item:', data))
.catch(error => console.error('Error:', error));

// Step 7: Test role validation - try with customer user (should fail) ( PASSED )
const BASE_URL = 'http://localhost:8084/api';
const customerId = 2; // customer1 from database
const newRestaurant = {
    name: "Mario's Pizza Palace",
    location: "123 Main Street",
    contactInfo: "+1-555-0123",
    description: "Authentic Italian pizza"
};

fetch(`${BASE_URL}/users/${customerId}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRestaurant)
})
.then(response => {
    if (response.status >= 400) {
        return null; // Return null for error responses
    }
    return response.json();
})
.then(data => console.log('Should fail with access denied:', data))
.catch(error => console.error('Expected error:', error));

// Step 8: Test ownership validation - try with different business owner (should fail) ( PASSED )
const OwnerId = 5; // Burger Haven owner from database (already BUSINESS_OWNER)
const restaurantId = 5; // Paste Paradise

// Try to update pizzaowner's restaurant with burgerowner (should fail)
fetch(`${BASE_URL}/users/${OwnerId}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateRestaurant)
})
.then(response => {
    if (response.status >= 400) {
        return null; // Return null for error responses
    }
    return response.json();
})
.then(data => console.log('Should fail with ownership denied:', data))
.catch(error => console.error('Expected error:', error));

// Step 9: Test rider access (User ID 1 is already RIDER in database) ( PASSED )
const riderId = 1; // rider1 from database (already RIDER)

// Test rider access to restaurants
fetch(`${BASE_URL}/users/${riderId}/delivery/restaurants`)
  .then(response => {
      if (response.status >= 400) {
          return null; // Return null for error responses
      }
      return response.json();
  })
  .then(data => console.log('Rider Restaurant Access:', data))
  .catch(error => console.error('Error:', error));

// Step 10: Delete menu item (owner only) ( PASSED )
// Using existing variables: ownerId = 4, restaurantId = 1
const ownerId = 4; // pizzaowner from database
const deleteMenuItemId = "A001"; // Caesar Salad from Pizza Palace
fetch(`${BASE_URL}/users/${ownerId}/restaurants/${restaurantId}/menu/${deleteMenuItemId}`, {
    method: 'DELETE'
})
.then(response => {
    if (response.status >= 400) {
        return null; // Return null for error responses
    }
    return response.json();
})
.then(data => console.log('Deleted Menu Item:', data))
.catch(error => console.error('Error:', error));


