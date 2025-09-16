// User Service - Restaurant Integration Tests
// Call restaurant service through user service (port 8084)

console.log('=== User-Restaurant Service Integration Tests ===');

// Test 1: Get all restaurants via user service
fetch('http://localhost:8084/api/users/restaurants')
.then(response => response.json())
.then(data => console.log('All Restaurants:', data))
.catch(error => console.error('Error fetching all restaurants:', error));

// Test 2: Get restaurants for specific user ID (pizza owner - user ID 4)
fetch('http://localhost:8084/api/users/4/restaurants')
.then(response => response.json())
.then(data => console.log('Restaurants for User ID 4:', data))
.catch(error => console.error('Error fetching restaurants for user 4:', error));

// Test 3: Get restaurants for specific user ID (burger owner - user ID 5)
fetch('http://localhost:8084/api/users/5/restaurants')
.then(response => response.json())
.then(data => console.log('Restaurants for User ID 5:', data))
.catch(error => console.error('Error fetching restaurants for user 5:', error));

// Test 4: Get restaurants by owner name (pizza owner)
fetch('http://localhost:8084/api/users/owner/pizzaowner/restaurants')
.then(response => response.json())
.then(data => console.log('Restaurants for pizzaowner:', data))
.catch(error => console.error('Error fetching restaurants for pizzaowner:', error));

// Test 5: Get restaurants by owner name (burger owner)
fetch('http://localhost:8084/api/users/owner/burgerowner/restaurants')
.then(response => response.json())
.then(data => console.log('Restaurants for burgerowner:', data))
.catch(error => console.error('Error fetching restaurants for burgerowner:', error));

console.log('Tests queued. Check console for results.');